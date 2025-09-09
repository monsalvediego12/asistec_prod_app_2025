import React from 'react';
import {View, ScrollView, ActivityIndicator} from 'react-native';
import {FAB, List, Divider} from 'react-native-paper';
import {useCoreTheme} from '@src/themes';
import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import {ServiceModel} from '@src/utils/firebase/firestore';
import {AppLayout, CoreText} from '@src/components/';
import {formatearNumeroTelefono} from '@src/utils/formaters';
import {useFocusEffect} from '@react-navigation/native';
import {useAppStore} from '@src/store';

function IndexView({navigation}) {
  const {themeData} = useCoreTheme();
  const [showContent, setShowContent] = React.useState(false);
  const {appStoreUserProfile} = useAppStore();
  const layoutRef = React.useRef(null);

  const [servicesCollection, setServicesCollection] = React.useState([]);

  useFocusEffect(
    React.useCallback(() => {
      initContent();
      setView();
      return () => {
        setServicesCollection([]);
        setShowContent(false);
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
    setServicesCollection([]);
    let data = await ServiceModel.getAllServices({user: appStoreUserProfile});
    setShowContent(true);
    setServicesCollection(data);
  };

  const onClickUser = async id => {
    navigation.navigate(
      'AdminServicesModal',
      (params = {
        id,
      }),
    );
  };

  return (
    <AppLayout ref={layoutRef}>
      <View style={{flex: 1}}>
        <ScrollView>
          {showContent ? (
            <>
              {servicesCollection.map(item => (
                <React.Fragment key={item.id}>
                  <List.Item
                    onPress={() => onClickUser(item.id)}
                    // title={item.name}
                    title={`${item.name} ${
                      !item.is_active ? '(No activo)' : ''
                    }`}
                    // description={formatearNumeroTelefono(item.phone)}
                    right={props => (
                      <List.Icon {...props} icon="chevron-right" />
                    )}
                  />
                  <Divider />
                </React.Fragment>
              ))}
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
