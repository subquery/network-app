// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { Typography } from '@subql/components';
import { useUpdate } from 'ahooks';

import styles from './index.module.less';

interface IProps {
  children: React.ReactNode;
}

const Expand: FC<IProps> = (props) => {
  const update = useUpdate();

  const [expanded, setExpanded] = useState(false);
  const childrenRef = useRef<HTMLDivElement | null>(null);

  const setCallback = useCallback((ref: HTMLDivElement) => {
    childrenRef.current = ref;
    update();
  }, []);

  const showExpandIcon = useMemo(() => {
    const rect = childrenRef.current?.getBoundingClientRect();
    return !!(rect?.height && rect.height > 400);
  }, [childrenRef.current, props.children]);

  return (
    <div>
      <div
        ref={setCallback}
        style={{
          position: 'fixed',
          zIndex: '-9999',
          opacity: 0,
        }}
      >
        {props.children}
      </div>

      <div
        className={styles.expand}
        style={{
          height: expanded ? 'auto' : showExpandIcon ? 400 : 'auto',
          overflow: 'hidden',
        }}
      >
        {props.children}
      </div>

      {showExpandIcon && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
          <Typography.Link
            active
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Typography.Link>
        </div>
      )}
    </div>
  );
};
export default Expand;
