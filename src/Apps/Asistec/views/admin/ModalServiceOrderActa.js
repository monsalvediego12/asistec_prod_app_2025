import * as React from 'react';
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable,
  Modal,
  StyleSheet,
  Linking,
} from 'react-native';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  CoreImage,
  CoreImageModal,
  CoreIconMaterialCommunity,
  CoreBottomSheet,
} from '@src/components/';
import {IconButton, List, DataTable} from 'react-native-paper';
import AppConfig from '@src/app.config';
const asistecData = AppConfig.asistec_data;

import {
  convertTimestamp,
  ServiceOrderModel,
  ServiceOrderMediaModel,
  ServiceOrderActaModel,
  ServiceOrderCotizacionModel,
} from '@src/Apps/Asistec/utils/firebase/firestore';
import {cropText, formatPrice} from '@src/utils/formaters';
import {useFocusEffect} from '@react-navigation/native';
import {useCoreTheme} from '@src/themes';
import {useAppStore} from '@src/store';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import uuid from 'react-native-uuid';
import SignatureScreen from 'react-native-signature-canvas';
import firestore from '@react-native-firebase/firestore';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';

const ListActions = React.memo(
  React.forwardRef(({item, loading, onSaveItem, onAction}, ref) => {
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
      </View>
    );
  }),
);

const FormObs = React.memo(
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
            <View style={{padding: 10, paddingTop: 0}}>
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

        <View style={{paddingVertical: 10}}>
          <CoreButton mode="contained" onPress={() => onSave()}>
            Guardar
          </CoreButton>
        </View>
      </View>
    );
  }),
);

function AppView({route, navigation}) {
  const params = route.params;
  const {appStoreUserProfile} = useAppStore();

  const {themeData} = useCoreTheme();
  
  // Navegar usando NavigationService para ser consistente
  const goBack = () => {
    // Ir siempre a ModalServiceTrackingDetails con el service_id correcto
    NavigationService.navigate({
      name: 'ModalServiceTrackingDetails',
      params: {
        service: {id: params?.service_order_id}
      }
    });
  };

  const layoutRef = React.useRef(null);
  const bottomSheetFormObs = React.useRef(null);
  const formObsRef = React.useRef(null);
  const bottomSheetActionsRef = React.useRef(null);
  const formActionsRef = React.useRef(null);
  const signatureRef = React.useRef(null);

  const [showContent, setShowContent] = React.useState(false);
  const [modalSignatureVisible, setModalSignatureVisible] =
    React.useState(false);
  const [serviceData, setServiceData] = React.useState(null);
  const [serviceActaData, setServiceActaData] = React.useState(null);
  const [mediaAntes, setMediaAntes] = React.useState(null);
  const [mediaDespues, setMediaDespues] = React.useState(null);
  const [itemSelectedAction, setItemSelectedAction] = React.useState(null);
  const [itemTypeAction, setItemTypeAction] = React.useState(null);
  const [serviceCotizacion, setServiceCotizacion] = React.useState(null);

  useFocusEffect(
    React.useCallback(() => {
      // setForm();
      return () => {
        setShowContent(false);
        setServiceActaData(null);
        setServiceData(null);
        setServiceCotizacion(null);
      };
    }, [params]),
  );

  useFocusEffect(
    React.useCallback(() => {
      let servData;
      let unsubscribeService;
      let unsubscribeMediaServiceOrder = () => {};
      let unsubscribeActaServiceOrder = () => {};

      const fetchServiceData = async () => {
        return new Promise((resolve, reject) => {
          unsubscribeService = firestore()
            .collection('services_order')
            .doc(params?.service_order_id)
            .onSnapshot(documentSnapshot => {
              if (!documentSnapshot.exists) {
                return reject('Service data not found');
              }
              servData = {
                id: documentSnapshot.id,
                ...documentSnapshot.data(),
              };
              setServiceData(servData);
              // setServiceSelected(servData.service || null);
              // setCustomerSelected(servData.customer || null);
              // setTechnicalSelected(servData.technical || null);
              // setReciverFullName(servData.receiver_full_name || '');
              // setReciverPhone(servData.receiver_phone || '');
              // setMediaDescription(servData.book_obs || '');
              // setHourSelected(
              //   asistecData.services_order_book_times.find(
              //     x => x.id === servData.hour,
              //   ) || {},
              // );
              // setDateSelected(
              //   servData.date
              //     ? new Date(convertTimestamp(servData.date))
              //     : new Date(),
              // );
              setShowContent(true);
              resolve(servData);
            }, reject);
        });
      };

      const fetchMediaServiceOrder = async serviceId => {
        unsubscribeMediaServiceOrder = firestore()
          .collection('services_order_media')
          .where('service_order_id', '==', serviceId)
          .where('type', 'in', [3, 4])
          .onSnapshot(querySnapshot => {
            const data = querySnapshot?.empty
              ? []
              : querySnapshot?.docs.map(x => ({id: x.id, ...x.data()}));
            for (mediaIndex in data) {
              if (data[mediaIndex].type === 3) {
                setMediaAntes(data[mediaIndex]);
              }
              if (data[mediaIndex].type === 4) {
                setMediaDespues(data[mediaIndex]);
              }
            }
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
            setServiceActaData(data);
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

      const initialize = async () => {
        try {
          const serviceData = await fetchServiceData();
          if (serviceData?.id) {
            await fetchMediaServiceOrder(serviceData.id);
            await fetchActaServiceOrder(serviceData.id);
            await fetchCotServiceOrder(serviceData.id);
          }
        } catch (error) {
          console.error(error);
        }
      };

      initialize();

      return () => {
        if (unsubscribeService) {
          unsubscribeService();
        }
        if (unsubscribeMediaServiceOrder) {
          unsubscribeMediaServiceOrder();
        }
        if (unsubscribeActaServiceOrder) {
          unsubscribeActaServiceOrder();
        }
      };
    }, [params?.service?.id]),
  );

  React.useEffect(() => {
    layoutRef?.current?.setOverlay(modalSignatureVisible);
  }, [modalSignatureVisible]);

  const openBottomSheetFormObs = async item => {
    formObsRef?.current?.setForm(item);
    bottomSheetFormObs?.current?.open();
  };

  const closeBottomSheetFormObs = async () => {
    bottomSheetFormObs.current.close();
  };

  const openBottomSheetActions = async (item, type) => {
    // type, 1 item obs
    // si ya esta firmado no modifica
    if (
      appStoreUserProfile?.type === 3 ||
      serviceData?.state !== 7 ||
      (serviceActaData?.signature_b64 && serviceActaData?.signature_b64 !== '')
    ) {
      return;
    }
    setItemSelectedAction(item);
    setItemTypeAction(type);
    bottomSheetActionsRef.current.open();
  };

  const closeBottomSheetActions = async () => {
    bottomSheetActionsRef.current.close();
  };

  const setForm = async () => {
    let service = null;
    let serviceActa = null;

    if (params?.service_order_id) {
      service = await ServiceOrderModel.getServiceOrderById(
        params.service_order_id,
      );
      serviceActa = await ServiceOrderActaModel.get({
        service_order_id: params.service_order_id,
      });
    }

    setServiceData(service);
    if (serviceActa && serviceActa[0]) {
      setServiceActaData(serviceActa[0]);
    } else {
      setServiceActaData({
        obs: asistecData?.services_order_acta_obs_default?.map(item => ({
          ...item,
          id: uuid.v4(),
        })),
      });
    }
    getMediaAntes(params?.service_order_id);
    getMediaDespues(params?.service_order_id);
    setShowContent(true);
  };

  const getMediaAntes = async (service_id = serviceData.id) => {
    const data = await ServiceOrderMediaModel.get({
      service_order_id: service_id,
      type: 3,
    });
    setMediaAntes(data[0] || null);
  };

  const getMediaDespues = async (service_id = serviceData.id) => {
    const data = await ServiceOrderMediaModel.get({
      service_order_id: service_id,
      type: 4,
    });
    setMediaDespues(data[0] || null);
  };

  const saveServiceActaChanges = async (serviceActa = serviceActaData) => {
    // if (serviceData.state !== 5 || appStoreUserProfile.type === 3) return;
    layoutRef?.current?.setLoading({state: true});
    let dataSend = {
      service_order_id: serviceData.id,
      state: serviceActa?.state || 1,
      signature_url: serviceActa?.signature_url || '',
      signature_b64: serviceActa?.signature_b64 || '',
      signature_date: serviceActa?.signature_date || '',
      obs: serviceActa?.obs || [],
    };

    let order = null;
    if (serviceActa.id) {
      dataSend.id = serviceActa.id;
      order = await ServiceOrderActaModel.update(dataSend);
    } else {
      order = await ServiceOrderActaModel.create(dataSend);
    }
    if (order) {
      // await setForm();
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
      closeBottomSheetFormObs();
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const saveIemObs = async item => {
    const serviceActa = {...serviceActaData};
    const itemN = {...item};
    if (itemN.id) {
      let nuevaLista = serviceActa?.obs?.map(obj => {
        if (obj.id === itemN.id) {
          return {...obj, ...itemN};
        }
        return obj;
      });
      serviceActa.obs = nuevaLista;
    } else {
      itemN.id = uuid.v4();
      let itemD = serviceActa?.obs ? [...serviceActa?.obs] : [];
      itemD.push(itemN);
      serviceActa.obs = itemD;
    }
    await saveServiceActaChanges(serviceActa);
  };

  const onSelectAction = async action_id => {
    if (action_id === 2 && itemTypeAction === 1) {
      await deleteObs();
    }
    if (action_id === 1 && itemTypeAction === 1) {
      openBottomSheetFormObs(itemSelectedAction);
    }
    closeBottomSheetActions();
  };

  const deleteObs = async (id = itemSelectedAction.id) => {
    const newObsList = serviceActaData?.obs?.filter(x => x.id !== id) || [];
    let order;
    layoutRef?.current?.setLoading({state: true});
    if (serviceActaData.id) {
      order = await ServiceOrderActaModel.update({
        id: serviceActaData.id,
        obs: newObsList,
      });
    } else {
      setServiceActaData({...serviceActaData, obs: newObsList});
    }
    if (order) {
      // await setForm();
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const onAddSignature = () => {
    if (serviceData?.state !== 7) {
      return;
    }
    setModalSignatureVisible(true);
  };

  const onAcceptSignature = async signature => {
    setModalSignatureVisible(false);
    layoutRef?.current?.setLoading({state: true});
    await saveServiceActaChanges({
      ...serviceActaData,
      signature_b64: signature,
      signature_date: new Date(),
    });
    layoutRef?.current?.setLoading({state: false});
  };

  const onAcceptActa = async () => {
    if (
      !serviceActaData.signature_b64 ||
      serviceActaData.signature_b64 === ''
    ) {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Cliente debe firmar.',
        type: 'error',
      });
      return;
    }
    await saveServiceActaChanges({...serviceActaData, state: 3});
    goBack();
  };
  const onRejectActa = async () => {
    if (
      !serviceActaData.signature_b64 ||
      serviceActaData.signature_b64 === ''
    ) {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Cliente debe firmar.',
        type: 'error',
      });
      return;
    }
    await saveServiceActaChanges({...serviceActaData, state: 2});
    goBack();
  };

  const totalCot = () => {
    let total = 0;
    serviceCotizacion?.items?.map(x => {
      total = Number(total) + Number(x.qty) * Number(x.price);
    });
    return total;
  };

  return (
    <>
      <AppLayout ref={layoutRef} hiddenBottomBarMenu>
        <ScrollView>
          {showContent ? (
            <>
              <View style={{paddingHorizontal: 10, marginBottom: 15}}>
                <KeyboardAvoidingView>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingTop: 10,
                    }}>
                    <View style={{flex: 1}}>
                      <CoreTextInput
                        label="Fecha"
                        dense
                        style={{fontSize: 14, backgroundColor: 'transparent'}}
                        value={`${
                          convertTimestamp(serviceData?.date, 'dd-MM-yyyy') ||
                          '-'
                        } - ${
                          asistecData?.services_order_book_times?.find(
                            x => x.id === serviceData?.hour,
                          )?.name || ''
                        }`}
                        editable={false}
                      />
                      <CoreTextInput
                        label="Cliente"
                        dense
                        style={{fontSize: 14, backgroundColor: 'transparent'}}
                        value={cropText(serviceData?.customer?.full_name, 20)}
                        editable={false}
                      />
                    </View>
                    <View
                      style={{
                        // flex: 1,
                        paddingHorizontal: 10,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <CoreImage
                        style={{
                          width: 100,
                          height: 100,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        source={require('@src/Apps/Asistec/assets/img/cropped-Logo-PNG.png')}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingTop: 10,
                    }}>
                    <CoreText>
                      Por medio de la presente me dirijo a ustedes con el fin de
                      entregarles soporte de las labores realizadas el día{' '}
                      <CoreText style={{fontWeight: 'bold'}}>
                        {convertTimestamp(serviceData?.date, 'dd-MM-yyyy') ||
                          '-'}
                      </CoreText>
                      , visita que fue recibida por{' '}
                      <CoreText style={{fontWeight: 'bold'}}>
                        {serviceData?.customer?.full_name || ''}
                      </CoreText>{' '}
                      y en la cual se evidencia lo siguiente:
                    </CoreText>
                  </View>
                  <>
                    <CoreText
                      style={{
                        marginTop: 10,
                        fontWeight: 'bold',
                      }}
                      variant="titleMedium">
                      Elementos de cotizacion
                    </CoreText>

                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <DataTable>
                        <DataTable.Header>
                          <DataTable.Title>Descripcion</DataTable.Title>
                          <DataTable.Title numberOfLines={2} numeric>
                            Cant.
                          </DataTable.Title>
                          <DataTable.Title numeric>Val. Unit.</DataTable.Title>

                          <DataTable.Title numeric>Total</DataTable.Title>
                        </DataTable.Header>

                        {serviceCotizacion?.items ? (
                          serviceCotizacion?.items?.map(item => (
                            <DataTable.Row
                              key={item.id}
                              // onPress={() =>
                              //   openBottomSheetActionsCot(item, 1)
                              // }
                            >
                              <DataTable.Cell
                                style={{flex: 1}}
                                numberOfLines={10}>
                                <CoreText
                                  numberOfLines={10}
                                  ellipsizeMode="clip">
                                  {item?.name}
                                </CoreText>
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

                        <DataTable.Row>
                          <DataTable.Cell>
                            <CoreText style={{fontWeight: 'bold'}}>
                              Total
                            </CoreText>
                          </DataTable.Cell>
                          <DataTable.Cell numeric>
                            <CoreText style={{fontWeight: 'bold'}}>
                              COP {formatPrice(totalCot(), null)}
                            </CoreText>
                          </DataTable.Cell>
                        </DataTable.Row>
                      </DataTable>
                    </View>
                  </>
                  <CoreText
                    style={{
                      marginTop: 10,
                      fontWeight: 'bold',
                    }}
                    variant="titleMedium">
                    Registro fotografico antes
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
                      {mediaAntes?.length === 0 ? (
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
                            {appStoreUserProfile.id ===
                              serviceData?.technical_id &&
                            serviceData.state === 6 ? (
                              <TouchableOpacity
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  backgroundColor: 'rgba(255, 255, 255, 1)',
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

                  <CoreText
                    style={{
                      marginTop: 10,
                      fontWeight: 'bold',
                    }}
                    variant="titleMedium">
                    Registro fotografico despues
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
                      {mediaDespues?.length === 0 ? (
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
                            {appStoreUserProfile.id ===
                              serviceData?.technical_id &&
                            serviceData.state === 6 ? (
                              <TouchableOpacity
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  backgroundColor: 'rgba(255, 255, 255, 1)',
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
                      flexDirection: 'row',
                      paddingTop: 10,
                    }}>
                    <CoreText
                      style={{
                        marginVertical: 10,
                        fontWeight: 'bold',
                      }}
                      variant="titleMedium">
                      Observaciones y recomendaciones
                    </CoreText>
                    {serviceData?.state === 7 &&
                    !(
                      serviceActaData?.signature_b64 &&
                      serviceActaData?.signature_b64 !== ''
                    ) &&
                    (appStoreUserProfile?.id === serviceData?.technical_id ||
                      appStoreUserProfile?.type === 1) ? (
                      <>
                        <IconButton
                          style={{}}
                          icon="plus"
                          mode="contained"
                          size={16}
                          onPress={() => openBottomSheetFormObs()}
                        />
                      </>
                    ) : (
                      <></>
                    )}
                  </View>

                  {serviceActaData?.obs ? (
                    serviceActaData?.obs?.map(item => (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          openBottomSheetActions(item, 1);
                        }}
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

                  <CoreText style={{paddingTop: 10}}>
                    Para este trabajo, en relación con el decreto 0723 del 2013
                    de la súper intendencia de industria y comercio, se entrega
                    bajo una garantía de 90 días.
                  </CoreText>

                  <View
                    style={{
                      flexDirection: 'row',
                      paddingHorizontal: 5,
                      paddingTop: 10,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        marginHorizontal: 5,
                      }}>
                      <CoreImage
                        style={{
                          width: 150,
                          height: 100,
                          padding: 5,
                          resizeMode: 'contain',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        source={require('@src/Apps/Asistec/assets/img/sample_signature.png')}
                      />
                      <View
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: 'black',
                          width: '100%',
                          marginBottom: 5,
                        }}
                      />
                      <CoreText>
                        {cropText('Jhon Edinson Campos Duran', 20)}
                      </CoreText>
                      <CoreText>Administrador</CoreText>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        marginHorizontal: 5,
                      }}>
                      {serviceActaData?.signature_b64 ? (
                        <>
                          <Pressable onPress={() => onAddSignature()}>
                            <CoreImage
                              style={{
                                width: 150,
                                height: 100,
                                padding: 5,
                                resizeMode: 'contain',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              source={{
                                uri: serviceActaData?.signature_b64
                                  ? serviceActaData?.signature_b64
                                  : 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                              }}
                            />
                          </Pressable>
                        </>
                      ) : (
                        <>
                          <IconButton
                            style={{}}
                            icon="plus"
                            mode="contained"
                            size={16}
                            onPress={() => onAddSignature()}
                          />
                        </>
                      )}
                      <View
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: 'black',
                          width: '100%',
                          marginBottom: 5,
                        }}
                      />
                      <CoreText>
                        {cropText(serviceData?.customer?.full_name, 20)}
                      </CoreText>
                      <CoreText>Cliente</CoreText>
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
          <>
            <View style={{paddingHorizontal: 10, paddingVertical: 5}}>
              {serviceActaData?.state !== 3 &&
              serviceData?.state === 7 &&
              ((appStoreUserProfile?.type === 3 &&
                appStoreUserProfile?.id === serviceData?.customer_id) ||
                appStoreUserProfile?.type === 1) ? (
                <>
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
                        Linking.openURL(`tel:${asistecData.contact_number_1}`);
                      }}>
                      Ponerse en contacto
                    </CoreButton>
                  </View>
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
                      onPress={() => onRejectActa()}>
                      Rechazar
                    </CoreButton>
                    <CoreButton
                      style={{
                        flex: 1,
                        // backgroundColor: themeData.colors.asistectSec,
                      }}
                      mode="contained"
                      onPress={() => onAcceptActa()}>
                      Aceptar
                    </CoreButton>
                  </View>
                </>
              ) : (
                <></>
              )}

              {/* <CoreButton
                mode="contained"
                onPress={() =>
                  NavigationService.navigate({
                    name: 'ModalServiceTracking',
                    params: route.params,
                  })
                }
                style={{backgroundColor: themeData.colors.asistectSec}}>
                Volver
              </CoreButton> */}
            </View>
          </>
        ) : (
          <></>
        )}

        {/* <View style={{paddingVertical: 10}}>
          <CoreButton mode="contained">Guardar</CoreButton>
          <CoreButton
            mode="contained"
            buttonColor={themeData.colors.asistectSec}
            onPress={() => navigation.goBack()}>
            Cerrar
          </CoreButton>
        </View> */}

        <Modal
          animationType="slide"
          presentationStyle="fullScreen"
          // transparent={true}
          visible={modalSignatureVisible}>
          <View
            style={{
              flex: 1,
            }}>
            <SignatureScreen
              style={{
                flex: 1,
                position: 'relative',
              }}
              ref={signatureRef}
              onOK={onAcceptSignature}
              clearText="Limpiar"
              confirmText="Aceptar"
              descriptionText="Firma cliente"
              // webStyle={
              //   '.m-signature-pad--footer {display: none; margin: 0px;}'
              // }
            />
            <Pressable
              style={[
                styles.button,
                styles.buttonClose,
                {
                  marginVertical: 10,
                  marginHorizontal: 10,
                  backgroundColor: themeData.colors.asistectSec,
                },
              ]}
              onPress={() => setModalSignatureVisible(!modalSignatureVisible)}>
              <CoreText style={styles.textStyle}>Cancelar</CoreText>
            </Pressable>
          </View>
        </Modal>

        <CoreBottomSheet
          ref={bottomSheetActionsRef}
          snapPointsLst={['25%']}
          modalContent={() => (
            <ListActions ref={formActionsRef} onAction={onSelectAction} />
          )}
        />

        <CoreBottomSheet
          ref={bottomSheetFormObs}
          snapPointsLst={['65%']}
          modalContent={() => (
            <FormObs
              ref={formObsRef}
              // loading={loadingList}
              onSaveItem={saveIemObs}
              onClose={closeBottomSheetFormObs}
            />
          )}
        />
      </AppLayout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    width: '100%',
    padding: 10,
    borderWidth: 1,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AppView;
