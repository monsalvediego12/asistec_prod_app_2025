import * as React from 'react';
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Linking,
  RefreshControl,
  Keyboard,
  Dimensions,
} from 'react-native';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  CoreImageModal,
  CoreIconMaterialCommunity,
  CoreBottomSheet,
} from '@src/components/';
import {
  Chip,
  List,
  RadioButton,
  IconButton,
  DataTable,
} from 'react-native-paper';
import {
  getStorageApp,
  ServiceOrderModel,
  ServiceOrderMediaModel,
  convertTimestamp,
  ServiceOrderCotizacionModel,
  NotificationsLogsModel,
} from '@src/Apps/Asistec/utils/firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import {useCoreTheme} from '@src/themes';
import DatePicker from 'react-native-date-picker';
import {core_print_date} from '@src/utils/core_dates';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useAppStore} from '@src/store';
import NavigationService from '@src/navigation/NavigationService';
import Geolocation from '@react-native-community/geolocation';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import uuid from 'react-native-uuid';
import {cropText, formatPrice} from '@src/utils/formaters';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';

import AppConfig from '@src/app.config';

const asistecData = AppConfig.asistec_data;

const FormItemCotizacion = React.memo(
  React.forwardRef(
    ({loading, onSaveItemCot, onClose}, ref) => {
      const {themeData} = useCoreTheme();
      const [item, setItem] = React.useState({});
      const [name, setName] = React.useState('');
      const [qty, setQty] = React.useState('');
      const [price, setPrice] = React.useState('');

      React.useImperativeHandle(ref, () => ({
        setForm: itemForm => {
          setItem(itemForm);
          setName(itemForm?.name || '');
          setQty(itemForm?.qty ? itemForm?.qty : '1');
          setPrice(itemForm?.price ? itemForm?.price : '');
        },
      }));

      const onSave = () => {
        onSaveItemCot({
          ...item,
          name,
          qty,
          price,
          total: Number(qty) * Number(price),
        });
      };

      return (
        // <BottomSheetScrollView style={{flex: 1}}>
        <View style={{flex: 1}}>
          <View style={{flex: 1, paddingHorizontal: 10}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignContent: 'center',
              }}>
              <CoreText>Elemento de cotizacion</CoreText>
              <Pressable onPress={() => onClose()} style={{padding: 5}}>
                <CoreText style={{color: themeData.colors.error}}>
                  Cerrar
                </CoreText>
              </Pressable>
            </View>
            {loading ? (
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
            ) : (
              <View style={{padding: 10, paddingTop: 0}}>
                <CoreText style={{paddingTop: 10, paddingBottom: 5}}>
                  Nombre
                </CoreText>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <BottomSheetTextInput
                    multiline
                    value={name}
                    onChangeText={setName}
                    style={{
                      flex: 1,
                      backgroundColor: '#fff',
                      borderColor: '#000',
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                    }}
                    numberOfLines={1}
                  />
                </View>

                <CoreText style={{paddingTop: 10, paddingBottom: 5}}>
                  Cantidad
                </CoreText>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <BottomSheetTextInput
                    value={qty}
                    onChangeText={setQty}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      backgroundColor: '#fff',
                      borderColor: '#000',
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                    }}
                    numberOfLines={1}
                  />
                </View>

                <CoreText style={{paddingTop: 10, paddingBottom: 5}}>
                  Precio
                </CoreText>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <BottomSheetTextInput
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      backgroundColor: '#fff',
                      borderColor: '#000',
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                    }}
                  />
                  {/* <TouchableOpacity style={{padding: 5}}>
                <View style={{width: 20, height: 20}}>
                  <CoreIconMaterial
                    name="close"
                    size={20}
                    color="#000"
                    // onPress={() => clearDirection()}
                  />
                </View>
              </TouchableOpacity> */}
                </View>
                <CoreText style={{paddingTop: 10}} variant="titleLarge">
                  Total
                </CoreText>
                <CoreText style={{}} variant="titleLarge">
                  {formatPrice(
                    (!isNaN(qty) ? qty : 0) * (!isNaN(price) ? price : 0) || 0,
                  )}
                </CoreText>
              </View>
            )}
            <View style={{padding: 10}}>
              <CoreButton mode="contained" onPress={() => onSave()}>
                Guardar
              </CoreButton>
            </View>
          </View>
        </View>
        // </BottomSheetScrollView>
      );
    },
    // No need for a custom comparison function in this case
  ),
);

const FormObsCotizacion = React.memo(
  React.forwardRef(({loading, onSaveItem, onClose}, ref) => {
    const {themeData} = useCoreTheme();
    const [item, setItem] = React.useState({});
    const [description, setDescription] = React.useState('');

    React.useImperativeHandle(ref, () => ({
      setForm: itemForm => {
        setItem(itemForm);
        setDescription(itemForm?.description || '');
      },
    }));

    const onSave = () => {
      if (!(description && description !== '')) {
        return;
      }
      onSaveItem({
        ...item,
        description,
      });
    };

    return (
      <View style={{flex: 1, paddingHorizontal: 10}}>
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center',
            }}>
            <CoreText>Observacion</CoreText>
            <Pressable onPress={() => onClose()} style={{padding: 5}}>
              <CoreText style={{color: themeData.colors.error}}>
                Cerrar
              </CoreText>
            </Pressable>
          </View>
          {loading ? (
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
          ) : (
            <View style={{padding: 10, paddingTop: 0, flex: 1}}>
              <CoreText style={{paddingTop: 10, paddingBottom: 5}}>
                Descripcion
              </CoreText>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <BottomSheetTextInput
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    borderColor: '#000',
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                  }}
                  numberOfLines={1}
                />
              </View>
            </View>
          )}
        </View>

        <View style={{}}>
          <CoreButton mode="contained" onPress={() => onSave()}>
            Guardar
          </CoreButton>
        </View>
      </View>
    );
  }),
);

const ListActions = React.memo(
  React.forwardRef(({loading, onSaveItem, onAction, showActions}, ref) => {
    const {themeData} = useCoreTheme();
    const [item, setItem] = React.useState(null);

    React.useImperativeHandle(ref, () => ({
      setForm: item => {
        setItem(item);
      },
    }));

    const onSave = id => {
      onAction(id);
    };

    return (
      <View style={{paddingHorizontal: 10}}>
        {/* <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignContent: 'center',
          }}>
          <CoreText>Observacion</CoreText>
          <Pressable onPress={() => onClose()} style={{padding: 5}}>
            <CoreText style={{color: themeData.colors.error}}>Cerrar</CoreText>
          </Pressable>
        </View> */}
        <CoreText>{item?.name || '-'}</CoreText>
        {showActions ? (
          <>
            <View>
              <List.Item
                onPress={() => onSave(1)}
                title="Editar"
                left={props => <List.Icon {...props} icon="pencil" />}
              />
              <List.Item
                onPress={() => onSave(2)}
                title="Eliminar"
                left={props => <List.Icon {...props} icon="delete" />}
              />
            </View>
          </>
        ) : (
          <></>
        )}
      </View>
    );
  }),
);

const FormMedia = React.memo(
  React.forwardRef(({loading, onSave, onClose}, ref) => {
    const {themeData} = useCoreTheme();
    const [listFilesQueue, setListFilesQueue] = React.useState([]);

    React.useImperativeHandle(ref, () => ({
      reset: () => {
        setListFilesQueue([]);
      },
    }));

    const launchCameraFnt = () => {
      let options = {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.9,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };
      launchCamera(options, response => {
        if (response.didCancel) {
        } else {
          setListFilesQueue([...listFilesQueue, response.assets[0]]);
        }
      });
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
          setListFilesQueue([...listFilesQueue, response.assets[0]]);
        }
      });
    };

    const renderFileUri = file => {
      return (
        <View key={file.url || file.name} style={{position: 'relative'}}>
          <CoreImageModal
            source={{
              uri: file?.uri
                ? file?.uri
                : 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
            }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 10,
            }}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              // top: 0,
              // right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: 10,
            }}
            onPress={() => deleteFileUri(file)}>
            <CoreIconMaterialCommunity
              name="close-circle"
              size={40}
              style={{
                color: themeData.colors.error,
              }}
            />
          </TouchableOpacity>
        </View>
      );
    };

    const deleteFileUri = file => {
      setListFilesQueue(listFilesQueue.filter(x => x.uri !== file.uri));
    };

    const onSaveFnt = () => {
      onSave(listFilesQueue);
    };

    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          <View style={{paddingHorizontal: 10}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignContent: 'center',
              }}>
              <CoreText>Media</CoreText>
              <Pressable onPress={onClose} style={{padding: 5}}>
                <CoreText style={{color: themeData.colors.error}}>
                  Cerrar
                </CoreText>
              </Pressable>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
              }}>
              <Pressable
                style={{
                  flex: 1,
                  paddingHorizontal: 3,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => launchCameraFnt(true)}>
                <CoreIconMaterialCommunity name="camera-plus" size={40} />
                <CoreText>Capturar imagen</CoreText>
              </Pressable>

              <Pressable
                style={{
                  flex: 1,
                  paddingHorizontal: 3,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => chooseImage(true)}>
                <CoreIconMaterialCommunity name="file-image-plus" size={40} />
                <CoreText>Seleccionar imagen</CoreText>
              </Pressable>
            </View>

            <View style={{marginTop: 10}}>
              <ScrollView horizontal={true} style={{flexDirection: 'row'}}>
                {listFilesQueue.map(img => (
                  <View
                    key={img.uri || img.fileName}
                    style={{marginHorizontal: 5}}>
                    {renderFileUri(img)}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
        <View style={{padding: 10}}>
          <CoreButton mode="contained" onPress={onSaveFnt}>
            Guardar
          </CoreButton>
        </View>
      </View>
    );
  }),
);

const FormInfoPayment = React.memo(
  React.forwardRef(({item, loading, onSaveItem, onAction, onClose}, ref) => {
    const {themeData} = useCoreTheme();
    // const [description, setDescription] = React.useState('');

    React.useImperativeHandle(ref, () => ({
      setForm: item => {
        // setDescription(item?.description || '');
      },
    }));

    const onSave = id => {
      onAction(id);
    };

    return (
      <View style={{paddingHorizontal: 10}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignContent: 'center',
          }}>
          <CoreText>Informacion de pago</CoreText>
          <Pressable onPress={() => onClose()} style={{padding: 5}}>
            <CoreText style={{color: themeData.colors.error}}>Cerrar</CoreText>
          </Pressable>
        </View>
        <List.Item
          title="301 380 89 76"
          description="Transferencia por Nequi"
          left={props => (
            <List.Image
              style={[
                props.style,
                {resizeMode: 'contain', width: 50, height: 50},
              ]}
              source={require('@src/Apps/Asistec/assets/img/nequi_logo.png')}
            />
          )}
        />
        <List.Item
          title="301 380 89 76"
          description="Transferencia por Daviplata"
          left={props => (
            <List.Image
              style={[
                props.style,
                {resizeMode: 'contain', width: 50, height: 50, borderRadius: 5},
              ]}
              source={require('@src/Apps/Asistec/assets/img/daviplata_logo.png')}
            />
          )}
        />
        <List.Item
          title="049-000006-87"
          description="Transferencia cuenta de ahorros"
          left={props => (
            <List.Image
              style={[
                props.style,
                {
                  resizeMode: 'contain',
                  width: 50,
                  height: 50,
                  borderRadius: 5,
                  backgroundColor: '#000',
                },
              ]}
              source={require('@src/Apps/Asistec/assets/img/bancolombia_logo.png')}
            />
          )}
        />
      </View>
    );
  }),
);

function AppView({route, navigation}) {
  const params = route.params;
  const {themeData} = useCoreTheme();
  const {appStoreUserProfile} = useAppStore();

  const [showContent, setShowContent] = React.useState(false);
  const [serviceData, setServiceData] = React.useState(null);
  const [serviceSelected, setServiceSelected] = React.useState(null);
  const [customerSelected, setCustomerSelected] = React.useState(null);
  const [technicalSelected, setTechnicalSelected] = React.useState(null);
  const [reciverFullName, setReceiverFullName] = React.useState(null);
  const [reciverPhone, setReceiverPhone] = React.useState(null);
  // const [mediaDescription, setMediaDescription] = React.useState(null);

  const [dateSelected, setDateSelected] = React.useState(new Date());
  const [hourSelected, setHourSelected] = React.useState(null);
  const [mediaBook, setMediaBook] = React.useState([]);
  const [mediaPredio, setMediaPredio] = React.useState(null);
  const [mediaAntes, setMediaAntes] = React.useState(null);
  const [mediaDespues, setMediaDespues] = React.useState(null);
  const [serviceCotizacion, setServiceCotizacion] = React.useState(null);
  const [mediaEvidencePago, setMediaEvidencePago] = React.useState(null);
  const [mediaEvidencePago2, setMediaEvidencePago2] = React.useState(null);
  const [metodosPago, setMetodosPago] = React.useState([
    {id: 1, name: 'Efectivo'},
    {id: 2, name: 'Nequi'},
    {id: 3, name: 'Daviplata'},
    {id: 4, name: 'Consignacion'},
  ]);

  const [openPikerDate, setOpenPikerDate] = React.useState(false);
  const [loadingList, setLoadingList] = React.useState(false);
  const [itemSelectedAction, setItemSelectedAction] = React.useState(null);
  const [itemTypeAction, setItemTypeAction] = React.useState(null);
  const [formMediaType, setFormMediaType] = React.useState(null);
  const [serviceActaData, setServiceActaData] = React.useState(null);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  const layoutRef = React.useRef(null);
  const scrollViewRef = React.useRef(null);
  const bottomSheetFormItemCot = React.useRef(null);
  const bottomSheetFormObs = React.useRef(null);
  const formItemCotizacionRef = React.useRef(null);
  const formObsCotizacionRef = React.useRef(null);
  const bottomSheetActionsRef = React.useRef(null);
  const formActionsRef = React.useRef(null);
  const bottomSheetFormMedia = React.useRef(null);
  const formMediaRef = React.useRef(null);

  const bottomSheetInfoPaymentRef = React.useRef(null);

  const [refreshing, setRefreshing] = React.useState(false);

  const openBottomSheetFormItemCot = async () => {
    bottomSheetFormItemCot.current.open();
  };

  const closeBottomSheet = async () => {
    bottomSheetFormItemCot.current.close();
  };

  const openBottomSheetFormObs = async () => {
    bottomSheetFormObs.current.open();
  };

  const closeBottomSheetFormObs = async () => {
    bottomSheetFormObs.current.close();
  };

  const openBottomSheetInfoPayment = async () => {
    bottomSheetInfoPaymentRef.current.open();
  };

  const closeBottomSheetInfoPayment = async () => {
    bottomSheetInfoPaymentRef.current.close();
  };

  const openBottomSheetFormMedia = async type => {
    setFormMediaType(type);
    formMediaRef?.current?.reset();
    bottomSheetFormMedia.current.open();
  };

  const closeBottomSheetFormMedia = async () => {
    bottomSheetFormMedia.current.close();
  };

  React.useEffect(() => {
    requestLocationPermission();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let unsubscribeService;
      let unsubscribeMediaServiceOrder = () => {};
      let unsubscribeCotServiceOrder = () => {};
      let unsubscribeActaServiceOrder = () => {};

      const resetStates = () => {
        setShowContent(false);
        setServiceData(null);
        setServiceSelected(null);
        setCustomerSelected(null);
        setTechnicalSelected(null);
        setReceiverFullName(null);
        setReceiverPhone(null);
        // setMediaDescription(null);
        setDateSelected(new Date());
        setHourSelected(null);
        setMediaBook(null);
        setMediaPredio(null);
        setMediaAntes(null);
        setMediaDespues(null);
        setServiceCotizacion(null);
        setMediaEvidencePago(null);
        setMediaEvidencePago2(null);
        setOpenPikerDate(false);
        setItemSelectedAction(null);
        setItemTypeAction(null);
        setFormMediaType(null);
        setServiceActaData(null);
      };

      const fetchServiceData = async () => {
        return new Promise((resolve, reject) => {
          unsubscribeService = firestore()
            .collection('services_order')
            .doc(params?.service?.id)
            .onSnapshot(documentSnapshot => {
              if (!documentSnapshot.exists) {
                return reject('Service data not found');
              }
              const servData = {
                id: documentSnapshot.id,
                ...documentSnapshot.data(),
              };
              setServiceData(servData);
              setServiceSelected(servData.service || null);
              setCustomerSelected(servData.customer || null);
              setTechnicalSelected(servData.technical || null);
              setReceiverFullName(servData.receiver_full_name || '');
              setReceiverPhone(servData.receiver_phone || '');
              // setMediaDescription(servData.book_obs || '');
              setHourSelected(
                asistecData.services_order_book_times.find(
                  x => x.id === servData.hour,
                ) || {},
              );
              setDateSelected(
                servData.date
                  ? new Date(convertTimestamp(servData.date))
                  : new Date(),
              );
              setShowContent(true);
              resolve(servData);
            }, reject);
        });
      };

      const fetchMediaServiceOrder = async serviceId => {
        unsubscribeMediaServiceOrder = firestore()
          .collection('services_order_media')
          .where('service_order_id', '==', serviceId)
          .where('type', 'in', [1, 2, 3, 4, 5, 6])
          .onSnapshot(querySnapshot => {
            const data = querySnapshot?.empty
              ? []
              : querySnapshot?.docs.map(x => ({id: x.id, ...x.data()}));
            data.forEach(item => {
              switch (item.type) {
                case 1:
                  setMediaBook(item);
                  break;
                case 2:
                  setMediaPredio(item);
                  break;
                case 3:
                  setMediaAntes(item);
                  break;
                case 4:
                  setMediaDespues(item);
                  break;
                case 5:
                  setMediaEvidencePago(item);
                  break;
                case 6:
                  setMediaEvidencePago2(item);
                  break;
                default:
                  break;
              }
            });
          });
      };

      const fetchCotServiceOrder = async serviceId => {
        unsubscribeCotServiceOrder = firestore()
          .collection('services_order_cotizacion')
          .where('service_order_id', '==', serviceId)
          .onSnapshot(querySnapshot => {
            const data = querySnapshot?.empty
              ? {}
              : querySnapshot?.docs.map(x => ({id: x.id, ...x.data()}))[0];
            setServiceCotizacion(data);
          });
      };

      const fetchActaServiceOrder = async serviceId => {
        unsubscribeActaServiceOrder = firestore()
          .collection('services_order_acta')
          .where('service_order_id', '==', serviceId)
          .onSnapshot(querySnapshot => {
            let data = querySnapshot?.empty
              ? null
              : querySnapshot?.docs.map(x => ({id: x.id, ...x.data()}))[0];
            if (!data) {
              data = {
                obs: asistecData?.services_order_acta_obs_default?.map(
                  item => ({
                    ...item,
                    id: uuid.v4(),
                  }),
                ),
              };
            }
            setServiceActaData(data);
          });
      };

      const initialize = async () => {
        try {
          const serviceData = await fetchServiceData();
          if (serviceData?.id) {
            await fetchMediaServiceOrder(serviceData.id);
            await fetchCotServiceOrder(serviceData.id);
            await fetchActaServiceOrder(serviceData.id);
          }
        } catch (error) {
          console.error(error);
        }
      };

      initialize();

      return () => {
        resetStates();
        if (unsubscribeService) {
          unsubscribeService();
        }
        if (unsubscribeMediaServiceOrder) {
          unsubscribeMediaServiceOrder();
        }
        if (unsubscribeCotServiceOrder) {
          unsubscribeCotServiceOrder();
        }
        if (unsubscribeActaServiceOrder) {
          unsubscribeActaServiceOrder();
        }
      };
    }, [params?.service?.id]),
  );

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const handleInputFocus = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const sendNotificationIfEnabled = (notificationData) => {
    if (AppConfig?.active_notifications) {
      NotificationsLogsModel.saveLogNotification(notificationData);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization();
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Geolocation Permission',
            message: 'Can we access your location?',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === 'granted') {
          return true;
        } else {
          return false;
        }
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const onPauseService = async item => {
    const dataSend = {
      ...serviceData,
      state: 2,
    };
    layoutRef?.current?.setLoading({state: true});
    const response = await ServiceOrderModel.updateServiceOrder(dataSend);
    layoutRef?.current?.setLoading({state: false});
    if (response) {
      if (appStoreUserProfile?.type === 1) {
        // notificacion a tecnico
        if (serviceData?.technical_id && serviceData?.technical_id !== '') {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${response?.service?.name || '-'} #${
                response?.consecutive || '-'
              } pausado por admin.`,
              // service_order_id: response?.id,
              model_type: 1,
              type: 18,
              to_user_id: serviceData?.technical_id,
              payload: {service_order_id: response.id},
            },
          });
        }
      } else {
        // notificacion a admins
        if (appStoreUserProfile?.type !== 1) {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${response?.service?.name || '-'} #${
                response?.consecutive || '-'
              } pausado por tecnico.`,
              // service_order_id: response?.id,
              model_type: 1,
              type: 18,
              payload: {service_order_id: response.id},
            },
            to_user_type: 1,
          });
        }
      }
      if (serviceData?.customer_id && serviceData?.customer_id !== '') {
        sendNotificationIfEnabled({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${response?.service?.name || '-'} #${
              response?.consecutive || '-'
            } pausado.`,
            // service_order_id: response?.id,
            model_type: 1,
            type: 18,
            to_user_id: serviceData?.customer_id,
            payload: {service_order_id: response.id},
          },
        });
      }
    } else {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Error',
        type: 'error',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // await setServiceDataFnt(serviceData?.id);
    setRefreshing(false);
  };
  const uploadImage = async image => {
    const {uri} = image;
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    let res = null;
    try {
      const task = getStorageApp().ref(filename).putFile(uploadUri);

      await task.on('state_changed', snapshot => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
      });

      await task
        .then(() => getStorageApp().ref(filename).getDownloadURL())
        .then(downUrl => {
          res = {
            url: downUrl,
            name: filename,
          };
        })
        .catch(error => {
          console.error('Error uploading image:', error);
        });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    return res;
  };

  const changeStateOrder = async () => {
    let order;
    let orderData = {
      id: serviceData?.id,
    };

    if (
      serviceData?.state === 1 ||
      serviceData?.state === 2 ||
      serviceData?.state === 12
    ) {
      // guarada la posicion actual del tecnico, para mostrar una ruta dibujada en el mapa
      await Geolocation.getCurrentPosition(info => {
        const {latitude, longitude} = info.coords;
        orderData.technical_initial_coords = {latitude, longitude};
      });
      if (serviceCotizacion?.id) {
        await ServiceOrderCotizacionModel.update({
          id: serviceCotizacion?.id,
          state: 1,
        });
      }
      orderData.state = 3;
    }
    if (serviceData?.state === 3) {
      orderData.state = 4;
    }
    if (serviceData?.state === 4) {
      //valida obs/fotos llegada a predio para pasar a cotizacion
      if (!mediaPredio?.media || mediaPredio?.media?.length === 0) {
        layoutRef?.current?.setSnack({
          state: true,
          message: 'Debe subir al menos una imagen de llegada a predio.',
          type: 'error',
        });
        return;
      }
      await saveMedia(mediaPredio, 2);
      orderData.state = 5;
    }
    if (serviceData?.state === 5) {
      // valida form de cotizacion para pasar a ejecucion
      const serviceCot = await ServiceOrderCotizacionModel.get({
        service_order_id: serviceData?.id,
      });
      if (!(serviceCot && serviceCot[0]?.id) || serviceCot[0].state !== 3) {
        layoutRef?.current?.setSnack({
          state: true,
          message: 'Cotizacion no ha sido aceptada',
          type: 'error',
        });
        return;
      }
      orderData.state = 6;
    }
    if (serviceData?.state === 6) {
      // finaliza ejecucion, valida fotos antes y despues
      const mediaAnt = await ServiceOrderMediaModel.get({
        service_order_id: serviceData?.id,
        type: 3,
      });
      const mediaDesp = await ServiceOrderMediaModel.get({
        service_order_id: serviceData?.id,
        type: 4,
      });

      if (
        mediaAnt &&
        mediaAnt[0]?.media?.length >= 2 &&
        mediaDesp &&
        mediaDesp[0]?.media?.length >= 2
      ) {
        await saveMedia(mediaAntes, 3);
        await saveMedia(mediaDespues, 4);
        orderData.state = 7;
      } else {
        layoutRef?.current?.setSnack({
          state: true,
          message: 'Debe subir imagenes de antes(2) y despues(2).',
          type: 'error',
        });
        return;
      }
    }
    if (serviceData?.state === 7) {
      // valida form de soportes (firmas) para pasar a pago
      if (
        !(
          serviceActaData?.id &&
          // serviceActaData?.state === 3 &&
          serviceActaData?.signature_b64 &&
          serviceActaData?.signature_b64 !== ''
        )
      ) {
        layoutRef?.current?.setSnack({
          state: true,
          message: 'Acta de servicio debe ser firmada.',
          type: 'error',
        });
        return;
      }
      orderData.state = 8;
    }
    if (serviceData?.state === 8) {
      //muestra form para evidencia de pago, cambia estado a pagado      if (
      if (!mediaEvidencePago?.id || mediaEvidencePago?.media?.length === 0) {
        layoutRef?.current?.setSnack({
          state: true,
          message: 'Debe cargar evidencia de pago.',
          type: 'error',
        });
        return;
      }
      await saveMedia(mediaEvidencePago, 5);
      orderData.state = 9;
    }
    if (serviceData?.state === 9) {
      //no valida nada, pasa a finalizado
      orderData.state = 10;
    }

    if (orderData.state) {
      layoutRef?.current?.setLoading({state: true});
      order = await ServiceOrderModel.updateServiceOrder(orderData);
      // if (order) {
      //   await setServiceDataFnt();
      // }
    }
    layoutRef?.current?.setLoading({state: false});
    if (order) {
      if (order?.state === 3) {
        // notificacion a admins
        if (appStoreUserProfile?.type !== 1) {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } esta en camino por ${
                cropText(appStoreUserProfile?.full_name, 15) || '-'
              }.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 5,
              payload: {service_order_id: serviceData.id},
            },
            to_user_type: 1,
          });
        }
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              to_user_id: serviceData?.customer_id,
              message: `Tu servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } esta en camino.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 5,
              payload: {service_order_id: serviceData.id},
            },
          });
        }
      }
      if (order?.state === 4) {
        // notificacion a admins
        if (appStoreUserProfile?.type !== 1) {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } llego al predio.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 6,
              payload: {service_order_id: serviceData.id},
            },
            to_user_type: 1,
          });
        }
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              to_user_id: serviceData?.customer_id,
              message: `Tu servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } esta en el predio.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 6,
              payload: {service_order_id: serviceData.id},
            },
          });
        }
      }
      if (order?.state === 5) {
        // notificacion a admins
        if (appStoreUserProfile?.type !== 1) {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } en cotizacion.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 9,
              payload: {service_order_id: serviceData.id},
            },
            to_user_type: 1,
          });
        }
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              to_user_id: serviceData?.customer_id,
              message: `Servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } en cotizacion.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 9,
              payload: {service_order_id: serviceData.id},
            },
          });
        }
      }
      if (order?.state === 6) {
        // notificacion a admins
        if (appStoreUserProfile?.type !== 1) {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } en ejcucion.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 10,
              payload: {service_order_id: serviceData.id},
            },
            to_user_type: 1,
          });
        }
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              to_user_id: serviceData?.customer_id,
              message: `Tu servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } esta en ejcucion.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 10,
              payload: {service_order_id: serviceData.id},
            },
          });
        }
      }
      if (order?.state === 7) {
        // notificacion a admins
        if (appStoreUserProfile?.type !== 1) {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } en validacion de acta de serv..`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 11,
              payload: {service_order_id: serviceData.id},
            },
            to_user_type: 1,
          });
        }
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              to_user_id: serviceData?.customer_id,
              message: `Tu servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } esta en validacion de acta de servicio.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 11,
              payload: {service_order_id: serviceData.id},
            },
          });
        }
      }
      if (order?.state === 8) {
        // notificacion a admins
        if (appStoreUserProfile?.type !== 1) {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } en espera de pago.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 12,
              payload: {service_order_id: serviceData.id},
            },
            to_user_type: 1,
          });
        }
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              to_user_id: serviceData?.customer_id,
              message: `Tu servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } esta  en espera de pago.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 12,
              payload: {service_order_id: serviceData.id},
            },
          });
        }
      }
      if (order?.state === 9) {
        // notificacion a admins
        if (appStoreUserProfile?.type !== 1) {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } pagado.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 13,
              payload: {service_order_id: serviceData.id},
            },
            to_user_type: 1,
          });
        }
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              to_user_id: serviceData?.customer_id,
              message: `Tu servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } fue pagado.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 13,
              payload: {service_order_id: serviceData.id},
            },
          });
        }
      }
      if (order?.state === 10) {
        // notificacion a admins
        if (appStoreUserProfile?.type !== 1) {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              message: `Servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } finalizado.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 14,
              payload: {service_order_id: serviceData.id},
            },
            to_user_type: 1,
          });
        }
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          sendNotificationIfEnabled({
            data: {
              from_user_id: appStoreUserProfile?.id || null,
              to_user_id: serviceData?.customer_id,
              message: `Tu servicio ${serviceData?.service?.name || '-'} #${
                serviceData?.consecutive || '-'
              } ha sido finalizado.`,
              // service_order_id: serviceData?.id,
              model_type: 1,
              type: 14,
              payload: {service_order_id: serviceData.id},
            },
          });
        }
      }
    }
  };

  const onItemCot = async item => {
    console.log(appStoreUserProfile?.type);
    console.log(serviceData?.state);
    if (
      (appStoreUserProfile.type === 2 && serviceData?.state != 5) ||
      appStoreUserProfile.type === 3
    ) {
      return;
    }
    formItemCotizacionRef?.current?.setForm(item);
    openBottomSheetFormItemCot();
  };

  const saveServiceCotizacionChanges = async (
    serviceCot = serviceCotizacion,
  ) => {
    // if (serviceData?.state !== 5 || appStoreUserProfile.type === 3) return;
    layoutRef?.current?.setLoading({state: true});
    let dataSend = {
      service_order_id: serviceData?.id,
      state: serviceCot?.state || 1,
      items: serviceCot?.items || [],
      obs: serviceCot?.obs || [],
    };

    let order = null;
    if (serviceCot.id) {
      dataSend.id = serviceCot.id;
      order = await ServiceOrderCotizacionModel.update(dataSend);
    } else {
      order = await ServiceOrderCotizacionModel.create(dataSend);
    }
    if (order) {
      // await getServiceCotizacion();
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
      closeBottomSheet();
      closeBottomSheetFormObs();
    }
    layoutRef?.current?.setLoading({state: false});
    return order;
  };

  const saveIemCot = async item => {
    const serviceCot = {...serviceCotizacion};
    const itemN = {...item};
    if (itemN.id) {
      let nuevaLista = serviceCot?.items?.map(obj => {
        if (obj.id === itemN.id) {
          return {...obj, ...itemN};
        }
        return obj;
      });
      serviceCot.items = nuevaLista;
    } else {
      itemN.id = uuid.v4();
      let itemD = serviceCot?.items ? [...serviceCot?.items] : [];
      itemD.push(itemN);
      serviceCot.items = itemD;
    }
    await saveServiceCotizacionChanges(serviceCot);
  };

  const deleteItemCot = async (id = itemSelectedAction.id) => {
    const newObsList = serviceCotizacion?.items?.filter(x => x.id !== id) || [];
    layoutRef?.current?.setLoading({state: true});
    let order = await ServiceOrderCotizacionModel.update({
      id: serviceCotizacion?.id,
      items: newObsList,
    });
    if (order) {
      // await getServiceCotizacion();
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const onObsCot = async item => {
    formObsCotizacionRef?.current?.setForm(item);
    openBottomSheetFormObs();
  };

  const saveIemObs = async item => {
    const serviceCot = {...serviceCotizacion};
    const itemN = {...item};
    if (itemN.id) {
      let nuevaLista = serviceCot?.obs?.map(obj => {
        if (obj.id === itemN.id) {
          return {...obj, ...itemN};
        }
        return obj;
      });
      serviceCot.obs = nuevaLista;
    } else {
      itemN.id = uuid.v4();
      let itemD = serviceCot?.obs ? [...serviceCot?.obs] : [];
      itemD.push(itemN);
      serviceCot.obs = itemD;
    }
    await saveServiceCotizacionChanges(serviceCot);
  };

  const openBottomSheetActionsCot = async (item, type) => {
    // if (
    //   serviceData?.state !== 5 ||
    //   appStoreUserProfile.type === 3 ||
    //   serviceCotizacion?.state === 3
    // ) {
    //   return;
    // }
    // type, 1 item cot, 2 item obs
    setItemSelectedAction(item);
    setItemTypeAction(type);
    formActionsRef?.current?.setForm(item);
    bottomSheetActionsRef.current.open();
  };

  const closeBottomSheetActions = async () => {
    bottomSheetActionsRef.current.close();
  };

  const onSelectAction = async action_id => {
    if (action_id === 2 && itemTypeAction === 2) {
      await deleteObs();
    }
    if (action_id === 1 && itemTypeAction === 2) {
      onObsCot(itemSelectedAction);
    }
    if (action_id === 1 && itemTypeAction === 1) {
      onItemCot(itemSelectedAction);
    }
    if (action_id === 2 && itemTypeAction === 1) {
      await deleteItemCot();
    }

    closeBottomSheetActions();
  };

  const deleteObs = async (id = itemSelectedAction.id) => {
    const newObsList = serviceCotizacion?.obs?.filter(x => x.id !== id) || [];
    layoutRef?.current?.setLoading({state: true});
    let order = await ServiceOrderCotizacionModel.update({
      id: serviceCotizacion?.id,
      obs: newObsList,
    });
    if (order) {
      // await getServiceCotizacion();
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const acceptCot = async (serviceCot = serviceCotizacion) => {
    // if (serviceData?.state !== 5) return;
    const serviceCotizacion1 = await saveServiceCotizacionChanges();
    layoutRef?.current?.setLoading({state: true});
    let dataSend = {
      id: serviceCotizacion1?.id,
      state: 3,
    };
    let cotOrder = null;
    cotOrder = await ServiceOrderCotizacionModel.update(dataSend);

    if (cotOrder) {
      // notificacion a admins
      if (appStoreUserProfile?.type !== 1) {
        sendNotificationIfEnabled({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${serviceData?.service?.name || '-'} #${
              serviceData?.consecutive || '-'
            } aceptado por cliente.`,
            // service_order_id: serviceData?.id,
            model_type: 1,
            type: 17,
            payload: {service_order_id: serviceData.id},
          },
          to_user_type: 1,
        });
      }
      if (serviceData?.technical_id && serviceData?.technical_id !== '') {
        sendNotificationIfEnabled({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${serviceData?.service?.name || '-'} #${
              serviceData?.consecutive || '-'
            } aceptado por cliente.`,
            // service_order_id: serviceData?.id,
            model_type: 1,
            type: 17,
            to_user_id: serviceData?.technical_id,
            payload: {service_order_id: serviceData.id},
          },
        });
      }
      // await getServiceCotizacion();
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
    }

    layoutRef?.current?.setLoading({state: false});
  };

  const waitCot = async (serviceCot = serviceCotizacion) => {
    // if (serviceData?.state !== 5) return;
    const serviceCotizacion1 = await saveServiceCotizacionChanges();

    layoutRef?.current?.setLoading({state: true});
    let orderCot = null;
    orderCot = await ServiceOrderCotizacionModel.update({
      id: serviceCotizacion1?.id,
      state: 2,
    });
    if (orderCot) {
      // await getServiceCotizacion();
    }
    const order = await ServiceOrderModel.updateServiceOrder({
      id: serviceData?.id,
      state: 2,
      customer_state: 2,
    });
    if (order) {
      // notificacion a admins
      if (appStoreUserProfile?.type !== 1) {
        sendNotificationIfEnabled({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${order?.service?.name || '-'} #${
              order?.consecutive || '-'
            } pausado por cliente.`,
            // service_order_id: order?.id,
            model_type: 1,
            type: 7,
            payload: {service_order_id: order.id},
          },
          to_user_type: 1,
        });
      }
      if (serviceData?.technical_id && serviceData?.technical_id !== '') {
        sendNotificationIfEnabled({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${order?.service?.name || '-'} #${
              order?.consecutive || '-'
            } pausado por cliente.`,
            // service_order_id: order?.id,
            model_type: 1,
            type: 7,
            to_user_id: serviceData?.technical_id,
            payload: {service_order_id: order.id},
          },
        });
      }
      // await setServiceDataFnt(serviceData?.id);
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const saveMedia = async (data, type, dataMedia) => {
    // if (!(data && data.length > 0)) return;
    const typeMedia = type || formMediaType;
    let dataSend;
    layoutRef?.current?.setLoading({state: true});

    const updatedUpFilesQueue = [];
    try {
      if (data.length > 0) {
        for (const image of data) {
          const contents = await uploadImage(image);
          updatedUpFilesQueue.push({
            id: uuid.v4(),
            name: contents.name,
            url: contents.url,
            upload_by_id: appStoreUserProfile.id,
          });
        }
      }
    } catch (error) {}

    if (typeMedia === 2) {
      // llegada predio media
      dataSend = {
        service_order_id: serviceData?.id,
        description: mediaPredio?.description || '',
        type: 2,
        media: [...(mediaPredio?.media || []), ...updatedUpFilesQueue],
      };
      if (mediaPredio?.id) {
        dataSend.id = mediaPredio?.id;
      }
    }

    if (typeMedia === 3) {
      // ejecucion - antes
      dataSend = {
        service_order_id: serviceData?.id,
        description: mediaAntes?.description || '',
        type: 3,
        media: [...(mediaAntes?.media || []), ...updatedUpFilesQueue],
      };
      if (mediaAntes?.id) {
        dataSend.id = mediaAntes?.id;
      }
    }

    if (typeMedia === 4) {
      // ejecucion - despues
      dataSend = {
        service_order_id: serviceData?.id,
        description: mediaDespues?.description || '',
        type: 4,
        media: [...(mediaDespues?.media || []), ...updatedUpFilesQueue],
      };
      if (mediaDespues?.id) {
        dataSend.id = mediaDespues?.id;
      }
    }

    if (typeMedia === 5) {
      // evidencia pago
      dataSend = {
        service_order_id: serviceData?.id,
        description: mediaEvidencePago?.description || '',
        type: 5,
        pay_type: mediaEvidencePago?.pay_type || '',
        ...dataMedia,
        media: [...(mediaEvidencePago?.media || []), ...updatedUpFilesQueue],
      };
      if (mediaEvidencePago?.id) {
        dataSend.id = mediaEvidencePago?.id;
      }
    }

    if (typeMedia === 6) {
      // evidencia pago 2
      dataSend = {
        service_order_id: serviceData?.id,
        description: mediaEvidencePago2?.description || '',
        type: 6,
        pay_type: mediaEvidencePago2?.pay_type || '',
        ...dataMedia,
        media: [...(mediaEvidencePago2?.media || []), ...updatedUpFilesQueue],
      };
      if (mediaEvidencePago2?.id) {
        dataSend.id = mediaEvidencePago2?.id;
      }
    }

    let order = null;
    if (dataSend && dataSend?.id) {
      order = await ServiceOrderMediaModel.update(dataSend);
    }
    if (dataSend && !dataSend?.id) {
      order = await ServiceOrderMediaModel.create(dataSend);
    }

    if (order) {
      // if (typeMedia === 2) {
      //   getMediaPredio();
      // }
      // if (typeMedia === 3) {
      //   getMediaAntes();
      // }
      // if (typeMedia === 4) {
      //   getMediaDespues();
      // }
      // if (typeMedia === 5) {
      //   getMediaEvidencePago();
      // }
      // if (typeMedia === 6) {
      //   getMediaEvidencePago2();
      // }
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
      closeBottomSheetFormMedia();
    }

    layoutRef?.current?.setLoading({state: false});
  };

  const deleteMedia = async (file, type) => {
    const dataSend = {
      // id,
      // media,
    };
    let newMedia = [];
    if (type === 2) {
      newMedia = mediaPredio?.media?.filter(x => x.id !== file.id) || [];
      dataSend.id = mediaPredio.id;
      dataSend.media = newMedia;
    }
    if (type === 3) {
      newMedia = mediaAntes?.media?.filter(x => x.id !== file.id) || [];
      dataSend.id = mediaAntes.id;
      dataSend.media = newMedia;
    }
    if (type === 4) {
      newMedia = mediaDespues?.media?.filter(x => x.id !== file.id) || [];
      dataSend.id = mediaDespues.id;
      dataSend.media = newMedia;
    }
    if (type === 5) {
      newMedia = mediaEvidencePago?.media?.filter(x => x.id !== file.id) || [];
      dataSend.id = mediaEvidencePago.id;
      dataSend.media = newMedia;
    }
    if (type === 6) {
      newMedia = mediaEvidencePago2?.media?.filter(x => x.id !== file.id) || [];
      dataSend.id = mediaEvidencePago2.id;
      dataSend.media = newMedia;
    }
    layoutRef?.current?.setLoading({state: true});
    let order = await ServiceOrderMediaModel.update(dataSend);
    if (order) {
      // if (type === 2) {
      //   await getMediaPredio();
      // }
      // if (type === 3) {
      //   await getMediaAntes();
      // }
      // if (type === 4) {
      //   await getMediaDespues();
      // }
      // if (type === 5) {
      //   await getMediaEvidencePago();
      // }
      // if (type === 6) {
      //   await getMediaEvidencePago2();
      // }
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const totalCot = () => {
    let total = 0;
    serviceCotizacion?.items?.map(x => {
      total = Number(total) + Number(x.qty) * Number(x.price);
    });
    return total;
  };

  const goToServiceActa = async () => {
    NavigationService.navigate({
      name: 'ModalServiceOrderActa',
      params: {service_order_id: serviceData?.id},
    });
  };

  const onDownFileActa = async () => {
    layoutRef?.current?.setLoading({
      state: true,
      message: 'Obteniendo informacion del documento...',
    });
    await functions()
      .httpsCallable('genPdfOrdenServiceV1')({id: serviceData?.id})
      .then(response => {
        if (response?.data?.data?.url) {
          layoutRef?.current?.setSnack({
            state: true,
            message: 'Abriendo documento...',
            // type: 'error',
          });
          setTimeout(() => {
            Linking.openURL(`${response?.data?.data?.url}`);
          }, 2000);
        }
      })
      .catch(e => {
        console.log('e', e);
        layoutRef?.current?.setSnack({
          state: true,
          message: 'Error: ' + e,
          type: 'error',
        });
      });
    layoutRef?.current?.setLoading({state: false});
  };

  return (
    <>
      <AppLayout ref={layoutRef} hiddenBottomBarMenu>
        <ScrollView
          ref={scrollViewRef}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1, 
            paddingBottom: keyboardVisible ? keyboardHeight + 20 : 60
          }}>
          {showContent ? (
            <>
              <View style={{paddingHorizontal: 10}}>
                {/* <CoreText style={{marginTop: 10}} variant="titleLarge">
                  Agendacion
                </CoreText> */}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Chip style={{margin: 4}}>
                    {serviceData?.state === 11 &&
                    appStoreUserProfile?.type !== 1
                      ? 'Finalizado'
                      : asistecData?.services_order_state?.find(
                          x => x.id === serviceData?.state,
                        )?.name || ''}
                  </Chip>
                </View>
                {serviceData?.customer_state === 2 ? (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 10,
                      }}>
                      <Chip
                        style={{
                          margin: 4,
                          backgroundColor: themeData?.colors.asistectSec,
                        }}>
                        En espera por cliente
                      </Chip>
                    </View>
                  </>
                ) : (
                  <></>
                )}
                <View>
                    <Pressable
                      // onPress={() => openModal('service')}
                      style={{marginTop: 10}}>
                      <CoreTextInput
                        value={serviceSelected?.name || ''}
                        label={`Servicio #${serviceData?.consecutive || ''}`}
                        mode="outlined"
                        editable={false}
                        pointerEvents="none"
                        dense
                      />
                    </Pressable>

                    {appStoreUserProfile?.type === 1 ||
                    appStoreUserProfile?.type === 2 ? (
                      <>
                        <Pressable
                          // onPress={() => openModal('customer')}
                          style={{marginTop: 10}}>
                          <CoreTextInput
                            value={customerSelected?.full_name || ''}
                            label="Cliente"
                            mode="outlined"
                            editable={false}
                            pointerEvents="none"
                            dense
                          />
                        </Pressable>
                      </>
                    ) : (
                      <></>
                    )}

                    {appStoreUserProfile?.type === 1 ||
                    appStoreUserProfile?.type === 3 ? (
                      <>
                        <Pressable
                          // onPress={() => openModal('technical')}
                          style={{marginTop: 10}}>
                          <CoreTextInput
                            value={technicalSelected?.full_name || ''}
                            label="Tecnico"
                            mode="outlined"
                            editable={false}
                            pointerEvents="none"
                            dense
                          />
                        </Pressable>
                      </>
                    ) : (
                      <></>
                    )}
                    {/* <Pressable
                      // onPress={() => openModalSetLocation()}
                      style={{marginTop: 10}}>
                      <CoreTextInput
                        label="Ubicacion (*)"
                        mode="outlined"
                        value={
                          locAddress && locAddress.length > 40
                            ? locAddress.substring(0, 40) + '...'
                            : locAddress || ''
                        }
                        editable={false}
                        style={{
                          backgroundColor: 'transparent',
                        }}
                        pointerEvents="none"
                        dense
                      />
                    </Pressable> */}
                    <CoreTextInput
                      multiline
                      style={{marginTop: 10}}
                      value={serviceData?.loc_address || ''}
                      label="Ubicacion"
                      mode="outlined"
                      editable={false}
                      dense
                    />
                    <CoreTextInput
                      multiline
                      style={{marginTop: 10}}
                      value={serviceData?.loc_address_ref || ''}
                      label="Ref. de ubicacion"
                      mode="outlined"
                      editable={false}
                      dense
                    />

                    <CoreTextInput
                      style={{marginTop: 10}}
                      value={reciverFullName}
                      // onChangeText={setReciverFullName}
                      label="Nombre completo de Quien recibe"
                      mode="outlined"
                      editable={false}
                      dense
                    />
                    <CoreTextInput
                      style={{marginTop: 10}}
                      value={reciverPhone}
                      // onChangeText={setReciverPhone}
                      label="Telefono de Quien recibe"
                      mode="outlined"
                      keyboardType="phone-pad"
                      editable={false}
                      dense
                    />

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                      }}>
                      <Pressable
                        style={{flex: 1, paddingHorizontal: 3}}
                        // onPress={() => setOpenPikerDate(true)}
                      >
                        <CoreTextInput
                          value={core_print_date(dateSelected?.toISOString())}
                          label="Fecha"
                          mode="outlined"
                          editable={false}
                          pointerEvents="none"
                          dense
                        />
                      </Pressable>

                      {/* <Pressable
                        style={{flex: 1, paddingHorizontal: 3}}
                        onPress={() => setOpenPikerTime(true)}>
                        <CoreTextInput
                          value={core_print_time(hourSelected?.toISOString())}
                          label="Hora"
                          mode="outlined"
                          editable={false}
                        />
                      </Pressable> */}
                      <Pressable
                        // onPress={() => openModal('hour')}
                        style={{flex: 1, paddingHorizontal: 3}}>
                        <CoreTextInput
                          value={hourSelected?.name || ''}
                          label="Hora"
                          mode="outlined"
                          editable={false}
                          pointerEvents="none"
                          dense
                        />
                      </Pressable>
                      <DatePicker
                        mode="date"
                        modal
                        open={openPikerDate}
                        date={dateSelected}
                        onConfirm={date => {
                          setOpenPikerDate(false);
                          setDateSelected(date);
                        }}
                        onCancel={() => {
                          setOpenPikerDate(false);
                        }}
                      />
                    </View>
                    <CoreText style={{marginTop: 10}} variant="titleMedium">
                      Informacion adicional
                    </CoreText>

                    <View
                      style={{
                        marginTop: 10,
                      }}>
                      <ScrollView
                        horizontal={true}
                        style={{
                          flexDirection: 'row',
                        }}>
                        {mediaBook?.maeida?.length === 0 ? (
                          <>
                            <View>
                              <CoreIconMaterialCommunity
                                name="file-image"
                                size={40}
                                style={
                                  {
                                    // color:
                                  }
                                }
                              />
                              <CoreText>No hay imagenes</CoreText>
                            </View>
                          </>
                        ) : (
                          <></>
                        )}
                        {mediaBook?.media?.map(img => (
                          <View
                            key={img.url || img.name}
                            style={{marginHorizontal: 5}}>
                            <View
                              key={img?.url || img?.name}
                              style={{position: 'relative'}}>
                              <CoreImageModal
                                key={img?.url || img?.name}
                                source={{
                                  uri: img?.url
                                    ? img?.url
                                    : 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                                }}
                                style={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: 10,
                                }}
                              />
                            </View>
                          </View>
                        ))}
                      </ScrollView>
                    </View>

                    <View
                      style={{
                        marginTop: 10,
                      }}>
                      {/* <CoreText>
                        Danos una breve descripcion del recurso afectado,
                        consideraciones a tener en cuenta o simplemente describe
                        las imagenes cargadas.
                      </CoreText> */}
                      <CoreTextInput
                        multiline
                        value={mediaBook?.description || ''}
                        label="Observaciones"
                        mode="outlined"
                        editable={false}
                        dense
                      />
                    </View>

                    {serviceData?.customer_state === 1 &&
                    ((serviceData?.state === 2 && mediaPredio?.id) ||
                      serviceData?.state >= 4) ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleLarge">
                            Llegada a predio
                          </CoreText>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleMedium">
                            Evidencias de llegada
                          </CoreText>
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile?.type === 1) &&
                          serviceData?.state === 4 ? (
                            <IconButton
                              style={{}}
                              icon="plus"
                              mode="contained"
                              size={16}
                              onPress={() => openBottomSheetFormMedia(2)}
                            />
                          ) : (
                            <></>
                          )}
                        </View>
                        <View
                          style={{
                            marginTop: 10,
                          }}>
                          <ScrollView
                            horizontal={true}
                            style={{
                              flexDirection: 'row',
                            }}>
                            {mediaPredio?.media?.length === 0 ? (
                              <>
                                <View>
                                  <CoreIconMaterialCommunity
                                    name="file-image"
                                    size={40}
                                    style={
                                      {
                                        // color:
                                      }
                                    }
                                  />
                                  <CoreText>No hay imagenes</CoreText>
                                </View>
                              </>
                            ) : (
                              <></>
                            )}
                            {mediaPredio?.media?.map(img => (
                              <View
                                key={img.url || img.name}
                                style={{marginHorizontal: 5}}>
                                <View
                                  key={img.url || img.name}
                                  style={{position: 'relative'}}>
                                  <CoreImageModal
                                    key={img.url || img.name}
                                    source={{
                                      uri: img.url
                                        ? img.url
                                        : 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                                    }}
                                    style={{
                                      width: 100,
                                      height: 100,
                                      borderRadius: 10,
                                    }}
                                  />
                                  {(appStoreUserProfile.id ===
                                    serviceData?.technical_id ||
                                    appStoreUserProfile?.type === 1) &&
                                  serviceData?.state === 4 ? (
                                    <TouchableOpacity
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor:
                                          'rgba(255, 255, 255, 1)',
                                        borderRadius: 15,
                                      }}
                                      onPress={() => deleteMedia(img, 2)}>
                                      <CoreIconMaterialCommunity
                                        name="close-circle"
                                        size={20}
                                        style={{
                                          color: themeData.colors.error,
                                        }}
                                      />
                                    </TouchableOpacity>
                                  ) : (
                                    <></>
                                  )}
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        </View>

                        <View
                          style={{
                            marginTop: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <CoreTextInput
                            multiline
                            value={mediaPredio?.description || ''}
                            onChangeText={val =>
                              setMediaPredio({
                                ...mediaPredio,
                                description: val,
                              })
                            }
                            label="Observaciones"
                            mode="outlined"
                            editable={
                              (appStoreUserProfile.id ===
                                serviceData?.technical_id ||
                                appStoreUserProfile?.type === 1) &&
                              serviceData?.state === 4
                            }
                            dense
                            style={{flex: 1}}
                          />
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile?.type === 1) &&
                          serviceData?.state === 4 ? (
                            <>
                              <IconButton
                                style={{padding: 5}}
                                icon="content-save"
                                mode="contained"
                                size={20}
                                onPress={() => saveMedia(mediaPredio, 2)}
                              />
                            </>
                          ) : (
                            <></>
                          )}
                        </View>
                      </>
                    ) : (
                      <></>
                    )}

                    {true ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleLarge">
                            Cotizacion
                          </CoreText>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleMedium">
                            Elementos cotizacion
                          </CoreText>
                          {appStoreUserProfile.type === 1 ||
                          (appStoreUserProfile.id ===
                            serviceData?.technical_id &&
                            serviceData?.state === 5 &&
                            serviceCotizacion?.state !== 3) ? (
                            <IconButton
                              style={{}}
                              icon="plus"
                              mode="contained"
                              size={16}
                              onPress={() => onItemCot()}
                            />
                          ) : (
                            <></>
                          )}
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <DataTable>
                            <DataTable.Header>
                              <DataTable.Title
                              // sortDirection={
                              //   sortAscending ? 'ascending' : 'descending'
                              // }
                              // onPress={() => setSortAscending(!sortAscending)}
                              // style={styles.first}
                              >
                                Descripcion
                              </DataTable.Title>
                              <DataTable.Title numberOfLines={2} numeric>
                                Cant.
                              </DataTable.Title>
                              <DataTable.Title numeric>
                                Val. Unit.
                              </DataTable.Title>

                              <DataTable.Title numeric>Total</DataTable.Title>
                            </DataTable.Header>

                            {serviceCotizacion?.items ? (
                              serviceCotizacion?.items?.map(item => (
                                <DataTable.Row
                                  key={item.id}
                                  onPress={() =>
                                    openBottomSheetActionsCot(item, 1)
                                  }>
                                  <DataTable.Cell numberOfLines={2}>
                                    {item?.name}
                                  </DataTable.Cell>
                                  <DataTable.Cell numeric>
                                    {item?.qty}
                                  </DataTable.Cell>
                                  <DataTable.Cell numeric>
                                    {formatPrice(item?.price, null)}
                                  </DataTable.Cell>
                                  <DataTable.Cell numeric>
                                    {formatPrice(item?.total, null)}
                                  </DataTable.Cell>
                                </DataTable.Row>
                              ))
                            ) : (
                              <></>
                            )}

                            <DataTable.Row
                            // onPress={() => openBottomSheetActionsCot(item, 1)}
                            >
                              {/* <DataTable.Cell></DataTable.Cell> */}
                              {/* <DataTable.Cell></DataTable.Cell> */}
                              <DataTable.Cell>
                                <CoreText style={{fontWeight: 'bold'}}>
                                  Total
                                </CoreText>
                              </DataTable.Cell>
                              <DataTable.Cell numeric>
                                <CoreText style={{fontWeight: 'bold'}}>
                                  {/* 000.000.000.00 */}
                                  COP {formatPrice(totalCot(), null)}
                                </CoreText>
                              </DataTable.Cell>
                            </DataTable.Row>

                            {/* <DataTable.Pagination
                              // page={page}
                              // numberOfPages={Math.ceil(
                              //   sortedItems.length / itemsPerPage,
                              // )}
                              // onPageChange={page => setPage(page)}
                              // label={`${from + 1}-${to} of ${sortedItems.length}`}
                              // numberOfItemsPerPageList={numberOfItemsPerPageList}
                              // numberOfItemsPerPage={itemsPerPage}
                              // onItemsPerPageChange={onItemsPerPageChange}
                              showFastPaginationControls
                              selectPageDropdownLabel={'Rows per page'}
                            /> */}
                          </DataTable>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleMedium">
                            Observaciones
                          </CoreText>
                          {appStoreUserProfile.type === 1 ||
                          (appStoreUserProfile.id ===
                            serviceData?.technical_id &&
                            serviceData?.state === 5 &&
                            serviceCotizacion?.state !== 3) ? (
                            <IconButton
                              style={{}}
                              icon="plus"
                              mode="contained"
                              size={16}
                              onPress={() => onObsCot()}
                            />
                          ) : (
                            <></>
                          )}
                        </View>
                        {serviceCotizacion?.obs ? (
                          serviceCotizacion?.obs?.map(item => (
                            <Pressable
                              key={item.id}
                              onPress={() => openBottomSheetActionsCot(item, 2)}
                              style={{
                                flexDirection: 'row',
                                paddingHorizontal: 10,
                                paddingBottom: 5,
                              }}>
                              <CoreIconMaterialCommunity
                                name="checkbox-blank-circle"
                                size={10}
                                color="#000"
                                style={{paddingRight: 5, marginTop: 2}}
                              />
                              <CoreText>{item.description}</CoreText>
                            </Pressable>
                          ))
                        ) : (
                          <></>
                        )}
                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleMedium">
                            Confirmar cotizacion
                          </CoreText>
                          <Chip style={{margin: 4}}>
                            {serviceCotizacion?.state === 2
                              ? 'En espera'
                              : serviceCotizacion?.state === 3
                              ? 'Aceptado'
                              : 'Pendiente'}
                          </Chip>
                        </View>
                      </>
                    ) : (
                      <></>
                    )}

                    {serviceData?.customer_state === 1 &&
                    serviceData?.state >= 6 ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleLarge">
                            Ejecucion
                          </CoreText>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleMedium">
                            Registro fotografico antes
                          </CoreText>
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile?.type === 1) &&
                          serviceData?.state === 6 ? (
                            <IconButton
                              style={{}}
                              icon="plus"
                              mode="contained"
                              size={16}
                              onPress={() => openBottomSheetFormMedia(3)}
                            />
                          ) : (
                            <></>
                          )}
                        </View>

                        <View
                          style={{
                            marginTop: 10,
                          }}>
                          <ScrollView
                            horizontal={true}
                            style={{
                              flexDirection: 'row',
                            }}>
                            {mediaAntes?.media?.length === 0 ? (
                              <>
                                <View>
                                  <CoreIconMaterialCommunity
                                    name="file-image"
                                    size={40}
                                    style={
                                      {
                                        // color:
                                      }
                                    }
                                  />
                                  <CoreText>No hay imagenes</CoreText>
                                </View>
                              </>
                            ) : (
                              <></>
                            )}
                            {mediaAntes?.media?.map(img => (
                              <View
                                key={img.url || img.name}
                                style={{marginHorizontal: 5}}>
                                <View
                                  key={img.url || img.name}
                                  style={{position: 'relative'}}>
                                  <CoreImageModal
                                    key={img.url || img.name}
                                    source={{
                                      uri: img.url
                                        ? img.url
                                        : 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                                    }}
                                    style={{
                                      width: 100,
                                      height: 100,
                                      borderRadius: 10,
                                    }}
                                  />
                                  {(appStoreUserProfile.id ===
                                    serviceData?.technical_id ||
                                    appStoreUserProfile?.type === 1) &&
                                  serviceData?.state === 6 ? (
                                    <TouchableOpacity
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor:
                                          'rgba(255, 255, 255, 1)',
                                        borderRadius: 15,
                                      }}
                                      onPress={() => deleteMedia(img, 3)}>
                                      <CoreIconMaterialCommunity
                                        name="close-circle"
                                        size={20}
                                        style={{
                                          color: themeData.colors.error,
                                        }}
                                      />
                                    </TouchableOpacity>
                                  ) : (
                                    <></>
                                  )}
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        </View>

                        <View
                          style={{
                            marginTop: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <CoreTextInput
                            multiline
                            value={mediaAntes?.description || ''}
                            onChangeText={val =>
                              setMediaAntes({
                                ...mediaAntes,
                                description: val,
                              })
                            }
                            label="Observaciones"
                            mode="outlined"
                            editable={
                              (appStoreUserProfile.id ===
                                serviceData?.technical_id ||
                                appStoreUserProfile?.type === 1) &&
                              serviceData?.state === 6
                            }
                            dense
                            style={{flex: 1}}
                          />
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile?.type === 1) &&
                          serviceData?.state === 6 ? (
                            <>
                              <IconButton
                                style={{padding: 5}}
                                icon="content-save"
                                mode="contained"
                                size={20}
                                onPress={() => saveMedia(mediaAntes, 3)}
                              />
                            </>
                          ) : (
                            <></>
                          )}
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleMedium">
                            Registro fotografico despues
                          </CoreText>
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile?.type === 1) &&
                          serviceData?.state === 6 ? (
                            <IconButton
                              style={{}}
                              icon="plus"
                              mode="contained"
                              size={16}
                              onPress={() => openBottomSheetFormMedia(4)}
                            />
                          ) : (
                            <></>
                          )}
                        </View>

                        <View
                          style={{
                            marginTop: 10,
                          }}>
                          <ScrollView
                            horizontal={true}
                            style={{
                              flexDirection: 'row',
                            }}>
                            {mediaDespues?.media?.length === 0 ? (
                              <>
                                <View>
                                  <CoreIconMaterialCommunity
                                    name="file-image"
                                    size={40}
                                    style={
                                      {
                                        // color:
                                      }
                                    }
                                  />
                                  <CoreText>No hay imagenes</CoreText>
                                </View>
                              </>
                            ) : (
                              <></>
                            )}
                            {mediaDespues?.media?.map(img => (
                              <View
                                key={img.url || img.name}
                                style={{marginHorizontal: 5}}>
                                <View
                                  key={img.url || img.name}
                                  style={{position: 'relative'}}>
                                  <CoreImageModal
                                    key={img.url || img.name}
                                    source={{
                                      uri: img.url
                                        ? img.url
                                        : 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                                    }}
                                    style={{
                                      width: 100,
                                      height: 100,
                                      borderRadius: 10,
                                    }}
                                  />
                                  {(appStoreUserProfile.id ===
                                    serviceData?.technical_id ||
                                    appStoreUserProfile?.type === 1) &&
                                  serviceData?.state === 6 ? (
                                    <TouchableOpacity
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor:
                                          'rgba(255, 255, 255, 1)',
                                        borderRadius: 15,
                                      }}
                                      onPress={() => deleteMedia(img, 4)}>
                                      <CoreIconMaterialCommunity
                                        name="close-circle"
                                        size={20}
                                        style={{
                                          color: themeData.colors.error,
                                        }}
                                      />
                                    </TouchableOpacity>
                                  ) : (
                                    <></>
                                  )}
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        </View>

                        <View
                          style={{
                            marginTop: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <CoreTextInput
                            multiline
                            value={mediaDespues?.description || ''}
                            onChangeText={val =>
                              setMediaDespues({
                                ...mediaDespues,
                                description: val,
                              })
                            }
                            label="Observaciones"
                            mode="outlined"
                            editable={
                              (appStoreUserProfile.id ===
                                serviceData?.technical_id ||
                                appStoreUserProfile?.type === 1) &&
                              serviceData?.state === 6
                            }
                            dense
                            style={{flex: 1}}
                          />
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile?.type === 1) &&
                          serviceData?.state === 6 ? (
                            <>
                              <IconButton
                                style={{padding: 5}}
                                icon="content-save"
                                mode="contained"
                                size={20}
                                onPress={() => saveMedia(mediaDespues, 4)}
                              />
                            </>
                          ) : (
                            <></>
                          )}
                        </View>
                      </>
                    ) : (
                      <></>
                    )}

                    {serviceData?.customer_state === 1 &&
                    serviceData?.state >= 7 ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleLarge">
                            Acta de servicio
                          </CoreText>
                          {/* <IconButton
                                    style={{}}
                                    icon="plus"
                                    mode="contained"
                                    size={16}
                                    onPress={() => openBottomSheetFormMedia(2)}
                                  /> */}
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleMedium">
                            Confirmar acta de servicio
                          </CoreText>
                          <Chip
                            onPress={() => {
                              goToServiceActa();
                            }}
                            style={{
                              margin: 4,
                              backgroundColor:
                                serviceActaData?.state === 2
                                  ? themeData.colors.error
                                  : serviceActaData?.state === 1
                                  ? themeData.colors.secondaryContainer
                                  : themeData.colors.asistectSec,
                              // color: '#fff',
                            }}
                            // textStyle={{
                            //   color:
                            //     serviceActaData?.state !== 2 ? '#fff' : '#000',
                            // }}
                          >
                            {serviceActaData?.id &&
                            serviceActaData?.signature_b64 &&
                            serviceActaData?.signature_b64 !== ''
                              ? 'Aceptado'
                              : 'Pendiente'}
                            {/* {serviceActaData.state === 2
                              ? 'Rechazado'
                              : serviceActaData.state === 3
                              ? 'Aceptado'
                              : 'Pendiente'} */}
                          </Chip>
                          {/* ya se firmo el acta o tiene garantia */}
                          {serviceData?.state > 7 ||
                          (serviceData?.warranty_id &&
                            serviceData?.warranty_id !== '') ? (
                            <>
                              <IconButton
                                style={{}}
                                icon="file-download-outline"
                                mode="contained"
                                size={25}
                                onPress={() => onDownFileActa()}
                                // onPress={() => onChatFnt(1)}
                              />
                            </>
                          ) : (
                            <></>
                          )}
                        </View>
                      </>
                    ) : (
                      <></>
                    )}

                    {serviceData?.customer_state === 1 &&
                    serviceData?.state >= 8 ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleLarge">
                            Pago
                          </CoreText>
                          {/* <IconButton
                                    style={{}}
                                    icon="plus"
                                    mode="contained"
                                    size={16}
                                    onPress={() => openBottomSheetFormMedia(2)}
                                  /> */}
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            // alignItems: 'center',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleMedium">
                            Evidencia
                          </CoreText>
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile.id ===
                              serviceData?.customer_id ||
                            appStoreUserProfile?.type === 1) &&
                          serviceData?.state === 8 ? (
                            <IconButton
                              style={{}}
                              icon="plus"
                              mode="contained"
                              size={16}
                              onPress={() => openBottomSheetFormMedia(5)}
                            />
                          ) : (
                            <></>
                          )}
                        </View>

                        <View
                          style={{
                            marginTop: 10,
                          }}>
                          <ScrollView
                            horizontal={true}
                            style={{
                              flexDirection: 'row',
                            }}>
                            {mediaEvidencePago?.media?.length === 0 ? (
                              <>
                                <View>
                                  <CoreIconMaterialCommunity
                                    name="file-image"
                                    size={40}
                                    style={
                                      {
                                        // color:
                                      }
                                    }
                                  />
                                  <CoreText>No hay imagenes</CoreText>
                                </View>
                              </>
                            ) : (
                              <></>
                            )}
                            {mediaEvidencePago?.media?.map(img => (
                              <View
                                key={img.url || img.name}
                                style={{marginHorizontal: 5}}>
                                <View
                                  key={img.url || img.name}
                                  style={{position: 'relative'}}>
                                  <CoreImageModal
                                    key={img.url || img.name}
                                    source={{
                                      uri: img.url
                                        ? img.url
                                        : 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                                    }}
                                    style={{
                                      width: 100,
                                      height: 100,
                                      borderRadius: 10,
                                    }}
                                  />
                                  {(appStoreUserProfile.id ===
                                    serviceData?.technical_id ||
                                    appStoreUserProfile.id ===
                                      serviceData?.customer_id ||
                                    appStoreUserProfile?.type === 1) &&
                                  serviceData?.state === 8 ? (
                                    <TouchableOpacity
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor:
                                          'rgba(255, 255, 255, 1)',
                                        borderRadius: 15,
                                      }}
                                      onPress={() => deleteMedia(img, 5)}>
                                      <CoreIconMaterialCommunity
                                        name="close-circle"
                                        size={20}
                                        style={{
                                          color: themeData.colors.error,
                                        }}
                                      />
                                    </TouchableOpacity>
                                  ) : (
                                    <></>
                                  )}
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                        <View style={{paddingTop: 15}}>
                          <CoreText style={{fontWeight: 'bold'}}>
                            Metodo de pago
                          </CoreText>
                          {serviceData?.state > 8 ? (
                            <RadioButton.Item
                              dense
                              label={
                                metodosPago?.find(
                                  x => x?.id === mediaEvidencePago?.pay_type,
                                )?.name || ''
                              }
                              status={'checked'}
                            />
                          ) : (
                            <RadioButton.Group
                              dense
                              onValueChange={newValue => {
                                setMediaEvidencePago({
                                  ...mediaEvidencePago,
                                  pay_type: newValue,
                                });
                                saveMedia([], 5, {
                                  ...mediaEvidencePago,
                                  pay_type: newValue,
                                });
                              }}
                              value={mediaEvidencePago?.pay_type}>
                              {metodosPago.map(metodPago => (
                                <RadioButton.Item
                                  dense
                                  key={metodPago.id}
                                  label={metodPago.name}
                                  value={metodPago.id}
                                />
                              ))}
                            </RadioButton.Group>
                          )}
                        </View>

                        <View
                          style={{
                            marginTop: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <CoreTextInput
                            multiline
                            value={mediaEvidencePago?.description || ''}
                            onChangeText={val =>
                              setMediaEvidencePago({
                                ...mediaEvidencePago,
                                description: val,
                              })
                            }
                            label="Observaciones"
                            mode="outlined"
                            editable={
                              (appStoreUserProfile.id ===
                                serviceData?.technical_id ||
                                appStoreUserProfile.id ===
                                  serviceData?.customer_id ||
                                appStoreUserProfile?.type === 1) &&
                              serviceData?.state === 8
                            }
                            dense
                            style={{flex: 1}}
                          />
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile.id ===
                              serviceData?.customer_id ||
                            appStoreUserProfile?.type === 1) &&
                          serviceData?.state === 8 ? (
                            <>
                              <IconButton
                                style={{padding: 5}}
                                icon="content-save"
                                mode="contained"
                                size={20}
                                onPress={() => saveMedia(mediaEvidencePago, 5)}
                              />
                            </>
                          ) : (
                            <></>
                          )}
                        </View>
                      </>
                    ) : (
                      <></>
                    )}

                    {serviceData?.customer_state === 2 ||
                    mediaEvidencePago2?.id ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleLarge">
                            Pago visita cotizacion
                          </CoreText>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <CoreText
                            style={{
                              marginTop: 10,
                            }}
                            variant="titleMedium">
                            Evidencia
                          </CoreText>
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile.id ===
                              serviceData?.customer_id ||
                            appStoreUserProfile.type === 1) &&
                          serviceData?.customer_state === 2 ? (
                            <IconButton
                              style={{}}
                              icon="plus"
                              mode="contained"
                              size={16}
                              onPress={() => openBottomSheetFormMedia(6)}
                            />
                          ) : (
                            <></>
                          )}
                        </View>

                        <View
                          style={{
                            marginTop: 10,
                          }}>
                          <ScrollView
                            horizontal={true}
                            style={{
                              flexDirection: 'row',
                            }}>
                            {mediaEvidencePago2?.media?.length === 0 ? (
                              <>
                                <View>
                                  <CoreIconMaterialCommunity
                                    name="file-image"
                                    size={40}
                                    style={
                                      {
                                        // color:
                                      }
                                    }
                                  />
                                  <CoreText>No hay imagenes</CoreText>
                                </View>
                              </>
                            ) : (
                              <></>
                            )}
                            {mediaEvidencePago2?.media?.map(img => (
                              <View
                                key={img.url || img.name}
                                style={{marginHorizontal: 5}}>
                                <View
                                  key={img.url || img.name}
                                  style={{position: 'relative'}}>
                                  <CoreImageModal
                                    key={img.url || img.name}
                                    source={{
                                      uri: img.url
                                        ? img.url
                                        : 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                                    }}
                                    style={{
                                      width: 100,
                                      height: 100,
                                      borderRadius: 10,
                                    }}
                                  />
                                  {(appStoreUserProfile.id ===
                                    serviceData?.technical_id ||
                                    appStoreUserProfile.id ===
                                      serviceData?.customer_id ||
                                    appStoreUserProfile?.type === 1) &&
                                  serviceData?.customer_state === 2 ? (
                                    <TouchableOpacity
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor:
                                          'rgba(255, 255, 255, 1)',
                                        borderRadius: 15,
                                      }}
                                      onPress={() => deleteMedia(img, 6)}>
                                      <CoreIconMaterialCommunity
                                        name="close-circle"
                                        size={20}
                                        style={{
                                          color: themeData.colors.error,
                                        }}
                                      />
                                    </TouchableOpacity>
                                  ) : (
                                    <></>
                                  )}
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        </View>

                        <View style={{paddingTop: 15}}>
                          <CoreText style={{fontWeight: 'bold'}}>
                            Metodo de pago
                          </CoreText>
                          {serviceData?.customer_state !== 2 ? (
                            <RadioButton.Item
                              dense
                              label={
                                metodosPago?.find(
                                  x => x?.id === mediaEvidencePago2?.pay_type,
                                )?.name || ''
                              }
                              status={'checked'}
                            />
                          ) : (
                            <RadioButton.Group
                              dense
                              onValueChange={newValue => {
                                setMediaEvidencePago2({
                                  ...mediaEvidencePago2,
                                  pay_type: newValue,
                                });
                                saveMedia([], 6, {
                                  ...mediaEvidencePago2,
                                  pay_type: newValue,
                                });
                              }}
                              value={mediaEvidencePago2?.pay_type}>
                              {metodosPago.map(metodPago => (
                                <RadioButton.Item
                                  dense
                                  key={metodPago.id}
                                  label={metodPago.name}
                                  value={metodPago.id}
                                />
                              ))}
                            </RadioButton.Group>
                          )}
                        </View>

                        <View
                          style={{
                            marginTop: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <CoreTextInput
                            multiline
                            value={mediaEvidencePago2?.description || ''}
                            onChangeText={val =>
                              setMediaEvidencePago2({
                                ...mediaEvidencePago2,
                                description: val,
                              })
                            }
                            label="Observaciones"
                            mode="outlined"
                            editable={
                              (appStoreUserProfile.id ===
                                serviceData?.customer_id ||
                                appStoreUserProfile.id ===
                                  serviceData?.technical_id ||
                                appStoreUserProfile.type === 1) &&
                              serviceData?.customer_state === 2
                            }
                            dense
                            style={{flex: 1}}
                          />
                          {(appStoreUserProfile.id ===
                            serviceData?.technical_id ||
                            appStoreUserProfile.id ===
                              serviceData?.customer_id ||
                            appStoreUserProfile.type === 1) &&
                          serviceData?.customer_state === 2 ? (
                            <>
                              <IconButton
                                style={{padding: 5}}
                                icon="content-save"
                                mode="contained"
                                size={20}
                                onPress={() => saveMedia(mediaEvidencePago2, 6)}
                              />
                            </>
                          ) : (
                            <></>
                          )}
                        </View>
                      </>
                    ) : (
                      <></>
                    )}

                    {/*  */}
                </View>
                <CoreText />
                <CoreText />
                <CoreText />
                <CoreText />
                <CoreText />
                <CoreText />
                <CoreText />
              </View>
            </>
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
        {showContent ? (
          <>
            <View style={{paddingHorizontal: 10, paddingVertical: 5}}>
              {serviceData?.customer_state === 1 &&
              serviceData?.state === 5 &&
              (appStoreUserProfile.id === serviceData?.customer_id ||
                appStoreUserProfile.type === 1) &&
              serviceCotizacion?.state !== 3 ? (
                <>
                  {appStoreUserProfile.id === serviceData?.customer_id ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 5,
                      }}>
                      <CoreButton
                        style={{
                          flex: 1,
                          backgroundColor: themeData.colors.asistectSec,
                        }}
                        mode="contained"
                        compact
                        onPress={() => {
                          Linking.openURL(
                            `tel:${asistecData.contact_number_1}`,
                          );
                        }}>
                        Ponerse en contacto
                      </CoreButton>
                    </View>
                  ) : (
                    <></>
                  )}

                  <View
                    style={{
                      flexDirection: 'row',
                      // alignItems: 'center',
                      justifyContent: 'space-around',
                    }}>
                    <CoreButton
                      style={{
                        flex: 1,
                        backgroundColor: themeData.colors.error,
                      }}
                      mode="contained"
                      onPress={() => waitCot()}>
                      En espera
                    </CoreButton>
                    <CoreButton
                      style={{
                        flex: 1,
                        // backgroundColor: themeData.colors.asistectSec,
                      }}
                      mode="contained"
                      onPress={() => acceptCot()}>
                      Aceptar cotizacion
                    </CoreButton>
                  </View>
                </>
              ) : (
                <></>
              )}

              {serviceData?.state === 8 || serviceData?.customer_state === 2 ? (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingVertical: 5,
                    }}>
                    <CoreButton
                      style={{
                        flex: 1,
                        // backgroundColor: themeData.colors.asistectSec,
                      }}
                      mode="contained"
                      compact
                      onPress={() => {
                        openBottomSheetInfoPayment();
                      }}>
                      Informacion Pago
                    </CoreButton>
                  </View>
                </>
              ) : (
                <></>
              )}

              {serviceData?.customer_state === 1 &&
              serviceData?.state === 7 &&
              appStoreUserProfile.type === 3 &&
              appStoreUserProfile.id === serviceData?.customer_id ? (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingVertical: 5,
                    }}>
                    <CoreButton
                      style={{
                        flex: 1,
                        // backgroundColor: themeData.colors.asistectSec,
                      }}
                      mode="contained"
                      compact
                      onPress={() => {
                        goToServiceActa();
                      }}>
                      Validar acta de serv.
                    </CoreButton>
                  </View>
                </>
              ) : (
                <></>
              )}

              {
                // true
                (appStoreUserProfile?.id === serviceData?.technical ||
                  appStoreUserProfile?.type === 1) &&
                serviceData?.state === 4 ? (
                  <>
                    <CoreButton
                      mode="contained"
                      onPress={() => onPauseService()}
                      style={{backgroundColor: themeData?.colors?.error}}
                      contentStyle={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'center',
                        alignContent: 'center',
                      }}
                      icon="cog-pause-outline">
                      Parar servicio
                    </CoreButton>
                  </>
                ) : (
                  <></>
                )
              }

              {serviceData?.customer_state === 1 &&
              ((serviceData?.technical_state === 3 &&
                appStoreUserProfile.id === serviceData?.technical_id) ||
                appStoreUserProfile?.type === 1) &&
              (serviceData?.state < 10 || serviceData?.state === 12) ? (
                <>
                  <CoreButton
                    style={{
                      backgroundColor: themeData.colors.asistectSec,
                    }}
                    mode="contained"
                    onPress={() => changeStateOrder()}>
                    {serviceData?.state === 1 ||
                    serviceData?.state === 2 ||
                    serviceData?.state === 12
                      ? 'Iniciar'
                      : serviceData?.state === 3
                      ? 'Llegada'
                      : serviceData?.state === 4
                      ? 'Cotizar'
                      : serviceData?.state === 5
                      ? 'Iniciar Ejecucion'
                      : serviceData?.state === 6
                      ? 'Finalizar Ejecucion'
                      : serviceData?.state === 7
                      ? 'Validar acta de serv.'
                      : serviceData?.state === 8
                      ? 'Pagar'
                      : serviceData?.state === 9
                      ? 'Finalizar'
                      : serviceData?.state === 10
                      ? 'Finalizado'
                      : '-'}
                  </CoreButton>
                </>
              ) : (
                <></>
              )}
            </View>
          </>
        ) : (
          <></>
        )}

        <CoreBottomSheet
          ref={bottomSheetActionsRef}
          snapPointsLst={['25%']}
          modalContent={() => (
            <ListActions
              ref={formActionsRef}
              onAction={onSelectAction}
              showActions={
                appStoreUserProfile?.type === 1 ||
                (serviceData?.state === 5 &&
                  appStoreUserProfile.type !== 3 &&
                  serviceCotizacion?.state !== 3)
              }
            />
          )}
        />

        <CoreBottomSheet
          ref={bottomSheetFormItemCot}
          snapPointsLst={['75%']}
          modalContent={() => (
            <FormItemCotizacion
              ref={formItemCotizacionRef}
              loading={loadingList}
              onSaveItemCot={saveIemCot}
              onClose={closeBottomSheet}
            />
          )}
        />

        <CoreBottomSheet
          ref={bottomSheetFormObs}
          snapPointsLst={['65%']}
          modalContent={() => (
            <FormObsCotizacion
              ref={formObsCotizacionRef}
              loading={loadingList}
              onSaveItem={saveIemObs}
              onClose={closeBottomSheetFormObs}
            />
          )}
        />

        <CoreBottomSheet
          ref={bottomSheetFormMedia}
          snapPointsLst={['65%']}
          modalContent={() => (
            <FormMedia
              ref={formMediaRef}
              loading={loadingList}
              onSave={saveMedia}
              onClose={closeBottomSheetFormMedia}
            />
          )}
        />

        <CoreBottomSheet
          ref={bottomSheetInfoPaymentRef}
          snapPointsLst={['65%']}
          modalContent={() => (
            <FormInfoPayment onClose={closeBottomSheetInfoPayment} />
          )}
        />
      </AppLayout>
    </>
  );
}

export default AppView;
