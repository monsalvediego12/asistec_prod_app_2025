import * as React from 'react';
const { memo } = React;
import {
  // ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  PermissionsAndroid,
  Pressable,
  ImageBackground,
} from 'react-native';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  CoreHelperText,
  CoreBottomSheet,
  CoreIconMaterial,
  CoreIconMaterialCommunity,
  AppLayout,
  CoreImage,
} from '@src/components/';

import {ScrollView} from 'react-native-gesture-handler';

import {
  IconButton,
  Chip,
  List,
  Divider,
  Dialog,
  Portal,
  Badge,
  Avatar,
  Card,
} from 'react-native-paper';
import {useCoreReactHookForm} from '@src/hooks/CoreReactHookForm';
import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import {UserModel} from '@src/utils/firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import {useCoreTheme} from '@src/themes';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';

import {cropText} from '@src/utils/formaters';
import {useSelector, useDispatch} from 'react-redux';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import MapViewDirections from 'react-native-maps-directions';
import NavigationService from '@src/navigation/NavigationService';
import Geocoder from 'react-native-geocoding'; // Asegúrate de tener esta librería para obtener la dirección
import Geolocation from '@react-native-community/geolocation';
import {useAppStore} from '@src/store';
import {
  convertTimestamp,
  ServiceOrderModel,
  NotificationsLogsModel,
  ServiceOrderCotizacionModel,
  ChatModel,
} from '@src/utils/firebase/firestore';
import firestore from '@react-native-firebase/firestore';

import {Popup} from 'react-native-map-link';

import AppConfig from '@src/app.config';
import {asistecTheme} from '@src/themes/styles';
const asistecData = AppConfig.asistec_data;

const ModalContent = ({
  dataObject,
  // userData,
  onEditFnt,
  onDelFnt,
  onChangeState,
  goToDetails,
  onSetTechnical,
  onSetTechnicalState,
  onSetTechnicalMe,
  onPauseService,
  onContinueService,
  onChatFnt,
  countServiceChatMessages,
  onModalUsersInfo,
}) => {
  const {themeData} = useCoreTheme();
  const {appStoreUserProfile} = useAppStore();

  const [serviceData, setServiceData] = React.useState(null);
  // const [userDataStore, setUserDataStore] = React.useState(null);

  React.useEffect(() => {
    setServiceData(dataObject);
  }, [dataObject]);

  // React.useEffect(() => {
  //   setUserDataStore(userData);
  // }, [userData]);

  const onChangeStateFnt = () => {
    onChangeState();
  };

  return (
    <>
      <View style={{paddingHorizontal: 10, flex: 1}}>
        <ScrollView style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <CoreText style={{fontWeight: 'bold'}}>Informacion</CoreText>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Pressable
                onPress={() => goToDetails()}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginHorizontal: 10,
                }}>
                <CoreText>Ver detalles</CoreText>
                <CoreIconMaterial
                  name="info-outline"
                  size={25}
                  style={
                    {
                      // color:
                    }
                  }
                />
              </Pressable>
              {/* El servicio no se ha pagado y no esta en camino o esta en garantia */}
              {(serviceData?.state <= 9 && serviceData?.state !== 3) ||
              serviceData?.state === 12 ? (
                <>
                  {/* Si es admin puede editar y borrar, si es cliente el servicio debe estar agendado o en espera */}
                  {appStoreUserProfile?.type === 1 ||
                  (appStoreUserProfile?.id === serviceData?.customer_id &&
                    (serviceData.state === 1 ||
                      serviceData.state === 2 ||
                      serviceData.state === 12) &&
                    serviceData?.customer_state !== 2) ? (
                    <>
                      <Pressable
                        onPress={() => onEditFnt()}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginHorizontal: 10,
                        }}>
                        {/* <CoreText>Editar</CoreText> */}
                        <CoreIconMaterial
                          name="edit"
                          size={20}
                          style={
                            {
                              // color:
                            }
                          }
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => onDelFnt()}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginHorizontal: 10,
                        }}>
                        <CoreIconMaterial
                          name="delete"
                          size={20}
                          style={
                            {
                              // color:
                            }
                          }
                        />
                      </Pressable>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 10,
            }}>
            <View>
              <CoreText style={{fontWeight: 'bold'}}>
                {serviceData?.service?.name || ''}
              </CoreText>
              <CoreText>{serviceData?.consecutive || ''}</CoreText>
            </View>

            {serviceData?.customer_state === 2 ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Chip style={{margin: 4}}>En espera por cliente</Chip>
              </View>
            ) : (
              <>
                <Chip style={{margin: 4}}>
                  {/* Si el servicio fue entregado y lo esta viendo un perfil no admin, entonces muestra Finalizado */}
                  {serviceData?.state === 11 && appStoreUserProfile?.type !== 1
                    ? 'Finalizado'
                    : asistecData?.services_order_state?.find(
                        x => x.id === serviceData?.state,
                      )?.name || ''}
                </Chip>
              </>
            )}
          </View>

          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <CoreText style={{fontWeight: 'bold'}}>
                {convertTimestamp(serviceData?.date, 'dd-MM-yyyy') || '-'} -{' '}
                {asistecData?.services_order_book_times?.find(
                  x => x.id === serviceData?.hour,
                )?.name || ''}
              </CoreText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <CoreText style={{fontWeight: 'bold'}}>
                {serviceData?.loc_address || '-'}
              </CoreText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <CoreText>{serviceData?.loc_address_ref || '-'}</CoreText>
            </View>
            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <View>
                <CoreText style={{fontWeight: 'bold'}}>Cliente:</CoreText>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  // marginTop: 10,
                }}>
                {(appStoreUserProfile.type === 1 ||
                  appStoreUserProfile?.id === serviceData?.technical_id) &&
                serviceData?.customer_id &&
                serviceData?.customer_id !== '' ? (
                  // Si es el admin o el tecnico del servicio, puede enviar mensajes al cliente
                  <>
                    <View>
                      <IconButton
                        style={{}}
                        icon="message"
                        mode="contained"
                        size={25}
                        // onPress={() => onSetTechnical()}
                        onPress={() => onChatFnt(1)}
                      />
                      {countServiceChatMessages?.customer ? (
                        <>
                          <Badge
                            style={{
                              position: 'absolute',
                              top: 2,
                              // right: 20,
                              backgroundColor: 'red',
                            }}
                            size={8}
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
                {serviceData?.customer_id &&
                serviceData?.customer_id !== '' &&
                serviceData?.customer?.phone &&
                serviceData?.customer?.phone !== '' &&
                (appStoreUserProfile.type === 1 ||
                  appStoreUserProfile?.id === serviceData?.technical_id) ? (
                  <>
                    <IconButton
                      style={{}}
                      icon="phone"
                      mode="contained"
                      size={25}
                      // onPress={() => onSetTechnical()}
                      onPress={() => {
                        Linking.openURL(`tel:${serviceData?.customer?.phone}`);
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}
              </View>
            </View> */}
            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <CoreText style={{}}>
                {serviceData?.customer?.full_name || ''}
              </CoreText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <CoreText style={{}}>
                {serviceData?.customer?.phone || ''}
              </CoreText>
            </View> */}

            <List.Item
              left={() => (
                <Pressable>
                  <Avatar.Image
                    size={40}
                    source={require('@src/assets/img/customer_avatar.png')}
                    style={{backgroundColor: themeData?.colors.primary}}
                  />
                </Pressable>
              )}
              right={props => (
                <>
                  {/* Si es el admin o el tecnico del servicio, puede enviar mensajes al cliente */}
                  {(appStoreUserProfile.type === 1 ||
                    appStoreUserProfile?.id === serviceData?.technical_id) &&
                  serviceData?.customer_id &&
                  serviceData?.customer_id !== '' ? (
                    <>
                      <View>
                        <IconButton
                          style={{}}
                          icon="message"
                          mode="contained"
                          size={25}
                          // onPress={() => onSetTechnical()}
                          onPress={() => onChatFnt(1)}
                        />
                        {countServiceChatMessages?.customer ? (
                          <>
                            <Badge
                              style={{
                                position: 'absolute',
                                top: 2,
                                // right: 20,
                                backgroundColor: 'red',
                              }}
                              size={8}
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
                  {serviceData?.customer_id &&
                  serviceData?.customer_id !== '' &&
                  serviceData?.customer?.phone &&
                  serviceData?.customer?.phone !== '' &&
                  (appStoreUserProfile.type === 1 ||
                    appStoreUserProfile?.id === serviceData?.technical_id) ? (
                    <>
                      <IconButton
                        style={{}}
                        icon="phone"
                        mode="contained"
                        size={25}
                        // onPress={() => onSetTechnical()}
                        onPress={() => {
                          Linking.openURL(
                            `tel:${serviceData?.customer?.phone}`,
                          );
                        }}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )}
              title={<CoreText style={{fontWeight: 'bold'}}>Cliente:</CoreText>}
              description={
                <View style={{flexDirection: 'column'}}>
                  <CoreText>{serviceData?.customer?.full_name || ''}</CoreText>
                  <CoreText>{serviceData?.customer?.phone || ''}</CoreText>
                </View>
              }
            />

            <List.Item
              left={() => (
                <Pressable
                  onPress={() => onModalUsersInfo(serviceData?.technical_id)}>
                  <Avatar.Image
                    size={40}
                    source={require('@src/assets/img/operator_avatar.png')}
                    style={{backgroundColor: themeData?.colors.primary}}
                  />
                </Pressable>
              )}
              right={props => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    {(serviceData?.technical_id &&
                      serviceData?.technical_id !== '' &&
                      appStoreUserProfile.type === 1) ||
                    appStoreUserProfile?.id === serviceData?.technical_id ? (
                      <>
                        <View>
                          <IconButton
                            style={{}}
                            icon="message"
                            mode="contained"
                            size={25}
                            iconColor={themeData?.colors?.asistectSec}
                            onPress={() => onChatFnt(2)}
                          />
                          {countServiceChatMessages?.technical ? (
                            <>
                              <Badge
                                style={{
                                  position: 'absolute',
                                  top: 2,
                                  backgroundColor: 'red',
                                }}
                                size={8}
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
                    {/* Si es cliente del servicio, puede enviar mensaje a tecnico */}
                    {appStoreUserProfile?.id === serviceData?.customer_id ? (
                      <>
                        <View>
                          <IconButton
                            style={{}}
                            icon="message"
                            mode="contained"
                            size={25}
                            // onPress={() => onSetTechnical()}
                            onPress={() => onChatFnt(1)}
                          />
                          {countServiceChatMessages?.customer ? (
                            <>
                              <Badge
                                style={{
                                  position: 'absolute',
                                  top: 2,
                                  // right: 20,
                                  backgroundColor: 'red',
                                }}
                                size={8}
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
                    {serviceData?.technical_id &&
                    serviceData?.technical?.phone &&
                    serviceData?.technical?.phone !== '' &&
                    (appStoreUserProfile.type === 1 ||
                      appStoreUserProfile?.id === serviceData?.customer_id) ? (
                      <>
                        <IconButton
                          style={{}}
                          icon="phone"
                          mode="contained"
                          size={25}
                          onPress={() => {
                            Linking.openURL(
                              `tel:${serviceData?.technical?.phone}`,
                            );
                          }}
                        />
                      </>
                    ) : (
                      <></>
                    )}
                    {appStoreUserProfile?.type === 1 &&
                    (!serviceData?.technical_id ||
                      serviceData?.technical_id === '' ||
                      serviceData?.technical_state === 2) ? (
                      <>
                        <IconButton
                          style={{}}
                          icon="plus"
                          mode="contained"
                          size={25}
                          onPress={() => onSetTechnical()}
                        />
                      </>
                    ) : (
                      <></>
                    )}

                    {appStoreUserProfile?.type === 2 &&
                    ((serviceData?.technical_state === 1 &&
                      serviceData?.technical_id !== appStoreUserProfile?.id) ||
                      (serviceData?.technical_state === 2 &&
                        serviceData?.technical_id !==
                          appStoreUserProfile?.id)) ? (
                      <>
                        <IconButton
                          style={{}}
                          icon="plus"
                          mode="contained"
                          size={25}
                          onPress={() => onSetTechnicalMe()}
                        />
                      </>
                    ) : (
                      <></>
                    )}
                  </View>
                );
              }}
              title={
                <CoreText style={{fontWeight: 'bold'}}>
                  Tecnico:{' '}
                  {serviceData?.technical_id &&
                  serviceData?.technical_id !== '' ? (
                    <CoreText>
                      {(appStoreUserProfile?.type === 1 ||
                        appStoreUserProfile?.id ===
                          serviceData?.technical_id) &&
                      serviceData?.technical_state === 1
                        ? '(Espera)'
                        : ''}
                      {(appStoreUserProfile?.type === 1 ||
                        appStoreUserProfile?.id ===
                          serviceData?.technical_id) &&
                      serviceData?.technical_state === 2
                        ? '(Rechazado)'
                        : ''}
                      {(appStoreUserProfile?.type === 1 ||
                        appStoreUserProfile?.id ===
                          serviceData?.technical_id) &&
                      serviceData?.technical_state === 3
                        ? '(Aceptado)'
                        : ''}
                    </CoreText>
                  ) : (
                    <CoreText>(Sin asignar)</CoreText>
                  )}
                </CoreText>
              }
              description={
                serviceData?.technical_id &&
                serviceData?.technical_id !== '' ? (
                  <View
                    style={{
                      flexDirection: 'column',
                    }}>
                    <CoreText style={{}}>
                      {serviceData?.technical?.full_name || ''}
                    </CoreText>
                    <CoreText style={{}}>
                      {serviceData?.technical?.phone || ''}
                    </CoreText>
                  </View>
                ) : (
                  <></>
                )
              }
            />

            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <View>
                <CoreText style={{fontWeight: 'bold'}}>
                  Tecnico:{' '}
                  {serviceData?.technical_id &&
                  serviceData?.technical_id !== '' ? (
                    <CoreText>
                      {(appStoreUserProfile?.type === 1 ||
                        appStoreUserProfile?.id ===
                          serviceData?.technical_id) &&
                      serviceData?.technical_state === 1
                        ? '(Espera)'
                        : ''}
                      {(appStoreUserProfile?.type === 1 ||
                        appStoreUserProfile?.id ===
                          serviceData?.technical_id) &&
                      serviceData?.technical_state === 2
                        ? '(Rechazado)'
                        : ''}
                      {(appStoreUserProfile?.type === 1 ||
                        appStoreUserProfile?.id ===
                          serviceData?.technical_id) &&
                      serviceData?.technical_state === 3
                        ? '(Aceptado)'
                        : ''}
                    </CoreText>
                  ) : (
                    <CoreText>(Sin asignar)</CoreText>
                  )}
                </CoreText>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  // marginTop: 10,
                }}> */}
            {/* Si es el admin o el tecnico del servicio, muestra chat admin */}
            {/* {(serviceData?.technical_id &&
                  serviceData?.technical_id !== '' &&
                  appStoreUserProfile.type === 1) ||
                appStoreUserProfile?.id === serviceData?.technical_id ? (
                  <>
                    <View>
                      <IconButton
                        style={{}}
                        icon="message"
                        mode="contained"
                        size={25}
                        iconColor={themeData?.colors?.asistectSec}
                        // onPress={() => onSetTechnical()}
                        onPress={() => onChatFnt(2)}
                      />
                      {countServiceChatMessages?.technical ? (
                        <>
                          <Badge
                            style={{
                              position: 'absolute',
                              top: 2,
                              // right: 20,
                              backgroundColor: 'red',
                            }}
                            size={8}
                          />
                        </>
                      ) : (
                        <></>
                      )}
                    </View>
                  </>
                ) : (
                  <></>
                )} */}
            {/* Si es cliente del servicio, puede enviar mensaje a tecnico */}
            {/* {appStoreUserProfile?.id === serviceData?.customer_id ? (
                  <>
                    <View>
                      <IconButton
                        style={{}}
                        icon="message"
                        mode="contained"
                        size={25}
                        // onPress={() => onSetTechnical()}
                        onPress={() => onChatFnt(1)}
                      />
                      {countServiceChatMessages?.customer ? (
                        <>
                          <Badge
                            style={{
                              position: 'absolute',
                              top: 2,
                              // right: 20,
                              backgroundColor: 'red',
                            }}
                            size={8}
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
                {serviceData?.technical_id &&
                serviceData?.technical?.phone &&
                serviceData?.technical?.phone !== '' &&
                (appStoreUserProfile.type === 1 ||
                  appStoreUserProfile?.id === serviceData?.customer_id) ? (
                  <>
                    <IconButton
                      style={{}}
                      icon="phone"
                      mode="contained"
                      size={25}
                      onPress={() => {
                        Linking.openURL(`tel:${serviceData?.technical?.phone}`);
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}
              </View>
            </View>
            {serviceData?.technical_id && serviceData?.technical_id !== '' ? (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <CoreText style={{}}>
                    {serviceData?.technical?.full_name || ''}
                  </CoreText>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <CoreText style={{}}>
                    {serviceData?.technical?.phone || ''}
                  </CoreText>
                </View>
              </>
            ) : (
              <></>
            )} */}

            {/* {appStoreUserProfile?.type === 1 &&
            (!serviceData?.technical_id ||
              serviceData?.technical_id === '' ||
              serviceData?.technical_state === 2) ? (
              <>
                <IconButton
                  style={{}}
                  icon="plus"
                  mode="contained"
                  size={25}
                  onPress={() => onSetTechnical()}
                />
              </>
            ) : (
              <></>
            )}

            {appStoreUserProfile?.type === 2 &&
            ((serviceData?.technical_state === 1 &&
              serviceData?.technical_id !== appStoreUserProfile?.id) ||
              (serviceData?.technical_state === 2 &&
                serviceData?.technical_id !== appStoreUserProfile?.id)) ? (
              <>
                <IconButton
                  style={{}}
                  icon="plus"
                  mode="contained"
                  size={25}
                  onPress={() => onSetTechnicalMe()}
                />
              </>
            ) : (
              <></>
            )} */}
          </View>
        </ScrollView>

        <View
          style={{
            paddingVertical: 5,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          {
            // true
            appStoreUserProfile?.id === serviceData?.technical_id &&
            serviceData?.technical_state === 1 &&
            serviceData?.state === 1 ? (
              <>
                <IconButton
                  style={{}}
                  icon="close"
                  mode="contained"
                  iconColor="red"
                  size={24}
                  onPress={() => onSetTechnicalState(2)}
                />
              </>
            ) : (
              <></>
            )
          }
          {/* Puede habilitar el servicio si es admin o el cliente, esta en espera por cliente, y no ha terminado ejecucion */}
          {(appStoreUserProfile?.id === serviceData?.customer_id ||
            appStoreUserProfile?.type === 1) &&
          serviceData?.state > 1 &&
          serviceData?.state < 7 &&
          serviceData?.customer_state === 2 ? (
            <>
              <CoreButton
                mode="contained"
                onPress={() => onContinueService()}
                style={{backgroundColor: themeData?.colors?.asistectSec}}
                contentStyle={{
                  flexDirection: 'row-reverse',
                  justifyContent: 'center',
                  alignContent: 'center',
                }}
                icon="restore">
                Hab. servicio
              </CoreButton>
            </>
          ) : (
            <></>
          )}

          {/* Si es el cliente o admin y el servicio esta en camino, en predio o cotizacion, se puede parar */}
          {(appStoreUserProfile?.type === 1 ||
            appStoreUserProfile?.id === serviceData?.customer_id) &&
          serviceData?.state > 2 &&
          serviceData?.state <= 5 &&
          serviceData?.customer_state === 1 ? (
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
          )}

          {/* <CoreButton
            mode="contained"
            onPress={() => goToDetails()}
            contentStyle={{
              flexDirection: 'row-reverse',
              justifyContent: 'center',
              alignContent: 'center',
            }}
            icon="information-outline">
            Detalles
          </CoreButton> */}

          {/* Es admin y el servicio esta finalizado */}
          {appStoreUserProfile?.type === 1 && serviceData?.state === 10 ? (
            <>
              <CoreButton
                mode="contained"
                onPress={() => onChangeStateFnt()}
                style={{backgroundColor: themeData.colors.asistectSec}}>
                Entregar
              </CoreButton>
            </>
          ) : (
            <></>
          )}

          {/* Es admin y el servicio esta entregado */}
          {appStoreUserProfile?.type === 1 && serviceData?.state === 11 ? (
            <>
              <CoreButton
                mode="contained"
                onPress={() => {
                  NavigationService.navigate({
                    name: 'ModalServiceOrderEntregaAdminTech',
                    params: {
                      service_order_id: serviceData?.id,
                    },
                  });
                }}
                style={{backgroundColor: themeData.colors.asistectSec}}>
                Ver entrega
              </CoreButton>
            </>
          ) : (
            <></>
          )}

          {/* Cualquiera puede ver las garantias, en la vista garantias se limita a admin y cliente */}
          {/* Si el servicioo fue entregado o tiene una garantia amarrada muestra el boton*/}
          {serviceData?.state === 10 ||
          serviceData?.state === 11 ||
          (serviceData?.warranty_id && serviceData?.warranty_id !== '') ? (
            <>
              <CoreButton
                mode="contained"
                onPress={() => {
                  NavigationService.navigate({
                    name: 'ServiceWarranty',
                    params: {
                      service: {id: serviceData?.id},
                    },
                  });
                }}
                style={{backgroundColor: themeData.colors.asistectSec}}>
                Garantia
              </CoreButton>
            </>
          ) : (
            <></>
          )}

          {/* Si es el admin o el tecnico, el servicio no se ha finalizado, el tecnico acepto el servicio,
           el cliente no lo tiene en espera o esta en garantia 
           muestra botones de estados
           */}
          {(serviceData?.state <= 9 || serviceData?.state === 12) &&
          ((appStoreUserProfile?.id === serviceData?.technical_id &&
            serviceData?.technical_state === 3) ||
            appStoreUserProfile?.type === 1) &&
          serviceData?.customer_state !== 2 ? (
            // true
            <>
              <CoreButton
                mode="contained"
                onPress={() => onChangeStateFnt()}
                style={{backgroundColor: themeData.colors.asistectSec}}>
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
                  : ''}
              </CoreButton>
            </>
          ) : (
            <></>
          )}

          {/* Si es el tecnico, y el servicio y tecnico recien estan agendados */}
          {appStoreUserProfile?.id === serviceData?.technical_id &&
          serviceData?.technical_state === 1 &&
          serviceData?.state === 1 ? (
            <>
              <IconButton
                style={{}}
                icon="check"
                mode="contained"
                size={24}
                onPress={() => onSetTechnicalState(3)}
              />
            </>
          ) : (
            <></>
          )}
        </View>
      </View>
    </>
  );
};

const ContentList = React.memo(
  ({items = [], loading, type = 'technical', onSelect, onClose}) => {
    const {themeData} = useCoreTheme();

    const onSelectItem = item => {
      onSelect(item);
    };

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

// Componente de mapa simplificado - sin optimizaciones que puedan causar problemas
const SimpleMapView = ({ 
  apiKey, 
  region, 
  destinationMap, 
  originMap,
  technicalOrigin,
  onRegionChangeComplete,
  onSetDirection
}) => {
  console.log('SimpleMapView render:', {
    hasApiKey: !!apiKey,
    hasRegion: !!region?.latitude,
    regionValue: region
  });

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      showsUserLocation={true}
      style={{
        width: '100%',
        height: '100%',
      }}
      initialRegion={region}
      onRegionChangeComplete={onRegionChangeComplete}>
      
      {destinationMap?.latitude && (
        <Marker
          coordinate={destinationMap}
          draggable
          onDragEnd={onSetDirection}
          title="Destino"
        />
      )}

      {technicalOrigin?.latitude && (
        <Marker coordinate={technicalOrigin}>
          <CoreImage
            style={{width: 30, height: 30}}
            source={require('@src/assets/img/pngwing.com.png')}
          />
        </Marker>
      )}

      {originMap?.latitude && destinationMap?.latitude && (
        <MapViewDirections
          origin={originMap}
          destination={destinationMap}
          strokeWidth={3}
          apikey={apiKey}
        />
      )}
    </MapView>
  );
};

function AppView({route, navigation}) {
  const params = route.params;
  const {themeData} = useCoreTheme();

  const layoutRef = React.useRef(null);
  const selectorAppStore = useSelector(state => state.app);
  const [showContent, setShowContent] = React.useState(false);
  const [serviceData, setServiceData] = React.useState(null);
  const [itemsContentList, setItemsContentList] = React.useState([]);
  const [userProfileStore, setUserProfileStore] = React.useState(null);
  const [serviceCotizacion, setServiceCotizacion] = React.useState(null);

  const {appStoreUserProfile} = useAppStore();

  const [apiKey, setApiKey] = React.useState(
    Platform.OS === 'ios' ? AppConfig.ios_apikey : AppConfig.android_apikey,
  );

  const bottomSheetRef = React.useRef(null);
  const bottomSheetContenListRef = React.useRef(null);

  const [isTraking, setIsTraking] = React.useState(false);
  const [externalMapModal, setExternalMapModal] = React.useState(false);
  const [watchId, setWatchId] = React.useState(null);
  const [intervalId, setIntervalId] = React.useState(undefined);
  const [updatingCoordsTechnical, setUpdatingCoordsTechnical] =
    React.useState(false);

  const [zoom, setZoom] = React.useState(0.1); // Valor inicial del zoom
  const [defaultCoords, setDefaultCoords] = React.useState({
    latitude: 4.711, // Bogotá, Colombia - coordenadas por defecto
    longitude: -74.0721,
    latitudeDelta: zoom,
    longitudeDelta: zoom * 2,
  }); // Coordenadas por defecto de Bogotá

  const [destinationMap, setDestinationMap] = React.useState({
    latitude: null,
    longitude: null,
    latitudeDelta: zoom,
    longitudeDelta: zoom * 2,
  });

  const [region, setRegion] = React.useState({
    latitude: 4.711, // Bogotá, Colombia - región inicial
    longitude: -74.0721,
    latitudeDelta: zoom,
    longitudeDelta: zoom * 2,
  });

  const [originMap, setOriginMap] = React.useState({
    latitude: null,
    longitude: null,
    latitudeDelta: zoom,
    longitudeDelta: zoom * 2,
  });

  const [technicalOrigin, setTechnicalOrigin] = React.useState({
    latitude: null,
    longitude: null,
    latitudeDelta: zoom,
    longitudeDelta: zoom * 2,
  });

  const [modalDelete, setModalDelete] = React.useState(false);
  const [mapViewRegionData, setMapViewRegionData] = React.useState(null);

  const [countServiceChatMessagesCus, setCountServiceChatMessagesCus] =
    React.useState(0);
  const [countServiceChatMessagesTech, setCountServiceChatMessagesTech] =
    React.useState(0);

  const [openModalUsersInfo, setOpenModalUsersInfo] = React.useState(false);
  const [modalUserInfoData, setModalUserInfoData] = React.useState(null);

  React.useEffect(() => {
    Geocoder.init(apiKey); // use a valid API key
    requestLocationPermission();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      stopWatchingPosition();
      stopWatchPosition();
      const unsubscribe = firestore()
        .collection('services_order')
        .doc(params?.service?.id)
        .onSnapshot(
          documentSnapshot => {
            // stopWatchingPosition();
            // stopWatchPosition();
            const servData = {
              id: documentSnapshot?.id,
              ...documentSnapshot.data(),
            };
            setServiceData(servData);
            getServiceCotizacion(servData);
            if (servData?.deleted_date && servData?.deleted_date !== '') {
              layoutRef?.current?.setSnack({
                state: true,
                message: 'Error',
                type: 'error',
              });
              NavigationService.navigate({name: 'AdminServicesListView'});
              return;
            }

            // destination coords
            if (documentSnapshot.data()?.loc_address_coords?.latitude) {
              if (!destinationMap.latitude) {
                setRegion({
                  ...region,
                  latitude:
                    documentSnapshot.data()?.loc_address_coords?.latitude,
                  longitude:
                    documentSnapshot.data()?.loc_address_coords?.longitude,
                });
              }
              setDestinationMap(
                documentSnapshot.data()?.loc_address_coords || {},
              );
            }
            // technical initial coords
            if (documentSnapshot.data()?.technical_initial_coords?.latitude) {
              setOriginMap({
                ...originMap,
                latitude:
                  documentSnapshot.data()?.technical_initial_coords?.latitude,
                longitude:
                  documentSnapshot.data()?.technical_initial_coords?.longitude,
              });
            }
            // technical last coords
            if (documentSnapshot.data()?.technical_last_coords?.latitude) {
              // actualiza marcador de tecnico
              //
              setTechnicalOrigin({
                ...technicalOrigin,
                latitude:
                  documentSnapshot.data()?.technical_last_coords?.latitude,
                longitude:
                  documentSnapshot.data()?.technical_last_coords?.longitude,
              });
            }

            // tecnico asignado
            if (
              appStoreUserProfile.id === documentSnapshot.data()?.technical_id
            ) {
              // servicio no iniciado/pausado
              if (
                documentSnapshot.data()?.state === 2 ||
                documentSnapshot.data()?.state === 1
              ) {
                // si es el tecnico asignado, muestra ubicacion y ruta.
                watchPosition(servData);
              }
              if (documentSnapshot.data()?.state === 3) {
                // si es  guarda los cambios en vivo si es el tecnico asignado, si es el cliente/admin(no asignado) vigila estos cambios
                watchPosition(servData);
              } else {
                setIsTraking(false);
              }
            }
            // si es mayor a 3 muestrea la ubicacion final
            if (documentSnapshot.data()?.state > 3) {
              stopWatchingPosition();
              stopWatchPosition();
              setIsTraking(false);
            }
          },
          error => {
            console.error('Failed to listen to document: ', error);
          },
        );

      setShowContent(true);
      setTimeout(() => {
        bottomSheetRef?.current?.open();
      }, 500);
      return () => {
        setShowContent(false);
        stopWatchingPosition();
        stopWatchPosition();
        setWatchId(null);
        setServiceCotizacion(null);
        setIsTraking(false);
        setOriginMap(defaultCoords);
        setTechnicalOrigin(defaultCoords);
        setDestinationMap(defaultCoords);
        setRegion(defaultCoords);
        setCountServiceChatMessagesCus(null);
        setCountServiceChatMessagesTech(null);
        setModalUserInfoData(null);
        unsubscribe();
        bottomSheetRef?.current?.close();
      };
    }, [params]),
  );

  useFocusEffect(
    React.useCallback(() => {
      setUserProfileStore(appStoreUserProfile);
      return () => {
        setModalDelete(false);
      };
    }, [appStoreUserProfile]),
  );

  // Debug effect para ver el estado de los datos
  React.useEffect(() => {
    console.log('ModalServiceTracking state:', {
      showContent,
      hasApiKey: !!apiKey,
      apiKeyValue: apiKey,
      hasRegionLat: !!region?.latitude,
      regionValue: region
    });
  }, [showContent, apiKey, region]);

  React.useEffect(() => {
    // revisa si tiene mensajes sin leer
    if (serviceData?.id) {
      let unsubscribeCus = () => {};
      let unsubscribeTehc = () => {};
      if (serviceData?.customer_chat_id) {
        unsubscribeCus = firestore()
          .collection('chat_messages')
          .where('chat_id', '==', serviceData?.customer_chat_id)
          .where('state', '==', 1)
          .onSnapshot(querySnapshot => {
            const userData = querySnapshot?.empty ? [] : querySnapshot?.docs;
            let totalMessages = userData.length;
            setCountServiceChatMessagesCus(totalMessages);
          });
      }

      if (serviceData?.technical_chat_id) {
        unsubscribeTehc = firestore()
          .collection('chat_messages')
          .where('chat_id', '==', serviceData?.technical_chat_id)
          .where('state', '==', 1)
          .onSnapshot(querySnapshot => {
            const userData = querySnapshot?.empty ? [] : querySnapshot?.docs;
            let totalMessages = userData.length;
            setCountServiceChatMessagesTech(totalMessages);
          });
      }

      return () => {
        unsubscribeCus();
        unsubscribeTehc();
      };
    }
  }, [serviceData]);

  const getServiceCotizacion = async (service = serviceData) => {
    const data = await ServiceOrderCotizacionModel.get({
      service_order_id: service.id,
    });
    setServiceCotizacion(data[0] || {items: []});
  };

  const stopWatchingPosition = () => {
    setIsTraking(false);
    if (intervalId !== undefined) {
      clearInterval(intervalId);
    }
  };

  const onRegionChangeComplete = newRegion => {
    setMapViewRegionData(newRegion);
  };

  const watchPosition = async (servData = serviceData) => {
    if (watchId !== null || !servData?.id || servData?.state !== 3) {
      return;
    }
    Geolocation.getCurrentPosition(info => {
      const {latitude, longitude} = info.coords;
      setOriginMap({
        ...originMap,
        latitude,
        longitude,
      });
    });
    const wId = await Geolocation.watchPosition(
      info => {
        const {latitude, longitude} = info.coords;
        coords = info.coords;
        setOriginMap({...originMap, latitude, longitude});
        setRegion({
          ...region,
          latitude,
          longitude,
        });
        if (servData?.state === 3) {
          // en camino, actualiza en db
          let datSend = {
            id: servData.id,
            technical_last_coords: {
              latitude: latitude,
              longitude: longitude,
            },
          };
          if (
            !servData.technical_initial_coords?.latitude ||
            servData.technical_initial_coords?.latitude === ''
          ) {
            datSend.technical_initial_coords = {
              latitude: latitude,
              longitude: longitude,
            };
          }
          let order = ServiceOrderModel.updateServiceOrder(datSend);
        }
      },
      error => console.error(error),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
    setWatchId(wId);
  };

  const stopWatchPosition = async () => {
    if (watchId !== null) {
      await Geolocation.clearWatch(watchId); // Detener el seguimiento
      setWatchId(null); // Limpiar el estado
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

  const openModalContentList = async (type = 'technical') => {
    let data;

    bottomSheetContenListRef?.current?.open();
    setItemsContentList([]);

    if (type === 'technical') {
      data = await UserModel.getAllTechnical();
    }

    setItemsContentList(data);
    // setLoadingList(false);
  };

  const onSelectTechnicalContentList = async item => {
    const dataSend = {
      ...serviceData,
      technical_id: item.id,
      technical: {
        id: item?.id || '',
        full_name: item?.full_name || '',
        phone: item?.phone || '',
      },
      technical_state: 1,
    };

    layoutRef?.current?.setLoading({state: true});

    const technicalDisponibility =
      await ServiceOrderModel.getTechnicalDisponibility(dataSend);

    layoutRef?.current?.setLoading({state: false});

    if (!technicalDisponibility?.state) {
      layoutRef?.current?.setSnack({
        state: true,
        message: technicalDisponibility?.message || 'Error',
        type: 'error',
      });
      return;
    }

    layoutRef?.current?.setLoading({state: true});
    const response = await ServiceOrderModel.updateServiceOrder(dataSend);
    layoutRef?.current?.setLoading({state: false});
    if (response) {
      NotificationsLogsModel.saveLogNotification({
        data: {
          from_user_id: appStoreUserProfile?.id || null,
          to_user_id: dataSend?.technical_id,
          message: `Servicio ${serviceData?.service?.name || '-'} #${
            serviceData?.consecutive || '-'
          } te ha sido asignado.`,
          // service_order_id: serviceData?.id,
          model_type: 1,
          type: 2,
          payload: {service_order_id: serviceData.id},
        },
      });
      bottomSheetContenListRef?.current?.close();
    } else {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Error',
        type: 'error',
      });
    }
  };

  const onSetTechnicalMe = async item => {
    if (serviceData?.technical_state === 3) {
      return;
    }
    const dataSend = {
      ...serviceData,
      technical_id: appStoreUserProfile.id,
      technical: {
        id: appStoreUserProfile?.id || '',
        full_name: appStoreUserProfile?.full_name || '',
        phone: appStoreUserProfile?.phone || '',
      },
      technical_state: 3,
    };

    layoutRef?.current?.setLoading({state: true});

    const technicalDisponibility =
      await ServiceOrderModel.getTechnicalDisponibility(dataSend);

    layoutRef?.current?.setLoading({state: false});

    if (!technicalDisponibility?.state) {
      layoutRef?.current?.setSnack({
        state: true,
        message: technicalDisponibility?.message || 'Error',
        type: 'error',
      });
      return;
    }

    layoutRef?.current?.setLoading({state: true});
    const response = await ServiceOrderModel.updateServiceOrder(dataSend);
    layoutRef?.current?.setLoading({state: false});
    if (response) {
      // notificacion a admins
      if (response?.technical_id && response?.technical_id !== '') {
        NotificationsLogsModel.saveLogNotification({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${response?.service?.name || '-'} #${
              response?.consecutive || '-'
            } fue tomado por ${
              cropText(appStoreUserProfile?.full_name, 15) || '-'
            }.`,
            // service_order_id: response?.id,
            model_type: 1,
            type: 2,
            payload: {service_order_id: response.id},
          },
          to_user_type: 1,
        });
      }

      // bottomSheetContenListRef?.current?.close();
    } else {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Error',
        type: 'error',
      });
    }
  };

  const onPauseService = async item => {
    if (serviceData?.customer_state === 2) {
      return;
    }
    const dataSend = {
      ...serviceData,
      state: 2,
      customer_state: 2,
    };
    layoutRef?.current?.setLoading({state: true});
    const response = await ServiceOrderModel.updateServiceOrder(dataSend);
    layoutRef?.current?.setLoading({state: false});
    if (response) {
      // notificacion a admins
      NotificationsLogsModel.saveLogNotification({
        data: {
          from_user_id: appStoreUserProfile?.id || null,
          message: `Servicio ${response?.service?.name || '-'} #${
            response?.consecutive || '-'
          } pausado por cliente.`,
          // service_order_id: response?.id,
          model_type: 1,
          type: 7,
          payload: {service_order_id: response.id},
        },
        to_user_type: 1,
      });
      if (serviceData?.technical_id && serviceData?.technical_id !== '') {
        NotificationsLogsModel.saveLogNotification({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${response?.service?.name || '-'} #${
              response?.consecutive || '-'
            } pausado por cliente.`,
            // service_order_id: response?.id,
            model_type: 1,
            type: 7,
            to_user_id: serviceData?.technical_id,
            payload: {service_order_id: response.id},
          },
          // to_user_type: 1,
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

  const onContinueService = async item => {
    if (serviceData?.customer_state === 1) {
      return;
    }
    // const dataSend = {
    //   ...serviceData,
    //   date: null,
    //   hour: null,
    // };
    // layoutRef?.current?.setLoading({state: true});
    // const response = await ServiceOrderModel.updateServiceOrder(dataSend);
    // layoutRef?.current?.setLoading({state: false});
    NavigationService.navigate({
      name: 'AdminScheduleServicesModal',
      params: {
        service: serviceData,
        habilitar: true,
      },
    });
    // if (response) {
    // } else {
    //   layoutRef?.current?.setSnack({
    //     state: true,
    //     message: 'Error',
    //     type: 'error',
    //   });
    // }
  };

  const handleClosePress = () => bottomSheetRef.current?.close();
  const handleOpenDetails = () => bottomSheetRef.current?.open();

  const goToDetails = () => {
    NavigationService.navigate({
      name: 'ModalServiceTrackingDetails',
      params: {
        service: serviceData,
      },
    });
  };
  const handleEdit = () => {
    NavigationService.navigate({
      name: 'AdminScheduleServicesModal',
      params: {
        service: serviceData,
      },
    });
  };
  const alertDel = async () => {
    setModalDelete(true);
  };
  const handleDel = async () => {
    setModalDelete(false);
    layoutRef?.current?.setLoading({state: true});
    const response = await ServiceOrderModel.updateServiceOrder({
      id: serviceData.id,
      deleted_date: new Date(),
    });
    layoutRef?.current?.setLoading({state: false});
    if (response) {
      if (appStoreUserProfile?.id === serviceData?.customer_id) {
        NotificationsLogsModel.saveLogNotification({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${response?.service?.name || '-'} #${
              response?.consecutive || '-'
            } eliminado.`,
            // service_order_id: response?.id,
            model_type: 1,
            type: 15,
            payload: {service_order_id: response.id},
          },
          to_user_type: 1,
        });
        NotificationsLogsModel.saveLogNotification({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${response?.service?.name || '-'} #${
              response?.consecutive || '-'
            } eliminado.`,
            // service_order_id: response?.id,
            model_type: 1,
            type: 15,
            to_user_id: response?.technical_id,
            payload: {service_order_id: response.id},
          },
        });
      }
      if (appStoreUserProfile?.type === 1) {
        NotificationsLogsModel.saveLogNotification({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${response?.service?.name || '-'} #${
              response?.consecutive || '-'
            } eliminado.`,
            // service_order_id: response?.id,
            model_type: 1,
            type: 16,
            to_user_id: response?.customer_id,
            payload: {service_order_id: response.id},
          },
        });
        NotificationsLogsModel.saveLogNotification({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${response?.service?.name || '-'} #${
              response?.consecutive || '-'
            } eliminado.`,
            // service_order_id: response?.id,
            model_type: 1,
            type: 16,
            to_user_id: response?.technical_id,
            payload: {service_order_id: response.id},
          },
        });
      }
      // NavigationService.goBack();
      NavigationService.navigate({name: 'AdminServicesListView'});
    }
  };

  const onSetDirection = direction => {};

  const handleChat = async type => {
    let dataChat = {
      type,
      model_id: serviceData?.id,
      model_type: 1,
      title: `${serviceData?.service?.name || '-'} #${
        serviceData?.consecutive || '-'
      }.`,
    };
    layoutRef?.current?.setLoading({state: true});
    const dbChat = await ChatModel.initChatServiceOrder(dataChat);
    layoutRef?.current?.setLoading({state: false});

    NavigationService.navigate({
      name: 'ChatMessages',
      params: {
        // service: serviceData,
        chat: dbChat,
      },
    });
  };
  const setMarkerCurrentLocation = async () => {
    try {
      const info = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject);
      });

      const coords = info.coords;
      const {latitude, longitude} = coords;
      setOriginMap({...originMap, latitude, longitude});
      setRegion({
        ...region,
        latitude,
        longitude,
      });
    } catch (error) {
      console.error('Error getting geolocation', error);
    }
  };

  const handleZoomIn = () => {
    let latD = mapViewRegionData?.latitudeDelta || zoom;
    let longD = mapViewRegionData?.longitudeDelta || zoom;
    setRegion({
      ...region,
      latitudeDelta: latD * 0.5,
      longitudeDelta: longD * 0.5,
    });
  };

  const handleZoomOut = () => {
    let latD = mapViewRegionData?.latitudeDelta || zoom;
    let longD = mapViewRegionData?.longitudeDelta || zoom;
    setRegion({
      ...region,
      latitudeDelta: latD * 1.5,
      longitudeDelta: longD * 1.5,
    });
  };

  const openExternalMapApp = () => {
    setExternalMapModal(true);
  };

  const changeStateOrder = async () => {
    let state = 0;
    let order;

    // si el tecnico no la ha aceptado y no es el admin o es cliente
    if (
      (!(serviceData?.technical_state === 3) &&
        appStoreUserProfile.type !== 1) ||
      appStoreUserProfile?.type === 3
    ) {
      return;
    }

    if (
      serviceData.state === 1 ||
      serviceData.state === 2 ||
      serviceData.state === 12
    ) {
      if (serviceCotizacion?.id) {
        await ServiceOrderCotizacionModel.update({
          id: serviceCotizacion?.id,
          state: 1,
        });
      }
      state = 3;
    }
    if (serviceData.state === 3) {
      //valida obs/fotos llegada a predio
      state = 4;
    }
    if (serviceData.state === 4) {
      // no valida, simplemente pasa a cotizacion
      state = 5;
    }
    if (serviceData.state === 5) {
      // valida form de cotizacion para pasar a ejecucion
      state = 6;
    }
    if (serviceData.state === 6) {
      // finaliza ejecucion, valida fotos antes y despues
      state = 7;
    }
    if (serviceData.state === 7) {
      // valida form de soportes (firmas) para pasar a pago
      state = 8;
    }
    if (serviceData.state === 8) {
      //muestra form para evidencia de pago, cambia estado a pagado
      state = 9;
    }
    if (serviceData.state === 9) {
      //no valida nada, pasa a finalizado
      state = 10;
    }

    if (state && state <= 4) {
      order = await ServiceOrderModel.updateServiceOrder({
        id: serviceData.id,
        state: state,
      });
      stopWatchingPosition();

      if (state === 3) {
        // notificacion a admins
        NotificationsLogsModel.saveLogNotification({
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
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          NotificationsLogsModel.saveLogNotification({
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
      if (state === 4) {
        // notificacion a admins
        NotificationsLogsModel.saveLogNotification({
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
        // notificacion a customer
        if (serviceData?.customer_id && serviceData?.customer_id !== '') {
          NotificationsLogsModel.saveLogNotification({
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
    } else {
      if (appStoreUserProfile.type === 1 && serviceData?.state === 10) {
        NavigationService.navigate({
          name: 'ModalServiceOrderEntregaAdminTech',
          params: {
            service_order_id: serviceData?.id,
          },
        });
      } else {
        goToDetails();
      }
    }
  };
  const onSetTechnicalState = async state => {
    layoutRef?.current?.setLoading({state: true});
    let dataSend = {
      id: serviceData.id,
      technical_state: state,
    };
    if (state === 2) {
      dataSend.technical_id = null;
    }
    const response = await ServiceOrderModel.updateServiceOrder(dataSend);
    layoutRef?.current?.setLoading({state: false});
    if (response) {
      if (state === 2) {
        // notificacion admins
        NotificationsLogsModel.saveLogNotification({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${response?.service?.name || '-'} #${
              response?.consecutive || '-'
            } fue rechazado por ${
              cropText(appStoreUserProfile?.full_name, 15) || '-'
            }.`,
            // service_order_id: response?.id,
            model_type: 1,
            type: 3,
            payload: {service_order_id: response.id},
          },
          to_user_type: 1,
        });
      }
      if (state === 3) {
        // notificacion admins
        NotificationsLogsModel.saveLogNotification({
          data: {
            from_user_id: appStoreUserProfile?.id || null,
            message: `Servicio ${response?.service?.name || '-'} #${
              response?.consecutive || '-'
            } fue aceptado por ${
              cropText(appStoreUserProfile?.full_name, 15) || '-'
            }.`,
            // service_order_id: response?.id,
            model_type: 1,
            type: 4,
            payload: {service_order_id: response.id},
          },
          to_user_type: 1,
        });
      }
      bottomSheetContenListRef?.current?.close();
    } else {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Error',
        type: 'error',
      });
    }
  };

  const onModalUsersInfo = async user_id => {
    layoutRef?.current?.setLoading({
      state: true,
      message: 'Cargando...',
    });
    setModalUserInfoData(null);
    const userProfile = await UserModel.getById(user_id);
    setModalUserInfoData(userProfile);
    layoutRef?.current?.setLoading({
      state: false,
    });
    setOpenModalUsersInfo(true);
  };

  return (
    <>
      <AppLayout ref={layoutRef} hiddenBottomBarMenu>
        {/* <CoreText>{isTraking ? 'true' : 'false'}</CoreText>
        <CoreText>{JSON.stringify(destinationMap)}</CoreText>
        <CoreText>{JSON.stringify(originMap)}</CoreText> */}
        {showContent ? (
          <>
            {/* <CoreText>{params?.service?.id || ''}</CoreText>
            <CoreText>{params?.service?.service?.name || ''}</CoreText>
            <CoreText>
              {JSON.stringify(params?.service?.loc_address_coords)}
            </CoreText>
            <CoreText>{JSON.stringify(destinationMap)}</CoreText>
            <CoreText>{JSON.stringify(originMap)}</CoreText> */}
            <View >
              {apiKey && apiKey !== '' && region?.latitude ? (
                <SimpleMapView
                  apiKey={apiKey}
                  region={region}
                  destinationMap={destinationMap}
                  originMap={originMap}
                  technicalOrigin={technicalOrigin}
                  onRegionChangeComplete={onRegionChangeComplete}
                  onSetDirection={onSetDirection}
                />
              ) : (
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5'
                }}>
                  <ActivityIndicator size="large" color="#0000ff" />
                  <CoreText>API Key: {apiKey ? 'OK' : 'Missing'}</CoreText>
                  <CoreText>Region: {region?.latitude ? 'OK' : 'Missing'}</CoreText>
                  <CoreText>Lat: {region?.latitude}</CoreText>
                  <CoreText>Lng: {region?.longitude}</CoreText>
                </View>
              )}
              
              {/* Código comentado para centrar vista - conservado para referencia futura */}
              <Pressable
                style={{
                  position: 'absolute',
                  top: 40,
                  right: 0,
                  margin: 20,
                  elevation: 5,
                }}
                onPress={() => onModalUsersInfo(serviceData?.technical_id)}>
                <Avatar.Image
                  size={60}
                  source={require('@src/assets/img/operator_avatar.png')}
                  style={{
                    backgroundColor: themeData?.colors.primary,
                    elevation: 5,
                  }}
                />
              </Pressable>
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  // right: 16,
                  width: '100%',
                  alignItems: 'flex-end',
                }}>
                {apiKey && apiKey !== '' && region?.latitude != null ? (
                  <>
                    <View
                      style={{
                        flexDirection: 'column',
                      }}>
                      {/* <TouchableOpacity
                        onPress={stopWatchingPosition}
                        style={{
                          padding: 5,
                          margin: 5,
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: 'orange',
                          backgroundColor: 'orange',
                          shadowColor: '#000', // Color de la sombra
                          shadowOffset: {width: 0, height: 2}, // Dirección y distancia de la sombra
                          shadowOpacity: 0.25, // Opacidad de la sombra
                          shadowRadius: 3.84, // Radio del blur de la sombra
                          elevation: 5, // Elevación en Android para aplicar sombra
                        }}>
                        <CoreIconMaterialCommunity
                          name="transit-connection-variant"
                          size={25}
                          style={{
                            color: themeData.colors.onPrimary,
                          }}
                        />
                      </TouchableOpacity> */}
                      {/* user es admin o tecnico asignado y el estado de la orden es < 4 */}
                      {(appStoreUserProfile?.type === 1 ||
                        appStoreUserProfile?.id ===
                          serviceData?.technical_id) &&
                      serviceData?.state < 4 ? (
                        <>
                          <TouchableOpacity
                            onPress={openExternalMapApp}
                            style={{
                              padding: 5,
                              margin: 5,
                              borderWidth: 1,
                              borderRadius: 10,
                              borderColor: 'orange',
                              backgroundColor: 'orange',
                              shadowColor: '#000', // Color de la sombra
                              shadowOffset: {width: 0, height: 2}, // Dirección y distancia de la sombra
                              shadowOpacity: 0.25, // Opacidad de la sombra
                              shadowRadius: 3.84, // Radio del blur de la sombra
                              elevation: 5, // Elevación en Android para aplicar sombra
                            }}>
                            <CoreIconMaterialCommunity
                              name="exit-to-app"
                              size={25}
                              style={{
                                color: themeData.colors.onPrimary,
                              }}
                            />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <></>
                      )}
                      <TouchableOpacity
                        onPress={handleZoomIn}
                        // disabled={
                        //   !(
                        //     destinationMap?.longitude &&
                        //     destinationMap?.latitude &&
                        //     region?.latitude
                        //   )
                        // }
                        style={{
                          padding: 5,
                          margin: 5,
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: 'orange',
                          backgroundColor: 'orange',
                          shadowColor: '#000', // Color de la sombra
                          shadowOffset: {width: 0, height: 2}, // Dirección y distancia de la sombra
                          shadowOpacity: 0.25, // Opacidad de la sombra
                          shadowRadius: 3.84, // Radio del blur de la sombra
                          elevation: 5, // Elevación en Android para aplicar sombra
                        }}>
                        <CoreIconMaterialCommunity
                          name="magnify-plus-outline"
                          size={25}
                          style={{
                            color: themeData.colors.onPrimary,
                          }}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleZoomOut}
                        // disabled={
                        //   !(
                        //     destinationMap?.longitude &&
                        //     destinationMap?.latitude &&
                        //     region?.latitude
                        //   )
                        // }
                        style={{
                          padding: 5,
                          margin: 5,
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: 'orange',
                          backgroundColor: 'orange',
                          shadowColor: '#000', // Color de la sombra
                          shadowOffset: {width: 0, height: 2}, // Dirección y distancia de la sombra
                          shadowOpacity: 0.25, // Opacidad de la sombra
                          shadowRadius: 3.84, // Radio del blur de la sombra
                          elevation: 5, // Elevación en Android para aplicar sombra
                        }}>
                        <CoreIconMaterialCommunity
                          name="magnify-minus-outline"
                          size={25}
                          style={{
                            color: themeData.colors.onPrimary,
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <CoreText>No map</CoreText>
                  </>
                )}

                <View style={{width: '100%'}}>
                  <View
                    statusBarHeight={0}
                    style={[
                      styles.appBar,
                      {
                        backgroundColor: themeData.colors.primary,
                        marginHorizontal: 10,
                        borderRadius: 20,
                        marginBottom: 40,
                      },
                    ]}>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          {
                            margin: 5,
                            borderRadius: 70,
                            // backgroundColor:
                            //   routeName &&
                            //   routeName !== 'HomeView' &&
                            //   routeName !== 'App'
                            //     ? themeData.colors.secondary
                            //     : themeData.colors.primary,
                          },
                        ]}
                        onPress={() => handleOpenDetails()}>
                        <CoreIconMaterialCommunity
                          name="message-cog-outline"
                          size={25}
                          style={{
                            color: themeData.colors.onPrimary,
                          }}
                        />
                        <CoreText
                          style={{
                            color: themeData.colors.onPrimary,
                          }}>
                          {asistecData.services_order_state.find(
                            x => x.id === serviceData?.state,
                          )?.name || 'Detalles'}
                        </CoreText>
                      </TouchableOpacity>
                      {/* <TouchableOpacity
                        style={[
                          styles.button,
                          {
                            margin: 5,
                            borderRadius: 70,
                            // backgroundColor:
                            //   routeName &&
                            //   routeName !== 'HomeView' &&
                            //   routeName !== 'App'
                            //     ? themeData.colors.secondary
                            //     : themeData.colors.primary,
                          },
                        ]}
                        onPress={() => handleEdit()}>
                        <CoreIconMaterial
                          name="mode-edit"
                          size={25}
                          style={{
                            color: themeData.colors.onPrimary,
                          }}
                        />
                        <CoreText
                          style={{
                            color: themeData.colors.onPrimary,
                          }}>
                          Editar
                        </CoreText>
                      </TouchableOpacity> */}
                      {/* <TouchableOpacity
                        style={[
                          styles.button,
                          {
                            margin: 5,
                            borderRadius: 70,
                            // backgroundColor:
                            //   routeName &&
                            //   routeName !== 'HomeView' &&
                            //   routeName !== 'App'
                            //     ? themeData.colors.secondary
                            //     : themeData.colors.primary,
                          },
                        ]}
                        onPress={() =>
                          NavigationService.navigate({
                            name: 'AdminServicesListView',
                          })
                        }>
                        <CoreIconMaterial
                          name="arrow-back"
                          size={25}
                          style={{
                            color: themeData.colors.onPrimary,
                          }}
                        />
                        <CoreText
                          style={{
                            color: themeData.colors.onPrimary,
                          }}>
                          Atras
                        </CoreText>
                      </TouchableOpacity> */}
                    </View>
                  </View>
                </View>
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

        <Portal>
          <Dialog onDismiss={() => setModalDelete(false)} visible={modalDelete}>
            <Dialog.Icon icon="alert" />
            <Dialog.Title style={styles.title}>Eliminar</Dialog.Title>
            <Dialog.Content>
              <CoreText>
                Eliminaras un servicio que esta agendado actualmente, si
                continuas no podras recuperar la informacion ingresada en el
                servicio. Deseas continuar?
              </CoreText>
            </Dialog.Content>
            <Dialog.Actions>
              <CoreButton onPress={() => setModalDelete(false)}>
                Cancelar
              </CoreButton>
              <CoreButton
                mode="text"
                textColor={themeData.colors.error}
                onPress={() => handleDel()}>
                Continuar
              </CoreButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog
            onDismiss={() => setOpenModalUsersInfo(false)}
            visible={openModalUsersInfo}
            style={{borderRadius: 46, padding: 0, margin: 0}}>
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                padding: 0,
                paddingTop: 5,
                marginTop: 0,
                paddingBottom: 0,
                width: '100%',
                borderRadius: 46,
              }}>
              <View style={{margin: 0, padding: 0}}>
                <Card
                  style={{
                    padding: 5,
                    backgroundColor: 'white',
                    elevation: 0,
                  }}
                  mode="contained">
                  <CoreImage
                    style={{width: 80, height: 80}}
                    source={require('@src/assets/img/cropped-Logo-PNG.png')}
                  />
                </Card>
              </View>
              <View
                style={{
                  padding: 0,
                  margin: 0,
                  marginTop: 10,
                  width: 172, // Tamaño total (80 de imagen + 2*4 de borde)
                  height: 172,
                  borderWidth: 6,
                  borderColor: themeData.colors.asistectSec,
                  borderRadius: 85, // La mitad del tamaño total para que sea un círculo
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Avatar.Image
                  size={160}
                  source={
                    modalUserInfoData?.photo_url
                      ? {uri: modalUserInfoData?.photo_url}
                      : require('@src/assets/img/operator_avatar.png')
                  }
                  style={{backgroundColor: themeData.colors.primary}}
                />
              </View>
              <CoreImage
                style={{
                  // top: '25%',
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  zIndex: -1,
                  borderRadius: 46, // La mitad del tamaño total para que sea un círculo
                }}
                source={require('@src/assets/img/user_info_card_bg.png')}
              />
              <View
                style={{
                  alignItems: 'center',
                  marginTop: 20,
                  padding: 0,
                  // backgroundColor: 'white',
                  width: '100%',
                }}>
                <CoreText variant="titleLarge" style={{padding: 0, margin: 0}}>
                  {modalUserInfoData?.full_name || ''}
                </CoreText>
                <CoreText variant="titleMedium">
                  C.c: {modalUserInfoData?.number_doc || ''}
                </CoreText>
                <CoreText variant="titleMedium">
                  {modalUserInfoData?.blood_type || ''}
                </CoreText>
              </View>
              <View
                style={{
                  backgroundColor: themeData.colors.primary,
                  padding: 10,
                  width: '100%',
                  alignItems: 'center',
                  marginTop: 10,
                  borderBottomEndRadius: 46,
                  borderBottomLeftRadius: 46,
                }}>
                <CoreText variant="titleMedium" style={{color: 'white'}}>
                  {modalUserInfoData?.type === 1
                    ? 'ADMINISTRADOR'
                    : modalUserInfoData?.type === 2
                    ? 'TECNICO SUPERVISOR'
                    : modalUserInfoData?.type === 3
                    ? 'CLIENTE'
                    : ''}
                </CoreText>
              </View>
              {/* <View
                style={{
                  margin: 0,
                  padding: 0,
                  marginTop: 10,
                  paddingTop: 10,
                  paddingBottom: 10,
                  alignItems: 'center',
                  width: '100%',
                  backgroundColor: themeData.colors.primary,
                  borderRadius: 30,
                }}>
                <CoreText variant="titleMedium" style={{color: 'white'}}>
                  TECNICO SUSPERVISOR
                </CoreText>
              </View> */}
            </View>
          </Dialog>
        </Portal>

        <Popup
          isVisible={externalMapModal}
          onCancelPressed={() => setExternalMapModal(false)}
          onAppPressed={() => setExternalMapModal(false)}
          onBackButtonPressed={() => setExternalMapModal(false)}
          modalProps={{
            animationIn: 'slideInUp',
          }}
          appsWhiteList={['waze', 'google-maps']}
          options={{
            latitude: destinationMap?.latitude,
            longitude: destinationMap?.longitude,
            dialogTitle: 'Usar app externa',
            dialogMessage: 'Selecciona la app que deseas usar',
            cancelText: 'Cancelar',
          }}
          style={{}}
        />

        <CoreBottomSheet
          ref={bottomSheetRef}
          snapPointsLst={['70%']}
          indexInitial={0}
          modalContent={() => (
            <ModalContent
              // ref={asistecPickLocationRef}
              dataObject={serviceData}
              userData={userProfileStore}
              onChangeState={changeStateOrder}
              onEditFnt={handleEdit}
              onDelFnt={alertDel}
              goToDetails={goToDetails}
              onSetTechnical={() => openModalContentList()}
              onSetTechnicalMe={() => onSetTechnicalMe()}
              onSetTechnicalState={onSetTechnicalState}
              onPauseService={onPauseService}
              onContinueService={onContinueService}
              onChatFnt={handleChat}
              countServiceChatMessages={{
                customer: countServiceChatMessagesCus,
                technical: countServiceChatMessagesTech,
              }}
              onModalUsersInfo={onModalUsersInfo}
            />
          )}
        />

        <CoreBottomSheet
          ref={bottomSheetContenListRef}
          snapPointsLst={['75%']}
          modalContent={() => (
            <ContentList
              items={itemsContentList}
              // loading={loadingList}
              onClose={() => bottomSheetContenListRef?.current?.close()}
              onSelect={onSelectTechnicalContentList}
            />
          )}
        />
      </AppLayout>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 28,
  },

  appBar: {},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppView;
