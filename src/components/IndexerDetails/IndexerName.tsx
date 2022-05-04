// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import styles from './IndexerDetails.module.css';
import { truncateAddress } from '../../utils';
import IPFSImage from '../IPFSImage';
import Copy from '../Copy';
import { Typography } from '@subql/react-ui';

type Props = {
  name?: string;
  image?: string;
  address: string;
  onAddressClick?: (address: string) => void;
};

const IndexerName: React.FC<Props> = ({ name, image, address, onAddressClick }) => {
  return (
    <div className={styles.indexer}>
      <IPFSImage src={image} renderPlaceholder={() => <Jazzicon diameter={45} seed={jsNumberForAddress(address)} />} />
      <div className={styles.indexerText}>
        <Typography>{name}</Typography>
        <div className={styles.addressCont}>
          <Typography
            variant="small"
            className={`${styles.address} ${onAddressClick && styles.onHoverAddress}`}
            onClick={() => onAddressClick && onAddressClick(address)}
          >
            {truncateAddress(address)}
          </Typography>
          <Copy value={address} className={styles.copy} iconClassName={styles.copyIcon} />
        </div>
      </div>
    </div>
  );
};

export default IndexerName;
