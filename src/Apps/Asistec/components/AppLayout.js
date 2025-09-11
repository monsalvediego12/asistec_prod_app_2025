import * as React from 'react';
import {
  CoreText,
  CoreButton,
  CoreLayout,
  CoreIconMaterial,
  // CoreBottomSheetModal,
  CoreIconMaterialCommunity,
} from '@src/components/';
import {Appbar, Snackbar, Dialog, Badge} from 'react-native-paper';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {useCoreTheme} from '@src/themes';

import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import NavigationService from '@src/navigation/NavigationService';
import {useNavigation} from '@react-navigation/native';
import {useAppStore} from '@src/store';

const AppCobrarLayout = React.forwardRef(
  ({children, hiddenBottomBarMenu}, ref) => {
    const {themeData} = useCoreTheme();
    const {appStoreUserNotifications} = useAppStore();

    const [routeName, setRouteName] = React.useState(null);
    const navigation = useNavigation();
    const [loadingConf, setLoagindConf] = React.useState(null);
    const [snackConf, setSnackConf] = React.useState(null);
    const [showOverlay, setShowOverlay] = React.useState(false);

    const defaultDataLoading = {
      state: false,
      message: 'Cargando',
      lockBottomBar: false,
    };
    const defaultDataSnack = {state: false, message: '', type: null};

    React.useImperativeHandle(ref, () => ({
      setOverlay: data => {
        setShowOverlay(data);
      },
      setLoading: data => {
        setLoading(data);
      },
      setSnack: data => {
        setSnack(data);
      },
    }));

    const setLoading = data => {
      setLoagindConf({...defaultDataLoading, ...data});
    };
    const setSnack = data => {
      setSnackConf({...defaultDataSnack, ...data});
    };

    React.useEffect(() => {
      const unsubscribe = navigation.addListener('state', data => {
        setRouteName(NavigationService.getCurrentRouteName());
      });

      // Cleanup function
      return unsubscribe;
    }, [navigation]);

    const clkActions = async (action, id, item) => {
      if (action === 'go_home') {
        NavigationService.navigate({name: 'HomeView'});
      }
    };

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: themeData.colors.background,
        }}>
        <View style={{flex: 1}}>
          {loadingConf?.state ? (
            <View style={[stylesLoaderComponent.centeredView]}>
              <Dialog visible={true}>
                <Dialog.Content>
                  <View style={stylesLoaderComponent.flexing}>
                    <ActivityIndicator
                      color={themeData.colors.tertiary}
                      size={48}
                      style={stylesLoaderComponent.marginRight}
                    />
                    <View style={stylesLoaderComponent.textContainer}>
                      <Text style={stylesLoaderComponent.messageText}>
                        {loadingConf.message || '-'}
                      </Text>
                    </View>
                  </View>
                </Dialog.Content>
              </Dialog>
            </View>
          ) : (
            <></>
          )}
          {typeof children === 'function' ? children() : children}
          {snackConf?.state ? (
            <>
              <Snackbar
                visible={snackConf?.state}
                onDismiss={() => setSnack({state: false})}
                onPress={() => setSnack({state: false})}
                duration={2000}
                action={{
                  label: 'X',
                  onPress: () => {
                    setSnack({state: false});
                  },
                }}
                style={{
                  ...(snackConf?.type === 'error'
                    ? {backgroundColor: themeData.colors.onErrorContainer}
                    : {}),
                }}>
                <CoreText
                  style={{
                    color: themeData.colors.onPrimary,
                  }}>
                  {snackConf?.message || '-'}
                </CoreText>
              </Snackbar>
            </>
          ) : (
            <></>
          )}
        </View>
        <View
          style={{
            width: '100%',
            paddingVertical: 0,
            marginVertical: 0,
          }}>
          {hiddenBottomBarMenu ? (
            <></>
          ) : (
            <Appbar.Header
              statusBarHeight={0}
              style={[
                styles.appBar,
                {backgroundColor: themeData.colors.secondary},
              ]}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  disabled={loadingConf?.state && loadingConf?.lockBottomBar}
                  style={[
                    styles.button,
                    {
                      margin: 5,
                      borderRadius: 70,
                      backgroundColor:
                        routeName &&
                        routeName !== 'HomeView' &&
                        routeName !== 'App'
                          ? themeData.colors.secondary
                          : themeData.colors.primary,
                    },
                  ]}
                  onPress={() => clkActions('go_home')}>
                  <CoreIconMaterial
                    name="home"
                    size={25}
                    style={{
                      color:
                        routeName &&
                        routeName !== 'HomeView' &&
                        routeName !== 'App'
                          ? '#AFAFAF'
                          : themeData.colors.onPrimary,
                    }}
                  />
                  <CoreText
                    style={{
                      color:
                        routeName &&
                        routeName !== 'HomeView' &&
                        routeName !== 'App'
                          ? '#AFAFAF'
                          : themeData.colors.onPrimary,
                    }}>
                    Inicio
                  </CoreText>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={loadingConf?.state && loadingConf?.lockBottomBar}
                  style={[
                    styles.button,
                    {
                      margin: 5,
                      borderRadius: 70,
                      backgroundColor:
                        routeName !== 'AdminServicesListView'
                          ? themeData.colors.secondary
                          : themeData.colors.primary,
                    },
                  ]}
                  onPress={() =>
                    NavigationService.navigate({name: 'AdminServicesListView'})
                  }>
                  <CoreIconMaterialCommunity
                    name="dots-grid"
                    size={25}
                    style={{
                      color:
                        routeName === 'AdminServicesListView'
                          ? themeData.colors.onPrimary
                          : '#AFAFAF',
                    }}
                  />
                  <CoreText
                    style={{
                      color:
                        routeName === 'AdminServicesListView'
                          ? themeData.colors.onPrimary
                          : '#AFAFAF',
                    }}>
                    Servicios
                  </CoreText>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={loadingConf?.state && loadingConf?.lockBottomBar}
                  style={[
                    styles.button,
                    {
                      margin: 5,
                      borderRadius: 70,
                      backgroundColor:
                        routeName !== 'NotificationsLogsView'
                          ? themeData.colors.secondary
                          : themeData.colors.primary,
                    },
                  ]}
                  onPress={() =>
                    NavigationService.navigate({name: 'NotificationsLogsView'})
                  }>
                  <CoreIconMaterialCommunity
                    name="inbox-full-outline"
                    size={25}
                    style={{
                      color:
                        routeName === 'NotificationsLogsView'
                          ? themeData.colors.onPrimary
                          : '#AFAFAF',
                    }}
                  />
                  {appStoreUserNotifications?.unreaded &&
                  appStoreUserNotifications?.unreaded > 0 ? (
                    <>
                      <Badge
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 20,
                          backgroundColor: themeData?.colors?.asistectSec,
                        }}
                        size={8}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                  <CoreText
                    style={{
                      color:
                        routeName === 'NotificationsLogsView'
                          ? themeData.colors.onPrimary
                          : '#AFAFAF',
                    }}>
                    Actividad
                  </CoreText>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={loadingConf?.state && loadingConf?.lockBottomBar}
                  style={[
                    styles.button,
                    {
                      margin: 5,
                      borderRadius: 70,
                      backgroundColor:
                        routeName !== 'ProfileView'
                          ? themeData.colors.secondary
                          : themeData.colors.primary,
                    },
                  ]}
                  onPress={() =>
                    NavigationService.navigate({name: 'ProfileView'})
                  }>
                  <CoreIconMaterialCommunity
                    name="account"
                    size={25}
                    style={{
                      color:
                        routeName === 'ProfileView'
                          ? themeData.colors.onPrimary
                          : '#AFAFAF',
                    }}
                  />
                  <CoreText
                    style={{
                      color:
                        routeName === 'ProfileView'
                          ? themeData.colors.onPrimary
                          : '#AFAFAF',
                    }}>
                    Cuenta
                  </CoreText>
                </TouchableOpacity>
              </View>
            </Appbar.Header>
          )}
        </View>

        {showOverlay && (
          <View style={styles.overlayContainer}>
            <View style={styles.overlay} />
          </View>
        )}
      </View>
    );
  },
);

export default AppCobrarLayout;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 28,
  },

  appBar: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    margin: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 0,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'lightblue', // Color de fondo para visualizar el botón
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'black',
    opacity: 0.5,
  },
});

const stylesLoaderComponent = StyleSheet.create({
  centeredView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 2,
  },
  flexing: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // Permite el ajuste del texto largo
  },
  marginRight: {
    marginRight: 16,
  },
  textContainer: {
    flexShrink: 1, // El texto puede reducir su ancho si es necesario
    maxWidth: '80%', // Limita el ancho máximo del texto
  },
  messageText: {
    flexWrap: 'wrap', // Permite el ajuste del texto en múltiples líneas
  },
});
