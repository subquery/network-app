// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import { useIPFS } from '../../containers';
import { CIDv0, CIDv1 } from '../../utils';

type Props = {
  src: string | File | undefined;
  renderPlaceholder?: () => React.ReactNode;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'>;

const IPFSImage: React.FC<Props> = ({ src, renderPlaceholder, ...rest }) => {
  const [source, setSource] = React.useState<string>();
  const ipfs = useIPFS();

  const { catSingle } = ipfs;
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

  if (!source && renderPlaceholder) {
    return <>{renderPlaceholder()}</>;
  }

  return <img src={source} alt="" {...rest} />;
};

export default IPFSImage;
