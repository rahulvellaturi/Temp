import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Opens a modal when the URL contains ?action=<value>, then removes the param.
 */
export function useModalFromSearchParam(
  paramValue: string,
  onOpen: () => void,
  enabled = true
) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!enabled) return;
    if (searchParams.get('action') !== paramValue) return;

    onOpen();
    const next = new URLSearchParams(searchParams);
    next.delete('action');
    setSearchParams(next, { replace: true });
  }, [enabled, paramValue, onOpen, searchParams, setSearchParams]);
}
