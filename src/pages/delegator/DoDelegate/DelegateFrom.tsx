// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsExclamationCircle } from 'react-icons/bs';
import { useFetchMetadata } from '@hooks/useFetchMetadata';
import { Typography } from '@subql/components';
import { useGetDelegationQuery, useGetDelegationsLazyQuery } from '@subql/react-hooks';
import { limitQueue } from '@utils/limitation';
import { Alert, Button, Divider, Select, Tooltip } from 'antd';
import clsx from 'clsx';
import { BigNumber, BigNumberish } from 'ethers';
import { Form, Formik } from 'formik';
import * as yup from 'yup';

import { IndexerDetails } from 'src/models';

import { SummaryList } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { NumberInput } from '../../../components/NumberInput';
import { useSQToken, useWeb3 } from '../../../containers';
import { useIndexerMetadata, useSortedIndexerDeployments } from '../../../hooks';
import { mapEraValue, parseRawEraValue, RawEraValue } from '../../../hooks/useEraValue';
import { convertStringToNumber, formatEther, notEmpty, TOKEN } from '../../../utils';
import styles from './DoDelegate.module.less';

export const AddressName: React.FC<{
  address?: string;
  curAccount: string;
  metadata?: IndexerDetails;
}> = ({ curAccount, address, metadata }) => {
  return (
    <div className={clsx('flex-start', styles.option)}>
      <div className="col-flex">
        <Typography style={{ marginBottom: 4 }}>
          {address === curAccount ? 'Your Wallet ' : metadata?.name ?? 'Indexer'}
        </Typography>
        <Typography variant="small" type="secondary">
          {address}
        </Typography>
      </div>
    </div>
  );
};

const delegateSchema = yup.object({
  input: yup.number().defined().moreThan(0),
  delegator: yup.string().optional(),
});

type DelegateFormData = yup.Asserts<typeof delegateSchema>;

type FormProps = {
  indexerAddress: string;
  indexerCapacity?: BigNumberish;
  delegatedAmount: number;
  onSubmit: (data: DelegateFormData) => void | Promise<void>;
  onCancel?: () => void;
  error?: string;
  curEra?: number;
  indexerMetadataCid?: string;
};

export const DelegateForm: React.FC<FormProps> = ({
  curEra,
  onSubmit,
  indexerAddress,
  indexerCapacity = BigNumber.from(0),
  delegatedAmount,
  onCancel,
  error,
  indexerMetadataCid,
}) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const fetchMetadata = useFetchMetadata();
  const { indexerMetadata } = useIndexerMetadata(indexerAddress, {
    cid: indexerMetadataCid,
    immediate: true,
  });
  const indexerDeployments = useSortedIndexerDeployments(account ?? '');
  const [loadDelegations] = useGetDelegationsLazyQuery({
    variables: { delegator: account ?? '', offset: 0 },
  });
  const { balance } = useSQToken();

  const [delegationOptions, setDelegationOptions] = React.useState<
    { label: React.ReactNode; value: string; name?: string }[]
  >([]);
  const [delegateFrom, setDelegateFrom] = React.useState(account);
  const [selectedOption, setSelectedOption] = React.useState<(typeof delegationOptions)[number]>();

  const indexerDelegation = useGetDelegationQuery({
    variables: {
      id: `${account ?? ''}:${delegateFrom ?? ''}`,
    },
  });

  const getIndexerDelegation = () => {
    if (!curEra || !indexerDelegation?.data?.delegation?.amount) return undefined;

    const rawDelegate = parseRawEraValue(indexerDelegation?.data?.delegation?.amount, curEra);
    return rawDelegate;
  };

  const isYourself = React.useMemo(() => delegateFrom === account, [account, delegateFrom]);

  const sortedMaxAmount = React.useMemo(() => {
    let maxAmount: BigNumberish | undefined;

    if (isYourself) {
      maxAmount = balance.data;
    } else {
      const indexerDelegation = getIndexerDelegation();
      maxAmount = indexerDelegation?.after;
    }

    return formatEther(maxAmount?.gt(indexerCapacity) ? indexerCapacity : maxAmount) ?? '0';
  }, [isYourself, balance, getIndexerDelegation]);

  const maxAmountText = React.useMemo(() => {
    if (isYourself) {
      return t('delegate.walletBalance', {
        balance: formatEther(balance.data, 4),
        token: TOKEN,
      });
    }
    return t('delegate.amountAvailable', {
      balance: sortedMaxAmount,
      token: TOKEN,
    });
  }, [isYourself, sortedMaxAmount, TOKEN, balance]);

  const summaryList = [
    {
      label: t('delegate.to'),
      value: <ConnectedIndexer id={indexerAddress} />,
      strong: true,
    },
    {
      label: t('delegate.remainingCapacity'),
      value: ` ${formatEther(indexerCapacity, 4)} ${TOKEN}`,
      tooltip: t('delegate.remainingTooltip'),
    },
    {
      label: t('delegate.existingDelegation'),
      value: ` ${delegatedAmount} ${TOKEN}`,
      tooltip: t('delegate.existingDelegationTooltip'),
    },
  ];

  const initDelegations = async () => {
    if (!account) return;
    const { data, error } = await loadDelegations();
    if (!error && data?.delegations?.nodes) {
      const sortedDelegations = data.delegations.nodes
        .map((delegation) => ({
          ...delegation,
          value: mapEraValue(parseRawEraValue(delegation?.amount as RawEraValue, curEra), (v) =>
            convertStringToNumber(formatEther(v ?? 0)),
          ),
        }))
        .filter(
          (delegation) =>
            (delegation.value.current || delegation.value.after) &&
            delegation.indexerId !== account &&
            delegation?.indexerId !== indexerAddress,
        );

      const indexerMetadata = sortedDelegations.map((i) => {
        const cid = i?.indexer?.metadata;
        return limitQueue.add(() => fetchMetadata(cid));
      });

      const allMetadata = await Promise.all(indexerMetadata);
      setDelegationOptions([
        {
          label: <AddressName curAccount={account} address={account} metadata={{ name: '', url: '', image: '' }} />,
          value: account,
          name: '',
        },
        ...sortedDelegations.map((delegation, index) => {
          return {
            label: (
              <AddressName
                curAccount={account}
                address={delegation.indexerId}
                metadata={allMetadata[index] || undefined}
              ></AddressName>
            ),
            value: delegation.indexerId || '',
            name: allMetadata[index]?.name,
          };
        }),
      ]);
    }
  };

  React.useEffect(() => {
    initDelegations();
  }, [account]);
  return (
    <Formik
      initialValues={{
        input: 0,
        delegator: '',
      }}
      validationSchema={delegateSchema}
      onSubmit={onSubmit}
    >
      {({ submitForm, isValid, isSubmitting, setFieldValue, setErrors, values, resetForm }) => (
        <Form>
          <div>
            <SummaryList list={summaryList} />
            <Divider className={styles.divider} />

            <div className={styles.select}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <Typography>{t('delegate.from')} </Typography>
                <Tooltip title={t('delegate.selectTooltip')}>
                  <BsExclamationCircle style={{ marginLeft: 6, color: 'var(--sq-gray500)' }}></BsExclamationCircle>
                </Tooltip>
              </div>
              <Select
                id="delegator"
                value={delegateFrom}
                optionFilterProp="children"
                onChange={(delegator, raw) => {
                  resetForm();
                  setDelegateFrom(delegator);
                  setFieldValue('delegator', delegator);
                  if (!Array.isArray(raw)) {
                    setSelectedOption(raw);
                  }
                }}
                className={clsx('fullWidth', styles.delegatorSelect)}
                loading={indexerDeployments.loading}
                size="large"
                allowClear
                disabled={isSubmitting}
                options={delegationOptions}
                // TODO
                // onSearch={onSearch}
                // filterOption={() => {}}
              ></Select>
            </div>

            <div className={'fullWidth'}>
              <NumberInput
                title={t('delegate.delegateAmount')}
                inputParams={{
                  name: 'input',
                  id: 'input',
                  onChange: (value) => {
                    setErrors({ input: undefined });
                    setFieldValue('input', value);
                  },
                  value: values.input,
                  disabled: isSubmitting,
                  stringMode: true,
                  max: account && sortedMaxAmount ? sortedMaxAmount : undefined,
                  min: 0,
                }}
                maxAmount={account ? sortedMaxAmount : undefined}
                maxAmountText={maxAmountText}
                onClickMax={(value) => {
                  setErrors({ input: undefined });
                  setFieldValue('input', value);
                }}
              />
            </div>

            <Typography className={'errorText'}>{error}</Typography>
            <Alert
              className={styles.alertInfo}
              type="info"
              message={
                isYourself
                  ? t('delegate.delegateFromYourselfInfo', {
                      indexerName: indexerMetadata.name,
                    })
                  : t('delegate.redelegateInfo', {
                      reIndexerName: selectedOption?.name,
                      indexerName: indexerMetadata.name,
                    })
              }
              showIcon
              style={{
                marginBottom: 32,
              }}
            ></Alert>

            <div className={clsx('flex', 'flex-end')}>
              <Button
                onClick={submitForm}
                loading={isSubmitting}
                disabled={!isValid || isSubmitting}
                className={!isValid || isSubmitting ? 'disabledButton' : 'button'}
                type="primary"
                shape="round"
                size="large"
              >
                {t('delegate.title')}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
