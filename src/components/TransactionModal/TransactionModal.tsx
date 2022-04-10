// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractTransaction } from '@ethersproject/contracts';
import { Button } from '@subql/react-ui';
import * as React from 'react';
import { parseError } from '../../utils';
import { Modal } from '../Modal';
import { ModalInput } from '../ModalInput';
import { ModalStatus } from '../ModalStatus';
import styles from './TransactionModal.module.css';

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
    } & React.ComponentProps<typeof Button>
  >;
  inputParams?: Omit<React.ComponentProps<typeof ModalInput>, 'inputTitle' | 'submitText' | 'onSubmit' | 'isLoading'>;
  renderContent?: (
    onSubmit: (params: P) => void,
    onCancel: () => void,
    loading: boolean,
    error?: string,
  ) => React.ReactNode | undefined;
  variant?: 'button' | 'textBtn' | 'errTextBtn' | 'errButton';
};

const TransactionModal = <P, T extends string>({
  renderContent,
  text,
  actions,
  onClick,
  inputParams,
  variant = 'button',
}: Props<P, T>): React.ReactElement | null => {
  const [showModal, setShowModal] = React.useState<T | undefined>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [successModalText, setSuccessModalText] = React.useState<string | undefined>();
  const [failureModalText, setFailureModalText] = React.useState<string | undefined>();

  const resetModal = () => {
    setIsLoading(false);
    setShowModal(undefined);
    setFailureModalText(undefined);
  };

  const resetModalStatus = () => {
    setSuccessModalText(undefined);
    setFailureModalText(undefined);
  };

  const handleBtnClick = (key: T) => {
    setShowModal(key);
  };

  const wrapTxAction = (action: typeof onClick) => async (params: P) => {
    try {
      if (!showModal) return;

      const tx = await action(params, showModal);

      setIsLoading(true);
      const result = await tx.wait();

      resetModal();
      if (result.status) {
        setSuccessModalText(text.successText || 'Success');
      } else {
        throw new Error(text.failureText);
      }
    } catch (error) {
      console.log('error', error);
      setFailureModalText(parseError(error));
    }
  };

  return (
    <div className={styles.btns}>
      <Modal
        title={text.title}
        description={text.description}
        visible={!!showModal}
        onCancel={() => resetModal()}
        steps={text.steps}
        content={
          renderContent?.(wrapTxAction(onClick), resetModal, isLoading, failureModalText) || (
            <ModalInput
              {...inputParams}
              inputTitle={text.inputTitle}
              submitText={text.submitText}
              onSubmit={wrapTxAction(onClick)}
              isLoading={isLoading}
            />
          )
        }
      />
      <ModalStatus visible={!!successModalText} onCancel={resetModalStatus} success={!!successModalText} />

      {actions.map(({ label, key, onClick, ...rest }) => (
        <Button
          key={key}
          {...rest}
          label={label}
          onClick={() => {
            onClick?.();
            handleBtnClick(key);
          }}
          className={`${styles[variant]}`}
          size="medium"
        />
      ))}
    </div>
  );
};

export default TransactionModal;
