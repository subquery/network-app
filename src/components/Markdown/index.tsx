// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import MarkdownCompiler from 'react-markdown';

import styles from './index.module.less';

interface IProps {
  children: string | null | undefined;
}

const Markdown: FC<IProps> = (props) => {
  return (
    <div className={styles.markdown}>
      <MarkdownCompiler>{props.children}</MarkdownCompiler>
    </div>
  );
};
export default Markdown;
