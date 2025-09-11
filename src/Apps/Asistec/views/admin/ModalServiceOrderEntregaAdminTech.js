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
  CoreIconMaterialCommunity,
  CoreBottomSheet,
} from '@src/components/';
import {IconButton, List} from 'react-native-paper';
import AppConfig from '@src/app.config';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';
import {
  convertTimestamp,
  ServiceOrderModel,
  ServiceOrderMediaModel,
  ServiceOrderActaModel,
  ServiceOrderAdmTechDeliveyModel,
} from '@src/Apps/Asistec/utils/firebase/firestore';
import {cropText} from '@src/utils/formaters';
import {useFocusEffect} from '@react-navigation/native';
import {useCoreTheme} from '@src/themes';
import {useAppStore} from '@src/store';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import uuid from 'react-native-uuid';
import SignatureScreen from 'react-native-signature-canvas';
import {useNavigation} from '@react-navigation/native';

const asistecData = AppConfig.asistec_data;

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
    // Ir siempre a ModalServiceTracking con el service_id correcto
    NavigationService.navigate({
      name: 'ModalServiceTracking',
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
  const [serviceDeliveryData, setServiceDeliveryData] = React.useState(null);
  const [mediaAntes, setMediaAntes] = React.useState(null);
  const [mediaDespues, setMediaDespues] = React.useState(null);
  const [itemSelectedAction, setItemSelectedAction] = React.useState(null);
  const [itemTypeAction, setItemTypeAction] = React.useState(null);
  const [signatureType, setSignatueType] = React.useState(null);

  useFocusEffect(
    React.useCallback(() => {
      setForm();
      return () => {
        setShowContent(false);
        setServiceDeliveryData(null);
        setServiceData(null);
      };
    }, [params]),
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
      serviceActa = await ServiceOrderAdmTechDeliveyModel.get({
        service_order_id: params.service_order_id,
      });
    }

    setServiceData(service);
    if (serviceActa && serviceActa[0]) {
      setServiceDeliveryData(serviceActa[0]);
    } else {
      setServiceDeliveryData({
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

  const getMediaAntes = async (service_id = serviceData?.id) => {
    const data = await ServiceOrderMediaModel.get({
      service_order_id: service_id,
      type: 3,
    });
    setMediaAntes(data[0] || null);
  };

  const getMediaDespues = async (service_id = serviceData?.id) => {
    const data = await ServiceOrderMediaModel.get({
      service_order_id: service_id,
      type: 4,
    });
    setMediaDespues(data[0] || null);
  };

  const saveServiceActaChanges = async (serviceActa = serviceDeliveryData) => {
    // if (serviceData.state !== 5 || appStoreUserProfile.type === 3) return;
    layoutRef?.current?.setLoading({state: true});

    let order = null;
    if (serviceActa.id) {
      // dataSend.id = serviceActa.id;
      order = await ServiceOrderAdmTechDeliveyModel.update(serviceActa);
    } else {
      order = await ServiceOrderAdmTechDeliveyModel.create(serviceActa);
    }
    if (order) {
      await setForm();
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
      closeBottomSheetFormObs();
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const saveIemObs = async item => {
    const serviceActa = {...serviceDeliveryData};
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
    const newObsList = serviceDeliveryData?.obs?.filter(x => x.id !== id) || [];
    let order;
    layoutRef?.current?.setLoading({state: true});
    if (serviceDeliveryData.id) {
      order = await ServiceOrderActaModel.update({
        id: serviceDeliveryData.id,
        obs: newObsList,
      });
    } else {
      setServiceDeliveryData({...serviceDeliveryData, obs: newObsList});
    }
    if (order) {
      await setForm();
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Correcto.',
      });
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const onAddSignature = type => {
    if (!(serviceData?.state === 10) || appStoreUserProfile?.type !== 1) {
      return;
    }
    setSignatueType(type);
    if (
      !type ||
      (serviceDeliveryData?.signature_date &&
        serviceDeliveryData?.signature_date !== '')
    ) {
      return;
    }
    setModalSignatureVisible(true);
  };

  const onAcceptSignature = async signature => {
    setModalSignatureVisible(false);
    layoutRef?.current?.setLoading({state: true});
    let dataSend = {
      service_order_id: serviceData?.id,
    };
    if (signatureType === 1) {
      dataSend.signature_adm_id = appStoreUserProfile?.id;
      dataSend.signature_b64_adm = signature;
      dataSend.signature_date_adm = new Date();
    }
    if (signatureType === 2) {
      dataSend.signature_b64_tech = signature;
      dataSend.signature_date_tech = new Date();
    }
    if (serviceDeliveryData?.id) {
      dataSend.id = serviceDeliveryData?.id;
    }
    await saveServiceActaChanges(dataSend);
    layoutRef?.current?.setLoading({state: false});
  };

  const onAcceptDelivery = async () => {
    if (
      !serviceDeliveryData.signature_b64_tech ||
      serviceDeliveryData.signature_b64_tech === ''
    ) {
      return;
    }
    layoutRef?.current?.setLoading({state: true});
    // await saveServiceActaChanges(dataSend);
    const order = await ServiceOrderModel.updateServiceOrder({
      id: serviceData.id,
      state: 11,
    });
    layoutRef?.current?.setLoading({state: false});
    NavigationService.navigate({
      name: 'ModalServiceTracking',
      params: {
        service: {id: params?.service_order_id}
      }
    });
  };

  return (
    <>
      <AppLayout ref={layoutRef} hiddenBottomBarMenu>
        <ScrollView>
          {showContent ? (
            <>
              <View style={{flex: 1, paddingHorizontal: 10, marginBottom: 15}}>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingTop: 10,
                  }}>
                  <View style={{flex: 1}}>
                    <CoreTextInput
                      label={`Servicio #${serviceData?.consecutive || ''}`}
                      dense
                      value={cropText(serviceData?.service?.name, 20)}
                      editable={false}
                    />
                    <CoreTextInput
                      dense
                      label="Fecha"
                      style={{fontSize: 14, backgroundColor: 'transparent'}}
                      value={`${
                        convertTimestamp(serviceData?.date, 'dd-MM-yyyy') || '-'
                      } - ${
                        asistecData?.services_order_book_times?.find(
                          x => x.id === serviceData?.hour,
                        )?.name || ''
                      }`}
                      editable={false}
                    />
                    <CoreTextInput
                      label="Cliente"
                      style={{fontSize: 14, backgroundColor: 'transparent'}}
                      dense
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

                <CoreText variant="titleLarge" style={{marginTop: 10}}>
                  Entega de servicio
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
                      justifyContent: 'flex-end',
                      marginHorizontal: 5,
                    }}>
                    <CoreImage
                      style={{
                        width: 100,
                        height: 50,
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
                    {(serviceDeliveryData?.signature_b64_tech &&
                      serviceDeliveryData?.signature_b64_tech !== '') ||
                    serviceData?.state === 11 ? (
                      <>
                        <Pressable onPress={() => onAddSignature(2)}>
                          <CoreImage
                            style={{
                              width: 100,
                              height: 50,
                              padding: 5,
                              resizeMode: 'contain',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            source={
                              serviceDeliveryData?.signature_b64_tech
                                ? {
                                    uri: serviceDeliveryData?.signature_b64_tech,
                                  }
                                : require('@src/Apps/Asistec/assets/img/image-remove.png')
                            }
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
                          onPress={() => onAddSignature(2)}
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
                      {cropText(serviceData?.technical?.full_name, 20)}
                    </CoreText>
                    <CoreText>Tecnico</CoreText>
                  </View>
                </View>
                <View
                  style={{
                    marginTop: 20,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <CoreButton
                    style={{marginTop: 20}}
                    mode="contained"
                    onPress={() =>
                      navigation.navigate('ModalServiceTrackingDetails', {
                        goBackView: 'ModalServiceOrderEntregaAdminTech',
                        service: serviceData,
                      })
                    }
                    contentStyle={{
                      flexDirection: 'row-reverse',
                      justifyContent: 'center',
                      alignContent: 'center',
                    }}
                    icon="information-outline">
                    Ver Detalles
                  </CoreButton>
                </View>
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

        {showContent && serviceData?.state === 10 ? (
          <>
            <View style={{padding: 10}}>
              <CoreButton
                mode="contained"
                onPress={() => onAcceptDelivery()}
                style={{backgroundColor: themeData.colors.asistectSec}}>
                Entregar
              </CoreButton>
            </View>
          </>
        ) : (
          <></>
        )}

        <Modal
          animationType="slide"
          presentationStyle="fullScreen"
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
              descriptionText={
                signatureType === 1
                  ? 'Firma admin'
                  : signatureType === 2
                  ? 'Firma tecnico'
                  : ''
              }
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
