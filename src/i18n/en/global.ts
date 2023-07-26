// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

const translation = {
  errors: {
    transactionRejected: 'User rejected the request',
    failedToGetIndexerInfo: 'Failed to get indexer info: {{message}}',
  },
  general: {
    action: 'action',
    current: 'current',
    next: 'next',
    cancel: 'cancel',
    status: 'Status',
    back: 'Back',
    active: 'Active',
    inactive: 'Inactive',
    terminated: 'Terminated',
    terminating: 'Terminating',
    completed: 'Completed',
    comingSoon: 'Coming soon.',
    choose: 'choose',
    confirm: 'Confirm',
    confirmOnMetamask: 'Confirm On MetaMask',
    confirmCancellation: 'Confirm Cancellation',
    day: 'day',
    days: 'days',
    day_other: '{{count}} days',
    block: 'Block',
    blocks: 'Blocks',
    blockWithCount: '{{count}} Block',
    blockWithCount_other: '{{count}} Blocks',
    balance: 'Balance',
    frequent: 'Frequent',
    infrequent: 'Infrequent',
    enabled: 'Enabled',
    disabled: 'Disabled',
    price: 'price',
    connectAccount: 'Please connect account.',
    learnMoreHere: 'Learn more <1>here</1>',
    progress: 'progress',
    cancelUndelegation: 'Cancel Undelegation',
    cancelUndelegationTips:
      'If you cancel undelegation process, the following amount will be returned to delegation and you will continue to earn delegation rewards.',
    cancelUnstaking: 'Cancel Unstaking',
    cancelUnstakingTips:
      'If you cancel unstaking process, the following amount will be returned to staking and you will continue to earn staking rewards.',
  },
  status: {
    success: 'Success!',
    error: 'Sorry, there is something wrong',
    txSubmitted: 'Transaction has been submitted. Please wait for the transaction confirmed.',
    changeValidIn15s: 'Change will be reflected on dashboard in 15s.',
  },
  transaction: {
    submmited: 'Your transaction has been submitted! Please wait for around 30s.',
  },
} as const;

export default translation;
