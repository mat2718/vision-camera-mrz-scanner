import * as React from 'react';
import {useEffect, useState} from 'react';

import {StyleSheet, View} from 'react-native';
import {useCameraDevices} from 'react-native-vision-camera';
import {MRZProperties, MRZScanner} from 'vision-camera-mrz-scanner';

export default function App() {
  const devices = useCameraDevices();
  const device = devices.back;
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  return (
    <View style={styles.container}>
      {device ? (
        <MRZScanner
          mrzFinalResults={(mrzResults: MRZProperties) => {
            // do something with the results
            console.log('mrzResults: ', JSON.stringify(mrzResults, null, 2));
            setIsActive(false);
          }}
          enableMRZFeedBack={true}
          enableBoundingBox={false}
          style={StyleSheet.absoluteFill}
          cameraProps={{
            orientation: 'portrait',
            frameProcessorFps: 60,
            device: device,
            isActive: isActive,
          }}
        />
      ) : undefined}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
