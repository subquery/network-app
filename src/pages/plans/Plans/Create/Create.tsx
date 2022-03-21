// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { parseEther } from '@ethersproject/units';
import { Button, Spinner, Typography } from '@subql/react-ui';
import assert from 'assert';
import { Formik, Form } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import TransactionModal from '../../../../components/TransactionModal';
import { useContracts, usePlanTemplates } from '../../../../containers';
import { mapAsync, notEmpty, renderAsync } from '../../../../utils';
import { GetPlanTemplates_planTemplates_nodes as Template } from '../../../../__generated__/GetPlanTemplates';
import * as yup from 'yup';
import { FTextInput } from '../../../../components';
import { constants } from 'ethers';

type Props = {};

const planSchema = yup.object({
  price: yup.number().defined(),
  deploymentId: yup.string().optional(),
});

type PlanFormData = yup.Asserts<typeof planSchema>;

type FormProps = {
  template: Template;
  onSubmit: (data: PlanFormData) => void | Promise<void>;
  onCancel: () => void;
};

const PlanForm: React.VFC<FormProps> = ({ template, onSubmit, onCancel }) => {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{
        price: 0,
        deploymentId: '',
      }}
      validationSchema={planSchema}
      onSubmit={onSubmit}
    >
      {({ submitForm, isValid, isSubmitting }) => (
        <Form>
          <div>
            <Typography>{`${t('plans.headers.price')}: ${template.period} days`}</Typography>
            <Typography>{`${t('plans.headers.dailyReqCap')}: ${template.dailyReqCap} queries`}</Typography>
            <Typography>{`${t('plans.headers.rateLimit')}: ${template.rateLimit} queries/min`}</Typography>

            <FTextInput id="price" label={t('plans.create.priceTitle')} />

            {/* TODO ability to choose deployment */}

            <Button label={t('plans.create.cancel')} onClick={onCancel} />
            <Button label={t('plans.create.submit')} onClick={submitForm} loading={isSubmitting} disabled={!isValid} />
          </div>
        </Form>
      )}
    </Formik>
  );
};

const Create: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();
  const templates = usePlanTemplates({});

  // TODO get indexed projects and provide option to set one
  const indexedProjects = [];

  const template = templates.data?.planTemplates?.nodes[0];

  const handleCreate = async (amount: string, deploymentId?: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    if (templates.error) {
      throw templates.error;
    }

    assert(template, 'No plan templates');

    console.log('CREATING PLAN WITH DETAILS', parseEther(amount), template.id, deploymentId);

    return contracts.planManager.createPlan(parseEther(amount), template.id, deploymentId || constants.HashZero);
  };

  return (
    <TransactionModal
      actions={[{ label: t('plans.create.action'), key: 'create' }]}
      text={{
        title: t('plans.create.title'),
        steps: [t('plans.create.step1'), t('indexer.confirmOnMetamask')],
        description: t('plans.create.description'),
        submitText: '',
        inputTitle: '',
        failureText: t('plans.create.failureText'),
      }}
      onClick={(params: PlanFormData) => handleCreate(params.price.toString(), params.deploymentId)}
      renderContent={(onSubmit, onCancel, isLoading) =>
        renderAsync(
          mapAsync((d) => d.planTemplates?.nodes.filter(notEmpty)[0], templates),
          {
            error: (e) => <Typography>{`Failed to get plan template: ${e.message}`}</Typography>,
            loading: () => <Spinner />,
            data: (template) => {
              if (!template) {
                return <Typography>No template found</Typography>;
              }
              return <PlanForm template={template} onSubmit={onSubmit} onCancel={onCancel} />;
            },
          },
        )
      }
    />
  );
};

export default Create;
