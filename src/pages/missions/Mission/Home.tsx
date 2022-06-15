// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useIndexerChallenges, useWeb3 } from '../../../containers';
import { useHistory } from 'react-router';
import { ConnectWallet, CurEra } from '../../../components';
import styles from './Home.module.css';
import { injectedConntector } from '../../../containers/Web3';
import { Spinner, Toast, Typography } from '@subql/react-ui';
import { useTranslation } from 'react-i18next';
import Missions from './Missions/Missions';
import { renderAsync } from '../../../utils';
import { GetIndexer } from '../../../__generated__/leaderboard/GetIndexer';
import { CURR_SEASON, SEASONS } from '../constants';
import { useState } from 'react';
import { SeasonProgress } from '../../../components/SeasonProgress/SeasonProgress';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Consumer = 'Consumer',
}

const tabList = [SectionTabs.Indexing];

const Home: React.VFC = (children) => {
  const [errorAlert, setErrorAlert] = React.useState<string | null>();
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { account, activate, error } = useWeb3();
  const { t } = useTranslation();
  const history = useHistory();
  const indexer = useIndexerChallenges({ indexerId: account ?? '' });
  const [season, setSeason] = useState(CURR_SEASON);

  const viewPrev = () => setSeason(season - 1);
  const viewCurr = () => setSeason(CURR_SEASON);

  const indexerUrl = '/missions/my-missions';

  React.useEffect(() => {
    if (account) {
      history.push(indexerUrl);
    }
  }, [account, history, indexerUrl]);

  React.useEffect(() => {
    if (error) {
      setErrorAlert(error.message || 'Failed to connect wallet.');
    }
  }, [error]);

  const handleConnectWallet = React.useCallback(async () => {
    if (account) return;

    try {
      await activate(injectedConntector);
    } catch (e) {
      setErrorAlert('Failed to activate wallet');
      console.log('Failed to activate wallet', e);
    }
  }, [activate, account]);

  if (!account) {
    return (
      <div className={styles.container}>
        {errorAlert && <Toast state="error" text={errorAlert} className={styles.error} />}
        <div className={styles.connectWallet}>
          <ConnectWallet onConnect={handleConnectWallet} />
        </div>
      </div>
    );
  } else {
    return (
      <>
        <div className={styles.topBar}>
          <div className={styles.header}>{t('header.missions')}</div>
          <CurEra />
        </div>
        <br />
        {renderAsync(indexer, {
          loading: () => <Spinner />,
          error: (e) => <div>{`Unable to fetch Indexer: ${e.message}`}</div>,
          data: (data: GetIndexer) => {
            return (
              <>
                <div className={styles.profile}>
                  <div className={styles.pointsSummary}>
                    <h3>Total Points</h3>
                    <h1>
                      <b>{data?.indexerChallenge?.singlePoints} points</b>
                    </h1>
                  </div>
                  <SeasonProgress timePeriod={SEASONS[season]} />
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
                  {curTab === SectionTabs.Indexing && (
                    <Missions
                      indexer={indexer?.data?.indexerChallenge}
                      season={season}
                      viewPrev={viewPrev}
                      viewCurr={viewCurr}
                    />
                  )}
                  {curTab === SectionTabs.Delegating && (
                    <div className={styles.container}>
                      <h2>Coming Soon</h2>
                    </div>
                  )}
                  {curTab === SectionTabs.Consumer && (
                    <div className={styles.container}>
                      <h2>Coming Soon</h2>
                    </div>
                  )}
                </div>
              </>
            );
          },
        })}
      </>
    );
  }
};

export default Home;
