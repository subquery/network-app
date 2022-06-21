// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DatePicker, Typography } from 'antd';
import * as React from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import moment from 'moment';
import styles from './OfferDetails.module.css';
import { CreateOfferContext, StepButtons, StepType } from '../CreateOffer';
import { NumberInput, Text } from '../../../../../components';

const REWARD_PER_INDEXER = 'rewardPerIndexer';
const INDEXER_CAP = 'indexerCap';
const TOTAL_DEPOSIT = 'totalDeposit';
const MINIMUM_INDEXED_HEIGHT = 'minimumIndexedHeight';
const EXPIRE_DATE = 'expireDate';

const OfferDetailsSchema = Yup.object().shape({
  [REWARD_PER_INDEXER]: Yup.number().required().moreThan(0),
  [INDEXER_CAP]: Yup.number().required().moreThan(0),
  [TOTAL_DEPOSIT]: Yup.string().required(),
  [MINIMUM_INDEXED_HEIGHT]: Yup.number().required(),
  [EXPIRE_DATE]: Yup.date().required().min(moment().add(12, 'hours')),
});

export const OfferDetails: React.VFC = () => {
  const { t } = useTranslation();
  const createOfferContext = React.useContext(CreateOfferContext);

  if (!createOfferContext) return <></>;
  const { curStep, onStepChange, offer, updateCreateOffer } = createOfferContext;

  const handleSubmitFrom = (offerDetails: any) => {
    const { rewardPerIndexer, indexerCap, minimumIndexedHeight, expireDate } = offerDetails;
    const totalDeposit = (rewardPerIndexer * indexerCap).toFixed(12);
    updateCreateOffer({ ...offer, indexerCap, minimumIndexedHeight, expireDate, rewardPerIndexer, totalDeposit });
    onStepChange(curStep + 1);
  };

  const initialOfferDetails = {
    [REWARD_PER_INDEXER]: offer.rewardPerIndexer,
    [INDEXER_CAP]: offer.indexerCap,
    [TOTAL_DEPOSIT]: offer.totalDeposit,
    [MINIMUM_INDEXED_HEIGHT]: offer.minimumIndexedHeight,
    [EXPIRE_DATE]: offer.expireDate,
  };

  return (
    <div>
      <Typography.Title level={4}>{t('myOffers.step_2.title')}</Typography.Title>

      <Formik
        initialValues={initialOfferDetails}
        validationSchema={OfferDetailsSchema}
        onSubmit={handleSubmitFrom}
        validateOnMount
      >
        {({ isSubmitting, submitForm, setFieldValue, values, isValid, errors }) => {
          const { rewardPerIndexer, indexerCap, minimumIndexedHeight, expireDate } = values;
          const totalDeposit = (rewardPerIndexer * indexerCap).toFixed(12);

          return (
            <Form>
              <div className={styles.form}>
                <NumberInput
                  title={t('myOffers.step_2.rewardPerIndexer')}
                  tooltip={t('myOffers.step_2.rewardPerIndexerTooltip')}
                  id={REWARD_PER_INDEXER}
                  defaultValue={rewardPerIndexer}
                  maxLength={12}
                  onChange={(value) => setFieldValue(REWARD_PER_INDEXER, value)}
                  status={errors[REWARD_PER_INDEXER] ? 'error' : undefined}
                />
                <NumberInput
                  title={t('myOffers.step_2.indexerCap')}
                  tooltip={t('myOffers.step_2.indexerCapTooltip')}
                  id={INDEXER_CAP}
                  defaultValue={indexerCap}
                  onChange={(value) => setFieldValue(INDEXER_CAP, value)}
                  status={errors[INDEXER_CAP] ? 'error' : undefined}
                />
                <NumberInput
                  title={t('myOffers.step_2.totalDeposit')}
                  tooltip={t('myOffers.step_2.totalDepositTooltip')}
                  id={TOTAL_DEPOSIT}
                  disabled={true}
                  value={totalDeposit}
                />
                <NumberInput
                  title={t('myOffers.step_2.minimumIndexedHeight')}
                  tooltip={t('myOffers.step_2.minimumIndexedHeightTooltip')}
                  id={MINIMUM_INDEXED_HEIGHT}
                  defaultValue={minimumIndexedHeight}
                  onChange={(value) => setFieldValue(MINIMUM_INDEXED_HEIGHT, value)}
                  unit={values[MINIMUM_INDEXED_HEIGHT] > 1 ? t('general.blocks') : t('general.block')}
                  status={errors[MINIMUM_INDEXED_HEIGHT] ? 'error' : undefined}
                />
                <div>
                  <Text tooltip={t('myOffers.step_2.expireDateTooltip')}>{t('myOffers.step_2.expireDate')}</Text>
                  <DatePicker
                    showTime
                    disabledDate={(current) => {
                      // Can not select days before today + 12 hours
                      return current && current < moment().add(12, 'hours');
                    }}
                    size="large"
                    id={EXPIRE_DATE}
                    className={styles.datePicker}
                    defaultValue={moment(expireDate)}
                    onChange={(value) => setFieldValue(EXPIRE_DATE, value)}
                    status={errors[EXPIRE_DATE] ? 'error' : undefined}
                  />
                </div>
              </div>
              <div>
                <StepButtons
                  curStep={curStep}
                  onStepChange={(step: number, stepType: StepType) => {
                    if (stepType === StepType.NEXT) {
                      submitForm();
                    } else {
                      onStepChange(step);
                    }
                  }}
                  disabled={!isValid || isSubmitting}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
