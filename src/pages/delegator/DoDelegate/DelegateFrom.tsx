// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsExclamationCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import TokenTooltip from '@components/TokenTooltip/TokenTooltip';
import { useFetchMetadata } from '@hooks/useFetchMetadata';
import { useGetCapacityFromContract } from '@hooks/useGetCapacityFromContract';
import { useWeb3Name } from '@hooks/useSpaceId';
import { Spinner, Typography } from '@subql/components';
import { IndexerFieldsFragment, IndexersOrderBy } from '@subql/network-query';
import {
  formatSQT,
  useAsyncMemo,
  useGetAllIndexerByApyQuery,
  useGetDelegationQuery,
  useGetDelegationsLazyQuery,
  useGetIndexersLazyQuery,
  useGetIndexerStakesByIndexerAndEraQuery,
} from '@subql/react-hooks';
import { formatNumberWithLocale } from '@utils';
import { limitQueue } from '@utils/limitation';
import { useUpdate } from 'ahooks';
import { Alert, Button, Divider, Select, Tooltip } from 'antd';
import BigNumberJs from 'bignumber.js';
import clsx from 'clsx';
import { BigNumber, BigNumberish } from 'ethers';
import { Form, Formik } from 'formik';
import { debounce } from 'lodash-es';
import * as yup from 'yup';

import { IndexerDetails } from 'src/models';

import { APYTooltipContent, SummaryList } from '../../../components';
import { Avatar, ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { NumberInput } from '../../../components/NumberInput';
import { useSQToken, useWeb3 } from '../../../containers';
import { useIndexerMetadata } from '../../../hooks';
import { mapEraValue, parseRawEraValue, RawEraValue } from '../../../hooks/useEraValue';
import { convertStringToNumber, formatEther, notEmpty, TOKEN } from '../../../utils';
import { formatNumber } from '../../../utils/numberFormatters';
import styles from './DoDelegate.module.less';

export const AddressName: React.FC<{
  address?: string;
  curAccount: string;
  metadata?: IndexerDetails;
}> = ({ curAccount, address, metadata }) => {
  return (
    <div className={clsx('flex-start', styles.option)}>
      <Avatar address={address || ''}></Avatar>
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
  delegatedAmount: string;
  onSubmit: (data: DelegateFormData) => void | Promise<void>;
  onCancel?: () => void;
  error?: string;
  curEra?: number;
  indexerMetadataCid?: string;
  styleMode?: 'normal' | 'reDelegate';
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
  styleMode = 'normal',
}) => {
  const { t } = useTranslation();
  const { balance } = useSQToken();
  const navigate = useNavigate();
  const { account } = useWeb3();
  const fetchMetadata = useFetchMetadata();
  const update = useUpdate();
  const { indexerMetadata: indexerMetadataIpfs } = useIndexerMetadata(indexerAddress, {
    cid: indexerMetadataCid,
    immediate: true,
  });

  const [loadDelegations] = useGetDelegationsLazyQuery({
    variables: { delegator: account ?? '', offset: 0 },
  });

  const [getAllIndexersLazy, rawAllIndexersInfo] = useGetIndexersLazyQuery();
  const { fetchWeb3NameFromCache } = useWeb3Name();

  const [delegationOptions, setDelegationOptions] = React.useState<
    { label: React.ReactNode; value: string; name?: string }[]
  >([]);
  const [delegateFrom, setDelegateFrom] = React.useState<string>('Loading...');
  const [selectedOption, setSelectedOption] = React.useState<(typeof delegationOptions)[number]>();
  const [allIndexers, setAllIndexers] = React.useState<IndexerFieldsFragment[]>([]);
  const [formInitialValues, setFormInitialValues] = React.useState<DelegateFormData>({ input: 0, delegator: account });
  const [inputFormError, setInputFormError] = React.useState<string | undefined>(undefined);
  const allIndexerPagination = React.useRef({ offset: 0, first: 100, searchKeyword: '' });

  const indexerMetadata = useAsyncMemo(async () => {
    const web3Name = await fetchWeb3NameFromCache(indexerAddress);
    return {
      name: web3Name?.web3Name || indexerMetadataIpfs?.name || indexerAddress,
    };
  }, [indexerMetadataIpfs?.name, indexerAddress]);

  const indexerCapacityFromContract = useGetCapacityFromContract(
    styleMode === 'normal' ? indexerAddress : selectedOption?.value || indexerAddress,
  );

  const indexerDelegation = useGetDelegationQuery({
    variables: {
      id: `${account ?? ''}:${delegateFrom ?? ''}`,
    },
  });

  const indexerApyData = useGetAllIndexerByApyQuery({
    variables: {
      first: 1,
      filter: {
        indexerId: { equalTo: styleMode === 'normal' ? indexerAddress : selectedOption?.value || indexerAddress },
      },
    },
  });

  const indexerStake = useGetIndexerStakesByIndexerAndEraQuery({
    variables: {
      indexerId: styleMode === 'normal' ? indexerAddress : selectedOption?.value || indexerAddress,
      eraIdx: (curEra || 0) - 1,
    },
  });

  const estimatedLastEraApy = React.useMemo(() => {
    if (indexerApyData.data?.indexerApySummaries?.nodes.length) {
      return BigNumberJs(formatEther(indexerApyData.data.indexerApySummaries.nodes[0]?.delegatorApy.toString() || '0'))
        .multipliedBy(100)
        .toFixed(2);
    }

    return '0';
  }, [indexerApyData.data?.indexerApySummaries?.nodes]);

  const getIndexerDelegation = React.useCallback(() => {
    if (!curEra || !indexerDelegation?.data?.delegation?.amount) return undefined;

    const rawDelegate = parseRawEraValue(indexerDelegation?.data?.delegation?.amount, curEra);
    return rawDelegate;
  }, [curEra, indexerDelegation?.data?.delegation?.amount]);

  const isYourself = React.useMemo(() => delegateFrom === account, [account, delegateFrom]);

  const capacityMemo = React.useMemo(() => {
    const val = indexerCapacityFromContract.data.after.toString();

    if (BigNumberJs(val).lt(0)) return '0';
    return val;
  }, [indexerCapacity, allIndexers, selectedOption, indexerCapacityFromContract]);

  const sortedMaxAmount = React.useMemo(() => {
    let maxAmount: BigNumberish | undefined;

    if (isYourself) {
      maxAmount = balance.result.data;
    } else {
      const indexerDelegation = getIndexerDelegation();
      maxAmount = indexerDelegation?.after;
    }

    if (styleMode === 'reDelegate') {
      return BigNumberJs(formatSQT(capacityMemo)).gt(delegatedAmount || '0')
        ? delegatedAmount
        : formatSQT(capacityMemo) ?? '0';
    }

    return formatEther(maxAmount?.gt(capacityMemo) ? capacityMemo : maxAmount) ?? '0';
  }, [isYourself, balance, getIndexerDelegation, delegatedAmount, styleMode, capacityMemo]);

  const maxAmountText = React.useMemo(() => {
    if (isYourself && styleMode !== 'reDelegate') {
      return (
        <>
          {t('delegate.walletBalance', {
            balance: formatEther(balance.result.data, 4),
            token: TOKEN,
          })}{' '}
          <TokenTooltip></TokenTooltip>
        </>
      );
    }
    return t('delegate.amountAvailable', {
      balance: sortedMaxAmount,
      token: TOKEN,
    });
  }, [isYourself, sortedMaxAmount, TOKEN, balance, styleMode]);

  const alertInfoText = React.useMemo(() => {
    if (isYourself)
      return t('delegate.delegateFromYourselfInfo', {
        indexerName: indexerMetadata.data?.name.slice(0, 15),
      });
    if (styleMode === 'normal') {
      return t('delegate.redelegateInfo', {
        reIndexerName: selectedOption?.name?.slice(0, 15),
        indexerName: indexerMetadata.data?.name?.slice(0, 15),
      });
    }
    return t('delegate.redelegateInfo', {
      reIndexerName: indexerMetadata.data?.name?.slice(0, 15),
      indexerName: selectedOption?.name?.slice(0, 15),
    });
  }, [isYourself, styleMode, indexerMetadata.data?.name, selectedOption?.name]);

  const zeroCapacity = React.useMemo(() => {
    return BigNumberJs(capacityMemo.toString()).isZero();
  }, [capacityMemo]);

  const delegatedAmountMemo = React.useMemo(() => {
    return styleMode === 'normal' ? delegatedAmount : formatSQT(getIndexerDelegation()?.after?.toString() || '0');
  }, [delegatedAmount, getIndexerDelegation]);

  const summaryList = React.useMemo(() => {
    return [
      {
        label: t('delegate.to'),
        key: 'indexerInfo',
        value: (
          <ConnectedIndexer
            id={indexerAddress}
            onClick={() => {
              navigate(`/indexer/${indexerAddress}`);
            }}
          />
        ),
        strong: true,
      },
      {
        label: t('delegate.remainingCapacity'),
        value: indexerCapacityFromContract.loading ? (
          <Spinner></Spinner>
        ) : (
          ` ${formatNumberWithLocale(formatEther(capacityMemo, 4))} ${TOKEN}`
        ),
        tooltip: t('delegate.remainingTooltip'),
      },
      {
        label: t('delegate.existingDelegation'),
        value: ` ${formatNumberWithLocale(delegatedAmountMemo)} ${TOKEN}`,
        tooltip: t('delegate.existingDelegationTooltip'),
      },
      {
        label: 'Estimated APY',
        value: `${estimatedLastEraApy}%`,
        tooltip: APYTooltipContent({
          currentEra: undefined,
          calculationDescription: 'This is estimated from APY for delegators on this Node Operator from the last Era',
        }),
      },
    ].filter((i) => {
      if (styleMode === 'normal') return true;
      if (styleMode === 'reDelegate' && i.key === 'indexerInfo') return false;
      return true;
    });
  }, [capacityMemo, delegatedAmountMemo, indexerCapacityFromContract, indexerAddress]);

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
        return limitQueue.add(async () => {
          const metadata = await fetchMetadata(cid);
          const web3Name = await fetchWeb3NameFromCache(i.indexerId);

          return {
            ...metadata,
            name: web3Name?.web3Name || metadata.name || i.indexerId,
          };
        });
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
      setDelegateFrom(account);
    }
  };

  const fetchAllIndexers = async (mode?: 'merge' | 'reset' | 'first') => {
    if (rawAllIndexersInfo.loading) return;
    if (styleMode === 'reDelegate') {
      const res = await getAllIndexersLazy({
        variables: {
          ...allIndexerPagination.current,
          order: IndexersOrderBy.TOTAL_STAKE_DESC,
          filter: {
            active: { equalTo: true },
            id: {
              notInInsensitive: [account || '', indexerAddress],
              includesInsensitive: allIndexerPagination.current.searchKeyword.startsWith('0x')
                ? allIndexerPagination.current.searchKeyword
                : undefined,
            },
          },
        },
      });
      const resFilterEmpty =
        mode === 'merge'
          ? [...allIndexers, ...(res.data?.indexers?.nodes.filter(notEmpty) || [])]
          : res.data?.indexers?.nodes.filter(notEmpty) || [];

      const indexerMetadatas = resFilterEmpty.map((indexer) => {
        return limitQueue.add(async () => {
          const metadata = await fetchMetadata(indexer.metadata);
          const web3Name = await fetchWeb3NameFromCache(indexer.id);

          return {
            ...metadata,
            name: web3Name?.web3Name || metadata.name || indexer.id,
          };
        });
      });

      const allMetadata = await Promise.allSettled(indexerMetadatas);
      const sortedRes = resFilterEmpty
        .map((indexer, index) => {
          const metadataInfo = allMetadata[index];
          return {
            ...indexer,
            metadataInfo:
              metadataInfo.status === 'fulfilled' ? metadataInfo.value : { name: indexer.id, url: '', image: '' },
          };
        })
        .filter((i) => {
          if (
            allIndexerPagination.current.searchKeyword &&
            !allIndexerPagination.current.searchKeyword.startsWith('0x')
          ) {
            return i.metadataInfo?.name
              ?.toLowerCase()
              ?.includes(allIndexerPagination.current.searchKeyword.toLowerCase());
          }

          return true;
        });
      setAllIndexers(sortedRes);
      const options = sortedRes.map((item) => {
        return {
          label: (
            <AddressName
              curAccount={account || ''}
              address={item.id}
              metadata={item.metadataInfo || { name: item.id, url: '', image: '' }}
            />
          ),
          value: item.id,
          name: item?.metadataInfo?.name || item.id,
        };
      });
      setDelegationOptions(options);

      if (mode === 'first') {
        setSelectedOption(options[0]);
        setDelegateFrom(options[0].value || account || '');
        setFormInitialValues({
          input: 0,
          delegator: options[0].value || '',
        });
      }
    }
  };

  const estimatedSQTAfterChange = (tokenAmounts: string | number) => {
    if (!tokenAmounts) return 0;
    if (!indexerApyData?.data?.indexerApySummaries?.nodes?.[0]) return 0;
    const lastEraDelegatorRewards = indexerApyData?.data?.indexerApySummaries?.nodes?.[0].delegatorReward;
    const lastEraDelegatorStakes = indexerStake?.data?.indexerStakes?.nodes?.[0]?.delegatorStake;
    if (!lastEraDelegatorRewards || !lastEraDelegatorStakes) return 0;

    const oneTokenGain = BigNumberJs(lastEraDelegatorRewards.toString() || '0').div(
      lastEraDelegatorStakes.toString() || '0',
    );

    return formatNumber(oneTokenGain.multipliedBy(BigNumberJs(delegatedAmountMemo).plus(tokenAmounts)).toString());
  };

  const debounceSearch = React.useCallback(
    debounce(() => {
      fetchAllIndexers('reset');
    }, 500),
    [],
  );

  React.useEffect(() => {
    if (styleMode !== 'reDelegate') {
      initDelegations();
    }
  }, [account, styleMode]);

  React.useEffect(() => {
    if (styleMode === 'reDelegate') {
      fetchAllIndexers('first');
    }
  }, [styleMode]);

  return (
    <Formik initialValues={formInitialValues} validationSchema={delegateSchema} onSubmit={onSubmit} enableReinitialize>
      {({ submitForm, isValid, isSubmitting, setFieldValue, setErrors, values, resetForm }) => {
        return (
          <Form>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {styleMode === 'normal' && (
                <>
                  <SummaryList list={summaryList} />
                  <Divider style={{ marginTop: 0 }} />
                </>
              )}
              <div
                style={{
                  marginBottom: styleMode === 'reDelegate' ? 0 : '24px',
                }}
              >
                {styleMode === 'normal' && (
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Typography>{t('delegate.from')} </Typography>
                    <Tooltip title={t('delegate.selectTooltip')}>
                      <BsExclamationCircle style={{ marginLeft: 6, color: 'var(--sq-gray500)' }}></BsExclamationCircle>
                    </Tooltip>
                  </div>
                )}
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
                  loading={styleMode === 'reDelegate' ? rawAllIndexersInfo.loading : false}
                  size="large"
                  disabled={isSubmitting}
                  options={delegationOptions}
                  showSearch
                  searchValue={styleMode === 'reDelegate' ? allIndexerPagination.current.searchKeyword : undefined}
                  autoClearSearchValue={false}
                  filterOption={
                    styleMode === 'normal'
                      ? (input, option) => {
                          const searchLabel = `${
                            option?.name?.toString().toLowerCase() || 'your wallet'
                          } ${option?.value.toLowerCase()}`;
                          return searchLabel.includes(input.toLowerCase());
                        }
                      : false
                  }
                  onSearch={(val) => {
                    if (styleMode === 'reDelegate') {
                      allIndexerPagination.current.searchKeyword = val;
                      update();
                      debounceSearch();
                    }
                  }}
                  onPopupScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    const reachedBottom = target.scrollHeight - target.scrollTop === target.clientHeight - 200; // one item about 66px

                    if (
                      reachedBottom &&
                      !rawAllIndexersInfo.loading &&
                      rawAllIndexersInfo.data?.indexers?.pageInfo.hasNextPage
                    ) {
                      allIndexerPagination.current.offset += allIndexerPagination.current.first;
                      fetchAllIndexers('merge');
                    }
                  }}
                  style={{ height: 'auto' }}
                ></Select>

                {styleMode === 'reDelegate' && <SummaryList list={summaryList}></SummaryList>}
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
                    disabled: zeroCapacity || isSubmitting,
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
                  errorMsg={inputFormError}
                />
              </div>
              <Typography className={'errorText'}>{error}</Typography>
              <Alert
                className={styles.alertInfo}
                type="info"
                message={alertInfoText}
                showIcon
                style={{
                  marginBottom: 32,
                }}
              ></Alert>

              {styleMode === 'normal' && values.input && `${values.input}` !== '0' ? (
                <div className="flex" style={{ marginBottom: 24 }}>
                  <Typography variant="medium">
                    Estimated delegation rewards after this changes: ~ {estimatedSQTAfterChange(values.input)} {TOKEN}{' '}
                    per Era
                  </Typography>
                </div>
              ) : (
                ''
              )}

              <div className={clsx('flex', 'flex-end')}>
                <Tooltip title={zeroCapacity ? "This Node Operator's delegation capacity has been reached" : ''}>
                  <Button
                    onClick={() => {
                      if (values.input <= 0) {
                        setInputFormError('Must be greater than 0');
                      } else {
                        setInputFormError('');
                      }
                      submitForm();
                    }}
                    loading={isSubmitting}
                    disabled={zeroCapacity || !isValid || isSubmitting}
                    className={clsx(styles.button, !isValid || isSubmitting ? styles.disabledButton : '')}
                    type="primary"
                    shape="round"
                    size="large"
                  >
                    {styleMode === 'normal' ? t('delegate.title') : 'Redelegate'}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
