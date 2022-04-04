// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const getTrimmedStr = (string: string | undefined, maxLength = 9): string | undefined => {
  if (!string) return string;
  if (maxLength < 1) return string;
  if (string.length <= maxLength) return string;
  if (maxLength === 1) return `${string.substring(0, 1)} ...`;

  const midpoint = Math.ceil(string.length / 2);
  const toRemove = string.length - maxLength;
  const lastRip = Math.ceil(toRemove / 2);
  const rstrip = toRemove - lastRip;
  return `${string.substring(0, midpoint - lastRip)} ... ${string.substring(midpoint + rstrip)}`;
};
