// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractTransaction } from '@ethersproject/contracts';
import { Button } from '@subql/react-ui';
import * as React from 'react';
import { AsyncData, parseError } from '../../utils';
import { Modal } from '../Modal';
import { ModalInput } from '../ModalInput';
import styles from './TransactionModal.module.css';
import { MdErrorOutline } from 'react-icons/md';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { LoadingOutlined } from '@ant-design/icons';
import { NotificationType, openNotificationWithIcon } from '@components/Notification';

type Action<P, T extends string> = (params: P, actionKey: T) => Promise<ContractTransaction>;

type Props<P, T extends string> = {
  text: {
    title: string;
    steps: string[];
    description?: string;
    inputTitle?: string;
    inputBottomText?: string;
    submitText?: string;
    failureText?: string;
    successText?: string;
  };
  currentStep?: number;
  onClick?: Action<P, T>;
  onClose?: () => void;
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
  onSuccess?: () => void;
  loading?: boolean; // status for whole modal (Update at: Sep 22)
};

// TODO: review successModalText/failureModalText when move to subql-component
const TransactionModal = <P, T extends string>({
  renderContent,
  text,
  currentStep,
  actions,
  onClick,
  onClose,
  onSuccess,
  inputParams,
  variant = 'button',
  initialCheck,
  loading,
}: Props<P, T>): React.ReactElement | null => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = React.useState<T | undefined>();
  const [isLoading, setIsLoading] = React.useState<boolean>(initialCheck?.loading || false);
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
        setSuccessModalText(undefined);
      }, 2500);

      return () => clearTimeout(timeoutId);
    }
  }, [successModalText]);

  const resetModal = () => {
    setShowModal(undefined);
    setFailureModalText(undefined);
    onClose && onClose();
  };

  const handleBtnClick = (key: T) => {
    setShowModal(key);
  };

  const wrapTxAction = (action: typeof onClick, rethrow?: boolean) => async (params: P) => {
    try {
      if (!showModal || !action) return;

      const tx = await action(params, showModal);

      setIsLoading(true);
      resetModal();
      openNotificationWithIcon({ title: 'Your transaction has been submitted! Please wait for around 30s.' });
      const result = await tx.wait();

      if (result.status) {
        onSuccess && onSuccess();
        setSuccessModalText(text.successText || 'Success');
        openNotificationWithIcon({
          type: NotificationType.SUCCESS,
          title: 'Success',
          description: text.successText ?? t('status.changeValidIn15s'),
        });
      } else {
        throw new Error(text.failureText);
      }
    } catch (error) {
      console.error('TxAction error', error);
      openNotificationWithIcon({
        type: NotificationType.ERROR,
        title: 'Failure',
        description: `${text.failureText ?? 'Error'}: ${parseError(error)}`,
      });
      setFailureModalText(parseError(error));
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
          }}
          loading={loading}
          currentStep={currentStep}
          steps={text.steps}
          content={
            renderContent?.(wrapTxAction(onClick), resetModal, isLoading, failureModalText) || (
              <ModalInput
                {...inputParams}
                inputTitle={text.inputTitle}
                submitText={text.submitText}
                inputBottomText={text.inputBottomText}
                failureModalText={failureModalText}
                onSubmit={wrapTxAction(onClick, true)}
                isLoading={isLoading}
              /> //NOTE: slowly deprecate it and use NumberInput only
            )
          }
        />
      )}

      {actions.map(({ label, key, onClick, disabled, tooltip, ...rest }) => {
        const isTextButton = variant.match(/text|Text/);
        const sortedStyle = disabled ? (isTextButton ? 'disabledTextBtn' : 'disabledBtn') : variant;

        return (
          <div className="flex-center" key={key}>
            <Tooltip title={tooltip}>
              <Button
                {...rest}
                label={label}
                onClick={() => {
                  onClick?.();
                  handleBtnClick(key);
                }}
                className={sortedStyle}
                size="medium"
                disabled={disabled || isLoading}
                rightItem={
                  isLoading ? (
                    <LoadingOutlined className={sortedStyle} />
                  ) : (
                    tooltip && disabled && <MdErrorOutline className={styles.errorButtonIcon} />
                  )
                }
              />
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionModal;
