import type {StyleProp, ViewStyle} from 'react-native';
import type {CameraProps} from 'react-native-vision-camera';
import type {MRZProperties} from 'vision-camera-mrz-scanner';

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
  onData?: (OCRResults: string[]) => void | Promise<void>;
  scanSuccess?: boolean;
  cameraDirection?: 'front' | 'back'; // defaults to back
  isActiveCamera?: boolean;
};

export type MRZScannerProps = MRZCameraProps & {
  /**
   * callback function to get the final MRZ results
   * @param mrzResults
   * @returns
   */
  mrzFinalResults: (mrzResults: MRZProperties) => void | Promise<void>;
  /**
   * If true, the MRZ feedback will be enabled.
   */
  enableMRZFeedBack?: boolean;
  /**
   * number of QAs to be checked
   * @default 3
   */
  numberOfQAChecks?: number;
  mrzFeedbackCompletedColor?: string;
  mrzFeedbackUncompletedColor?: string;
  mrzFeedbackContainer?: StyleProp<ViewStyle>;
  mrzFeedbackTextStyle?: StyleProp<ViewStyle>;
};

export type BoundingFrame = {
  x: number;
  y: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  boundingCenterX: number;
  boundingCenterY: number;
};
export type Point = {x: number; y: number};
export interface Size<T = number> {
  width: T;
  height: T;
}

export type OCRElement = {
  type: 'block' | 'line' | 'element';
  index: number;
  bounds: {
    size: Size;
    origin: Point;
  };
  value: string;
};

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

/**
 * Dimensions is an object with a width property that is a number and a height property that is a
 * number.
 * @property {number} width - The width of the image in pixels.
 * @property {number} height - The height of the image in pixels.
 */
export type Dimensions = {width: number; height: number};

/**
 * Rect is an object with four properties: top, left, height, and width, all of which are numbers.
 * @property {number} top - The top position of the element.
 * @property {number} left - The x-coordinate of the top-left corner of the rectangle.
 * @property {number} height - The height of the element.
 * @property {number} width - The width of the element.
 */
export type Rect = {
  /** the y coordinate in the exact center of the face bounds */
  boundingCenterY?: number;
  /** the x coordinate in the exact center of the face bounds */
  boundingCenterX?: number;
  /** the top of the face bounds */
  top: number;
  /** the left of the face bounds */
  left: number;
  /** the bottom of the face bounds */
  bottom?: number;
  /** the right of the face bounds */
  right?: number;
  /** the height of the face bounds */
  height: number;
  /** the width of the face bounds */
  width: number;
  x?: number;
  y?: number;
};
