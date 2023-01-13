import type {CameraDeviceFormat} from 'react-native-vision-camera';
import type {Face} from 'src/types/types';

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
  //lower fps for better timing between face rec and capture maybe?
  //leftPoints += left.frameRateRanges.
  return rightPoints - leftPoints;
};

/**
 * It sorts an array of objects by the distance between the object's x and y coordinates and the
 * given x and y coordinates, then returns the first object in the sorted array
 * @param {Face[]} arr - Face[] - an array of Face objects
 * @param {number} x - The x coordinate of the mouse
 * @param {number} y - number - the y coordinate of the mouse
 * @returns the closest face to the x and y coordinates.
 */
export const findClosest = (arr: Face[], x: number, y: number) => {
  const size = 1;
  return arr
    .sort((a, b) => {
      const distanceA = Math.abs(a.bounds.x - x) + Math.abs(a.bounds.y - y);
      const distanceB = Math.abs(b.bounds.x - x) + Math.abs(b.bounds.y - y);
      if (distanceA === distanceB) {
        return a.bounds.x - b.bounds.x;
      }
      return distanceA - distanceB;
    })
    .slice(0, size)
    .sort((a, b) => a.bounds.x - b.bounds.x);
};
