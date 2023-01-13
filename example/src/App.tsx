import * as React from 'react';

import {StyleSheet, View} from 'react-native';
import {MRZProperties, MRZScanner} from 'vision-camera-mrz-scanner';

export default function App() {
  return (
    <View style={styles.container}>
      <MRZScanner
        mrzFinalResults={(mrzResults: MRZProperties) => {
          // do something with the results
          console.log('mrzResults: ', JSON.stringify(mrzResults, null, 2));
        }}
        enableMRZFeedBack={true}
        enableBoundingBox={false}
        style={StyleSheet.absoluteFill}
      />
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
