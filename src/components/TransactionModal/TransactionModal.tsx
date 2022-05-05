// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractTransaction } from '@ethersproject/contracts';
import { Button } from '@subql/react-ui';
import * as React from 'react';
import { CgSandClock } from 'react-icons/cg';
import { AsyncData, parseError } from '../../utils';
import { Modal } from '../Modal';
import { ModalInput } from '../ModalInput';
import styles from './TransactionModal.module.css';
import clsx from 'clsx';
import { MdErrorOutline } from 'react-icons/md';
import { notification, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}
interface NotificationProps {
  type?: NotificationType;
  title?: string;
  description?: string;
}

const openNotificationWithIcon = ({ type = NotificationType.INFO, title, description }: NotificationProps) => {
  notification[type]({
    message: title ?? 'Notification',
    description: description,
  });
  notification.config({
    duration: type === NotificationType.INFO ? 45 : 30,
  });
};

type Action<P, T extends string> = (params: P, actionKey: T) => Promise<ContractTransaction>;

type Props<P, T extends string> = {
  text: {
    title: string;
    steps: string[];
    description?: string;
    inputTitle?: string;
    submitText?: string;
    failureText?: string;
    successText?: string;
  };
  onClick: Action<P, T>;
  actions: Array<
    {
      label: string;
      key: T;
      onClick?: () => void;
      tooltip?: string;
    } & React.ComponentProps<typeof Button>
  >;
  inputParams?: Omit<React.ComponentProps<typeof ModalInput>, 'inputTitle' | 'submitText' | 'onSubmit' | 'isLoading'>;
  renderContent?: (
    onSubmit: (params: P) => void,
    onCancel: () => void,
    loading: boolean,
    error?: string,
  ) => React.ReactNode | undefined;
  variant?: 'button' | 'errButton' | 'disabledButton' | 'textBtn' | 'errTextBtn' | 'disabledTextBtn';
  initialCheck?: AsyncData<unknown>;
};

const TransactionModal = <P, T extends string>({
  renderContent,
  text,
  actions,
  onClick,
  inputParams,
  variant = 'button',
  initialCheck,
}: Props<P, T>): React.ReactElement | null => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = React.useState<T | undefined>();
  const [isLoading, setIsLoading] = React.useState<boolean>(initialCheck?.loading || false);
  const [showClock, setShowClock] = React.useState<boolean>(false);
  const [successModalText, setSuccessModalText] = React.useState<string | undefined>();
  const [failureModalText, setFailureModalText] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (initialCheck) {
      const { error } = initialCheck;
      error && setFailureModalText(parseError(error));
    }
  }, [failureModalText, initialCheck, initialCheck?.loading, showModal]);

  React.useEffect(() => {
    if (successModalText) {
      const timeoutId = setTimeout(() => {
        setShowClock(false);
      }, 2500);

      return () => clearTimeout(timeoutId);
    }
  }, [successModalText]);

  const resetModal = () => {
    setIsLoading(false);
    setShowModal(undefined);
    setFailureModalText(undefined);
    setSuccessModalText(undefined);
    !isLoading && !successModalText && setShowClock(false);
  };

  const handleBtnClick = (key: T) => {
    setShowClock(true);
    setShowModal(key);
  };

  const wrapTxAction = (action: typeof onClick, rethrow?: boolean) => async (params: P) => {
    try {
      if (!showModal) return;

      const tx = await action(params, showModal);

      setIsLoading(true);
      resetModal();
      openNotificationWithIcon({ title: 'Your transaction has been submitted! Please wait for around 30s.' });
      const result = await tx.wait();

      if (result.status) {
        setSuccessModalText(text.successText || 'Success');
        openNotificationWithIcon({
          type: NotificationType.SUCCESS,
          title: successModalText ?? 'Success',
          description: t('status.changeValidIn15s'),
        });
      } else {
        throw new Error(text.failureText);
      }
    } catch (error) {
      console.log('TxAction error', error);
      setFailureModalText(parseError(error));
      // openNotificationWithIcon({
      //   type: NotificationType.ERROR,
      //   title: parseError(error),
      // });
      if (rethrow) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const modalVisible = !!showModal;

  return (
    <div className={styles.container}>
      {modalVisible && (
        <Modal
          title={text.title}
          description={text.description}
          visible={modalVisible}
          onCancel={() => {
            resetModal();
            !isLoading && setShowClock(false);
          }}
          steps={text.steps}
          content={
            renderContent?.(wrapTxAction(onClick), resetModal, isLoading, failureModalText) || (
              <ModalInput
                {...inputParams}
                inputTitle={text.inputTitle}
                submitText={text.submitText}
                failureModalText={failureModalText}
                onSubmit={wrapTxAction(onClick, true)}
                isLoading={isLoading}
              /> //NOTE: slowly deprecate it and use NumberInput only
            )
          }
        />
      )}

      {actions.map(({ label, key, onClick, disabled, tooltip, ...rest }) => (
        <div className="flex-center" key={key}>
          <Tooltip title={tooltip}>
            <Button
              {...rest}
              label={label}
              onClick={() => {
                onClick?.();
                handleBtnClick(key);
              }}
              className={variant}
              size="medium"
              disabled={disabled || showClock}
              rightItem={
                tooltip &&
                disabled && (
                  <MdErrorOutline
                    className={variant.match(/text|Text/) ? styles.errorTextIcon : styles.errorButtonIcon}
                  />
                )
              }
            />
          </Tooltip>
          {showClock && <CgSandClock className={clsx('grayText', styles.clock)} size={18} />}
        </div>
      ))}
    </div>
  );
};

export default TransactionModal;
