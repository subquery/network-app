// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import styles from './BreadcrumbNav.module.css';

interface BreadcrumbProps {
  BACKLINK: string;
  backLinkText: string;
  childText: string;
}

export const BreadcrumbNav: React.FC<BreadcrumbProps> = ({ BACKLINK, backLinkText, childText }) => {
  return (
    <Breadcrumb separator="/">
      <Breadcrumb.Item className={styles.title}>
        <Link to={BACKLINK}>{backLinkText}</Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item className={styles.title}>{childText}</Breadcrumb.Item>
    </Breadcrumb>
  );
};
