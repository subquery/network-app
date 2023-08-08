// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineWarning } from 'react-icons/ai';
import { DatePicker, Typography } from 'antd';
import dayjs from 'dayjs';
import { BigNumber, ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

import { AppTypography, NumberInput } from '../../../../../components';
import { useSQToken } from '../../../../../containers';
import { COLORS, convertStringToNumber, formatEther, TOKEN } from '../../../../../utils';
import { CreateOfferContext, StepButtons, StepType } from '../CreateOffer';
import styles from './OfferDetails.module.css';

// Can not select days before today + 24 hours, value & validation
export const EXPIRE_DATE_GAP = 24;
export const EXPIRE_DATE_GAP_UNIT = 'hours';

const REWARD_PER_INDEXER = 'rewardPerIndexer';
const INDEXER_CAP = 'indexerCap';
const TOTAL_DEPOSIT = 'totalDeposit';
const MINIMUM_INDEXED_HEIGHT = 'minimumIndexedHeight';
const EXPIRE_DATE = 'expireDate';

const formEther = (val: string) => ethers.utils.parseUnits(val, 18);
const OfferDetailsSchema = Yup.object().shape({
  [REWARD_PER_INDEXER]: Yup.string()
    .required()
    .test('Reward should be greater than 0.', (reward) => (reward ? formEther(reward).gt('0') : false)),
  [INDEXER_CAP]: Yup.number().required().moreThan(0),
  [TOTAL_DEPOSIT]: Yup.string().required(),
  [MINIMUM_INDEXED_HEIGHT]: Yup.number().required().moreThan(0),
  [EXPIRE_DATE]: Yup.date().required().min(dayjs().add(EXPIRE_DATE_GAP, EXPIRE_DATE_GAP_UNIT)),
});

export const OfferDetails: React.FC = () => {
  const { t } = useTranslation();
  const { balance } = useSQToken();
  const createOfferContext = React.useContext(CreateOfferContext);

  if (!createOfferContext) return <></>;
  const { curStep, onStepChange, offer, updateCreateOffer } = createOfferContext;

  const handleSubmitFrom = (offerDetails: any) => {
    const { rewardPerIndexer, indexerCap, minimumIndexedHeight, expireDate } = offerDetails;
    const totalDeposit = parseEther(rewardPerIndexer).mul(BigNumber.from(indexerCap)).toString();
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
          const totalDeposit = rewardPerIndexer ? convertStringToNumber(rewardPerIndexer) * indexerCap : '0';

          return (
            <Form>
              <div className={styles.form}>
                <NumberInput
                  title={t('myOffers.step_2.rewardPerIndexer')}
                  tooltip={t('myOffers.step_2.rewardPerIndexerTooltip')}
                  id={REWARD_PER_INDEXER}
                  defaultValue={rewardPerIndexer}
                  onChange={(value) => setFieldValue(REWARD_PER_INDEXER, value)}
                  status={errors[REWARD_PER_INDEXER] ? 'error' : undefined}
                  stringMode
                  errorMsg={errors[REWARD_PER_INDEXER] && t('myOffers.step_2.rewardPerIndexerErrorMsg')}
                />
                <NumberInput
                  title={t('myOffers.step_2.indexerCap')}
                  tooltip={t('myOffers.step_2.indexerCapTooltip')}
                  id={INDEXER_CAP}
                  defaultValue={indexerCap}
                  onChange={(value) => setFieldValue(INDEXER_CAP, value)}
                  status={errors[INDEXER_CAP] ? 'error' : undefined}
                  unit={values[INDEXER_CAP] > 1 ? t('indexer.indexers') : t('indexer.title')}
                  errorMsg={errors[INDEXER_CAP] && t('myOffers.step_2.indexerCapErrorMsg')}
                />
                <NumberInput
                  title={t('myOffers.step_2.totalDeposit')}
                  tooltip={t('myOffers.step_2.totalDepositTooltip')}
                  id={TOTAL_DEPOSIT}
                  disabled={true}
                  value={totalDeposit}
                  stringMode
                  max={formatEther(balance.data)}
                  status={errors[TOTAL_DEPOSIT] ? 'error' : undefined}
                  description={
                    balance.data ? `${t('general.balance')}: ${formatEther(balance.data, 4)} ${TOKEN} ` : undefined
                  }
                  errorMsg={errors[TOTAL_DEPOSIT] && t('myOffers.step_2.totalDepositErrorMsg')}
                />
                <NumberInput
                  title={t('myOffers.step_2.minimumIndexedHeight')}
                  tooltip={t('myOffers.step_2.minimumIndexedHeightTooltip')}
                  id={MINIMUM_INDEXED_HEIGHT}
                  defaultValue={minimumIndexedHeight}
                  onChange={(value) => setFieldValue(MINIMUM_INDEXED_HEIGHT, value)}
                  unit={values[MINIMUM_INDEXED_HEIGHT] > 1 ? t('general.blocks') : t('general.block')}
                  status={errors[MINIMUM_INDEXED_HEIGHT] ? 'error' : undefined}
                  errorMsg={errors[MINIMUM_INDEXED_HEIGHT] && t('myOffers.step_2.minimumIndexedHeightErrorMsg')}
                />
                <div>
                  <AppTypography tooltip={t('myOffers.step_2.expireDateTooltip')}>
                    {t('myOffers.step_2.expireDate')}
                  </AppTypography>
                  <DatePicker
                    showTime
                    value={dayjs(expireDate)}
                    disabledDate={(current) => {
                      // Can not select days before today + 24 hours
                      return current && current < dayjs().add(EXPIRE_DATE_GAP, EXPIRE_DATE_GAP_UNIT);
                    }}
                    size="large"
                    id={EXPIRE_DATE}
                    className={styles.datePicker}
                    onChange={(value) => setFieldValue(EXPIRE_DATE, value)}
                    status={errors[EXPIRE_DATE] ? 'error' : undefined}
                    placement={'topLeft'}
                  />
                  <div className={styles.cancelWarning}>
                    <AiOutlineWarning color={COLORS.error} size={16} />
                    <AppTypography className={styles.cancelWarningText}>
                      {t('myOffers.step_2.cancelWarning')}
                    </AppTypography>
                  </div>
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
