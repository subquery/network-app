// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSize } from 'ahooks';

export const useIsMobile = () => {
  const size = useSize(document.body);

  return size?.width ? size.width < 768 : false;
};
