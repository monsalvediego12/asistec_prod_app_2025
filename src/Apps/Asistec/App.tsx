/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import React, { useState } from 'react';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialDesignIcon from '@react-native-vector-icons/material-design-icons';

// Themes
import CoreThemeProvider, { useCoreTheme } from '@src/themes';

// Components
import ContactModalContent from './components/ContactModalContent';

// Views


const Drawer = createDrawerNavigator();



function DrawerNavigator() {

  return (
    <Drawer.Navigator

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
        name="NewAppScreen"
        component={NewAppScreen}
        options={{
          title: 'NewAppScreen',
          drawerIcon: ({ color, size }) => (
            <MaterialDesignIcon name="home" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [modalContact, setModalContact] = React.useState(false);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>

      <>

      </>
      {/* Botón temporal para mostrar ContactModalContent */}
      <TouchableOpacity
        style={styles.tempButton}
        onPress={() => setModalContact(true)}>
        <Text style={styles.tempButtonText}>Mostrar Contacto (Temporal)</Text>
      </TouchableOpacity>

      <ContactModalContent
        visible={modalContact}
        onDismiss={() => setModalContact(false)}
      />

    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <CoreThemeProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppContent />
        </CoreThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tempButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#6200ea',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,
  },
  tempButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
export default App;
