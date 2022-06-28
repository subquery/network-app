// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import { useHistory, useParams } from 'react-router';
import styles from './User.module.css';
import { CurEra, Spinner } from '../../../components';
import Jazzicon from 'react-jazzicon';
import { Breadcrumb } from 'antd';
import { useParticipantChallenges } from '../../../containers';
import { MISSION_TYPE } from '../constants';
import { Link } from 'react-router-dom';
import { LEADERBOARD_ROUTE } from '..';
import { PointList } from '../Mission';
import { getCapitalizedStr } from '../../../utils';

const tabList = [MISSION_TYPE.INDEXER, MISSION_TYPE.DELEGATOR, MISSION_TYPE.CONSUMER];

export const User: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<MISSION_TYPE>(MISSION_TYPE.INDEXER);
  const { season, id } = useParams<{ season: string; id: string }>();
  const [participant, indexer] = useParticipantChallenges(Number(season), { indexerId: id });
  const seasonNum = Number(season);

  const history = useHistory();
  const routeChange = () => {
    history.push(LEADERBOARD_ROUTE);
  };

  if (participant.data && indexer.data) {
    const data = { ...participant.data, writable: true };
    console.log(indexer.data.indexerS3Challenges);
    const indexerTotal =
      indexer.data.indexerS3Challenges.totalPoints -
      indexer.data.indexerS3Challenges.singlePoints +
      data.indexer.singleChallengePts;

    data.indexer = { ...data.indexer, dailyChallenges: indexer.data.indexerS3Challenges.challenges };
    data.indexer.singleChallengePts = indexerTotal;

    return (
      <>
        <div className={styles.header}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to={LEADERBOARD_ROUTE} onClick={routeChange}>
                Season {season}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{id}</Breadcrumb.Item>
          </Breadcrumb>
          <CurEra />
        </div>

        <>
          <div className={styles.topar}>
            <div className={styles.indexer}>
              <Jazzicon diameter={50} />
              <div className={styles.address}>
                <h2>{id}</h2>
              </div>
            </div>
          </div>
          <div>
            <div className={styles.tabList}>
              {tabList.map((tab) => {
                if (tab === MISSION_TYPE.CONSUMER && seasonNum === 2) return undefined;
                return (
                  <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
                    <Typography className={`${styles.tabText} ${styles.grayText}`}>{getCapitalizedStr(tab)}</Typography>
                    {curTab === tab && <div className={styles.line} />}
                  </div>
                );
              })}
            </div>
            <div className={styles.tabcontainer}>
              <PointList missionType={curTab} data={data} season={seasonNum} />
            </div>
          </div>
        </>
      </>
    );
  } else {
    return <Spinner />;
  }
};
