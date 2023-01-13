import type {Frame} from 'react-native-vision-camera';
import type {MRZFrame} from 'src/types/types';

export default function scanMRZ(frame: Frame): MRZFrame {
  'worklet';
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return __scanMRZ(frame);
}
