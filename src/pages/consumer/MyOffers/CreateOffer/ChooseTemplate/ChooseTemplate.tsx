// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetPlanTemplateColumns } from '@pages/indexer/MyPlans/Create';
import { Spinner } from '@subql/components';
import { PlanTemplateFieldsFragment as PlanTemplate } from '@subql/network-query';
import { useGetPlanTemplatesQuery } from '@subql/react-hooks';
import { mapAsync, notEmpty, renderAsync } from '@utils';
import { Table, Typography } from 'antd';

import { CreateOfferContext, StepButtons } from '../CreateOffer';

export const ChooseTemplate: React.FC = () => {
  const { t } = useTranslation();
  const asyncTemplates = useGetPlanTemplatesQuery();

  const createOfferContext = React.useContext(CreateOfferContext);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | undefined>(
    createOfferContext?.offer?.templateId ?? '',
  );
  const [selectedTemplate, setSelectedTemplate] = React.useState<PlanTemplate | undefined>();

  const onChooseTemplate = (templateId: string, template?: PlanTemplate) => {
    setSelectedTemplateId(templateId);
    template && setSelectedTemplate(template);
  };

  const columns = useGetPlanTemplateColumns(
    (templateId, _, template) => onChooseTemplate(templateId, template),
    selectedTemplateId,
  );

  if (!createOfferContext) return <></>;

  const { curStep, onStepChange, offer, updateCreateOffer } = createOfferContext;
  const onNext = (step: number) => {
    updateCreateOffer({ ...offer, templateId: selectedTemplateId ?? '', planTemplate: selectedTemplate });
    onStepChange(step);
  };

  return (
    <div>
      <Typography.Title level={4}>{t('myOffers.step_1.title')}</Typography.Title>

      <div>
        {renderAsync(
          mapAsync((d) => d.planTemplates?.nodes.filter(notEmpty), asyncTemplates),
          {
            loading: () => <Spinner />,
            error: (error) => <p>{`Failed to load templates: ${error.message}`}</p>,
            data: (templates) => {
              if (!templates) {
                return <></>;
              }
              return (
                <Table
                  columns={columns}
                  dataSource={templates}
                  rowKey={'id'}
                  pagination={false}
                  onRow={(record) => {
                    return {
                      onClick: () => onChooseTemplate(record?.id, record),
                    };
                  }}
                />
              );
            },
          },
        )}

        <StepButtons curStep={curStep} onStepChange={onNext} disabled={!selectedTemplateId} />
      </div>
    </div>
  );
};
