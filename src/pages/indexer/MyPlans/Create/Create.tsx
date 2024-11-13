// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberInput } from '@components/NumberInput';
import { SummaryList } from '@components/SummaryList';
import TransactionModal from '@components/TransactionModal';
import { useWeb3 } from '@containers';
import { NETWORK_NAME } from '@containers/Web3';
import { parseEther } from '@ethersproject/units';
import { useSortedIndexerDeployments } from '@hooks';
import { Button, Spinner, TableText, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { STABLE_COIN_DECIMAL } from '@subql/network-config';
import { PlanTemplateFieldsFragment as Template } from '@subql/network-query';
import { useGetPlanTemplatesQuery, useStableCoin } from '@subql/react-hooks';
import {
  cidToBytes32,
  convertBigNumberToNumber,
  convertStringToNumber,
  getCapitalizedStr,
  mapAsync,
  notEmpty,
  renderAsync,
  TOKEN,
} from '@utils';
import { formatSecondsDuration } from '@utils/dateFormatters';
import { Alert, Radio, Select, Table, TableProps } from 'antd';
import assert from 'assert';
import clsx from 'clsx';
import { constants } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { Form, Formik } from 'formik';
import i18next from 'i18next';
import * as yup from 'yup';

import { useWeb3Store } from 'src/stores';

import styles from './Create.module.less';

export const useGetPlanTemplateColumns = (
  onChooseTemplate: (templateId: string, idx: number, template: Template) => void,
  selectedTemplateId?: string,
): TableProps<Template>['columns'] => {
  const { contracts } = useWeb3Store();

  const { coinsAddressDict } = useStableCoin(contracts, NETWORK_NAME);
  return [
    {
      title: <TableTitle title={'#'} />,
      dataIndex: 'id',
      render: (_: string, __: Template, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'period',
      title: <TableTitle title={i18next.t('plans.headers.period').toUpperCase()} />,
      render: (period: string) => <TableText content={formatSecondsDuration(convertStringToNumber(period))} />,
    },
    {
      dataIndex: 'dailyReqCap',
      title: <TableTitle title={i18next.t('plans.headers.dailyReqCap').toUpperCase()} />,
      render: (dailyReqCap: string) => (
        <TableText content={i18next.t('plans.default.query', { count: convertBigNumberToNumber(dailyReqCap) })} />
      ),
    },
    {
      dataIndex: 'rateLimit',
      title: <TableTitle title={i18next.t('plans.headers.rateLimit').toUpperCase()} />,
      render: (rateLimit: string) => (
        <TableText content={`${convertBigNumberToNumber(rateLimit)} ${i18next.t('plans.default.requestPerMin')}`} />
      ),
    },
    {
      dataIndex: 'priceToken',
      title: <TableTitle title={i18next.t('plans.headers.priceToken').toUpperCase()} />,
      render: (priceToken: string) => coinsAddressDict[priceToken],
    },
    {
      dataIndex: 'id',
      title: <TableTitle title={i18next.t('general.choose').toUpperCase()} />,
      render: (id: string, template: Template, idx: number) => (
        <Radio onClick={() => onChooseTemplate(id, idx, template)} checked={id === selectedTemplateId} />
      ),
    },
  ];
};

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
  templates: Array<Template>;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  const columns = useGetPlanTemplateColumns(onChooseTemplate, selectedTemplateId);
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
        className={clsx('fullWidth', 'flex', styles.planSelector)}
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
                <Select.Option
                  value={indexerDeployments.deployment?.id || indexerDeployments.deploymentId}
                  key={indexerDeployments?.id}
                >
                  <div className={styles.project}>
                    <Typography className={styles.projectName}>{`${indexerDeployments.projectName}`}</Typography>
                    <Typography className={styles.projectDeploymentId}>{`Deployment ID: ${
                      indexerDeployments.deployment?.id || indexerDeployments.deploymentId
                    }`}</Typography>
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
  templates: Array<Template>;
  onSubmit: (data: PlanFormData) => void | Promise<void>;
  onCancel: () => void;
  curStep: number;
  onStepChange: (step: number) => void;
  error?: string;
};

const PlanForm: React.FC<FormProps> = ({ templates, onSubmit, onCancel, curStep, onStepChange, error }) => {
  const { t } = useTranslation();
  const [selectedTemplateIdx, setSelectedTemplateIdx] = React.useState<number>(0);
  const { contracts } = useWeb3Store();
  const { coinsAddressDict } = useStableCoin(contracts, NETWORK_NAME);

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
      value: ` ${template.rateLimit} queries/sec`,
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
        const selectedTemplateInfo = templates.find((i) => i.id === selectedTemplateId);
        const isUSDCToken = selectedTemplateInfo?.priceToken !== contracts?.sqToken.address;
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
                unit={
                  <span className="flex" key="token">
                    <img
                      key="token"
                      src={isUSDCToken ? '/static/usdc.png' : '/static/sqt.svg'}
                      alt=""
                      width="24"
                      height="24"
                      style={{ marginRight: 8 }}
                    ></img>
                    {selectedTemplateInfo?.priceToken ? coinsAddressDict[selectedTemplateInfo.priceToken] : TOKEN}
                  </span>
                }
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
              {isUSDCToken ? (
                <Alert
                  className={styles.usdcAlert}
                  showIcon
                  type="info"
                  message={
                    <Typography variant="small" style={{ color: 'var(--sq-gray700)' }}>
                      Please note that this is just an indicative rate. <br />
                      <br />
                      The actual price depends on the exact exchange rate when consumer makes payment. The final payment
                      will always be paid by SQT.
                    </Typography>
                  }
                ></Alert>
              ) : (
                ''
              )}
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
  const { contracts } = useWeb3Store();
  const templates = useGetPlanTemplatesQuery({ pollInterval: 10000 });

  const handleCreate = async (amount: string, templateId: string, deploymentId?: string) => {
    assert(contracts, 'Contracts not available');

    if (!templates || templates.error) {
      throw templates.error;
    }
    const selectedTemplateInfo = templates.data?.planTemplates?.nodes.filter(notEmpty).find((i) => i.id === templateId);

    const sortedAmount =
      selectedTemplateInfo?.priceToken === contracts.sqToken.address
        ? parseEther(amount)
        : parseUnits(amount, STABLE_COIN_DECIMAL);

    return contracts.planManager.createPlan(
      sortedAmount,
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
