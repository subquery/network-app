// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { specialApiKeyName } from '@components/GetEndpoint';
import { ApproveContract } from '@components/ModalApproveToken';
import TokenTooltip from '@components/TokenTooltip/TokenTooltip';
import { useSQToken } from '@containers';
import { useAccount } from '@containers/Web3';
import { useAddAllowance } from '@hooks/useAddAllowance';
import {
  GetUserApiKeys,
  IGetUserSubscription,
  isConsumerHostError,
  useConsumerHostServices,
} from '@hooks/useConsumerHostServices';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { useSqtPrice } from '@hooks/useSqtPrice';
import { Steps, Typography } from '@subql/components';
import { formatSQT, useAsyncMemo, useGetDeploymentBoosterTotalAmountByDeploymentIdQuery } from '@subql/react-hooks';
import { parseError, TOKEN, tokenDecimals } from '@utils';
import { Button, Checkbox, Divider, Form, InputNumber, Tooltip } from 'antd';
import BigNumberJs from 'bignumber.js';
import clsx from 'clsx';
import { parseEther } from 'ethers/lib/utils';

import { useWeb3Store } from 'src/stores';

import styles from './index.module.less';

interface IProps {
  project: Pick<ProjectDetailsQuery, 'id' | 'type'>;
  deploymentId: string;
  prevApiKey?: GetUserApiKeys;
  prevSubscription?: IGetUserSubscription;
  onSuccess?: () => void;
  onBack?: () => void;
}

// TODO: split the component to smaller components
const CreateFlexPlan: FC<IProps> = ({ deploymentId, project, prevSubscription, prevApiKey, onSuccess, onBack }) => {
  const { address: account } = useAccount();
  const { contracts } = useWeb3Store();
  const [depositForm] = Form.useForm<{ amount: string }>();
  const depositAmount = Form.useWatch<number>('amount', depositForm);
  const { consumerHostAllowance, consumerHostBalance, balance } = useSQToken();
  const { addAllowance } = useAddAllowance();
  const sqtPrice = useSqtPrice();

  const mounted = useRef(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [nextBtnLoading, setNextBtnLoading] = useState(false);
  const [displayTransactions, setDisplayTransactions] = useState<
    ('allowance' | 'deposit' | 'createApiKey' | 'subscribe')[]
  >([]);
  const [transacitonNumbers, setTransactionNumbers] = useState<{ [key in string]: number }>({
    allowance: 1,
    deposit: 2,
    createApiKey: 3,
    subscribe: 4,
  });
  const [transactionStep, setTransactionStep] = useState<
    'allowance' | 'deposit' | 'createApiKey' | 'subscribe' | undefined
  >('allowance');

  const deploymentBooster = useGetDeploymentBoosterTotalAmountByDeploymentIdQuery({
    variables: {
      deploymentId: deploymentId || '',
      consumer: account || '',
    },
    fetchPolicy: 'network-only',
  });

  const [depositBalance] = useMemo(() => consumerHostBalance.result.data ?? [], [consumerHostBalance.result.data]);

  const { createNewApiKey, createSubscription, getUserApiKeysApi, refreshUserInfo, getChannelLimit } =
    useConsumerHostServices({
      alert: true,
      autoLogin: false,
    });

  const estimatedChannelLimit = useAsyncMemo(async () => {
    try {
      const res = await getChannelLimit();

      if (!isConsumerHostError(res.data)) {
        return {
          channelMaxNum: res.data.channel_max_num,
          channelMinAmount: res.data.channel_min_amount,
          channelMinExpiration: res.data.channel_min_days * 3600 * 24,
        };
      }

      return {
        channelMaxNum: 15,
        channelMinAmount: 33.33333,
        channelMinExpiration: 3600 * 24 * 14,
      };
    } catch (e) {
      return {
        channelMaxNum: 15,
        channelMinAmount: 33.33333,
        channelMinExpiration: 3600 * 24 * 14,
      };
    }
  }, []);

  const depositRequireFromConsumerHost = useMemo(() => {
    if (!estimatedChannelLimit.data) return 400;
    return Math.ceil(estimatedChannelLimit.data?.channelMaxNum * estimatedChannelLimit.data?.channelMinAmount);
  }, [estimatedChannelLimit]);

  const minDeposit = useMemo(() => {
    return 10000;
  }, [depositRequireFromConsumerHost, depositBalance]);

  const needAddAllowance = useMemo(() => {
    const allowance = consumerHostAllowance.result.data;
    if (allowance?.eq(0) && depositAmount && depositAmount !== 0) return true;
    return BigNumberJs(formatSQT(allowance?.toString() || '0'))?.lt(depositAmount || 0);
  }, [depositAmount, consumerHostAllowance.result.data]);

  const needDepositMore = useMemo(() => {
    if (!depositAmount) return false;
    return true;
  }, [depositAmount]);

  const needCreateApiKey = useMemo(() => !prevApiKey, [prevApiKey]);

  const needSubscribe = useMemo(() => !prevSubscription, [prevSubscription]);

  const nextBtnText = useMemo(() => {
    if (currentStep === 0) return 'Next';

    if (currentStep === 1) {
      if (!displayTransactions.length) return 'Subscribe to Project';

      if (transactionStep) {
        const currentStepNumber = transacitonNumbers[transactionStep];

        return `Approve Transaction ${currentStepNumber}${
          currentStepNumber === displayTransactions.length ? ' and Subscribe' : ''
        }`;
      }

      return 'Subscribe to Project';
    }
    return 'Next';
  }, [currentStep, displayTransactions, transacitonNumbers, transactionStep]);

  const suggestDeposit = useMemo(() => {
    return depositRequireFromConsumerHost.toLocaleString();
  }, [depositRequireFromConsumerHost]);

  const renderTransactionDisplay = useMemo(() => {
    const allowanceDom = (index: number) => {
      return (
        <div
          key={'allowance'}
          className={clsx(
            styles.radioCard,
            transactionStep === 'allowance' ? styles.radioCardSelected : '',
            !needAddAllowance ? styles.radioCardSelectedWithBackgroud : '',
          )}
          style={{ flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <div className="col-flex" style={{ gap: 8 }}>
            <Typography className="flex-center" weight={500}>
              {!needAddAllowance && <Checkbox checked></Checkbox>}
              {index}. Authorise Billing Permissions
            </Typography>
            <Typography variant="medium" type="secondary">
              This grants permission for SubQuery to manage your Billing Account automatically to pay node operators for
              charges incurred in this Flex Plan
            </Typography>
          </div>
        </div>
      );
    };

    const depositDom = (index: number) => {
      return (
        <div
          key={'deposit'}
          className={clsx(
            styles.radioCard,
            transactionStep === 'deposit' ? styles.radioCardSelected : '',
            !needDepositMore ? styles.radioCardSelectedWithBackgroud : '',
          )}
          style={{ flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <div className="col-flex" style={{ gap: 8 }}>
            <Typography className="flex-center" weight={500}>
              {!needDepositMore && <Checkbox checked></Checkbox>}
              {index}. Deposit Funds to Billing Account
            </Typography>
            <Typography variant="medium" type="secondary">
              This is a transaction to deposit {depositForm.getFieldsValue(true)['amount'] || '0'} SQT into your
              personal Billing Account from your wallet balance.
            </Typography>
          </div>
        </div>
      );
    };

    const createApiKeysDom = (index: number) => {
      return (
        <div
          key={'createApiKey'}
          className={clsx(
            styles.radioCard,
            transactionStep === 'createApiKey' ? styles.radioCardSelected : '',
            !needCreateApiKey ? styles.radioCardSelectedWithBackgroud : '',
          )}
          style={{ flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <div className="col-flex" style={{ gap: 8 }}>
            <Typography className="flex-center" weight={500}>
              {!needCreateApiKey && <Checkbox checked></Checkbox>}
              {index}. Create Personal API Key
            </Typography>
            <Typography variant="medium" type="secondary">
              This is a transaction to open a state channel and generate a personal API key for your account to secure
              your Flex Plan endpoint
            </Typography>
          </div>
        </div>
      );
    };

    const subscribeDom = (index: number) => {
      return (
        <div
          key={'subscribe'}
          className={clsx(
            styles.radioCard,
            transactionStep === 'subscribe' ? styles.radioCardSelected : '',
            !needSubscribe ? styles.radioCardSelectedWithBackgroud : '',
          )}
          style={{ flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <div className="col-flex" style={{ gap: 8 }}>
            <Typography className="flex-center" weight={500}>
              {!needSubscribe && <Checkbox checked></Checkbox>}
              {index}. Subscribe to Project
            </Typography>
            <Typography variant="medium" type="secondary">
              Subscribe to this project to get access to the Flex Plan endpoint
            </Typography>
          </div>
        </div>
      );
    };

    const dicts: { [key in string]: (index: number) => React.ReactNode } = {
      allowance: allowanceDom,
      deposit: depositDom,
      createApiKey: createApiKeysDom,
      subscribe: subscribeDom,
    };

    return displayTransactions.map((i, index) => {
      return dicts[i](index + 1);
    });
  }, [
    displayTransactions,
    transactionStep,
    needCreateApiKey,
    needAddAllowance,
    needDepositMore,
    needSubscribe,
    depositForm,
  ]);

  const handleNextStep = async (options?: { skipDeposit?: boolean }) => {
    if (currentStep === 0) {
      const { skipDeposit = false } = options || {};
      if (!skipDeposit) {
        await depositForm.validateFields();
      } else {
        depositForm.resetFields();
      }

      // make sure use this order.
      const newDisplayTransactions = [];
      if (needAddAllowance && !skipDeposit) {
        newDisplayTransactions.push('allowance');
      }
      if (depositForm.getFieldValue('amount') > 0) {
        newDisplayTransactions.push('deposit');
      }
      if (needCreateApiKey) {
        newDisplayTransactions.push('createApiKey');
      }
      if (needSubscribe) {
        newDisplayTransactions.push('subscribe');
      }
      if (newDisplayTransactions.includes('allowance')) {
        setTransactionStep('allowance');
      } else if (newDisplayTransactions.includes('deposit')) {
        setTransactionStep('deposit');
      } else if (newDisplayTransactions.includes('createApiKey')) {
        setTransactionStep('createApiKey');
      } else {
        setTransactionStep('subscribe');
      }

      // @ts-ignore
      setDisplayTransactions(newDisplayTransactions);

      setTransactionNumbers(
        newDisplayTransactions.reduce(
          (acc, cur, index) => {
            acc[cur] = index + 1;
            return acc;
          },
          {} as { [key in string]: number },
        ),
      );
      setCurrentStep(1);
    }

    if (currentStep === 1) {
      setNextBtnLoading(true);
      const getNextStepAndSet = (transactionName: 'allowance' | 'deposit' | 'createApiKey' | 'subscribe') => {
        const index = displayTransactions.findIndex((i) => i === transactionName) + 1;
        if (index < displayTransactions.length) {
          // @ts-ignore
          setTransactionStep(displayTransactions[index]);
        } else {
          setTransactionStep(undefined);
        }
      };
      try {
        if (needAddAllowance) {
          setTransactionStep('allowance');
          await addAllowance(ApproveContract.ConsumerHost, parseEther(depositAmount?.toString() || '0').toString());
          await consumerHostAllowance.refetch();

          getNextStepAndSet('allowance');
          return;
        }

        if (needDepositMore) {
          setTransactionStep('deposit');
          const tx = await contracts?.consumerHost.deposit(parseEther(depositAmount?.toString() || '0'), true);
          await tx?.wait();
          await consumerHostBalance.refetch();
          await consumerHostAllowance.refetch();

          depositForm.setFieldValue('amount', 0);
          getNextStepAndSet('deposit');

          const currentStepNumber = transacitonNumbers['deposit'];

          if (currentStepNumber !== displayTransactions.length) {
            return;
          }
        }

        if (needCreateApiKey) {
          setTransactionStep('createApiKey');
          // in case user create an api key at another tab, and back to this page to continue.
          const checkApiKeys = await getUserApiKeysApi();

          if (isConsumerHostError(checkApiKeys.data)) {
            throw new Error(checkApiKeys.data.error);
          }

          if (!checkApiKeys.data?.find((i) => i.name === specialApiKeyName)) {
            const apiKeyRes = await createNewApiKey({
              name: specialApiKeyName,
            });
            if (isConsumerHostError(apiKeyRes.data)) {
              throw new Error(apiKeyRes.data.error);
            }
          }

          getNextStepAndSet('createApiKey');

          const currentStepNumber = transacitonNumbers['createApiKey'];

          if (currentStepNumber !== displayTransactions.length) {
            return;
          }
        }

        if (needSubscribe) {
          setTransactionStep('subscribe');

          const projectIdNumber = parseInt(project.id.replace('0x', ''), 16);
          const subscriptionRes = await createSubscription({
            project_id: projectIdNumber,
          });

          if (isConsumerHostError(subscriptionRes.data)) {
            throw new Error(subscriptionRes.data.error);
          }

          getNextStepAndSet('subscribe');
        }

        try {
          await refreshUserInfo();
        } catch (e) {
          // don't care of this
        }

        await onSuccess?.();
      } catch (e) {
        parseError(e, {
          alert: true,
        });
      } finally {
        setNextBtnLoading(false);
      }
    }
  };

  const estimatedUs = (sqtAmount: string) => {
    return BigNumberJs(sqtPrice).multipliedBy(BigNumberJs(sqtAmount)).toNumber().toFixed(4);
  };

  // Just refetch when user change the account
  useEffect(() => {
    if (account && mounted.current) {
      consumerHostAllowance.refetch();
      consumerHostBalance.refetch();
      balance.refetch();
      setDisplayTransactions([]);
      setTransactionStep('allowance');
    } else {
      mounted.current = true;
    }
  }, [account]);

  return (
    <div className={styles.createFlexPlan}>
      <Steps
        current={currentStep}
        steps={[
          {
            title: 'Deposit to Billing Account',
          },
          {
            title: 'Confirm',
          },
        ]}
      ></Steps>

      <div className="col-flex" style={{ gap: 24, display: currentStep === 0 ? 'flex' : 'none' }}>
        <Typography>
          Every wallet has a Billing Account where you must deposit SQT that you authorise SubQuery to deduct for Flex
          Plan payments. If this Billing Account runs out of SQT, your Flex plan will automatically be cancelled and
          your endpoint may stop working.
        </Typography>
        <Typography>
          You can easily withdraw unused SQT from this Billing Account at any time without any unlocking period.
        </Typography>
        <Typography>
          We recommend ensuring that there is sufficient SQT in your billing account so that you don&apos;t run out
          unexpectedly.
        </Typography>

        <Divider style={{ margin: 0 }}></Divider>
        <div className="col-flex" style={{ gap: 8 }}>
          {depositBalance?.eq(0) || !depositBalance ? (
            <>
              <Typography>You must deposit SQT to open this billing account</Typography>
              <Typography variant="medium" type="secondary">
                You must deposit SQT to subscribe to this project, we suggest {suggestDeposit} {TOKEN}
              </Typography>
            </>
          ) : (
            <>
              <Typography>
                Your existing billing account balance:{' '}
                {BigNumberJs(formatSQT(depositBalance.toString() || '0'))
                  .toNumber()
                  .toLocaleString()}{' '}
                {TOKEN}
              </Typography>
              <Typography variant="medium" type="secondary">
                We suggest depositing at least {suggestDeposit} {TOKEN}
              </Typography>
            </>
          )}
        </div>

        <Form
          layout="vertical"
          initialValues={{
            amount: 0,
          }}
          className={styles.createFlexPlanModal}
          form={depositForm}
        >
          <Form.Item
            label={<Typography>Deposit amount</Typography>}
            name="amount"
            rules={[
              {
                type: 'number',
                required: true,
                min: minDeposit,
                message: `The minimum deposit can not be less than ${minDeposit.toLocaleString()} SQT`,
              },
              {
                validator: (_, value) => {
                  return BigNumberJs(value).gt(formatSQT(balance.result.data?.toString() || '0'))
                    ? Promise.reject('Insufficient amount')
                    : Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              placeholder="Enter amount"
              addonAfter={
                <div className="flex" style={{ gap: 8 }}>
                  <img src="/static/sqtoken.png" alt="" width={32}></img>
                  {TOKEN}
                </div>
              }
            ></InputNumber>
          </Form.Item>
        </Form>

        <div className="col-flex" style={{ alignItems: 'flex-end' }}>
          <Typography variant="medium">
            Minimum deposit amount: {minDeposit.toLocaleString()} {TOKEN}
          </Typography>

          <Typography variant="medium">
            Wallet Balance:{' '}
            {BigNumberJs(formatSQT(balance.result.data?.toString() || '0'))
              .toNumber()
              .toLocaleString()}{' '}
            SQT <TokenTooltip></TokenTooltip>
          </Typography>
        </div>
      </div>

      {currentStep === 1 && (
        <>
          {displayTransactions.length ? (
            <Typography>
              You must now approve {displayTransactions.length > 1 ? 'a few transactions' : 'a transaction'} using your
              connected wallet to subscribe to this project. You must approve all transactions in order to complete the
              subscription.
            </Typography>
          ) : (
            ''
          )}

          <Typography>
            Flex plans incur a small fee of 1% of SQT to maintain and manage state channels with each Node Operator.
          </Typography>

          {renderTransactionDisplay}
        </>
      )}

      <div className="flex">
        <Button
          shape="round"
          size="large"
          onClick={() => {
            if (currentStep === 0) {
              onBack?.();
            } else {
              setCurrentStep(currentStep - 1);
            }
          }}
        >
          Back
        </Button>
        <span style={{ flex: 1 }}></span>
        {currentStep === 0 &&
        !BigNumberJs(
          deploymentBooster.data?.deploymentBoosterSummariesByConsumer?.aggregates?.sum?.totalAmount.toString() || '0',
        ).isZero() ? (
          <Button
            shape="round"
            size="large"
            onClick={() => {
              handleNextStep({
                skipDeposit: true,
              });
            }}
            style={{ marginRight: 12 }}
          >
            Skip without depositing more {TOKEN}
          </Button>
        ) : (
          ''
        )}
        <Button shape="round" size="large" type="primary" onClick={() => handleNextStep()} loading={nextBtnLoading}>
          {nextBtnText}
        </Button>
      </div>
    </div>
  );
};
export default CreateFlexPlan;
