// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner, Typography } from '@subql/components';
import { useGetDelegationQuery, useGetDelegationsQuery } from '@subql/react-hooks';
import { Button, Divider, Select } from 'antd';
import clsx from 'clsx';
import { BigNumber, BigNumberish } from 'ethers';
import { Form, Formik } from 'formik';
import * as yup from 'yup';

import { SummaryList } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { NumberInput } from '../../../components/NumberInput';
import { useSQToken, useWeb3 } from '../../../containers';
import { useIndexerMetadata, useSortedIndexerDeployments } from '../../../hooks';
import { mapEraValue, parseRawEraValue, RawEraValue } from '../../../hooks/useEraValue';
import { convertStringToNumber, formatEther, renderAsync, TOKEN } from '../../../utils';
import styles from './DoDelegate.module.css';

export const AddressName: React.FC<{
  address?: string;
}> = ({ address }) => {
  const { indexerMetadata: metadata } = useIndexerMetadata(address ?? '');
  const { account } = useWeb3();

  return (
    <div className={clsx('flex-start', styles.option)}>
      <div className="flex-col">
        <Typography>{address === account ? 'Your wallet' : metadata?.name ?? 'Indexer'} </Typography>
        <Typography>{address} </Typography>
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
};

export const DelegateForm: React.FC<FormProps> = ({
  curEra,
  onSubmit,
  indexerAddress,
  indexerCapacity = BigNumber.from(0),
  delegatedAmount,
  onCancel,
  error,
}) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const indexerDeployments = useSortedIndexerDeployments(account ?? '');
  const delegations = useGetDelegationsQuery({
    variables: { delegator: account ?? '', offset: 0 },
  });
  const { balance } = useSQToken();

  const [delegateFrom, setDelegateFrom] = React.useState(account);

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

  const isYourself = delegateFrom === account;
  let maxAmount: BigNumberish | undefined;

  if (isYourself) {
    maxAmount = balance.data;
  } else {
    const indexerDelegation = getIndexerDelegation();
    maxAmount = indexerDelegation?.after;
  }
  const sortedMaxAmount = formatEther(maxAmount?.gt(indexerCapacity) ? indexerCapacity : maxAmount) ?? '0';

  const maxAmountText = `Max available delegation: ${sortedMaxAmount} ${TOKEN} (next era).`;

  const summaryList = [
    {
      label: t('indexer.title'),
      value: <ConnectedIndexer id={indexerAddress} />,
    },
    {
      label: 'Your delegation',
      value: ` ${delegatedAmount} ${TOKEN}`,
    },
  ];
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
            <SummaryList title={t('delegate.to')} list={summaryList} />
            <Divider className={styles.divider} />

            <div className={styles.select}>
              <Typography className={styles.inputTitle}>{t('delegate.from')} </Typography>
              <Typography className={'grayText'} variant="medium">
                {t('delegate.redelegate')}
              </Typography>
              <Select
                id="delegator"
                defaultValue={account}
                optionFilterProp="children"
                onChange={(delegator) => {
                  resetForm();
                  setDelegateFrom(delegator);
                  setFieldValue('delegator', delegator);
                }}
                className={'fullWidth'}
                loading={indexerDeployments.loading}
                size="large"
                allowClear
                disabled={isSubmitting}
                // TODO
                // onSearch={onSearch}
                // filterOption={() => {}}
              >
                {renderAsync(delegations, {
                  error: (error) => <Typography>{`Failed to get delegation info: ${error.message}`}</Typography>,
                  loading: () => <Spinner />,
                  data: (data) => {
                    const sortedDelegations =
                      data.delegations?.nodes
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
                        )
                        .map((delegation) => delegation?.indexerId) ?? [];

                    const delegationList = [account, ...sortedDelegations];

                    return (
                      <>
                        {delegationList?.map((delegating) => (
                          <Select.Option value={delegating} key={delegating}>
                            <AddressName address={delegating ?? ''} />
                          </Select.Option>
                        ))}
                      </>
                    );
                  },
                })}
              </Select>
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
            <Typography className={styles.description} variant="medium">
              {t('delegate.delegateValidNextEra')}
            </Typography>

            <div className={clsx('flex', 'flex-end', styles.btns)}>
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
