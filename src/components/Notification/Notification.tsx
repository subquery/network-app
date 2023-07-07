// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NotificationProps } from '@subql/components';
import { openNotification } from '@subql/components';

export { openNotification };
export type { NotificationProps };

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}
