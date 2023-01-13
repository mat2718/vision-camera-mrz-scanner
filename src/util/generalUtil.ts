import type {CameraDeviceFormat} from 'react-native-vision-camera';

/**
 * Sort the camera formats by resolution, with the highest resolution first.
 * @param {CameraDeviceFormat} left - CameraDeviceFormat
 * @param {CameraDeviceFormat} right - CameraDeviceFormat - the right side of the comparison
 * @returns The difference between the two values.
 */
export const sortFormatsByResolution = (
  left: CameraDeviceFormat,
  right: CameraDeviceFormat,
): number => {
  //higher res first
  let leftPoints = left.photoHeight * left.photoWidth;
  let rightPoints = right.photoHeight * right.photoWidth;
  //lower fps for better timing between OCR rec and capture maybe?
  //leftPoints += left.frameRateRanges.
  return rightPoints - leftPoints;
};
