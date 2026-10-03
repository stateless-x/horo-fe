'use client';

import { useRef, type PointerEvent, type RefObject } from 'react';

type DragState = {
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  didDrag: boolean;
};

/**
 * Adds familiar grab-to-scroll behavior for a horizontal rail when a mouse is
 * available. Touch keeps the browser's native swipe and momentum scrolling.
 */
export function useHorizontalDragScroll<T extends HTMLElement>(ref: RefObject<T | null>) {
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef(false);

  const finishDrag = (element: T, pointerId: number) => {
    const current = drag.current;
    if (!current || current.pointerId !== pointerId) return;
    if (current.didDrag) suppressClick.current = true;
    drag.current = null;
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
  };

  return {
    onPointerDown: (event: PointerEvent<T>) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      const element = ref.current;
      if (!element || element.scrollWidth <= element.clientWidth) return;
      suppressClick.current = false;
      drag.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startScrollLeft: element.scrollLeft,
        didDrag: false,
      };
    },
    onPointerMove: (event: PointerEvent<T>) => {
      const current = drag.current;
      const element = ref.current;
      if (!current || !element || current.pointerId !== event.pointerId) return;
      const distance = event.clientX - current.startX;
      // Do not capture a simple click. Capturing immediately can make a child
      // button lose its native click on some touchpads and WebViews.
      if (Math.abs(distance) > 6) {
        current.didDrag = true;
        if (!element.hasPointerCapture(event.pointerId)) element.setPointerCapture(event.pointerId);
      }
      if (!current.didDrag) return;
      event.preventDefault();
      element.scrollLeft = current.startScrollLeft - distance;
    },
    onPointerUp: (event: PointerEvent<T>) => finishDrag(event.currentTarget, event.pointerId),
    onPointerCancel: (event: PointerEvent<T>) => finishDrag(event.currentTarget, event.pointerId),
    onClickCapture: (event: React.MouseEvent<T>) => {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}
