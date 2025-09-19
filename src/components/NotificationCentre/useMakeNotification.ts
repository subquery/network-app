import { useCallback } from 'react';
import { idleCallback, idleQueue } from '@utils/idleCallback';

import { useConsumerNotifications } from './useConsumerNotifications';
import { useDelegatorNotifications } from './useDelegatorNotifications';
import { useGeneralNotifications } from './useGeneralNotifications';
import { useIndexerNotifications } from './useIndexerNotifications';
import { useProjectAllocationNotifications } from './useProjectAllocationNotifications';

export const useMakeNotification = () => {
  // 导入所有拆分的 hooks
  const indexerNotifications = useIndexerNotifications();
  const delegatorNotifications = useDelegatorNotifications();
  const consumerNotifications = useConsumerNotifications();
  const generalNotifications = useGeneralNotifications();
  const allocationNotifications = useProjectAllocationNotifications();

  const initAllNotification = useCallback(() => {
    idleCallback(() =>
      idleQueue([
        () => consumerNotifications.makeNoBoosterNotification(),
        () => generalNotifications.makeConsumerRewardsProgrameNotification(),
        () => consumerNotifications.makeUnhealthyConsumerRewardsProjectNotification(),
        () => indexerNotifications.makeOverAllocateAndUnStakeAllocationNotification(),
        () => indexerNotifications.makeLowControllerBalanceNotification(),
        () => generalNotifications.makeUnhealthyAllocationNotification(),
        () => delegatorNotifications.makeInactiveOperatorNotification(),
        () => consumerNotifications.makeLowBillingBalanceNotification(),
        () => delegatorNotifications.makeUnlockWithdrawalNotification(),
        () => generalNotifications.makeUnClaimedNotification(),
        () => delegatorNotifications.makeInOrDecreaseCommissionNotification(),
        () => allocationNotifications.makeOutdateAllocationProjects(),
        () => generalNotifications.makeNewOperatorNotification(),
      ]),
    );
  }, [
    indexerNotifications,
    delegatorNotifications,
    consumerNotifications,
    generalNotifications,
    allocationNotifications,
  ]);

  // 返回所有方法，保持向后兼容
  return {
    // 基础方法
    makeOverAllocateAndUnStakeAllocationNotification: () =>
      idleCallback(() => indexerNotifications.makeOverAllocateAndUnStakeAllocationNotification()),
    makeUnClaimedNotification: () => idleCallback(() => generalNotifications.makeUnClaimedNotification()),
    makeLowBillingBalanceNotification: () =>
      idleCallback(() => consumerNotifications.makeLowBillingBalanceNotification()),
    makeInactiveOperatorNotification: () =>
      idleCallback(() => delegatorNotifications.makeInactiveOperatorNotification()),
    makeLowControllerBalanceNotification: () =>
      idleCallback(() => indexerNotifications.makeLowControllerBalanceNotification()),
    makeUnlockWithdrawalNotification: () =>
      idleCallback(() => delegatorNotifications.makeUnlockWithdrawalNotification()),
    makeOutdateAllocationProjects: () => idleCallback(() => allocationNotifications.makeOutdateAllocationProjects()),
    makeUnhealthyAllocationNotification: () =>
      idleCallback(() => generalNotifications.makeUnhealthyAllocationNotification()),
    makeInOrDecreaseCommissionNotification: () =>
      idleCallback(() => delegatorNotifications.makeInOrDecreaseCommissionNotification()),

    // 刷新方法
    refreshAndMakeOverAllocateNotification: () => {
      // 这些需要在各自的 hooks 中实现移除逻辑
      idleCallback(() => indexerNotifications.makeOverAllocateAndUnStakeAllocationNotification('reload'));
    },
    refreshAndMakeUnClaimedNotification: () => {
      idleCallback(() => generalNotifications.makeUnClaimedNotification('reload'));
    },
    refreshAndMakeLowBillingBalanceNotification: () => {
      idleCallback(() => consumerNotifications.makeLowBillingBalanceNotification('reload'));
    },
    refreshAndMakeInactiveOperatorNotification: () => {
      idleCallback(() => delegatorNotifications.makeInactiveOperatorNotification('reload'));
    },
    refreshAndMakeInOrDecreaseCommissionNotification: () => {
      idleCallback(() => delegatorNotifications.makeInOrDecreaseCommissionNotification('reload'));
    },
    refreshAndMakeUnlockWithdrawalNotification: () => {
      idleCallback(() => delegatorNotifications.makeUnlockWithdrawalNotification('reload'));
    },
    refreshAndMakeOutdateAllocationProjects: () => {
      idleCallback(() => allocationNotifications.makeOutdateAllocationProjects('reload'));
    },

    initNewNotification: () => idleCallback(initAllNotification),
  };
};
