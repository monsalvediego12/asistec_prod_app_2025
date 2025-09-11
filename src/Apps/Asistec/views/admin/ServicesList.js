import React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {FAB, List, Divider, Searchbar, IconButton} from 'react-native-paper';
import {useCoreTheme} from '@src/themes';
import {
  convertTimestamp,
  ServiceOrderModel,
} from '@src/Apps/Asistec/utils/firebase/firestore';
import {
  CoreText,
  CoreButton,
  CoreIconMaterial,
} from '@src/components/';
import AppConfig from '@src/app.config';
const asistecData = AppConfig.asistec_data;

import {useFocusEffect} from '@react-navigation/native';
import {useAppStore, appStoreUserProfile} from '@src/store';
import NavigationService from '@src/navigation/NavigationService';

import {useSelector, useDispatch} from 'react-redux';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';

function IndexView({route, navigation}) {
  const {themeData} = useCoreTheme();
  const params = route.params;

  // const filters_services_list_view = useSelector(
  //   state => state.app.filters_services_list_view,
  // );
  const dispatch = useDispatch();
  const selectorAppStore = useSelector(state => state.app);

  const [showContent, setShowContent] = React.useState(false);
  const {appStoreUserProfile, appFiltersListServicesOrderView} = useAppStore();
  const layoutRef = React.useRef(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const defaultLimit = 10;
  const defaultLimitIncrement = 10;
  const [limitData, setLimitData] = React.useState(defaultLimit);

  const [servicesCollection, setServicesCollection] = React.useState([]);
  const [orderData, setOrdderData] = React.useState(null);
  const [searchQuerie, setSearchQuery] = React.useState(null);

  const [filters, setFilters] = React.useState(null);

  useFocusEffect(
    React.useCallback(() => {
      setFiltersFnt(selectorAppStore.filters_services_list_view);
      return () => {
        setServicesCollection([]);
        setShowContent(false);
        setLimitData(defaultLimit);
      };
    }, [selectorAppStore]),
  );

  const onViewMore = async () => {
    if (refreshing) {
      return;
    }
    layoutRef?.current?.setLoading({state: true});
    setLimitData(limitData + defaultLimitIncrement);
    await setFiltersFnt({
      ...selectorAppStore.filters_services_list_view,
      limit: limitData + defaultLimitIncrement,
    });
    layoutRef?.current?.setLoading({state: false});
  };

  const setFiltersFnt = async (
    dataObj = selectorAppStore.filters_services_list_view,
  ) => {
    let dataFilters = dataObj;
    setFilters({
      start_date: new Date(dataFilters?.start_date),
      end_date: new Date(dataFilters?.end_date),
      state_order: dataFilters?.state_order,
      service: dataFilters?.service,
      customer: dataFilters?.customer,
      technical: dataFilters?.technical,
      city: dataFilters?.city,
      search_text: dataFilters?.search_text,
      limit: dataFilters?.limit,
    });
    setServicesCollection([]);

    let data = await ServiceOrderModel.getAllServiceOrders({
      user: appStoreUserProfile,
      startDate:
        dataFilters?.date_type !== 3 ? new Date(dataFilters?.start_date) : null,
      endDate:
        dataFilters?.date_type !== 3 ? new Date(dataFilters?.end_date) : null,
      state: dataFilters?.state_order
        ? dataFilters?.state_order === 10 && appStoreUserProfile?.type !== 1
          ? [10, 11]
          : dataFilters?.state_order
        : null,
      service_id: dataFilters?.service?.id || null,
      customer_id: dataFilters?.customer?.id || null,
      technical_id: dataFilters?.technical?.id || null,
      city_id: dataFilters?.city?.id || null,
      search_text: dataFilters?.search_text,
      limit: dataFilters?.limit || defaultLimit,
    });
    setServicesCollection(data);
    setShowContent(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await setFiltersFnt();
    setRefreshing(false);
  };

  const onSearchQuery = async item => {
    if (item === 1) {
      setFiltersFnt({
        ...selectorAppStore.filters_services_list_view,
        search_text: null,
      });
    } else {
      setFiltersFnt({
        ...selectorAppStore.filters_services_list_view,
        search_text: searchQuerie,
      });
    }
  };

  const onClickItem = async item => {
    let iteem = JSON.parse(JSON.stringify(item));
    console.log('onClickItem', iteem.id);
    NavigationService.navigate({
      name: 'ModalServiceTracking',
      params: {
        service: {...iteem},
        service_id: iteem?.id,
      },
    });
  };

  const onClickFab = async item => {
    setOrdderData({});
    NavigationService.navigate({
      name: 'AdminScheduleServicesModal',
    });
  };
  const openFilter = () => {
    navigation.navigate({
      name: 'FiltersServices',
      params: {
        filters: {
          date_type: filters.date_type, // 1 today, 2 custom
          // start_date: new Date(filters.start_date),
          // end_date: new Date(filters.end_date),
        },
      },
    });
    // NavigationService.navigate({
    //   name: 'FiltersServices',
    //   params: {
    //     filters: {
    //       date_type: filters.date_type, // 1 today, 2 custom
    //       // start_date: new Date(filters.start_date),
    //       // end_date: new Date(filters.end_date),
    //     },
    //   },
    // });
  };

  return (
    <AppLayout ref={layoutRef}>
      <View style={{flex: 1}}>
        {/* <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
            }}>

            <View style={{}}>
              <Pressable
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => openFilter()}>
                <CoreText>Filtros</CoreText>

                <CoreIconMaterial
                  name="filter-alt"
                  size={30}
                  style={
                    {
                      // color:
                    }
                  }
                />
              </Pressable>
            </View>
          </View> */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {showContent ? (
            <View style={{marginBottom: 200}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 20,
                  marginBottom: 10,
                }}>
                <Searchbar
                  dense
                  placeholder="Buscar"
                  onChangeText={query => setSearchQuery(query)}
                  value={searchQuerie}
                  style={{flex: 1, marginHorizontal: 10}}
                  mode="bar"
                  icon={() => null}
                  onClearIconPress={() => {
                    setSearchQuery(null);
                    onSearchQuery(1);
                  }}
                />
                <IconButton
                  style={{marginHorizontal: 10}}
                  icon={() => <CoreIconMaterial name="search" size={16} />}
                  mode="contained"
                  size={16}
                  onPress={() => onSearchQuery()}
                />
              </View>
              {servicesCollection.map(item => (
                <React.Fragment key={item.id}>
                  <List.Item
                    style={{
                      backgroundColor:
                        asistecData?.services_order_state?.find(
                          x => x.id === item?.state,
                        )?.color || '',
                    }}
                    onPress={() => onClickItem(item)}
                    title={() => (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View>
                          <CoreText>
                            {`${item?.service?.name || ''} #${
                              item?.consecutive || ''
                            }`}
                          </CoreText>
                        </View>
                        <View>
                          {/* <CoreText>
                            {` (${
                              asistecData?.services_order_state?.find(
                                x => x.id === item?.state,
                              )?.name || '-'
                            })`}
                          </CoreText> */}
                        </View>
                      </View>
                    )}
                    description={() => (
                      <>
                        {appStoreUserProfile?.type === 1 ||
                        appStoreUserProfile?.type === 2 ? (
                          <>
                            <CoreText>
                              {item?.customer?.full_name ||
                                'Cliente sin asignar'}
                            </CoreText>
                          </>
                        ) : (
                          <></>
                        )}

                        {appStoreUserProfile?.type === 1 ? (
                          <>
                            <CoreText>
                              {item?.technical?.full_name ||
                                'Tecnico sin asignar'}
                            </CoreText>
                          </>
                        ) : (
                          <></>
                        )}

                        <CoreText>
                          {convertTimestamp(item?.date, 'dd-MM-yyyy') || '-'}{' '}
                          {asistecData.services_order_book_times.find(
                            x => x.id === item.hour,
                          )?.name || '-'}
                        </CoreText>
                      </>
                    )}
                    right={props => (
                      <View
                        style={{
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}>
                        <List.Icon {...props} icon="chevron-right" />
                        <CoreText
                          style={
                            {
                              // color:
                              //   appStoreUserProfile?.type === 1 &&
                              //   item?.state === 11
                              //     ? themeData?.colors?.primary
                              //     : '#000',
                            }
                          }>
                          {` (${
                            item?.state === 11 &&
                            appStoreUserProfile?.type !== 1
                              ? 'Finalizado'
                              : asistecData?.services_order_state?.find(
                                  x => x.id === item?.state,
                                )?.name || '-'
                          })`}
                        </CoreText>
                      </View>
                    )}
                  />
                  <Divider />
                </React.Fragment>
              ))}
              {servicesCollection?.length > 0 ? (
                <>
                  <CoreButton
                    onPress={() => onViewMore()}
                    style={{marginVertical: 10}}>
                    Ver mas
                  </CoreButton>
                </>
              ) : (
                <>
                  <CoreText style={{textAlign: 'center', marginTop: 5}}>
                    No hay elementos para mostrar
                  </CoreText>
                </>
              )}
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
        <FAB
          icon="filter"
          onPress={() => openFilter()}
          visible={true}
          color="white"
          size={'small'}
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 70,
            backgroundColor: themeData.colors.asistectSec,
          }}
        />
        <FAB
          icon="plus"
          onPress={() => onClickFab()}
          visible={true}
          color="white"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: themeData.colors.asistectSec,
          }}
        />
      </View>
    </AppLayout>
  );
}

export default IndexView;
