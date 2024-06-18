// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { openNotification } from '@subql/components';
import { parseError, POST } from '@utils';
import { authSARequestBody, ConsumerSAMessageType, domain, EIP712Domain, trailSAMessageType } from '@utils/eip712';
import { t } from 'i18next';
import { useSignTypedData } from 'wagmi';

export const useRequestServiceAgreementToken = () => {
  const { signTypedDataAsync } = useSignTypedData();

  const requestServiceAgreementToken = async (
    account: string,
    requestTokenUrl: string | undefined,
    indexer: string,
    agreement: string | undefined,
    deploymentId: string,
    trail?: boolean,
  ): Promise<{ data?: string; error?: string } | undefined> => {
    try {
      const timestamp = new Date().getTime();
      if (!account || !requestTokenUrl) return;

      const signMsg = {
        indexer,
        timestamp,
        deploymentId,
        ...(trail
          ? {}
          : {
              consumer: account,
              agreement,
            }),
      };

      const eip721Signature = await signTypedDataAsync({
        message: signMsg,
        types: {
          EIP712Domain,
          messageType: trail ? trailSAMessageType : ConsumerSAMessageType,
        },
        primaryType: 'messageType',

        // @ts-ignore
        // TODO: FIX, it seems is wagmi bug.
        domain,
      });

      const tokenRequestBody = authSARequestBody(
        { ...signMsg, ...(trail ? { consumer: account } : {}) },
        eip721Signature ?? '',
      );

      const { response, error } = await POST({ endpoint: requestTokenUrl, requestBody: tokenRequestBody });

      const sortedResponse = response && (await response.json());
      if (response?.ok) {
        return { data: sortedResponse?.token };
      } else {
        const sortedError = sortedResponse || error;
        throw new Error(parseError(sortedError));
      }
    } catch (error) {
      parseError(error);
      openNotification({
        type: 'error',
        description: t('serviceAgreements.faliedToFetchServiceAgreement'),
      });
      return { error: t('serviceAgreements.faliedToFetchServiceAgreement') };
    }
  };

  return {
    requestServiceAgreementToken,
  };
};
