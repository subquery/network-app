// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { useNavigate } from 'react-router';
import { SubqlTable, Typography } from '@subql/components';

import styles from './MyHostedPlan.module.less';

interface IProps {}

const MyHostedPlan: FC<IProps> = (props) => {
  const navigate = useNavigate();

  return (
    <div className={styles.myHostedPlan}>
      <SubqlTable
        style={{ marginTop: 40 }}
        dataSource={[{}]}
        columns={[
          {
            title: 'Project',
          },
          {
            title: 'Maximum Price',
          },
          {
            title: 'Maximum Allocated indexers',
          },
          {
            title: 'Spent',
          },
          {
            title: 'Action',
            fixed: 'right',
            render: () => {
              return (
                <div>
                  <Typography
                    style={{ color: 'var(--sq-blue600)', padding: '6px 10px' }}
                    onClick={() => {
                      navigate(`/consumer/flex-plans/ongoing/details/1`);
                    }}
                  >
                    View Details
                  </Typography>
                  <Typography
                    style={{ color: 'var(--sq-blue600)', padding: '6px 10px', marginLeft: 16 }}
                    onClick={() => {
                      navigate(`/consumer/flex-plans/ongoing/details/1`);
                    }}
                  >
                    Edit
                  </Typography>
                </div>
              );
            },
          },
        ]}
      ></SubqlTable>
    </div>
  );
};
export default MyHostedPlan;
