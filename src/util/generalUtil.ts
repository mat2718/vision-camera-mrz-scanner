import type {CameraDeviceFormat} from 'react-native-vision-camera';

/**
 * Sort formats by resolution, with higher resolution being better.
 * @param {CameraDeviceFormat} left - CameraDeviceFormat - the first format to compare
 * @param {CameraDeviceFormat} right - CameraDeviceFormat - the right side of the comparison
 * @returns The difference between the two points.
 */
export const sortFormatsByResolution = (
  left: CameraDeviceFormat,
  right: CameraDeviceFormat,
): number => {
  // in this case, points aren't "normalized" (e.g. higher resolution = 1 point, lower resolution = -1 points)
  let leftPoints = left.photoHeight * left.photoWidth;
  let rightPoints = right.photoHeight * right.photoWidth;

  // we also care about video dimensions, not only photo.
  leftPoints += left.videoWidth * left.videoHeight;
  rightPoints += right.videoWidth * right.videoHeight;

  // you can also add points for FPS, etc

  return rightPoints - leftPoints;
};
