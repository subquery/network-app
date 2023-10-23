// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { Card } from '@subql/components';
import { limitContract, makeCacheKey } from '@utils/limitation';
import { Alert, Button } from 'antd';
import assert from 'assert';
import BigNumberJs from 'bignumber.js';
import { BigNumber, ContractTransaction } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

import { useWeb3Store } from 'src/stores';

import {
  ApproveContract,
  getTokenApprovalModalText,
  ModalApproveToken,
  NumberInput,
  SummaryList,
} from '../../components';
import TransactionModal from '../../components/TransactionModal';
import { STABLE_TOKEN, STABLE_TOKEN_DECIMAL, TOKEN, tokenDecimals, truncFormatEtherStr } from '../../utils';
import styles from './SwapForm.module.css';

interface Stats {
  title: string;
  value: string;
  tooltip?: string;
}

interface SwapPair {
  from: string;
  fromMax: string;
  to: string;
  toMax: string;
}

interface ISwapForm {
  stats: Array<Stats>;
  pair: SwapPair;
  fromRate?: number;
  orderId: string | undefined;
  requireTokenApproval?: boolean;
  contract?: ApproveContract;
  onApproveAllowance?: () => void;
  increaseAllowanceAmount?: BigNumber;
  usdcLimitation?: BigNumber;
  onIncreaseAllowance?: (address: string, allowance: BigNumber) => Promise<ContractTransaction>;
  onUpdateSwapData?: () => void;
  lifetimeLimitationInfo?: {
    isOut: boolean;
    limitation: number;
  };
  leftOrdersAmountInfo?: {
    isOut: boolean;
    leftOrderAmount: BigNumber;
  };
  kycStatus: boolean;
}

interface PairFrom {
  from: string;
  to: string;
}

const FROM_INPUT_ID = 'from';
const TO_INPUT_ID = 'to';

// TODO: confirm error msg with design/business
// TODO: confirm alert component and move as component
export const SwapForm: React.FC<ISwapForm> = ({
  stats,
  pair,
  fromRate = 1,
  orderId,
  requireTokenApproval,
  contract,
  onApproveAllowance,
  increaseAllowanceAmount,
  onIncreaseAllowance,
  onUpdateSwapData,
  usdcLimitation,
  kycStatus,
  lifetimeLimitationInfo,
  leftOrdersAmountInfo,
}) => {
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();
  const [tokenGet, setTokenGet] = React.useState('');
  const calWithRate = (value: string | number, reverseCal = false): string => {
    if (fromRate === 0) return '0';
    const strValue = value.toString();
    const calValue = BigNumberJs(reverseCal ? parseFloat(strValue) / fromRate : parseFloat(strValue) * fromRate);

    return truncFormatEtherStr(calValue.toFixed(), STABLE_TOKEN_DECIMAL);
  };

  const initialPairValues: PairFrom = {
    from: '',
    to: '',
  };

  const updateFieldVal = (
    fileKey: typeof FROM_INPUT_ID | typeof TO_INPUT_ID,
    value: string | number | null,
    setValues: (props: any) => void,
    setErrors: (props: any) => void,
  ) => {
    if (!value) return null;
    const isReversedCal = fileKey === TO_INPUT_ID;
    const autoUpdateField = isReversedCal ? FROM_INPUT_ID : TO_INPUT_ID;
    setErrors({ [fileKey]: undefined });
    const autoUpdateFieldVal = calWithRate(value, isReversedCal);
    setValues({ [fileKey]: value, [autoUpdateField]: autoUpdateFieldVal });
  };

  const SwapFormSchema = Yup.object().shape({
    from: Yup.string()
      .required()
      .test(
        'isOutLifetimeLimitation',
        `You have exceeded your lifetime swap limit of ${lifetimeLimitationInfo?.limitation.toLocaleString()} ${
          pair.from
        } (${((lifetimeLimitationInfo?.limitation || 0) * fromRate).toLocaleString()} kSQT)`,
        (from) => {
          if (lifetimeLimitationInfo) {
            return !lifetimeLimitationInfo.isOut;
          }

          return true;
        },
      )
      .test(
        'isOutOfLimatation',
        t('swap.usdcLimitation', {
          limitation: formatUnits(usdcLimitation || BigNumber.from(0), tokenDecimals[tokenGet]),
        }),
        (from) => {
          if (from && usdcLimitation) {
            if (parseUnits(from, tokenDecimals[tokenGet]).gt(usdcLimitation)) {
              return false;
            }
          }
          return true;
        },
      )
      .test('isMin', 'From should be greater than 0.', (from) => (from ? parseFloat(from) > 0 : false))
      .test('isMax', `There is not enough ${pair.from} to swap.`, (from) =>
        from ? parseFloat(from) <= parseFloat(pair.fromMax) : false,
      )
      .typeError('Please input valid from amount.'),
    to: Yup.string()
      .required()
      .test(
        'hasLeft',
        `Out of this order's total amount, left amount is ${formatUnits(
          leftOrdersAmountInfo?.leftOrderAmount || '0',
          STABLE_TOKEN_DECIMAL,
        )}`,
        (to) => {
          if (leftOrdersAmountInfo) {
            if (!leftOrdersAmountInfo.isOut) {
              return leftOrdersAmountInfo.leftOrderAmount.gte(
                BigNumber.from(parseUnits(BigNumberJs(to || '0').toFixed(6), STABLE_TOKEN_DECIMAL)),
              );
            }

            if (leftOrdersAmountInfo.isOut) return false;
          }

          return true;
        },
      )
      .test('isMin', 'To should be greater than 0.', (to) => (to ? parseFloat(to) > 0 : false))
      .test('isValid', `There is not enough ${pair.to} to swap.`, (to) => {
        if (pair.to === STABLE_TOKEN) {
          return true;
        }

        return to ? parseFloat(to) <= parseFloat(pair.toMax) : false;
      })
      .typeError('Please input valid from amount.'),
  });

  const modalText = requireTokenApproval
    ? getTokenApprovalModalText(pair.from)
    : {
        title: t('swap.confirmSwap'),
        steps: [t('swap.reviewSwap'), t('indexer.confirmOnMetamask')],
        submitText: t('general.confirm'),
        failureText: t('swap.swapFailure'),
        successText: t('swap.swapSuccess'),
      };

  const getTokenGet = async () => {
    if (!contracts || !orderId) return;

    const { tokenGet } = await limitContract(
      () => contracts.permissionedExchange.orders(orderId),
      makeCacheKey(orderId, { type: 'swapOrders' }),
    );

    setTokenGet(tokenGet);
  };

  const onTradeOrder = async (amount: string) => {
    assert(contracts, 'Contracts not available');
    assert(orderId, 'There is no orderId available.');

    return contracts.permissionedExchange.trade(orderId, parseUnits(amount, tokenDecimals[tokenGet]));
  };

  React.useEffect(() => {
    getTokenGet();
  }, [contracts, orderId]);

  return (
    <div className={styles.container}>
      {!orderId && (
        <div className={styles.errorAlert}>
          <Alert message={t('swap.noOrderInPool')} type="error" closable showIcon className={styles.alert} />
        </div>
      )}

      <div className={styles.statsContainer}>
        {stats.map((statsItem) => (
          <Card
            key={statsItem.title}
            description={statsItem.value}
            title={statsItem.title}
            titleTooltipIcon={<InfoCircleOutlined />}
            titleTooltip={statsItem.tooltip}
            className={styles.stat}
          />
        ))}
      </div>

      <div>
        <Formik
          initialValues={initialPairValues}
          validationSchema={SwapFormSchema}
          onSubmit={(values, actions) => {
            actions.setSubmitting(false);
          }}
          enableReinitialize
        >
          {({ isValid, isSubmitting, setErrors, values, errors, setValues, resetForm }) => {
            const isActionDisabled =
              !kycStatus || !isValid || !orderId || !values[FROM_INPUT_ID] || !values[TO_INPUT_ID];
            const summaryList = [
              {
                label: t('swap.from'),
                value: `${values[FROM_INPUT_ID]} ${pair.from}`,
              },
              {
                label: t('swap.to'),
                value: `${values[TO_INPUT_ID]} ${pair.to}`,
              },
            ];

            return (
              <Form>
                <NumberInput
                  id={FROM_INPUT_ID}
                  name={FROM_INPUT_ID}
                  title={t('swap.from')}
                  unit={pair.from}
                  stringMode
                  maxAmount={pair.fromMax}
                  value={values.from}
                  description={`The maximum swap amount: ${!kycStatus ? 0 : truncFormatEtherStr(pair.fromMax)} ${
                    pair.from
                  }`}
                  onChange={(value) => updateFieldVal(FROM_INPUT_ID, value, setValues, setErrors)}
                  errorMsg={errors[FROM_INPUT_ID]}
                  onClickMax={(value) => updateFieldVal(FROM_INPUT_ID, value.toString(), setValues, setErrors)}
                  placeholder={'1'}
                />
                <NumberInput
                  id={TO_INPUT_ID}
                  name={TO_INPUT_ID}
                  title={t('swap.to')}
                  unit={pair.to}
                  stringMode
                  maxAmount={pair.to === TOKEN ? pair.toMax : undefined}
                  description={`${pair.to === TOKEN ? 'Current Pool' : 'Current balance'}: ${truncFormatEtherStr(
                    pair.toMax,
                  )} ${pair.to}`}
                  value={values.to}
                  onChange={(value) => updateFieldVal(TO_INPUT_ID, value, setValues, setErrors)}
                  errorMsg={errors[TO_INPUT_ID]}
                  onClickMax={(value) => updateFieldVal(TO_INPUT_ID, value.toString(), setValues, setErrors)}
                  placeholder={calWithRate('1') ?? '0'}
                />

                <div className={styles.swapAction}>
                  <TransactionModal
                    text={modalText}
                    actions={[
                      {
                        label: t('swap.swapButton'),
                        key: 'swap',
                        disabled: isActionDisabled,
                      },
                    ]}
                    onClick={() => onTradeOrder(values[FROM_INPUT_ID])}
                    onSuccess={() => {
                      resetForm();
                      onUpdateSwapData && onUpdateSwapData();
                    }}
                    renderContent={(onSubmit, onCancel, isLoading, error) => {
                      if (!!requireTokenApproval) {
                        return (
                          <ModalApproveToken
                            onIncreaseAllowance={onIncreaseAllowance}
                            contract={contract}
                            increaseAllowanceAmount={increaseAllowanceAmount}
                            onSubmit={() => onApproveAllowance && onApproveAllowance()}
                          />
                        );
                      }

                      return (
                        <>
                          <SummaryList title={t('swap.swapReviewTitle')} list={summaryList} />
                          <div className="flex-end">
                            <Button
                              onClick={onSubmit}
                              type="primary"
                              shape="round"
                              size="large"
                              className={styles.swapButton}
                              loading={isSubmitting || isLoading}
                            >
                              {t('swap.swapButton')}
                            </Button>
                          </div>
                        </>
                      );
                    }}
                    variant={isActionDisabled ? 'disabledButton' : 'button'}
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};
