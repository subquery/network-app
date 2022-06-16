// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@subql/react-ui';
import { Table, Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { usePlanTemplates } from '../../../../../containers';
import { mapAsync, notEmpty, renderAsync } from '../../../../../utils';
import { getPlanTemplateColumns } from '../../../Plans/Create';
import { CreateOfferContext, StepButtons } from '../CreateOffer';

export const ChooseTemplate: React.VFC = () => {
  const { t } = useTranslation();
  const asyncTemplates = usePlanTemplates({});

  const createOfferContext = React.useContext(CreateOfferContext);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | undefined>(
    createOfferContext?.offer?.templateId ?? '',
  );

  if (!createOfferContext) return <></>;
  const { curStep, onStepChange, offer, updateCreateOffer } = createOfferContext;
  const onNext = (step: number) => {
    updateCreateOffer({ ...offer, templateId: selectedTemplateId ?? '' });
    onStepChange(step);
  };

  const columns = getPlanTemplateColumns((templateId: string) => setSelectedTemplateId(templateId), selectedTemplateId);

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
                      onClick: () => setSelectedTemplateId(record?.id),
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
