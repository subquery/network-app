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
import { NumberInput } from '../../../../../components/NumberInput';

const OfferDetailsSchema = Yup.object({
  rewardPerIndexer: Yup.number().required(),
  indexerCap: Yup.number().required(),
  totalDeposit: Yup.string().required(),
  minimumIndexedHeight: Yup.number().required(),
  expireDate: Yup.date().required(),
});

type OfferDetailsFrom = Yup.Asserts<typeof OfferDetailsSchema>;

export const OfferDetails: React.VFC = () => {
  const { t } = useTranslation();
  const createOfferContext = React.useContext(CreateOfferContext);

  if (!createOfferContext) return <></>;
  const { curStep, onStepChange, totalSteps, offer, updateCreateOffer } = createOfferContext;

  const handleSubmitFrom = (offerDetails: OfferDetailsFrom) => {
    const { rewardPerIndexer, indexerCap, minimumIndexedHeight, expireDate } = offerDetails;
    const totalDeposit = (rewardPerIndexer * indexerCap).toFixed(12);
    updateCreateOffer({ ...offer, indexerCap, minimumIndexedHeight, expireDate, rewardPerIndexer, totalDeposit });
    onStepChange(curStep + 1);
  };

  const initialOfferDetails = {
    rewardPerIndexer: 1,
    indexerCap: 1,
    totalDeposit: (1 * 1).toString(),
    minimumIndexedHeight: 1,
    expireDate: moment().toDate(),
  };

  return (
    <div>
      <Typography.Title level={4}>{t('myOffers.step_2.title')}</Typography.Title>

      <div>
        <Formik initialValues={initialOfferDetails} validationSchema={OfferDetailsSchema} onSubmit={handleSubmitFrom}>
          {({ isSubmitting, submitForm, setFieldValue, values, isValid }) => {
            const { rewardPerIndexer, indexerCap, minimumIndexedHeight, expireDate } = values;
            const totalDeposit = (rewardPerIndexer * indexerCap).toFixed(12);

            return (
              <Form>
                <div className={styles.form}>
                  <NumberInput
                    title={t('myOffers.step_2.rewardPerIndexer')}
                    id="rewardPerIndexer"
                    defaultValue={rewardPerIndexer}
                    maxLength={12}
                    onChange={(value) => setFieldValue('rewardPerIndexer', value)}
                  />
                  <NumberInput
                    title={t('myOffers.step_2.indexerCap')}
                    id="indexerCap"
                    defaultValue={indexerCap}
                    onChange={(value) => setFieldValue('indexerCap', value)}
                  />
                  <NumberInput
                    title={t('myOffers.step_2.totalDeposit')}
                    id="totalDeposit"
                    disabled={true}
                    value={totalDeposit}
                  />
                  <NumberInput
                    title={t('myOffers.step_2.minimumIndexedHeight')}
                    id="minimumIndexedHeight"
                    defaultValue={minimumIndexedHeight}
                    onChange={(value) => setFieldValue('minimumIndexedHeight', value)}
                  />
                  <div>
                    <Typography.Text className={styles.datePickerTitle}>
                      {t('myOffers.step_2.expireDate')}
                    </Typography.Text>
                    <DatePicker
                      showTime
                      size="large"
                      id="expireDate"
                      className={styles.datePicker}
                      defaultValue={moment(expireDate)}
                      onChange={(value) => setFieldValue('expireDate', value)}
                    />
                  </div>
                </div>
                <div>
                  <StepButtons
                    totalSteps={totalSteps}
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
    </div>
  );
};
