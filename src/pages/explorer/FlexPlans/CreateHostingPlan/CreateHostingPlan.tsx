// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BsExclamationCircle } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import { BillingExchangeModal } from '@components/BillingTransferModal';
import { useSQToken } from '@containers';
import { SQT_TOKEN_ADDRESS, useWeb3 } from '@containers/Web3';
import { useAsyncMemo, useProjectFromQuery, useRouteQuery } from '@hooks';
import {
  IGetHostingPlans,
  IPostHostingPlansParams,
  isConsumerHostError,
  useConsumerHostServices,
} from '@hooks/useConsumerHostServices';
import { Modal, openNotification, Steps, Typography } from '@subql/components';
import { convertStringToNumber, formatEther, TOKEN, tokenDecimals } from '@utils';
import { Button, Divider, Form, InputNumber, Tooltip } from 'antd';
import { BigNumber } from 'ethers';
import { formatUnits, parseEther } from 'ethers/lib/utils';
import { t } from 'i18next';

import styles from './index.module.less';

const CreateHostingFlexPlan: FC = (props) => {
  const { account } = useWeb3();
  const { consumerHostBalance } = useSQToken();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = useRouteQuery();
  const { getProjects, createHostingPlanApi, getHostingPlanApi, hasLogin } = useConsumerHostServices({
    alert: true,
    autoLogin: false,
  });

  const asyncProject = useProjectFromQuery(id ?? '');

  const [form] = Form.useForm<IPostHostingPlansParams>();
  const priceValue = Form.useWatch<number>('price', form);

  const [showCreateFlexPlan, setShowCreateFlexPlan] = React.useState(false);

  const [createdHostingPlan, setCreatedHostingPlan] = React.useState<IGetHostingPlans[]>([]);

  const flexPlans = useAsyncMemo(async () => {
    try {
      if (!hasLogin) return [];
      const res = await getProjects({
        projectId: BigNumber.from(id).toString(),
        deployment: query.get('deploymentId') || undefined,
      });

      if (res.data?.indexers?.length) {
        return res.data.indexers;
      }
    } catch (e) {
      return [];
    }
  }, [id, query]);

  const matchedCount = React.useMemo(() => {
    if (!priceValue || !flexPlans.data?.length) return `Matched indexers: 0`;
    const count = flexPlans.data.filter((i) => {
      const prices1000 = convertStringToNumber(formatUnits(i.price, tokenDecimals[SQT_TOKEN_ADDRESS])) * 1000;
      return prices1000 <= priceValue;
    }).length;
    return `Matched indexers: ${count}`;
  }, [priceValue, flexPlans]);

  const haveCreatedHostingPlan = React.useMemo(() => {
    const checkHaveCreated = (hostingPlans: IGetHostingPlans[]) =>
      !!hostingPlans.find((i) => i.deployment.deployment === asyncProject.data?.deploymentId);
    return {
      haveCreated: checkHaveCreated(createdHostingPlan),
      checkHaveCreated,
    };
  }, [createdHostingPlan, asyncProject]);

  const [balance] = consumerHostBalance.data ?? [];

  const createHostingPlan = async () => {
    await form.validateFields();
    if (!asyncProject.data?.deploymentId) return;
    const created = await getHostingPlans();

    if (!created) return;
    if (created && haveCreatedHostingPlan.checkHaveCreated(created)) {
      setShowCreateFlexPlan(false);
      return;
    }

    const res = await createHostingPlanApi({
      ...form.getFieldsValue(),
      // default set as one era.
      expiration: flexPlans?.data?.sort((a, b) => b.max_time - a.max_time)[0].max_time || 3600 * 24 * 7,
      price: parseEther(`${form.getFieldValue('price')}`)
        .div(1000)
        .toString(),
      deploymentId: asyncProject.data.deploymentId,
    });

    if (res.data.id) {
      await getHostingPlans();
      openNotification({
        type: 'success',
        description: 'Create success',
      });

      setShowCreateFlexPlan(false);
    }
  };

  const getHostingPlans = async () => {
    if (!hasLogin) return;
    const res = await getHostingPlanApi();
    if (!isConsumerHostError(res.data)) {
      setCreatedHostingPlan(res.data);
      return res.data;
    }
  };

  React.useEffect(() => {
    getHostingPlans();
  }, [account]);

  return (
    <>
      <div className={styles.billingCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="col-flex">
            <div className="flex">
              <Typography variant="text" type="secondary">
                {t('flexPlans.billBalance').toUpperCase()}
              </Typography>

              <Tooltip
                overlay={t('flexPlans.billingAccountTooltip', {
                  token: TOKEN,
                })}
              >
                <BsExclamationCircle style={{ marginLeft: '8px', color: 'var(--sq-gray500)' }}></BsExclamationCircle>
              </Tooltip>
            </div>

            <Typography variant="h6" style={{ marginTop: '12px' }}>
              {`${formatEther(balance, 4)} ${TOKEN}`}
            </Typography>
          </div>
          <Button type="primary" shape="round" size="large" className={styles.billingButton}>
            {t('flexPlans.deposit')}
            <div style={{ opacity: 0, position: 'absolute', left: 0, top: 0 }}>
              <BillingExchangeModal action="Transfer" />
            </div>
          </Button>
        </div>
        <Divider style={{ margin: '16px 0' }}></Divider>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/static/thumb.svg"
            alt=""
            style={{ alignSelf: 'flex-start', height: '100%', marginRight: 8, marginTop: 3 }}
          ></img>
          <div className="col-flex">
            <Typography variant="text" weight={500}>
              {t('flexPlans.flexPlan')}
            </Typography>
            <Typography variant="text" type="secondary">
              {t('flexPlans.flexPlanDesc')}
            </Typography>
          </div>
          <span style={{ flex: 1 }}></span>
          {haveCreatedHostingPlan.haveCreated ? (
            <Typography
              style={{ color: 'var(--sq-blue600)', cursor: 'pointer' }}
              onClick={() => {
                navigate(`/consumer/flex-plans?deploymentCid=${asyncProject.data?.deploymentId}`);
              }}
            >
              View My Flex Plan
            </Typography>
          ) : (
            <Button
              type="primary"
              shape="round"
              size="large"
              className={styles.billingButton}
              onClick={() => {
                setShowCreateFlexPlan(true);
              }}
              disabled={formatEther(balance, 4) === '0.0'}
            >
              {t('flexPlans.createFlexPlan')}
            </Button>
          )}
        </div>
      </div>
      <Modal
        open={showCreateFlexPlan}
        submitText="Create"
        onSubmit={async () => {
          await createHostingPlan();
        }}
        onCancel={() => {
          setShowCreateFlexPlan(false);
        }}
      >
        <div>
          <Steps
            steps={[
              {
                title: 'Create',
              },
              {
                title: 'Confirm Create',
              },
            ]}
            current={0}
          ></Steps>
          <Typography style={{ marginTop: 48 }}>
            SubQuery host will help to allocate the qualified indexers for you to ensure your query experience. After
            creating, you can check and manage your Flex Plan in ‘My Flex Plan’ page under Consumer.
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
                  Maximum Allocated Indexers
                  <AiOutlineInfoCircle
                    style={{ fontSize: 14, marginLeft: 6, color: 'var(--sq-gray500)' }}
                  ></AiOutlineInfoCircle>
                </Typography>
              }
              name="maximum"
              rules={[{ required: true }]}
            >
              <InputNumber placeholder="Enter maximum allocated indexers" min="2"></InputNumber>
            </Form.Item>
            <Typography variant="medium" style={{ color: 'var(--sq-gray700)' }}>
              {matchedCount}
            </Typography>
          </Form>
        </div>
      </Modal>
    </>
  );
};
export default CreateHostingFlexPlan;
