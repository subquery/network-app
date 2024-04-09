// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineCopy } from 'react-icons/ai';
import { LuArrowRightFromLine } from 'react-icons/lu';
import { useNavigate } from 'react-router';
import { Copy } from '@components';
import { proxyGateway, specialApiKeyName } from '@components/GetEndpoint';
import { useProjectMetadata } from '@containers';
import { GetUserApiKeys, IGetHostingPlans, useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { isConsumerHostError } from '@hooks/useConsumerHostServices';
import CreateHostingFlexPlan, {
  CreateHostingFlexPlanRef,
} from '@pages/explorer/FlexPlans/CreateHostingPlan/CreateHostingPlan';
import { Modal, Tag, Typography } from '@subql/components';
import { bytes32ToCid } from '@subql/network-clients';
import { formatSQT } from '@subql/react-hooks';
import { parseError, TOKEN } from '@utils';
import { Button, Input, message, Table } from 'antd';
import BigNumberJs from 'bignumber.js';
import { useAccount } from 'wagmi';

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

  const getConnectUrl = async (deploymentId: string) => {
    try {
      if (createdApiKey) {
        return `${proxyGateway}/query/${deploymentId}?apikey=${createdApiKey?.value}`;
      }

      const res = await getUserApiKeysApi();
      if (!isConsumerHostError(res.data)) {
        setUserApiKeys(res.data);
        if (res.data.find((key) => key.name === specialApiKeyName)) {
          return `${proxyGateway}/query/${deploymentId}?apikey=${
            res.data.find((key) => key.name === specialApiKeyName)?.value
          }`;
        } else {
          const newKey = await createNewApiKey({
            name: specialApiKeyName,
          });

          if (!isConsumerHostError(newKey.data)) {
            return `${proxyGateway}/query/${deploymentId}?apikey=${newKey.data.value}`;
          }
        }
      }
      throw new Error('Failed to get api keys');
    } catch (e) {
      parseError(e, {
        alert: true,
      });
      return '';
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
  const [currentConnectUrl, setCurrentConnectUrl] = useState('');
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
                  {formatSQT(BigNumberJs(val).toString())} {TOKEN}
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
            width: 450,
            render: (_, record) => {
              return (
                <div className="flex">
                  <Button
                    loading={fetchConnectLoading}
                    type="text"
                    style={{
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: 'var(--sq-blue600)',
                      fontSize: 16,
                      background: 'none',
                    }}
                    onClick={async () => {
                      try {
                        setFetchConnectLoading(true);
                        const url = await getConnectUrl(record.deployment.deployment);
                        if (!url) return;
                        setCurrentEditInfo(record);

                        setCurrentConnectUrl(url);
                        setOpen(true);
                      } finally {
                        setFetchConnectLoading(false);
                      }
                    }}
                  >
                    <LuArrowRightFromLine />
                    Connect
                  </Button>
                  <Typography
                    style={{ color: 'var(--sq-blue600)', padding: '6px 10px' }}
                    onClick={() => {
                      navigate(
                        `/consumer/flex-plans/ongoing/details/${record.id}?id=${record.id}&projectName=${record.projectName}&deploymentId=${record.deployment.deployment}`,
                      );
                    }}
                  >
                    View Details
                  </Typography>
                  <Typography
                    style={{ color: 'var(--sq-blue600)', padding: '6px 10px' }}
                    onClick={() => {
                      setCurrentEditInfo(record);
                      ref.current?.showModal();
                    }}
                  >
                    {record.price === '0' ? 'Restart' : 'Update'}
                  </Typography>

                  <Typography
                    style={{
                      color: record.price === '0' ? 'var(--sq-gray400)' : 'var(--sq-error)',
                      padding: '6px 10px',
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
                navigator.clipboard.writeText(currentConnectUrl);
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

          <Input
            value={currentConnectUrl}
            size="large"
            disabled
            suffix={
              <Copy
                value={currentConnectUrl}
                customIcon={<AiOutlineCopy style={{ color: 'var(--sq-blue400)', fontSize: 16, cursor: 'pointer' }} />}
              ></Copy>
            }
          ></Input>

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
