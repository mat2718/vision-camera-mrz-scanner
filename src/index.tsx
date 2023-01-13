// entry file for the application

// components
export {default as MRZCamera} from './components/MRZCamera';
export {default as MRZScanner} from './components/MRZScanner';
// types.ts
export type {MRZProperties} from './types/mrzProperties';
export type {
  BoundingFrame,
  Dimensions,
  MRZCameraProps,
  MRZFrame,
  MRZScannerProps,
  OCRElement,
  Point,
  Rect,
  Size,
  Text,
  TextBlock,
  TextElement,
  TextLine,
} from './types/types';
export {boundingBoxAdjustToView} from './util/boundingBoxAdjustToView';
// resolutions.ts
export {sortFormatsByResolution} from './util/generalUtil';
// wrapper.ts
export {default as scanMRZ} from './util/wrapper';
