/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StyleSheet, View, Text} from 'react-native';

function ScreenView() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenText}>Pantalla de Inicio</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  screenText: {
    fontSize: 18,
    color: '#333',
  },
});

export default ScreenView;