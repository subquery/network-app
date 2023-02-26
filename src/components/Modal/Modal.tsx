// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Modal as AntDModal, Typography, Steps as AntDSteps } from 'antd';
import styles from './Modal.module.css';
import Spinner from '../Spinner';

/**
 * NOTE:
 * Using antd
 * Waiting for SubQuery components lib(also based on antD) release and replace
 */

interface ModalProps {
  title?: string;
  steps?: string[];
  currentStep?: number;
  header?: string;
  description?: string;
  content?: React.ReactNode;
  visible: boolean;
  onCancel: () => void;
  onOk?: () => void;
  loading?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onCancel,
  onOk,
  title,
  steps,
  currentStep,
  description,
  content,
  loading,
}) => {
  const Title = () => (
    <Typography.Title level={3} className={styles.title}>
      {title || 'Modal'}
    </Typography.Title>
  );

  const Description = () => {
    if (!description) return <div />;
    return <Typography.Text className={styles.description}>{description}</Typography.Text>;
  };

  return (
    <AntDModal
      title={<Title />}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      footer={null}
      destroyOnClose={true}
      width={'45%'}
    >
      {steps && (
        <div className={styles.steps}>
          <AntDSteps size="small" current={currentStep} items={steps?.map((step) => ({ title: step }))} />
        </div>
      )}
      {loading && <Spinner />}
      {!loading && (
        <>
          <Description />
          {content}
        </>
      )}
    </AntDModal>
  );
};
