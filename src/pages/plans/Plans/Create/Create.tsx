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
import { Select, TableProps, Radio, Table } from 'antd';
import * as yup from 'yup';
import { constants } from 'ethers';
import TransactionModal from '@components/TransactionModal';
import { useContracts, useWeb3 } from '@containers';
import {
  cidToBytes32,
  convertBigNumberToNumber,
  convertStringToNumber,
  getCapitalizedStr,
  mapAsync,
  notEmpty,
  renderAsync,
} from '@utils';
import { PlanTemplateFieldsFragment as PlanTemplate } from '@subql/network-query';
import { SummaryList, TableText } from '@components';
import { useSortedIndexerDeployments } from '@hooks';
import styles from './Create.module.css';
import { formatSecondsDuration } from '@utils/dateFormatters';
import { NumberInput } from '@components/NumberInput';
import { useGetPlanTemplatesQuery } from '@subql/react-hooks';
import { TableTitle } from '@subql/components';

export const getPlanTemplateColumns = (
  onChooseTemplate: (templateId: string, idx: number, template: PlanTemplate) => void,
  selectedTemplateId?: string,
): TableProps<PlanTemplate>['columns'] => [
  {
    title: <TableTitle title={'#'} />,
    dataIndex: 'id',
    render: (idx: number) => <TableText content={idx + 1} />,
  },
  {
    dataIndex: 'period',
    title: i18next.t('plans.headers.period').toUpperCase(),
    render: (period: string) => <TableText content={formatSecondsDuration(convertStringToNumber(period))} />,
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
    title: i18next.t('general.choose').toUpperCase(),
    dataIndex: 'id',
    render: (id: string, template: PlanTemplate, idx: number) => (
      <Radio onClick={() => onChooseTemplate(id, idx, template)} checked={id === selectedTemplateId} />
    ),
  },
];

const ChooseTemplateStep = ({
  selectedTemplateId,
  onChooseTemplate,
  templates,
  onNextStep,
  disabled,
}: {
  selectedTemplateId: string;
  onChooseTemplate: (templateId: string, idx: number) => void;
  onNextStep?: () => void;
  templates: Array<PlanTemplate>;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
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
              onClick: () => rowIndex !== undefined && onChooseTemplate(record?.id, rowIndex),
            };
          }}
        />
      </div>

      <div className={`${styles.marginSpace} flex-end`}>
        <Button
          label={getCapitalizedStr(t('general.next'))}
          onClick={onNextStep}
          disabled={disabled}
          colorScheme="standard"
          className="button"
        />
      </div>
    </Form>
  );
};

const DeploymentIdOptions = ({ onChooseSpecificPlan }: { onChooseSpecificPlan: (deploymentId: string) => void }) => {
  const { account } = useWeb3();
  const indexerDeployments = useSortedIndexerDeployments(account ?? '');

  return (
    <div className={styles.select}>
      <Typography className={styles.inputTitle}>{'Select specific deployment Id'} </Typography>
      <Select
        id="deploymentId"
        placeholder="Select specific deployment Id"
        optionFilterProp="children"
        onChange={(deploymentId) => onChooseSpecificPlan(deploymentId)}
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
                    <Typography className={styles.projectName}>{`${indexerDeployments.projectName}`}</Typography>
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
  );
};

const planSchema = yup.object({
  price: yup.number().defined().moreThan(0),
  templateId: yup.string().defined(),
  deploymentId: yup.string().optional(),
});

type PlanFormData = yup.Asserts<typeof planSchema>;

type FormProps = {
  templates: Array<PlanTemplate>;
  onSubmit: (data: PlanFormData) => void | Promise<void>;
  onCancel: () => void;
  curStep: number;
  onStepChange: (step: number) => void;
  error?: string;
};

const PlanForm: React.VFC<FormProps> = ({ templates, onSubmit, onCancel, curStep, onStepChange, error }) => {
  const { t } = useTranslation();
  const [selectedTemplateIdx, setSelectedTemplateIdx] = React.useState<number>(0);
  const template = templates[selectedTemplateIdx];

  const onFirstStep = () => onStepChange(0);
  const onSecondStep = () => onStepChange(1);
  const onThirdStep = () => onStepChange(2);

  const summaryList = [
    {
      label: t('plans.headers.period'),
      value: formatSecondsDuration(convertBigNumberToNumber(template.period)),
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
        price: 1,
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

          return (
            <ChooseTemplateStep
              selectedTemplateId={selectedTemplateId}
              onChooseTemplate={onChooseTemplate}
              templates={templates}
              onNextStep={onSecondStep}
              disabled={!isValid}
            />
          );
        }

        // Second step: summary and create plan
        return (
          <Form>
            <div>
              <SummaryList title={t('plans.create.description')} list={summaryList} />

              <NumberInput
                title={t('plans.create.priceTitle')}
                inputParams={{
                  onChange: (price) => {
                    onSecondStep();
                    setFieldValue('price', price);
                  },
                  min: 0,
                  defaultValue: 1,
                  id: 'price',
                  name: 'price',
                }}
              />

              <DeploymentIdOptions
                onChooseSpecificPlan={(deploymentId: string) => {
                  onSecondStep();
                  setFieldValue('deploymentId', deploymentId);
                }}
              />

              <Typography className={'errorText'}>{error}</Typography>
              <div className={clsx('flex-between', styles.btns)}>
                <Button
                  label={t('general.back')}
                  onClick={onFirstStep}
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
                    onClick={() => {
                      onThirdStep();
                      submitForm();
                    }}
                    loading={isSubmitting}
                    disabled={isSubmitting || (!isValid && values.price <= 0)}
                    colorScheme="standard"
                    className="button"
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
  const templates = useGetPlanTemplatesQuery({});

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
