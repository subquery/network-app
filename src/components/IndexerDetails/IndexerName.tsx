// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { Typography } from '@subql/components';

import { useIndexerMetadata } from '../../hooks';
import { useENS } from '../../hooks/useEns';
import { truncateAddress } from '../../utils';
import Copy from '../Copy';
import IPFSImage from '../IPFSImage';
import styles from './IndexerDetails.module.css';

type Props = {
  name?: string;
  image?: string;
  address: string;
  fullAddress?: boolean;
  onAddressClick?: (address: string) => void;
};

export const IndexerName: React.FC<Props> = ({ name, image, address, fullAddress, onAddressClick }) => {
  const asyncEns = useENS(address);
  const sortedName = asyncEns.data ?? name;
  return (
    <div className={styles.indexer}>
      <IPFSImage
        src={image}
        renderPlaceholder={() => (
          <Jazzicon paperStyles={{ flexShrink: 0 }} diameter={45} seed={jsNumberForAddress(address)} />
        )}
      />
      <div className={styles.indexerText}>
        {sortedName && <Typography className={styles.name}>{sortedName}</Typography>}
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
  account?: string | null;
  onAddressClick?: (id: string) => void;
}> = ({ id, account, onAddressClick }) => {
  const { indexerMetadata } = useIndexerMetadata(id);

  return (
    <IndexerName
      name={id === account ? 'You' : indexerMetadata?.name}
      image={indexerMetadata?.image}
      address={id}
      onAddressClick={onAddressClick}
    />
  );
};
