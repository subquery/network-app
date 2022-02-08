// Copyright 2020-2022 OnFinality Limited authors & contributors
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
};

const IndexerName: React.FC<Props> = ({ name, image, address }) => {
  return (
    <div className={styles.indexer}>
      <IPFSImage src={image} renderPlaceholder={() => <Jazzicon diameter={45} seed={jsNumberForAddress(address)} />} />
      <div className={styles.indexerText}>
        <Typography>{name}</Typography>
        <div className={styles.addressCont}>
          <Typography variant="small" className={styles.address}>
            {truncateAddress(address)}
          </Typography>
          <Copy value={address} className={styles.copy} iconClassName={styles.copyIcon} />
        </div>
      </div>
    </div>
  );
};

export default IndexerName;
