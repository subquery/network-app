// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ContractsProvider, EraProvider, IPFSProvider, Web3Provider } from '../../containers';
import DelegatorsList from './DelegatorsList';

export default {
  title: 'DelegatorsList',
  component: DelegatorsList,
} as ComponentMeta<typeof DelegatorsList>;

const Template: ComponentStory<typeof DelegatorsList> = (args) => {
  return (
    <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
      <Web3Provider>
        <ContractsProvider>
          <EraProvider>
            <DelegatorsList {...args} />
          </EraProvider>
        </ContractsProvider>
      </Web3Provider>
    </IPFSProvider>
  );
};

export const Default = Template.bind({});

Default.args = {
  delegators: [
    {
      __typename: 'Delegation',
      delegatorId: '0x759Dc965026Ea8D6919451c0B1eaD337bD60ddeD',
      amount: {
        era: 2,
        value: BigNumber.from(0),
        valueAfter: BigNumber.from('1001000000000000000000'),
      },
    },
  ],
};
