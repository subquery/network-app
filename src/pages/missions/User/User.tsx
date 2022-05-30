// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import { useHistory, useParams } from 'react-router';
import styles from './User.module.css';
import { useTranslation } from 'react-i18next';
import { CurEra, Spinner } from '../../../components';
import Jazzicon from 'react-jazzicon';
import { PageHeader } from 'antd';
import Missions from '../Mission/Missions/Missions';
import { renderAsync } from '../../../utils';
import { useIndexerChallenges } from '../../../containers/QueryLeaderboardProject';
import { GetIndexer } from '../../../__generated__/leaderboard/GetIndexer';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Consumer = 'Consumer',
}

const tabList = [SectionTabs.Indexing];

export const User: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { id } = useParams<{ id: string }>();
  const indexer = useIndexerChallenges({ indexerId: id });

  const history = useHistory();
  const routeChange = () => {
    history.push('/missions/leaderboard');
  };

  return (
    <>
      <div className={styles.header}>
        <PageHeader className="site-page-header" onBack={routeChange} title="Leaderboard" />
        <CurEra />
      </div>

      {renderAsync(indexer, {
        loading: () => <Spinner />,
        error: (e) => <div>{`Unable to fetch Indexer: ${e.message}`}</div>,
        data: (data: GetIndexer) => {
          return (
            <>
              <div className={styles.topar}>
                <div className={styles.indexer}>
                  <Jazzicon diameter={50} />
                  <div className={styles.address}>
                    <h2>{id}</h2>
                  </div>
                </div>
                <div className={styles.profile}>
                  <div className={styles.pointsSummary}>
                    <h4>Total Points</h4>
                    <h2>
                      <b>{data?.indexerChallenge?.singlePoints} points</b>
                    </h2>
                  </div>
                </div>
              </div>
              <div>
                <div className={styles.tabList}>
                  {tabList.map((tab) => (
                    <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
                      <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
                      {curTab === tab && <div className={styles.line} />}
                    </div>
                  ))}
                </div>
                {curTab === SectionTabs.Indexing && <Missions indexer={indexer?.data?.indexerChallenge} />}
                {curTab === SectionTabs.Delegating && <>Coming Soon</>}
                {curTab === SectionTabs.Consumer && <>Coming Soon</>}
              </div>
            </>
          );
        },
      })}
    </>
  );
};
