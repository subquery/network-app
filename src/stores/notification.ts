// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { makeCacheKey } from '@utils/limitation';
import * as t from 'io-ts';
import localforage from 'localforage';
import { unionBy } from 'lodash-es';
import { create } from 'zustand';

const ButtonProps = t.type({
  label: t.string,
  navigateHref: t.string,
});

export enum NotificationKey {
  OverAllocate = 'overAllocate',
  UnstakeAllocation = 'unstakeAllocation',
  OverAllocateNextEra = 'overAllocateNextEra',
  UnclaimedRewards = 'unclaimedRewards',
  LowBillingBalance = 'lowBillingBalance',
  InactiveOperator = 'inactiveOperator',
  LowControllerBalance = 'lowControllerBalance',
  UnlockWithdrawal = 'unlockWithdrawal',
  // v1 is info
  OutdatedAllocation = 'outdatedAllocation',
  OutdatedAllocationV2 = 'outdatedAllocationV2',
  MislaborAllocation = 'mislaborAllocation',
  UnhealthyAllocation = 'unhealthyAllocation',
  DecreaseCommissionRate = 'decreaseCommissionRate',
  IncreaseCommissionRate = 'increaseCommissionRate',
  NewOperator = 'newOperator',
}

const NotificationItemFromIo = t.type({
  key: t.string, // TODO: make enum for it
  level: t.union([t.literal('info'), t.literal('critical')]),
  message: t.string,
  title: t.string,
  createdAt: t.number,
  type: t.union([t.undefined, t.string]),
  canBeDismissed: t.boolean,
  dismissTo: t.union([t.undefined, t.number]),
  dismissTime: t.union([t.undefined, t.number]),
  buttonProps: ButtonProps,
});

export type NotificationItem = t.TypeOf<typeof NotificationItemFromIo>;

export type NotificationStore = {
  cacheKey: string;
  mounted: boolean;
  notificationList: NotificationItem[];
  clearNotificationList: () => void;
  addNotification: (notification: NotificationItem, replace?: boolean) => void;
  sortNotificationList: () => void;
  updateNotification: (notification: NotificationItem) => void;
  removeNotification: (notification: NotificationKey | NotificationKey[]) => void;
  initNotification: (address: string) => Promise<void>;
};

const notificationSort = (a: NotificationItem, b: NotificationItem) => {
  // sort by level
  if (a.level === 'critical' && b.level === 'info') {
    return -1;
  }
  if (a.level === 'info' && b.level === 'critical') {
    return 1;
  }
  return 0;
};

export const useNotification = create<NotificationStore>((set, get) => ({
  cacheKey: '',
  mounted: false,
  notificationList: [],
  clearNotificationList: async () => {
    set({ notificationList: [] });
    await localforage.setItem(get().cacheKey, []);
  },
  addNotification: async (notification, replace) => {
    const rawList = get().notificationList;
    const newList = unionBy(replace ? [notification, ...rawList] : [...rawList, notification], (i) => i.key).sort(
      notificationSort,
    );
    set(() => ({ notificationList: newList }));
    await localforage.setItem(get().cacheKey, newList);
  },
  updateNotification: async (notification) => {
    const state = get();
    const filterList = state.notificationList.map((n) => {
      if (n.key === notification.key) {
        return notification;
      }
      return n;
    });
    set(() => ({
      notificationList: filterList,
    }));

    await localforage.setItem(get().cacheKey, filterList);
  },
  sortNotificationList: async () => {
    const state = get();
    const sortedList = state.notificationList.sort(notificationSort);
    set(() => ({
      notificationList: sortedList,
    }));
    await localforage.setItem(get().cacheKey, sortedList);
  },
  removeNotification: async (notificationKeys) => {
    const state = get();
    const filterList = state.notificationList.filter((n) => {
      if (Array.isArray(notificationKeys)) {
        return !notificationKeys.includes(n.key as NotificationKey);
      }
      return n.key !== notificationKeys;
    });
    set(() => ({
      notificationList: filterList,
    }));

    await localforage.setItem(get().cacheKey, filterList);
  },
  initNotification: async (address) => {
    set({ mounted: false });

    if (!address) {
      set({ notificationList: [] });
      set({ mounted: true });
      return;
    }

    const cacheKey = makeCacheKey('notificationList', { prefix: address });
    set({ cacheKey });
    const notificationList = await localforage.getItem<NotificationItem[]>(cacheKey);
    if (Array.isArray(notificationList)) {
      const filterList = notificationList.filter((i) => NotificationItemFromIo.is(i));
      set({ notificationList: filterList });
      await localforage.setItem(cacheKey, filterList);
    } else {
      set({ notificationList: [] });
      await localforage.setItem(cacheKey, []);
    }

    set({ mounted: true });
  },
}));
