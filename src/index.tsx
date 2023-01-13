// entry file for the application

// types.ts
export type {
  BoundingFrame,
  MRZFrame,
  Point,
  Text,
  TextBlock,
  TextElement,
  TextLine,
  MRZCameraProps,
  MRZScannerProps,
} from './types/types';

// components
export {default as MRZCamera} from './components/MRZCamera';
export {default as MRZScanner} from './components/MRZScanner';

// resolutions.ts
export {findClosest, sortFormatsByResolution} from './util/generalUtil';

// wrapper.ts
export {default as scanMRZ} from './util/wrapper';
