// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MdErrorOutline } from 'react-icons/md';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import { ApproveContract } from '@components/ModalApproveToken';
import { NotificationType, openNotification } from '@components/Notification';
import { useSQToken } from '@containers';
import { ContractTransaction } from '@ethersproject/contracts';
import { useAddAllowance } from '@hooks/useAddAllowance';
import { Button } from '@subql/components';
import { ButtonProps } from '@subql/components/dist/common/button/Button';
import { Tooltip } from 'antd';
import clsx from 'clsx';
import { constants, ContractReceipt } from 'ethers';

import { AsyncData, isInsufficientAllowance, parseError } from '../../utils';
import { Modal } from '../Modal';
import { ModalInput } from '../ModalInput';
import styles from './TransactionModal.module.less';

type Action<P, T extends string> = (params: P, actionKey: T) => Promise<ContractTransaction>;

export const idleText = {
  title: ' ',
  steps: [],
};

export type TransactionModalAction<T extends string> = {
  label: string;
  key: T;
  onClick?: () => void;
  tooltip?: string;
  defaultOpenTooltips?: boolean;
} & ButtonProps;

export type TransactionModalProps<P, T extends string> = {
  /**
   * @param {object} text modal information
   */
  text: {
    title: string;
    steps: string[];
    description?: string;
    inputTitle?: string;
    inputBottomText?: React.ReactNode;
    submitText?: string;
    failureText?: string;
    successText?: string;
  };
  currentStep?: number;
  /**
   * @param {object} onClick renderContent({ submit // this param })
   */
  onClick?: Action<P, T>;
  onClose?: () => void;
  /**
   * @param {object} actions render button and button events
   */
  actions: TransactionModalAction<T>[];
  inputParams?: Omit<React.ComponentProps<typeof ModalInput>, 'inputTitle' | 'submitText' | 'onSubmit' | 'isLoading'>;
  /**
   * @param {object} renderContent modal render content
   */
  renderContent?: (
    onSubmit: (params: P) => void,
    onCancel: () => void,
    loading: boolean,
    error?: string,
  ) => React.ReactNode | undefined;
  variant?: 'button' | 'errButton' | 'disabledButton' | 'textBtn' | 'errTextBtn' | 'disabledTextBtn';
  initialCheck?: AsyncData<unknown>;
  onSuccess?: (params?: any, txReceipt?: ContractReceipt) => void;
  loading?: boolean; // status for whole modal (Update at: Sep 22)
  rethrowWhenSubmit?: boolean;
  width?: string;
  className?: string;
  buttonClassName?: string;
  currentConfirmButtonLoading?: boolean;
  allowanceContractAddress?: ApproveContract;
  onlyRenderInner?: boolean;
  showSuccessModal?: boolean;
};

export interface TransactionModalRef {
  showModal: (key: string) => void;
}

// TODO: arrange this compoent
//   No questions aspect: Feature good.
//   Need some arrange: 1. onClick, actions, renderContent are coupling, those attributes are all having part logic to do same thing.
//                      1.1 The problem is onClick actually means modal clicked callback and also actually wants to handle the different actions in onClick, but didn't have param to flag what action trigger that.
//                      1.2 renderContent actually means render modal content and onClick join in this render. and the confuse part is actions also have a onClick field if you don't notice this.
//                      2. actions and variant have the same problems.
//                      3. text is not a searchable name.
//   I am not sure the optimize target. just put those problems now.
const TransactionModal = React.forwardRef<TransactionModalRef, TransactionModalProps<any, any>>(
  (
    {
      renderContent, // renderModalContent
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
      rethrowWhenSubmit = false,
      width = '572px',
      className = '',
      buttonClassName = '',
      currentConfirmButtonLoading = false,
      allowanceContractAddress = ApproveContract.Staking,
      onlyRenderInner = false,
      showSuccessModal = true,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [showModal, setShowModal] = React.useState<any>();
    const [isLoading, setIsLoading] = React.useState<boolean>(initialCheck?.loading || false);
    const [successModalText, setSuccessModalText] = React.useState<string | undefined>();
    const [failureModalText, setFailureModalText] = React.useState<string | undefined>();

    const { addAllowance } = useAddAllowance();
    const { balance } = useSQToken();

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

    const handleBtnClick = (key: string) => {
      setShowModal(key);
    };

    React.useImperativeHandle(ref, () => ({
      showModal: handleBtnClick,
    }));

    const wrapTxAction = (action: typeof onClick, rethrow?: boolean) => async (params: string) => {
      try {
        if (!showModal || !action) return;
        let tx: ContractTransaction;

        setIsLoading(true);
        try {
          tx = await action(params, showModal);
        } catch (e: any) {
          if (isInsufficientAllowance(e)) {
            await addAllowance(allowanceContractAddress, (balance.result.data || constants.MaxUint256)?.toString());
            tx = await action(params, showModal);
          } else {
            throw e;
          }
        }
        openNotification({ title: t('transaction.submmited'), duration: 5 });
        const result = await tx.wait();

        if (result.status) {
          if (showSuccessModal) {
            openNotification({
              type: NotificationType.SUCCESS,
              title: 'Success',
              description: text.successText ?? t('status.changeValidIn15s'),
              duration: 5,
            });
          }
          setSuccessModalText(text.successText || 'Success');
          try {
            onSuccess && (await onSuccess(params, result));
          } catch (e) {
            parseError(e);
          }
        } else {
          throw new Error(text.failureText);
        }
      } catch (error) {
        openNotification({
          type: NotificationType.ERROR,
          title: 'Failure',
          description: `${text.failureText ?? 'Error'}: ${parseError(error, {
            defaultGeneralMsg: t('general.rpcUnavailable'),
          })}`,
          duration: 5,
        });
        setFailureModalText(parseError(error));
        if (rethrow) {
          throw error;
        }
      } finally {
        resetModal();
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
              renderContent?.(wrapTxAction(onClick, rethrowWhenSubmit), resetModal, isLoading, failureModalText) || (
                <ModalInput
                  {...inputParams}
                  inputTitle={text.inputTitle}
                  submitText={text.submitText}
                  inputBottomText={text.inputBottomText}
                  failureModalText={failureModalText}
                  onSubmit={wrapTxAction(onClick, true)}
                  isLoading={isLoading || currentConfirmButtonLoading}
                /> //NOTE: slowly deprecate it and use NumberInput only
              )
            }
            width={width}
            className={clsx(className, onlyRenderInner ? 'hideModalWrapper' : '')}
          />
        )}

        {actions.map(({ label, key, onClick, disabled, tooltip, defaultOpenTooltips, rightItem, ...rest }) => {
          const isTextButton = variant.match(/text|Text/);
          const sortedStyle = disabled ? (isTextButton ? 'disabledTextBtn' : 'disabledButton') : variant;

          return (
            <Tooltip title={tooltip} defaultOpen={!!defaultOpenTooltips} key={key}>
              <Button
                label={label}
                onClick={async () => {
                  await onClick?.();
                  handleBtnClick(key);
                }}
                className={clsx(sortedStyle, buttonClassName, styles.actionBtn)}
                size="medium"
                colorScheme="standard"
                disabled={disabled || isLoading}
                rightItem={
                  rightItem ? (
                    rightItem
                  ) : isLoading ? (
                    <LoadingOutlined className={sortedStyle} />
                  ) : (
                    tooltip && disabled && <MdErrorOutline className={styles.errorButtonIcon} />
                  )
                }
                {...rest}
              />
            </Tooltip>
          );
        })}
      </div>
    );
  },
);

TransactionModal.displayName = 'TransactionModal';
export default TransactionModal;
