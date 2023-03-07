// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Breadcrumb } from 'antd';
import { NavLink } from 'react-router-dom';
import styles from './BreadcrumbNav.module.css';

interface BreadcrumbProps {
  backLink: string;
  backLinkText: string;
  childText: string;
}

export const BreadcrumbNav: React.FC<BreadcrumbProps> = ({ backLink, backLinkText, childText }) => {
  return (
    <Breadcrumb separator="/">
      <Breadcrumb.Item className={styles.title}>
        <NavLink to={backLink}>{backLinkText}</NavLink>
      </Breadcrumb.Item>
      <Breadcrumb.Item className={styles.title}>{childText}</Breadcrumb.Item>
    </Breadcrumb>
  );
};
