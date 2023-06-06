// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NavLink } from 'react-router-dom';
import { Breadcrumb } from 'antd';

interface BreadcrumbProps {
  backLink: string;
  backLinkText: string;
  childText: string;
}

export const BreadcrumbNav: React.FC<BreadcrumbProps> = ({ backLink, backLinkText, childText }) => {
  const items = [
    {
      title: <NavLink to={backLink}>{backLinkText}</NavLink>,
    },
    {
      title: childText,
    },
  ];
  return <Breadcrumb separator="/" items={items} />;
};
