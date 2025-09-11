/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, TouchableOpacity, Linking, Platform } from 'react-native';
import { PaperProvider, List, Portal, Divider, Dialog } from 'react-native-paper';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
  SafeAreaView
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialDesignIcon from '@react-native-vector-icons/material-design-icons';
import { Provider } from 'react-redux';
import store from '@src/redux/store';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoreComponentsProvider } from '@src/components';

// Firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {
  UserModel,
  requestUserPermissionMessaging,
  registerUserDeviceFCM,
} from '@src/Apps/Asistec/utils/firebase/firestore';

// Themes
import CoreThemeProvider, { useCoreTheme } from '@src/themes';

// Store
import { useSelector, useDispatch } from 'react-redux';
import { setDefaultFilters, setLoaderViewMsg } from '@src/Apps/Asistec/store/redux/slice/appSlice';
import { useAppStore } from '@src/store';

// Components
import { useCoreComponents } from '@src/components/CoreComponentsProvider';
import AsistecDrawerContent from './components/AsistecDrawerContent';
import CoreIconMaterial from '@src/components/CoreIconMaterial';
import CoreIconMaterialCommunity from '@src/components/CoreIconMaterialCommunity';
import CoreText from '@src/components/CoreText';
import CoreButton from '@src/components/CoreButton';

// Navigation
import NavigationService from '@src/navigation/NavigationService';

// Utils
import { fetchAwsToken, appIsFetchAwsToken } from '@src/utils/core_fnt';

// Views
import HomeView from '@src/Apps/Asistec/views/Home';
import TermsConditionsView from '@src/Apps/Asistec/views/TermsConditions';
import LoadingView from '@src/Apps/Asistec/views/LoadingScreen';
import LoginView from '@src/Apps/Asistec/views/Login';
import ProfileView from '@src/Apps/Asistec/views/Profile';
import AdminUsersView from '@src/Apps/Asistec/views/admin/Users';
import AdminUsersModal from '@src/Apps/Asistec/views/admin/ModalUsers';
import AdminCustomersView from '@src/Apps/Asistec/views/admin/Customers';
import AdminCustomersModal from '@src/Apps/Asistec/views/admin/ModalCustomers';
import AdminServicesView from '@src/Apps/Asistec/views/admin/Services';
import AdminServicesModal from '@src/Apps/Asistec/views/admin/ModalServices';
import AdminScheduleServicesModal from '@src/Apps/Asistec/views/admin/ModalScheduleService';
import AdminServicesListView from '@src/Apps/Asistec/views/admin/ServicesList';
import ModalServiceTracking from '@src/Apps/Asistec/views/admin/ModalServiceTracking';
import ModalServiceTrackingDetails from '@src/Apps/Asistec/views/admin/ModalServiceTrackingDetails';
import FiltersServices from '@src/Apps/Asistec/views/admin/FiltersServices';
import ModalServiceOrderActa from '@src/Apps/Asistec/views/admin/ModalServiceOrderActa';
import ModalServiceOrderEntregaAdminTech from '@src/Apps/Asistec/views/admin/ModalServiceOrderEntregaAdminTech';
import NotificationsLogsView from '@src/Apps/Asistec/views/admin/NotificationsLogsView';
import ServiceWarranty from '@src/Apps/Asistec/views/admin/ServiceWarranty';
import ChatMessages from '@src/Apps/Asistec/views/admin/ChatMessages';
//
import MapTestView from '@src/Apps/App_Test/MapTestView';

const Drawer = createDrawerNavigator();

const ContactModalContent = ({ navigation, themeData }: any) => {
  return (
    <View>
      <CoreButton
        mode="contained-tonal"
        onPress={() => Linking.openURL(`tel:${asistecData.contact_number_1}`)}
        style={{ marginVertical: 5 }}
        contentStyle={{
          justifyContent: 'start',
        }}
        icon="phone">
        Llámanos
      </CoreButton>
      <CoreButton
        mode="contained-tonal"
        style={{ marginVertical: 5 }}
        onPress={() =>
          Linking.openURL(
            `whatsapp://send?phone=57${asistecData.contact_number_1}`,
          ).catch(e => {
            console.log('error Linking', e);
          })
        }
        contentStyle={{
          justifyContent: 'start',
        }}
        icon="whatsapp">
        Whatsapp
      </CoreButton>
    </View>
  );
};

const HomeViewMenuIconCustom = ({ navigation, themeData }: any) => {
  return (
    <View style={{ paddingLeft: 15 }}>
      <TouchableOpacity
        onPress={navigation.toggleDrawer}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: themeData.colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          ...Platform.select({
            ios: {
              shadowColor: 'black',
              shadowOpacity: 0.5,
              shadowRadius: 3,
              shadowOffset: {
                width: 0,
                height: 2,
              },
            },
            android: {
              elevation: 5,
            },
          }),
        }}>
        <CoreIconMaterial name={'menu'} size={24} color={'white'} />
      </TouchableOpacity>
    </View>
  );
};


const AppNavigation = () => {
  const Drawer = createDrawerNavigator();
  const { appSetLoader, appSetSnack } = useCoreComponents();
  const { themeData, themeDataNavigation } = useCoreTheme();
  const [modalContact, setModalContact] = React.useState(false);
  const { appStoreUserProfile, appStoreData, setUserStore, setUserProfileStore } =
    useAppStore();

  const logout = async () => {
    appSetLoader({ state: true, message: 'Cerrando...' });
    setUserStore({});
    setUserProfileStore({});
    await UserModel.logout();
    appSetLoader({ state: false });
  };
  return (
    <>
      <Drawer.Navigator
        initialRouteName="HomeView"
        drawerContent={props =>
          <AsistecDrawerContent
            {...props}
            appSetLoader={(loader: any) => console.log('Loading:', loader)}
            appStoreUserProfile={{
              type: 1,
              full_name: 'Usuario Demo'
            }}
            onLogout={logout}
          />
        }
        screenOptions={{
          sceneContainerStyle: {
            backgroundColor: '#fff',
          },
          headerStatusBarHeight: 0,
          headerStyle: {
            paddingTop: 0,
          }
        }}>
        <Drawer.Group>
          <Drawer.Screen
            name="HomeView"
            component={HomeView}
            options={({ navigation }) => ({
              headerShadowVisible: false,
              headerTitle: () => (
                <View style={{ flexDirection: 'row', borderBottomWidth: 0 }}>
                  <CoreText style={{ fontWeight: 'bold' }} variant="titleLarge">
                    Hola,{' '}
                  </CoreText>
                  <CoreText
                    style={{
                      fontWeight: 'bold',
                      color: themeData.colors.asistectSec,
                    }}
                    variant="titleLarge">
                    {appStoreUserProfile?.full_name &&
                      appStoreUserProfile?.full_name.length > 17
                      ? appStoreUserProfile?.full_name.substring(0, 17) + '...'
                      : appStoreUserProfile?.full_name || ''}
                  </CoreText>
                  <CoreText
                    style={{
                      fontWeight: 'bold',
                      color: themeData.colors.asistectSec,
                    }}
                    variant="titleLarge">
                    !
                  </CoreText>
                </View>
              ),
              headerLeft: () => HomeViewMenuIconCustom({ navigation, themeData }),
            })}
          />
          <Drawer.Screen
            name="ProfileView"
            component={ProfileView}
            options={({ navigation }) => ({
              headerTitle: 'Cuenta',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
            })}
          />
          <Drawer.Screen
            name="AdminUsersView"
            component={AdminUsersView}
            options={({ navigation }) => ({
              headerTitle: 'Gestion Tecnicos',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
            })}
          />
          <Drawer.Screen
            name="AdminUsersModal"
            component={AdminUsersModal}
            options={({ route, navigation }) => ({
              headerTitle: 'Gestion Tecnico',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate({
                      name: 'AdminUsersView',
                      params: route.params,
                    })
                  }
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            })}
          />
          <Drawer.Screen
            name="AdminCustomersView"
            component={AdminCustomersView}
            options={({ navigation }) => ({
              headerTitle: 'Gestion Clientes',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
            })}
          />
          <Drawer.Screen
            name="AdminCustomersModal"
            component={AdminCustomersModal}
            options={({ route, navigation }) => ({
              headerTitle: 'Gestionar Cliente',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate({
                      name: 'AdminCustomersView',
                      params: route.params,
                    })
                  }
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            })}
          />
          <Drawer.Screen
            name="AdminServicesView"
            component={AdminServicesView}
            options={({ navigation }) => ({
              headerTitle: 'Gestion Servicios',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
            })}
          />
          <Drawer.Screen
            name="NotificationsLogsView"
            component={NotificationsLogsView}
            options={({ navigation }) => ({
              headerTitle: 'Actividad',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
            })}
          />

          <Drawer.Screen
            name="AdminServicesListView"
            component={AdminServicesListView}
            options={({ navigation }) => ({
              headerTitle: 'Servicios',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),

              headerRight: () => (
                <TouchableOpacity
                  onPress={() => setModalContact(true)}
                  style={{ marginRight: 10 }}>
                  <CoreIconMaterialCommunity
                    name="phone-message-outline"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />

          <Drawer.Screen
            name="ModalServiceTracking"
            component={ModalServiceTracking}
            options={({ navigation }) => ({
              headerTitle: 'Seguimiento servicio',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('AdminServicesListView')}
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => setModalContact(true)}
                  style={{ marginRight: 10 }}>
                  <CoreIconMaterialCommunity
                    name="phone-message-outline"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />

          <Drawer.Screen
            name="ModalServiceTrackingDetails"
            component={ModalServiceTrackingDetails}
            options={({ route, navigation }: any) => ({
              headerTitle: 'Detalles Seguimiento',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate({
                      name: 'ModalServiceTracking',
                      params: route.params,
                    })
                  }
                  // onPress={() => NavigationService.navigate({ name: (route?.params?.goBackView && route?.params?.goBackView !== '' ? route?.params?.goBackView : 'ModalServiceTracking'), params: route.params })}
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => setModalContact(true)}
                  style={{ marginRight: 10 }}>
                  <CoreIconMaterialCommunity
                    name="phone-message-outline"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            })}
          />

          <Drawer.Screen
            name="ServiceWarranty"
            component={ServiceWarranty}
            options={({ route, navigation }) => ({
              headerTitle: 'Solicitar garantia',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate({
                      name: 'ModalServiceTracking',
                      params: route.params,
                    })
                  }
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            })}
          />

          <Drawer.Screen
            name="ChatMessages"
            component={ChatMessages}
            options={({ route, navigation }) => ({
              headerTitle: 'Mensajes',
              headerStyle: {
                backgroundColor: themeData.colors.primary, // Fondo blanco
              },
              headerTintColor: '#fff', // Texto blanco
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    // console.log('navService', route.params);
                    navigation.navigate({
                      name: 'ModalServiceTracking',
                      params: route.params,
                    });
                  }}
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            })}
          />

          <Drawer.Screen
            name="AdminServicesModal"
            component={AdminServicesModal}
            options={({ route, navigation }) => ({
              headerTitle: 'Gestionar servicio',
              headerStyle: {
                backgroundColor: themeData.colors.primary,
              },
              headerTintColor: '#fff',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => NavigationService.navigate({ name: 'AdminServicesView' })}
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            })}
          />

          <Drawer.Screen
            name="AdminScheduleServicesModal"
            component={AdminScheduleServicesModal}
            options={({ route, navigation }) => ({
              headerTitle: 'Agendar servicio',
              headerStyle: {
                backgroundColor: themeData.colors.primary,
              },
              headerTintColor: '#fff',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    // Usar exactamente la misma lógica que el botón "Cerrar"
                    if (route.params?.service) {
                      // Si viene editando un servicio, volver a tracking
                      NavigationService.navigate({
                        name: 'ModalServiceTracking',
                        params: { service: route.params.service }
                      });
                    } else {
                      // Si viene creando nuevo, volver a la lista
                      NavigationService.navigate({ name: 'AdminServicesListView' });
                    }
                  }}
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            })}
          />

          <Drawer.Screen
            name="FiltersServices"
            component={FiltersServices}
            options={({ route, navigation }) => ({
              headerTitle: 'Filtros',
              headerStyle: {
                backgroundColor: themeData.colors.primary,
              },
              headerTintColor: '#fff',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => NavigationService.navigate({ name: 'AdminServicesListView' })}
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            })}
          />

          <Drawer.Screen
            name="ModalServiceOrderActa"
            component={ModalServiceOrderActa}
            options={({ route, navigation }) => ({
              headerTitle: 'Acta de servicio',
              headerStyle: {
                backgroundColor: themeData.colors.primary,
              },
              headerTintColor: '#fff',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    // Usar exactamente la misma lógica que el botón interno
                    NavigationService.navigate({
                      name: 'ModalServiceTrackingDetails',
                      params: {
                        service: { id: route.params?.service_order_id }
                      }
                    });
                  }}
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            })}
          />

          <Drawer.Screen
            name="ModalServiceOrderEntregaAdminTech"
            component={ModalServiceOrderEntregaAdminTech}
            options={({ route, navigation }) => ({
              headerTitle: 'Entrega de servicio',
              headerStyle: {
                backgroundColor: themeData.colors.primary,
              },
              headerTintColor: '#fff',
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    // Usar exactamente la misma lógica que el botón interno
                    NavigationService.navigate({
                      name: 'ModalServiceTracking',
                      params: {
                        service: { id: route.params?.service_order_id }
                      }
                    });
                  }}
                  style={{ marginLeft: 10 }}>
                  <CoreIconMaterial name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            })}
          />
        </Drawer.Group>
      </Drawer.Navigator>

      <Portal>
        <Dialog onDismiss={() => setModalContact(false)} visible={modalContact}>
          <Dialog.Title style={{ textAlign: 'center' }}>
            Asistec | Contáctenos!
          </Dialog.Title>
          <Dialog.Content>
            <ContactModalContent />
          </Dialog.Content>
          <Dialog.Actions>
            <CoreButton onPress={() => setModalContact(false)}>
              Cerrar
            </CoreButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};


function AppNavigator() {

  const dispatch = useDispatch();

  const { themeData } = useCoreTheme();
  const { appSetLoader, appSetSnack } = useCoreComponents();
  const [initializing, setInitializing] = useState(true);
  const navigationRef = React.useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(auth().currentUser !== null); // Initial login state
  const {
    setUserProfileStore,
    setUserStore,
    setUserNotifications,
    appStoreUser,
    appStoreUserProfile,
    appStoreData,
  } = useAppStore();

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async user => {
      let profileData: any = null;
      setUserStore(user);
      dispatch(setDefaultFilters(null));
      const fetchTokenData = await fetchAwsToken();
      if (appIsFetchAwsToken) {
        if (!fetchTokenData?.state) {
          dispatch(
            setLoaderViewMsg({
              msg: `Error ${fetchTokenData?.msg || ''}`,
            }),
          );
          return;
        }
      }
      if (user) {
        const userDocRef = firestore()
          .collection('usuarios')
          .where('deleted_date', '==', null)
          .where('phone', '==', user.phoneNumber);
        const userDocSnapshot = await userDocRef.get();
        if (userDocSnapshot.empty) {
          const userData = {
            full_name: user.displayName,
            email: user.email,
            phone: user.phoneNumber,
            user_uid: user.uid,
            type: 3,
            is_active: true,
            deleted_date: null,
          };
          let newProfile = await firestore()
            .collection('usuarios')
            .add(userData);
          let profile = await firestore()
            .collection('usuarios')
            .doc(newProfile.id)
            .get();
          profileData = { id: profile.id, ...profile.data() };
        } else {
          let profile = userDocSnapshot.docs[0];
          profileData = { id: profile.id, ...profile.data() };
          if (
            !profileData?.user_uid ||
            profileData?.user_uid === '' ||
            profileData?.user_uid !== user.uid
          ) {
            await firestore()
              .collection('usuarios')
              .doc(profileData.id)
              .update({
                user_uid: user.uid,
              });
          }
        }
        // notifications
        const permissionGranted = await requestUserPermissionMessaging();
        if (permissionGranted) {
          registerUserDeviceFCM({ user_id: profileData?.id });
        }
        if (
          appStoreData?.isNewUser ||
          !profileData?.full_name ||
          profileData?.full_name === ''
        ) {
          NavigationService.navigate({ name: 'ProfileView' });
        }
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      if (initializing) {
        setInitializing(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (auth().currentUser) {
      const unsubscribe = firestore()
        .collection('usuarios')
        .where('deleted_date', '==', null)
        .where('phone', '==', auth().currentUser?.phoneNumber)
        .onSnapshot(querySnapshot => {
          const userData: any = querySnapshot?.empty
            ? null
            : querySnapshot?.docs[0];
          if (userData) {
            let profileData = { id: userData.id, ...userData.data() };
            if (!profileData?.is_active) {
              UserModel.logout();
            }
            setUserProfileStore(profileData);
          } else {
            setUserProfileStore({});
          }
        });

      return () => {
        unsubscribe();
      };
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setUserNotifications([]);
    // obtiene notificationes para estado general
    if (auth().currentUser && appStoreUserProfile?.id) {
      const unsubscribe = firestore()
        .collection('notifications_logs')
        .where('to_user_id', '==', appStoreUserProfile.id)
        .where('state', '==', 1)
        .where('model_type', '==', 1)
        .where('deleted_date', '==', null)
        .onSnapshot(querySnapshot => {
          const docs: any = [];
          try {
            querySnapshot?.docs?.forEach(x => {
              docs.push({
                id: x.id,
                ...x.data(),
              });
            });
          } catch (error) { }
          setUserNotifications(docs || []);
        });

      return () => {
        unsubscribe();
      };
    }
  }, [appStoreUserProfile]);

  // FIREBASE, recibe y muestra notificaciones push al usuario
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // console.log(
      //   'A new FCM notification arrived!',
      //   JSON.stringify(remoteMessage),
      // );

      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      if (remoteMessage?.notification) {
        notifee.displayNotification({
          title: remoteMessage?.notification?.title || '',
          body: remoteMessage?.notification?.body || '',
          data: { ...remoteMessage?.data },
          android: {
            channelId: channelId,
            importance: AndroidImportance.HIGH, // Asegura que la importancia sea alta
            // Para forzar que aparezca como heads-up (emergente):
            pressAction: {
              id: 'default',
            },
          },
        });
      }
    });

    return unsubscribe;
  }, []);

  // getInitialNotification: When the application is opened from a quit state. APP CERRADA COMPLETAMENTE
  // onNotificationOpenedApp: When the application is running, but in the background. APP MINIMIZADA
  // onForegroundEvent: The device is unlocked, and the application is running & is in view (foreground). APP PRIMER PLANO

  // onNotificationOpenedApp: App abierta pero minimizada y se pulsa la notificacion
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      // console.log(' messaging().onNotificationOpenedApp', remoteMessage);
      if (remoteMessage) {
        handleNotification(1, { notification: remoteMessage });
      }
    });
    return unsubscribe;
  }, []);

  // messaging().getInitialNotification: App cerrada, se pulsa la notificacion y la APP se abre
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (!remoteMessage) return;
        let lastnot = await handleInitialNotification(remoteMessage);
        if (!lastnot) {
          setTimeout(() => {
            handleNotification(1, { notification: remoteMessage });
          }, 3000);
        }
      });
  }, []);

  // Notiffe, escucha acciones en notificaciones mostradas al usuario
  // notifee.onForegroundEvent, primer plano se ejecuta al mismo tiempo que messaging().onMessage
  // EventType
  //   {
  //     "-1": "UNKNOWN",
  //     "0": "DISMISSED",
  //     "1": "PRESS",
  //     "2": "ACTION_PRESS",
  //     "3": "DELIVERED",
  //     "4": "APP_BLOCKED",
  //     "5": "CHANNEL_BLOCKED",
  //     "6": "CHANNEL_GROUP_BLOCKED",
  //     "7": "TRIGGER_NOTIFICATION_CREATED",
  //     "8": "FG_ALREADY_EXIST",
  //     "ACTION_PRESS": 2,
  //     "APP_BLOCKED": 4,
  //     "CHANNEL_BLOCKED": 5,
  //     "CHANNEL_GROUP_BLOCKED": 6,
  //     "DELIVERED": 3,
  //     "DISMISSED": 0,
  //     "FG_ALREADY_EXIST": 8,
  //     "PRESS": 1,
  //     "TRIGGER_NOTIFICATION_CREATED": 7,
  //     "UNKNOWN": -1
  // }
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
      // console.log('notifee.onForegroundEvent', type, JSON.stringify(detail));
      handleNotification(type, detail);
    });
    return unsubscribe;
  }, []);

  // useEffect(() => {
  //   NavigationService.setTopLevelNavigator(navigationRef.current);
  // }, [navigationRef, initializing]);

  const handleInitialNotification = async (initialNotification: any) => {
    // console.log('initialNotification', initialNotification);
    let res = false;
    const AS_KEY_LAST_INITIAL_NOTIFICATION_ID = 'last-initial-notification-id';
    if (initialNotification !== null) {
      try {
        const lastInitialNotificationId = await AsyncStorage.getItem(
          AS_KEY_LAST_INITIAL_NOTIFICATION_ID,
        );

        if (lastInitialNotificationId !== null) {
          if (lastInitialNotificationId === initialNotification.messageId) {
            return;
          }
        } else {
          await AsyncStorage.setItem(
            AS_KEY_LAST_INITIAL_NOTIFICATION_ID,
            String(initialNotification.messageId),
          );
        }
      } catch (e) {
        // don't mind, this is a problem only if the current RN instance has been reloaded by a CP mandatory update
      }
    }
    return res;
  };

  const handleNotification = (type: any, data: any) => {
    // console.log('handleNotification', type, data);
    switch (type) {
      case EventType.DISMISSED:
        // console.log('User dismissed notification', data);
        break;
      case EventType.PRESS:
        // console.log('User pressed notification', data?.notification?.data);
        if (data?.notification?.data?.service_order_id) {
          NavigationService.navigate({
            name: 'ModalServiceTracking',
            params: {
              service: { id: data?.notification?.data?.service_order_id },
            },
          });
          break;
        }
        if (data?.notification?.data?.chat_id) {
          NavigationService.navigate({
            name: 'ChatMessages',
            params: {
              chat: { id: data?.notification?.data?.chat_id },
            },
          });
          break;
        }
        break;
    }
  };

  const logout = async () => {
    appSetLoader({ state: true, message: 'Cerrando...' });
    setUserStore({});
    setUserProfileStore({});
    await UserModel.logout();
    appSetLoader({ state: false });
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <AsistecDrawerContent
          {...props}
          appSetLoader={(loader: any) => console.log('Loading:', loader)}
          appStoreUserProfile={{
            type: 1,
            full_name: 'Usuario Demo'
          }}
          onLogout={logout}
        />
      )}
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: themeData.colors.primary
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
        drawerActiveTintColor: themeData.colors.primary,
        drawerInactiveTintColor: '#666',
      })}>

      {initializing ? (
        <>
          <Drawer.Screen
            name="LoadingView"
            component={LoadingView}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          {appStoreUser?.uid ? (
            <>
              <Drawer.Group>
                <Drawer.Screen
                  name="App"
                  component={AppNavigation}
                  options={{ headerShown: false }}
                />
              </Drawer.Group>

            </>
          ) : null}
          <Drawer.Group>
            {!appStoreUser?.uid ? (
              <>
                <Drawer.Screen
                  name="Login"
                  component={LoginView}
                  options={{ headerShown: false }}
                />
              </>
            ) : null}
            <Drawer.Screen
              name="TermsConditionsView"
              component={TermsConditionsView}
            />
          </Drawer.Group>
        </>
      )}

    </Drawer.Navigator>
  );
}

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const { themeData, themeDataNavigation } = useCoreTheme();
  const navigationRef = React.useRef(null);

  useEffect(() => {
    NavigationService.setTopLevelNavigator(navigationRef.current);
  }, [navigationRef]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <PaperProvider theme={themeData} >
        <CoreComponentsProvider>
          <Provider store={store}>
            <NavigationContainer ref={navigationRef} theme={themeDataNavigation}>
              <AppNavigator />
            </NavigationContainer>
          </Provider>
        </CoreComponentsProvider>
      </PaperProvider>
    </SafeAreaView>
  );
}

function App() {

  return (
    <SafeAreaProvider>
      <CoreThemeProvider>
        <AppContent />
      </CoreThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default App;
