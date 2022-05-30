// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { parseEther } from '@ethersproject/units';
import { Button, Spinner, Typography } from '@subql/react-ui';
import assert from 'assert';
import { Formik, Form } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import clsx from 'clsx';
import { InputNumber, Select, TableProps, Radio, Table } from 'antd';
import * as yup from 'yup';
import { constants } from 'ethers';
import TransactionModal from '../../../../components/TransactionModal';
import { useContracts, usePlanTemplates, useWeb3 } from '../../../../containers';
import {
  cidToBytes32,
  convertBigNumberToNumber,
  getCapitalizedStr,
  mapAsync,
  notEmpty,
  renderAsync,
} from '../../../../utils';
import { GetPlanTemplates_planTemplates_nodes as Template } from '../../../../__generated__/registry/GetPlanTemplates';
import { SummaryList, TableText } from '../../../../components';
import { useSortedIndexerDeployments } from '../../../../hooks';
import styles from './Create.module.css';
import { secondsToDhms } from '../../../../utils/dateFormatters';

const getPlanTemplateColumns = (
  onChooseTemplate: (templateId: string, idx: number) => void,
  selectedTemplateId?: string,
): TableProps<Template>['columns'] => [
  {
    title: '#',
    dataIndex: 'id',
    render: (_: string, __: Template, idx: number) => <TableText content={idx + 1} />,
  },
  {
    dataIndex: 'period',
    title: i18next.t('plans.headers.period').toUpperCase(),
    render: (period: string) => <TableText content={secondsToDhms(convertBigNumberToNumber(period))} />,
  },
  {
    dataIndex: 'dailyReqCap',
    title: i18next.t('plans.headers.dailyReqCap').toUpperCase(),
    render: (dailyReqCap: string) => (
      <TableText content={i18next.t('plans.default.query', { count: convertBigNumberToNumber(dailyReqCap) })} />
    ),
  },
  {
    dataIndex: 'rateLimit',
    title: i18next.t('plans.headers.rateLimit').toUpperCase(),
    render: (rateLimit: string) => (
      <TableText content={`${convertBigNumberToNumber(rateLimit)} ${i18next.t('plans.default.requestPerMin')}`} />
    ),
  },
  {
    title: i18next.t('plans.headers.rateLimit').toUpperCase(),
    dataIndex: 'id',
    render: (id: string, _: Template, idx: number) => (
      <Radio onClick={() => onChooseTemplate(id, idx)} checked={id === selectedTemplateId} />
    ),
  },
];

const planSchema = yup.object({
  price: yup.number().defined(),
  templateId: yup.string().defined(),
  deploymentId: yup.string().optional(),
});

type PlanFormData = yup.Asserts<typeof planSchema>;

type FormProps = {
  templates: Array<Template>;
  onSubmit: (data: PlanFormData) => void | Promise<void>;
  onCancel: () => void;
  curStep: number;
  onStepChange: (step: number) => void;
  error?: string;
};

const PlanForm: React.VFC<FormProps> = ({ templates, onSubmit, onCancel, curStep, onStepChange, error }) => {
  const { t } = useTranslation();
  const [selectedTemplateIdx, setSelectedTemplateIdx] = React.useState<number>(0);
  const { account } = useWeb3();
  const indexerDeployments = useSortedIndexerDeployments(account ?? '');

  const template = templates[selectedTemplateIdx];

  const summaryList = [
    {
      label: t('plans.headers.period'),
      value: secondsToDhms(convertBigNumberToNumber(template.period)),
    },
    {
      label: t('plans.headers.dailyReqCap'),
      value: ` ${template.dailyReqCap} queries`,
    },
    {
      label: t('plans.headers.rateLimit'),
      value: ` ${template.rateLimit} queries/min`,
    },
  ];

  return (
    <Formik
      initialValues={{
        price: 0,
        templateId: template.id,
        deploymentId: '',
      }}
      validationSchema={planSchema}
      onSubmit={onSubmit}
    >
      {({ submitForm, isValid, isSubmitting, setFieldValue, values }) => {
        const selectedTemplateId = values.templateId;

        // First step: choose planTemplate
        if (curStep === 0) {
          const onChooseTemplate = (templateId: string, idx: number) => {
            setSelectedTemplateIdx(idx);
            setFieldValue('templateId', templateId);
          };
          const columns = getPlanTemplateColumns(onChooseTemplate, selectedTemplateId);
          return (
            <Form>
              <div className={styles.templateList}>
                <Table
                  columns={columns}
                  dataSource={templates}
                  rowKey={'id'}
                  pagination={false}
                  className={styles.marginSpace}
                  onRow={(record, rowIndex) => {
                    return {
                      onClick: () => rowIndex && onChooseTemplate(record?.id, rowIndex),
                    };
                  }}
                />
              </div>

              <div className={`${styles.marginSpace} flex-end`}>
                <Button
                  label={getCapitalizedStr(t('general.next'))}
                  onClick={() => onStepChange(1)}
                  loading={isSubmitting}
                  disabled={!isValid}
                  colorScheme="standard"
                />
              </div>
            </Form>
          );
        }

        // Second step: summary and create plan
        return (
          <Form>
            <div>
              <SummaryList title={t('plans.create.description')} list={summaryList} />

              {/* TODO: InputNumber extract component */}
              <div className={'fullWidth'}>
                <Typography className={styles.inputTitle}>{t('plans.create.priceTitle')} </Typography>
                <InputNumber
                  id="price"
                  name="price"
                  addonAfter="SQT"
                  defaultValue={0}
                  min={0}
                  onChange={(value) => setFieldValue('price', value)}
                  className={'fullWidth'}
                />
              </div>

              {/* TODO: renderItem style */}
              <div className={styles.select}>
                <Typography className={styles.inputTitle}>{'Select specific deployment Id'} </Typography>
                <Select
                  id="deploymentId"
                  placeholder="Select specific deployment Id"
                  optionFilterProp="children"
                  onChange={(deploymentId) => setFieldValue('deploymentId', deploymentId)}
                  className={clsx('fullWidth', 'flex')}
                  loading={indexerDeployments.loading}
                  size="large"
                  allowClear
                  // TODO
                  // onSearch={onSearch}
                  // filterOption={() => {}}
                >
                  {renderAsync(indexerDeployments, {
                    error: (error) => <Typography>{`Failed to get deployment info: ${error.message}`}</Typography>,
                    loading: () => <Spinner />,
                    data: (data) => (
                      <>
                        {data?.map((indexerDeployments) => (
                          <Select.Option value={indexerDeployments.deployment?.id} key={indexerDeployments?.id}>
                            <div>
                              <Typography
                                className={styles.projectName}
                              >{`${indexerDeployments.projectName}`}</Typography>
                              <Typography
                                className={styles.projectDeploymentId}
                              >{`Deployment ID: ${indexerDeployments.deployment?.id}`}</Typography>
                            </div>
                          </Select.Option>
                        ))}
                      </>
                    ),
                  })}
                </Select>
              </div>

              <Typography className={'errorText'}>{error}</Typography>
              <div className={clsx('flex-between', styles.btns)}>
                <Button
                  label={t('general.back')}
                  onClick={() => onStepChange(0)}
                  disabled={isSubmitting}
                  type="secondary"
                  colorScheme="neutral"
                  className={styles.btn}
                />
                <div className={clsx('flex')}>
                  <Button
                    label={t('plans.create.cancel')}
                    onClick={onCancel}
                    disabled={isSubmitting}
                    type="secondary"
                    colorScheme="neutral"
                    className={styles.btn}
                  />
                  <Button
                    label={t('plans.create.submit')}
                    onClick={submitForm}
                    loading={isSubmitting}
                    disabled={!isValid}
                    colorScheme="standard"
                  />
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export const Create: React.FC = () => {
  const { t } = useTranslation();
  const [curStep, setCurStep] = React.useState<number>(0);
  const pendingContracts = useContracts();
  const templates = usePlanTemplates({});

  const handleCreate = async (amount: string, templateId: string, deploymentId?: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    if (!templates || templates.error) {
      throw templates.error;
    }

    return contracts.planManager.createPlan(
      parseEther(amount),
      templateId,
      deploymentId ? cidToBytes32(deploymentId) : constants.HashZero,
    );
  };

  return (
    <TransactionModal
      actions={[{ label: t('plans.create.title'), key: 'create' }]}
      text={{
        title: t('plans.create.title'),
        steps: ['Choose template', t('plans.create.step1'), t('indexer.confirmOnMetamask')],
        failureText: t('plans.create.failureText'),
      }}
      currentStep={curStep}
      onClick={(params: PlanFormData) => handleCreate(params.price.toString(), params.templateId, params.deploymentId)}
      onClose={() => setCurStep(0)}
      renderContent={(onSubmit, onCancel, isLoading, error) =>
        renderAsync(
          mapAsync((d) => d.planTemplates?.nodes.filter(notEmpty), templates),
          {
            error: (e) => <Typography>{`Failed to get plan template: ${e.message}`}</Typography>,
            loading: () => <Spinner />,
            data: (templates) => {
              if (!templates || templates?.length <= 0) {
                return <Typography>No template found</Typography>;
              }

              return (
                <PlanForm
                  templates={templates}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                  error={error}
                  curStep={curStep}
                  onStepChange={setCurStep}
                />
              );
            },
          },
        )
      }
    />
  );
};
