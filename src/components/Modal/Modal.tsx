// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Modal as SubqlModal, Typography } from '@subql/components';
import { Steps as AntDSteps } from 'antd';
import clsx from 'clsx';

import Spinner from '../Spinner';
import styles from './Modal.module.css';

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
  width?: string;
  className?: string;
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
  width = '45%',
  className = '',
}) => {
  const Title = () => <Typography className={styles.title}>{title || 'Modal'}</Typography>;

  const Description = () => {
    if (!description) return <div />;
    return (
      <Typography className={styles.description} type="secondary">
        {description}
      </Typography>
    );
  };

  return (
    <SubqlModal
      title={<Title />}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      footer={null}
      destroyOnClose={true}
      width={width}
      className={clsx(styles.modal, className)}
    >
      {steps && steps.length ? (
        <div className={clsx(styles.steps, 'modalSteps')}>
          <AntDSteps size="small" current={currentStep} items={steps?.map((step) => ({ title: step }))} />
        </div>
      ) : (
        ''
      )}
      {loading && <Spinner />}
      {!loading && (
        <>
          <Description />
          {content}
        </>
      )}
    </SubqlModal>
  );
};
