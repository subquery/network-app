// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApproveContract } from '@components';
import { openNotification } from '@subql/components';

import { useWeb3Store } from 'src/stores';

export const useAddAllowance = () => {
  const { contracts } = useWeb3Store();

  const addAllowance = async (contractName: ApproveContract, allowance: string) => {
    try {
      if (!contracts) throw new Error('Contracts not available');
      openNotification({
        type: 'info',
        description: 'Allowance not enough, increase allowance first',
        duration: 5,
      });
      const tx = await contracts.sqToken.approve(contracts[contractName].address, allowance);
      await tx?.wait();
      return tx;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const checkAllowanceEnough = async (contractName: ApproveContract, account: string, allowance: string) => {
    try {
      if (!contracts) throw new Error('Contracts not available');
      const currentAllowance = await contracts.sqToken.allowance(account, contracts[contractName].address);
      if (currentAllowance.lt(allowance)) {
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return {
    addAllowance,
    checkAllowanceEnough,
  };
};
