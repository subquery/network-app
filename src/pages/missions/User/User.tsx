// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import { useHistory, useParams } from 'react-router';
import styles from './User.module.css';
import { useTranslation } from 'react-i18next';
import { CurEra } from '../../../components';
import { Indexers } from '../../staking/Indexers';
import Jazzicon from 'react-jazzicon';
import { PageHeader } from 'antd';
import Missions from '../Mission/Missions/Missions';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Consumer = 'Consumer',
}

const tabList = [SectionTabs.Indexing, SectionTabs.Delegating, SectionTabs.Consumer];

export const User: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { t } = useTranslation();

  const { id } = useParams<{ id: string }>();

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

      <div className={styles.indexer}>
        <Jazzicon diameter={70} />
        <div className={styles.address}>
          <h1>{id}</h1>
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
        {curTab === SectionTabs.Indexing && <Missions indexerID={id} />}
        {curTab === SectionTabs.Delegating && <>Coming Soon</>}
        {curTab === SectionTabs.Consumer && <>Coming Soon</>}
      </div>
    </>
  );
};
