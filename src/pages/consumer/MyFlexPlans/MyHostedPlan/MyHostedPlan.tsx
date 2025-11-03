// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineCopy } from 'react-icons/ai';
import { LuArrowRightFromLine } from 'react-icons/lu';
import { useNavigate } from 'react-router';
import Copy from '@components/Copy';
import { DeploymentMeta } from '@components/DeploymentInfo';
import { getHttpEndpointWithApiKey, getWsEndpointWithApiKey, specialApiKeyName } from '@components/GetEndpoint';
import { OutlineDot } from '@components/Icons/Icons';
import { useProjectMetadata } from '@containers';
import { useAccount } from '@containers/Web3';
import {
  GetUserApiKeys,
  IGetHostingPlans,
  IGetUserSubscription,
  useConsumerHostServices,
} from '@hooks/useConsumerHostServices';
import { isConsumerHostError } from '@hooks/useConsumerHostServices';
import CreateHostingFlexPlan, {
  CreateHostingFlexPlanRef,
} from '@pages/explorer/FlexPlans/CreateHostingPlan/CreateHostingPlan';
import { Modal, Tag, Typography } from '@subql/components';
import { bytes32ToCid } from '@subql/network-clients';
import { formatSQT } from '@subql/react-hooks';
import { numToHex, parseError, TOKEN } from '@utils';
import { formatNumberWithLocale } from '@utils';
import { Button, Dropdown, Input, message, Table } from 'antd';
import BigNumberJs from 'bignumber.js';

import styles from './MyHostedPlan.module.less';

const useGetConnectUrl = () => {
  const { getUserApiKeysApi, createNewApiKey } = useConsumerHostServices({
    alert: true,
    autoLogin: false,
  });

  const [userApiKeys, setUserApiKeys] = useState<GetUserApiKeys[]>([]);

  const createdApiKey = useMemo(() => {
    return userApiKeys.find((key) => key.name === specialApiKeyName);
  }, [userApiKeys]);

  const getConnectUrl = async (
    deploymentId: string,
    projectId: string,
  ): Promise<{
    http: string;
    ws: string;
  }> => {
    try {
      if (createdApiKey) {
        return {
          http: getHttpEndpointWithApiKey(deploymentId, createdApiKey.value),
          ws: getWsEndpointWithApiKey(projectId, createdApiKey.value),
        };
      }

      const res = await getUserApiKeysApi();
      if (!isConsumerHostError(res.data)) {
        setUserApiKeys(res.data);
        if (res.data.find((key) => key.name === specialApiKeyName)) {
          const apiKey = res.data.find((key) => key.name === specialApiKeyName)?.value;
          return {
            http: getHttpEndpointWithApiKey(deploymentId, apiKey || ''),
            ws: getWsEndpointWithApiKey(projectId, apiKey || ''),
          };
        } else {
          const newKey = await createNewApiKey({
            name: specialApiKeyName,
          });

          if (!isConsumerHostError(newKey.data)) {
            return {
              http: getHttpEndpointWithApiKey(deploymentId, newKey.data.value),
              ws: getWsEndpointWithApiKey(projectId, newKey.data.value),
            };
          }
        }
      }
      throw new Error('Failed to get api keys');
    } catch (e) {
      parseError(e, {
        alert: true,
      });
      return {
        http: '',
        ws: '',
      };
    }
  };

  return {
    getConnectUrl,
  };
};

const MyHostedPlan: FC = () => {
  const navigate = useNavigate();
  const {
    updateHostingPlanApi,
    getUserSubscriptions,
    unsubscribeProject,
    getUserHostingPlansByProject,
    loading: consumerHostLoading,
  } = useConsumerHostServices({
    alert: true,
    autoLogin: false,
  });

  const { address: account } = useAccount();
  const { getConnectUrl } = useGetConnectUrl();
  const [currentConnectUrl, setCurrentConnectUrl] = useState({
    http: '',
    ws: '',
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchConnectLoading, setFetchConnectLoading] = useState(false);
  const [expandLoading, setExpandLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<IGetUserSubscription[]>([]);
  const [hostingPlansMap, setHostingPlansMap] = useState<
    Map<number, (IGetHostingPlans & { projectName: string | number })[]>
  >(new Map());
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [currentEditInfo, setCurrentEditInfo] = useState<IGetHostingPlans & { projectName: string | number }>();
  const { getMetadataFromCid } = useProjectMetadata();
  const ref = useRef<CreateHostingFlexPlanRef>(null);

  const initSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getUserSubscriptions();
      if (!isConsumerHostError(res.data)) {
        setSubscriptions(res.data);
      } else {
        setSubscriptions([]);
      }
    } catch (e) {
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostingPlans = async (projectId: number) => {
    try {
      setExpandLoading(true);
      const res = await getUserHostingPlansByProject(projectId);
      if (!isConsumerHostError(res.data)) {
        const allMetadata = await Promise.allSettled(
          res.data.map((i) => {
            const cid = i.project.metadata.startsWith('Qm')
              ? i.project.metadata
              : bytes32ToCid(`0x${i.project.metadata}`);
            return getMetadataFromCid(cid);
          }),
        );

        const plansWithNames = res.data.map((raw, index) => {
          const result = allMetadata[index];
          const name = result.status === 'fulfilled' ? result.value.name : raw.id;
          return {
            ...raw,
            projectName: name,
          };
        });

        setHostingPlansMap((prev) => new Map(prev).set(projectId, plansWithNames));
      }
    } catch (e) {
      parseError(e, { alert: true });
    } finally {
      setExpandLoading(false);
    }
  };

  const handleExpand = async (expanded: boolean, record: IGetUserSubscription) => {
    if (expanded) {
      setExpandedRowKeys((prev) => [...prev, record.project_id]);
      if (!hostingPlansMap.has(record.project_id)) {
        await fetchHostingPlans(record.project_id);
      }
    } else {
      setExpandedRowKeys((prev) => prev.filter((key) => key !== record.project_id));
    }
  };

  const handleUnsubscribe = async (projectId: number) => {
    try {
      setLoading(true);
      const res = await unsubscribeProject(projectId);
      if (!isConsumerHostError(res.data)) {
        message.success('Unsubscribed successfully');
        await initSubscriptions();
        setHostingPlansMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(projectId);
          return newMap;
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const expandedRowRender = (record: IGetUserSubscription) => {
    const plans = hostingPlansMap.get(record.project_id) || [];

    return (
      <Table
        rowKey={(record) => record.id}
        dataSource={plans}
        pagination={false}
        columns={[
          {
            title: 'Plan',
            dataIndex: 'price',
            render: (val: string) => {
              return (
                <Typography>
                  {formatSQT(BigNumberJs(val).multipliedBy(1000).toString())} {TOKEN}/Per 1000 Requests
                </Typography>
              );
            },
          },
          {
            title: 'Maximum Allocated Node operators',
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
                  {formatNumberWithLocale(formatSQT(BigNumberJs(val).toString()))} {TOKEN}
                </Typography>
              );
            },
          },
          {
            title: 'Channel status',
            dataIndex: 'is_actived',
            render: (val: boolean) => {
              return <Tag color={val ? 'success' : 'error'}>{val ? 'Active' : 'Inactive'}</Tag>;
            },
          },
          {
            title: 'Action',
            fixed: 'right',
            dataIndex: 'spent',
            width: 50,
            render: (_, planRecord) => {
              return (
                <div className="flex">
                  <Button
                    loading={fetchConnectLoading}
                    type="text"
                    style={{
                      padding: '6px 10px',
                      background: 'none',
                    }}
                    className="flex-center"
                    onClick={async () => {
                      try {
                        setFetchConnectLoading(true);
                        const url = await getConnectUrl(
                          planRecord.deployment.deployment,
                          numToHex(planRecord.deployment.project_id),
                        );

                        if (!url.http && !url.ws) return;
                        setCurrentEditInfo(planRecord);
                        setCurrentConnectUrl(url);
                        setOpen(true);
                      } finally {
                        setFetchConnectLoading(false);
                      }
                    }}
                  >
                    <Typography.Link type="info" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <LuArrowRightFromLine />
                      Connect
                    </Typography.Link>
                  </Button>

                  <Dropdown
                    menu={{
                      items: [
                        {
                          label: (
                            <Typography.Link type="info" style={{ padding: '6px 10px' }}>
                              View Details
                            </Typography.Link>
                          ),
                          key: 1,
                          onClick: () => {
                            navigate(
                              `/consumer/flex-plans/ongoing/details/${planRecord.id}?id=${planRecord.id}&projectName=${planRecord.projectName}&deploymentId=${planRecord.deployment.deployment}&projectMetadata=${planRecord.project.metadata}`,
                            );
                          },
                        },
                      ],
                    }}
                  >
                    <OutlineDot></OutlineDot>
                  </Dropdown>
                </div>
              );
            },
          },
        ]}
      />
    );
  };

  useEffect(() => {
    if (account) {
      initSubscriptions();
    }
  }, [account]);

  return (
    <div className={styles.myHostedPlan}>
      <Table
        rowKey={(record) => record.project_id}
        style={{ marginTop: 40 }}
        loading={loading || consumerHostLoading || expandLoading}
        dataSource={subscriptions}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: handleExpand,
        }}
        columns={[
          {
            title: 'Project',
            dataIndex: ['project', 'name'],
            render: (name: string, record) => {
              return <DeploymentMeta deploymentId={''} projectMetadata={record?.project?.metadata || ''} />;
            },
          },
          {
            title: 'Auto Latest',
            dataIndex: 'auto_latest',
            render: (val?: boolean) => {
              return <Tag color={val ? 'success' : 'default'}>{val ? 'Yes' : 'No'}</Tag>;
            },
          },
          {
            title: 'Status',
            dataIndex: 'is_active',
            render: (val: boolean) => {
              return <Tag color={val ? 'success' : 'error'}>{val ? 'Active' : 'Inactive'}</Tag>;
            },
          },
          {
            title: 'Action',
            fixed: 'right',
            width: 120,
            render: (_, record) => {
              return (
                <Button type="link" danger onClick={() => handleUnsubscribe(record.project_id)}>
                  Unsubscribe
                </Button>
              );
            },
          },
        ]}
      />

      <CreateHostingFlexPlan
        hideBoard
        edit
        ref={ref}
        id={`${currentEditInfo?.deployment.project_id || ''}`}
        deploymentId={`${currentEditInfo?.deployment.deployment || ''}`}
        editInformation={currentEditInfo}
        onSubmit={async () => {
          if (currentEditInfo) {
            await fetchHostingPlans(currentEditInfo.deployment.project_id);
          }
        }}
      />

      <Modal
        title="Get Endpoint"
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        footer={
          <div className="flex">
            <span style={{ flex: 1 }}></span>

            <Button
              shape="round"
              size="large"
              type="primary"
              onClick={() => {
                navigator.clipboard.writeText(currentConnectUrl.ws || currentConnectUrl.http);
                message.success('Copied!');
                setOpen(false);
              }}
            >
              Copy endpoint and Close
            </Button>
          </div>
        }
        cancelButtonProps={{
          style: {
            display: 'none',
          },
        }}
        width={680}
      >
        <div className="col-flex" style={{ gap: 24 }}>
          <Typography>
            You can now connect to the {currentEditInfo?.projectName} using the following endpoint and API key details
            below
          </Typography>
          <Typography>Your API key (in the URL) should be kept private, never give it to anyone else!</Typography>

          {currentConnectUrl.ws && (
            <Input
              value={currentConnectUrl.ws}
              size="large"
              disabled
              suffix={
                <Copy
                  value={currentConnectUrl.ws}
                  customIcon={<AiOutlineCopy style={{ color: 'var(--sq-blue400)', fontSize: 16, cursor: 'pointer' }} />}
                ></Copy>
              }
            ></Input>
          )}

          {currentConnectUrl.http && (
            <Input
              value={currentConnectUrl.http}
              size="large"
              disabled
              suffix={
                <Copy
                  value={currentConnectUrl.http}
                  customIcon={<AiOutlineCopy style={{ color: 'var(--sq-blue400)', fontSize: 16, cursor: 'pointer' }} />}
                ></Copy>
              }
            ></Input>
          )}

          <div className="col-flex" style={{ gap: 8 }}>
            <Typography variant="medium">Example CURL request</Typography>

            <Input
              value={`curl -H 'content-type:application/json' -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_blockNumber"}' '${currentConnectUrl.http}'`}
              size="large"
              disabled
              suffix={
                <Copy
                  value={`curl -H 'content-type:application/json' -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_blockNumber"}' '${currentConnectUrl.http}'`}
                  customIcon={<AiOutlineCopy style={{ color: 'var(--sq-blue400)', fontSize: 16, cursor: 'pointer' }} />}
                ></Copy>
              }
            ></Input>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default MyHostedPlan;
