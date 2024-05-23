// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { GoAlertFill, GoBell } from 'react-icons/go';
import { IoIosAlert, IoIosClose } from 'react-icons/io';
import { useNavigate } from 'react-router';
import { useSQToken } from '@containers/SQToken';
import { useAccount } from '@containers/Web3';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Typography } from '@subql/components';
import { useGetFilteredDelegationsLazyQuery, useGetRewardsLazyQuery } from '@subql/react-hooks';
import { formatSQT } from '@utils';
import { waitForSomething } from '@utils/waitForSomething';
import { Badge, Button, Modal, Popover } from 'antd';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';

import { useWeb3Store } from 'src/stores';
import { type NotificationItem as NotificationItemType, useNotification } from 'src/stores/notification';

import styles from './index.module.less';

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
              {noti.message ? <Typography style={{ textAlign: 'center' }}>{noti.message}</Typography> : ''}
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
          },
          // eslint-disable-next-line no-loop-func
          onOk: () => {
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
          // eslint-disable-next-line no-loop-func
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
          // eslint-disable-next-line no-loop-func
          func: () => {
            return continueShowToastStatus !== 'pending';
          },
          splitTime: 500,
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (continueShowToastStatus === 'stop') {
          notificationStore.removeNotification(noti);
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

const idleTimeout = (func: () => void) => setTimeout(func, 200);
const idleCallback = window.requestIdleCallback || idleTimeout;

export const useMakeNotification = () => {
  const notificationStore = useNotification();
  const { contracts } = useWeb3Store();
  const { account } = useAccount();
  const [fetchRewardsApi] = useGetRewardsLazyQuery();
  const { consumerHostBalance } = useSQToken();
  const { getHostingPlanApi } = useConsumerHostServices({
    autoLogin: false,
  });

  // TODO: filter inactive by Graphql
  const [fetchDelegations] = useGetFilteredDelegationsLazyQuery();

  const makeOverAllocateAndUnStakeAllocationNotification = useCallback(async () => {
    // over and unused share same api, so must query both at the same time
    // TODO: Maybe can optimise
    if (
      notificationStore.notificationList.find((item) => item.key === 'overAllocate') &&
      notificationStore.notificationList.find((item) => item.key === 'unstakeAllocation')
    ) {
      return;
    }
    const res = await contracts?.stakingAllocation.runnerAllocation(account || '');
    const runnerAllocation = {
      used: formatSQT(res?.used.toString() || '0'),
      total: formatSQT(res?.total.toString() || '0'),
    };

    const isOverAllocated = +runnerAllocation?.used > +runnerAllocation?.total;
    const isUnused = +runnerAllocation.total - +runnerAllocation.used > 1000;
    if (isUnused && !notificationStore.notificationList.find((item) => item.key === 'overAllocate')) {
      // add a notification to inform user that they have unused allocation
      notificationStore.addNotification({
        key: 'unstakeAllocation',
        level: 'info',
        message: `You have ${+runnerAllocation.total - +runnerAllocation.used} SQT unused`,
        title: 'Unused Allocation',
        createdAt: Date.now(),
        canBeDismissed: true,
        dismissTime: 1000 * 60 * 60 * 24,
        dismissTo: undefined,
        type: '',
        buttonProps: {
          label: 'Unstake Allocation',
          navigateHref: '/indexer',
        },
      });
    }
    if (isOverAllocated && !notificationStore.notificationList.find((item) => item.key === 'overAllocate')) {
      notificationStore.addNotification({
        key: 'overAllocate',
        level: 'critical',
        message: `You have used ${runnerAllocation.used} SQT out of ${runnerAllocation.total} SQT allocated`,
        title: 'Over Allocation',
        createdAt: Date.now(),
        canBeDismissed: true,
        dismissTime: 1000 * 60 * 60 * 24,
        dismissTo: undefined,
        type: '',
        buttonProps: {
          label: 'Increase Allocation',
          navigateHref: '/indexer',
        },
      });
      notificationStore.sortNotificationList();
    }
  }, [account, contracts, notificationStore.notificationList]);

  const makeUnClaimedNotification = useCallback(async () => {
    if (notificationStore.notificationList.find((item) => item.key === 'unclaimedRewards')) {
      return;
    }
    const res = await fetchRewardsApi({
      variables: {
        address: account || '',
      },
      fetchPolicy: 'network-only',
    });

    if (res.data?.unclaimedRewards?.totalCount) {
      notificationStore.addNotification({
        key: 'unclaimedRewards',
        level: 'info',
        message: '',
        title: 'Unclaimed Rewards',
        createdAt: Date.now(),
        canBeDismissed: true,
        dismissTime: 1000 * 60 * 60 * 24,
        dismissTo: undefined,
        type: '',
        buttonProps: {
          label: 'Claim Rewards',
          navigateHref: '/profile/rewards',
        },
      });
    }
  }, [account, notificationStore.notificationList]);

  const makeLowBillingBalanceNotification = useCallback(async () => {
    if (notificationStore.notificationList.find((item) => item.key === 'lowBillingBalance')) {
      return;
    }

    const hostingPlan = await getHostingPlanApi({ account: account || '' });
    if (!hostingPlan?.data?.length) {
      return;
    }

    const res = await consumerHostBalance?.refetch();
    const [billingBalance] = res?.data || [];
    if (
      !BigNumberJs(formatSQT(billingBalance?.toString() || '0')).isZero() &&
      BigNumberJs(formatSQT(billingBalance?.toString() || '0')).lt(400)
    ) {
      notificationStore.addNotification({
        key: 'lowBillingBalance',
        level: 'critical',
        message:
          'Your Billing account balance is running low. Please top up your Billing account promptly to avoid any disruption in usage.',
        title: 'Low Billing Balance',
        createdAt: Date.now(),
        canBeDismissed: true,
        dismissTime: 1000 * 60 * 60 * 24,
        dismissTo: undefined,
        type: '',
        buttonProps: {
          label: 'Add Balance',
          navigateHref: '/consumer/flex-plans/ongoing',
        },
      });
      notificationStore.sortNotificationList();
    }
  }, [account, notificationStore.notificationList]);

  const makeInactiveOperatorNotification = useCallback(async () => {
    if (notificationStore.notificationList.find((item) => item.key === 'inactiveOperator')) return;
    const res = await fetchDelegations({
      variables: { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 },
      fetchPolicy: 'network-only',
    });

    if (res.data?.delegations?.nodes.some((i) => i?.indexer?.active === false)) {
      notificationStore.addNotification({
        key: 'inactiveOperator',
        level: 'critical',
        message:
          'This node operator has unregistered from SubQuery Network and you are receiving no more rewards. You should redelegate your SQT to another Node Operator to continue to receive rewards.',
        title: 'Node Operator Inactive',
        createdAt: Date.now(),
        canBeDismissed: true,
        dismissTime: 1000 * 60 * 60 * 24,
        dismissTo: undefined,
        type: '',
        buttonProps: {
          label: 'Change Delegation',
          navigateHref: '/delegator/my-delegation',
        },
      });
      notificationStore.sortNotificationList();
    }
  }, [account, notificationStore.notificationList]);

  const initAllNotification = useCallback(async () => {
    await makeUnClaimedNotification();
    await makeOverAllocateAndUnStakeAllocationNotification();
    await makeLowBillingBalanceNotification();
  }, [makeOverAllocateAndUnStakeAllocationNotification, makeUnClaimedNotification, makeLowBillingBalanceNotification]);

  return {
    makeOverAllocateNotification: () => idleCallback(makeOverAllocateAndUnStakeAllocationNotification),
    makeUnClaimedNotification: () => idleCallback(makeUnClaimedNotification),
    makeLowBillingBalanceNotification: () => idleCallback(makeLowBillingBalanceNotification),
    initNewNotification: () => idleCallback(initAllNotification),
  };
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
  const { account } = useAccount();
  const [open, setOpen] = useState(false);
  const notificationStore = useNotification();
  const { initNewNotification } = useMakeNotification();
  const { toastRestNotifications } = useToastNotificationModal();

  const init = async () => {
    await notificationStore.initNotification(account || '');
  };

  useEffect(() => {
    init();
  }, [account]);

  useEffect(() => {
    if (notificationStore.mounted) {
      initNewNotification();
    }
  }, [notificationStore.mounted]);

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
