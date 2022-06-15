// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@subql/react-ui';
import { SEASONS } from '../../pages/missions/constants';
import styles from './SeasonInfo.module.css';

const ConButton: React.VFC<{ season: number; viewPrev: () => void; viewCurr: () => void }> = ({
  season,
  viewPrev,
  viewCurr,
}) => {
  if (season > 2) {
    return <Button type="secondary" colorScheme="standard" label="Previous Season" onClick={viewPrev} />;
  } else {
    return <Button type="secondary" colorScheme="standard" label="View Current Season" onClick={viewCurr} />;
  }
};

export const SeasonInfo: React.VFC<{ season: number; viewPrev: () => void; viewCurr: () => void }> = ({
  season,
  viewPrev,
  viewCurr,
}) => {
  return (
    <div>
      <div className={styles.titlebutton}>
        <h1>
          <b>Season {season}</b>
        </h1>
        <ConButton season={season} viewPrev={viewPrev} viewCurr={viewCurr} />
      </div>
      <h3>
        Duration: {SEASONS[season]['from'].toLocaleString().split(',')[0]} -{' '}
        {SEASONS[season]['to'].toLocaleString().split(',')[0]}
      </h3>
      <h3>Data is typically updated every half hour</h3>
    </div>
  );
};
