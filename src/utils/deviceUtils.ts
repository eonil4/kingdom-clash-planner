import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getDndBackend = () => {
  return isTouchDevice() ? TouchBackend : HTML5Backend;
};

export const getDndBackendOptions = () => {
  return isTouchDevice() ? { enableMouseEvents: true, delayTouchStart: 150 } : undefined;
};
