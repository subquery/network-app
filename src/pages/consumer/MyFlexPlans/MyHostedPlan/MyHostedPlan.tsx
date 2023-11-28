// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useProjectMetadata } from '@containers';
import { IGetHostingPlans, useConsumerHostServices } from '@hooks/useConsumerHostServices';
import CreateHostingFlexPlan, {
  CreateHostingFlexPlanRef,
} from '@pages/explorer/FlexPlans/CreateHostingPlan/CreateHostingPlan';
import { Typography } from '@subql/components';
import { formatSQT } from '@subql/react-hooks';
import { TOKEN } from '@utils';
import { Table } from 'antd';
import BigNumberJs from 'bignumber.js';

import styles from './MyHostedPlan.module.less';

const MyHostedPlan: FC = (props) => {
  const navigate = useNavigate();
  const { updateHostingPlanApi, getHostingPlanApi, hasLogin } = useConsumerHostServices({
    alert: true,
    autoLogin: false,
  });

  const [loading, setLoading] = useState(false);
  const [createdHostingPlan, setCreatedHostingPlan] = useState<IGetHostingPlans[]>([]);
  const [currentEditInfo, setCurrentEditInfo] = useState<IGetHostingPlans>();
  const ref = useRef<CreateHostingFlexPlanRef>(null);
  // const { getMetadataFromCid } = useProjectMetadata()
  const init = async () => {
    try {
      setLoading(true);
      if (!hasLogin) {
        return;
      }

      const res = await getHostingPlanApi();
      setCreatedHostingPlan(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, [hasLogin]);

  return (
    <div className={styles.myHostedPlan}>
      <Table
        style={{ marginTop: 40 }}
        loading={loading}
        dataSource={createdHostingPlan}
        columns={[
          {
            title: 'Project',
          },
          {
            title: 'Maximum Price',
            dataIndex: 'price',
            render: (val: string) => {
              return (
                <Typography>
                  {formatSQT(BigNumberJs(val).multipliedBy(1000).toString())} {TOKEN}
                </Typography>
              );
            },
          },
          {
            title: 'Maximum Allocated indexers',
            dataIndex: 'maximum',
            render: (val: number) => {
              return <Typography>{val}</Typography>;
            },
          },
          {
            title: 'Spent',
            dataIndex: 'spent',
            render: (val: string) => {
              return (
                <Typography>
                  {formatSQT(BigNumberJs(val).toString())} {TOKEN}
                </Typography>
              );
            },
          },
          {
            title: 'Action',
            fixed: 'right',
            dataIndex: 'spent',
            render: (_, record) => {
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
                      setCurrentEditInfo(record);
                      ref.current?.showModal();
                    }}
                  >
                    Edit
                  </Typography>

                  <Typography
                    style={{ color: 'var(--sq-error)', padding: '6px 10px', marginLeft: 16 }}
                    onClick={() => {
                      updateHostingPlanApi({
                        id: record.id,
                        deploymentId: record.deployment.deployment,
                        price: '0',
                        maximum: 2,
                        expiration: 0,
                      });
                    }}
                  >
                    Stop
                  </Typography>
                </div>
              );
            },
          },
        ]}
      ></Table>

      <CreateHostingFlexPlan
        hideBoard
        edit
        ref={ref}
        id={`${currentEditInfo?.deployment.project_id || ''}`}
        deploymentId={`${currentEditInfo?.deployment.deployment || ''}`}
        editInformation={currentEditInfo}
        onSubmit={() => init()}
      ></CreateHostingFlexPlan>
    </div>
  );
};
export default MyHostedPlan;
