// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Modal as AntDModal, Divider } from 'antd';
import { Typography } from '@subql/react-ui';
import { MdOutlineFilter1, MdOutlineFilter2 } from 'react-icons/md';
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
}) => {
  const Title = () => (
    <Typography variant="h6" className={styles.title}>
      {title || 'Modal'}
    </Typography>
  );

  const Steps = () => {
    if (!steps) return <div />;

    const stepIcons = [
      <MdOutlineFilter1 className={styles.stepNoIcon} />,
      <MdOutlineFilter2 className={styles.stepNoIcon} />,
    ];
    return (
      <div className={styles.steps}>
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className={styles.step}>
              {stepIcons[idx]}
              <Typography variant="medium" className={styles.text}>
                {step}
              </Typography>
            </div>
            {step.length > 1 && idx !== steps.length - 1 && (
              <div className={styles.divider}>
                <Divider />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const Description = () => {
    if (!description) return <div />;
    return (
      <Typography variant="medium" className={styles.description}>
        {description}
      </Typography>
    );
  };

  return (
    <AntDModal title={<Title />} visible={visible} onOk={onOk} onCancel={onCancel} footer={null} destroyOnClose={true}>
      <Steps />
      <Description />
      {content}
    </AntDModal>
  );
};
