// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useRef } from 'react';
import { GoAlertFill } from 'react-icons/go';
import { useNavigate } from 'react-router';
import { Modal, Typography } from '@subql/components';
import { waitForSomething } from '@utils/waitForSomething';

import {
  type NotificationItem as NotificationItemType,
  NotificationKey,
  useNotification,
} from 'src/stores/notification';

import styles from './index.module.less';

export const useToastNotificationModal = () => {
  const notificationStore = useNotification();
  const navigate = useNavigate();
  const toasting = useRef(false);
  const toastedKeys = useRef<string[]>([]);

  const toastRestNotifications = useCallback(
    async (notification?: NotificationItemType) => {
      if (toasting.current) {
        await waitForSomething({
          func: () => toasting.current === false,
        });
      }
      const canBeToastNotification = (notification ? [notification] : notificationStore.notificationList).filter(
        (item) => {
          return (
            item.level === 'critical' &&
            (!item.dismissTo || (item.dismissTo && item.dismissTo < Date.now())) &&
            !toastedKeys.current.includes(item.key)
          );
        },
      );

      let continueShowToastStatus: 'continue' | 'stop' | 'pending' = 'pending';
      toasting.current = true;
      for (const noti of canBeToastNotification) {
        continueShowToastStatus = 'pending';
        toastedKeys.current.push(noti.key);
        Modal.confirm({
          icon: null,
          width: 376,
          className: styles.notificationModal,
          content: (
            <div className={styles.notificationModalContent}>
              <GoAlertFill
                style={{ color: noti.level === 'critical' ? 'var(--sq-error)' : 'var(--sq-info)', fontSize: 40 }}
              />
              <Typography weight={600} variant="large">
                {noti.title}
              </Typography>
              {noti.message ? (
                <Typography
                  style={{ textAlign: 'center', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{
                    __html: noti.message.replaceAll('\n', '<br />'),
                  }}
                ></Typography>
              ) : (
                ''
              )}
            </div>
          ),
          cancelButtonProps: {
            style: {
              display: noti.canBeDismissed ? 'block' : 'none',
            },
            shape: 'round',
            size: 'large',
          },
          cancelText: 'Dismiss',
          okText: noti.buttonProps.label,
          okButtonProps: {
            size: 'large',
            type: 'primary',
            shape: 'round',
            danger: noti.level === 'critical' ? true : false,
            style: {
              display: noti.buttonProps.navigateHref ? 'block' : 'none',
            },
          },

          onOk: () => {
            if (!noti.buttonProps.navigateHref) {
              continueShowToastStatus = 'continue';
              return;
            }

            continueShowToastStatus = 'stop';
            // window.open may be block by browser
            if (
              !noti.buttonProps.navigateHref.includes('https://') &&
              !noti.buttonProps.navigateHref.includes('http://')
            ) {
              navigate(noti.buttonProps.navigateHref);
            } else {
              window.open(noti.buttonProps.navigateHref, '_blank');
            }
          },

          onCancel: () => {
            continueShowToastStatus = 'continue';
            if (noti.dismissTime) {
              const dismissTo = Date.now() + noti.dismissTime;
              notificationStore.updateNotification({
                ...noti,
                dismissTo,
              });
            }
          },
        });

        await waitForSomething({
          func: () => {
            return continueShowToastStatus !== 'pending';
          },
          splitTime: 500,
        });

        // @ts-ignore
        if (continueShowToastStatus === 'stop') {
          notificationStore.removeNotification(noti.key as NotificationKey);
          return;
        }
      }
      toasting.current = false;
    },
    [notificationStore.notificationList],
  );

  return {
    toastRestNotifications: toastRestNotifications,
    toastOneNotification: async (notification: NotificationItemType) => {
      await toastRestNotifications(notification);
    },
  };
};
