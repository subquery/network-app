// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FC } from 'react';

export type Icon = {
  color?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
};

const PlaygroundIcon: FC<Icon> = ({ color = '#fff', width = 18, height = 18, style }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      style={{
        color,
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
    >
      <g clipPath="url(#clip0_3341_23102)">
        <path
          d="M2.44784 13.7185L1.78784 13.3369L9.14864 0.588135L9.80864 0.969735L2.44784 13.7185Z"
          fill="currentColor"
        />
        <path d="M1.63721 12.3179H16.36V13.0811H1.63721V12.3179Z" fill="currentColor" />
        <path
          d="M9.29227 16.9994L1.92847 12.7477L2.31007 12.0877L9.67387 16.3393L9.29227 16.9994ZM15.6895 5.91735L8.32507 1.66635L8.70667 1.00635L16.0705 5.25795L15.6895 5.91735Z"
          fill="currentColor"
        />
        <path
          d="M2.31275 5.91475L1.93115 5.25475L9.30155 1.00195L9.68315 1.66195L2.31275 5.91475Z"
          fill="currentColor"
        />
        <path
          d="M15.5532 13.7185L8.19117 0.968514L8.85117 0.586914L16.2132 13.3369L15.5532 13.7185ZM2.21997 4.74851H2.98317V13.2517H2.21997V4.74851ZM15.0168 4.74851H15.78V13.2517H15.0168V4.74851Z"
          fill="currentColor"
        />
        <path
          d="M9.16235 16.6759L8.82935 16.0987L15.2343 12.4009L15.5673 12.9781L9.16235 16.6759Z"
          fill="currentColor"
        />
        <path
          d="M16.7902 13.4997C16.577 13.8679 16.2265 14.1366 15.8156 14.2469C15.4047 14.3573 14.9667 14.3002 14.5978 14.0883C14.2296 13.8751 13.9609 13.5246 13.8506 13.1137C13.7402 12.7028 13.7973 12.2649 14.0092 11.8959C14.2224 11.5277 14.5729 11.259 14.9838 11.1487C15.3947 11.0383 15.8326 11.0954 16.2016 11.3073C16.9738 11.7531 17.236 12.7323 16.7896 13.4997H16.7902ZM3.98439 6.1041C3.77117 6.47231 3.42072 6.741 3.00979 6.85133C2.59885 6.96165 2.16095 6.90461 1.79199 6.6927C1.42362 6.47949 1.15481 6.12892 1.04447 5.71784C0.934139 5.30677 0.991286 4.86871 1.20339 4.4997C1.4166 4.13149 1.76706 3.8628 2.17799 3.75247C2.58892 3.64215 3.02683 3.69919 3.39579 3.9111C3.764 4.12431 4.03269 4.47477 4.14301 4.8857C4.25334 5.29663 4.1963 5.73454 3.98439 6.1035V6.1041ZM1.20819 13.4997C0.996276 13.1307 0.939235 12.6928 1.04956 12.2819C1.15988 11.871 1.42858 11.5205 1.79679 11.3073C2.16575 11.0954 2.60365 11.0383 3.01459 11.1487C3.42552 11.259 3.77597 11.5277 3.98919 11.8959C4.2011 12.2649 4.25814 12.7028 4.14781 13.1137C4.03749 13.5246 3.7688 13.8751 3.40059 14.0883C2.62839 14.5293 1.64859 14.2683 1.20819 13.5003V13.4997ZM14.014 6.1047C13.8021 5.73574 13.745 5.29783 13.8554 4.8869C13.9657 4.47597 14.2344 4.12551 14.6026 3.9123C14.9715 3.70039 15.4095 3.64335 15.8204 3.75367C16.2313 3.864 16.5818 4.13269 16.795 4.5009C17.0069 4.86986 17.0639 5.30777 16.9536 5.7187C16.8433 6.12963 16.5746 6.48009 16.2064 6.6933C15.8374 6.90521 15.3995 6.96225 14.9886 6.85193C14.5777 6.7416 14.2272 6.47291 14.014 6.1047ZM8.99919 17.9997C8.68184 17.9997 8.37162 17.9056 8.10777 17.7293C7.84391 17.5529 7.63827 17.3023 7.51686 17.0091C7.39544 16.7159 7.3637 16.3933 7.42566 16.0821C7.48761 15.7708 7.64048 15.485 7.86492 15.2606C8.08936 15.0363 8.37529 14.8835 8.68655 14.8217C8.99782 14.7598 9.32043 14.7917 9.61358 14.9132C9.90674 15.0347 10.1573 15.2405 10.3335 15.5044C10.5097 15.7683 10.6037 16.0786 10.6036 16.3959C10.6025 16.821 10.4331 17.2284 10.1324 17.5289C9.83175 17.8295 9.4243 17.9988 8.99919 17.9997ZM8.99919 3.2085C8.78841 3.20882 8.57963 3.16753 8.38484 3.08702C8.19004 3.0065 8.01305 2.88833 7.864 2.73929C7.71495 2.59024 7.59679 2.41325 7.51627 2.21845C7.43575 2.02365 7.39447 1.81488 7.39479 1.6041C7.39479 1.17867 7.56379 0.770657 7.86462 0.46983C8.16544 0.169003 8.57345 0 8.99889 0C9.42432 0 9.83233 0.169003 10.1332 0.46983C10.434 0.770657 10.603 1.17867 10.603 1.6041C10.6032 1.81478 10.5619 2.02344 10.4814 2.21813C10.4009 2.41282 10.2827 2.58971 10.1338 2.73869C9.9848 2.88766 9.8079 3.00579 9.61322 3.0863C9.41853 3.16681 9.20987 3.20814 8.99919 3.2079"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_3341_23102">
          <rect width="18" height="18" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PlaygroundIcon;
