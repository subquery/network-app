// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import styles from './Missions.module.css';
import { INDEXER_CHALLENGE_DETAILS, MISSION_TYPE, getMissionDetails } from '../../constants';

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

export interface MissionsProps {
  participant: any;
  dailyChallenges?: any;
  missionType: MISSION_TYPE;
  season: number;
  viewPrev?: () => void;
  viewCurr?: () => void;
}

export const Missions: React.VFC<MissionsProps> = ({
  participant,
  dailyChallenges,
  missionType,
  season,
  viewPrev,
  viewCurr,
}) => {
  const formatData = (
    missionType: MISSION_TYPE,
    challenges: ReadonlyArray<any>,
    dailyChallenges: ReadonlyArray<any>,
  ) => {
    const DETAILS = getMissionDetails(missionType);

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

    if (missionType === MISSION_TYPE.INDEXER) {
      dailyChallenges.forEach((item) => {
        allChallenges.push({
          type: 'Daily',
          key: key++,
          mission: item?.details,
          points: item?.point,
          progress: 'Completed',
          title: '',
        });
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

    return allChallenges.flat();
  };

  if (participant) {
    return (
      <div className={styles.container}>
        <Table
          columns={columns}
          dataSource={formatData(missionType, participant.singleChallenges, dailyChallenges ?? [])}
        />
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <Table columns={columns} dataSource={formatData(missionType, [], [])} />
      </div>
    );
  }
};
