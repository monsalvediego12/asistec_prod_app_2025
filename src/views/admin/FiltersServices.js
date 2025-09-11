import * as React from 'react';
import {
  // ScrollView,
  View,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  AppLayout,
  CoreBottomSheet,
  CoreIconMaterial,
} from '@src/components/';
import {Chip, List, Divider, IconButton} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCoreTheme} from '@src/themes';
import DatePicker from 'react-native-date-picker';
import {core_print_date} from '@src/utils/core_dates';
import AppConfig from '@src/app.config';
const asistecData = AppConfig.asistec_data;

import {
  ServiceModel,
  UserModel,
  ServiceOrderModel,
  CitiesConfigModel,
} from '@src/utils/firebase/firestore';
import {useAppStore, appStoreUserProfile} from '@src/store';
import NavigationService from '@src/navigation/NavigationService';
import {useSelector, useDispatch} from 'react-redux';
import {setFiltersListServicesOrderView} from '@src/redux/slice/appSlice';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';

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

    return (
      <View style={{paddingHorizontal: 10}}>
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
          <View style={{paddingTop: 20}}>
            <ScrollView>
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
              <View>
                <List.Item
                  title={'Todos'}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => onSelectItem(null)}
                />
                <Divider />
              </View>
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
  const {
    appStoreUserProfile,
    appFiltersListServicesOrderView,
    // setFiltersListServicesOrderView,
  } = useAppStore();

  // const filters_services_list_view = useSelector(
  //   state => state.app.filters_services_list_view,
  // );
  const dispatch = useDispatch();
  const selectorAppStore = useSelector(state => state.app);

  const layoutRef = React.useRef(null);
  const coreBottomSheetRef = React.useRef(null);
  const [loadingList, setLoadingList] = React.useState(false);
  const [itemsBottomSheet, setItemsBottomSheet] = React.useState([]);
  const [bottomSheetType, setBottomSheetType] = React.useState(null);

  const [showContent, setShowContent] = React.useState(false);

  const [loading, setLoading] = React.useState(null);
  const [openPikerDate, setOpenPikerDate] = React.useState(false);
  const [openPikerDateEnd, setOpenPikerDateEnd] = React.useState(false);

  const defaultFilters = {
    date_type: 1, // 1 today, 2 custom
    start_date: new Date(),
    end_date: new Date(),
    state_order: 0,
    service: null,
    customer: null,
    technical: null,
    city: null,
  };
  const [filters, setFilters] = React.useState(null);

  const [statesServicesOrder, setStatesServicesOrder] = React.useState(
    asistecData.services_order_state,
  );

  const [listBookTimes, setListBookTimes] = React.useState(
    asistecData.services_order_book_times,
  );

  const openBottomSheet = async () => {
    coreBottomSheetRef.current.open();
  };

  const closeBottomSheet = async () => {
    coreBottomSheetRef.current.close();
  };

  const changeDateType = type => {
    if (type === 1) {
      setFilters({
        ...filters,
        date_type: type,
        start_date: new Date(new Date().setHours(0, 0, 0, 0)),
        end_date: new Date(new Date().setHours(23, 59, 59, 999)),
      });
    }
    if (type === 2) {
      setFilters({...filters, date_type: type});
    }
    if (type === 3) {
      setFilters({...filters, date_type: 3});
    }
  };

  const changeState = state => {
    setFilters({...filters, state_order: state});
  };

  // Usar NavigationService para ser consistente con el resto de la app
  const goBack = () => {
    NavigationService.navigate({name: 'AdminServicesListView'});
  };

  useFocusEffect(
    React.useCallback(() => {
      setForm();
      return () => {
        setShowContent(false);
      };
    }, []),
  );

  const setForm = async () => {
    setFilters({
      ...defaultFilters,
      date_type: 2,
      service: selectorAppStore?.filters_services_list_view?.service,
      customer: selectorAppStore?.filters_services_list_view?.customer,
      technical: selectorAppStore?.filters_services_list_view?.technical,
      city: selectorAppStore?.filters_services_list_view?.city,
      state_order: selectorAppStore?.filters_services_list_view?.state_order,
      start_date: new Date(
        selectorAppStore.filters_services_list_view?.start_date,
      ),
      end_date: new Date(selectorAppStore.filters_services_list_view?.end_date),
    });
    setStatesServicesOrder(
      appStoreUserProfile?.type === 1
        ? asistecData.services_order_state
        : asistecData.services_order_state.filter(x => x.id !== 11),
    );
    setShowContent(true);
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
    }
    setItemsBottomSheet(data);
    setLoadingList(false);
  };

  const onSelectItemBottomSheet = item => {
    if (bottomSheetType === 'service') {
      setFilters({...filters, service: item});
    }
    if (bottomSheetType === 'customer') {
      setFilters({
        ...filters,
        customer: {id: item?.id, full_name: item?.full_name || 'Todos'},
      });
    }
    if (bottomSheetType === 'technical') {
      setFilters({
        ...filters,
        technical: {id: item?.id, full_name: item?.full_name || 'Todos'},
      });
    }

    if (bottomSheetType === 'city') {
      setFilters({
        ...filters,
        city: {id: item?.id, name: item?.name || 'Todos'},
      });
    }

    onCloseBottomSheet();
  };

  const onCloseBottomSheet = () => {
    closeBottomSheet();
    setItemsBottomSheet([]);
    setBottomSheetType(null);
  };

  const applyFilters = () => {
    dispatch(
      setFiltersListServicesOrderView({
        start_date: new Date(
          new Date(filters.start_date).setHours(0, 0, 0, 0),
        ).getTime(),
        end_date: new Date(
          new Date(filters.end_date).setHours(23, 59, 59, 999),
        ).getTime(),
        state_order: filters.state_order,
        service: filters.service,
        customer: filters.customer,
        technical: filters.technical,
        city: filters.city,
        date_type: filters.date_type,
      }),
    );
    // Navegar específicamente a AdminServicesListView después de aplicar filtros
    NavigationService.navigate({name: 'AdminServicesListView'});
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
        <ScrollView>
          {showContent ? (
            <>
              <View style={{paddingHorizontal: 10}}>
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
                  <>
                    <View style={{paddingTop: 20}}>
                      <CoreText style={{fontWeight: 'bold'}}>Fecha</CoreText>
                      <ScrollView
                        horizontal={true}
                        contentContainerStyle={{paddingHorizontal: 4}}>
                        <View style={{flexDirection: 'row', marginVertical: 5}}>
                          <Chip
                            style={{margin: 4}}
                            disabled={filters?.date_type === 3}
                            onPress={() => changeDateType(3)}>
                            Todos
                          </Chip>
                          <Chip
                            style={{margin: 4}}
                            disabled={filters?.date_type === 1}
                            onPress={() => changeDateType(1)}>
                            Hoy (
                            {new Date().toLocaleDateString('es-ES', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                            )
                          </Chip>
                          <Chip
                            style={{margin: 4}}
                            disabled={filters?.date_type === 2}
                            onPress={() => changeDateType(2)}>
                            Personalizado
                          </Chip>
                        </View>
                      </ScrollView>
                      {filters?.date_type === 2 ? (
                        <>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Pressable
                              style={{flex: 1, paddingHorizontal: 3}}
                              onPress={() => setOpenPikerDate(true)}>
                              <CoreTextInput
                                value={core_print_date(
                                  filters?.start_date?.toISOString(),
                                )}
                                label="Inicio (*)"
                                mode="outlined"
                                editable={false}
                                pointerEvents="none"
                                dense
                              />
                            </Pressable>
                            <Pressable
                              style={{flex: 1, paddingHorizontal: 3}}
                              onPress={() => setOpenPikerDateEnd(true)}>
                              <CoreTextInput
                                value={core_print_date(
                                  filters?.end_date?.toISOString(),
                                )}
                                label="Fin (*)"
                                mode="outlined"
                                editable={false}
                                pointerEvents="none"
                                dense
                              />
                            </Pressable>
                          </View>
                        </>
                      ) : (
                        <></>
                      )}
                    </View>

                    <View style={{paddingTop: 20}}>
                      <CoreText style={{fontWeight: 'bold'}}>Estado</CoreText>
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                        }}>
                        <Chip
                          disabled={filters.state_order === 0}
                          style={{margin: 4}}
                          onPress={() => changeState(0)}>
                          Todos
                        </Chip>
                        {statesServicesOrder.map(item => (
                          <Chip
                            disabled={filters.state_order === item.id}
                            key={item.id}
                            style={{margin: 4}}
                            onPress={() => changeState(item.id)}>
                            {item.name}
                          </Chip>
                        ))}
                      </View>
                    </View>
                    <CoreText style={{fontWeight: 'bold', marginTop: 10}}>
                      Servicio
                    </CoreText>

                    <Pressable onPress={() => openModal('service')}>
                      <CoreTextInput
                        value={
                          filters?.service?.name ||
                          (filters?.service === null ? 'Todos' : '')
                        }
                        // label="Servicio"
                        mode="outlined"
                        editable={false}
                        pointerEvents="none"
                        dense
                      />
                    </Pressable>

                    {appStoreUserProfile?.type === 1 ||
                    appStoreUserProfile?.type === 2 ? (
                      <>
                        <CoreText style={{fontWeight: 'bold', marginTop: 10}}>
                          Cliente
                        </CoreText>

                        <Pressable onPress={() => openModal('customer')}>
                          <CoreTextInput
                            value={
                              filters?.customer?.full_name ||
                              (filters?.customer === null ? 'Todos' : '')
                            }
                            dense
                            mode="outlined"
                            editable={false}
                            pointerEvents="none"
                          />
                        </Pressable>
                      </>
                    ) : (
                      <></>
                    )}

                    {appStoreUserProfile?.type === 1 ? (
                      <>
                        <CoreText style={{fontWeight: 'bold', marginTop: 10}}>
                          Tecnico
                        </CoreText>

                        <Pressable onPress={() => openModal('technical')}>
                          <CoreTextInput
                            value={
                              filters?.technical?.full_name ||
                              (filters?.technical === null ? 'Todos' : '')
                            }
                            dense
                            mode="outlined"
                            editable={false}
                            pointerEvents="none"
                          />
                        </Pressable>
                      </>
                    ) : (
                      <></>
                    )}

                    {appStoreUserProfile?.type === 1 ? (
                      <>
                        <CoreText style={{fontWeight: 'bold', marginTop: 10}}>
                          Ciudad
                        </CoreText>

                        <Pressable onPress={() => openModal('city')}>
                          <CoreTextInput
                            value={
                              filters?.city?.name ||
                              (filters?.city === null ? 'Todos' : '')
                            }
                            dense
                            mode="outlined"
                            editable={false}
                            pointerEvents="none"
                          />
                        </Pressable>
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                )}

                <DatePicker
                  mode="date"
                  modal
                  open={openPikerDate}
                  date={filters?.start_date}
                  onConfirm={date => {
                    setOpenPikerDate(false);
                    setFilters({...filters, start_date: date});
                  }}
                  onCancel={() => {
                    setOpenPikerDate(false);
                  }}
                />
                <DatePicker
                  mode="date"
                  modal
                  open={openPikerDateEnd}
                  date={filters?.end_date}
                  onConfirm={date => {
                    setOpenPikerDateEnd(false);
                    setFilters({...filters, end_date: date});
                  }}
                  onCancel={() => {
                    setOpenPikerDateEnd(false);
                  }}
                />
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
            <View style={{paddingVertical: 10}}>
              <CoreButton mode="contained" onPress={() => applyFilters()}>
                Aplicar
              </CoreButton>
              <CoreButton
                mode="contained"
                buttonColor={themeData.colors.asistectSec}
                onPress={goBack}>
                Cerrar
              </CoreButton>
            </View>
          </>
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
      </AppLayout>
    </>
  );
}

export default AppView;
