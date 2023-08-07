// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheckSquare, FaWindowClose } from 'react-icons/fa';
import { Typography } from '@subql/components';
import { Modal as AntDModal } from 'antd';

import styles from './ModalStatus.module.css';

/**
 * NOTE:
 * Using antd
 * Waiting for SubQuery components lib(also based on antD) release and replace
 */

interface ModalStatusProps {
  visible: boolean;
  title?: string;
  success?: boolean;
  successText?: string;
  error?: boolean;
  errorText?: string;
  description?: string;
  onCancel: () => void;
}

export const ModalStatus: React.FC<ModalStatusProps> = ({
  success,
  successText,
  error,
  errorText,
  description,
  title,
  visible,
  onCancel,
}) => {
  const { t } = useTranslation();
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onCancel();
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [onCancel]);

  const isSuccessStatus = success || successText;
  const isErrorStatus = error || errorText;
  const StatusIcon = () =>
    isErrorStatus ? (
      <FaWindowClose className={styles.errorIcon} size={28} />
    ) : (
      <FaCheckSquare className={styles.successIcon} size={28} />
    );
  const statusText = isErrorStatus
    ? errorText || t('status.error')
    : isSuccessStatus
    ? successText || t('status.success')
    : 'Unknown status';

  const statusDescription = description || t('status.changeValidIn15s');

  return (
    <AntDModal
      title={title || 'Status Update'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose={true}
    >
      <div className={styles.container}>
        {statusText && (
          <div className={styles.status}>
            <div className={styles.statusTitle}>
              <StatusIcon />
              <Typography className={styles.statusText} variant="h6">
                {statusText}
              </Typography>
            </div>

            <Typography variant="text" className={styles.statusDescription}>
              {statusDescription}
            </Typography>
          </div>
        )}
      </div>
    </AntDModal>
  );
};
