// In App.js in a new project

import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  CoreHelperText,
  CoreImage,
} from '@src/components/';
import {Card, Avatar} from 'react-native-paper';
import {useAppStore} from '@src/store';
import {useCoreTheme} from '@src/themes';
import {useFocusEffect} from '@react-navigation/native';
import {
  ServiceModel,
  requestUserPermissionMessaging,
  registerUserDeviceFCM,
} from '@src/Apps/Asistec/utils/firebase/firestore';
import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import NavigationService from '@src/navigation/NavigationService';
import {useSelector, useDispatch} from 'react-redux';
import {setFiltersListServicesOrderView} from '@src/Apps/Asistec/store/redux/slice/appSlice';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';

const getLocalImgService = item => {
  if (item?.code) {
    if (item.code === 'JARDINERIA') {
      return require('@src/Apps/Asistec/assets/img/jardineria_service_card.png');
    }
    if (item.code === 'VIDRERIA') {
      return require('@src/Apps/Asistec/assets/img/vidreria_service_card.png');
    }
    if (item.code === 'GASNATURAL') {
      return require('@src/Apps/Asistec/assets/img/gas_natural_service_card.png');
    }
    if (item.code === 'PLOMERIA') {
      return require('@src/Apps/Asistec/assets/img/plomeria_service_card.png');
    }
    if (item.code === 'ELECTRICIDAD') {
      return require('@src/Apps/Asistec/assets/img/electricidad_service_card.png');
    }
  }
  return require('@src/Apps/Asistec/assets/img/image-remove.png');
};

function IndexView({navigation}) {
  const {appStoreUserProfile} = useAppStore();
  const {themeData, themeDataNavigation} = useCoreTheme();

  const [showContent, setShowContent] = React.useState(false);
  const [servicesCollection, setServicesCollection] = React.useState([]);
  const layoutRef = React.useRef(null);
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      // initContent();
      setView();
      return () => {
        setServicesCollection([]);
        setShowContent(false);
      };
    }, []),
  );

  const setView = async () => {
    setServicesCollection([]);
    let data = await ServiceModel.getAllServices();
    setShowContent(true);
    setServicesCollection(data);
  };

  const onClickService = item => {
    // sendNotification();
    // return;
    if (appStoreUserProfile.type === 2) {
      dispatch(
        setFiltersListServicesOrderView({
          service: item,
        }),
      );
      NavigationService.navigate({
        name: 'AdminServicesListView',
        // params: {
        //   service_tech_home: item, // cuando un tecnco abre un servicio, no agenda, filtra
        // },
      });
    }
    if (appStoreUserProfile.type === 1 || appStoreUserProfile.type === 3) {
      NavigationService.navigate({
        name: 'AdminScheduleServicesModal',
        params: {
          service_selected: item,
        },
      });
    }
  };

  return (
    <AppLayout ref={layoutRef}>
      <View
        style={{
          backgroundColor: themeData.colors.primary,
          flex: 1,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingTop: 20,
        }}>
        <ScrollView>
          <View
            style={{
              height: 130,
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: themeData.colors.asistectSec,
              marginHorizontal: 15,
              borderRadius: 20,
            }}>
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <CoreImage
                style={{height: 130, width: 100}}
                source={require('@src/Apps/Asistec/assets/img/home_card_img_1.png')}
              />
            </View>
            <View style={{flex: 2, paddingTop: 10}}>
              <CoreText
                variant="titleLarge"
                style={{fontWeight: 'bold', color: 'white'}}>
                ASISTEC
              </CoreText>
              <CoreText
                variant="labelLarge"
                style={{
                  color: 'white',
                  marginTop: 10,
                }}>
                Explora nuestra amplia gama de servicios y contrata
                profesionales confiables.
              </CoreText>
            </View>
          </View>

          <CoreText
            variant="titleLarge"
            style={{
              paddingHorizontal: 15,
              color: '#fff',
              fontWeight: 'bold',
              marginTop: 20,
            }}>
            Servicios disponibles
          </CoreText>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              // justifyContent: 'space-around',
              paddingHorizontal: 10,
              paddingTop: 10,
            }}>
            {showContent ? (
              <>
                {servicesCollection.map(item => (
                  <Card
                    style={styles.card}
                    key={item.id}
                    onPress={() => onClickService(item)}>
                    <Card.Cover
                      source={getLocalImgService(item)}
                      style={styles.cardCover}
                    />
                    <View style={styles.overlay} />
                    <Text style={styles.text}>{item.name}</Text>
                  </Card>
                ))}
              </>
            ) : (
              <>
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
                  <CoreText style={{paddingTop: 10, color: '#fff'}}>
                    Cargando...
                  </CoreText>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  card: {
    margin: 15,
    width: '40%',
    height: 190,
    borderRadius: 20,
    // overflow: 'hidden',
    position: 'relative',
  },
  cardCover: {
    height: '100%',
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Capa oscura con transparencia
    borderRadius: 19,
  },
  text: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IndexView;
