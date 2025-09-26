// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { ChatInterface } from '@components/GraphqlAgent/graphqlAgent';
import { IndexerName } from '@components/IndexerDetails/IndexerName';
import { useAccount } from '@containers/Web3';
import { useIndexerMetadata } from '@hooks';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Manifest } from '@hooks/useGetDeploymentManifest';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { useRegisterProject } from '@hooks/useProjects';
import { useRequestServiceAgreementToken } from '@hooks/useRequestServiceAgreementToken';
import { Spinner } from '@subql/components';
import {
  renderAsync,
  useAsyncMemo,
  useGetDeploymentIndexersLazyQuery,
  useGetIndexerDeploymentLazyQuery,
} from '@subql/react-hooks';
import { notEmpty, wrapProxyEndpoint } from '@utils';
import { makeCacheKey } from '@utils/limitation';
import { Select } from 'antd';
import { Option } from 'antd/es/mentions';

import { useProjectStore } from 'src/stores/project';
import { ChatMessage } from 'src/types';

type Props = {
  deploymentId: string | undefined;
  project: ProjectDetailsQuery;
  manifest?: Manifest;
};

const IndexerOption: React.FC<{
  indexerId: string;
  deploymentId: string;
  onClick: (queryUrl: string, proxyUrl: string) => void;
}> = ({ deploymentId, indexerId, onClick }) => {
  const { indexerMetadata } = useIndexerMetadata(indexerId);
  const queryUrl = React.useMemo(() => {
    return wrapProxyEndpoint(`${indexerMetadata.url}/query/${deploymentId}`, indexerId);
  }, [indexerMetadata, deploymentId, indexerId]);

  return (
    <IndexerName
      name={indexerMetadata?.name}
      image={indexerMetadata?.image}
      address={indexerId}
      onClick={() => {
        onClick(queryUrl || '', indexerMetadata.url || '');
      }}
    />
  );
};

const DeploymentGraphqlAgent: React.FC<Props> = ({ deploymentId, project }) => {
  const [loadIndexersLazy, asyncIndexers] = useGetDeploymentIndexersLazyQuery();
  const { address: account } = useAccount();
  const registerProject = useRegisterProject();
  const { setProjectInfo } = useProjectStore();
  const [projectChatMessages, setProjectChatMessages] = React.useState<ChatMessage[]>([]);
  const [queryUrl, setQueryUrl] = React.useState<string>('');
  const [trailToken, setTrailToken] = React.useState<string>('');
  const { requestServiceAgreementToken } = useRequestServiceAgreementToken();
  const [loading, setLoading] = React.useState(false);

  const updateProjectMessages = React.useCallback(
    (messagesOrUpdater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setProjectChatMessages((prev) => {
        const currentMessages = prev || [];
        const newMessages =
          typeof messagesOrUpdater === 'function' ? messagesOrUpdater(currentMessages) : messagesOrUpdater;

        return newMessages;
      });
    },
    [],
  );

  const clearProjectMessages = React.useCallback(() => {
    setProjectChatMessages([]);
  }, []);

  const totalCount = React.useMemo(() => {
    return asyncIndexers.data?.indexerDeployments?.totalCount || 0;
  }, [asyncIndexers]);

  const indexers = React.useMemo(
    () => asyncIndexers.data?.indexerDeployments?.nodes.filter(notEmpty) || [],
    [asyncIndexers.data],
  );

  const requestPlayground = async (url: string, indexerId: string) => {
    if (account && deploymentId) {
      const res = await requestServiceAgreementToken(
        account,
        wrapProxyEndpoint(`${url}/token`, indexerId),
        indexerId,
        '',
        deploymentId,
        true,
      );

      if (res?.data) {
        setTrailToken(res.data);
        const trailKey = makeCacheKey('graphqlAgent', {
          prefix: deploymentId,
          suffix: indexerId,
        });
        localStorage.setItem(
          trailKey,
          JSON.stringify({
            data: res.data,
            expire: Date.now() + 24 * 60 * 60 * 1000,
          }),
        );
        await registerProject.mutateAsync({
          cid: deploymentId,
          endpoint: queryUrl || '',
          authorization: `Bearer ${res.data}`,
        });
      }
    }
  };

  React.useEffect(() => {
    if (deploymentId) {
      loadIndexersLazy({
        variables: { deploymentId, offset: 0 },
      });
    }
  }, [deploymentId]);

  React.useEffect(() => {
    if (!deploymentId) return;
    setProjectInfo(deploymentId, {
      totalIndexers: totalCount,
    });
  }, [totalCount, deploymentId]);

  return renderAsync(asyncIndexers, {
    loading: () => <Spinner />,
    error: (e) => <div>{`Failed to load indexers: ${e.message}`}</div>,
    data: () => {
      return (
        <ChatInterface
          projectCid={deploymentId as string}
          messages={projectChatMessages || []}
          onMessagesChange={(messagesOrUpdater) => updateProjectMessages(messagesOrUpdater)}
          onClearMessages={() => clearProjectMessages()}
          endpoint={queryUrl || ''}
          token={`Bearer ${trailToken}`}
          loading={loading}
          headerExtraWidget={
            <div style={{ minWidth: '250px' }}>
              <Select style={{ width: '100%', height: '52px' }} placeholder="Select an operator">
                {indexers.map((i) => (
                  <Option key={i.indexerId}>
                    <IndexerOption
                      deploymentId={deploymentId || ''}
                      indexerId={i.indexerId}
                      onClick={async (url, proxyUrl) => {
                        try {
                          setLoading(true);
                          setQueryUrl(url);

                          const trailKey = makeCacheKey('graphqlAgent', {
                            prefix: deploymentId,
                            suffix: i.indexerId,
                          });
                          const existToken = localStorage.getItem(trailKey);
                          if (existToken) {
                            try {
                              const token = JSON.parse(existToken) as { data: string; expire: number };
                              if (token.expire < Date.now()) {
                                localStorage.removeItem(trailKey);
                                return;
                              }
                              await registerProject.mutateAsync({
                                cid: deploymentId || '',
                                endpoint: queryUrl || '',
                                authorization: `Bearer ${token.data}`,
                              });
                              setTrailToken(token.data);
                            } catch (e) {}

                            return;
                          }

                          await requestPlayground(proxyUrl, i.indexerId);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    ></IndexerOption>
                  </Option>
                ))}
              </Select>
            </div>
          }
        ></ChatInterface>
      );
    },
  });
};

export default DeploymentGraphqlAgent;
