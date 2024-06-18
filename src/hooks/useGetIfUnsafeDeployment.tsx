// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { useEffect, useState } from 'react';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import { useIPFS } from '@containers';
import { Modal, Typography } from '@subql/components';
import { waitForSomething } from '@utils/waitForSomething';

export const useGetIfUnsafeDeployment = (currentDeploymentId?: string) => {
  const { catSingle } = useIPFS();

  const [isUnsafe, setIsUnsafe] = useState(false);

  const getIfUnsafe = async (deploymentId: string) => {
    try {
      const res = await catSingle(deploymentId);

      if (Buffer.from(res).toString('utf8').includes('unsafe')) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  };

  const getIfUnsafeAndWarn = async (deploymentId: string): Promise<'cancel' | 'continue'> => {
    const unsafe = await getIfUnsafe(deploymentId);
    if (unsafe) {
      let waitConfirmOrCancel = 'pending';
      Modal.confirm({
        icon: <WarningOutlined />,
        title: <Typography>This project is not completely safe</Typography>,
        width: 572,
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Typography variant="medium" type="secondary">
              SubQuery can’t guarantee that this project is deterministic, which means it is not entirely safe.
            </Typography>
            <Typography variant="medium" type="secondary">
              This means that two indexers are not guaranteed to index exactly the same data when indexing this project.
              In most cases, Indexers will still run this project, however they might be reluctant to do so.
            </Typography>
            <Typography variant="medium" type="secondary">
              By proceeding, you acknowledge the potential risks associated with deploying an &apos;unsafe&apos;
              project. Learn more about unsafe project.
            </Typography>
          </div>
        ),
        onCancel: () => {
          waitConfirmOrCancel = 'cancel';
        },
        onOk: () => {
          waitConfirmOrCancel = 'confirm';
        },
        okButtonProps: {
          shape: 'round',
          size: 'large',
        },
        cancelButtonProps: {
          shape: 'round',
          size: 'large',
        },
      });

      await waitForSomething({ func: () => waitConfirmOrCancel !== 'pending' });

      if (waitConfirmOrCancel === 'cancel') return 'cancel';
    }

    return 'continue';
  };

  useEffect(() => {
    const inner = async () => {
      if (currentDeploymentId) {
        const result = await getIfUnsafe(currentDeploymentId);
        setIsUnsafe(result);
      }
    };
    inner();
  }, [currentDeploymentId]);

  return {
    getIfUnsafe,
    getIfUnsafeAndWarn,
    isUnsafe,
  };
};
