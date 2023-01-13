# vision-camera-mrz-scanner

VisionCamera Frame Processor Plugin to detect and read MRZ data from passports using MLKit Text Recognition.

- A helper function has been added for those using headers or footers to adjust the bounding box parameters. A working example using React-native 0.70.6 and updated reanimated and vision camera packages are located here: [example](https://github.com/mat2718/vision-camera-mrz-scanner/tree/main/example)

## Installation & Configuration

### Install

```sh
# install with npm
npm install vision-camera-mrz-scanner

# or install with yarn
yarn add vision-camera-mrz-scanner
```

### Configure

### Add the below plugin to your babel config file

```js
// babel.config.js
module.exports = {
  plugins: [
    [
      'react-native-reanimated/plugin',
      {
        globals: ['__scanMRZ'],
      },
    ],
  ],
};
```

### Add the following permission to the AndroidManifest.xml located at ~/android/app/src/AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.CAMERA"/>
```

---

## Functions

### boundingBoxAdjustToView()

- It takes a frame and a view, and returns an object with two functions: adjustPoint and adjustRect

### sortFormatsByResolution()

- Sort the camera formats by resolution, with the highest resolution first.

### scanMRZ()

- For use inside the frame processor. This function is only needed if you are using the MRZCamera directly rather than the MRZScanner.

---

## Basic Usage

```tsx
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
```

## Just want OCR Camera without the MRZ Scan?

```tsx
// import MRZCamera instead of MRZScanner
import {MRZCamera, MRZScannerProps} from 'vision-camera-mrz-scanner';
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
