// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ContractsProvider, EraProvider, IPFSProvider, Web3Provider } from '../../containers';
import { bytes32ToCid } from '../../utils';
import IndexerList from './IndexerList';

export default {
  title: 'IndexerList',
  component: IndexerList,
} as ComponentMeta<typeof IndexerList>;

const Template: ComponentStory<typeof IndexerList> = (args) => {
  return (
    <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
      <Web3Provider>
        <ContractsProvider>
          <EraProvider>
            <IndexerList {...args} />
          </EraProvider>
        </ContractsProvider>
      </Web3Provider>
    </IPFSProvider>
  );
};

export const Default = Template.bind({});

Default.args = {
  indexers: [
    {
      __typename: 'Indexer',
      id: '0x759Dc965026Ea8D6919451c0B1eaD337bD60ddeD',
      metadata: bytes32ToCid('0x2dc3357aab66608c90e276670994503108ddc2ba965b7cfe116897b493160761'),
      controller: null,
      commission: {
        era: 2,
        value: BigNumber.from(0),
        valueAfter: BigNumber.from(100),
      },
      totalStake: {
        era: 2,
        value: BigNumber.from(0),
        valueAfter: BigNumber.from('1001000000000000000000'),
      },
    },
  ],
};
