// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery, gql, QueryResult } from '@apollo/client';
import {
  GetExpiredServiceAgreementsVariables,
  GetExpiredServiceAgreements,
} from '../__generated__/registry/GetExpiredServiceAgreements';
import {
  GetOngoingServiceAgreementsVariables,
  GetOngoingServiceAgreements,
} from '../__generated__/registry/GetOngoingServiceAgreements';
import {
  GetSpecificServiceAgreementsVariables,
  GetSpecificServiceAgreements,
} from '../__generated__/registry/GetSpecificServiceAgreements';
import { GetOwnOpenOffersVariables, GetOwnOpenOffers } from '../__generated__/registry/GetOwnOpenOffers';
import { GetOwnFinishedOffersVariables, GetOwnFinishedOffers } from '../__generated__/registry/GetOwnFinishedOffers';
import { GetOwnExpiredOffersVariables, GetOwnExpiredOffers } from '../__generated__/registry/GetOwnExpiredOffers';
import { GetAllOpenOffersVariables, GetAllOpenOffers } from '../__generated__/registry/GetAllOpenOffers';
import { GetSpecificOpenOffersVariables, GetSpecificOpenOffers } from '../__generated__/registry/GetSpecificOpenOffers';
import { GetAllDelegationsVariables, GetAllDelegations } from '../__generated__/registry/GetAllDelegations';
import { GetDelegation, GetDelegationVariables } from '../__generated__/registry/GetDelegation';
import { GetDelegationsVariables, GetDelegations } from '../__generated__/registry/GetDelegations';
import { GetDelegatorVariables, GetDelegator } from '../__generated__/registry/GetDelegator';
import { GetIndexerVariables, GetIndexer } from '../__generated__/registry/GetIndexer';
import { GetIndexerDelegators, GetIndexerDelegatorsVariables } from '../__generated__/registry/GetIndexerDelegators';
import { GetIndexerRewardsVariables, GetIndexerRewards } from '../__generated__/registry/GetIndexerRewards';
import { GetIndexersVariables, GetIndexers } from '../__generated__/registry/GetIndexers';
import { GetPlansVariables, GetPlans } from '../__generated__/registry/GetPlans';
import { GetPlanTemplatesVariables, GetPlanTemplates } from '../__generated__/registry/GetPlanTemplates';
import { GetRewardsVariables, GetRewards } from '../__generated__/registry/GetRewards';
import { GetSpecificPlansVariables, GetSpecificPlans } from '../__generated__/registry/GetSpecificPlans';
import { GetWithdrawlsVariables, GetWithdrawls } from '../__generated__/registry/GetWithdrawls';

const INDEXER_FIELDS = gql`
  fragment IndexerFields on Indexer {
    id
    metadata
    controller
    commission
    totalStake
  }
`;

export const PLAN_TEMPLATE_FIELDS = gql`
  fragment PlanTemplateFields on PlanTemplate {
    id
    period
    dailyReqCap
    rateLimit
    metadata
    active
  }
`;

export const PLAN_FIELDS = gql`
  fragment PlanFields on Plan {
    id
    active
    creator
    deploymentId
    price
  }
`;

const SERVICE_AGREEMENT_FIELDS = gql`
  fragment ServiceAgreementFields on ServiceAgreement {
    id
    deploymentId
    indexerAddress
    consumerAddress
    period
    lockedAmount
    startTime
    endTime
    deployment {
      id
      version
      project {
        id
        metadata
      }
    }
  }
`;

const GET_INDEXER = gql`
  ${INDEXER_FIELDS}
  query GetIndexer($address: String!) {
    indexer(id: $address) {
      ...IndexerFields
    }
  }
`;

const GET_INDEXERS = gql`
  ${INDEXER_FIELDS}
  query GetIndexers($offset: Int, $order: IndexersOrderBy = ID_ASC) {
    indexers(first: 10, offset: $offset, orderBy: [$order], filter: { active: { equalTo: true } }) {
      totalCount
      nodes {
        ...IndexerFields
      }
    }
  }
`;

const GET_INDEXER_DELEGATORS = gql`
  query GetIndexerDelegators($id: String!, $offset: Int) {
    indexer(id: $id) {
      delegations(offset: $offset, filter: { delegatorId: { notEqualTo: $id } }) {
        nodes {
          delegatorId
          amount
        }
      }
    }
  }
`;

const GET_DELEGATION = gql`
  query GetDelegation($id: String!) {
    delegation(id: $id) {
      amount
    }
  }
`;

const GET_ALL_DELEGATIONS = gql`
  query GetAllDelegations($offset: Int) {
    delegations(offset: $offset) {
      nodes {
        id
        delegatorId
        indexerId
        amount
        indexer {
          metadata
        }
      }
    }
  }
`;

const GET_DELEGATOR = gql`
  query GetDelegator($address: String!) {
    delegator(id: $address) {
      id
      totalDelegations
    }
  }
`;

const GET_DELEGATIONS = gql`
  query GetDelegations($delegator: String!, $offset: Int) {
    delegations(filter: { delegatorId: { equalTo: $delegator } }, offset: $offset) {
      totalCount
      nodes {
        id
        delegatorId
        indexerId
        amount
        indexer {
          metadata
          active
        }
      }
    }
  }
`;

const GET_WITHDRAWLS = gql`
  query GetWithdrawls($delegator: String!, $offset: Int) {
    withdrawls(filter: { delegator: { equalTo: $delegator }, status: { equalTo: ONGOING } }, offset: $offset) {
      nodes {
        id
        index
        delegator
        indexer
        startTime
        amount
        status
      }
    }
  }
`;

const GET_PLAN_TEMPLATES = gql`
  ${PLAN_TEMPLATE_FIELDS}
  query GetPlanTemplates($offset: Int) {
    planTemplates(first: 10, offset: $offset, filter: { active: { equalTo: true } }) {
      nodes {
        ...PlanTemplateFields
      }
    }
  }
`;

const GET_PLANS = gql`
  ${PLAN_TEMPLATE_FIELDS}
  ${PLAN_FIELDS}
  query GetPlans($address: String!) {
    plans(
      filter: { creator: { equalTo: $address }, and: { deploymentId: { isNull: true } }, active: { equalTo: true } }
    ) {
      nodes {
        ...PlanFields
        planTemplate {
          ...PlanTemplateFields
        }
      }
    }
  }
`;

const GET_SPECIFIC_PLANS = gql`
  ${PLAN_TEMPLATE_FIELDS}
  ${PLAN_FIELDS}
  query GetSpecificPlans($address: String) {
    deploymentIndexers(filter: { indexerId: { equalTo: $address } }) {
      nodes {
        deployment {
          id
          project {
            id
            metadata
          }
          plans(filter: { creator: { equalTo: $address }, and: { active: { equalTo: true } } }) {
            nodes {
              ...PlanFields
              planTemplate {
                ...PlanTemplateFields
              }
            }
          }
        }
      }
    }
  }
`;

const GET_SERVICE_AGREEMENTS = gql`
  ${SERVICE_AGREEMENT_FIELDS}
  query GetOngoingServiceAgreements($address: String!, $now: Datetime!) {
    serviceAgreements(
      filter: {
        or: [{ indexerAddress: { equalTo: $address } }, { consumerAddress: { equalTo: $address } }]
        endTime: { greaterThanOrEqualTo: $now }
      }
      orderBy: END_TIME_ASC
    ) {
      nodes {
        ...ServiceAgreementFields
      }
    }
  }
`;

const GET_EXPIRED_SERVICE_AGREEMENTS = gql`
  ${SERVICE_AGREEMENT_FIELDS}
  query GetExpiredServiceAgreements($address: String!, $now: Datetime!) {
    serviceAgreements(
      filter: {
        or: [{ indexerAddress: { equalTo: $address } }, { consumerAddress: { equalTo: $address } }]
        endTime: { lessThan: $now }
      }
      orderBy: END_TIME_ASC
    ) {
      nodes {
        ...ServiceAgreementFields
      }
    }
  }
`;

const GET_SPECIFIC_SERVICE_AGREEMENTS = gql`
  ${SERVICE_AGREEMENT_FIELDS}
  query GetSpecificServiceAgreements($deploymentId: String!, $now: Datetime!) {
    serviceAgreements(
      filter: { deploymentId: { equalTo: $deploymentId }, endTime: { lessThan: $now } }
      orderBy: END_TIME_ASC
    ) {
      nodes {
        ...ServiceAgreementFields
      }
    }
  }
`;

const GET_REWARDS = gql`
  query GetRewards($address: String!) {
    rewards(orderBy: CLAIMED_TIME_DESC, filter: { delegatorAddress: { equalTo: $address } }) {
      nodes {
        id
        delegatorAddress
        indexerAddress
        amount
        claimedTime
      }
    }
    unclaimedRewards(filter: { delegatorAddress: { equalTo: $address }, amount: { greaterThan: "0" } }) {
      totalCount
      nodes {
        id
        delegatorAddress
        indexerAddress
        amount
      }
    }
  }
`;

const GET_INDEXER_REWARDS = gql`
  query GetIndexerRewards($address: String!, $era1: String!, $era2: String!) {
    indexerRewards(
      filter: {
        indexerId: { equalTo: $address }
        and: { eraIdx: { equalTo: $era1 } }
        or: { eraIdx: { equalTo: $era2 } }
      }
    ) {
      nodes {
        id
        indexerId
        eraIdx
        amount
      }
    }
  }
`;

const OFFER_FIELDS = gql`
  fragment OfferFields on Offer {
    id
    consumer
    deployment {
      id
      project {
        id
        metadata
      }
    }
    planTemplate {
      id
      period
      dailyReqCap
      rateLimit
    }
    deposit
    minimumAcceptHeight
    expireDate
    limit # indexer cap
    accepted # accepted indexer amount
    reachLimit # whether reach limit
    withdrawn # withdraw by cancel event
  }
`;

const GET_OWN_OPEN_OFFERS = gql`
  ${OFFER_FIELDS}
  query GetOwnOpenOffers($consumer: String!, $now: Datetime!, $offset: Int) {
    offers(
      filter: { consumer: { equalTo: $consumer }, expireDate: { greaterThan: $now }, reachLimit: { equalTo: false } }
      first: 10
      offset: $offset
    ) {
      totalCount
      nodes {
        ...OfferFields
      }
    }
  }
`;

const GET_OWN_FINISHED_OFFERS = gql`
  ${OFFER_FIELDS}
  query GetOwnFinishedOffers($consumer: String!, $now: Datetime!, $offset: Int) {
    offers(
      filter: { consumer: { equalTo: $consumer }, expireDate: { greaterThan: $now }, reachLimit: { equalTo: true } }
      first: 10
      offset: $offset
    ) {
      totalCount
      nodes {
        ...OfferFields
      }
    }
  }
`;

const GET_OWN_EXPIRED_OFFERS = gql`
  ${OFFER_FIELDS}
  query GetOwnExpiredOffers($consumer: String!, $now: Datetime!, $offset: Int) {
    offers(
      filter: { consumer: { equalTo: $consumer }, expireDate: { lessThan: $now }, reachLimit: { equalTo: false } }
      first: 10
      offset: $offset
    ) {
      totalCount
      nodes {
        ...OfferFields
      }
    }
  }
`;

const GET_ALL_OPEN_OFFERS = gql`
  ${OFFER_FIELDS}
  query GetAllOpenOffers($now: Datetime!, $offset: Int) {
    offers(filter: { expireDate: { greaterThan: $now }, reachLimit: { equalTo: false } }, first: 10, offset: $offset) {
      totalCount
      nodes {
        ...OfferFields
      }
    }
  }
`;

const GET_SPECIFIC_OPEN_OFFERS = gql`
  ${OFFER_FIELDS}
  query GetSpecificOpenOffers($deploymentId: String!, $now: Datetime!, $offset: Int) {
    offers(
      filter: {
        expireDate: { greaterThan: $now }
        reachLimit: { equalTo: false }
        deploymentId: { equalTo: $deploymentId }
      }
      first: 10
      offset: $offset
    ) {
      totalCount
      nodes {
        ...OfferFields
      }
    }
  }
`;

export function useIndexer(params: GetIndexerVariables): QueryResult<GetIndexer> {
  return useQuery<GetIndexer, GetIndexerVariables>(GET_INDEXER, { variables: params, pollInterval: 20000 });
}

export function useIndexers(params: GetIndexersVariables): QueryResult<GetIndexers> {
  return useQuery<GetIndexers, GetIndexersVariables>(GET_INDEXERS, {
    variables: params,
    pollInterval: 20000,
  });
}

export function useIndexerDelegators(params: GetIndexerDelegatorsVariables): QueryResult<GetIndexerDelegators> {
  return useQuery<GetIndexerDelegators, GetIndexerDelegatorsVariables>(GET_INDEXER_DELEGATORS, { variables: params });
}

export function useDelegation(indexer: string, delegator: string): QueryResult<GetDelegation> {
  return useQuery<GetDelegation, GetDelegationVariables>(GET_DELEGATION, {
    variables: { id: `${indexer}:${delegator}` },
    pollInterval: 20000,
  });
}
export function useAllDelegations(params: GetAllDelegationsVariables): QueryResult<GetAllDelegations> {
  return useQuery<GetAllDelegations, GetAllDelegationsVariables>(GET_ALL_DELEGATIONS, { variables: params });
}

export function useDelegations(params: GetDelegationsVariables): QueryResult<GetDelegations> {
  return useQuery<GetDelegations, GetDelegationsVariables>(GET_DELEGATIONS, { variables: params, pollInterval: 10000 });
}

export function useWithdrawls(params: GetWithdrawlsVariables): QueryResult<GetWithdrawls> {
  return useQuery<GetWithdrawls, GetWithdrawlsVariables>(GET_WITHDRAWLS, { variables: params, pollInterval: 10000 });
}

export function usePlanTemplates(params: GetPlanTemplatesVariables): QueryResult<GetPlanTemplates> {
  return useQuery<GetPlanTemplates, GetPlanTemplatesVariables>(GET_PLAN_TEMPLATES, { variables: params });
}

export function usePlans(params: GetPlansVariables): QueryResult<GetPlans> {
  return useQuery<GetPlans, GetPlansVariables>(GET_PLANS, {
    variables: params,
    pollInterval: 20000,
  });
}

export function useSpecificPlansPlans(params: GetSpecificPlansVariables): QueryResult<GetSpecificPlans> {
  return useQuery<GetSpecificPlans, GetSpecificPlansVariables>(GET_SPECIFIC_PLANS, {
    variables: params,
    pollInterval: 20000,
  });
}

export function useServiceAgreements(
  params: GetOngoingServiceAgreementsVariables,
): QueryResult<GetOngoingServiceAgreements> {
  return useQuery<GetOngoingServiceAgreements, GetOngoingServiceAgreementsVariables>(GET_SERVICE_AGREEMENTS, {
    variables: params,
  });
}

export function useExpiredServiceAgreements(
  params: GetExpiredServiceAgreementsVariables,
): QueryResult<GetExpiredServiceAgreements> {
  return useQuery<GetExpiredServiceAgreements, GetExpiredServiceAgreementsVariables>(GET_EXPIRED_SERVICE_AGREEMENTS, {
    variables: params,
  });
}

export function useSpecificServiceAgreements(
  params: GetSpecificServiceAgreementsVariables,
): QueryResult<GetSpecificServiceAgreements> {
  return useQuery<GetSpecificServiceAgreements, GetSpecificServiceAgreementsVariables>(
    GET_SPECIFIC_SERVICE_AGREEMENTS,
    {
      variables: params,
    },
  );
}

export function useOwnOpenOffers(params: GetOwnOpenOffersVariables): QueryResult<GetOwnOpenOffers> {
  return useQuery<GetOwnOpenOffers, GetOwnOpenOffersVariables>(GET_OWN_OPEN_OFFERS, {
    variables: params,
  });
}

export function useOwnFinishedOffers(params: GetOwnFinishedOffersVariables): QueryResult<GetOwnFinishedOffers> {
  return useQuery<GetOwnFinishedOffers, GetOwnFinishedOffersVariables>(GET_OWN_FINISHED_OFFERS, {
    variables: params,
  });
}

export function useOwnExpiredOffers(params: GetOwnExpiredOffersVariables): QueryResult<GetOwnExpiredOffers> {
  return useQuery<GetOwnExpiredOffers, GetOwnExpiredOffersVariables>(GET_OWN_EXPIRED_OFFERS, {
    variables: params,
  });
}

export function useAllOpenOffers(params: GetAllOpenOffersVariables): QueryResult<GetAllOpenOffers> {
  return useQuery<GetAllOpenOffers, GetAllOpenOffersVariables>(GET_ALL_OPEN_OFFERS, {
    variables: params,
  });
}

export function useSpecificOpenOffers(params: GetSpecificOpenOffersVariables): QueryResult<GetSpecificOpenOffers> {
  return useQuery<GetSpecificOpenOffers, GetSpecificOpenOffersVariables>(GET_SPECIFIC_OPEN_OFFERS, {
    variables: params,
  });
}

export function useRewards(params: GetRewardsVariables): QueryResult<GetRewards> {
  return useQuery<GetRewards, GetRewardsVariables>(GET_REWARDS, { variables: params, pollInterval: 15000 });
}

export function useIndexerRewards(params: GetIndexerRewardsVariables): QueryResult<GetIndexerRewards> {
  return useQuery<GetIndexerRewards, GetIndexerRewardsVariables>(GET_INDEXER_REWARDS, { variables: params });
}

export function useDelegator(params: GetDelegatorVariables): QueryResult<GetDelegator> {
  return useQuery<GetDelegator, GetDelegatorVariables>(GET_DELEGATOR, { variables: params, pollInterval: 20000 });
}
