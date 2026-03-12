// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BsChatLeftDots } from 'react-icons/bs';
import { SubqlCard, Typography } from '@subql/components';
import Link from 'antd/es/typography/Link';

const DISCORD_CHANNELS = [
  {
    id: '1479054492501672007',
    title: 'General',
    url: 'https://discord.com/channels/796198414798028831/1479054492501672007',
  },
  {
    id: '1479055557817008149',
    title: 'Subquery-foundation',
    url: 'https://discord.com/channels/796198414798028831/1479055557817008149',
  },
  {
    id: '1479308156365701191',
    title: 'Technical-support',
    url: 'https://discord.com/channels/796198414798028831/1479308156365701191',
  },
  {
    id: '1479308193426444348',
    title: 'Questions-feedback',
    url: 'https://discord.com/channels/796198414798028831/1479308193426444348',
  },
  {
    id: '1479308237944651888',
    title: 'Mainnet-discussions',
    url: 'https://discord.com/channels/796198414798028831/1479308237944651888',
  },
];

export const ForumCard = () => {
  return (
    <SubqlCard
      title={
        <Typography style={{ display: 'flex', alignItems: 'flex-end' }}>
          Discord
          <BsChatLeftDots style={{ fontSize: 20, color: 'var(--sq-blue600)', marginLeft: 10 }}></BsChatLeftDots>
        </Typography>
      }
      width={302}
    >
      <div className="col-flex">
        {DISCORD_CHANNELS.map((channel) => {
          return (
            <Link
              key={channel.id}
              href={channel.url}
              className="col-flex"
              style={{ marginBottom: 16 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography variant="medium" style={{ marginBottom: 0 }}>
                #{channel.title}
              </Typography>
            </Link>
          );
        })}
        <Link href="https://discord.gg/subquery" target="_blank" rel="noopener noreferrer">
          Join Discord
        </Link>
      </div>
    </SubqlCard>
  );
};
