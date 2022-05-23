// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, Tag } from 'antd';
import styles from './Missions.module.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { INDEXER_CHALLENGE_DETAILS, INDEXER_CHALLENGE_PTS } from '../../constants';

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

export const Missions: React.VFC<{ indexerID: string }> = ({ indexerID }) => {
  const [challenges, setChallenges] = useState<any>(undefined);
  const [dailyChallenges, setDailyChallenges] = useState<any>(undefined);

  const formatTitle = (text: string) => {
    let formatted = text.replace(/-/g, ' ');
    formatted = text.replace(/_/g, ' ');
    return formatted.toUpperCase();
  };

  const formatData = (challenges: any[] | undefined, dailyChallenges: any | undefined) => {
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
        const found = challenges.find((c: any) => c.title === challenge);

        return {
          key: key++,
          type: 'One-off',
          mission: formatTitle(challenge),
          points: found ? found.points : INDEXER_CHALLENGE_DETAILS[challenge].points,
          progress: found ? 'Completed' : 'Incomplete',
          date: '-',
        };
      });
    }

    if (dailyChallenges) {
      //FIXME: need to order by date before pushing
      dailyChallenges.forEach((item: any) => {
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

    return allChallenges.flat();
  };

  const getChallenges = async (id: string) => {
    const { data } = await axios.post('https://api.subquery.network/sq/subquery/leaderboard-s2', {
      query: `query {
            indexer(id: "${id}") {
              singleChallenges
              singleChallengePts
            }
        }`,
    });
    setChallenges(data);
  };

  const getDailyChallenges = async (id: string) => {
    const { data } = await axios.post('https://leaderboard-api.subquery.network/graphql', {
      query: `query {
            indexerChallenge(id: "${id}") {
              challenges {
                title
                timestamp
                point
              }
            }
        }`,
    });
    setDailyChallenges(data?.data?.indexerChallenge?.challenges);
  };

  // have another axios fetch that fetches fron nest project

  useEffect(() => {
    getChallenges(indexerID);
    getDailyChallenges(indexerID);
  }, [indexerID]);

  // TODO: Should handle case if indexer isn't on the network
  if (challenges) {
    return (
      <div className={styles.container}>
        {/* <Typography>
                <div className={styles.titlebutton}>
                  <h2>Current Season</h2>
                </div>
                <p>Duration: 16/04/2022 - 23/04/2022</p>
            </Typography> */}
        <Table
          columns={columns}
          dataSource={formatData(challenges?.data?.indexer?.singleChallenges, dailyChallenges)}
        />
      </div>
    );
  } else {
    return <></>;
  }
};

export default Missions;
