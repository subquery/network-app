// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { gql, QueryResult, useQuery } from '@apollo/client';

import { GetAllOpenOffers, GetAllOpenOffersVariables } from '../__generated__/registry/GetAllOpenOffers';
import { GetClosedFlexPlans, GetClosedFlexPlansVariables } from '../__generated__/registry/GetClosedFlexPlans';
import { GetDelegation, GetDelegationVariables } from '../__generated__/registry/GetDelegation';
import { GetDelegations, GetDelegationsVariables } from '../__generated__/registry/GetDelegations';
import { GetDelegator, GetDelegatorVariables } from '../__generated__/registry/GetDelegator';
import {
  GetExpiredServiceAgreements,
  GetExpiredServiceAgreementsVariables,
} from '../__generated__/registry/GetExpiredServiceAgreements';
import { GetIndexerRewards, GetIndexerRewardsVariables } from '../__generated__/registry/GetIndexerRewards';
import { GetOngoingFlexPlan, GetOngoingFlexPlanVariables } from '../__generated__/registry/GetOngoingFlexPlan';
import {
  GetOngoingServiceAgreements,
  GetOngoingServiceAgreementsVariables,
} from '../__generated__/registry/GetOngoingServiceAgreements';
import { GetOwnExpiredOffers, GetOwnExpiredOffersVariables } from '../__generated__/registry/GetOwnExpiredOffers';
import { GetOwnFinishedOffers, GetOwnFinishedOffersVariables } from '../__generated__/registry/GetOwnFinishedOffers';
import { GetOwnOpenOffers, GetOwnOpenOffersVariables } from '../__generated__/registry/GetOwnOpenOffers';
import { GetPlans, GetPlansVariables } from '../__generated__/registry/GetPlans';
import { GetPlanTemplates, GetPlanTemplatesVariables } from '../__generated__/registry/GetPlanTemplates';
import { GetRewards, GetRewardsVariables } from '../__generated__/registry/GetRewards';
import { GetSpecificOpenOffers, GetSpecificOpenOffersVariables } from '../__generated__/registry/GetSpecificOpenOffers';
import { GetSpecificPlans, GetSpecificPlansVariables } from '../__generated__/registry/GetSpecificPlans';
import {
  GetSpecificServiceAgreements,
  GetSpecificServiceAgreementsVariables,
} from '../__generated__/registry/GetSpecificServiceAgreements';
import { GetWithdrawls, GetWithdrawlsVariables } from '../__generated__/registry/GetWithdrawls';

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

const GET_DELEGATION = gql`
  query GetDelegation($id: String!) {
    delegation(id: $id) {
      amount
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

const STATE_CHANNEL_FIELDS = gql`
  fragment StateChannelFields on StateChannel {
    id
    indexer
    consumer
    status
    total
    price
    spent
    startTime
    expiredAt
    terminatedAt
    deployment {
      id
      project {
        metadata
      }
    }
  }
`;

const GET_CONSUMER_ONGOING_FLEX_PLANS = gql`
  ${STATE_CHANNEL_FIELDS}
  query GetOngoingFlexPlan($consumer: String!, $now: Datetime!, $offset: Int) {
    stateChannels(
      filter: { consumer: { equalTo: $consumer }, expiredAt: { greaterThan: $now }, status: { equalTo: OPEN } }
      offset: $offset
    ) {
      totalCount
      nodes {
        ...StateChannelFields
      }
    }
  }
`;

const GET_CONSUMER_CLOSED_FLEX_PLANS = gql`
  ${STATE_CHANNEL_FIELDS}
  query GetClosedFlexPlans($consumer: String!, $now: Datetime!, $offset: Int) {
    stateChannels(
      filter: {
        consumer: { equalTo: $consumer }
        or: [{ expiredAt: { lessThan: $now }, status: { equalTo: OPEN } }, { status: { notEqualTo: OPEN } }]
      }
      offset: $offset
    ) {
      totalCount
      nodes {
        ...StateChannelFields
      }
    }
  }
`;

export function useDelegation(indexer: string, delegator: string): QueryResult<GetDelegation, GetDelegationVariables> {
  return useQuery<GetDelegation, GetDelegationVariables>(GET_DELEGATION, {
    variables: { id: `${indexer}:${delegator}` },
    // pollInterval: 15000,
  });
}

export function useWithdrawls(params: GetWithdrawlsVariables): QueryResult<GetWithdrawls, GetWithdrawlsVariables> {
  return useQuery<GetWithdrawls, GetWithdrawlsVariables>(GET_WITHDRAWLS, { variables: params, pollInterval: 10000 });
}

export function usePlanTemplates(params: GetPlanTemplatesVariables): QueryResult<GetPlanTemplates> {
  return useQuery<GetPlanTemplates, GetPlanTemplatesVariables>(GET_PLAN_TEMPLATES, { variables: params });
}

export function usePlans(params: GetPlansVariables): QueryResult<GetPlans, GetPlansVariables> {
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
): QueryResult<GetOngoingServiceAgreements, GetOngoingServiceAgreementsVariables> {
  return useQuery<GetOngoingServiceAgreements, GetOngoingServiceAgreementsVariables>(GET_SERVICE_AGREEMENTS, {
    variables: params,
    pollInterval: 20000,
  });
}

export function useExpiredServiceAgreements(
  params: GetExpiredServiceAgreementsVariables,
): QueryResult<GetExpiredServiceAgreements, GetExpiredServiceAgreementsVariables> {
  return useQuery<GetExpiredServiceAgreements, GetExpiredServiceAgreementsVariables>(GET_EXPIRED_SERVICE_AGREEMENTS, {
    variables: params,
  });
}

export function useSpecificServiceAgreements(
  params: GetSpecificServiceAgreementsVariables,
): QueryResult<GetSpecificServiceAgreements, GetSpecificServiceAgreementsVariables> {
  return useQuery<GetSpecificServiceAgreements, GetSpecificServiceAgreementsVariables>(
    GET_SPECIFIC_SERVICE_AGREEMENTS,
    {
      variables: params,
    },
  );
}

export function useOwnOpenOffers(
  params: GetOwnOpenOffersVariables,
): QueryResult<GetOwnOpenOffers, GetOwnOpenOffersVariables> {
  return useQuery<GetOwnOpenOffers, GetOwnOpenOffersVariables>(GET_OWN_OPEN_OFFERS, {
    variables: params,
  });
}

export function useOwnFinishedOffers(
  params: GetOwnFinishedOffersVariables,
): QueryResult<GetOwnFinishedOffers, GetOwnFinishedOffersVariables> {
  return useQuery<GetOwnFinishedOffers, GetOwnFinishedOffersVariables>(GET_OWN_FINISHED_OFFERS, {
    variables: params,
  });
}

export function useOwnExpiredOffers(
  params: GetOwnExpiredOffersVariables,
): QueryResult<GetOwnExpiredOffers, GetOwnExpiredOffersVariables> {
  return useQuery<GetOwnExpiredOffers, GetOwnExpiredOffersVariables>(GET_OWN_EXPIRED_OFFERS, {
    variables: params,
  });
}

export function useAllOpenOffers(
  params: GetAllOpenOffersVariables,
): QueryResult<GetAllOpenOffers, GetAllOpenOffersVariables> {
  return useQuery<GetAllOpenOffers, GetAllOpenOffersVariables>(GET_ALL_OPEN_OFFERS, {
    variables: params,
  });
}

export function useSpecificOpenOffers(
  params: GetSpecificOpenOffersVariables,
): QueryResult<GetSpecificOpenOffers, GetSpecificOpenOffersVariables> {
  return useQuery<GetSpecificOpenOffers, GetSpecificOpenOffersVariables>(GET_SPECIFIC_OPEN_OFFERS, {
    variables: params,
  });
}

export function useRewards(params: GetRewardsVariables): QueryResult<GetRewards, GetRewardsVariables> {
  return useQuery<GetRewards, GetRewardsVariables>(GET_REWARDS, { variables: params, pollInterval: 15000 });
}

export function useIndexerRewards(
  params: GetIndexerRewardsVariables,
): QueryResult<GetIndexerRewards, GetIndexerRewardsVariables> {
  return useQuery<GetIndexerRewards, GetIndexerRewardsVariables>(GET_INDEXER_REWARDS, { variables: params });
}

export function useDelegator(params: GetDelegatorVariables): QueryResult<GetDelegator, GetDelegatorVariables> {
  return useQuery<GetDelegator, GetDelegatorVariables>(GET_DELEGATOR, { variables: params });
}

export function useConsumerOpenFlexPlans(
  params: GetOngoingFlexPlanVariables,
): QueryResult<GetOngoingFlexPlan, GetOngoingFlexPlanVariables> {
  return useQuery<GetOngoingFlexPlan, GetOngoingFlexPlanVariables>(GET_CONSUMER_ONGOING_FLEX_PLANS, {
    variables: params,
  });
}

export function useConsumerClosedFlexPlans(
  params: GetClosedFlexPlansVariables,
): QueryResult<GetClosedFlexPlans, GetClosedFlexPlansVariables> {
  return useQuery<GetClosedFlexPlans, GetClosedFlexPlansVariables>(GET_CONSUMER_CLOSED_FLEX_PLANS, {
    variables: params,
  });
}
