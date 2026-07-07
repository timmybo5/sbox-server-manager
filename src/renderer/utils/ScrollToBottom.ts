import { RefObject } from 'react';

export const shouldScrollToBottom = (
  scrollableElement: RefObject<HTMLDivElement>,
): boolean => {
  if (scrollableElement == null || scrollableElement.current == null) return false;
  const output = scrollableElement.current;
  const heightDiff = output.scrollHeight - output.clientHeight;
  const isScrolledToBottom = heightDiff <= output.scrollTop + 20;

  return isScrolledToBottom;
};
