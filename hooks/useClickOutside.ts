
import { useEffect, RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: Event) => void,
  ignoreRef?: RefObject<HTMLElement | null>
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      const ignoreEl = ignoreRef?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains((event.target as Node))) {
        return;
      }

      // Do nothing if clicking the ignore element (usually the trigger button)
      if (ignoreEl && ignoreEl.contains((event.target as Node))) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, ignoreRef]);
};