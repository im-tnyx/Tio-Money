import { useCallback, useRef, useState } from 'react';

import { useAppTheme } from '@/shared/theme/theme-provider';

import {
  getSwipeOffset,
  isHorizontalSwipe,
  shouldCloseRevealedSwipe,
  snapSwipeOffset,
} from './sub-currency-swipe';

interface SwipeStart {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly offset: number;
  readonly width: number;
}

/** Account Group custom-row gesture state stays in the route, not the screen. */
export interface AccountGroupSwipeController {
  readonly openId: string | null;
  readonly cardTouchActive: boolean;
  offset(id: string, width: number): number;
  begin(id: string, x: number, y: number, width: number): void;
  end(): void;
  cancel(): void;
  shouldCapture(id: string, x: number, y: number): boolean;
  move(id: string, x: number): void;
  release(id: string, x: number, y: number): void;
  close(): void;
}

export function useAccountGroupSwipeController(): AccountGroupSwipeController {
  const theme = useAppTheme();
  const threshold = theme.bottomSheet.dragActivationDistance;
  const [openId, setOpenId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; offset: number } | null>(null);
  const [cardTouchActive, setCardTouchActive] = useState(false);
  const start = useRef<SwipeStart | null>(null);

  const close = useCallback(() => {
    setOpenId(null);
    setDrag(null);
    start.current = null;
  }, []);

  const offset = useCallback(
    (id: string, width: number) =>
      drag?.id === id ? drag.offset : openId === id ? width : 0,
    [drag, openId],
  );

  const begin = useCallback(
    (id: string, x: number, y: number, width: number) => {
      start.current = { id, x, y, offset: openId === id ? width : 0, width };
      setCardTouchActive(true);
    },
    [openId],
  );

  const end = useCallback(() => setCardTouchActive(false), []);
  const cancel = useCallback(() => {
    start.current = null;
    setDrag(null);
    setCardTouchActive(false);
  }, []);

  const shouldCapture = useCallback(
    (id: string, x: number, y: number) => {
      const from = start.current;
      return from?.id === id && isHorizontalSwipe(x - from.x, y - from.y, threshold);
    },
    [threshold],
  );

  const move = useCallback((id: string, x: number) => {
    const from = start.current;
    if (from?.id !== id) return;
    setDrag({ id, offset: getSwipeOffset(from.offset, x - from.x, from.width) });
  }, []);

  const release = useCallback(
    (id: string, x: number, y: number) => {
      const from = start.current;
      start.current = null;
      setDrag(null);
      setCardTouchActive(false);
      if (!from || from.id !== id) return;
      const dx = x - from.x;
      const dy = y - from.y;
      const next = getSwipeOffset(from.offset, dx, from.width);
      if (shouldCloseRevealedSwipe(from.offset, dx, dy, threshold)) {
        setOpenId(null);
      } else {
        setOpenId(snapSwipeOffset(next, from.width) > 0 ? id : null);
      }
    },
    [threshold],
  );

  return {
    openId,
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
