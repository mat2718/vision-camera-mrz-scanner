import * as React from 'react';
import {useEffect, useState} from 'react';

import {Button, StyleSheet, Text, View} from 'react-native';
import {useCameraDevices} from 'react-native-vision-camera';
import {MRZProperties, MRZScanner} from 'vision-camera-mrz-scanner';

export default function App() {
  const devices = useCameraDevices();
  const device = devices.back;
  const [isActive, setIsActive] = useState(true);
  const [mrzResults, setMrzResults] = useState<MRZProperties>();

  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  return (
    <View style={styles.container}>
      {device && !mrzResults ? (
        <MRZScanner
          mrzFinalResults={(mrzFinalResults: MRZProperties) => {
            // do something with the results
            console.log(
              'mrzResults: ',
              JSON.stringify(mrzFinalResults, null, 2),
            );
            setMrzResults(mrzFinalResults);
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
      {mrzResults ? (
        <View style={styles.results}>
          <Text style={styles.title}>MRZ Results</Text>
          <View style={styles.resultsContainer}>
            <View>
              <Text style={styles.label}>MRZ Source:</Text>
              <Text style={styles.text}>
                {JSON.stringify(mrzResults, null, 2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>MRZ Type: </Text>
              <Text style={styles.text}>{mrzResults.docType}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ID Number: </Text>
              <Text style={styles.text}>{mrzResults.idNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Doc Expiration: </Text>
              <Text style={styles.text}>{mrzResults.docExpirationDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Last Name: </Text>
              <Text style={styles.text}>{mrzResults.lastNames}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>First Name: </Text>
              <Text style={styles.text}>{mrzResults.givenNames}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gender: </Text>
              <Text style={styles.text}>{mrzResults.gender}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date Of Birth: </Text>
              <Text style={styles.text}>{mrzResults.dob}</Text>
            </View>
          </View>
          <Button
            onPress={() => {
              setMrzResults(undefined);
              setIsActive(true);
            }}
            title="Rescan"
          />
        </View>
      ) : undefined}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  results: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsContainer: {
    width: '100%',
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
