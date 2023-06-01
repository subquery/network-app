// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RefObject, useEffect, useRef, useState } from 'react';

export function useOnScreen(ref: RefObject<HTMLElement>): boolean {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isOnScreen, setIsOnScreen] = useState<boolean>(false);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting));
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    observerRef.current?.observe(ref.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [ref]);

  return isOnScreen;
}
