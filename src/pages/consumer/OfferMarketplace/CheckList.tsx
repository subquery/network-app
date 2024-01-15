// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { ServiceStatus } from '@subql/network-query';
import { AsyncMemoReturn } from '@subql/react-hooks';
import { Button, Typography } from 'antd';
import clsx from 'clsx';
import moment from 'moment';

import { useWeb3Store } from 'src/stores';

import { Spinner, Status as AppStatus } from '../../../components';
import { deploymentStatus } from '../../../components/Status/Status';
import { useWeb3 } from '../../../containers';
import { useAsyncMemo } from '../../../hooks';
import {
  COLORS,
  convertStringToNumber,
  formatEther,
  isUndefined,
  mergeAsync,
  Metadata,
  parseError,
  renderAsyncArray,
  TOKEN,
} from '../../../utils';
import styles from './AcceptOffer.module.css';

const RequirementCheckListTitle = () => {
  const titles = ['CRITERIA', 'REQUIRED', 'ACTUAL', 'PASS'];

  return (
    <div className={clsx('flex-between-center', styles.checkListTitle)}>
      {titles.map((title) => (
        <Typography.Text key={title}>{title}</Typography.Text>
      ))}
    </div>
  );
};

interface IRequirementCheck {
  title: string;
  requiredValue: string | number | undefined;
  value: string | number | undefined;
  passCheck: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatFn?: (value: any) => string | number | React.ReactNode;
  errorMsg?: string;
}

interface ISortedValue {
  value: string | number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatFn?: (value: any) => string | React.ReactNode;
}

const RequirementCheck: React.FC<IRequirementCheck> = ({
  title,
  requiredValue,
  value,
  passCheck,
  formatFn,
  errorMsg,
}) => {
  const iconSize = 20;
  const iconColor = passCheck ? COLORS.success : COLORS.error;
  const Icon = ({ ...props }) =>
    passCheck ? <AiOutlineCheckCircle {...props} /> : <AiOutlineCloseCircle {...props} />;

  const SortedValue = ({ value, formatFn }: ISortedValue) => {
    if (formatFn) {
      if (['string', 'number'].includes(typeof formatFn(value))) {
        return <Typography.Text className={styles.requirementText}>{formatFn(value)}</Typography.Text>;
      }
      return <div className={styles.requirementText}>{formatFn(value)}</div>;
    }

    return <Typography.Text className={styles.requirementText}>{value ?? '-'}</Typography.Text>;
  };

  return (
    <div className={styles.requirementCheckItemContainer}>
      <div className={clsx('flex-between-center', styles.requirementCheckItem)}>
        <Typography.Title level={5} type="secondary" className={styles.requirementText}>
          {title}
        </Typography.Title>
        <SortedValue value={requiredValue} formatFn={formatFn} />
        <SortedValue value={value} formatFn={formatFn} />
        <Icon color={iconColor} size={iconSize} />
      </div>
      {!passCheck && errorMsg && <Typography.Text type={'danger'}>{errorMsg}</Typography.Text>}
    </div>
  );
};

interface ICheckList {
  status: string | undefined;
  deploymentId: string;
  proxyEndpoint: string | undefined;
  offerId: string;
  planDuration: string | undefined;
  rewardPerIndexer: string;
  requiredBlockHeight: number; //TODO: or should use bigInt?
  onSubmit: (params: unknown) => void;
  error?: unknown;
  isLoading?: boolean;
  deploymentMeta: AsyncMemoReturn<
    | Metadata
    | {
        lastHeight: number;
      }
    | undefined
  >;
}

export const CheckList: React.FC<ICheckList> = ({
  status,
  requiredBlockHeight,
  offerId,
  rewardPerIndexer,
  planDuration,
  onSubmit,
  error,
  isLoading,
  deploymentMeta,
}) => {
  const { t } = useTranslation();
  const [checkListErr] = React.useState<string | undefined>(parseError(error));
  const { account: indexer } = useWeb3();
  const { contractClient } = useWeb3Store();

  const REQUIRED_STATUS = ServiceStatus.READY;
  const REQUIRED_BLOCKHEIGHT = requiredBlockHeight;
  const daysOfPlan = moment.duration(planDuration, 'seconds').asDays();
  const REQUIRED_DAILY_REWARD_CAP = convertStringToNumber(formatEther(rewardPerIndexer)) / Math.ceil(daysOfPlan);

  const dailyRewardCapacity = useAsyncMemo(async () => {
    if (!contractClient || !indexer) return null;
    return await contractClient.dailyRewardCapcity(indexer);
  }, [contractClient, indexer, offerId]);

  return renderAsyncArray(mergeAsync(deploymentMeta, dailyRewardCapacity), {
    error: (error) => <Typography.Text className="errorText">{`Error: ${parseError(error)}`}</Typography.Text>,
    empty: () => <Typography.Text>{t('offerMarket.acceptModal.nonCriteriaData')}</Typography.Text>,
    data: (data) => {
      const [metadata, cap] = data;

      if (isUndefined(metadata) || isUndefined(cap)) return <Spinner />;

      const latestBlockHeight = metadata?.lastHeight;
      const dailyRewardCap = convertStringToNumber(formatEther(cap ?? 0));

      const sortedRequirementCheckList = [
        {
          title: t('offerMarket.acceptModal.projectStatus'),
          requiredValue: REQUIRED_STATUS,
          value: status,
          passCheck: REQUIRED_STATUS === status,
          formatFn: (status: string) => <AppStatus text={status} color={deploymentStatus[status]} />,
          errorMsg: t('offerMarket.acceptModal.projectStatusError'),
        },
        {
          title: t('offerMarket.acceptModal.blockHeight'),
          requiredValue: REQUIRED_BLOCKHEIGHT,
          value: latestBlockHeight,
          passCheck: REQUIRED_BLOCKHEIGHT <= (latestBlockHeight ?? 0),
          errorMsg: t('offerMarket.acceptModal.blockHeightError'),
        },
        {
          title: t('offerMarket.acceptModal.dailyRewards'),
          requiredValue: `${REQUIRED_DAILY_REWARD_CAP} ${TOKEN}`,
          value: `${dailyRewardCap} ${TOKEN}`,
          passCheck: REQUIRED_DAILY_REWARD_CAP <= dailyRewardCap,
          errorMsg: t('offerMarket.acceptModal.dailyRewardsError'),
        },
      ];

      const passCheckItems = sortedRequirementCheckList.filter(
        (requirementCheck) => requirementCheck.passCheck === true,
      );

      const disabledAcceptOffer = passCheckItems.length !== sortedRequirementCheckList.length;

      return (
        <div className={styles.requirementCheckContainer}>
          <Typography.Title level={4}>
            {t('offerMarket.acceptModal.passCriteria', { count: passCheckItems.length })}
          </Typography.Title>
          <RequirementCheckListTitle />
          {sortedRequirementCheckList.map((requirementCheck) => (
            <RequirementCheck key={requirementCheck.title} {...requirementCheck} />
          ))}
          <Typography.Paragraph>{t('offerMarket.acceptModal.afterAcceptOffer')}</Typography.Paragraph>
          {checkListErr && <Typography.Text type="danger">{`Error: ${checkListErr}`}</Typography.Text>}
          <div className={clsx(styles.btnContainer, 'flex-end')}>
            <Button
              onClick={onSubmit}
              htmlType="submit"
              shape="round"
              size="large"
              type="primary"
              loading={isLoading}
              disabled={disabledAcceptOffer || isLoading}
            >
              {t('offerMarket.accept')}
            </Button>
          </div>
        </div>
      );
    },
  });
};
