// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useParams } from 'react-router';
import { useDelegations } from '../../../containers';

type Props = {};

const Delegator: React.FC<Props> = (props) => {
  const { address } = useParams<{ address: string }>();

  const delegations = useDelegations({ delegator: address });

  return null;
};

export default Delegator;
