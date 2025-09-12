import React from 'react';
import {View, ScrollView, ActivityIndicator} from 'react-native';
import {List, Divider, Checkbox, Avatar, Switch} from 'react-native-paper';
import {useCoreTheme} from '@src/themes';
import {
  CoreText,
  CoreButton,
  CoreTextInput,
  CoreImage,
} from '@src/components/';
import {useFocusEffect} from '@react-navigation/native';
import {
  ServiceOrderModel,
  convertTimestamp,
  NotificationsLogsModel,
} from '@src/Apps/Asistec/utils/firebase/firestore';
import {cropText} from '@src/utils/formaters';
import {useAppStore} from '@src/store';
import AppConfig from '@src/app.config';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';

function IndexView({route, navigation}) {
  const params = route.params;
  const {appStoreUserProfile} = useAppStore();

  const {themeData} = useCoreTheme();
  const [showContent, setShowContent] = React.useState(false);
  const [customerObs, setCustomerObs] = React.useState('');
  const layoutRef = React.useRef(null);
  const [serviceData, setServiceData] = React.useState(null);

  useFocusEffect(
    React.useCallback(() => {
      setView();
      return () => {
        setServiceData(null);
        setCustomerObs('');
        setShowContent(false);
      };
    }, []),
  );

  const setView = async () => {
    let service = null;

    if (params?.service?.id) {
      service = await ServiceOrderModel.getServiceOrderById(params.service?.id);
    }
    setServiceData(service);
    setShowContent(true);
  };

  const sendNotificationIfEnabled = (notificationData) => {
    if (AppConfig?.active_notifications) {
      NotificationsLogsModel.saveLogNotification(notificationData);
    }
  };

  const saveWarranty = async () => {
    let service = null;

    if (!customerObs || customerObs === '') {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Debe llenar las observaciones.',
        type: 'error',
      });

      return;
    }
    layoutRef?.current?.setLoading({state: true});
    if (params?.service?.id) {
      service = await ServiceOrderModel.createServiceOrderWarranty({
        service_id: params?.service?.id,
        obs_customer: customerObs,
      });
    }

    // NOTIFICACIONES
    if (service) {
      let dataNot = {
        data: {
          from_user_id: appStoreUserProfile?.id || null,
          message: `Servicio ${serviceData?.service?.name || '-'} #${
            serviceData?.consecutive || '-'
          } en garantia.`,
          // service_order_id: serviceData?.id,
          model_type: 1,
          type: 19,
          payload: {service_order_id: serviceData.id},
        },
      };

      // NOTIFICACION -> un admin pone en garantia el servicio, notfica al cliente y tecnico
      if (appStoreUserProfile?.type === 1) {
        // not a cliente
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          sendNotificationIfEnabled({
            ...dataNot,
            to_user_id: serviceData?.customer_id,
          });
        }
        // not a tecnico
        if (serviceData?.technical_id && serviceData?.technical_id !== '') {
          sendNotificationIfEnabled({
            ...dataNot,
            to_user_id: serviceData?.technical_id,
          });
        }
      }

      // NOTIFICACION -> el cliente solicita garantia, notifica a los administradores y al tecnico
      if (serviceData?.customer_id === appStoreUserProfile?.id) {
        // not administradores
        sendNotificationIfEnabled({
          ...dataNot,
          to_user_type: 1,
        });
        // not a tecnico
        if (serviceData?.technical_id && serviceData?.technical_id !== '') {
          sendNotificationIfEnabled({
            ...dataNot,
            to_user_id: serviceData?.technical_id,
          });
        }
      }
    }
    await setView();
    layoutRef?.current?.setLoading({state: false});

    console.log('saveWarranty', service);
  };

  return (
    <AppLayout ref={layoutRef}>
      {/* 
      Admin y cliente puede solicitar garantia, solo si el servicio esta en 11 puede solicitar y modificar texto
      Tecnico solo ve listado ed garantia
      */}
      <View style={{flex: 1}}>
        <ScrollView style={{paddingHorizontal: 10}}>
          {showContent ? (
            <>
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
                      AppConfig?.asistec_data?.services_order_book_times?.find(
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
              {/* Si es admin o el cliente y el servicio fue entregado, puede solicitar garantia */}
              {(appStoreUserProfile?.type === 1 ||
                appStoreUserProfile?.id === serviceData?.customer_id) &&
              serviceData?.state === 11 ? (
                <>
                  <CoreText variant="titleLarge" style={{marginTop: 10}}>
                    Solicitar garantia
                  </CoreText>

                  <CoreTextInput
                    multiline
                    label="Observaciones"
                    mode="outlined"
                    onChangeText={setCustomerObs}
                    dense
                  />

                  <CoreText style={{paddingHorizontal: 5}}>
                    * Las fechas se pueden modificar una vez solicitada
                    garantia.
                  </CoreText>
                  <View style={{paddingVertical: 10}}>
                    <CoreButton mode="contained" onPress={() => saveWarranty()}>
                      Solicitar
                    </CoreButton>
                  </View>
                </>
              ) : (
                <></>
              )}
              {serviceData?.warranty && serviceData?.warranty.length > 0 ? (
                <>
                  <CoreText variant="titleLarge" style={{marginTop: 10}}>
                    Solicitudes
                  </CoreText>
                  {serviceData?.warranty.map(item => (
                    <React.Fragment key={item.id}>
                      <List.Item
                        title={
                          convertTimestamp(item?.created_date, 'dd-MM-yyyy') ||
                          '-'
                        }
                        description={item?.obs_customer || ''}
                        descriptionNumberOfLines={5}
                        // right={() => <CenteredCheckbox />}
                      />
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <></>
              )}
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
        {/* <CoreText style={{paddingHorizontal: 5}}>
          * Las fechas se pueden modificar una vez solicitada garantia.
        </CoreText>
        <View style={{paddingVertical: 10}}>
          <CoreButton mode="contained" onPress={() => saveWarranty()}>
            Guardar
          </CoreButton>
        </View> */}
      </View>
    </AppLayout>
  );
}

export default IndexView;
