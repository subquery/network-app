// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useHistory, useParams } from 'react-router';
import styles from './Participant.module.css';
import { AppPageHeader } from '../../../components';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { LEADERBOARD_ROUTE, MISSION_ROUTE } from '../constants';
import { IndexerName } from '../../../components/IndexerDetails/IndexerName';
import { MissionTabs } from '../Mission';

export const Participant: React.VFC = () => {
  const { season, account } = useParams<{ season: string; account: string }>();
  const history = useHistory();

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to={LEADERBOARD_ROUTE} onClick={() => history.push(LEADERBOARD_ROUTE)}>
            Season {season}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{'Mission details'}</Breadcrumb.Item>
      </Breadcrumb>
      <AppPageHeader title="Missions" />

      <div className={styles.indexerName}>
        <IndexerName address={account} fullAddress />
      </div>

      <MissionTabs
        account={account}
        indexerPath={`${MISSION_ROUTE}/${season}/${account}/indexer`}
        delegatorPath={`${MISSION_ROUTE}/${season}/${account}/delegator`}
        consumerPath={`${MISSION_ROUTE}/${season}/${account}/consumer`}
        rootPath={`${MISSION_ROUTE}/${season}/${account}`}
      />
    </>
  );
};
