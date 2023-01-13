import type {Frame} from 'react-native-vision-camera';
import type {MRZFrame} from '../types/types';

export default function scanMRZ(frame: Frame): MRZFrame {
  'worklet';
  // @ts-ignore

  return __scanMRZ(frame);
}
