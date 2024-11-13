// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentMeta } from '@components/DeploymentInfo';
import { EmptyList } from '@components/EmptyList';
import { useWeb3 } from '@containers';
import { Spinner, Typography } from '@subql/components';
import { useGetSpecificPlansQuery } from '@subql/react-hooks';
import { mapAsync, notEmpty, renderAsyncArray, URLS } from '@utils';

import List from '../List';
import styles from './Specific.module.css';

const Specific: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();

  // TODO find a way to query indexed projects that only have plans
  const specificPlans = useGetSpecificPlansQuery({ variables: { address: account ?? '' }, pollInterval: 10000 });

  return (
    <div className={'contentContainer'}>
      {renderAsyncArray(
        mapAsync(
          (d) =>
            d.indexerDeployments?.nodes
              .filter(notEmpty)
              .map((d) => d.deployment)
              .filter((d) => d?.plans.nodes.filter(notEmpty).length), // Filter out indexed projects that have 0 plans
          specificPlans,
        ),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load specific plans: ${e}`}</Typography>,
          empty: () => (
            <EmptyList
              title={t('indexerPlans.title')}
              description={t('indexerPlans.description')}
              infoI18nKey={'indexerPlans.learnMore'}
              infoLink={URLS.PLANS_OFFERS}
            />
          ),
          data: (deployments) => {
            return (
              <>
                <Typography variant="h6">{t('plans.specific.title')}</Typography>
                <div className={styles.plans}>
                  {deployments
                    .sort((a, b) => parseInt(a?.project?.id || '0x00', 16) - parseInt(b?.project?.id || '0x00', 16))
                    .map((deployment) => {
                      if (!deployment) return null;
                      const plans = deployment?.plans.nodes.filter(notEmpty);

                      return (
                        <div key={deployment.id} className={styles.plan}>
                          <div className={styles.header}>
                            <DeploymentMeta
                              deploymentId={deployment.id}
                              projectMetadata={deployment.project?.metadata}
                            />
                          </div>

                          {plans ? (
                            <List data={plans} onRefresh={() => specificPlans.refetch()} />
                          ) : (
                            <Typography>{t('plans.specific.nonDeployment')}</Typography>
                          )}
                        </div>
                      );
                    })}
                </div>
              </>
            );
          },
        },
      )}
    </div>
  );
};

export default Specific;
