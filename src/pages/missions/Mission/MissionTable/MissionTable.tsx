// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, TableProps, Tag, Typography } from 'antd';
import styles from './MissionTable.module.css';
import { INDEXER_CHALLENGE_DETAILS, PARTICIPANT, missionMapping, MISSION_STATUS, MISSION_TYPE } from '../../constants';
import { COLORS, convertStringToNumber, parseError } from '../../../../utils';
import { TableText } from '../../../../components';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useDeploymentQuery, useProjectMetadata } from '../../../../containers';
import { Spinner } from '@subql/react-ui';

// TODO: Progress Status should be defined at one place
const ProgressTag: React.VFC<{ progress: string; color?: string }> = ({ progress, color }) => {
  return <Tag color={color ?? COLORS.gray400}>{progress}</Tag>;
};

interface IDailyChallenge {
  mission: string;
  deploymentId: string;
}
const DailyChallenge = ({ mission, deploymentId }: IDailyChallenge) => {
  const [projectName, setProjectName] = React.useState<string>();
  const [loading, setIsLoading] = React.useState<boolean>();
  const deployment = useDeploymentQuery({ deploymentId });
  const { getMetadataFromCid } = useProjectMetadata();

  React.useEffect(() => {
    setIsLoading(deployment.loading);
    async function getProjectInfo() {
      if (deployment.data) {
        setIsLoading(true);
        const projectMeta = deployment.data.deployment?.project?.metadata || '';
        const project = await getMetadataFromCid(projectMeta);
        setProjectName(project.name);
        setIsLoading(false);
      }
    }
    getProjectInfo();
  }, [deployment.data, deployment.loading, getMetadataFromCid]);

  if (loading) return <Spinner />;
  if (deployment?.error && !deployment.data)
    return <Typography.Text type="danger">{parseError(deployment?.error)}</Typography.Text>;

  const sortedMission = `${mission} : ${projectName || `Deployment - ${deploymentId}`}`;
  return <TableText>{sortedMission}</TableText>;
};

const progressColorMapping = {
  [MISSION_STATUS.INCOMPLETE]: 'blue',
  [MISSION_STATUS.COMPLETED]: 'green',
  [MISSION_STATUS.EXPIRED]: 'red',
};

export type Challenge = {
  key: string;
  type: MISSION_TYPE;
  title?: string | undefined;
  mission: string;
  points: number;
  progress: MISSION_STATUS;
  timestamp?: Date;
  deploymentId?: string;
};

const columns: TableProps<Challenge>['columns'] = [
  {
    title: 'TYPES',
    dataIndex: 'type',
    width: '10%',
    sorter: (a, b) => (a.type === MISSION_TYPE.DAILY ? -1 : 1),
    defaultSortOrder: 'ascend',
  },
  {
    title: 'MISSION',
    dataIndex: 'mission',
    render: (mission: string, challenge: Challenge) => {
      if (challenge?.deploymentId) {
        return <DailyChallenge mission={mission} deploymentId={challenge?.deploymentId} />;
      }
      const description = INDEXER_CHALLENGE_DETAILS[mission]?.description;
      return <TableText tooltip={description}>{mission}</TableText>;
    },
  },
  {
    title: 'TIMESTAMP',
    dataIndex: 'timestamp',
    render: (timestamp: Date) => {
      if (!timestamp) return <TableText>{'-'}</TableText>;
      return <div>{moment.utc(timestamp).local().format('DD/MM/YYYY hh:mm:s')}</div>;
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
          key: `${mission.description}-${completedChallenge?.timestamp ?? new Date()}`,
          type: MISSION_TYPE.ONE_OFF,
          mission: mission.description,
          points: mission.points,
          progress: status,
          timestamp: completedChallenge?.timestamp,
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
          key: `${dailyChallenge.details}-${dailyChallenge?.timestamp ?? new Date()}`,
          type: MISSION_TYPE.DAILY,
          mission: dailyChallenge.details,
          points: dailyChallenge.point,
          progress: MISSION_STATUS.COMPLETED,
          timestamp: dailyChallenge?.timestamp,
          deploymentId: dailyChallenge?.deploymentId,
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
        <Table columns={columns} dataSource={[...oneOffMissions, ...indexerDailyChallenges]} rowKey={'key'} />
      </div>
    </>
  );
};
