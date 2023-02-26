// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { COLORS } from '../../utils';
import { notification } from 'antd';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}

const borderColorMapping = {
  [NotificationType.INFO]: COLORS.primary,
  [NotificationType.SUCCESS]: COLORS.success,
  [NotificationType.ERROR]: COLORS.error,
};
interface NotificationProps {
  type?: NotificationType;
  title?: string;
  description?: string;
}

export const openNotificationWithIcon = ({
  type = NotificationType.INFO,
  title,
  description,
}: NotificationProps): void => {
  notification[type]({
    message: title ?? 'Notification',
    description: description,
    style: {
      borderBottom: `4px solid ${borderColorMapping[type] ?? borderColorMapping[NotificationType.INFO]}`,
      overflow: 'scroll',
    },
    duration: type === NotificationType.INFO ? 45 : 30,
  });
};
