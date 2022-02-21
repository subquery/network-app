// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Spinner, Typography } from '@subql/react-ui';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@subql/react-ui/dist/components/Table';
import assert from 'assert';
import { BigNumber, utils } from 'ethers';
import * as React from 'react';
import { useContracts, useWithdrawls } from '../../../containers';
import { useAsyncMemo } from '../../../hooks';
import { mapAsync, notEmpty, renderAsyncArray, AsyncData, renderAsync } from '../../../utils';
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
        {renderAsync(
          mapAsync(
            (data) => new Date(new Date(withdrawl.startTime).getTime() + (data?.toNumber() ?? 0)).toLocaleString(),
            lockPeriod,
          ),
          {
            loading: () => <Spinner />,
            error: (e) => <Typography>{`Failed to load: ${e.message}`}</Typography>,
            data: (data) => <Typography>{data}</Typography>,
          },
        )}
      </TableCell>
    </TableRow>
  );
};

const Withdrawls: React.FC<Props> = ({ delegatorAddress }) => {
  const pendingContracts = useContracts();
  const withdrawls = useWithdrawls({ delegator: delegatorAddress });

  const lockPeriod = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');

    return contracts.staking.lockPeriod();
  }, [pendingContracts]);

  const handleWithdraw = async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');

    const tx = await contracts.staking.widthdraw();

    await tx.wait();

    // TODO loading button
    // TODO update withdrawls
    withdrawls.refetch();
  };

  return renderAsyncArray(
    mapAsync((data) => data.withdrawls?.nodes.filter(notEmpty), withdrawls),
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
          <Button label="Withdraw Unlocked Funds" onClick={handleWithdraw} />
        </>
      ),
    },
  );
};

export default Withdrawls;
