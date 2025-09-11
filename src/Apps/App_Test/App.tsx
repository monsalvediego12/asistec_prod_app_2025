/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialDesignIcon from '@react-native-vector-icons/material-design-icons';

// Views
import HomeView from './HomeView';
import MapTestView from './MapTestView';

const Drawer = createDrawerNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
    initialRouteName='MapTestView'
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#6200ea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 15 }}>
            <MaterialDesignIcon name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        ),
        drawerStyle: {
          backgroundColor: '#f4f4f4',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
        },
        drawerActiveTintColor: '#6200ea',
        drawerInactiveTintColor: '#666',
      })}>
      <Drawer.Screen
        name="Home"
        component={HomeView}
        options={{
          title: 'Inicio',
          drawerIcon: ({ color, size }) => (
            <MaterialDesignIcon name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="NewAppScreen"
        component={NewAppScreen}
        options={{
          title: 'NewAppScreen',
          drawerIcon: ({ color, size }) => (
            <MaterialDesignIcon name="home" size={size} color={color} />
          ),
        }}
      />              
      <Drawer.Screen
        name="MapTestView"
        component={MapTestView}
        options={{
          title: 'Test Map',
          drawerIcon: ({ color, size }) => (
            <MaterialDesignIcon name="map" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* <NewAppScreen
        safeAreaInsets={safeAreaInsets}
      /> */}
      <NavigationContainer>
      <DrawerNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default App;
