// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import styles from './Missions.module.css';
import { INDEXER_CHALLENGE_DETAILS, INDEXER_CHALLENGE_PTS } from '../../constants';
import {
  GetIndexer_indexerChallenge,
  GetIndexer_indexerChallenge_challenges,
  GetIndexer_indexerChallenge_singleChallenges,
} from '../../../../__generated__/leaderboard/GetIndexer';
import { SeasonInfo } from '../../../../components/SeasonInfo/SeasonInfo';

const columns = [
  {
    title: 'TYPES',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'MISSION',
    dataIndex: 'mission',
    key: 'mission',
    render: (mission: string) => {
      const description = INDEXER_CHALLENGE_DETAILS[mission]?.description;
      return (
        <Tooltip placement="topLeft" title={description ?? ''}>
          {mission}
        </Tooltip>
      );
    },
  },
  {
    title: 'POINTS',
    dataIndex: 'points',
    key: 'points',
  },
  {
    title: 'YOUR PROGRESS',
    dataIndex: 'progress',
    key: 'progress',
    render: (progress: 'Incomplete' | 'Completed' | 'Expired') => {
      if (progress === 'Incomplete') {
        return <Tag color="blue">{progress}</Tag>;
      }
      if (progress === 'Completed') {
        return <Tag color="green">{progress}</Tag>;
      }
      if (progress === 'Expired') {
        return <Tag color="red">{progress}</Tag>;
      }
    },
  },
];

//TODO: Will need to have two props:
// 1. const missionType = 'Indexing' | 'Delegating' | 'Consumer'
// 2. either indexerID

export const Missions: React.VFC<{
  indexer: GetIndexer_indexerChallenge | undefined;
  season?: number;
  viewPrev?: () => void;
  viewCurr?: () => void;
}> = ({ indexer, season, viewPrev, viewCurr }) => {
  const formatData = (
    challenges: ReadonlyArray<GetIndexer_indexerChallenge_singleChallenges>,
    dailyChallenges: ReadonlyArray<GetIndexer_indexerChallenge_challenges>,
  ) => {
    let key = 1;
    let allChallenges: {
      type: string;
      key: number;
      mission: string;
      points: number;
      progress: string;
    }[] = [];

    if (challenges) {
      allChallenges = INDEXER_CHALLENGE_PTS.map((challenge: string) => {
        const found = challenges.find((c) => c.title === challenge);

        return {
          key: key++,
          type: 'One-off',
          mission: challenge,
          points: found?.points ?? INDEXER_CHALLENGE_DETAILS[challenge].points,
          progress: found ? 'Completed' : 'Incomplete',
        };
      });
    }

    // if (dailyChallenges) {
    //   dailyChallenges.forEach((item) => {
    //     allChallenges.push({
    //       type: 'Daily',
    //       key: key++,
    //       mission: formatTitle(item.title),
    //       points: item.point,
    //       progress: 'Completed',
    //       date: new Date(item.timestamp).toLocaleDateString(),
    //     });
    //   });
    // }

    return allChallenges.flat();
  };

  if (indexer) {
    return (
      <div className={styles.container}>
        {season && <SeasonInfo season={season} viewPrev={viewPrev} viewCurr={viewCurr} />}
        <br />
        <Table columns={columns} dataSource={formatData(indexer.singleChallenges, indexer.challenges)} />
      </div>
    );
  } else {
    return <></>;
  }
};

export default Missions;
