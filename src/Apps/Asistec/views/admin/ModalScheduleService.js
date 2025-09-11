import * as React from 'react';
import {
  // ScrollView,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  CoreHelperText,
  CoreImageModal,
  CoreIconMaterialCommunity,
  CoreIconMaterial,
  CoreBottomSheetModal,
  CoreBottomSheet,
} from '@src/components/';
import {Switch, List, Divider, Searchbar, IconButton} from 'react-native-paper';
import {useCoreReactHookForm} from '@src/hooks/CoreReactHookForm';
import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import {ScrollView} from 'react-native-gesture-handler';
import {
  ServiceModel,
  UserModel,
  ServiceOrderModel,
  convertTimestamp,
  ServiceOrderMediaModel,
  getStorageApp,
  NotificationsLogsModel,
  CitiesConfigModel,
} from '@src/Apps/Asistec/utils/firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import {useCoreTheme} from '@src/themes';
import DatePicker from 'react-native-date-picker';
import {
  core_print_datetime,
  core_print_date,
  core_print_time,
} from '@src/utils/core_dates';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useAppStore} from '@src/store';
import NavigationService from '@src/navigation/NavigationService';
import AppConfig from '@src/app.config';

import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';
import AsistecPickLocation from '@src/Apps/Asistec/components/AsistecPickLocation';

const asistecData = AppConfig.asistec_data;

const ContentList = React.memo(
  ({items = [], loading, type, onSelect, onClose, onSearch}) => {
    const {themeData} = useCoreTheme();
    const [searchQuerie, setSearchQuery] = React.useState(null);

    const onSelectItem = item => {
      onSelect(item);
    };

    const onSearchQuery = () => {
      onSearch(searchQuerie);
    };

    React.useEffect(() => {
      setSearchQuery(null);
    }, [type]);

    return (
      <View style={{flex: 1, paddingHorizontal: 10}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignContent: 'center',
          }}>
          <CoreText>
            Seleccionar{' '}
            {type === 'service'
              ? 'Servicio'
              : type === 'technical'
              ? 'Tecnico'
              : type === 'customer'
              ? 'Cliente'
              : type === 'hour'
              ? 'Hora'
              : type === 'city'
              ? 'Ciudad'
              : ''}
          </CoreText>
          <Pressable onPress={() => onClose()} style={{padding: 5}}>
            <CoreText style={{color: themeData.colors.error}}>Cerrar</CoreText>
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
          <View style={{flex: 1, paddingTop: 20}}>
            <ScrollView style={{flex: 1}}>
              {type === 'customer' ||
              type === 'technical' ||
              type === 'city' ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <BottomSheetTextInput
                    placeholder="Buscar..."
                    // ref={inputRef}
                    value={searchQuerie}
                    onChangeText={setSearchQuery}
                    style={{
                      flex: 1,
                      backgroundColor: '#fff',
                      borderColor: '#000',
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 2,
                      marginVertical: 0,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    // onFocus={() => setIsFocused(true)}
                    // onBlur={() => setIsFocused(false)}
                  />
                  <IconButton
                    style={{marginHorizontal: 10}}
                    icon={() => <CoreIconMaterial name="search" size={16} />}
                    mode="contained"
                    size={16}
                    onPress={() => onSearchQuery()}
                  />
                </View>
              ) : (
                <></>
              )}

              {items.map(item => (
                <View key={item.id}>
                  <List.Item
                    title={
                      type === 'service'
                        ? item.name
                        : type === 'technical'
                        ? item.full_name
                        : type === 'customer'
                        ? item.full_name
                        : type === 'hour'
                        ? item.name
                        : type === 'city'
                        ? item.name
                        : ''
                    }
                    right={props => (
                      <List.Icon {...props} icon="chevron-right" />
                    )}
                    onPress={() => onSelectItem(item)}
                  />
                  <Divider />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  },
  // No need for a custom comparison function in this case
);

function AppView({route, navigation}) {
  const params = route.params;
  const {themeData} = useCoreTheme();
  const {appStoreUserProfile} = useAppStore();

  const {useForm, Controller, setRules} = useCoreReactHookForm();

  const [showContent, setShowContent] = React.useState(false);

  const [userData, setUserData] = React.useState(null);
  const [serviceData, setServiceData] = React.useState(null);
  const [serviceSelected, setServiceSelected] = React.useState(null);
  const [customerSelected, setCustomerSelected] = React.useState(null);
  const [technicalSelected, setTechnicalSelected] = React.useState(null);
  const [reciverFullName, setReciverFullName] = React.useState(null);
  const [reciverPhone, setReciverPhone] = React.useState(null);
  const [mediaDescription, setMediaDescription] = React.useState(null);

  const [locAddress, setLocAddress] = React.useState('');
  const [locAddressRef, setLocAddressRef] = React.useState('');

  const [locAddressCoords, setLocAddressCoords] = React.useState(null);

  const [dateSelected, setDateSelected] = React.useState(new Date());

  const [hourSelected, setHourSelected] = React.useState(null);

  const [citySelected, setCitySelected] = React.useState(null);

  const [listFilesQueue, setListFilesQueue] = React.useState([]);
  const [upFilesQueue, setUpFilesQueue] = React.useState([]);

  const [mediaBook, setMediaBook] = React.useState([]);

  const [openPikerDate, setOpenPikerDate] = React.useState(false);
  const [openPikerTime, setOpenPikerTime] = React.useState(false);

  const [onHabilitar, setOnHabilitar] = React.useState(false); // si el cliente esta habilitando la orden

  const [loadingList, setLoadingList] = React.useState(false);
  const [itemsBottomSheet, setItemsBottomSheet] = React.useState([]);

  const [bottomSheetType, setBottomSheetType] = React.useState(null);

  const layoutRef = React.useRef(null);
  const coreBottomSheetRef = React.useRef(null);
  const bottomSheetRefLocation = React.useRef(null);
  const asistecPickLocationRef = React.useRef(null);

  const openBottomSheet = async () => {
    coreBottomSheetRef.current.open();
  };

  const closeBottomSheet = async () => {
    coreBottomSheetRef.current.close();
  };

  let {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      code: '',
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      setOnHabilitar(params?.habilitar || false);
      setServiceDataFnt();
      return () => {
        setShowContent(false);
        setUserData([]);
        setOnHabilitar(false);
      };
    }, [params]),
  );

  const setServiceDataFnt = async () => {
    const service = await ServiceOrderModel.getServiceOrderById(
      params?.service?.id,
    );
    setServiceData(service);
    setServiceSelected(params?.service_selected || service?.service || null);
    setCustomerSelected(service?.customer || null);
    setTechnicalSelected(service?.technical || null);
    setReciverFullName(service?.receiver_full_name || '');
    setReciverPhone(service?.receiver_phone || '');
    setMediaDescription(service?.book_obs || '');
    if (params?.habilitar) {
      setDateSelected(new Date());
      setHourSelected(null);
    } else {
      setDateSelected(
        service?.date
          ? new Date(convertTimestamp(service?.date))
          : new Date() || new Date(),
      );
      setHourSelected(
        asistecData.services_order_book_times.find(
          x => x.id === service?.hour,
        ) || {},
      );
    }
    setLocAddress(service?.loc_address || '');
    setLocAddressRef(service?.loc_address_ref || '');
    setLocAddressCoords(service?.loc_address_coords || {});
    setCitySelected(service?.city || {});
    if (service?.id) {
      await getMediaBook(service?.id);
    }
    setShowContent(true);
  };

  const getMediaBook = async (service_id = serviceData.id) => {
    const data = await ServiceOrderMediaModel.get({
      service_order_id: service_id,
      type: 1,
    });
    setMediaBook(data[0] || []);
  };

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
      if (response.didCancel || response.errorCode) {
        layoutRef?.current?.setSnack({
          state: true,
          message: `Error ${response?.errorCode ? response.errorCode : ''}`,
          type: 'error',
        });
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
      if (response.didCancel || response.errorCode) {
        layoutRef?.current?.setSnack({
          state: true,
          message: `Error ${response?.errorCode ? response.errorCode : ''}`,
          type: 'error',
        });
      } else {
        setListFilesQueue([...listFilesQueue, response.assets[0]]);
      }
    });
  };

  const renderFileUriBook = file => {
    // render media ya suida
    return (
      <View key={file?.name} style={{position: 'relative'}}>
        <CoreImageModal
          source={{
            uri: file?.url
              ? file?.url
              : 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
          }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 10,
          }}
        />
      </View>
    );
  };

  const renderFileUri = file => {
    return (
      <View key={file.fileName} style={{position: 'relative'}}>
        <CoreImageModal
          source={{
            uri: file.uri
              ? file.uri
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
            top: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 15,
          }}
          onPress={() => deleteFileUri(file)}>
          <CoreIconMaterialCommunity
            name="close-circle"
            size={25}
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

  const openModal = async type => {
    let data;
    setLoadingList(true);
    setBottomSheetType(type);
    openBottomSheet();
    setItemsBottomSheet([]);
    if (type === 'service') {
      data = await ServiceModel.getAllServices();
    }
    if (type === 'customer') {
      data = await UserModel.getAllCustomers();
    }
    if (type === 'technical') {
      data = await UserModel.getAllTechnical();
    }
    if (type === 'city') {
      data = await CitiesConfigModel.listAll();
      console.log('data', data);
    }
    if (type === 'hour') {
      data = await ServiceOrderModel.getServiceOrderDisponibilityHours({
        service_order_id: serviceData?.id,
        service_id: serviceSelected?.id,
        date: dateSelected,
      });
    }
    setItemsBottomSheet(data);
    setLoadingList(false);
  };

  const onSelectItemBottomSheet = item => {
    if (bottomSheetType === 'service') {
      setServiceSelected(item);
      setHourSelected(null);
    }
    if (bottomSheetType === 'customer') {
      setCustomerSelected(item);
      setLocAddress(item.loc_address || '');
      setLocAddressRef(item.loc_address_ref || '');
      setLocAddressCoords(item.loc_address_coords);
    }
    if (bottomSheetType === 'technical') {
      setTechnicalSelected(item);
    }
    if (bottomSheetType === 'hour') {
      setHourSelected(item);
    }
    if (bottomSheetType === 'city') {
      setCitySelected(item);
    }
    onCloseBottomSheet();
  };
  const onCloseBottomSheet = () => {
    closeBottomSheet();
    setItemsBottomSheet([]);
    setBottomSheetType(null);
  };

  const onSave = async () => {
    let dataSend = {
      service: {
        id: serviceSelected?.id || '',
        name: serviceSelected?.name || '',
      },
      customer: {
        id: customerSelected?.id || '',
        full_name: customerSelected?.full_name || '',
        phone: customerSelected?.phone || '',
      },
      technical:
        {
          id: technicalSelected?.id || '',
          full_name: technicalSelected?.full_name || '',
          phone: technicalSelected?.phone || '',
        } || '',
      service_id: serviceSelected?.id || '',
      customer_id: customerSelected?.id || '',
      technical_id: technicalSelected?.id || '',
      receiver_full_name: reciverFullName,
      receiver_phone: reciverPhone || '',
      date: dateSelected || '',
      hour: hourSelected?.id || '',
      book_obs: mediaDescription || '',
      loc_address: locAddress || '',
      loc_address_ref: locAddressRef || '',
      loc_address_coords: locAddressCoords || {},
      city_id: citySelected?.id || '',
      city: {
        id: citySelected?.id || '',
        name: citySelected?.name || '',
      },
    };

    if (appStoreUserProfile.type === 2) {
      dataSend.technical_state = 3;
      dataSend.technical_id = appStoreUserProfile.id;
      dataSend.technical = {
        id: appStoreUserProfile?.id || '',
        full_name: appStoreUserProfile?.full_name || '',
        phone: appStoreUserProfile?.phone || '',
      };
    }

    if (appStoreUserProfile.type === 3) {
      dataSend.customer_id = appStoreUserProfile.id;
      dataSend.customer = {
        id: appStoreUserProfile?.id || '',
        full_name: appStoreUserProfile?.full_name || '',
        phone: appStoreUserProfile?.phone || '',
      };
    }

    if (!params?.service?.id) {
      dataSend.state = 1;
      dataSend.is_active = true;
    }

    if (
      !dataSend?.service?.id ||
      !dataSend.date ||
      dataSend.date === '' ||
      // !dataSend.customer_id ||
      // dataSend.customer_id === '' ||
      !dataSend.hour ||
      dataSend.hour === ''
    ) {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Campos incorrectos!',
        type: 'error',
      });
      return;
    }

    layoutRef?.current?.setLoading({state: true});

    if (onHabilitar) {
      dataSend.customer_state = 1;
    }
    // dataSend.book_media = [...mediaBook, ...updatedUpFilesQueue];

    let order = null;

    if (params?.service?.id) {
      dataSend.id = params?.service?.id;
    }

    const technicalDisponibility =
      await ServiceOrderModel.getTechnicalDisponibility(dataSend);

    if (technicalDisponibility?.state) {
      if (params?.service?.id) {
        dataSend.id = params?.service?.id;
        order = await ServiceOrderModel.updateServiceOrder(dataSend);
      } else {
        order = await ServiceOrderModel.createServiceOrder(dataSend);
      }
      if (order) {
        //sube media
        const updatedUpFilesQueue = [];
        for (const image of listFilesQueue) {
          const contents = await uploadImage(image);
          updatedUpFilesQueue.push(contents);
        }
        const dataSendMedia = {
          service_order_id: order.id,
          description: mediaBook?.description || '',
          type: 1,
          media: [...(mediaBook?.media || []), ...updatedUpFilesQueue]?.filter(
            x => x !== null,
          ),
        };
        if (mediaBook?.id) {
          dataSendMedia.id = mediaBook?.id;
        }

        let mediaData = null;
        if (dataSendMedia && dataSendMedia?.id) {
          mediaData = await ServiceOrderMediaModel.update(dataSendMedia).catch(
            e => {
              layoutRef?.current?.setSnack({
                state: true,
                message: 'Error subiendo media.',
                type: 'error',
              });
            },
          );
        }
        if (dataSendMedia && !dataSendMedia?.id) {
          mediaData = await ServiceOrderMediaModel.create(dataSendMedia).catch(
            e => {
              layoutRef?.current?.setSnack({
                state: true,
                message: 'Error subiendo media.',
                type: 'error',
              });
            },
          );
        }

        if (mediaData) {
          getMediaBook(order?.service_id);
        }

        setListFilesQueue([]);
        setUpFilesQueue([]);
        // await setServiceDataFnt();
        layoutRef?.current?.setSnack({
          state: true,
          message: 'Correcto.',
        });

        // notifications
        let notPayload = {
          model_type: 1,
        };
        // creando orden
        if (!params?.service?.id || params?.service?.id === '') {
          // admin crea orden
          if (appStoreUserProfile?.type === 1) {
            // notificacion a tecnico/tecnicos
            if (order?.technical_id && order?.technical_id !== '') {
              NotificationsLogsModel.saveLogNotification({
                data: {
                  from_user_id: appStoreUserProfile?.id || null,
                  to_user_id: order?.technical_id,
                  message: `Servicio ${order?.service?.name || '-'} #${
                    order?.consecutive || '-'
                  } te ha sido asignado.`,
                  ...notPayload,
                  type: 2,
                  payload: {service_order_id: order.id},
                },
              });
            } else {
              NotificationsLogsModel.saveLogNotification({
                data: {
                  from_user_id: appStoreUserProfile?.id || null,
                  message: `Servicio ${order?.service?.name || '-'} #${
                    order?.consecutive || '-'
                  } disponible.`,
                  ...notPayload,
                  type: 2,
                  payload: {service_order_id: order.id},
                },
                to_user_type: 2,
              });
            }
            // notificacion a cliente
            if (order?.customer_id && order?.customer_id !== '') {
              NotificationsLogsModel.saveLogNotification({
                data: {
                  from_user_id: appStoreUserProfile?.id || null,
                  to_user_id: order?.customer_id,
                  message: `Tu servicio ${order?.service?.name || '-'} #${
                    order?.consecutive || '-'
                  } fue agendado.`,
                  ...notPayload,
                  payload: {service_order_id: order.id},
                },
              });
            }
          }
          // tecnico crea orden
          if (appStoreUserProfile?.type === 2) {
            // notificacion a admins
            NotificationsLogsModel.saveLogNotification({
              data: {
                from_user_id: appStoreUserProfile?.id || null,
                message: `Servicio ${order?.service?.name || '-'} #${
                  order?.consecutive || '-'
                } fue creado.`,
                ...notPayload,
                payload: {service_order_id: order.id},
              },
              to_user_type: 1,
            });
            // notificacion a cliente
            if (order?.customer_id && order?.customer_id !== '') {
              NotificationsLogsModel.saveLogNotification({
                data: {
                  from_user_id: appStoreUserProfile?.id || null,
                  to_user_id: order?.customer_id,
                  message: `Tu servicio ${order?.service?.name || '-'} #${
                    order?.consecutive || '-'
                  } fue agendado.`,
                  ...notPayload,
                  payload: {service_order_id: order.id},
                },
              });
            }
          }

          // cliente crea orden
          if (appStoreUserProfile?.type === 3) {
            // notificacion a admins
            NotificationsLogsModel.saveLogNotification({
              data: {
                from_user_id: appStoreUserProfile?.id || null,
                message: `Servicio ${order?.service?.name || '-'} #${
                  order?.consecutive || '-'
                } fue creado.`,
                ...notPayload,
                payload: {service_order_id: order.id},
              },
              to_user_type: 1,
            });
            // notificacion a tecnico/tecnicos
            if (order?.technical_id && order?.technical_id !== '') {
              NotificationsLogsModel.saveLogNotification({
                data: {
                  from_user_id: appStoreUserProfile?.id || null,
                  to_user_id: order?.technical_id,
                  message: `Servicio ${order?.service?.name || '-'} #${
                    order?.consecutive || '-'
                  } te ha sido asignado.`,
                  ...notPayload,
                  type: 2,
                  payload: {service_order_id: order.id},
                },
              });
            } else {
              NotificationsLogsModel.saveLogNotification({
                data: {
                  from_user_id: appStoreUserProfile?.id || null,
                  message: `Servicio ${order?.service?.name || '-'} #${
                    order?.consecutive || '-'
                  } disponible.`,
                  ...notPayload,
                  payload: {service_order_id: order.id},
                },
                to_user_type: 2,
              });
            }
          }
        }
        // actualizando orden
        if (!(!params?.service?.id || params?.service?.id === '')) {
          if (onHabilitar) {
            // notificacion a admins
            NotificationsLogsModel.saveLogNotification({
              data: {
                from_user_id: appStoreUserProfile?.id || null,
                message: `Servicio ${order?.service?.name || '-'} #${
                  order?.consecutive || '-'
                } habilitado por cliente.`,
                service_order_id: order?.id,
                type: 8,
                payload: {service_order_id: order.id},
              },
              to_user_type: 1,
            });
            if (serviceData?.technical_id && serviceData?.technical_id !== '') {
              NotificationsLogsModel.saveLogNotification({
                data: {
                  from_user_id: appStoreUserProfile?.id || null,
                  message: `Servicio ${order?.service?.name || '-'} #${
                    order?.consecutive || '-'
                  } habilitado por cliente.`,
                  service_order_id: order?.id,
                  type: 8,
                  to_user_id: serviceData?.technical_id,
                  payload: {service_order_id: order.id},
                },
              });
            }
          }
        }
        if (onHabilitar) {
          NavigationService.navigate({
            name: 'ModalServiceTracking',
            params: {service: {id: order?.id}},
          });
        } else {
          NavigationService.navigate({name: 'AdminServicesListView'});
        }
      }
      setOnHabilitar(false);
    } else {
      layoutRef?.current?.setSnack({
        state: true,
        message: technicalDisponibility?.message || '',
        type: 'error',
      });
    }

    layoutRef?.current?.setLoading({state: false});
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
          (res = {
            url: downUrl,
            name: filename,
          }),
            setUpFilesQueue([
              ...upFilesQueue,
              {
                url: downUrl,
                name: filename,
              },
            ]);
        })
        .catch(error => {
          console.error('Error uploading image:', error);
        });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    return res;
  };

  const openModalSetLocation = () => {
    bottomSheetRefLocation.current?.open();
    asistecPickLocationRef?.current?.init();
  };

  const closeModalSetLocation = () => {
    bottomSheetRefLocation.current?.close();
  };

  const saveModalSetLocation = async data => {
    bottomSheetRefLocation.current?.close();
    setLocAddressCoords(data.coords);
    setLocAddress(data.address);
  };

  const onSearchList = async queryText => {
    let data;
    setLoadingList(true);
    if (bottomSheetType === 'customer') {
      data = await UserModel.getAllCustomers({search_text: queryText});
    }
    if (bottomSheetType === 'technical') {
      data = await UserModel.getAllTechnical({search_text: queryText});
    }
    if (bottomSheetType === 'city') {
      data = await CitiesConfigModel.listAll({search_text: queryText});
    }
    setItemsBottomSheet(data);
    setLoadingList(false);
  };

  return (
    <>
      <AppLayout ref={layoutRef} hiddenBottomBarMenu>
        {/* <CoreBottomSheetModal
        ref={coreBottomSheetRef}
        height={'70%'}
        modalContent={
          <ContentList
            items={itemsBottomSheet}
            loading={loadingList}
            type={bottomSheetType}
            onClose={onCloseBottomSheet}
            onSelect={onSelectItemBottomSheet}
          />
        }> */}
        <ScrollView>
          {showContent ? (
            <>
              <View style={{paddingHorizontal: 10}}>
                <KeyboardAvoidingView>
                  <View>
                    <Pressable
                      onPress={() => openModal('service')}
                      style={{marginTop: 10}}>
                      <CoreTextInput
                        value={serviceSelected?.name || ''}
                        label={`Servicio ${
                          serviceData?.consecutive &&
                          serviceData?.consecutive !== ''
                            ? '#' + serviceData?.consecutive
                            : ''
                        } (*)`}
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
                          onPress={() => openModal('customer')}
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

                    {appStoreUserProfile?.type === 1 ? (
                      <>
                        <Pressable
                          onPress={() => openModal('technical')}
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
                    <Pressable
                      onPress={() => openModal('city')}
                      style={{marginTop: 10}}>
                      <CoreTextInput
                        value={citySelected?.name || ''}
                        label={'Ciudad'}
                        mode="outlined"
                        editable={false}
                        pointerEvents="none"
                        dense
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => openModalSetLocation()}
                      style={{marginTop: 10}}>
                      <CoreTextInput
                        label="Ubicacion"
                        mode="outlined"
                        value={
                          locAddress && locAddress.length > 30
                            ? locAddress.substring(0, 30) + '...'
                            : locAddress || ''
                        }
                        editable={false}
                        style={{
                          backgroundColor: 'transparent',
                        }}
                        pointerEvents="none"
                        dense
                      />
                    </Pressable>
                    <CoreTextInput
                      multiline
                      label="Ref. adicionales ubicacion"
                      mode="outlined"
                      value={
                        locAddressRef
                        // locAddressRef && locAddressRef.length > 30
                        //   ? locAddressRef.substring(0, 30) + '...'
                        //   : locAddressRef || ''
                      }
                      onChangeText={setLocAddressRef}
                      style={{
                        marginTop: 10,
                        backgroundColor: 'transparent',
                      }}
                      dense
                    />
                    <CoreTextInput
                      style={{marginTop: 10}}
                      value={reciverFullName}
                      onChangeText={setReciverFullName}
                      label="Nombre completo de Quien recibe"
                      mode="outlined"
                      dense
                    />
                    <CoreTextInput
                      style={{marginTop: 10}}
                      value={reciverPhone}
                      onChangeText={setReciverPhone}
                      label="Telefono de Quien recibe"
                      mode="outlined"
                      keyboardType="phone-pad"
                      // left={<CoreTextInput.Affix text="+57" />}
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
                        onPress={() => setOpenPikerDate(true)}>
                        <CoreTextInput
                          value={core_print_date(dateSelected?.toISOString())}
                          label="Fecha (*)"
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
                        onPress={() => openModal('hour')}
                        style={{flex: 1, paddingHorizontal: 3}}>
                        <CoreTextInput
                          value={
                            asistecData.services_order_book_times.find(
                              x => x.id === hourSelected?.id,
                            )?.name || ''
                          }
                          label="Hora (*)"
                          mode="outlined"
                          editable={false}
                          pointerEvents="none"
                          dense
                        />
                      </Pressable>
                      <DatePicker
                        mode="date"
                        minimumDate={new Date()}
                        modal
                        open={openPikerDate}
                        date={dateSelected}
                        onConfirm={date => {
                          setOpenPikerDate(false);
                          setDateSelected(date);
                          setHourSelected(null);
                        }}
                        onCancel={() => {
                          setOpenPikerDate(false);
                        }}
                      />
                    </View>

                    <CoreText style={{marginTop: 10}} variant="titleLarge">
                      Informacion adicional
                    </CoreText>

                    <CoreText style={{marginTop: 10}}>
                      Agrega imagenes de los recursos afectados.
                    </CoreText>
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
                        <CoreIconMaterialCommunity
                          name="camera-plus"
                          size={40}
                          style={
                            {
                              // color:
                            }
                          }
                        />
                        <CoreText>Caputar imagen</CoreText>
                      </Pressable>

                      <Pressable
                        style={{
                          flex: 1,
                          paddingHorizontal: 3,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onPress={() => chooseImage(true)}>
                        <CoreIconMaterialCommunity
                          name="file-image-plus"
                          size={40}
                          style={
                            {
                              // color:
                            }
                          }
                        />
                        <CoreText>Seleccionar imagen</CoreText>
                      </Pressable>
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
                        {listFilesQueue.map(img => (
                          <View
                            key={img.uri || img.fileName}
                            style={{marginHorizontal: 5}}>
                            {renderFileUri(img)}
                          </View>
                        ))}
                      </ScrollView>
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
                        {mediaBook?.media?.map(img => (
                          <View
                            key={img?.url || img?.name}
                            style={{marginHorizontal: 5}}>
                            {renderFileUriBook(img)}
                          </View>
                        ))}
                      </ScrollView>
                    </View>

                    <View
                      style={{
                        marginTop: 10,
                      }}>
                      <CoreText>
                        Danos una breve descripcion del recurso afectado,
                        consideraciones a tener en cuenta o simplemente describe
                        las imagenes cargadas.
                      </CoreText>
                      <CoreTextInput
                        multiline
                        value={mediaBook?.description}
                        onChangeText={val => {
                          setMediaBook({
                            ...mediaBook,
                            description: val,
                          });
                        }}
                        label="Observaciones"
                        mode="outlined"
                        style={{
                          marginTop: 10,
                        }}
                      />
                    </View>
                  </View>
                </KeyboardAvoidingView>
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
          <View style={{paddingVertical: 10, paddingHorizontal: 10}}>
            <CoreButton mode="contained" onPress={() => onSave()}>
              {/* <CoreButton mode="contained" onPress={handleSubmit(handleSubmitFnt)}> */}
              Guardar
            </CoreButton>
            <CoreButton
              mode="contained"
              buttonColor={themeData.colors.asistectSec}
              // textColor={themeData.colors.asistectSec}
              onPress={() => navigation.goBack()}
              dense>
              Cerrar
            </CoreButton>
          </View>
        ) : (
          <></>
        )}

        <CoreBottomSheet
          ref={coreBottomSheetRef}
          snapPointsLst={['75%']}
          modalContent={() => (
            <ContentList
              items={itemsBottomSheet}
              loading={loadingList}
              type={bottomSheetType}
              onClose={onCloseBottomSheet}
              onSelect={onSelectItemBottomSheet}
              onSearch={onSearchList}
            />
          )}
        />

        <CoreBottomSheet
          ref={bottomSheetRefLocation}
          snapPointsLst={['85%']}
          modalContent={() => (
            <AsistecPickLocation
              ref={asistecPickLocationRef}
              dataObject={params?.service}
              onCloseFnt={() => closeModalSetLocation()}
              onSaveFnt={saveModalSetLocation}
              extRegionText={citySelected?.region_text || null}
            />
          )}
        />
        {/* </CoreBottomSheetModal> */}
      </AppLayout>
    </>
  );
}

export default AppView;
