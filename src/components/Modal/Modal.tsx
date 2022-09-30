// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Modal as AntDModal, Divider, Typography } from 'antd';
import { MdOutlineFilter1, MdOutlineFilter2, MdOutlineFilter3 } from 'react-icons/md';
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

  const Steps = () => {
    if (!steps) return <div />;

    // TODO: Improvement - avoid static with the Icon
    const stepIcons = [
      <MdOutlineFilter1 className={styles.stepNoIcon} />,
      <MdOutlineFilter2 className={styles.stepNoIcon} />,
      <MdOutlineFilter3 className={styles.stepNoIcon} />,
    ];
    return (
      <div className={styles.steps}>
        {steps.map((step, idx) => {
          const isActiveStep = currentStep === idx;
          return (
            <React.Fragment key={step}>
              <div className={`${styles.step} ${isActiveStep && styles.activeStep}`}>
                {stepIcons[idx]}
                <Typography className={`${styles.text} ${isActiveStep && styles.activeStep}`}>{step}</Typography>
              </div>
              {step.length > 1 && idx !== steps.length - 1 && (
                <div className={styles.divider}>
                  <Divider />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const Description = () => {
    if (!description) return <div />;
    return <Typography.Text className={styles.description}>{description}</Typography.Text>;
  };

  const sortedContent = loading ? (
    <Spinner />
  ) : (
    <>
      <Description />
      {content}
    </>
  );

  return (
    <AntDModal
      title={<Title />}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      footer={null}
      destroyOnClose={true}
      width={'45%'}
    >
      <Steps />
      {sortedContent}
    </AntDModal>
  );
};
