// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo, useState } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import TokenTooltip from '@components/TokenTooltip/TokenTooltip';
import { useSQToken } from '@containers';
import { SQT_TOKEN_ADDRESS } from '@containers/Web3';
import { IPostHostingPlansParams, useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { Steps, Typography } from '@subql/components';
import { formatSQT, useAsyncMemo } from '@subql/react-hooks';
import { TOKEN, tokenDecimals } from '@utils';
import { Button, Divider, Form, InputNumber, Radio } from 'antd';
import BigNumberJs from 'bignumber.js';
import clsx from 'clsx';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import styles from './index.module.less';

interface IProps {
  project: ProjectDetailsQuery;
  deploymentId: string;
  onNext?: () => void;
  onBack?: () => void;
}

const converFlexPlanPrice = (price: string) => {
  return BigNumberJs(formatUnits(price, tokenDecimals[SQT_TOKEN_ADDRESS])).multipliedBy(1000);
};

const CreateFlexPlan: FC<IProps> = ({ deploymentId, project, onBack }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'economy' | 'performance' | 'custom'>('economy');
  const [form] = Form.useForm<IPostHostingPlansParams>();
  const [depositForm] = Form.useForm<{ amount: string }>();
  const priceValue = Form.useWatch<number>('price', form);
  const { consumerHostBalance, balance } = useSQToken();

  const [depositBalance] = useMemo(() => consumerHostBalance.result.data ?? [], [consumerHostBalance.result.data]);

  const { getProjects } = useConsumerHostServices({
    alert: true,
    autoLogin: false,
  });

  const flexPlans = useAsyncMemo(async () => {
    try {
      const res = await getProjects({
        projectId: BigNumber.from(project.id).toString(),
        deployment: deploymentId,
      });

      if (res.data?.indexers?.length) {
        return res.data.indexers;
      }
    } catch (e) {
      return [];
    }
  }, [project.id, deploymentId]);

  const estimatedPriceInfo = useMemo(() => {
    if (!flexPlans.data || flexPlans.data.length === 0) {
      return {
        economy: BigNumberJs(0),
        performance: BigNumberJs(0),
      };
    }

    // ASC
    const sortedFlexPlans = flexPlans.data.map((i) => converFlexPlanPrice(i.price)).sort((a, b) => (a.lt(b) ? -1 : 1));
    const maxPrice = sortedFlexPlans.at(-1);

    // if less than 3, both economy and performance should be the highest price
    if (flexPlans.data?.length <= 3) {
      return {
        economy: maxPrice,
        performance: maxPrice,
      };
    }

    if (flexPlans.data?.length <= 5) {
      return {
        economy: sortedFlexPlans[2],
        performance: maxPrice,
      };
    }

    const economyIndex = Math.ceil(flexPlans.data.length * 0.4) < 2 ? 2 : Math.ceil(flexPlans.data.length * 0.4);
    const performanceIndex = Math.ceil(flexPlans.data.length * 0.8) < 4 ? 4 : Math.ceil(flexPlans.data.length * 0.8);

    return {
      economy: sortedFlexPlans[economyIndex],
      performance: sortedFlexPlans[performanceIndex],
    };
  }, [flexPlans]);

  const matchedCount = React.useMemo(() => {
    if (!priceValue || !flexPlans.data?.length) return `Matched indexers: 0`;
    const count = flexPlans.data.filter((i) => {
      const prices1000 = converFlexPlanPrice(i.price);
      return prices1000.lte(priceValue);
    }).length;
    return `Matched indexers: ${count}`;
  }, [priceValue, flexPlans]);

  const enoughReq = useMemo(() => {
    const priceVal = priceValue || (form.getFieldsValue(true)['price'] as string);
    if (!priceVal || depositBalance?.eq(0) || !depositBalance) return 0;

    return BigNumberJs(formatSQT(depositBalance.toString()))
      .div(BigNumberJs(priceVal.toString()))
      .multipliedBy(1000)
      .toNumber()
      .toLocaleString();
  }, [depositBalance, priceValue, form, currentStep]);

  const nextBtnText = useMemo(() => {
    if (currentStep === 0) {
      return 'Next';
    }
    if (currentStep === 1) return 'Deposit SQT';
    return 'Next';
  }, [currentStep]);

  const handleNextStep = async () => {
    if (currentStep === 0) {
      if (!selectedPlan) return;
      if (selectedPlan !== 'custom') {
        form.setFieldValue('price', estimatedPriceInfo[selectedPlan]?.toString());
        form.setFieldValue('maximum', selectedPlan === 'economy' ? 8 : 15);
      } else {
        await form.validateFields();
        form.setFieldValue('maximum', form.getFieldValue('maximum') || 2);
      }

      setCurrentStep(1);
    }

    if (currentStep === 1) {
      await depositForm.validateFields();
      setCurrentStep(2);
    }
  };

  return (
    <div className={styles.createFlexPlan}>
      <Steps
        current={currentStep}
        steps={[
          {
            title: 'Create Flex Plan',
          },
          {
            title: 'Deposit to Billing Account',
          },
          {
            title: 'Confirm',
          },
        ]}
      ></Steps>

      {currentStep === 0 && (
        <>
          <Typography>
            SubQuery will automatically allocate qualified indexers to your endpoint based on price and performance.
            Please select the type of plan you would like (you can change this later).
          </Typography>

          <div
            className={clsx(styles.radioCard, selectedPlan === 'economy' ? styles.radioCardSelected : '')}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            onClick={() => {
              setSelectedPlan('economy');
            }}
          >
            <div className="col-flex" style={{ gap: 8 }}>
              <Radio value={'free'} checked={selectedPlan === 'economy'}>
                <Typography weight={500}>Economy</Typography>
              </Radio>
              <Typography variant="medium" style={{ color: 'var(--sq-gray700)', maxWidth: 450 }}>
                We will set a lower cost limit which means less Node Operators will provide data to you, which may
                result in lower reliability and lower global performance. Best for use cases where cost is more
                important than reliability/performance.
              </Typography>
            </div>

            <div className="col-flex" style={{ alignItems: 'flex-end' }}>
              <Typography weight={600} variant="large" style={{ color: 'var(--sq-blue400)' }}>
                {estimatedPriceInfo.economy?.toFixed(2)} {TOKEN}
              </Typography>
              <Typography variant="medium">Per 1000 reqs</Typography>
            </div>
          </div>

          <div
            className={clsx(styles.radioCard, selectedPlan === 'performance' ? styles.radioCardSelected : '')}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            onClick={() => {
              setSelectedPlan('performance');
            }}
          >
            <div className="col-flex" style={{ gap: 8 }}>
              <Radio value={'free'} checked={selectedPlan === 'performance'}>
                <Typography weight={500}>Performance</Typography>
              </Radio>
              <Typography variant="medium" style={{ color: 'var(--sq-gray700)', maxWidth: 450 }}>
                We will set a higher cost limit which means more Node Operators will provide data to you, which
                generally results in higher reliability and higher global performance. Best for production use cases
                where reliability/performance is more important than cost.
              </Typography>
            </div>
            <div className="col-flex" style={{ alignItems: 'flex-end' }}>
              <Typography weight={600} variant="large" style={{ color: 'var(--sq-blue400)' }}>
                {estimatedPriceInfo.performance?.toFixed(2)} {TOKEN}
              </Typography>
              <Typography variant="medium">Per 1000 reqs</Typography>
            </div>
          </div>

          <div
            className={clsx(styles.radioCard, selectedPlan === 'custom' ? styles.radioCardSelected : '')}
            onClick={() => {
              setSelectedPlan('custom');
              if (selectedPlan !== 'custom') {
                form.resetFields();
              }
            }}
          >
            <Radio value={'free'} checked={selectedPlan === 'custom'}>
              <Typography weight={500}>Or enter a custom price (advanced users only)</Typography>
            </Radio>
            {selectedPlan === 'custom' && (
              <>
                <Typography variant="medium" style={{ color: 'var(--sq-gray700)', maxWidth: 450 }}>
                  Please enter a custom price, and an optional limit
                </Typography>

                <Form layout="vertical" className={styles.createFlexPlanModal} form={form}>
                  <Form.Item
                    label={
                      <Typography style={{ marginTop: 24 }}>
                        Maximum Price
                        <AiOutlineInfoCircle
                          style={{ fontSize: 14, marginLeft: 6, color: 'var(--sq-gray500)' }}
                        ></AiOutlineInfoCircle>
                      </Typography>
                    }
                    name="price"
                    rules={[{ required: true }]}
                  >
                    <InputNumber placeholder="Enter price" min="1" addonAfter={TOKEN}></InputNumber>
                  </Form.Item>
                  <Typography variant="medium" style={{ color: 'var(--sq-gray700)' }}>
                    Per 1000 requests
                  </Typography>
                  <Form.Item
                    label={
                      <Typography style={{ marginTop: 24 }}>
                        Maximum Allocated Node Operators
                        <AiOutlineInfoCircle
                          style={{ fontSize: 14, marginLeft: 6, color: 'var(--sq-gray500)' }}
                        ></AiOutlineInfoCircle>
                      </Typography>
                    }
                    name="maximum"
                  >
                    <InputNumber placeholder="Enter maximum allocated Node Operators" min="2"></InputNumber>
                  </Form.Item>
                  <Typography variant="medium" style={{ color: 'var(--sq-gray700)' }}>
                    {matchedCount}
                  </Typography>
                </Form>
              </>
            )}
          </div>
        </>
      )}

      {currentStep === 1 && (
        <>
          <Typography>
            Every wallet has a Billing Account where you must deposit SQT that you authorise SubQuery to deduct for Flex
            Plan payments. If this Billing Account runs out of SQT, your Flex plan will automatically be cancelled and
            your endpoint may stop working.
          </Typography>
          <Typography>
            You can easily withdraw unused SQT from this Billing Account at any time without any unlocking period.
          </Typography>
          <Typography>
            We recommend ensuring that there is sufficient SQT in your billing account so that you don’t run out
            unexpectedly.
          </Typography>

          <div
            className={clsx(styles.radioCard, styles.radioCardSelected)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', background: '#4388DD14' }}
          >
            <div className="col-flex">
              <Typography>Your selected plan:</Typography>

              <Typography style={{ textTransform: 'capitalize' }} weight={500}>
                {selectedPlan}
              </Typography>
            </div>
            <div className="col-flex" style={{ alignItems: 'flex-end' }}>
              <Typography weight={600} variant="large" style={{ color: 'var(--sq-blue400)' }}>
                {form.getFieldValue('price')} {TOKEN}
              </Typography>
              <Typography variant="medium">Per 1000 reqs</Typography>
            </div>
          </div>
          <Divider style={{ margin: 0 }}></Divider>
          <div className="col-flex" style={{ gap: 8 }}>
            {depositBalance?.eq(0) || !depositBalance ? (
              <>
                <Typography>You must deposit SQT to open this billing account</Typography>
                <Typography variant="medium" type="secondary">
                  You must deposit SQT to create this flex plan
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
                  This is enough to pay for {enoughReq} requests
                </Typography>
              </>
            )}
          </div>

          <Form layout="vertical" className={styles.createFlexPlanModal} form={depositForm}>
            <Form.Item label={<Typography>Deposit amount</Typography>} name="amount" rules={[{ required: true }]}>
              <InputNumber
                placeholder="Enter amount"
                min="500"
                addonAfter={
                  <div className="flex" style={{ gap: 8 }}>
                    <img src="/static/sqtoken.png" alt=""></img>
                    {TOKEN}
                  </div>
                }
              ></InputNumber>
            </Form.Item>
          </Form>

          <div className="col-flex" style={{ alignItems: 'flex-end' }}>
            <Typography variant="medium">Minimum deposit amount: 500 {TOKEN}</Typography>

            <Typography variant="medium">
              Wallet Balance:{' '}
              {BigNumberJs(formatSQT(balance.result.data?.toString() || '0'))
                .toNumber()
                .toLocaleString()}{' '}
              SQT <TokenTooltip></TokenTooltip>
            </Typography>
          </div>
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
        {currentStep === 1 && depositBalance?.gt(0) && (
          <Button
            shape="round"
            size="large"
            onClick={() => {
              setCurrentStep(1);
            }}
            style={{ marginRight: 12 }}
          >
            Skip without depositing more {TOKEN}
          </Button>
        )}
        <Button shape="round" size="large" type="primary" onClick={handleNextStep} loading={flexPlans.loading}>
          {nextBtnText}
        </Button>
      </div>
    </div>
  );
};
export default CreateFlexPlan;
