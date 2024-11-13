// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineCopy } from 'react-icons/ai';
import { LuArrowRightFromLine } from 'react-icons/lu';
import { useNavigate } from 'react-router';
import Copy from '@components/Copy';
import {
  getHttpEndpointWithApiKey,
  getWsEndpointWithApiKey,
  proxyGateway,
  specialApiKeyName,
} from '@components/GetEndpoint';
import { OutlineDot } from '@components/Icons/Icons';
import { useProjectMetadata } from '@containers';
import { useAccount } from '@containers/Web3';
import { GetUserApiKeys, IGetHostingPlans, useConsumerHostServices } from '@hooks/useConsumerHostServices';
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
    getHostingPlanApi,
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
  const [createdHostingPlan, setCreatedHostingPlan] = useState<(IGetHostingPlans & { projectName: string | number })[]>(
    [],
  );
  const [currentEditInfo, setCurrentEditInfo] = useState<IGetHostingPlans & { projectName: string | number }>();
  const { getMetadataFromCid } = useProjectMetadata();
  const ref = useRef<CreateHostingFlexPlanRef>(null);
  const init = async () => {
    try {
      setLoading(true);

      const res = await getHostingPlanApi({
        account,
      });
      const allMetadata = await Promise.allSettled(
        res.data.map((i) => {
          const cid = i.project.metadata.startsWith('Qm')
            ? i.project.metadata
            : bytes32ToCid(`0x${i.project.metadata}`);
          return getMetadataFromCid(cid);
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
    } catch (e) {
      setCreatedHostingPlan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      init();
    }
  }, [account]);

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
            width: 150,
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
            render: (_, record) => {
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
                          record.deployment.deployment,
                          numToHex(record.deployment.project_id),
                        );
                        if (!url) return;
                        setCurrentEditInfo(record);

                        setCurrentConnectUrl(url);
                        setOpen(true);
                      } finally {
                        setFetchConnectLoading(false);
                      }
                    }}
                  >
                    <Typography.Link type="info" className="flex-center" style={{ gap: 4 }}>
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
                              `/consumer/flex-plans/ongoing/details/${record.id}?id=${record.id}&projectName=${record.projectName}&deploymentId=${record.deployment.deployment}`,
                            );
                          },
                        },
                        {
                          label: (
                            <Typography.Link type="info" style={{ padding: '6px 10px' }}>
                              {record.price === '0' ? 'Restart' : 'Update'}
                            </Typography.Link>
                          ),
                          key: 2,
                          onClick: () => {
                            setCurrentEditInfo(record);
                            ref.current?.showModal();
                          },
                        },
                        {
                          label: (
                            <Typography.Link
                              type={record.price === '0' ? 'default' : 'danger'}
                              style={{
                                padding: '6px 10px',
                              }}
                            >
                              Stop
                            </Typography.Link>
                          ),
                          key: 3,
                          onClick: async () => {
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
              value={`curl -H 'content-type:application/json' -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_blockNumber"}' '${currentConnectUrl}'`}
              size="large"
              disabled
              suffix={
                <Copy
                  value={`curl -H 'content-type:application/json' -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_blockNumber"}' '${currentConnectUrl}'`}
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
