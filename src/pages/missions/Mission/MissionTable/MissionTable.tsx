// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, TableProps, Tag, Typography } from 'antd';
import styles from './MissionTable.module.css';
import { INDEXER_CHALLENGE_DETAILS, PARTICIPANT, missionMapping, MISSION_STATUS, MISSION_TYPE } from '../../constants';
import { COLORS, convertStringToNumber } from '../../../../utils';
import { TableText } from '../../../../components';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

// TODO: Progress Status should be defined at one place
const ProgressTag: React.VFC<{ progress: string; color?: string }> = ({ progress, color }) => {
  return <Tag color={color ?? COLORS.gray400}>{progress}</Tag>;
};

const progressColorMapping = {
  [MISSION_STATUS.INCOMPLETE]: 'blue',
  [MISSION_STATUS.COMPLETED]: 'green',
  [MISSION_STATUS.EXPIRED]: 'red',
};

export type Challenge = {
  type: MISSION_TYPE;
  title?: string | undefined;
  mission: string;
  points: number;
  progress: MISSION_STATUS;
};

const columns: TableProps<Challenge>['columns'] = [
  {
    title: 'TYPES',
    dataIndex: 'type',
    width: '10%',
  },
  {
    title: 'MISSION',
    dataIndex: 'mission',
    width: '60%',
    render: (mission: string) => {
      const description = INDEXER_CHALLENGE_DETAILS[mission]?.description;
      return <TableText tooltip={description}>{mission}</TableText>;
    },
  },
  {
    title: 'POINTS',
    dataIndex: 'points',
    render: (points: string) => {
      return <TableText>{i18next.t('missions.point', { count: convertStringToNumber(points) })}</TableText>;
    },
  },
  {
    title: 'YOUR PROGRESS',
    dataIndex: 'progress',
    sorter: (a, b) => (a.progress === MISSION_STATUS.COMPLETED ? -1 : 1),
    defaultSortOrder: 'ascend',
    render: (progress: MISSION_STATUS) => <ProgressTag progress={progress} color={progressColorMapping[progress]} />,
  },
];

// TODO: remove any type
export interface MissionTableProps {
  challenges: { singleChallenges?: Array<any>; singleChallengePts?: number; totalPoints?: number };
  dailyChallenges?: Array<any>;
  participant: PARTICIPANT;
  hideTotalPoints?: boolean;
  season: number;
  viewPrev?: () => void;
  viewCurr?: () => void;
}

// TODO: ReadonlyArray<any>
export const MissionTable: React.VFC<MissionTableProps> = ({
  challenges,
  dailyChallenges,
  participant,
  hideTotalPoints,
  season,
  viewPrev,
  viewCurr,
}) => {
  const { t } = useTranslation();
  const totalPoint = challenges['singleChallengePts'] ?? challenges['totalPoints'] ?? 0;

  const allOneOffMissions = missionMapping[participant];
  const oneOffMissions: Array<Challenge> = React.useMemo(() => {
    let sortedOneOffMissions = [] as Array<Challenge>;
    if (allOneOffMissions) {
      sortedOneOffMissions = Object.keys(allOneOffMissions).map((oneOffMissionKey, idx) => {
        const completedChallenge = challenges?.singleChallenges?.find(
          (challenge) => challenge.title === oneOffMissionKey,
        );

        const status = completedChallenge ? MISSION_STATUS.COMPLETED : MISSION_STATUS.INCOMPLETE;
        const mission = allOneOffMissions[oneOffMissionKey];

        return {
          type: MISSION_TYPE.ONE_OFF,
          mission: mission.description,
          points: mission.points,
          progress: status,
        };
      });
    }
    return sortedOneOffMissions;
  }, [allOneOffMissions, challenges?.singleChallenges]);

  const indexerDailyChallenges: Array<Challenge> = React.useMemo(() => {
    let sortedDailyChallenges = [] as Array<Challenge>;
    if (participant === PARTICIPANT.INDEXER && dailyChallenges && dailyChallenges?.length > 0) {
      sortedDailyChallenges = dailyChallenges.map((dailyChallenge, idx) => {
        return {
          type: MISSION_TYPE.DAILY,
          mission: dailyChallenge.details,
          points: dailyChallenge.point,
          progress: MISSION_STATUS.COMPLETED,
        };
      });
    }
    return sortedDailyChallenges;
  }, [dailyChallenges, participant]);

  return (
    <>
      {!hideTotalPoints && (
        <div className={styles.totalPoints}>
          <Typography.Text type="secondary" className={styles.pointText}>
            {t('missions.totalPoint')}
          </Typography.Text>
          <Typography.Text className={styles.pointText}>
            {t('missions.point', { count: totalPoint ?? 0 })}
          </Typography.Text>
        </div>
      )}
      <div className={styles.container}>
        <Table columns={columns} dataSource={[...oneOffMissions, ...indexerDailyChallenges]} rowKey={'mission'} />
      </div>
    </>
  );
};
