/**
 * @format
 */

import 'react-native-gesture-handler'; // debe estar primero - RNGH
import {enableScreens} from 'react-native-screens';
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Notifications Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('INDEX messaging().setBackgroundMessageHandler', remoteMessage);
});

// Check if app was launched in the background and conditionally render null if so
export default function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  // Render the app component on foreground launch
  return <App />;
}

// export default function Main() {
//   return <App />;
// }

enableScreens(false);
AppRegistry.registerComponent(appName, () => HeadlessCheck);
