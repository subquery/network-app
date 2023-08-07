// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { BillingExchangeModal } from '@components/BillingTransferModal';
import { SQT_TOKEN_ADDRESS } from '@containers/Web3';
import { IGetHostingPlans, IPostHostingPlansParams, useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Modal, openNotification, Steps, TableTitle, Typography } from '@subql/components';
import { renderAsync } from '@subql/react-hooks';
import { Button, Divider, Form, InputNumber, Space, Table, TableProps } from 'antd';
import { BigNumber } from 'ethers';
import { formatUnits, parseEther } from 'ethers/lib/utils';
import i18next from 'i18next';

import { AppTypography, EmptyList, Spinner, TableText } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useSQToken } from '../../../containers';
import { IIndexerFlexPlan, useIndexerFlexPlans, useProjectFromQuery } from '../../../hooks';
import {
  convertStringToNumber,
  formatEther,
  formatSecondsDuration,
  getFlexPlanPrice,
  ROUTES,
  TOKEN,
  tokenDecimals,
} from '../../../utils';
import styles from './FlexPlans.module.less';

type Data<T> = T | undefined;

function checkIfPurchased(openPlans: Data<any>, plan: IIndexerFlexPlan): boolean | undefined {
  if (openPlans?.stateChannels?.nodes) {
    return openPlans.stateChannels?.nodes?.some(
      (openPlan: { indexer: string }) => openPlan?.indexer.toLowerCase() === plan.indexer,
    );
  }
}

// TODO: confirm score threadThread with consumer host service
const getColumns = (): TableProps<IIndexerFlexPlan>['columns'] => [
  {
    dataIndex: 'indexer',
    title: <TableTitle>{i18next.t('explorer.flexPlans.indexer')}</TableTitle>,
    render: (indexer, indexerFlexPlans) => {
      return (
        <Space className="flex">
          <div className={styles.starContainer}>
            {indexerFlexPlans.score >= 150 && <BsStarFill className={styles.star} />}
          </div>
          <ConnectedIndexer id={indexer} />
        </Space>
      );
    },
  },
  {
    dataIndex: 'price',
    title: <TableTitle>{i18next.t('general.price')}</TableTitle>,
    render: (price) => <TableText content={getFlexPlanPrice(price)} />,
  },
  {
    dataIndex: 'max_time',
    title: <TableTitle>{i18next.t('flexPlans.validityPeriod')}</TableTitle>,
    render: (max) => <TableText>{formatSecondsDuration(max)}</TableText>,
  },
];

export const FlexPlans: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { consumerHostBalance } = useSQToken();
  const { createHostingPlanApi, getHostingPlanApi } = useConsumerHostServices({ alert: true, autoLogin: false });
  const flexPlans = useIndexerFlexPlans(BigNumber.from(id).toString());
  const asyncProject = useProjectFromQuery(id ?? '');

  const [form] = Form.useForm<IPostHostingPlansParams>();
  const priceValue = Form.useWatch<number>('price', form);

  const [tokenSym] = React.useState(import.meta.env.VITE_TOKEN);
  const [showCreateFlexPlan, setShowCreateFlexPlan] = React.useState(false);
  // TODO: part2
  // const [createdHostingPlan, setCreatedHostingPlan] = React.useState<IGetHostingPlans[]>([]);

  const matchedCount = React.useMemo(() => {
    if (!priceValue || !flexPlans.data?.length) return `Matched indexers: 0`;
    const count = flexPlans.data.filter((i) => {
      const prices1000 = convertStringToNumber(formatUnits(i.price, tokenDecimals[SQT_TOKEN_ADDRESS])) * 1000;
      return prices1000 <= priceValue;
    }).length;
    return `Matched indexers: ${count}`;
  }, [priceValue, flexPlans]);

  const [balance] = consumerHostBalance.data ?? [];

  const createHostingPlan = async () => {
    await form.validateFields();
    const res = await createHostingPlanApi({
      ...form.getFieldsValue(),
      // default set as one era.
      expiration: flexPlans?.data?.sort((a, b) => b.max_time - a.max_time)[0].max_time || 3600 * 24 * 7,
      price: parseEther(`${form.getFieldValue('price')}`).toString(),
      deploymentId: asyncProject.data?.currentDeployment,
    });

    if (res.data.id) {
      openNotification({
        type: 'success',
        description: 'Create success',
      });

      setShowCreateFlexPlan(false);
    }
  };

  // const getHostingPlans = async () => {
  //   const res = await getHostingPlanApi();
  //   if (res.data) {
  //     setCreatedHostingPlan(res.data);
  //   }
  // };

  React.useEffect(() => {
    if (!id) {
      navigate(ROUTES.EXPLORER);
    }
  }, [navigate, id]);

  // React.useEffect(() => {
  //   getHostingPlans();
  // }, []);

  return (
    <>
      {renderAsync(flexPlans, {
        loading: () => <Spinner />,
        error: (e) => <AppTypography type="danger">{'Failed to load flex plan.'}</AppTypography>,
        data: (flexPlans) => {
          if (!flexPlans.length) return <EmptyList description={'explorer.flexPlans.non'} />;
          return (
            <>
              {
                <div className={styles.billingCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="text" type="secondary">
                        {t('flexPlans.billBalance').toUpperCase()}
                      </Typography>

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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="text" weight={500}>
                        {t('flexPlans.flexPlan')}
                      </Typography>
                      <Typography variant="text" type="secondary">
                        {t('flexPlans.flexPlanDesc')}
                      </Typography>
                    </div>
                    <span style={{ flex: 1 }}></span>
                    <Button
                      type="primary"
                      shape="round"
                      size="large"
                      className={styles.billingButton}
                      onClick={() => {
                        setShowCreateFlexPlan(true);
                      }}
                    >
                      {t('flexPlans.createFlexPlan')}
                    </Button>
                  </div>
                </div>
              }
              <Table columns={getColumns()} dataSource={flexPlans} rowKey={'id'} />
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
                    SubQuery host will help to allocate the qualified indexers for you to ensure your query experience.
                    After creating, you can check and manage your Flex Plan in ‘My Flex Plan’ page under Consumer.
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
                      <InputNumber placeholder="Enter price" min="1" addonAfter={tokenSym}></InputNumber>
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
        },
      })}
    </>
  );
};
