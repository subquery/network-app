// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useHistory, useParams } from 'react-router';
import styles from './User.module.css';
import { CurEra } from '../../../components';
import Jazzicon from 'react-jazzicon';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
// import { TabContent } from '../Mission';
import { LEADERBOARD_ROUTE } from '../Leaderboard';

// TODO: replace Jazzicon with connectedIndexer
export const User: React.VFC = () => {
  const { season, id } = useParams<{ season: string; id: string }>();
  const [completedMissions, indexer] = [[], []]; // useParticipantChallenges(Number(season), { indexerId: id }); //TODO: rethink about the structure
  const sortedSeason = Number(season);

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

      <>
        <div className={styles.topar}>
          <div className={styles.indexer}>
            <Jazzicon diameter={50} />
            <div className={styles.address}>
              <h2>{id}</h2>
            </div>
          </div>
        </div>
        {/* <TabContent completedMissions={completedMissions} indexer={indexer} season={sortedSeason} /> */}
      </>
    </>
  );
};
