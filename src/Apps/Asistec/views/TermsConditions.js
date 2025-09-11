// In App.js in a new project

import * as React from 'react';
import {View, Text} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  CoreHelperText,
  CoreImage,
} from '@src/components/';
function IndexView({navigation}) {
  return (
    <View>
      <Text>TermsConditionsView</Text>
      <CoreButton mode="contained" onPress={() => navigation.goBack()}>
        back
      </CoreButton>
    </View>
  );
}

export default IndexView;
