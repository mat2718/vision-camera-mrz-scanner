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
  CameraProps,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import type {MRZCameraProps} from 'src/types/types';
import {
  MRZFrame,
  scanMRZ,
  sortFormatsByResolution,
} from 'vision-camera-mrz-scanner';

const MRZCamera: FC<PropsWithChildren<MRZCameraProps>> = ({
  style,
  skipButtonEnabled: photoSkipButtonEnabled,
  skipButton: photoSkipButton,
  onSkipPressed: photoSkipOnPress,
  skipButtonStyle: photoSkipButtonStyle,
  cameraProps,
  onData,
  scanSuccess,
  skipButtonText,
}) => {
  //*****************************************************************************************
  //  setting up the state
  //*****************************************************************************************
  // Permissions
  const [hasPermission, setHasPermission] = React.useState(false);
  // camera states
  const devices = useCameraDevices();
  const direction: 'front' | 'back' = 'front';
  const device = devices[direction];
  const camera = useRef<Camera>(null);
  const {height: screenHeight, width: screenWidth} = useWindowDimensions();
  const landscapeMode = screenWidth > screenHeight;
  const [isActive, setIsActive] = useState(true);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [scanning, setScanning] = useState(false);

  //*****************************************************************************************
  // Comp Logic
  //*****************************************************************************************

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
    (data: MRZFrame) => {
      if (data.result.blocks.length === 0) {
        setFeedbackText('');
      }
      data.result.blocks.forEach(block => {
        if (block.frame.width / screenWidth < 0.8) {
          setFeedbackText('Hold Still');
        } else {
          setFeedbackText('Scanning...');
        }
      });

      /* Scanning the text from the image and then setting the state of the component. */
      if (!scanSuccess && !scanning) {
        setScanning(true);
        if (data && data.result && data.result.blocks.length > 0) {
          let lines: string[] = [];
          data.result.blocks.forEach(block => {
            lines.push(block.text);
          });
          if (lines.length > 0 && isActive) {
            onData(lines);
          }
        }
      }
      setScanning(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scanSuccess, scanning, screenWidth, onData],
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

      const ocrData = scanMRZ(frame);
      runOnJS(handleScan)(ocrData);
    },
    [scanSuccess, isActive],
  );

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

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

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
          isActive={cameraProps?.isActive ?? isActive}
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
          frameProcessorFps={cameraProps?.frameProcessorFps ?? 10}
        />
      ) : undefined}
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
