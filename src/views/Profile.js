import * as React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  AppLayout,
  CoreBottomSheet,
  AsistecPickLocation,
  CoreIconMaterialCommunity,
} from '@src/components/';
import {Chip, Dialog, Avatar, Badge, IconButton} from 'react-native-paper';
import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import {useCoreTheme} from '@src/themes';
import {UserModel, getStorageApp} from '@src/utils/firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import NavigationService from '@src/navigation/NavigationService';
import {useFocusEffect} from '@react-navigation/native';
import {useAppStore} from '@src/store';
import {FAB, Portal, Text} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import AppConfig from '@src/app.config';
import {launchImageLibrary} from 'react-native-image-picker';

const asistecData = AppConfig.asistec_data;

const {height} = Dimensions.get('window');

function AppCobrarCustomerProfileView({navigation}) {
  const {themeData} = useCoreTheme();

  const [userData, setUserData] = React.useState(null);
  const [showContent, setShowContent] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [toggleStackOnLongPress, setToggleStackOnLongPress] =
    React.useState(false);
  const [names, setNames] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [locAddress, setLocAddress] = React.useState('');
  const [locAddressRef, setLocAddressRef] = React.useState('');
  const [locAddressCoords, setLocAddressCoords] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [numberDoc, setNumberDoc] = React.useState('');
  const [bloodType, setBloodType] = React.useState('');
  const [photoUrl, setPhotoUrl] = React.useState('');
  const {setUserStore, setUserProfileStore} = useAppStore();
  const [modalDeleteAccount, setModalDeleteAccount] = React.useState(false);

  const layoutRef = React.useRef(null);

  const bottomSheetRef = React.useRef(null);
  const asistecPickLocationRef = React.useRef(null);

  const [origin, setOrigin] = React.useState({
    latitude: 2.946846,
    longitude: -75.299329,
  });

  useFocusEffect(
    React.useCallback(() => {
      setForm();
      // setDefaultPosition();
      return () => {
        setShowContent(false);
        setUserData([]);
        closeModalSetLocation();
      };
    }, []),
  );

  const setDefaultPosition = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setOrigin({latitude, longitude});
      },
      error => {
        console.warn(error.message);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  // useEffect(() => {
  //   (async () => {
  //     if (await requestLocationPermission()) {
  //       navigator.geolocation.getCurrentPosition(
  //         position => {
  //           const { latitude, longitude } = position.coords;
  //           setOrigin({ latitude, longitude });
  //         },
  //         error => {
  //           console.warn(error.message);
  //         },
  //         { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
  //       );
  //     }
  //   })();
  // }, []);

  const setForm = async () => {
    let userProfile = await UserModel.getAuthUserProfile();
    setUserData(userProfile);
    setNames(userProfile.full_name || '');
    setPhone(userProfile.phone || '');
    setAddress(userProfile.address || '');
    setLocAddress(userProfile.loc_address || '');
    setLocAddressRef(userProfile.loc_address_ref || '');
    setLocAddressCoords(userProfile.loc_address_coords || '');
    setEmail(userProfile.email || '');
    setNumberDoc(userProfile.number_doc || '');
    setBloodType(userProfile.blood_type || '');
    setPhotoUrl(userProfile.photo_url || '');
    setShowContent(true);
  };

  const updateProfileFnt = async () => {
    if (!names || names === '') {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Campos incorrectos (*)',
        type: 'error',
      });
      return;
    }
    layoutRef?.current?.setLoading({state: true, message: 'Guardando'});
    const data = await UserModel.updateProfile({
      id: userData.id,
      full_name: names,
      address: address,
      email: email,
      number_doc: numberDoc,
      blood_type: bloodType,
      loc_address_ref: locAddressRef,
    });
    if (!data) {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Error',
        type: 'error',
      });
    } else {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Cambios guardados!',
      });
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const logout = async () => {
    layoutRef?.current?.setLoading({state: true, message: 'Cerrando'});
    setUserStore({});
    setUserProfileStore({});
    await UserModel.logout();
    layoutRef?.current?.setLoading({state: false});
  };

  const openModalSetLocation = () => {
    bottomSheetRef?.current?.open();
    asistecPickLocationRef?.current?.init();
  };

  const closeModalSetLocation = () => {
    bottomSheetRef?.current?.close();
  };

  const saveModalSetLocation = async data => {
    closeModalSetLocation();
    const dataa = await UserModel.updateProfile({
      id: userData.id,
      loc_address: data.address,
      loc_address_coords: data.coords,
    });
    await setForm();
  };

  const onDeleteAccount = async () => {
    setModalDeleteAccount(false);
    layoutRef?.current?.setLoading({
      state: true,
      message: 'Eliminando cuenta...',
    });
    await auth()
      .currentUser?.delete()
      .then(r => {
        const userDocRef = firestore()
          .collection('usuarios')
          .doc(userData.id)
          .update({
            deleted_date: new Date(),
          });
        UserModel.logout();
      })
      .catch(e => {
        layoutRef?.current?.setSnack({
          state: true,
          message: 'Ocurrio un error, ingresa nuevamente.',
          type: 'error',
        });
        UserModel.logout();
      });
    layoutRef?.current?.setLoading({state: false});
  };

  const chooseImage = () => {
    let options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
      } else {
        uploadImage(response.assets[0]);
      }
    });
  };

  const uploadImage = async image => {
    const {uri} = image;
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    let res = null;
    layoutRef?.current?.setLoading({
      state: true,
      message: 'Subiendo imagen...',
    });
    try {
      const task = getStorageApp().ref(filename).putFile(uploadUri);

      // await task.on('state_changed', snapshot => {
      //   const progress = Math.round(
      //     (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
      //   );
      // });

      await task
        .then(() => getStorageApp().ref(filename).getDownloadURL())
        .then(downUrl => {
          res = {
            url: downUrl,
            name: filename,
          };
          UserModel.updateProfile({
            id: userData.id,
            photo_url: res.url,
          })
            .then(r => {
              layoutRef?.current?.setSnack({
                state: true,
                message: 'Correcto!',
                type: 'success',
              });
            })
            .catch(e => {
              // console.log('error', e);
              layoutRef?.current?.setSnack({
                state: true,
                message: 'Error actualizando imagen de perfil.',
                type: 'error',
              });
            });
          setForm();
        })
        .catch(error => {
          // console.error('Error uploading image:1', error);
          layoutRef?.current?.setSnack({
            state: true,
            message: 'Error subiendo imagen.',
            type: 'error',
          });
        });
    } catch (error) {
      // console.error('Error uploading image:', error);
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Error.',
        type: 'error',
      });
    }
    layoutRef?.current?.setLoading({
      state: false,
    });
  };

  return (
    <AppLayout ref={layoutRef}>
      <ScrollView style={{flex: 1}}>
        {showContent ? (
          <View style={{paddingHorizontal: 10, marginBottom: 60}}>
            <KeyboardAvoidingView style={{justifyContent: 'flex-end'}}>
              <View style={{alignItems: 'center', marginTop: 20}}>
                <View style={{position: 'relative'}}>
                  <Avatar.Image
                    size={100}
                    source={
                      photoUrl
                        ? {uri: photoUrl}
                        : require('@src/assets/img/operator_avatar.png')
                    }
                    style={{backgroundColor: themeData?.colors.primary}}
                    onTouchEnd={chooseImage}
                  />
                  <Badge
                    size={30}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: '#fff',
                      borderRadius: 15,
                      borderWidth: 1,
                      borderColor: '#ccc',
                    }}>
                    <IconButton
                      icon="camera"
                      size={18}
                      onPress={chooseImage}
                      style={{margin: -5}}
                    />
                  </Badge>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  paddingTop: 10,
                }}>
                <Chip compact onPress={() => {}}>
                  {userData?.type === 1
                    ? 'Administrador'
                    : userData?.type === 2
                    ? 'Tecnico'
                    : userData?.type === 3
                    ? 'Cliente'
                    : ''}
                </Chip>
              </View>
              <View style={{marginTop: 5}}>
                <CoreTextInput
                  dense
                  label="Nombre completo (*)"
                  value={names}
                  onChangeText={setNames}
                  mode="outlined"
                  style={{
                    backgroundColor: 'transparent',
                    marginBottom: 10,
                  }}
                />
                <CoreTextInput
                  dense
                  label="Telefono (*)"
                  value={phone}
                  editable={false}
                  disabled
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={{backgroundColor: 'transparent', marginBottom: 10}}
                />
                <Pressable onPress={() => openModalSetLocation()}>
                  <CoreTextInput
                    dense
                    label="Ubicacion"
                    mode="outlined"
                    value={
                      locAddress && locAddress.length > 30
                        ? locAddress.substring(0, 30) + '...'
                        : locAddress || ''
                    }
                    editable={false}
                    style={{backgroundColor: 'transparent', marginBottom: 10}}
                    pointerEvents="none"
                  />
                </Pressable>
                <CoreTextInput
                  dense
                  label="Ref. adicionales ubicacion"
                  mode="outlined"
                  value={locAddressRef}
                  onChangeText={setLocAddressRef}
                  style={{backgroundColor: 'transparent', marginBottom: 10}}
                />
                <CoreTextInput
                  dense
                  label="Correo electronico"
                  mode="outlined"
                  value={email}
                  onChangeText={setEmail}
                  style={{backgroundColor: 'transparent', marginBottom: 10}}
                />

                <CoreTextInput
                  dense
                  label="Numero documento"
                  mode="outlined"
                  value={numberDoc}
                  onChangeText={setNumberDoc}
                  style={{backgroundColor: 'transparent', marginBottom: 10}}
                />

                <CoreTextInput
                  dense
                  label="Tipo de sangre"
                  mode="outlined"
                  value={bloodType}
                  onChangeText={setBloodType}
                  style={{backgroundColor: 'transparent', marginBottom: 10}}
                />
              </View>
            </KeyboardAvoidingView>

            <CoreText variant="titleMedium">¿Nesecitas ayuda?</CoreText>
            <CoreText
              style={{
                // paddingTop: 10,
                fontWeight: 'bold',
                // textAlign: 'center',
                color: themeData?.colors?.primary,
              }}
              onPress={() => {
                Linking.openURL(`${asistecData.contact_url_1}`);
              }}>
              Contactar
            </CoreText>

            <CoreText variant="" style={{}}>
              ID de usuario: {userData?.id || ''}
            </CoreText>

            <CoreText
              variant="titleMedium"
              style={{
                marginTop: 10,
                // fontWeight: 'bold',
                // textAlign: 'center',
              }}>
              Enlaces importantes
            </CoreText>
            {/* <CoreText
              style={{
                // paddingTop: 10,
                fontWeight: 'bold',
                // textAlign: 'center',
                color: themeData?.colors?.primary,
              }}
              onPress={() => {
                Linking.openURL(asistecData.terms_conditions_url);
              }}>
              Terminos y Condiciones
            </CoreText> */}
            <CoreText
              style={{
                // paddingTop: 10,
                fontWeight: 'bold',
                // textAlign: 'center',
                color: themeData?.colors?.primary,
              }}
              onPress={() => {
                Linking.openURL(asistecData.privacy_policy_url);
              }}>
              Politica de privacidad
            </CoreText>

            <CoreText variant="titleMedium" style={{marginTop: 10}}>
              Eliminar cuenta
            </CoreText>
            {/* <CoreText>Se eliminaran los datos de tu perfil.</CoreText> */}
            <CoreText
              style={{
                // paddingTop: 10,
                fontWeight: 'bold',
                // textAlign: 'center',
                color: themeData?.colors?.error,
              }}
              onPress={() => setModalDeleteAccount(true)}>
              Eliminar cuenta
            </CoreText>
          </View>
        ) : (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 20,
              flex: 1,
            }}>
            <ActivityIndicator
              size="large"
              color={themeData.colors.asistectSec}
            />
            <CoreText style={{paddingTop: 10}}>Cargando...</CoreText>
          </View>
        )}
      </ScrollView>
      <FAB.Group
        style={{position: 'absolute', right: 0, bottom: open ? 0 : 70}}
        fabStyle={{
          backgroundColor: open
            ? themeData.colors.primary
            : themeData.colors.asistectSec,
        }}
        open={open}
        icon={open ? 'close' : 'cog'}
        toggleStackOnLongPress={toggleStackOnLongPress}
        // label={open ? 'Guardar' : null}
        color="#fff"
        actions={[
          // {icon: 'close', label: 'Cerrar', onPress: () => {}},
          {
            icon: 'exit-to-app',
            label: 'Cerrar sesion',
            onPress: () => logout(),
          },
        ]}
        enableLongPressWhenStackOpened
        onStateChange={({open}) => setOpen(open)}
        onPress={() => {
          if (toggleStackOnLongPress) {
            // isWeb ? alert('Fab is Pressed') : Alert.alert('Fab is Pressed');
            // do something on press when the speed dial is closed
          } else if (open) {
            // updateProfileFnt();
            // isWeb ? alert('Fab is Pressed') : Alert.alert('Fab is Pressed');
            // do something if the speed dial is open
          }
        }}
        visible={open}
      />
      <FAB
        icon="cog"
        onPress={() => setOpen(true)}
        visible={!open}
        size="small"
        color="white"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 70,
          backgroundColor: themeData.colors.asistectSec,
        }}
      />
      <FAB
        icon="content-save"
        onPress={() => updateProfileFnt()}
        visible={!open}
        color="white"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: themeData.colors.asistectSec,
        }}
      />

      <Portal>
        <Dialog
          onDismiss={() => setModalDeleteAccount(false)}
          visible={modalDeleteAccount}>
          <Dialog.Title
            style={{textAlign: 'center', color: 'orange', fontWeight: 'bold'}}>
            Eliminar cuenta
          </Dialog.Title>
          <Dialog.Content>
            <CoreIconMaterialCommunity
              style={{textAlign: 'center'}}
              name="account-cancel-outline"
              size={80}
              color="orange"
            />
            <CoreText>
              ¿Estas seguro de que quieres eliminar tu cuenta? No podras volver
              a acceder y se te perderan tus servicios agendados.
            </CoreText>
          </Dialog.Content>
          <Dialog.Actions>
            <CoreButton onPress={() => setModalDeleteAccount(false)}>
              Cancelar
            </CoreButton>
            <CoreButton
              onPress={() => onDeleteAccount()}
              textColor={themeData.colors.asistectSec}
              labelStyle={{
                fontWeight: 'bold',
              }}>
              Eliminar
            </CoreButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <CoreBottomSheet
        ref={bottomSheetRef}
        snapPointsLst={['85%']}
        modalContent={() => (
          <AsistecPickLocation
            ref={asistecPickLocationRef}
            dataObject={userData}
            onCloseFnt={() => closeModalSetLocation()}
            onSaveFnt={saveModalSetLocation}
          />
        )}
      />
    </AppLayout>
  );
}

export default AppCobrarCustomerProfileView;
