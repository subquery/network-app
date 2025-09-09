import { useCallback } from 'react';

import { NotificationKey, useNotification } from 'src/stores/notification';

const defaultDismissTime = 1000 * 60 * 60 * 24;

export const useNotificationBase = () => {
  const notificationStore = useNotification();

  const checkIfExistAndExpired = useCallback(
    (notificationKeys: NotificationKey | NotificationKey[]) => {
      const keys = Array.isArray(notificationKeys) ? notificationKeys : [notificationKeys];

      const exist = keys.every((key) => notificationStore.notificationList.find((item) => item.key === key));

      if (exist) {
        const expired = keys.some((key) => {
          const item = notificationStore.notificationList.find((item) => item.key === key);
          if (!item) return false;
          return item.dismissTo && item.dismissTo < Date.now();
        });

        return { exist: true, expired };
      }

      return { exist, expired: false };
    },
    [notificationStore.notificationList],
  );

  return {
    notificationStore,
    checkIfExistAndExpired,
    defaultDismissTime,
  };
};
