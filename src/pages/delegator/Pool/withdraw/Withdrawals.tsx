import Status, { StatusColor } from '@components/Status/Status';
import { useWeb3 } from '@containers';
import { useAsyncMemo } from '@hooks';
import { Spinner, TableText, TableTitle, Typography } from '@subql/components';
import { formatSQT, mapAsync, mergeAsync, renderAsync } from '@subql/react-hooks';
import { TOKEN } from '@utils';
import { Table, TableProps } from 'antd';
import assert from 'assert';

import { useWeb3Store } from 'src/stores';

import { DelegationPool } from '../contracts/delegationPool';
import { Withdraw } from './Withdraw';
import style from './Withdraw.module.css';

type UnbondRequestWithDate = Omit<DelegationPool.UnbondRequestStructOutput, 'startTime'> & {
  startTime: Date;
  unlockTime: number;
  status: 'completed' | 'claimable' | 'pending';
};

const statusColors: Record<UnbondRequestWithDate['status'], StatusColor> = {
  completed: StatusColor.blue,
  claimable: StatusColor.green,
  pending: StatusColor.gray,
};

const getColumns = (): TableProps<UnbondRequestWithDate>['columns'] => [
  {
    title: <TableTitle title={'#'} />,
    key: 'idx',
    width: 50,
    render: (_: string, __: unknown, index: number) => <TableText content={index + 1} />,
  },
  {
    title: <TableTitle title={'Amount'} />,
    key: 'amount',
    render: (value: UnbondRequestWithDate) => (
      <Typography>
        {formatSQT(value.amount.toBigInt())} {TOKEN}
      </Typography>
    ),
  },
  {
    title: <TableTitle title={'Started'} />,
    key: 'started',
    render: (value: UnbondRequestWithDate) => <Typography>{value.startTime.toISOString()}</Typography>,
  },
  {
    title: <TableTitle title={'Started'} />,
    key: 'started',
    render: (value: UnbondRequestWithDate) => <Typography>{value.startTime.toISOString()}</Typography>,
  },
  {
    title: <TableTitle title={'Status'} />,
    key: 'status',
    render: (value: UnbondRequestWithDate) => <Status text={value.status} color={statusColors[value.status]} />,
  },
];

export function Withdrawals() {
  const { contracts } = useWeb3Store();
  const { account } = useWeb3();

  const lockPeriod = useAsyncMemo(async () => contracts?.staking.lockPeriod(), [contracts]);

  const pendingUnbonds = useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    const unbonds = await contracts.delegationPool.getPendingUnbonds(account);

    return unbonds.map((u) => ({ ...u, startTime: new Date(u.startTime.toNumber() * 1000) }));
  }, [account, contracts]);

  const claimable = mapAsync(
    ([lockPeriod, unbonds]): UnbondRequestWithDate[] => {
      if (!unbonds?.length) return [];
      if (!lockPeriod) return [];

      const lockPeriodMs = lockPeriod.toNumber() * 1000;

      return unbonds.map((u) => {
        const unlockTime = u.startTime.getTime() + lockPeriodMs;
        const status: 'completed' | 'claimable' | 'pending' = u.completed
          ? 'completed'
          : Date.now() >= unlockTime
            ? 'claimable'
            : 'pending';
        return { ...u, unlockTime, status };
      });
    },
    mergeAsync(lockPeriod, pendingUnbonds),
  );

  const claimableAmoount = mapAsync((claimables) => {
    return claimables.filter((c) => c.status === 'claimable').reduce((acc, curr) => acc + curr.amount.toBigInt(), 0n);
  }, claimable);

  return renderAsync(claimable, {
    loading: () => <Spinner />,
    error: (error) => <div>Error: {error.message}</div>,
    data: (data) => (
      <div>
        <div className={style.header}>
          <Typography>Your Withdrawls</Typography>
          {claimableAmoount.data! > 0n && <Withdraw amount={claimableAmoount.data ?? 0n} />}
        </div>
        <Table columns={getColumns()} dataSource={data} />
      </div>
    ),
  });
}
