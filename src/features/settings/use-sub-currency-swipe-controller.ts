import { useCallback, useRef, useState } from 'react';

import type { CurrencyCode } from '@/shared/currency/currency-preference';
import { useAppTheme } from '@/shared/theme/theme-provider';

import {
  getSwipeOffset,
  isHorizontalSwipe,
  shouldCloseRevealedSwipe,
  snapSwipeOffset,
} from './sub-currency-swipe';

interface SwipeStart {
  readonly code: CurrencyCode;
  readonly x: number;
  readonly y: number;
  readonly offset: number;
  readonly revealWidth: number;
}

/** Gesture workflow belongs to the route/controller, never to the dumb screen. */
export interface SubCurrencySwipeController {
  readonly openCode: CurrencyCode | null;
  readonly cardTouchActive: boolean;
  offset(code: CurrencyCode, revealWidth: number): number;
  begin(code: CurrencyCode, x: number, y: number, revealWidth: number): void;
  end(): void;
  cancel(): void;
  shouldCapture(code: CurrencyCode, x: number, y: number): boolean;
  move(code: CurrencyCode, x: number): void;
  release(code: CurrencyCode, x: number, y: number): void;
  close(): void;
}

export function useSubCurrencySwipeController(): SubCurrencySwipeController {
  const theme = useAppTheme();
  const threshold = theme.bottomSheet.dragActivationDistance;
  const [openCode, setOpenCode] = useState<CurrencyCode | null>(null);
  const [drag, setDrag] = useState<{ code: CurrencyCode; offset: number } | null>(null);
  const [cardTouchActive, setCardTouchActive] = useState(false);
  const start = useRef<SwipeStart | null>(null);

  const close = useCallback(() => {
    setOpenCode(null);
    setDrag(null);
  }, []);

  const offset = useCallback(
    (code: CurrencyCode, revealWidth: number) =>
      drag?.code === code ? drag.offset : openCode === code ? revealWidth : 0,
    [drag, openCode],
  );

  const begin = useCallback(
    (code: CurrencyCode, x: number, y: number, revealWidth: number) => {
      start.current = {
        code,
        x,
        y,
        offset: openCode === code ? revealWidth : 0,
        revealWidth,
      };
      setCardTouchActive(true);
    },
    [openCode],
  );

  const end = useCallback(() => setCardTouchActive(false), []);
  const cancel = useCallback(() => {
    setDrag(null);
    setCardTouchActive(false);
    start.current = null;
  }, []);

  const shouldCapture = useCallback(
    (code: CurrencyCode, x: number, y: number) => {
      const from = start.current;
      return from?.code === code && isHorizontalSwipe(x - from.x, y - from.y, threshold);
    },
    [threshold],
  );

  const move = useCallback((code: CurrencyCode, x: number) => {
    const from = start.current;
    if (from?.code !== code) return;
    setDrag({
      code,
      offset: getSwipeOffset(from.offset, x - from.x, from.revealWidth),
    });
  }, []);

  const release = useCallback(
    (code: CurrencyCode, x: number, y: number) => {
      const from = start.current;
      start.current = null;
      setDrag(null);
      setCardTouchActive(false);
      if (!from || from.code !== code) return;
      const dx = x - from.x;
      const dy = y - from.y;
      const next = getSwipeOffset(from.offset, dx, from.revealWidth);
      if (shouldCloseRevealedSwipe(from.offset, dx, dy, threshold)) {
        setOpenCode(null);
      } else {
        setOpenCode(snapSwipeOffset(next, from.revealWidth) > 0 ? code : null);
      }
    },
    [threshold],
  );

  return {
    openCode,
    cardTouchActive,
    offset,
    begin,
    end,
    cancel,
    shouldCapture,
    move,
    release,
    close,
  };
}
