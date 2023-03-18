import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  LayoutChangeEvent,
  PixelRatio,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {runOnJS} from 'react-native-reanimated';
import {
  Camera,
  Frame,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {
  boundingBoxAdjustToView,
  BoundingFrame,
  Dimensions,
  MRZCameraProps,
  MRZFrame,
  scanMRZ,
  sortFormatsByResolution,
} from 'vision-camera-mrz-scanner';

const MRZCamera: FC<PropsWithChildren<MRZCameraProps>> = ({
  enableBoundingBox,
  boundingBoxStyle,
  boundingBoxHorizontalPadding,
  boundingBoxVerticalPadding,
  style,
  skipButtonEnabled: photoSkipButtonEnabled,
  skipButton: photoSkipButton,
  onSkipPressed: photoSkipOnPress,
  skipButtonStyle: photoSkipButtonStyle,
  cameraProps,
  onData,
  scanSuccess,
  skipButtonText,
  cameraDirection,
  isActiveCamera,
}) => {
  //*****************************************************************************************
  //  setting up the state
  //*****************************************************************************************
  // Permissions
  const [hasPermission, setHasPermission] = React.useState(false);
  // camera states
  const devices = useCameraDevices();
  const direction: 'front' | 'back' = cameraDirection ?? 'back';
  const device = devices[direction];
  const camera = useRef<Camera>(null);
  const {height: screenHeight, width: screenWidth} = useWindowDimensions();
  const [isActive, setIsActive] = useState(true);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [ocrElements, setOcrElements] = useState<BoundingFrame[]>([]);
  const [frameDimensions, setFrameDimensions] = useState<Dimensions>();
  const landscapeMode = screenWidth > screenHeight;
  const [pixelRatio, setPixelRatio] = React.useState<number>(1);

  //*****************************************************************************************
  // Comp Logic
  //*****************************************************************************************

  // const xRatio = frame.width / WINDOW_WIDTH;
  // const yRatio = frame.height / WINDOW_HEIGHT;
  /* A cleanup function that is called when the component is unmounted. */
  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  // which format should we use
  const formats = useMemo(
    () => device?.formats.sort(sortFormatsByResolution),
    [device?.formats],
  );

  //figure our what happens if it is undefined?
  const [format, setFormat] = useState(
    formats && formats.length > 0 ? formats[0] : undefined,
  );

  /**
   * Prevents sending copious amounts of scans
   */
  const handleScan = useCallback(
    (data: MRZFrame, frame: Frame) => {
      const isRotated = !landscapeMode;
      setFrameDimensions(
        isRotated
          ? {
              width: frame.height,
              height: frame.width,
            }
          : {
              width: frame.width,
              height: frame.height,
            },
      );
      if (
        data &&
        data.result &&
        data.result.blocks &&
        data.result.blocks.length === 0
      ) {
        setFeedbackText('');
      }
      /* Scanning the text from the image and then setting the state of the component. */

      if (
        data &&
        data.result &&
        data.result.blocks &&
        data.result.blocks.length > 0
      ) {
        let updatedOCRElements: BoundingFrame[] = [];
        data.result.blocks.forEach(block => {
          if (block.frame.width / screenWidth < 0.8) {
            setFeedbackText('Hold Still');
          } else {
            setFeedbackText('Scanning...');
          }
          updatedOCRElements.push({...block.frame});
        });

        let lines: string[] = [];
        data.result.blocks.forEach(block => {
          lines.push(block.text);
        });
        if (lines.length > 0 && isActive && onData) {
          setOcrElements(updatedOCRElements);
          onData(lines);
        } else {
          setOcrElements([]);
        }
      }
    },
    [isActive, landscapeMode, onData, screenWidth],
  );

  /* Setting the format to the first format in the formats array. */
  useEffect(() => {
    setFormat(formats && formats.length > 0 ? formats[0] : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  /* Using the useFrameProcessor hook to process the video frames. */
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!scanSuccess) {
        const ocrData = scanMRZ(frame);
        runOnJS(handleScan)(ocrData, frame);
      }
    },
    [handleScan],
  );

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  /* Using the useMemo hook to create a style object. */
  const boundingStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: screenWidth,
      height: screenHeight,
    }),
    [screenWidth, screenHeight],
  );

  const bounds = ocrElements[ocrElements.length - 1];

  //*****************************************************************************************
  // stylesheet
  //*****************************************************************************************

  const styles = StyleSheet.create({
    fixToText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    skipButtonContainer: {
      position: 'absolute',
      bottom: screenHeight * 0.05,
      width: screenWidth,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    feedbackContainer: {
      position: 'absolute',
      top: screenHeight * 0.3,
      width: screenWidth,
      alignItems: 'center',
    },
    feedbackText: {
      backgroundColor: 'white',
      color: 'black',
      fontSize: 18,
      paddingRight: 8,
      paddingLeft: 8,
      textAlign: 'center',
    },
    boundingBox: {
      borderRadius: 5,
      borderWidth: 3,
      borderColor: 'yellow',
      position: 'absolute',
      left: bounds ? bounds.x * pixelRatio : 0,
      top: bounds ? bounds.y * pixelRatio : 0,
      height: bounds ? bounds.height : 35,
      width: bounds ? bounds.width : 35,
    },
  });

  //*****************************************************************************************
  // Components
  //*****************************************************************************************

  return (
    <View style={style}>
      {device && hasPermission ? (
        <Camera
          style={cameraProps?.style ?? StyleSheet.absoluteFill}
          device={cameraProps?.device ?? device}
          torch={cameraProps?.torch}
          isActive={
            isActiveCamera
              ? isActiveCamera
              : cameraProps?.isActive
              ? cameraProps?.isActive
              : isActive
          }
          ref={camera}
          photo={cameraProps?.photo}
          video={cameraProps?.video}
          audio={cameraProps?.audio}
          zoom={cameraProps?.zoom}
          enableZoomGesture={cameraProps?.enableZoomGesture}
          preset={cameraProps?.preset}
          format={cameraProps?.format ?? format}
          fps={cameraProps?.fps ?? 10}
          hdr={cameraProps?.hdr}
          lowLightBoost={cameraProps?.lowLightBoost}
          colorSpace={cameraProps?.colorSpace}
          videoStabilizationMode={cameraProps?.videoStabilizationMode}
          enableDepthData={cameraProps?.enableDepthData}
          enablePortraitEffectsMatteDelivery={
            cameraProps?.enablePortraitEffectsMatteDelivery
          }
          enableHighQualityPhotos={cameraProps?.enableHighQualityPhotos}
          onError={cameraProps?.onError}
          onInitialized={cameraProps?.onInitialized}
          onFrameProcessorPerformanceSuggestionAvailable={
            cameraProps?.onFrameProcessorPerformanceSuggestionAvailable
          }
          frameProcessor={cameraProps?.frameProcessor ?? frameProcessor}
          frameProcessorFps={cameraProps?.frameProcessorFps ?? 30}
          onLayout={(event: LayoutChangeEvent) => {
            setPixelRatio(
              event.nativeEvent.layout.width /
                PixelRatio.getPixelSizeForLayoutSize(
                  event.nativeEvent.layout.width,
                ),
            );
          }}
        />
      ) : undefined}
      {/* <View style={[styles.boundingBox]} /> */}
      {enableBoundingBox && ocrElements.length > 0 ? (
        <View style={boundingStyle} testID="faceDetectionBoxView">
          {frameDimensions &&
            (() => {
              const {adjustRect} = boundingBoxAdjustToView(
                frameDimensions,
                {
                  width: landscapeMode ? screenHeight : screenWidth,
                  height: landscapeMode ? screenWidth : screenHeight,
                },
                landscapeMode,
                boundingBoxVerticalPadding,
                boundingBoxHorizontalPadding,
              );
              return ocrElements
                ? ocrElements.map((i, index) => {
                    const {left, ...others} = adjustRect(i);
                    return (
                      <View
                        key={index}
                        style={[
                          styles.boundingBox,
                          {
                            ...others,
                            left: left,
                          },
                          boundingBoxStyle,
                        ]}
                      />
                    );
                  })
                : undefined;
            })()}
        </View>
      ) : null}
      {photoSkipButton ? (
        <View style={[styles.fixToText]}>
          {photoSkipButtonEnabled ? (
            photoSkipButton ? (
              <TouchableOpacity onPress={photoSkipOnPress}>
                {photoSkipButton}
              </TouchableOpacity>
            ) : (
              <View style={[styles.skipButtonContainer, photoSkipButtonStyle]}>
                <Button
                  title={skipButtonText ? skipButtonText : 'Skip'}
                  onPress={photoSkipOnPress}
                />
              </View>
            )
          ) : undefined}
        </View>
      ) : undefined}
      {feedbackText ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedbackText}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default MRZCamera;
