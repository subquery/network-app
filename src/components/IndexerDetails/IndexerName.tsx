// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import styles from './IndexerDetails.module.css';
import { truncateAddress } from '../../utils';
import IPFSImage from '../IPFSImage';
import Copy from '../Copy';
import { Typography } from '@subql/react-ui';
import { useIndexerMetadata } from '../../hooks';
import { useENS } from '../../hooks/useEns';

type Props = {
  name?: string;
  image?: string;
  address: string;
  fullAddress?: boolean;
  onAddressClick?: (address: string) => void;
};

export const IndexerName: React.FC<Props> = ({ name, image, address, fullAddress, onAddressClick }) => {
  return (
    <div className={styles.indexer}>
      <IPFSImage src={image} renderPlaceholder={() => <Jazzicon diameter={45} seed={jsNumberForAddress(address)} />} />
      <div className={styles.indexerText}>
        {name && <Typography>{name}</Typography>}
        <div>
          <Copy value={address} className={styles.copy} iconClassName={styles.copyIcon}>
            <Typography variant="small" className={`${styles.address} ${onAddressClick && styles.onHoverAddress}`}>
              {fullAddress ? address : truncateAddress(address)}
            </Typography>
          </Copy>
        </div>
      </div>
    </div>
  );
};

export const ConnectedIndexer: React.VFC<{
  id: string;
  account?: string | null;
  onAddressClick?: (id: string) => void;
}> = ({ id, account, onAddressClick }) => {
  const asyncMetadata = useIndexerMetadata(id);
  const asyncEns = useENS(id);

  return (
    <IndexerName
      name={id === account ? 'You' : asyncEns.data ?? asyncMetadata.data?.name}
      image={asyncMetadata.data?.image}
      address={id}
      onAddressClick={onAddressClick}
    />
  );
};
