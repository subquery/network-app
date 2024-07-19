import React, { FC, useState } from 'react';
import { IoIosCloseCircle } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { InfoCircleFilled } from '@ant-design/icons';
import { useIndexerMetadata } from '@hooks';
import { Typography } from '@subql/components';
import { useAsyncMemo } from '@subql/react-hooks';
import clsx from 'clsx';
import { useAccount } from 'wagmi';

import styles from './index.module.less';

interface IProps {}

const AutoReduceAllocation: FC<IProps> = (props) => {
  const { address: account } = useAccount();
  const indexerMetadata = useIndexerMetadata(account || '');
  const [close, setClose] = useState(false);

  const isOpen = useAsyncMemo(async () => {
    if (!indexerMetadata.indexerMetadata.url) return 'Unknown';
    try {
      const result = await fetch(`${indexerMetadata.indexerMetadata.url}/healthy`);
      const data: { autoReduceAllocation?: boolean } = await result.json();

      if (data.autoReduceAllocation) {
        if (data.autoReduceAllocation || data.autoReduceAllocation === 'true') {
          return true;
        }
        return false;
      }

      return 'Unknown';
    } finally {
      return 'Unknown';
    }
  }, [indexerMetadata.indexerMetadata.url]);

  if (close) return null;

  return (
    <div
      style={{
        display: isOpen.data === 'Unknown' || isOpen.data === undefined ? 'none' : 'flex',
      }}
      className={clsx(styles.autoReduceAllocation, isOpen.data === true ? styles.enabled : styles.disabled)}
    >
      <div className="flex" style={{ gap: 8 }}>
        {isOpen.data === true ? <InfoCircleFilled style={{ color: 'var(--sq-info)', fontSize: 14 }} /> : ''}
        {isOpen.data === false ? <IoIosCloseCircle style={{ color: 'var(--sq-error)', fontSize: 18 }} /> : ''}
        <Typography variant="medium">
          {isOpen.data === true ? 'Auto reduce over allocation enabled' : ''}
          {isOpen.data === false ? 'Auto reduce over allocation disabled' : ''}
        </Typography>

        <span style={{ flex: 1 }}></span>

        <Typography.Link
          type={isOpen.data === true ? 'info' : isOpen.data === false ? 'danger' : 'info'}
          style={{ textDecoration: 'underline' }}
        >
          Learn More
        </Typography.Link>
        <IoClose
          style={{ color: 'var(--sq-gray500)', fontSize: 18, cursor: 'pointer' }}
          onClick={() => {
            setClose(true);
          }}
        ></IoClose>
      </div>

      <div className="flex" style={{ gap: 8 }}>
        {isOpen.data === true ? (
          <InfoCircleFilled style={{ visibility: 'hidden', color: 'var(--sq-info)', fontSize: 14, flexShrink: 0 }} />
        ) : (
          ''
        )}
        {isOpen.data === false ? (
          <IoIosCloseCircle style={{ visibility: 'hidden', color: 'var(--sq-error)', fontSize: 18, flexShrink: 0 }} />
        ) : (
          ''
        )}
        <Typography type="secondary" variant="medium">
          {isOpen.data === true
            ? 'Your have enabled the &quot;Auto Reduce Over Allocation&quot; feature, the system will automatically detect when your allocation amount exceeds your available stake.'
            : ''}

          {isOpen.data === false
            ? 'Your have disabled the "Auto Reduce Over Allocation" feature, which may result in 0 rewards or burned rewards due to over-allocations. We highly recommend turning on this feature, you can set up it via Node Operator admin portal.'
            : ''}
        </Typography>
      </div>
    </div>
  );
};
export default AutoReduceAllocation;
