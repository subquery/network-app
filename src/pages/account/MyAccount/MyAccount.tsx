// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3 } from '@containers';
import styles from './MyAccount.module.css';
import { useTranslation } from 'react-i18next';
import { Card, Spinner, Typography } from '@subql/components';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import {
  renderAsync,
  useGetDelegationsQuery,
  useGetIndexerDelegatorsQuery,
  useGetRewardsQuery,
  useGetWithdrawlsQuery,
} from '@subql/react-hooks';
import { EmptyList } from '@components';
import { OwnDelegator } from '@pages/staking/Indexer/OwnDelegator';
import { Data, formatEther, mergeAsync, truncFormatEtherStr } from '@utils';
import { Link } from 'react-router-dom';
import { useSortedIndexer } from '@hooks';
import { BigNumber } from 'ethers';
import { jsonBigIntToBigInt } from '@hooks/useEraValue';
import { GetDelegationsQuery, WithdrawalStatus } from '@subql/network-query';
import { AccountHeader } from './Header';
import { useDelegating } from '@hooks/useDelegating';

type statNumber = string | undefined;

interface Stats {
  Delegating: statNumber;
  Staking: statNumber;
  Rewards: statNumber;
  Withdrawn: statNumber;
}

const NoDelegator: React.FC = () => {
  const { t } = useTranslation();
  return (
    <EmptyList title={t('myDelegators.noDelegatorsTitle')} description={t('myDelegators.noDelegatorsDescription')} />
  );
};

const cards: { title: string; key: keyof Stats; link: string; tooltip: string }[] = [
  {
    title: 'You are Delegating',
    key: 'Delegating',
    link: '/',
    tooltip: 'The amount of kSQT that you are delegating to Indexers in the SubQuery Network to earn rewards',
  },
  {
    title: 'You are Staking',
    key: 'Staking',
    link: '/',
    tooltip: 'The amount of kSQT that you have staked against projects you are indexing in the SubQuery Network',
  },
  {
    title: 'Your Rewards',
    key: 'Rewards',
    link: '/',
    tooltip: 'The amount of rewards earned by participating in the SubQuery Network through delegating or staking',
  },
  {
    title: 'Withdrawn',
    key: 'Withdrawn',
    link: '/',
    tooltip: 'The amount of kSQT that you have undelegated or unstaked',
  },
];

function getTotalDelegating(d: Data<GetDelegationsQuery>, account: string) {
  return formatEther(
    d?.delegations?.nodes.reduce((accumulator, currentValue) => {
      const amount =
        currentValue?.indexerId !== account ? jsonBigIntToBigInt(currentValue?.amount.valueAfter) : BigNumber.from(0);
      return accumulator.add(amount);
    }, BigNumber.from(0)),
  );
}

//TODO: add fragments so can better type this
function reduceTotal(nodes: any) {
  return formatEther(
    nodes?.nodes.reduce(
      (accumulator: any, currentValue: { amount: unknown }) => accumulator.add(BigNumber.from(currentValue?.amount)),
      BigNumber.from(0),
    ),
  );
}

export const MyAccount: React.FC = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const delegating = useDelegating(account ?? '');
  const action = (link: string) => ({
    label: 'View Details',
    onClick: () => navigate(link),
  });

  const sortedIndexer = useSortedIndexer(account || '');
  const indexerDelegators = useGetIndexerDelegatorsQuery({ variables: { id: account ?? '', offset: 0 } });
  const delegators = useGetDelegationsQuery({ variables: { delegator: account ?? '', offset: 0 } });
  const rewards = useGetRewardsQuery({ variables: { address: account ?? '' } });
  const withdrawals = useGetWithdrawlsQuery({
    variables: { delegator: account ?? '', status: WithdrawalStatus.CLAIMED, offset: 0 },
  });

  return renderAsync(mergeAsync(indexerDelegators, delegating, sortedIndexer, rewards, withdrawals), {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load delegators: ${e}`}</Typography>,
    data: (data) => {
      const [iD, d, i, r, w] = data;
      const totalCount = iD?.indexer?.delegations.totalCount || 0;

      // const totalDelegating = getTotalDelegating(d, account ?? '');
      const totalDelegating = formatEther(d);
      const totalRewards = reduceTotal(r?.rewards);
      const totalWithdrawn = reduceTotal(w?.withdrawls);
      const totalStaking = i && truncFormatEtherStr(i?.totalStake?.current?.toString());
      //TODO: add subscription

      const cardStats: Stats = {
        Delegating: totalDelegating,
        Staking: totalStaking,
        Rewards: totalRewards,
        Withdrawn: totalWithdrawn,
      };

      return (
        <div className={styles.page}>
          <div className={styles.container}>
            <AccountHeader />
            <div className={styles.statsTiles}>
              {cards.map(({ title, key, link, tooltip }) => (
                <Card
                  description={cardStats[key] ?? '-'}
                  title={title}
                  titleTooltipIcon={<InfoCircleOutlined />}
                  action={action(link)}
                  titleTooltip={tooltip}
                />
              ))}
            </div>
            <div className={styles.myDelegators}>
              <div className={styles.delegatorHeader}>
                <Typography variant="h5">{'My Delegators'}</Typography>
                <Typography variant="medium">
                  <Link to={'/'}>{'View Details'}</Link>
                </Typography>
              </div>
              {totalCount <= 0 && <NoDelegator />}
              {totalCount > 0 && <OwnDelegator indexer={account ?? ''} />}
            </div>
          </div>
        </div>
      );
    },
  });
};
