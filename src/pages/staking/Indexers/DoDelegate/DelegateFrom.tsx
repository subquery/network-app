// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Spinner, Typography } from '@subql/react-ui';
import { Formik, Form } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useDelegations, useSQToken, useWeb3 } from '../../../../containers';
import { convertStringToNumber, formatEther, renderAsync } from '../../../../utils';
import * as yup from 'yup';
import { SummaryList } from '../../../../components';
import { useIndexerMetadata, useSortedIndexerDeployments } from '../../../../hooks';
import { Select } from 'antd';
import styles from './DoDelegate.module.css';
import clsx from 'clsx';
import { ConnectedIndexer } from '../../../../components/IndexerDetails/IndexerName';
import { NumberInput } from '../../../../components/NumberInput';

export const AddressName: React.VFC<{
  address?: string;
}> = ({ address }) => {
  const asyncMetadata = useIndexerMetadata(address ?? '');
  const { account } = useWeb3();

  return (
    <div className={clsx('flex-start', styles.option)}>
      <Typography>{`${address === account ? 'You' : asyncMetadata.data?.name} - ${address}`}</Typography>
    </div>
  );
};

const delegateSchema = yup.object({
  input: yup.number().defined(),
  delegator: yup.string().optional(),
});

type DelegateFormData = yup.Asserts<typeof delegateSchema>;

type FormProps = {
  indexerAddress: string;
  delegatedAmount: number;
  onSubmit: (data: DelegateFormData) => void | Promise<void>;
  onCancel?: () => void;
  error?: string;
};

export const DelegateForm: React.VFC<FormProps> = ({ onSubmit, indexerAddress, delegatedAmount, onCancel, error }) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const indexerDeployments = useSortedIndexerDeployments(account ?? '');
  const delegations = useDelegations({ delegator: account ?? '' });
  const { balance } = useSQToken();

  const [delegateFrom, setDelegateFrom] = React.useState(account);
  const isYourself = delegateFrom === account;
  const maxAmount = isYourself ? convertStringToNumber(formatEther(balance.data ?? 0)) : delegatedAmount;
  const maxAmountText = !isYourself ? `You are delegating to this indexer: ${delegatedAmount} SQT` : undefined;

  const summaryList = [
    {
      label: t('indexer.title'),
      value: <ConnectedIndexer id={indexerAddress} />,
    },
    {
      label: 'Your delegation',
      value: ` ${delegatedAmount} SQT`,
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
      {({ submitForm, isValid, isSubmitting, setFieldValue, setErrors, values }) => (
        <Form>
          <div>
            <SummaryList title={t('delegate.to')} list={summaryList} />

            <div className={styles.select}>
              <Typography className={styles.inputTitle}>{t('delegate.from')} </Typography>
              <Typography className={'grayText'} variant="medium">
                {t('delegate.redelegate')}
              </Typography>
              <Select
                id="delegator"
                showSearch
                defaultValue={account}
                optionFilterProp="children"
                onChange={(delegator) => {
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
                    const sortedDelegations = data.delegations?.nodes
                      .filter((delegation) => delegation?.indexerId !== indexerAddress)
                      .sort((delegation) => (delegation?.delegatorId === account ? -1 : 1));

                    console.log('isValid', isValid);

                    return (
                      <>
                        {sortedDelegations?.map((delegation) => (
                          <Select.Option value={delegation?.indexerId} key={delegation?.indexerId}>
                            <AddressName address={delegation?.indexerId} />
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
                  max: account ? maxAmount : undefined,
                  min: 0,
                }}
                maxAmount={account ? maxAmount : undefined}
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
                label={t('delegate.title')}
                onClick={submitForm}
                loading={isSubmitting}
                disabled={!isValid || isSubmitting}
                colorScheme="standard"
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
