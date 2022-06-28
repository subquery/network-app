// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import { useHistory, useParams } from 'react-router';
import styles from './User.module.css';
import { CurEra, Spinner } from '../../../components';
import Jazzicon from 'react-jazzicon';
import { Breadcrumb } from 'antd';
import { Missions } from '../Mission/Missions/Missions';
import { useParticipantChallenges } from '../../../containers';
import { getMissionDetails, MISSION_TYPE } from '../constants';
import { Link } from 'react-router-dom';
import { LEADERBOARD_ROUTE } from '..';

enum SectionTabs {
  Indexing = 'Indexer',
  Delegating = 'Delegator',
  Consumer = 'Consumer',
}

const tabList = [SectionTabs.Indexing, SectionTabs.Delegating, SectionTabs.Consumer];

export const User: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { season, id } = useParams<{ season: string; id: string }>();
  const [participant, indexer] = useParticipantChallenges(Number(season), { indexerId: id });
  const seasonNum = Number(season);

  const history = useHistory();
  const routeChange = () => {
    history.push(LEADERBOARD_ROUTE);
  };

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
      {participant?.data && indexer?.data ? (
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
                if (tab === SectionTabs.Consumer && seasonNum === 2) return undefined;
                return (
                  <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
                    <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
                    {curTab === tab && <div className={styles.line} />}
                  </div>
                );
              })}
            </div>
            {curTab === SectionTabs.Indexing && (
              <Missions participant={participant.data?.indexer} season={seasonNum} missionType={MISSION_TYPE.INDEXER} />
            )}
            {curTab === SectionTabs.Delegating && (
              <Missions
                participant={participant.data?.delegator}
                season={seasonNum}
                missionType={MISSION_TYPE.DELEGATOR}
              />
            )}
            {curTab === SectionTabs.Consumer && (
              <Missions
                participant={participant.data?.consumer}
                season={seasonNum}
                missionType={MISSION_TYPE.CONSUMER}
              />
            )}
          </div>
        </>
      ) : (
        <Spinner />
      )}
      ;
    </>
  );
};
