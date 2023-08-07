// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FC } from 'react';

import { ServiceAgreements } from './ServiceAgreements';

const IndexerServiceAgreements: FC = () => {
  return <ServiceAgreements USER_ROLE="indexer"></ServiceAgreements>;
};

export default IndexerServiceAgreements;
export { ServiceAgreements };
