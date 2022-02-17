// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@subql/react-ui/dist/components/Table';
import assert from 'assert';
import { BigNumber, utils } from 'ethers';
import * as React from 'react';
import { useContracts, useWithdrawls } from '../../../containers';
import { useAsyncMemo } from '../../../hooks';
import { mapAsync, notEmpty, renderAsyncArray, AsyncData, renderAsync, bnToDate } from '../../../utils';
import { GetWithdrawls_withdrawls_nodes as Withdrawl } from '../../../__generated__/GetWithdrawls';

type Props = {
  delegatorAddress: string;
};

const WithdrawlItem: React.FC<{ withdrawl: Withdrawl; lockPeriod: AsyncData<BigNumber> }> = ({
  withdrawl,
  lockPeriod,
}) => {
  return (
    <TableRow>
      <TableCell>
        <Typography>{utils.formatEther(BigNumber.from(withdrawl.amount))}</Typography>
      </TableCell>
      <TableCell>
        {renderAsync(lockPeriod, {
          loading: () => <Spinner />,
          error: () => <Typography>Failed to load</Typography>,
          data: (data) => (
            <Typography>
              {new Date(withdrawl.startTime.getTime() + (data?.toNumber() ?? 0)).toLocaleString()}
            </Typography>
          ),
        })}
      </TableCell>
    </TableRow>
  );
};

const Withdrawls: React.FC<Props> = ({ delegatorAddress }) => {
  const pendingContracts = useContracts();
  const withdrawls = useWithdrawls({ delegator: delegatorAddress });

  const withdrawls2 = useAsyncMemo<Withdrawl[]>(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');

    const raw = await contracts.staking.getUnbondingAmounts(delegatorAddress);

    return raw.map((d, index) => ({
      startTime: bnToDate(d.startTime),
      amount: d.amount.toBigInt(),
      __typename: 'Withdrawl',
      delegator: delegatorAddress,
      indexer: '',
      id: index.toString(),
      index: BigInt(index),
      claimed: false,
    }));
  }, [pendingContracts, delegatorAddress]);

  const lockPeriod = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');

    return contracts.staking.lockPeriod();
  }, [pendingContracts]);

  return renderAsyncArray(
    withdrawls2,
    //mapAsync(data => data.withdrawls?.nodes.filter(notEmpty), withdrawls),
    {
      error: (e) => <Typography>{`Failed to get withdrawls: ${e.message}`}</Typography>,
      loading: () => <Spinner />,
      empty: () => <Typography>You have no pending withdrawls.</Typography>,
      data: (data) => (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>Unlock date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((withdrawl) => (
                <WithdrawlItem withdrawl={withdrawl} lockPeriod={lockPeriod} key={withdrawl.id} />
              ))}
            </TableBody>
          </Table>
        </>
      ),
    },
  );
};

export default Withdrawls;
