// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from 'react';
import { GoBell } from 'react-icons/go';
import { IoIosAlert, IoIosClose } from 'react-icons/io';
import { useNavigate } from 'react-router';
import { useAccount } from '@containers/Web3';
import { useEra } from '@hooks';
import { Typography } from '@subql/components';
import { Badge, Button, Popover } from 'antd';
import dayjs from 'dayjs';

import { type NotificationItem as NotificationItemType, useNotification } from 'src/stores/notification';

import styles from './index.module.less';
import { useMakeNotification } from './useMakeNotification';
import { useToastNotificationModal } from './useToastNotificationModal';

const EmptyNotification = () => {
  return (
    <div className="col-flex flex-center" style={{ padding: 16, flex: 1 }}>
      <img src="/static/notification.svg" alt="empty notification" width={50} height={40}></img>
      <Typography variant="large" weight={600} style={{ marginTop: 24, marginBottom: 8 }}>
        No notifications
      </Typography>

      <Typography type="secondary" style={{ textAlign: 'center' }}>
        Looks like there are no notifications at the moment. Stay tuned for updates and important announcements, as well
        as things you need to change!
      </Typography>
    </div>
  );
};

const NotificationItem: FC<{ item: NotificationItemType }> = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div className={styles.notificationItem}>
      <div className={styles.notificationItemIcon}>
        <IoIosAlert
          style={{
            fontSize: 20,
            color: item.level === 'critical' ? 'var(--sq-error)' : 'var(--sq-info)',
          }}
        />
      </div>

      <div className={styles.notificationItemRight}>
        <div className={styles.notificationItemTitle}>
          <Typography variant="h6" weight={600}>
            {item.title}
          </Typography>
        </div>
        {item.message && (
          <Typography variant="small" type="secondary">
            {item.message}
          </Typography>
        )}
        <Typography variant="small" type="secondary">
          {dayjs(item.createdAt).fromNow()}
        </Typography>
        <div className={styles.notificationItemButton}>
          <Button
            shape="round"
            size="small"
            type="primary"
            danger={item.level === 'critical' ? true : false}
            onClick={() => {
              if (!item.buttonProps.navigateHref) return;
              if (
                !item.buttonProps.navigateHref.includes('https://') &&
                !item.buttonProps.navigateHref.includes('http://')
              ) {
                navigate(item.buttonProps.navigateHref);
              }
            }}
          >
            {item.buttonProps.navigateHref.includes('http://') || item.buttonProps.navigateHref.includes('https://') ? (
              <Typography.Link variant="small" style={{ color: '#fff' }} href={item.buttonProps.navigateHref}>
                {item.buttonProps.label}
              </Typography.Link>
            ) : (
              item.buttonProps.label
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const NotificationList: FC = () => {
  const notificationStore = useNotification();

  return (
    <div className={styles.notificationList}>
      {notificationStore.notificationList.map((item) => {
        return <NotificationItem item={item} key={item.key}></NotificationItem>;
      })}
    </div>
  );
};

const NotificationCentre: FC = () => {
  const { currentEra } = useEra();
  const { account } = useAccount();
  const [open, setOpen] = useState(false);
  const notificationStore = useNotification();
  const { initNewNotification } = useMakeNotification();
  const { toastRestNotifications } = useToastNotificationModal();

  const init = async () => {
    await notificationStore.initNotification(account || '');
  };

  // initNewNotification must wait init finish.
  // react's update flow need to wait until next tick or pass as parameter.
  // I don't want to pass, just use useEffect to make sure init finish.
  useEffect(() => {
    init();
  }, [account]);
  useEffect(() => {
    if (notificationStore.mounted && !currentEra.loading && !currentEra.error) {
      initNewNotification();
    }
  }, [notificationStore.mounted, currentEra.data?.index, currentEra.loading, currentEra.error]);

  useEffect(() => {
    toastRestNotifications();
  }, [notificationStore.notificationList]);

  return (
    <div className={styles.notificationCentre}>
      <Popover
        arrow={false}
        placement={'bottom'}
        trigger="click"
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
        }}
        overlayClassName={styles.notificationCentrePopover}
        content={
          <div className={styles.notificationCentreContent}>
            <div className={styles.notificationCentreContentTitle}>
              <Typography variant="h5" weight={600}>
                Notification
              </Typography>

              <div
                className="flex-center"
                style={{
                  background: 'var(--sq-gray200)',
                  border: '1px solid #DFE3E880',
                  borderRadius: 4,
                  padding: '2px 8px',
                  marginLeft: 8,
                }}
              >
                <Typography variant="small" type="secondary">
                  {notificationStore.notificationList.length}
                </Typography>
              </div>
              <span style={{ flex: 1 }}></span>
              <Typography.Link>
                <IoIosClose
                  style={{ fontSize: 24, cursor: 'pointer' }}
                  onClick={() => {
                    setOpen(!open);
                  }}
                />
              </Typography.Link>
            </div>

            <div className={styles.notificationCentreContentInner}>
              {notificationStore.notificationList.length ? (
                <NotificationList></NotificationList>
              ) : (
                <EmptyNotification></EmptyNotification>
              )}
            </div>
          </div>
        }
      >
        <Badge
          dot={
            notificationStore.notificationList.length > 0 &&
            notificationStore.notificationList.some((i) => i.level === 'critical')
          }
          count={notificationStore.notificationList.length}
          color={
            notificationStore.notificationList.length > 0 &&
            notificationStore.notificationList.some((i) => i.level === 'critical')
              ? 'var(--sq-error)'
              : 'var(--sq-info)'
          }
        >
          <GoBell style={{ fontSize: 24, color: 'var(--sq-gray800)' }} />
        </Badge>
      </Popover>
    </div>
  );
};

export default NotificationCentre;
