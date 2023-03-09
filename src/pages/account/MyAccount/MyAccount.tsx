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
  useGetIndexerDelegatorsQuery,
  useGetRewardsQuery,
  useGetWithdrawlsQuery,
} from '@subql/react-hooks';
import { EmptyList } from '@components';
import { OwnDelegator } from '@pages/staking/Indexer/OwnDelegator';
import { formatEther, mergeAsync, TOKEN, truncFormatEtherStr } from '@utils';
import { useSortedIndexer } from '@hooks';
import { BigNumber } from 'ethers';
import { WithdrawalStatus } from '@subql/network-query';
import { AccountHeader } from './Header';
import { t } from 'i18next';
import { useDelegating } from '@hooks/useDelegating';
import { ROUTES } from '@utils';

const { INDEXER, INDEXERS, DELEGATOR, MY_STAKING, MY_ACCOUNT, REWARDS, WITHDRAWN } = ROUTES;

type statNumber = string | undefined;

interface StatKey {
  delegating: statNumber;
  staking: statNumber;
  rewards: statNumber;
  withdrawn: statNumber;
}

interface CardProps {
  title: string;
  key: keyof StatKey;
  link: string;
  tooltip: string;
}

const NoDelegator: React.FC = () => {
  const { t } = useTranslation();
  return (
    <EmptyList title={t('myDelegators.noDelegatorsTitle')} description={t('myDelegators.noDelegatorsDescription')} />
  );
};

const cards: CardProps[] = [
  {
    title: t('account.title.delegating'),
    key: 'delegating',
    link: `/${DELEGATOR}/${INDEXERS}`,
    tooltip: t('account.tooltip.delegating'),
  },
  {
    title: t('account.title.staking'),
    key: 'staking',
    link: `/${INDEXER}/${MY_STAKING}`,
    tooltip: t('account.tooltip.staking'),
  },
  {
    title: t('account.title.rewards'),
    key: 'rewards',
    link: `/${MY_ACCOUNT}/${REWARDS}`,
    tooltip: t('account.tooltip.rewards'),
  },
  {
    title: t('account.title.withdrawn'),
    key: 'withdrawn',
    link: `/${MY_ACCOUNT}/${WITHDRAWN}`,
    tooltip: t('account.tooltip.withdrawn'),
  },
];

//TODO: add fragments so can better type this
function reduceTotal(nodes: any) {
  return formatEther(
    nodes?.nodes.reduce(
      (accumulator: any, currentValue: { amount: unknown }) => accumulator.add(BigNumber.from(currentValue?.amount)),
      BigNumber.from(0),
    ),
    4,
  );
}

export const MyAccount: React.FC = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const action = (link: string, key: string) => ({
    label: t(`account.linkText.${key}`),
    onClick: () => navigate(link),
  });

  const sortedIndexer = useSortedIndexer(account || '');
  const indexerDelegators = useGetIndexerDelegatorsQuery({ variables: { id: account ?? '', offset: 0 } });
  const delegating = useDelegating(account ?? '');
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
      const totalDelegating = formatEther(d, 4);
      const totalRewards = reduceTotal(r?.rewards);
      const totalWithdrawn = reduceTotal(w?.withdrawls);
      const totalStaking = truncFormatEtherStr(`${i?.totalStake?.current ?? 0}`, 4);

      const cardStats: StatKey = {
        delegating: totalDelegating,
        staking: totalStaking,
        rewards: totalRewards,
        withdrawn: totalWithdrawn,
      };

      return (
        <div className={styles.page}>
          <div className={styles.container}>
            <AccountHeader />
            <div className={styles.statsTiles}>
              {cards.map(({ title, key, link, tooltip }) => (
                <Card
                  key={key}
                  description={`${cardStats[key]} ${TOKEN}` ?? '-'}
                  title={title}
                  titleTooltipIcon={<InfoCircleOutlined />}
                  action={action(link, key)}
                  titleTooltip={tooltip}
                />
              ))}
            </div>
            <div className={styles.myDelegators}>
              <div className={styles.delegatorHeader}>
                <Typography variant="h5">{t('indexer.myDelegators')}</Typography>
                {/* <Typography variant="medium">
                  <Link to={'/'}>{t('account.viewDetails')}</Link>
                </Typography> */}
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
