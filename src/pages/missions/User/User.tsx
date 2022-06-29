// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useHistory, useParams } from 'react-router';
import styles from './User.module.css';
import { CurEra } from '../../../components';
import Jazzicon from 'react-jazzicon';
import { Breadcrumb } from 'antd';
import { useParticipantChallenges } from '../../../containers';
import { Link } from 'react-router-dom';
import { LEADERBOARD_ROUTE } from '..';
import { TabContent } from '../Mission';

// TODO: replace Jazzicon with connectedIndexer
export const User: React.VFC = () => {
  const { season, id } = useParams<{ season: string; id: string }>();
  const [participant, indexer] = useParticipantChallenges(Number(season), { indexerId: id }); //TODO: rethink about the structure
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
      <br />
      <>
        <div className={styles.topar}>
          <div className={styles.indexer}>
            <Jazzicon diameter={50} />
            <div className={styles.address}>
              <h2>{id}</h2>
            </div>
          </div>
        </div>
        <TabContent participant={participant} indexer={indexer} season={sortedSeason} />
      </>
    </>
  );
};
