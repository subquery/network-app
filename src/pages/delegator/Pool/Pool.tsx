// Copyright 2020-2025 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AppPageHeader } from '@components/AppPageHeader';
import { Typography } from '@subql/components';

import { useWeb3Store } from 'src/stores';

import { DelegationList } from '../DelegationsList';
import { Delegate } from './delegate/Delegate';
import { Undelegate } from './undelegate/Undelegate';
import { Withdrawals } from './withdraw/Withdrawals';
import { ConnectedPoolOverview } from './Overview';

const poolAddress = import.meta.env.VITE_DELEGATION_POOL_ADDRESS;

export function Pool() {
  const { contracts } = useWeb3Store();

  return (
    <>
      <AppPageHeader
        title={
          <div className="flex">
            <Typography variant="h5">Delegation Pool</Typography>
            <Delegate />
            <Undelegate />
          </div>
        }
        desc={`Delegate to a Pool which manages which Node Operators are delegated to optimising the rewards you earn less a smalle pool fee. In return for delegating, you will earn rewards in SQT from the delegation pool.`}
      />
      {/* TODO things to display
       * Comission
       * Current stake
       * Rewards
       * Account APY
       * Delegate, undelegate and withdraw buttons, transfer (Share token)
       */}

      <ConnectedPoolOverview delegationPool={contracts?.delegationPool} />
      {/*TODO update empty, no account or other messages to make sense within a pool*/}
      <DelegationList account={poolAddress} />
      <Withdrawals />
      {/* TODO show users pending withdrawls */}
    </>
  );
}

export default Pool;
