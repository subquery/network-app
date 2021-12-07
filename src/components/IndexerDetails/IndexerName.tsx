// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import styles from './IndexerDetails.module.css';
import { truncateAddress } from '../../utils';
import IPFSImage from '../IPFSImage';
import Copy from '../Copy';

type Props = {
  name?: string;
  image?: string;
  address: string;
};

const IndexerName: React.FC<Props> = ({ name, image, address }) => {
  return (
    <div className={styles.indexer}>
      <IPFSImage src={image} renderPlaceholder={() => <Jazzicon diameter={45} seed={jsNumberForAddress(address)} />} />
      <div className={styles.indexerText}>
        <span className={styles.name}>{name}</span>
        <div className={styles.addressCont}>
          <span className={styles.address}>{truncateAddress(address)}</span>
          <Copy value={address} className={styles.copy} iconClassName={styles.copyIcon} />
        </div>
      </div>
    </div>
  );
};

export default IndexerName;
