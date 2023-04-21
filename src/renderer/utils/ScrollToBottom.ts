import { MutableRefObject } from 'react';

export const shouldScrollToBottom = (
  scrollableElement: MutableRefObject<HTMLDivElement>,
): boolean => {
  if (scrollableElement == null || scrollableElement.current == null) return;
  const output = scrollableElement.current;
  const heightDiff = output.scrollHeight - output.clientHeight;
  const isScrolledToBottom = heightDiff <= output.scrollTop + 20;

  return isScrolledToBottom;
};
