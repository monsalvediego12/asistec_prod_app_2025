import React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  FAB,
  List,
  Divider,
  Card,
  Menu,
  Chip,
  IconButton,
} from 'react-native-paper';
import {useCoreTheme} from '@src/themes';
import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import {
  convertTimestampToDate,
  convertTimestamp,
  NotificationsLogsModel,
} from '@src/Apps/Asistec/utils/firebase/firestore';
import {
  CoreText,
  CoreButton,
  CoreIconMaterialCommunity,
} from '@src/components/';
import {formatearNumeroTelefono} from '@src/utils/formaters';
import {useFocusEffect} from '@react-navigation/native';
import {useAppStore} from '@src/store';
// import messaging from '@react-native-firebase/messaging';
import AppConfig from '@src/app.config';
import {DateTime} from 'luxon';
import NavigationService from '@src/navigation/NavigationService';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';

const groupNotificationsByDate = notifications => {
  // Crear un objeto para almacenar las notificaciones agrupadas
  const groupedNotifications = {
    today: [],
    yesterday: [],
    last_week: [],
    others: [],
    // Puedes agregar más categorías según tus necesidades
  };

  // Obtener la fecha de hoy para comparación en la misma zona horaria que las notificaciones
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00 en UTC

  // Iterar sobre cada notificación y clasificarla
  notifications.forEach(notification => {
    const notificationDate = convertTimestampToDate(notification.date);
    // Convertir la fecha de la notificación a la misma zona horaria que hoy (UTC)
    const notificationDateUTC = new Date(notificationDate);
    notificationDateUTC.setHours(0, 0, 0, 0);

    const diffInDays = Math.floor(
      (today - notificationDateUTC) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      groupedNotifications.today.push(notification);
    } else if (diffInDays === 1) {
      groupedNotifications.yesterday.push(notification);
    } else if (diffInDays > 1 && diffInDays <= 7) {
      groupedNotifications.last_week.push(notification);
    } else {
      groupedNotifications.others.push(notification);
    }
    // Puedes agregar más lógica para más categorías
  });

  return groupedNotifications;
};

function IndexView({navigation}) {
  const {themeData} = useCoreTheme();
  const [showContent, setShowContent] = React.useState(false);
  const layoutRef = React.useRef(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingNot, setLoadingNot] = React.useState(false);
  const [menuOpt, setMenuOpt] = React.useState(false);
  const defaultLimit = 10;
  const defaultLimitIncrement = 10;
  const [limitData, setLimitData] = React.useState(defaultLimit);
  const [filtersView, setFiltersView] = React.useState({
    model_type: 1,
    state: 1,
  });

  const [notificationsLogsCollection, setNotificationsLogsCollection] =
    React.useState([]);
  const [notificationsLogsCollectionG, setNotificationsLogsCollectionG] =
    React.useState({
      today: [],
      yesterday: [],
      last_week: [],
      others: [],
    });

  const {appStoreUserProfile, appStoreUserNotifications} = useAppStore();

  const sendNotificationIfEnabled = (notificationData) => {
    if (AppConfig?.active_notifications) {
      NotificationsLogsModel.saveLogNotification(notificationData);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setView();
      return () => {
        setNotificationsLogsCollection([]);
        setNotificationsLogsCollectionG(null);
        setShowContent(false);
        setLimitData(defaultLimit);
        setFiltersView({
          model_type: 1,
          state: 1,
        });
      };
    }, []),
  );
  React.useEffect(() => {
    setView();
  }, [appStoreUserNotifications]);

  const setView = async (dataFilter = filtersView) => {
    if (loadingNot) {
      return;
    }
    setLoadingNot(true);
    let data = await NotificationsLogsModel.get({
      to_user_id: appStoreUserProfile?.id,
      limit: limitData,
      ...filtersView,
      ...dataFilter,
    });
    setLoadingNot(false);
    setShowContent(true);
    setNotificationsLogsCollectionG(groupNotificationsByDate(data));
    setNotificationsLogsCollection(data);
  };

  const onFilterNot = async data => {
    if (!data?.model_type) {
      data.model_type = 1;
    }
    setFiltersView({...filtersView, ...data});
    layoutRef?.current?.setLoading({state: true});
    await setView(data);
    layoutRef?.current?.setLoading({state: false});
  };

  const allReaded = async () => {
    setMenuOpt(false);
    layoutRef?.current?.setLoading({state: true});
    await NotificationsLogsModel.allReadedByUserId({
      user_id: appStoreUserProfile?.id,
      model_type: filtersView?.model_type || 1,
    });
    await setView();
    layoutRef?.current?.setLoading({state: false});
  };

  const onRefresh = async () => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    await setView();
    setRefreshing(false);
  };

  const onViewMore = async () => {
    if (refreshing) {
      return;
    }
    layoutRef?.current?.setLoading({state: true});
    setLimitData(limitData + defaultLimitIncrement);
    await setView({limit: limitData + defaultLimitIncrement});
    layoutRef?.current?.setLoading({state: false});
  };

  const onClickNot = async data => {
    if (refreshing) {
      return;
    }
    await NotificationsLogsModel.update({
      ...data,
      state: 2,
    });
    if (data?.version && data?.version === 1) {
      if (data?.model_type === 1 && data?.payload?.service_order_id) {
        NavigationService.navigate({
          name: 'ModalServiceTracking',
          params: {service: {id: data?.payload?.service_order_id}},
        });
      }
      if (data?.model_type === 2 && data?.payload?.chat_id) {
        NavigationService.navigate({
          name: 'ChatMessages',
          params: {chat: {id: data?.payload?.chat_id}},
        });
      }
    } else {
      // sin version
      if (data?.service_order_id) {
        NavigationService.navigate({
          name: 'ModalServiceTracking',
          params: {service: {id: data?.service_order_id}},
        });
      } else {
        await setView();
      }
    }
  };

  const NotiComp = ({item}) => {
    return (
      <Card
        onPress={() => onClickNot(item)}
        mode="contained"
        style={{
          paddingHorizontal: 15,
          paddingBottom: 5,
          marginVertical: 2,
          // borderBottomWidth: 1,
          // borderBottomColor: 'lightgray',
          ...(item?.state > 1 ? {backgroundColor: 'transparent'} : {}),
          // backgroundColor: item?.state > 1 ? 'transparent' : null,
        }}>
        <Card.Content
          style={{
            flexDirection: 'row',
            paddingHorizontal: 0,
            paddingBottom: 5,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 5,
            }}>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 50,
                padding: 5,
                borderColor: 'lightgray',
              }}>
              {!item?.version ||
              (item?.version === 1 && item?.model_type === 1) ? (
                <>
                  <CoreIconMaterialCommunity
                    name={
                      item?.type === 2 ||
                      item?.type === 4 ||
                      item?.type === 8 ||
                      item?.type === 17
                        ? 'check'
                        : item?.type === 3 ||
                          item?.type === 15 ||
                          item?.type === 16
                        ? 'close'
                        : item?.type === 5
                        ? 'car-arrow-right'
                        : item?.type === 6
                        ? 'car-select'
                        : item?.type === 9
                        ? 'file-chart-outline'
                        : item?.type === 10
                        ? 'account-cog-outline'
                        : item?.type === 11
                        ? 'file-cog-outline'
                        : item?.type === 7 ||
                          item?.type === 12 ||
                          item?.type === 18
                        ? 'timer-sand'
                        : item?.type === 13
                        ? 'cash-check'
                        : item?.type === 14
                        ? 'check-bold'
                        : 'dots-grid'
                    }
                    size={25}
                  />
                </>
              ) : (
                <>
                  {item?.model_type === 2 ? (
                    <>
                      <CoreIconMaterialCommunity
                        name={'message-text'}
                        size={25}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </View>
          </View>
          <CoreText titleVariant="titleMedium" style={{flexShrink: 1}}>
            {/* Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. */}
            {item.message || ''}
          </CoreText>
        </Card.Content>
        <CoreText style={{textAlign: 'right', fontSize: 10}}>
          {convertTimestamp(item.date, 'dd-MM-yyyy HH:mm')}
        </CoreText>
      </Card>
    );
  };

  return (
    <AppLayout ref={layoutRef}>
      <View style={{flex: 1, paddingHorizontal: 5}}>
        {/* <CoreButton
          onPress={() =>
            sendNotificationIfEnabled({
              data: {to_user_id: appStoreUserProfile?.id},
            })
          }>
          test
        </CoreButton> */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {showContent ? (
            <>
              <View
                style={{
                  paddingTop: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Chip
                    style={{marginHorizontal: 4, maxHeight: 30}}
                    onPress={() => onFilterNot({state: null, model_type: 1})}
                    disabled={
                      filtersView?.model_type === 1 && !filtersView?.state
                    }>
                    Todo
                  </Chip>
                  <Chip
                    style={{marginHorizontal: 4, maxHeight: 30}}
                    onPress={() => onFilterNot({state: 1, model_type: 1})}
                    disabled={
                      filtersView?.model_type === 1 && filtersView?.state === 1
                    }>
                    Sin leer
                  </Chip>
                  {/* <Chip
                    style={{marginHorizontal: 4, maxHeight: 30}}
                    onPress={() => onFilterNot({state: null, model_type: 2})}
                    disabled={
                      filtersView?.model_type === 2 && !filtersView?.state
                    }>
                    Mensajes
                  </Chip> */}
                </View>
                <View>
                  <Menu
                    visible={menuOpt}
                    onDismiss={() => setMenuOpt(false)}
                    anchor={
                      <IconButton
                        style={{}}
                        icon="dots-horizontal"
                        size={24}
                        onPress={() => setMenuOpt(true)}
                      />
                    }>
                    <Menu.Item
                      dense
                      onPress={() => allReaded()}
                      title="Marcar todo como leido"
                    />
                  </Menu>
                </View>
              </View>

              {notificationsLogsCollectionG?.today &&
              notificationsLogsCollectionG?.today.length > 0 ? (
                <>
                  <CoreText variant="titleMedium">Hoy</CoreText>
                  {notificationsLogsCollectionG?.today?.map(item => (
                    <React.Fragment key={item.id}>
                      <NotiComp item={item} />
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <></>
              )}

              {notificationsLogsCollectionG?.yesterday &&
              notificationsLogsCollectionG?.yesterday.length > 0 ? (
                <>
                  <CoreText variant="titleMedium">Ayer</CoreText>
                  {notificationsLogsCollectionG?.yesterday?.map(item => (
                    <React.Fragment key={item.id}>
                      <NotiComp item={item} />
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <></>
              )}

              {notificationsLogsCollectionG?.last_week &&
              notificationsLogsCollectionG?.last_week.length > 0 ? (
                <>
                  <CoreText variant="titleMedium">La semana pasada</CoreText>
                  {notificationsLogsCollectionG?.last_week?.map(item => (
                    <React.Fragment key={item.id}>
                      <NotiComp item={item} />
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <></>
              )}

              {notificationsLogsCollectionG?.others &&
              notificationsLogsCollectionG?.others.length > 0 ? (
                <>
                  <CoreText variant="titleMedium">Hace tiempo</CoreText>
                  {notificationsLogsCollectionG?.others?.map(item => (
                    <React.Fragment key={item.id}>
                      <NotiComp item={item} />
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <></>
              )}
              {notificationsLogsCollectionG?.today.length > 0 ||
              notificationsLogsCollectionG?.yesterday.length > 0 ||
              notificationsLogsCollectionG?.last_week.length > 0 ||
              notificationsLogsCollectionG?.others.length > 0 ? (
                <>
                  <CoreButton
                    onPress={() => onViewMore()}
                    style={{marginVertical: 10}}>
                    Ver mas
                  </CoreButton>
                </>
              ) : (
                <>
                  <>
                    <CoreText style={{textAlign: 'center', marginTop: 5}}>
                      No hay elementos para mostrar
                    </CoreText>
                  </>
                </>
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
      </View>
    </AppLayout>
  );
}

export default IndexView;
