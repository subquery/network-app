// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useIPFS } from '../containers';
import { CIDv0, CIDv1 } from '../utils';

type Props = {
  src: string | File | undefined;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'>;

const IPFSImage: React.FC<Props> = ({ src, ...rest }) => {
  const [source, setSource] = React.useState<string>();
  const { catSingle } = useIPFS();

  React.useEffect(() => {
    if (typeof src === 'string') {
      const srcIPFS = src.replace('ipfs://', '');
      if (CIDv0.test(srcIPFS) || CIDv1.test(srcIPFS)) {
        catSingle(srcIPFS).then((data) => {
          setSource(`data:image/png;base64,${Buffer.from(data).toString('base64')}`);
        });
      } else {
        setSource(src);
      }
    } else if (src instanceof File) {
      setSource(URL.createObjectURL(src));
    } else {
      setSource(undefined);
    }
  }, [src, catSingle]);

  return <img src={source} {...rest} />;
};

export default IPFSImage;
