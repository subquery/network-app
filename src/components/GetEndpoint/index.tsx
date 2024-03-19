// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo, useState } from 'react';
import { AiOutlineCopy } from 'react-icons/ai';
import Copy from '@components/Copy';
import CreateFlexPlan from '@components/CreateFlexPlan';
import {
  GetUserApiKeys,
  IGetHostingPlans,
  isConsumerHostError,
  useConsumerHostServices,
} from '@hooks/useConsumerHostServices';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { Modal, Typography } from '@subql/components';
import { parseError } from '@utils';
import { Button, Input, message, Radio } from 'antd';
import { clsx } from 'clsx';
import { useAccount } from 'wagmi';

import styles from './index.module.less';

interface IProps {
  deploymentId: string;
  project: Pick<ProjectDetailsQuery, 'id'>;
}

export const proxyGateway = import.meta.env.VITE_PROXYGATEWAY;

const sponsoredProjects: {
  [key: string]: string;
} = {
  '0x03': `${proxyGateway}/rpc/eth`,
  '0x04': `${proxyGateway}/rpc/eth`,
  '0x05': `${proxyGateway}/rpc/base`,
  '0x06': `${proxyGateway}/rpc/base`,
};

export const specialApiKeyName = 'Get Endpoint Api Key';

const GetEndpoint: FC<IProps> = ({ deploymentId, project }) => {
  const { address: account } = useAccount();
  const [open, setOpen] = React.useState(false);
  const beforeStep = React.useRef<'select' | 'createFlexPlan' | 'checkFree' | 'checkEndpointWithApiKey'>('select');
  const [currentStep, setCurrentStep] = React.useState<
    'select' | 'createFlexPlan' | 'checkFree' | 'checkEndpointWithApiKey'
  >('select');
  const [freeOrFlexPlan, setFreeOrFlexPlan] = React.useState<'free' | 'flexPlan'>('flexPlan');

  const [nextBtnLoading, setNextBtnLoading] = useState(false);
  const [userHostingPlan, setUserHostingPlan] = useState<IGetHostingPlans[]>([]);
  const [userApiKeys, setUserApiKeys] = useState<GetUserApiKeys[]>([]);

  const { getHostingPlanApi, checkIfHasLogin, getUserApiKeysApi } = useConsumerHostServices({
    alert: false,
    autoLogin: false,
  });

  const createdHostingPlan = useMemo(() => {
    return userHostingPlan.find((plan) => plan.deployment.deployment === deploymentId && plan.is_actived);
  }, [userHostingPlan]);

  const createdApiKey = useMemo(() => {
    return userApiKeys.find((key) => key.name === specialApiKeyName);
  }, [userApiKeys]);

  const nextStepBtnText = useMemo(() => {
    if (currentStep === 'select') {
      if (freeOrFlexPlan === 'free') return 'View Free Public Endpoint';
      if (freeOrFlexPlan === 'flexPlan') return 'Create Flex Plan';
    }

    if (currentStep === 'checkFree' || currentStep === 'checkEndpointWithApiKey') return 'Copy Endpoint and Close';
    return 'Create Flex Plan';
  }, [freeOrFlexPlan, currentStep]);

  const fetchHostingPlanAndApiKeys = async () => {
    try {
      setNextBtnLoading(true);
      const hostingPlan = await getHostingPlanApi({
        account,
      });
      if (!isConsumerHostError(hostingPlan.data)) {
        setUserHostingPlan(hostingPlan.data);
      }

      const apiKeys = await getUserApiKeysApi();
      if (!isConsumerHostError(apiKeys.data)) {
        setUserApiKeys(apiKeys.data);
      }
      return {
        hostingPlan,
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
        const fetched = await fetchHostingPlanAndApiKeys();

        if (fetched) {
          if (!isConsumerHostError(fetched.hostingPlan.data) && !isConsumerHostError(fetched.apiKeys.data)) {
            if (
              fetched.apiKeys?.data.find((key) => key.name === specialApiKeyName) &&
              fetched.hostingPlan?.data.find((plan) => plan.deployment.deployment === deploymentId && plan.is_actived)
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
      navigator.clipboard.writeText(sponsoredProjects[project.id]);
      message.success('Copied!');
      setOpen(false);
      resetAllField();
    }

    if (currentStep === 'checkEndpointWithApiKey') {
      navigator.clipboard.writeText(`${proxyGateway}/query/${deploymentId}?apiKey=${createdApiKey?.value}`);
      message.success('Copied!');
      setOpen(false);
      resetAllField();
    }
  };

  const stepRender = useMemo(() => {
    const makeEndpointResult = (endpoint: string, isFree?: boolean) => (
      <div className="col-flex" style={{ gap: 24 }}>
        <Typography>You can now connect to the Arbitrum Archive Node using the following Endpoint below</Typography>
        {isFree ? (
          <>
            <Typography>
              The creator of this project has sponsored a free public endpoint. This might be significantly rate limited
              and have no performance or uptime guarantees.
            </Typography>
            <Typography>This endpoint is rate limited to 5 req/s with a daily limit of 5,000 requests.</Typography>
            <Typography>
              By using this free public endpoint, you agree to our{' '}
              <Typography.Link href="https://subquery.foundation/public-rpc-terms" target="_blank" active>
                terms of service.
              </Typography.Link>
            </Typography>
          </>
        ) : (
          <>
            <Typography>Your API key (in the URL) should be kept private, never give it to anyone else!</Typography>
          </>
        )}
        <Input
          value={endpoint}
          size="large"
          disabled
          suffix={
            <Copy
              value={endpoint}
              customIcon={<AiOutlineCopy style={{ color: 'var(--sq-blue400)', fontSize: 16, cursor: 'pointer' }} />}
            ></Copy>
          }
        ></Input>

        <div className="col-flex" style={{ gap: 8 }}>
          <Typography variant="medium">Example CURL request</Typography>

          <Input
            value={`curl -H 'content-type:application/json' -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_blockNumber"}' '${endpoint}'
      `}
            size="large"
            disabled
            suffix={
              <Copy
                value={`curl -H 'content-type:application/json' -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_blockNumber"}' '${endpoint}'
            `}
                customIcon={<AiOutlineCopy style={{ color: 'var(--sq-blue400)', fontSize: 16, cursor: 'pointer' }} />}
              ></Copy>
            }
          ></Input>
        </div>
      </div>
    );
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
              Flex plans are pay as you go prices for different levels of requests, they provides a more flexible
              pricing model that requires no up front commitment - unused SQT can be refunded.
            </Typography>
          </div>
        </div>
      ),
      checkFree: makeEndpointResult(sponsoredProjects[project.id], true),
      createFlexPlan: (
        <CreateFlexPlan
          prevHostingPlan={createdHostingPlan}
          prevApiKey={createdApiKey}
          deploymentId={deploymentId}
          project={project}
          onSuccess={async () => {
            await checkIfHasLogin();
            await fetchHostingPlanAndApiKeys();
            setCurrentStep('checkEndpointWithApiKey');
          }}
          onBack={() => {
            if (beforeStep.current === currentStep) return;
            setCurrentStep(beforeStep.current);
          }}
        ></CreateFlexPlan>
      ),
      checkEndpointWithApiKey: makeEndpointResult(
        `${proxyGateway}/query/${deploymentId}?apiKey=${createdApiKey?.value}`,
      ),
    }[currentStep];
  }, [freeOrFlexPlan, project, currentStep, deploymentId]);

  const resetAllField = () => {
    setCurrentStep('select');
    setFreeOrFlexPlan('flexPlan');
    beforeStep.current = 'select';
  };

  return (
    <div className={styles.getEndpoint}>
      <Button
        type="primary"
        shape="round"
        size="large"
        onClick={() => {
          setOpen(true);
        }}
      >
        Get RPC Endpoint
      </Button>

      <Modal
        title="Get Endpoint"
        open={open}
        onCancel={() => {
          setOpen(false);
          resetAllField();
        }}
        footer={
          // it's kind of chaos, but I don't want to handle the action out of the component.
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
