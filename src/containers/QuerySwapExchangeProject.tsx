// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery, gql, QueryResult } from '@apollo/client';
import { GetOrdersVariables, GetOrders_orders } from '../__generated__/swapExchange/GetOrders';
import { SWAP_EXCHANGE_CLIENT } from './QueryApolloProvider';

const GET_ORDERS = gql`
  query GetOrders($swapFrom: String!, $now: Datetime!) {
    orders(
      orderBy: EXPIRE_DATE_DESC
      filter: { status: { equalTo: "ACTIVE" }, expireDate: { greaterThan: $now }, tokenGive: { equalTo: $swapFrom } }
    ) {
      totalCount
      nodes {
        id
        sender
        status
      }
    }
  }
`;

export function useOrders(params: GetOrdersVariables): QueryResult<GetOrders_orders> {
  return useQuery<GetOrders_orders, GetOrdersVariables>(GET_ORDERS, {
    context: { clientName: SWAP_EXCHANGE_CLIENT },
    pollInterval: 20000,
  });
}
