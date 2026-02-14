import { useBlocker } from 'react-router-dom';
import { MutableRefObject } from 'react';

/**
 * Hook to block navigation when a form has unsaved changes.
 * @param isDirty Boolean indicating if the form has unsaved changes
 * @param ignoreRef Optional ref to bypass the blocker (e.g. during submission)
 * @returns The blocker object from react-router-dom
 */
export function useFormGuard(isDirty: boolean, ignoreRef?: MutableRefObject<boolean>) {
  // Block navigation if isDirty is true and we are not ignoring
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      if (ignoreRef?.current) return false;
      return isDirty && currentLocation.pathname !== nextLocation.pathname;
    }
  );

  return {
    blocker,
    showModal: blocker.state === 'blocked',
  };
}
