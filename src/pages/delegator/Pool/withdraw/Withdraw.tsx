import TransactionModal from '@components/TransactionModal';
import { useWeb3 } from '@containers';
import { Typography } from '@subql/components';
import { formatSQT } from '@subql/react-hooks';
import { TOKEN } from '@utils';
import { Button } from 'antd';
import assert from 'assert';

import { useWeb3Store } from 'src/stores';

export function Withdraw({ amount }: { amount: bigint }) {
  const { contracts } = useWeb3Store();
  const { account } = useWeb3();

  const handleClick = async () => {
    assert(contracts, 'Contracts not available');

    return contracts.delegationPool.withdraw();
  };

  const handleSuccess = () => {
    // TODO reload data
  };

  return (
    <TransactionModal
      loading={false}
      text={{
        title: 'Withdraw from Pool',
        steps: ['Confirm withdrawal'],
        submitText: 'Confirm',
        failureText: 'Withdrawal failed, please try again later',
        successText: 'Withdrawal successful',
      }}
      actions={[
        {
          label: 'Withdraw',
          key: 'withdraw',
          disabled: false,
          onClick: () => {
            // TODO reload any data after withdrawal
          },
        },
      ]}
      onClick={handleClick}
      width="540px"
      renderContent={(onSubmit) => {
        return (
          <div>
            <Typography>
              Withdraw your unlocked {formatSQT(amount)}
              {TOKEN} from the delegation pool.
            </Typography>
            <Button type="primary" shape="round" size="large" onClick={onSubmit} style={{ marginTop: '20px' }}>
              Withdraw
            </Button>
          </div>
        );
      }}
    />
  );
}
