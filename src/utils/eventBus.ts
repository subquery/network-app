// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export enum EVENT_TYPE {
  'CREATED_CONSUMER_OFFER' = 'CREATED_CONSUMER_OFFER',
}

// simple use document.
// TODO: build the type later
const EventBus = {
  $on(eventType: EVENT_TYPE, callback: (args: Event) => void) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    document.addEventListener(eventType, (e) => callback(e.detail));
  },

  $dispatch<T>(eventType: EVENT_TYPE, data: T) {
    const event = new CustomEvent(eventType, { detail: data });
    document.dispatchEvent(event);
  },

  $remove(eventType: EVENT_TYPE, callback: () => void) {
    document.removeEventListener(eventType, callback);
  },
};

export { EventBus };
