// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import EventEmitter from 'eventemitter3';

export enum EVENT_TYPE {
  CREATED_CONSUMER_OFFER = 'CREATED_CONSUMER_OFFER',
}

const EventBus = new EventEmitter();

export { EventBus };
