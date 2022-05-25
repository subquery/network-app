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
  {
    title: 'DATE ACHIEVED',
    dataIndex: 'date',
    key: 'date',
  },
];

//TODO: Will need to have two props:
// 1. const missionType = 'Indexing' | 'Delegating' | 'Consumer'
// 2. either indexerID

const getTime = (date?: Date) => {
  return date != null ? date.getTime() : 0;
};

export const Missions: React.VFC<{ indexer: GetIndexer_indexerChallenge | undefined }> = ({ indexer }) => {
  const formatTitle = (text: string) => {
    let formatted = text.replace(/-/g, ' ');
    formatted = text.replace(/_/g, ' ');
    return formatted.toUpperCase();
  };

  const formatData = (
    challenges: ReadonlyArray<GetIndexer_indexerChallenge_singleChallenges>,
    dailyChallenges: ReadonlyArray<GetIndexer_indexerChallenge_challenges>,
  ) => {
    let key = 1;
    let allChallenges: {
      type: string;
      key: number;
      mission: string;
      points: number | string;
      progress: string;
      date: string;
    }[] = [];

    //TODO: find a smarter way to render missions that aren't achieved
    if (challenges) {
      allChallenges = INDEXER_CHALLENGE_PTS.map((challenge: string) => {
        const found = challenges.find((c) => c.title === challenge);

        return {
          key: key++,
          type: 'One-off',
          mission: challenge,
          points: found ? found.points : INDEXER_CHALLENGE_DETAILS[challenge].points,
          progress: found ? 'Completed' : 'Incomplete',
          date: '-',
        };
      });
    }

    if (dailyChallenges) {
      dailyChallenges.forEach((item) => {
        allChallenges.push({
          type: 'Daily',
          key: key++,
          mission: formatTitle(item.title),
          points: item.point,
          progress: 'Completed',
          date: new Date(item.timestamp).toLocaleDateString(),
        });
      });
    }

    const a = allChallenges.flat();

    const final = a.sort((a, b) => {
      if (a.date === '-') return 1;
      if (b.date === '-') return 1;
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      return getTime(bDate) - getTime(aDate);
    });
    return final;
  };

  if (indexer) {
    return (
      <div className={styles.container}>
        {/* <Typography>
                <div className={styles.titlebutton}>
                  <h2>Current Season</h2>
                </div>
                <p>Duration: 16/04/2022 - 23/04/2022</p>
            </Typography> */}
        <Table columns={columns} dataSource={formatData(indexer?.singleChallenges, indexer?.challenges)} />
      </div>
    );
  } else {
    return <></>;
  }
};

export default Missions;
