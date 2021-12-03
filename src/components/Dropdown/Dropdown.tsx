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
  className?: string;
  dropdownClass?: string;
  listClassName?: string;
};

const DropdownItem: React.FC<{ item: Item; className?: string; onClick?: () => void }> = ({
  item,
  className,
  onClick,
}) => {
  if (!item) return null;

  return (
    <span key={item.key} className={[styles.listItem, className].join(' ')} onClick={onClick}>
      {item.label ?? item.key}
    </span>
  );
};

const Dropdown: React.FC<Props> = (props) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const selected = props.selected;

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
          <DropdownItem
            key={item.key}
            item={item}
            onClick={() => handleSelected(item.key, idx)}
            className={selected === idx ? styles.selected : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={[styles.container, props.className].join(' ')}>
      <div
        className={[styles.dropdown, props.dropdownClass].filter(Boolean).join(' ')}
        tabIndex={0}
        onClick={toggleOpen}
        // onBlur={() => setIsOpen(false)}
      >
        {props.children ?? <DropdownItem item={props.items[selected ?? 0]} className={styles.itemClosed} />}
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
