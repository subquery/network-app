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
  const {
    updateHostingPlanApi,
    getHostingPlanApi,
    hasLogin,
    loading: consumerHostLoading,
    requestTokenLayout,
  } = useConsumerHostServices({
    alert: true,
    autoLogin: false,
  });

  const [loading, setLoading] = useState(false);
  const [createdHostingPlan, setCreatedHostingPlan] = useState<(IGetHostingPlans & { projectName: string | number })[]>(
    [],
  );
  const [currentEditInfo, setCurrentEditInfo] = useState<IGetHostingPlans>();
  const { getMetadataFromCid } = useProjectMetadata();
  const ref = useRef<CreateHostingFlexPlanRef>(null);
  const init = async () => {
    try {
      setLoading(true);
      if (!hasLogin) {
        return;
      }

      const res = await getHostingPlanApi();
      const allMetadata = await Promise.allSettled(
        res.data.map((i) => {
          return getMetadataFromCid(i.project.metadata);
        }),
      );
      setCreatedHostingPlan(
        res.data.map((raw, index) => {
          const result = allMetadata[index];
          const name = result.status === 'fulfilled' ? result.value.name : raw.id;
          return {
            ...raw,
            projectName: name,
          };
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, [hasLogin]);

  if (!hasLogin && !consumerHostLoading) return requestTokenLayout('Hosting Plan');

  return (
    <div className={styles.myHostedPlan}>
      <Table
        rowKey={(record) => record.id}
        style={{ marginTop: 40 }}
        loading={loading || consumerHostLoading}
        dataSource={createdHostingPlan}
        columns={[
          {
            title: 'Project',
            dataIndex: 'projectName',
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
                      navigate(
                        `/consumer/flex-plans/ongoing/details/${record.id}/ongoing?id=${record.id}&projectName=${record.projectName}&deploymentId=${record.deployment.deployment}`,
                      );
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
                    {record.price === '0' ? 'Restart' : 'Edit'}
                  </Typography>

                  <Typography
                    style={{
                      color: record.price === '0' ? 'var(--sq-gray400)' : 'var(--sq-error)',
                      padding: '6px 10px',
                      marginLeft: 16,
                    }}
                    onClick={async () => {
                      if (record.price === '0') return;
                      try {
                        setLoading(true);
                        await updateHostingPlanApi({
                          id: record.id,
                          deploymentId: record.deployment.deployment,
                          price: '0',
                          maximum: 2,
                          expiration: 0,
                        });
                        init();
                      } finally {
                        setLoading(false);
                      }
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
