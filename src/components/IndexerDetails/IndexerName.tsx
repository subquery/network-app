// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FC, useEffect, useMemo, useState } from 'react';
import { Typography } from '@subql/components';
import { limitQueue } from '@utils/limitation';
import { toSvg } from 'jdenticon';

import { useIndexerMetadata } from '../../hooks';
import { useWeb3Name } from '../../hooks/useSpaceId';
import { truncateAddress } from '../../utils';
import Copy from '../Copy';
import IPFSImage from '../IPFSImage';
import styles from './IndexerDetails.module.less';

type Props = {
  size?: 'normal' | 'large';
  name?: string;
  image?: string;
  address: string;
  fullAddress?: boolean;
  onClick?: (address: string) => void;
  onAddressClick?: (address: string) => void;
};

const sizeDict = {
  small: 32,
  normal: 46,
  large: 72,
};

export const IndexerName: React.FC<Props> = ({
  name,
  image,
  address,
  fullAddress,
  size = 'normal',
  onClick,
  onAddressClick,
}) => {
  const { fetchWeb3NameOnce, fetchWeb3NameFromCache } = useWeb3Name(address);
  const [web3Name, setWeb3Name] = useState<string>();

  const sortedName = useMemo(() => {
    return web3Name || name || `${address.slice(0, 6)}...${address.slice(address.length - 4, address.length)}`;
  }, [name, web3Name]);

  const fetchWeb3 = async () => {
    const fetchedWeb3 = await limitQueue.add(() => fetchWeb3NameOnce());
    if (fetchedWeb3) {
      setWeb3Name(fetchedWeb3);
    }
  };

  const initWeb3 = async () => {
    const cachedName = await fetchWeb3NameFromCache();
    if (cachedName) {
      setWeb3Name(cachedName);
      return;
    }

    fetchWeb3();
  };

  useEffect(() => {
    initWeb3();
  }, []);

  return (
    <div
      className={styles.indexer}
      onMouseEnter={fetchWeb3}
      onClick={() => {
        onClick?.(address);
      }}
    >
      <IPFSImage src={image} renderPlaceholder={() => <Avatar size={size} address={address}></Avatar>} />

      <div className={`${styles.indexerText} overflowEllipsis`}>
        {sortedName && (
          <Typography className={styles.name} variant={size === 'large' ? 'h5' : 'text'} weight={500}>
            {sortedName.length > 15 ? sortedName.slice(0, 15) + '...' : sortedName}
          </Typography>
        )}
        <div>
          <Copy
            position={'flex-start'}
            value={address}
            className={styles.copy}
            iconClassName={styles.copyIcon}
            iconSize={6}
          >
            <Typography
              variant={size === 'large' ? 'medium' : 'small'}
              className={`${styles.address} ${onAddressClick && styles.onHoverAddress}`}
              style={{ cursor: 'copy' }}
            >
              {fullAddress ? address : truncateAddress(address)}
            </Typography>
          </Copy>
        </div>
      </div>
    </div>
  );
};

export const ConnectedIndexer: React.FC<{
  id: string;
  size?: 'large' | 'normal';
  account?: string | null;
  onAddressClick?: (id: string) => void;
  onClick?: (address: string) => void;
}> = ({ id, account, size = 'normal', onAddressClick, onClick }) => {
  const { indexerMetadata, loading } = useIndexerMetadata(id);

  return (
    <IndexerName
      size={size}
      name={loading ? undefined : id === account ? 'You' : indexerMetadata?.name}
      image={indexerMetadata?.image}
      address={id}
      onAddressClick={onAddressClick}
      onClick={onClick}
    />
  );
};

export const Avatar: FC<{ address?: string; size?: 'large' | 'normal' }> = ({ address, size = 'normal' }) => {
  return (
    <div>
      <img src={`data:image/svg+xml;utf8,${encodeURIComponent(toSvg(address, sizeDict[size]))}`} alt="" />
    </div>
  );
};
