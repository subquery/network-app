// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useLocation } from 'react-router';

export function useRouteQuery(): URLSearchParams {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
