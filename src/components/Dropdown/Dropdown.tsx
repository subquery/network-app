// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Dropdown.module.css';

type Item = {
  key: string;
  label?: string;
};

type Props = {
  items: Item[];
  selected?: number;
  onSelected?: (key: string, index: number) => void;
  dropdownClass?: string;
  listClassName?: string;
};

const DropdownItem: React.FC<{ item: Item; onClick?: () => void }> = ({ item, onClick }) => {
  return (
    <span key={item.key} className={styles.listItem} onClick={onClick}>
      {item.label ?? item.key}
    </span>
  );
};

const Dropdown: React.FC<Props> = (props) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const toggleOpen = () => setIsOpen((open) => !open);

  const handleSelected = (key: string, index: number) => {
    setIsOpen(false);
    props.onSelected?.(key, index);
  };

  const renderOpen = () => {
    if (!isOpen) return null;

    return (
      <div className={[styles.list, props.listClassName].filter(Boolean).join(' ')}>
        {props.items.map((item, idx) => (
          <DropdownItem key={item.key} item={item} onClick={() => handleSelected(item.key, idx)} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={[styles.dropdown, props.dropdownClass].filter(Boolean).join(' ')} onClick={toggleOpen}>
        {props.children ?? <DropdownItem item={props.items[props.selected ?? 0]} />}
        <i
          className={[`bi-chevron-${isOpen ? 'up' : 'down'}`, styles.chevron].join(' ')}
          role="img"
          aria-label={`chevron-${isOpen ? 'up' : 'down'}`}
        />
      </div>
      {renderOpen()}
    </div>
  );
};

export default Dropdown;
