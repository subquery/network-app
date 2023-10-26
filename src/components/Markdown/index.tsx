// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import MarkdownCompiler, { Options } from 'react-markdown';

import styles from './index.module.less';

const Markdown: FC<Options> = (props) => {
  return (
    <div className={styles.markdown}>
      <MarkdownCompiler {...props}></MarkdownCompiler>
    </div>
  );
};
export default Markdown;
