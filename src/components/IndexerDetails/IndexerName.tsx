// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';
import { Typography } from '@subql/components';
import { limitQueue } from '@utils/limitation';
import { toSvg } from 'jdenticon';

import { useIndexerMetadata } from '../../hooks';
import { useENS } from '../../hooks/useEns';
import { truncateAddress } from '../../utils';
import Copy from '../Copy';
import IPFSImage from '../IPFSImage';
import styles from './IndexerDetails.module.less';

type Props = {
  size?: 'normal' | 'small' | 'large';
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
  const { fetchEnsNameOnce, fetchEnsFromCache } = useENS(address);
  const [ensName, setEnsName] = useState<string>();

  const sortedName = useMemo(() => {
    return ensName || name;
  }, [name, ensName]);

  const fetchEns = async () => {
    const fetchedEns = await limitQueue.add(() => fetchEnsNameOnce());
    if (fetchedEns) {
      setEnsName(fetchedEns);
    }
  };

  const initEns = async () => {
    const cachedName = await fetchEnsFromCache();
    if (cachedName) {
      setEnsName(cachedName);
      return;
    }

    fetchEns();
  };

  useEffect(() => {
    initEns();
  }, []);

  return (
    <div
      className={styles.indexer}
      onMouseEnter={fetchEns}
      onClick={() => {
        onClick?.(address);
      }}
    >
      <IPFSImage
        src={image}
        renderPlaceholder={() => (
          <div>
            <img src={`data:image/svg+xml;utf8,${encodeURIComponent(toSvg(address, sizeDict[size]))}`} alt="" />
          </div>
        )}
      />

      <div className={styles.indexerText}>
        {sortedName && (
          <Typography className={styles.name} variant={size === 'large' ? 'h5' : 'text'} weight={500}>
            {sortedName}
          </Typography>
        )}
        <div>
          <Copy position={'flex-start'} value={address} className={styles.copy} iconClassName={styles.copyIcon}>
            <Typography variant="small" className={`${styles.address} ${onAddressClick && styles.onHoverAddress}`}>
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
  size?: 'large' | 'small' | 'normal';
  account?: string | null;
  onAddressClick?: (id: string) => void;
  onClick?: (address: string) => void;
}> = ({ id, account, size = 'normal', onAddressClick, onClick }) => {
  const { indexerMetadata } = useIndexerMetadata(id);

  return (
    <IndexerName
      size={size}
      name={id === account ? 'You' : indexerMetadata?.name}
      image={indexerMetadata?.image}
      address={id}
      onAddressClick={onAddressClick}
      onClick={onClick}
    />
  );
};
