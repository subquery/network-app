// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FC, useEffect, useMemo, useState } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Typography } from '@subql/components';
import { idleCallback } from '@utils/idleCallback';
import { limitContract } from '@utils/limitation';
import { message } from 'antd';
import { toSvg } from 'jdenticon';

import { useIndexerMetadata } from '../../hooks';
import { useWeb3Name } from '../../hooks/useSpaceId';
import { truncateAddress } from '../../utils';
import Copy from '../Copy';
import IPFSImage from '../IPFSImage';
import styles from './IndexerDetails.module.less';

type Props = {
  size?: 'tiny' | 'normal' | 'large';
  name?: string;
  image?: string;
  address: string;
  fullAddress?: boolean;
  onClick?: (address: string) => void;
  onAddressClick?: (address: string) => void;
};

const sizeDict = {
  tiny: 18,
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
  const fetchWeb3 = useCallback(async () => {
    const fetchedWeb3 = await limitContract(() => fetchWeb3NameOnce(), `fetchWeb3Name-${address}`);
    if (fetchedWeb3) {
      const { web3Name } = fetchedWeb3;
      setWeb3Name(web3Name || '');
    }
  }, [fetchWeb3NameOnce, address]);

  const initWeb3 = useCallback(async () => {
    const cachedName = await fetchWeb3NameFromCache();
    if (cachedName && cachedName.expired > Date.now()) {
      setWeb3Name(cachedName.web3Name || '');
      return;
    }

    idleCallback(fetchWeb3);
  }, [fetchWeb3NameFromCache]);

  useEffect(() => {
    initWeb3();
  }, []);

  return (
    <div
      className={styles.indexer}
      onMouseEnter={fetchWeb3}
      onClick={(e) => {
        onClick?.(address);
        if (size === 'tiny') {
          e.stopPropagation();
          e.preventDefault();
          navigator.clipboard.writeText(address);
          message.success('Copied!');
        }
      }}
    >
      <IPFSImage src={image} renderPlaceholder={() => <Avatar size={size} address={address}></Avatar>} />

      <div className={`${styles.indexerText} overflowEllipsis`}>
        {sortedName && (
          <Typography
            className={styles.name}
            variant={
              {
                large: 'h5',
                normal: 'text',
                tiny: 'small',
              }[size] as 'h5' | 'text' | 'small'
            }
            weight={500}
          >
            {sortedName.length > 15 ? sortedName.slice(0, 15) + '...' : sortedName}
          </Typography>
        )}
        {size !== 'tiny' ? (
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
        ) : (
          ''
        )}
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
  clickToProfile?: boolean;
}> = ({ id, account, size = 'normal', clickToProfile, onAddressClick, onClick }) => {
  const { indexerMetadata, loading } = useIndexerMetadata(id);
  const navigate = useNavigate();

  return (
    <IndexerName
      size={size}
      name={loading ? undefined : id === account ? 'You' : indexerMetadata?.name}
      image={indexerMetadata?.image}
      address={id}
      onAddressClick={onAddressClick}
      onClick={
        clickToProfile
          ? () => {
              navigate(`/indexer/${id}`);
            }
          : onClick
      }
    />
  );
};

export const Avatar: FC<{ address?: string; size?: 'large' | 'normal' | 'tiny' }> = ({ address, size = 'normal' }) => {
  return (
    <div>
      <img src={`data:image/svg+xml;utf8,${encodeURIComponent(toSvg(address, sizeDict[size]))}`} alt="" />
    </div>
  );
};
