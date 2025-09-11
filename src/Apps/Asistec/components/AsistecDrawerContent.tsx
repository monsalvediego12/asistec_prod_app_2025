import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { List, Divider } from 'react-native-paper';
import {
  CoreText,
  CoreButton,
  CoreImage,
  CoreIconMaterial,
} from '@src/components/';
import { useCoreTheme } from '@src/themes';
import firestore from '@react-native-firebase/firestore';
import AppConfig from '@src/app.config';
import ContactModalContent from './ContactModalContent';

interface AsistecDrawerContentProps {
  navigation: any;
  appSetLoader?: any;
  appStoreUserProfile?: any;
  onLogout?: () => void;
  [key: string]: any;
}

const AsistecDrawerContent = ({
  navigation,
  appSetLoader,
  appStoreUserProfile,
  onLogout,
  ...props
}: AsistecDrawerContentProps) => {
  const { themeData } = useCoreTheme();
  const [modalContact, setModalContact] = React.useState(false);

  // Test
  async function delRegDb() {
    // Get all users
    const fnt = async () => {
      const collecions = [
        'chat_messages',
        'chats',
        // 'services_order',
        // 'services_order_media',
        // 'services_order_acta',
        // 'services_order_cotizacion',
        // 'services_order_adm_tech_delivery',
        'notifications_logs',
        // 'fcm_tokens'
      ];
      for (const collectionI in collecions) {
        const usersQuerySnapshot = await firestore()
          .collection(collecions[collectionI])
          // .where('phone', '==', '')
          // .where('phone', '==', null)
          // .where('phone', '==', '+576666666666')
          .get();

        // Create a new batch instance
        const batch = firestore().batch();

        usersQuerySnapshot.forEach(documentSnapshot => {
          batch.delete(documentSnapshot.ref);
        });
        batch.commit();
        console.log(collecions[collectionI]);
      }
    };
    fnt().then(r => {
      console.log('delRegDb OK');
    });
  }

  return (
    <>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingBottom: 0 }}>
        <View style={{ flex: 1 }}>
          {/* {__DEV__ ? (
            <List.Item
              onPress={() => delRegDb()}
              title="Dev Del"
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          ) : (
            <></>
          )} */}

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              paddingTop: 30,
            }}>
            <CoreImage
              style={{ width: 150, height: 150, alignItems: 'center' }}
              source={require('@src/Apps/Asistec/assets/img/cropped-Logo-PNG.png')}
            />
          </View>

          <List.Section>
            <List.Item
              onPress={() => navigation.navigate('HomeView')}
              title="Inicio"
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            {appStoreUserProfile?.type === 1 ? (
              <>
                <List.Item
                  onPress={() => navigation.navigate('AdminUsersView')}
                  title="Tecnicos"
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                />
                <Divider />
                <List.Item
                  onPress={() => navigation.navigate('AdminCustomersView')}
                  title="Clientes"
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                />
                <Divider />
                <List.Item
                  onPress={() => navigation.navigate('AdminServicesView')}
                  title="Servicios"
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                />
                <Divider />
                {/* <List.Item
                  onPress={() => navigation.navigate('HOME_APP')}
                  title="Dashboard"
                  right={(props) => (
                    <List.Icon {...props} icon="chevron-right" />
                  )}
                />
                <Divider></Divider> */}
              </>
            ) : (
              <></>
            )}

          </List.Section>
        </View>
        <View style={{ paddingHorizontal: 10, marginTop: 40 }}>
          <CoreButton
            mode="contained"
            buttonColor={themeData.colors.asistectSec}
            onPress={() => onLogout ? onLogout() : null}
            style={{
              marginVertical: 5,
            }}>
            Cerrar sesion
          </CoreButton>
          <CoreButton
            mode="contained"
            onPress={() => {
              navigation.toggleDrawer();
              setModalContact(true);
            }}
            style={{
              marginVertical: 5,
              backgroundColor: themeData.colors.primary
            }}>
            Información
          </CoreButton>
        </View>
        <View style={{ marginVertical: 5, alignItems: 'center', marginBottom: 20 }}>
          <CoreText style={{ fontSize: 12 }}>Asistec 2024</CoreText>
          <CoreText style={{ fontSize: 10 }}>
            V {AppConfig?.version || '0'}
          </CoreText>
        </View>
      </DrawerContentScrollView>

      <ContactModalContent
        visible={modalContact}
        onDismiss={() => setModalContact(false)}
        navigation={navigation}
        themeData={themeData}
      />
    </>
  );
};

export default AsistecDrawerContent;