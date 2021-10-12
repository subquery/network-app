// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { buildASTSchema, extendSchema, GraphQLSchema, parse } from 'graphql';
import gql from 'graphql-tag';

export function truncateAddress(address: string): string {
  if (!address) {
    return address;
  }
  return `${address.substr(0, 6)}...${address.substr(address.length - 4)}`;
}

export function genesisHashToName(genesisHash: string): string {
  switch (genesisHash) {
    case '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3':
      return 'Polkadot';
    case '0x3fd7b9eb6a00376e5be61f01abb429ffb0b104be05eaff4d458da48fcd425baf':
      return 'Kusama';
    /* TODO add more network names */
    default:
      return genesisHash;
  }
}

export const CIDv0 = new RegExp(/Qm[1-9A-Za-z]{44}[^OIl]/i);
export const CIDv1 = new RegExp(
  /Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}/i,
);

const scalas = gql`
  scalar BigInt
  scalar BigDecimal
  scalar Date
  scalar Bytes
`;

const directives = gql`
  directive @derivedFrom(field: String!) on FIELD_DEFINITION
  directive @entity on OBJECT
  directive @jsonField on OBJECT
  directive @index(unique: Boolean) on FIELD_DEFINITION
`;

export function buildSchema(raw: string): GraphQLSchema {
  const base = extendSchema(buildASTSchema(scalas), directives);
  return extendSchema(base, parse(raw));
}
