// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useState } from 'react';
import { AiOutlineCopy } from 'react-icons/ai';
import Copy from '@components/Copy';
import CreateFlexPlan from '@components/CreateFlexPlan';
import { WalletRoute } from '@components/WalletRoute';
import { useAccount } from '@containers/Web3';
import {
  GetUserApiKeys,
  IGetHostingPlans,
  IGetUserSubscription,
  isConsumerHostError,
  isNotSubscribed,
  useConsumerHostServices,
} from '@hooks/useConsumerHostServices';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { Modal, Spinner, Typography } from '@subql/components';
import { parseError } from '@utils';
import { Button, Input, message, Radio } from 'antd';
import { clsx } from 'clsx';
import { isString } from 'lodash-es';

import styles from './index.module.less';

interface IProps {
  deploymentId: string;
  project: Pick<ProjectDetailsQuery, 'id' | 'metadata' | 'type'>;
  initialOpen?: boolean;
  actionBtn?: React.ReactNode;
}

export const proxyGateway = import.meta.env.VITE_PROXYGATEWAY;

const sponsoredProjects: {
  [key: string]:
    | string
    | {
        http: string;
        ws: string;
      };
} = {
  '0x03': `${proxyGateway}/rpc/eth`,
  '0x04': `${proxyGateway}/rpc/eth`,
  '0x05': `${proxyGateway}/rpc/base`,
  '0x06': `${proxyGateway}/rpc/base`,
  '0x22': `${proxyGateway}/rpc/arbitrum`,
  '0x23': `${proxyGateway}/rpc/arbitrum`,
  '0x24': `${proxyGateway}/rpc/polygon`,
  '0x25': `${proxyGateway}/rpc/polygon`,
  '0x26': `${proxyGateway}/rpc/ethereum-sepolia`,
  '0x27': `${proxyGateway}/rpc/ethereum-sepolia`,
  '0x30': {
    http: `https://polkadot.rpc.subquery.network/public`,
    ws: `wss://polkadot.rpc.subquery.network/public/ws`,
  },
  '0x31': {
    http: `https://kusama.rpc.subquery.network/public`,
    ws: `wss://kusama.rpc.subquery.network/public/ws`,
  },
};

export const specialApiKeyName = 'Get Endpoint Api Key';

export const getHttpEndpointWithApiKey = (deploymentId: string, apiKey: string) =>
  `${proxyGateway}/query/${deploymentId}?apikey=${apiKey}`;

export const getWsEndpointWithApiKey = (projectId: string, apiKey: string) =>
  projectId === '0x30' || projectId === '0x31'
    ? `${proxyGateway.replace('https:', 'wss:')}/${
        {
          '0x30': 'polkadot',
          '0x31': 'kusama',
        }[projectId]
      }-archive/ws?apikey=${apiKey}`
    : '';

const GetEndpoint: FC<IProps> = ({ deploymentId, project, actionBtn, initialOpen = false }) => {
  const { address: account } = useAccount();
  const [open, setOpen] = React.useState(initialOpen);
  const beforeStep = React.useRef<'select' | 'createFlexPlan' | 'checkFree' | 'checkEndpointWithApiKey'>('select');
  const [currentStep, setCurrentStep] = React.useState<
    'select' | 'createFlexPlan' | 'checkFree' | 'checkEndpointWithApiKey'
  >('select');
  const [freeOrFlexPlan, setFreeOrFlexPlan] = React.useState<'free' | 'flexPlan'>('flexPlan');

  const [nextBtnLoading, setNextBtnLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<IGetUserSubscription | null>(null);
  const [userApiKeys, setUserApiKeys] = useState<GetUserApiKeys[]>([]);

  const { getUserSubscriptionByProject, createSubscription, checkIfHasLogin, getUserApiKeysApi, createNewApiKey } =
    useConsumerHostServices({
      alert: false,
      autoLogin: false,
    });

  const hasActiveSubscription = useMemo(() => {
    return currentSubscription?.is_active || false;
  }, [currentSubscription]);

  const createdApiKey = useMemo(() => {
    return userApiKeys.find((key) => key.name === specialApiKeyName);
  }, [userApiKeys]);

  const nextStepBtnText = useMemo(() => {
    if (currentStep === 'select') {
      if (freeOrFlexPlan === 'free') return 'View Free Public Endpoint';
      if (freeOrFlexPlan === 'flexPlan') {
        if (hasActiveSubscription) {
          return 'View Flex Plan Endpoint';
        }
        return 'Subscribe to Project';
      }
    }

    if (currentStep === 'checkFree' || currentStep === 'checkEndpointWithApiKey') return 'Copy endpoint and Close';
    return 'Subscribe to Project';
  }, [freeOrFlexPlan, currentStep, hasActiveSubscription]);

  const httpEndpointWithApiKey = useMemo(() => {
    return getHttpEndpointWithApiKey(deploymentId, createdApiKey?.value || '');
  }, [deploymentId, createdApiKey?.value]);

  const wsEndpointWithApiKey = useMemo(() => {
    return getWsEndpointWithApiKey(project.id, createdApiKey?.value || '');
  }, [project.id, createdApiKey?.value]);

  const stepRender = useMemo(() => {
    if (!account)
      return (
        <WalletRoute
          componentMode
          element=""
          connectWalletStyle={{
            margin: 0,
          }}
        ></WalletRoute>
      );

    const makeEndpointResult = (endpoint: string | { http: string; ws: string }, isFree?: boolean) => {
      const httpEndpoint = isString(endpoint) ? endpoint : endpoint?.http;
      const wsEndpoint = isString(endpoint) ? '' : endpoint?.ws;

      return (
        <div className="col-flex" style={{ gap: 24 }}>
          <Typography>
            You can now connect to the {project.metadata.name} using the following endpoint and API key details below
          </Typography>
          {isFree ? (
            <>
              <Typography>
                The creator of this project has sponsored a free public endpoint. This might be significantly rate
                limited and have no performance or uptime guarantees.
              </Typography>
              <Typography>This endpoint is rate limited to 5 req/s with a daily limit of 5,000 requests.</Typography>
              <Typography>
                By using this free public endpoint, you agree to our{' '}
                <Typography.Link href="https://subquery.foundation/public-rpc-terms" target="_blank" type="info">
                  terms of service.
                </Typography.Link>
              </Typography>
            </>
          ) : (
            <>
              <Typography>Your API key (in the URL) should be kept private, never give it to anyone else!</Typography>
            </>
          )}

          {wsEndpoint && (
            <div className="col-flex" style={{ gap: 8 }}>
              <Typography variant="medium">Websocket Endpoint</Typography>
              <Input
                value={wsEndpoint}
                size="large"
                disabled
                suffix={
                  <Copy
                    value={wsEndpoint}
                    customIcon={
                      <AiOutlineCopy style={{ color: 'var(--sq-blue400)', fontSize: 16, cursor: 'pointer' }} />
                    }
                  ></Copy>
                }
              ></Input>
            </div>
          )}

          {httpEndpoint && (
            <div className="col-flex" style={{ gap: 8 }}>
              <Typography variant="medium">HTTP Endpoint</Typography>
              <Input
                value={httpEndpoint}
                size="large"
                disabled
                suffix={
                  <Copy
                    value={httpEndpoint}
                    customIcon={
                      <AiOutlineCopy style={{ color: 'var(--sq-blue400)', fontSize: 16, cursor: 'pointer' }} />
                    }
                  ></Copy>
                }
              ></Input>
            </div>
          )}

          <div className="col-flex" style={{ gap: 8 }}>
            <Typography variant="medium">Example CURL request</Typography>

            <Input
              value={`curl -H 'content-type:application/json' -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_blockNumber"}' '${httpEndpoint}'
      `}
              size="large"
              disabled
              suffix={
                <Copy
                  value={`curl -H 'content-type:application/json' -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_blockNumber"}' '${httpEndpoint}'
            `}
                  customIcon={<AiOutlineCopy style={{ color: 'var(--sq-blue400)', fontSize: 16, cursor: 'pointer' }} />}
                ></Copy>
              }
            ></Input>
          </div>
        </div>
      );
    };
    return {
      select: (
        <div className="col-flex" style={{ gap: 24 }}>
          <Typography>How would you like to connect to this project deployment?</Typography>

          <div
            className={clsx(styles.radioCard, freeOrFlexPlan === 'free' ? styles.radioCardSelected : '')}
            onClick={() => {
              if (sponsoredProjects[project.id]) {
                setFreeOrFlexPlan('free');
              }
            }}
          >
            <Radio value={'free'} checked={freeOrFlexPlan === 'free'} disabled={!!!sponsoredProjects[project.id]}>
              <Typography weight={500}>Free Public Endpoint</Typography>
            </Radio>
            <Typography variant="medium" style={{ color: 'var(--sq-gray700)' }}>
              The creator of this project has sponsored a free public endpoint. This might be significantly rate limited
              and have no performance or uptime guarantees.
            </Typography>
          </div>

          <div
            className={clsx(styles.radioCard, freeOrFlexPlan === 'flexPlan' ? styles.radioCardSelected : '')}
            onClick={() => {
              setFreeOrFlexPlan('flexPlan');
            }}
          >
            <Radio value={'flexPlan'} checked={freeOrFlexPlan === 'flexPlan'}>
              <Typography weight={500}>Flex Plan</Typography>
            </Radio>
            <Typography variant="medium" style={{ color: 'var(--sq-gray700)' }}>
              Flex plans are pay as you go prices for different levels of requests, they provide a more flexible pricing
              model that requires no up front commitment - unused SQT can be refunded.
            </Typography>
          </div>
        </div>
      ),
      checkFree: makeEndpointResult(sponsoredProjects[project.id], true),
      createFlexPlan: (
        <CreateFlexPlan
          prevApiKey={createdApiKey}
          deploymentId={deploymentId}
          project={project}
          onSuccess={async () => {
            await checkIfHasLogin();
            await fetchSubscriptionAndApiKeys();
            setCurrentStep('checkEndpointWithApiKey');
          }}
          onBack={() => {
            if (beforeStep.current === currentStep) return;
            setCurrentStep(beforeStep.current);
          }}
        ></CreateFlexPlan>
      ),
      checkEndpointWithApiKey: makeEndpointResult({
        http: httpEndpointWithApiKey,
        ws: wsEndpointWithApiKey,
      }),
    }[currentStep];
  }, [freeOrFlexPlan, project, currentStep, deploymentId, account, httpEndpointWithApiKey, wsEndpointWithApiKey]);

  const fetchSubscription = async () => {
    try {
      setNextBtnLoading(true);
      const projectIdNumber = parseInt(project.id.replace('0x', ''), 16);
      const subscriptionRes = await getUserSubscriptionByProject(projectIdNumber);

      if (!isConsumerHostError(subscriptionRes.data)) {
        if (isNotSubscribed(subscriptionRes.data)) {
          // 没有订阅,创建新订阅
          const newSubscription = await createSubscription({ project_id: projectIdNumber });

          if (!isConsumerHostError(newSubscription.data)) {
            setCurrentSubscription(newSubscription.data);
            return { data: newSubscription.data };
          } else {
            setCurrentSubscription(null);
            return { data: null };
          }
        } else {
          // 已有订阅
          setCurrentSubscription(subscriptionRes.data);
          return { data: subscriptionRes.data };
        }
      } else {
        setCurrentSubscription(null);
        return { data: null };
      }
    } catch (e) {
      parseError(e, { alert: true });
      setCurrentSubscription(null);
      return { data: null };
    } finally {
      setNextBtnLoading(false);
    }
  };

  const fetchSubscriptionAndApiKeys = async () => {
    try {
      setNextBtnLoading(true);
      const subscription = await fetchSubscription();

      let apiKeys = await getUserApiKeysApi();
      if (!isConsumerHostError(apiKeys.data)) {
        setUserApiKeys(apiKeys.data);
        if (!apiKeys.data.find((i) => i.name === specialApiKeyName)) {
          await createNewApiKey({
            name: specialApiKeyName,
          });
          apiKeys = await getUserApiKeysApi();
          if (!isConsumerHostError(apiKeys.data)) {
            setUserApiKeys(apiKeys.data);
          }
        }
      }
      return {
        subscription,
        apiKeys,
      };
    } catch (e) {
      parseError(e, {
        alert: true,
      });
      return false;
    } finally {
      setNextBtnLoading(false);
    }
  };

  const handleNextStep = async () => {
    beforeStep.current = currentStep;

    if (currentStep === 'select') {
      if (freeOrFlexPlan === 'free') {
        setCurrentStep('checkFree');
      } else {
        const fetched = await fetchSubscriptionAndApiKeys();

        if (fetched) {
          if (fetched.subscription.data && !isConsumerHostError(fetched.apiKeys.data)) {
            if (
              fetched.apiKeys?.data.find((key) => key.name === specialApiKeyName) &&
              fetched.subscription.data.is_active
            ) {
              setCurrentStep('checkEndpointWithApiKey');
            } else {
              setCurrentStep('createFlexPlan');
            }
          } else {
            setCurrentStep('createFlexPlan');
          }
        }
      }
    }

    if (currentStep === 'checkFree') {
      const publicEndpoint = sponsoredProjects[project.id];
      const copyEndpoint = isString(publicEndpoint) ? publicEndpoint : publicEndpoint?.ws;
      navigator.clipboard.writeText(copyEndpoint);
      message.success('Copied!');
      setOpen(false);
      resetAllField();
    }

    if (currentStep === 'checkEndpointWithApiKey') {
      navigator.clipboard.writeText(wsEndpointWithApiKey ? wsEndpointWithApiKey : httpEndpointWithApiKey);
      message.success('Copied!');
      setOpen(false);
      resetAllField();
    }
  };

  const resetAllField = () => {
    setCurrentStep('select');
    setFreeOrFlexPlan('flexPlan');
    setCurrentSubscription(null);
    setUserApiKeys([]);
    beforeStep.current = 'select';
  };

  // Just refetch when user change the account
  useEffect(() => {
    if (account && open) {
      resetAllField();
      fetchSubscriptionAndApiKeys();
    }
  }, [account]);

  return (
    <div className={styles.getEndpoint}>
      {actionBtn ? (
        <div
          style={{ display: 'inline' }}
          onClick={async () => {
            if (!sponsoredProjects[project.id]) {
              setFreeOrFlexPlan('flexPlan');
              await handleNextStep();
            }
            await fetchSubscription();
            setOpen(true);
          }}
        >
          {nextBtnLoading ? <Spinner size={10}></Spinner> : actionBtn}
        </div>
      ) : (
        <Button
          type="primary"
          shape="round"
          size="large"
          loading={nextBtnLoading}
          onClick={async () => {
            if (!sponsoredProjects[project.id]) {
              setFreeOrFlexPlan('flexPlan');
              await handleNextStep();
            }
            await fetchSubscription();
            setOpen(true);
          }}
        >
          Get Endpoint
        </Button>
      )}

      <Modal
        title="Get Endpoint"
        open={open}
        onCancel={() => {
          setOpen(false);
          resetAllField();
        }}
        className={account ? '' : 'hideModalWrapper'}
        footer={
          currentStep !== 'createFlexPlan' ? (
            <div className="flex">
              {currentStep !== 'select' && (
                <Button
                  shape="round"
                  size="large"
                  onClick={() => {
                    if (beforeStep.current === currentStep) return;
                    setCurrentStep(beforeStep.current);
                  }}
                >
                  Back
                </Button>
              )}
              <span style={{ flex: 1 }}></span>

              <Button shape="round" size="large" type="primary" onClick={handleNextStep} loading={nextBtnLoading}>
                {nextStepBtnText}
              </Button>
            </div>
          ) : (
            ''
          )
        }
        cancelButtonProps={{
          style: {
            display: 'none',
          },
        }}
        width={680}
      >
        {stepRender}
      </Modal>
    </div>
  );
};
export default GetEndpoint;
