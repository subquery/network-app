// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { OwnDeployment } from '../../../../components';
import { useProjectMetadata, useSpecificPlansPlans, useWeb3 } from '../../../../containers';
import { useAsyncMemo } from '../../../../hooks';
import { mapAsync, notEmpty, renderAsync, renderAsyncArray } from '../../../../utils';
import List from '../List';
import { EmptyList } from '../EmptyList';

const Header: React.FC<{ deploymentId: string; projectMetadata?: string }> = ({ deploymentId, projectMetadata }) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(async () => {
    if (!projectMetadata) return null;
    return await getMetadataFromCid(projectMetadata);
  }, [projectMetadata]);

  return renderAsync(metadata, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load project info: ${e}`}</Typography>,
    data: (projectMeta) => {
      if (!projectMeta) {
        return <Typography>Project metadata not found</Typography>;
      }

      return <OwnDeployment deploymentId={deploymentId} project={projectMeta} />;
    },
  });
};

const Specific: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();

  // TODO find a way to query indexed projects that only have plans
  const specificPlans = useSpecificPlansPlans({ address: account ?? '' });

  return (
    <div className={'contentContainer'}>
      <div className={'content'}>
        {renderAsyncArray(
          mapAsync(
            (d) =>
              d.deploymentIndexers?.nodes
                .filter(notEmpty)
                .map((d) => d.deployment)
                .filter((d) => d?.plans.nodes.filter(notEmpty).length), // Filter out indexed projects that have 0 plans
            specificPlans,
          ),
          {
            loading: () => <Spinner />,
            error: (e) => <Typography>{`Failed to load specific plans: ${e}`}</Typography>,
            empty: () => <EmptyList i18nKey={'plans.specific.nonPlans'} />,
            data: (deployments) => {
              return (
                <>
                  <Typography>{t('plans.specific.title')}</Typography>
                  {deployments.map((deployment) => {
                    if (!deployment) return null;
                    const plans = deployment?.plans.nodes.filter(notEmpty);
                    return (
                      <div key={deployment.id}>
                        <Header deploymentId={deployment.id} projectMetadata={deployment.project?.metadata} />
                        {plans ? (
                          <List data={plans} onRefresh={specificPlans.refetch} />
                        ) : (
                          <Typography>{t('plans.specific.nonDeployment')}</Typography>
                        )}
                      </div>
                    );
                  })}
                </>
              );
            },
          },
        )}
      </div>
    </div>
  );
};

export default Specific;
