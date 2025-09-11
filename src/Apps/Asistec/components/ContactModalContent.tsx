import React from 'react';
import {View, Linking, TouchableOpacity, Text} from 'react-native';
import {Portal, Dialog} from 'react-native-paper';
import {CoreButton, CoreText} from '@src/components/';
import AppConfig from '@src/app.config';

const asistecData = AppConfig.asistec_data;

interface ContactModalContentProps {
  visible: boolean;
  onDismiss: () => void;
  navigation?: any;
  themeData?: any;
}

const ContactModalContent = ({visible, onDismiss, navigation, themeData}: ContactModalContentProps) => {
  return (
    <Portal>
      <Dialog onDismiss={onDismiss} visible={visible}>
        <Dialog.Title style={{textAlign: 'center'}}>
          Asistec | Contáctenos!
        </Dialog.Title>
        <Dialog.Content>
          <CoreText style={{paddingHorizontal: 10, marginVertical: 10}}>
            Aplicacion para el agendamiento y seguimiento de servicios.
          </CoreText>
          <View>
            <CoreButton
              mode="contained-tonal"
              onPress={() => Linking.openURL(`tel:${asistecData.contact_number_1}`)}
              style={{marginVertical: 5}}
              contentStyle={{
                justifyContent: 'start',
              }}
              icon="phone">
              Llámanos
            </CoreButton>
            <CoreButton
              mode="contained-tonal"
              style={{marginVertical: 5}}
              onPress={() =>
                Linking.openURL(
                  `whatsapp://send?phone=57${asistecData.contact_number_1}`,
                ).catch(e => {
                  console.log('error Linking', e);
                })
              }
              contentStyle={{
                justifyContent: 'start',
              }}
              icon="whatsapp">
              Whatsapp
            </CoreButton>
            <CoreButton
              mode="contained-tonal"
              style={{marginVertical: 5}}
              onPress={() =>
                Linking.openURL(`https://asistec.com.co/`).catch(e => {
                  console.log('error Linking', e);
                })
              }
              contentStyle={{
                justifyContent: 'start',
              }}
              icon="web">
              Sitio web
            </CoreButton>
            <CoreButton
              mode="contained-tonal"
              style={{marginVertical: 5}}
              onPress={() =>
                Linking.openURL(asistecData.privacy_policy_url).catch(e => {
                  console.log('error Linking', e);
                })
              }
              contentStyle={{
                justifyContent: 'start',
              }}
              icon="web">
              Politica de privacidad
            </CoreButton>
          </View>
          <CoreText style={{fontSize: 12, paddingHorizontal: 10, marginTop: 10}}>
            Asistec 2024
          </CoreText>
          <CoreText style={{fontSize: 10, paddingHorizontal: 10}}>
            V {AppConfig?.version || '0'}
          </CoreText>
          <CoreText
            style={{fontSize: 8, paddingHorizontal: 10}}
            onPress={() =>
              Linking.openURL(`https://diegomonsalve.com`).catch(e => {
                console.log('error Linking', e);
              })
            }>
            desarrollado por: diegomonsalve.com
          </CoreText>
        </Dialog.Content>
        <Dialog.Actions>
          <CoreButton onPress={onDismiss}>
            Cerrar
          </CoreButton>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ContactModalContent;