// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import styles from './Missions.module.css';
import { INDEXER_CHALLENGE_DETAILS, IndexerDetails } from '../../constants';

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
  participant: any;
  missionDetails: IndexerDetails;
  season: number;
  viewPrev?: () => void;
  viewCurr?: () => void;
}> = ({ participant, missionDetails, season, viewPrev, viewCurr }) => {
  const formatData = (DETAILS: IndexerDetails, challenges: ReadonlyArray<any>, dailyChallenges: ReadonlyArray<any>) => {
    let key = 1;
    let allChallenges: {
      type: string;
      key: number;
      title: string;
      mission: string;
      points: number;
      progress: string;
    }[] = [];

    if (challenges) {
      allChallenges = challenges
        .filter((challenge) => DETAILS[challenge.title])
        .map((v: { title: string; points: number; details: string }) => {
          const i = DETAILS[v.title];
          return {
            key: key++,
            type: 'One-off',
            title: v.title,
            mission: i?.description,
            points: i?.points,
            progress: i ? 'Completed' : 'Incomplete',
          };
        });
    }

    for (const [i, item] of Object.entries(DETAILS)) {
      const found = allChallenges?.find((v: any) => v.title === i);

      if (!found) {
        allChallenges.push({
          key: key++,
          type: 'One-off',
          title: '',
          mission: item?.description,
          points: item?.points,
          progress: 'Incomplete',
        });
      }
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

  if (participant) {
    return (
      <div className={styles.container}>
        <Table columns={columns} dataSource={formatData(missionDetails, participant.singleChallenges, [])} />
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <Table columns={columns} dataSource={formatData(missionDetails, [], [])} />
      </div>
    );
  }
};

export default Missions;
