/* eslint-disable no-undef */

import type {StyleProp, ViewStyle} from 'react-native';
import type {CameraProps} from 'react-native-vision-camera';

export type MRZCameraProps = {
  /**
   * If true, the bounding box will be drawn around the face detected.
   */
  enableBoundingBox?: boolean;
  /**
   * The color of the bounding box.
   */
  boundingBoxStyle?: StyleProp<ViewStyle>;
  /**
   * The vertical padding of the bounding box.
   */
  boundingBoxVerticalPadding?: number;
  /**
   * The horizontal padding of the bounding box.
   */
  boundingBoxHorizontalPadding?: number;
  /**
   * The style of the component.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * If true, the photo skip button will be enabled.
   */
  skipButtonEnabled?: boolean;
  /**
   * The component to use as the photo skip button.
   */
  skipButton?: React.ReactNode;
  /**
   * callback function to skip the photo
   * @returns
   */
  onSkipPressed?: () => void;
  /**
   * The style of the photo skip button.
   */
  skipButtonStyle?: StyleProp<ViewStyle>;
  /**
   * The text of the photo skip button.
   */
  skipButtonText?: string;
  /**
   * all options for the camera
   */
  cameraProps?: CameraProps;
  onData: (propertyTag: string[]) => void | Promise<void>;
  scanSuccess: boolean;
};

export type MRZScannerProps = MRZCameraProps & {};

export type BoundingFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
  boundingCenterX: number;
  boundingCenterY: number;
};
export type Point = {x: number; y: number};

export type TextElement = {
  text: string;
  frame: BoundingFrame;
  cornerPoints: Point[];
};

export type TextLine = {
  text: string;
  elements: TextElement[];
  frame: BoundingFrame;
  recognizedLanguages: string[];
  cornerPoints: Point[];
};

export type TextBlock = {
  text: string;
  lines: TextLine[];
  frame: BoundingFrame;
  recognizedLanguages: string[];
  cornerPoints: Point[];
};

export type Text = {
  text: string;
  blocks: TextBlock[];
};

export type MRZFrame = {
  result: Text;
};
