// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import assert from 'assert';
import { MoreOutlined } from '@ant-design/icons';
import styles from './MyFlexPlans.module.css';
import { Dropdown, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { useContracts, useSQToken } from '../../../containers';
import TransactionModal from '../../../components/TransactionModal';
import { ApproveContract, ModalApproveToken } from '../../../components';
import { parseEther } from 'ethers/lib/utils';
import { formatEther, TOKEN } from '../../../utils';

type TransferAction = 'Transfer' | 'Withdraw';
const Transfer = ({ action }: { action: TransferAction }) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();
  const { consumerHostAllowance, balance, consumerHostBalance } = useSQToken();
  const sortedBalance = balance.data;
  const sortedConsumerHostBalance = consumerHostBalance.data?.balance;
  const requireTokenApproval = consumerHostAllowance?.data?.isZero();

  const getModalText = (action: TransferAction) => {
    if (action === 'Transfer') {
      return {
        title: t('flexPlans.transfer'),
        steps: [t('flexPlans.addToken'), t('flexPlans.confirmTransfer')],
        description: t('flexPlans.transferDescription'),
        inputTitle: t('flexPlans.confirmTransfer'),
        submitText: t('flexPlans.confirmTransfer'),
        failureText: t('flexPlans.failureTransfer'),
        successText: t('flexPlans.successTransfer'),
      };
    }

    return {
      title: t('flexPlans.withdrawToken'),
      steps: [t('flexPlans.withdrawToken'), t('flexPlans.confirmWithdraw')],
      inputTitle: t('flexPlans.withdrawTitle'),
      inputBottomText: `Current Billing balance: ${formatEther(sortedConsumerHostBalance, 4)} ${TOKEN}`,
      submitText: t('flexPlans.withdrawToken'),
      failureText: t('flexPlans.failureWithdraw'),
      successText: t('flexPlans.successWithdraw'),
    };
  };

  const getActionBtn = (action: TransferAction) => {
    return action === 'Transfer'
      ? {
          label: t('flexPlans.transferToken'),
          key: 'billingTransfer',
        }
      : {
          label: t('flexPlans.withdrawToken'),
          key: 'billingWithdrawn',
          disabled: !!sortedConsumerHostBalance?.isZero(),
        };
  };

  const getMaxAmount = (action: TransferAction) => {
    return action === 'Transfer' ? formatEther(sortedBalance) : formatEther(sortedConsumerHostBalance);
  };

  const handleClick = async (amount: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');
    const sortedAmount = parseEther(amount.toString());

    if (action === 'Transfer') {
      return contracts.consumerHost.deposit(sortedAmount, true);
    }

    return contracts.consumerHost.withdraw(sortedAmount);
  };

  return (
    <TransactionModal
      text={getModalText(action)}
      actions={[getActionBtn(action)]}
      onClick={handleClick}
      inputParams={{
        showMaxButton: true,
        curAmount: getMaxAmount(action),
      }}
      onSuccess={() => {
        consumerHostBalance.refetch(true);
        balance.refetch(true);
      }}
      variant={'textBtn'}
      renderContent={(onSubmit, onCancel, isLoading, error) => {
        if (requireTokenApproval && action === 'Transfer') {
          return (
            <ModalApproveToken
              onSubmit={() => consumerHostAllowance.refetch()}
              contract={ApproveContract.ConsumerHost}
            />
          );
        }
      }}
    />
  );
};

export const BillingAction: React.VFC = () => {
  const menuList = (
    <Menu>
      <Menu.Item key={'Transfer'}>
        <Transfer action="Transfer" />
      </Menu.Item>
      <Menu.Item key={'Withdraw'}>
        <Transfer action="Withdraw" />
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menuList} trigger={['click']}>
      <a onClick={(e) => e.preventDefault()} href="/" className={styles.billingAction}>
        <MoreOutlined />
      </a>
    </Dropdown>
  );
};
