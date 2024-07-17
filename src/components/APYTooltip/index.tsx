// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { Tooltip, Typography } from '@subql/components';

type Props = {
  currentEra: number | undefined;
  calculationDescription: string | undefined;
};

export const APYTooltipContent: React.FC<Props> = ({ currentEra, calculationDescription }): React.ReactNode => {
  return (
    <div className="col-flex" style={{ gap: 24 }}>
      <Typography variant="small" style={{ color: '#fff' }}>
        We calculated estimated APY based on the statistics from the previous Era
        {currentEra ? ` (Era ${currentEra - 1})` : null}
      </Typography>
      <Typography variant="small" style={{ color: '#fff' }}>
        As conditions change between Eras, this estimate is not a guarantee for future Eras
      </Typography>
      {calculationDescription ? (
        <Typography variant="small" style={{ color: '#fff' }}>
          {calculationDescription}
        </Typography>
      ) : null}
    </div>
  );
};

export const APYTooltip: React.FC<Props> = ({ currentEra, calculationDescription }) => {
  return (
    <Tooltip title={<APYTooltipContent currentEra={currentEra} calculationDescription={calculationDescription} />}>
      <AiOutlineInfoCircle
        style={{ fontSize: 14, marginLeft: 6, color: 'var(--sq-gray500)', flexShrink: 0 }}
      ></AiOutlineInfoCircle>
    </Tooltip>
  );
};
