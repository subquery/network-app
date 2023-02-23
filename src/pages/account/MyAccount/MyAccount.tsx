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
import { formatEther, mergeAsync, truncFormatEtherStr } from '@utils';
import { Link } from 'react-router-dom';
import { useSortedIndexer } from '@hooks';
import { BigNumber } from 'ethers';
import { jsonBigIntToBigInt } from '@hooks/useEraValue';
import { WithdrawalStatus } from '@subql/network-query';
import { AccountHeader } from './Header';

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

const cards: { title: string; key: keyof Stats; link: string }[] = [
  {
    title: 'You are Delegating',
    key: 'Delegating',
    link: '/',
  },
  {
    title: 'You are Staking',
    key: 'Staking',
    link: '/',
  },
  {
    title: 'Your Rewards',
    key: 'Rewards',
    link: '/',
  },
  {
    title: 'Withdrawn',
    key: 'Withdrawn',
    link: '/',
  },
];

export const MyAccount: React.FC = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
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

  return renderAsync(mergeAsync(indexerDelegators, delegators, sortedIndexer, rewards, withdrawals), {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load delegators: ${e}`}</Typography>,
    data: (data) => {
      const [iD, d, i, r, w] = data;
      const totalCount = iD?.indexer?.delegations.totalCount || 0;

      const totalDelegating =
        d &&
        formatEther(
          d.delegations?.nodes.reduce((accumulator, currentValue) => {
            const amount =
              currentValue?.indexerId !== account
                ? jsonBigIntToBigInt(currentValue?.amount.valueAfter)
                : BigNumber.from(0);
            return accumulator.add(amount);
          }, BigNumber.from(0)),
        );

      const totalRewards =
        r &&
        formatEther(
          r.rewards?.nodes.reduce(
            (accumulator, currentValue) => accumulator.add(BigNumber.from(currentValue?.amount)),
            BigNumber.from(0),
          ),
        );
      const totalWithdrawn =
        w &&
        formatEther(
          w.withdrawls?.nodes.reduce(
            (accumulator, currentValue) => accumulator.add(BigNumber.from(currentValue?.amount)),
            BigNumber.from(0),
          ),
        );
      const totalStaking = i && truncFormatEtherStr(i?.totalStake?.current?.toString());

      const cardStats: Stats = {
        Delegating: totalDelegating,
        Staking: totalStaking,
        Rewards: totalRewards,
        Withdrawn: totalWithdrawn,
      };

      //TODO: add subscription

      return (
        <div className={styles.page}>
          <div className={styles.container}>
            <AccountHeader />
            <div className={styles.statsTiles}>
              {cards.map(({ title, key, link }) => (
                <Card
                  description={cardStats[key] ?? '-'}
                  title={title}
                  titleTooltipIcon={<InfoCircleOutlined />}
                  action={action(link)}
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
