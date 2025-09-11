import React from 'react';
import {View, ScrollView, ActivityIndicator} from 'react-native';
import {FAB, List, Divider, Searchbar, IconButton} from 'react-native-paper';
import {useCoreTheme} from '@src/themes';
import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import {UserModel} from '@src/Apps/Asistec/utils/firebase/firestore';
import {
  CoreText,
  CoreButton,
  CoreIconMaterial,
} from '@src/components/';
import {formatearNumeroTelefono} from '@src/utils/formaters';
import {useFocusEffect} from '@react-navigation/native';
import {useAppStore} from '@src/store';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';

function IndexView({navigation}) {
  const {themeData} = useCoreTheme();

  const [showContent, setShowContent] = React.useState(false);
  const layoutRef = React.useRef(null);

  const [refreshing, setRefreshing] = React.useState(false);

  const defaultLimit = 10;
  const defaultLimitIncrement = 10;
  const [limitData, setLimitData] = React.useState(defaultLimit);

  const [searchQuerie, setSearchQuery] = React.useState(null);

  const [customersCollection, setCustomersCollection] = React.useState([]);
  const {appStoreUserProfile} = useAppStore();

  useFocusEffect(
    React.useCallback(() => {
      initContent();
      setView();
      return () => {
        setCustomersCollection([]);
        setShowContent(false);
        setSearchQuery(null);
      };
    }, []),
  );

  const initContent = () => {
    const timeout = setTimeout(() => {
      // setShowContent(true);
    }, 100);
    return () => clearTimeout(timeout);
  };

  const setView = async () => {
    setCustomersCollection([]);
    let data = await UserModel.getAllCustomers({
      user: appStoreUserProfile,
      limit: defaultLimitIncrement,
    });
    setShowContent(true);
    layoutRef?.current?.setLoading({state: false});
    setCustomersCollection(data);
  };

  const onClickUser = async id => {
    navigation.navigate(
      'AdminCustomersModal',
      (params = {
        id,
      }),
    );
  };

  const onViewMore = async () => {
    if (refreshing) {
      return;
    }
    layoutRef?.current?.setLoading({state: true});
    setLimitData(limitData + defaultLimitIncrement);
    let data = await UserModel.getAllCustomers({
      user: appStoreUserProfile,
      limit: limitData + defaultLimitIncrement,
    });
    setCustomersCollection(data);
    layoutRef?.current?.setLoading({state: false});
  };

  const onSearchQuery = async (clean = false) => {
    if (refreshing) {
      return;
    }
    layoutRef?.current?.setLoading({state: true});
    setLimitData(limitData);
    let data = await UserModel.getAllCustomers({
      user: appStoreUserProfile,
      limit: limitData,
      search_text: clean ? null : searchQuerie,
    });
    setCustomersCollection(data);
    layoutRef?.current?.setLoading({state: false});
  };

  return (
    <AppLayout ref={layoutRef}>
      <View style={{flex: 1}}>
        <ScrollView>
          {showContent ? (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 20,
                  marginBottom: 10,
                }}>
                <Searchbar
                  dense
                  placeholder="Buscar por nombre"
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
              {customersCollection.map(item => (
                <React.Fragment key={item.id}>
                  <List.Item
                    onPress={() => onClickUser(item.id)}
                    title={`${item.full_name} ${
                      !item.is_active ? '(No activo)' : ''
                    }`}
                    description={formatearNumeroTelefono(item.phone)}
                    right={props => (
                      <List.Icon {...props} icon="chevron-right" />
                    )}
                  />
                  <Divider />
                </React.Fragment>
              ))}
              {customersCollection?.length > 0 ? (
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

        <FAB
          icon="plus"
          onPress={() => onClickUser()}
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
