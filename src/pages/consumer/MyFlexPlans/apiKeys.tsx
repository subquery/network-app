// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import PasswordField from '@components/PasswordField';
import { GetUserApiKeys, isConsumerHostError, useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Modal, openNotification, TextInput, Typography } from '@subql/components';
import { Table } from 'antd';
import moment from 'moment';

import { Button } from '../../../components/Button/Button';
import styles from './apiKeys.module.less';

const EmptyApiKeys: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Typography weight={500} variant={'h5'}>
        API Key
      </Typography>
      <Typography type="secondary">Create an API key to use in your application.</Typography>
      <Typography type="secondary">This key can be used for request queries. Learn more here.</Typography>
      <Typography type="secondary" style={{ marginTop: '24px' }}>
        {/* TODO: finish it when missing document done. */}
        Learn more <a>here</a>
      </Typography>
      {children}
    </>
  );
};

const ApiKeysFC: FC = () => {
  const { getUserApiKeysApi, createNewApiKey, deleteNewApiKey } = useConsumerHostServices({
    alert: true,
  });

  const [openCreateNew, setOpenCreateNew] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const currentApiKey = useRef<number>();
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [apiKeys, setApiKeys] = useState<GetUserApiKeys[]>([]);

  const init = async () => {
    const res = await getUserApiKeysApi();

    if (!isConsumerHostError(res.data)) {
      setApiKeys(res.data);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={styles.apiKeys}>
      {apiKeys.length ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <Button
              style={{ marginTop: 24 }}
              onClick={() => {
                setOpenCreateNew(true);
              }}
            >
              Create API Key
            </Button>
          </div>
          <Table
            columns={[
              {
                title: 'NAME',
                dataIndex: 'name',
                key: 'name',
                render: (val: string, record) => {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="small">{val}</Typography>
                      <Typography type={'secondary'} variant="small">
                        Created {moment(record.created_at).format('YYYY-MM-DD')} Last Used{' '}
                        {moment(record.updated_at).format('YYYY-MM-DD')}
                      </Typography>
                    </div>
                  );
                },
              },
              {
                title: 'API KEY',
                dataIndex: 'value',
                key: 'value',
                render: (val: string) => {
                  return <PasswordField password={val}></PasswordField>;
                },
              },
              {
                title: 'ACTION',
                key: 'id',
                render: (_, record) => {
                  return (
                    <Typography
                      type="danger"
                      onClick={() => {
                        setOpenDeleteConfirm(true);
                        currentApiKey.current = record.id;
                      }}
                    >
                      Delete
                    </Typography>
                  );
                },
              },
            ]}
            dataSource={apiKeys}
            rowKey={'id'}
          ></Table>
        </div>
      ) : (
        <EmptyApiKeys>
          <Button
            style={{ marginTop: 24 }}
            onClick={() => {
              setOpenCreateNew(true);
            }}
          >
            Create API Key
          </Button>
        </EmptyApiKeys>
      )}

      <Modal
        open={openCreateNew}
        title="Create API Key"
        submitText="Create"
        onSubmit={async () => {
          const res = await createNewApiKey({
            name: newApiKeyName,
          });
          if (!isConsumerHostError(res.data)) {
            await init();
            setOpenCreateNew(false);
            setNewApiKeyName('');
          }
        }}
        onCancel={() => {
          setOpenCreateNew(false);
        }}
      >
        <div>
          <span>Name</span>
          <TextInput
            placeholder="The name to identify your API key"
            value={newApiKeyName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNewApiKeyName(e.target.value);
            }}
          ></TextInput>
        </div>
      </Modal>

      {/* TODO: When update component-ui use static method replace. */}
      <Modal
        open={openDeleteConfirm}
        onCancel={() => {
          setOpenDeleteConfirm(false);
        }}
        danger
        cancelButtonProps={{
          style: { display: 'none' },
        }}
        submitText="Delete"
        title="Delete API Key"
        onSubmit={async () => {
          if (currentApiKey.current) {
            const res = await deleteNewApiKey(currentApiKey.current);
            if (!isConsumerHostError(res.data)) {
              init();
              openNotification({
                type: 'success',
                description: 'Delete success',
                duration: 5000,
              });
              setOpenDeleteConfirm(false);
            }
          }
        }}
      >
        <Typography>
          Are you sure you want to delete this API key? Your application will break if this API Key is being used.
        </Typography>
      </Modal>
    </div>
  );
};
export default ApiKeysFC;
