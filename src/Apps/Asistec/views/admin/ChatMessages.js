import React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import {useCoreTheme} from '@src/themes';
import {
  CoreText,
  CoreButton,
  CoreTextInput,
  CoreImage,
} from '@src/components/';
import {TextInput, IconButton, Avatar, Card, Text} from 'react-native-paper';

import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {
  ServiceOrderModel,
  convertTimestamp,
  ChatModel,
  NotificationsLogsModel,
} from '@src/Apps/Asistec/utils/firebase/firestore';
import {cropText} from '@src/utils/formaters';
import {useAppStore} from '@src/store';
import appConfig from '@src/app.config';
import uuid from 'react-native-uuid';
import NavigationService from '@src/navigation/NavigationService';
import AppLayout from '@src/Apps/Asistec/components/AppLayout';

function IndexView({route, navigation}) {
  const params = route.params;

  const {appStoreUserProfile} = useAppStore();

  const {themeData} = useCoreTheme();
  const [showContent, setShowContent] = React.useState(false);
  const [loadingSendMessage, setLoadingSendMessage] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const layoutRef = React.useRef(null);
  const [serviceData, setServiceData] = React.useState(null);
  const [firstTime, setFirstTime] = React.useState(true);
  const [chatData, setChatData] = React.useState(null);

  const [messages, setMessages] = React.useState([]);
  const refMessageInput = React.useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      setView(params);
      let unsubscribe;
      if (params?.chat?.id) {
        unsubscribe = firestore()
          .collection('chat_messages')
          .where('chat_id', '==', params?.chat?.id)
          .orderBy('created_date', 'desc')
          .onSnapshot(querySnapshot => {
            let messagesData = [];
            setLoadingSendMessage(true);
            querySnapshot?.docs?.forEach(itemMessage => {
              const itemMessageData = itemMessage?.data();
              messagesData.push(itemMessageData);
              if (
                itemMessageData?.state === 1 &&
                itemMessageData?.user_id !== appStoreUserProfile?.id
              ) {
                ChatModel.updateMessage({id: itemMessageData?.id, state: 2});
              }
            });
            setLoadingSendMessage(false);
            setMessages(messagesData);
          });
      }
      return () => {
        setServiceData(null);
        setChatData(null);
        setMessages([]);
        unsubscribe();
        setMessages([]);
        setFirstTime(true);
        setFirstTime(true);
        setMessage('');
        setShowContent(false);
      };
    }, [params]),
  );

  const setView = async paramsFnt => {
    let service = null;
    let chat;
    if (paramsFnt?.chat?.id) {
      chat = await ChatModel.getChatService({id: paramsFnt?.chat?.id});
    }

    if (chat[0]?.model_type === 1) {
      if (chat && chat[0]?.model_id) {
        service = await ServiceOrderModel.getServiceOrderById(
          chat[0]?.model_id,
        );
      }
    }

    if (service?.id && !paramsFnt?.service?.id) {
      navigation.setParams({
        ...paramsFnt,
        service: {id: service?.id},
      });
      // registra user en chat automaticamente
    }

    setChatData(chat[0] || null);
    setServiceData(service);
    setShowContent(true);
  };

  const renderItem = ({item}) => {
    const getLocalState = state => {
      let states = [
        {id: 1, text: 'Enviando...'},
        {id: 2, text: 'Enviado'},
        {id: 3, text: 'Error'},
      ];
      return states?.find(x => x?.id === state);
    };
    return (
      <View
        style={[
          styles.messageContainer,
          appStoreUserProfile?.id === item?.user_id
            ? styles.messageRight
            : styles.messageLeft,
        ]}>
        <Pressable onPress={() => deleteMsg(item)}>
          <Avatar.Icon size={40} icon="account" />
        </Pressable>
        <Card style={styles.messageCard}>
          <Card.Content>
            <CoreText style={styles.user_name}>
              {item?.user_type === 1 ? (
                <>
                  <CoreText style={styles.user_name}>(Admin) </CoreText>
                </>
              ) : (
                <></>
              )}
              {appStoreUserProfile?.id === item?.user_id
                ? 'Tú'
                : cropText(item?.user_name || '', 25)}
            </CoreText>
            <CoreText>{item.message}</CoreText>
            <CoreText style={styles.date}>
              {getLocalState(item?.local_state) && !item?.id
                ? getLocalState(item?.local_state)?.text || '-'
                : convertTimestamp(item?.created_date)}
            </CoreText>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const sendMsg = async () => {
    if (!showContent || !message || message === '') return;
    let messageData = {
      local_id: uuid.v4(),
      local_state: 1, // 1 enviando, 2 enviado, 3 error
      chat_id: chatData?.id,
      user_id: appStoreUserProfile?.id,
      user_name: appStoreUserProfile?.full_name,
      user_type: appStoreUserProfile.type,
      message,
      state: 1, // enviado
      created_date: new Date(),
    };
    // setLoadingSendMessage(true);
    setMessages([messageData, ...messages]);
    setMessage('');
    const resMessage = await ChatModel.createMessage(messageData);
    // console.log('resMessage', resMessage);
    // NOTIFICATIONS
    if (chatData?.model_type === 1 && resMessage && resMessage[0]?.id) {
      let dataNot = {
        data: {
          from_user_id: appStoreUserProfile?.id || null,
          // to_user_id: appStoreUserProfile?.id || null,
          message: `Tienes un nuevo mensaje. ${
            serviceData?.service?.name || '-'
          } #${serviceData?.consecutive || '-'}.`,
          payload: {
            chat_id: chatData?.id || '',
          },
          model_type: 2,
          model_id: chatData?.id || '',
          type: 1,
          //
          deleted: new Date(), // para no mostrar la notificacion en la vista por default, solo not push
        },
        // to_user_type: 1,
      };
      // es admin y el chat es tipo 1 envia not a cliente y tecnico
      if (appStoreUserProfile?.type === 1 && chatData?.type === 1) {
        NotificationsLogsModel.saveLogNotification({
          ...dataNot,
          data: {...dataNot?.data, to_user_id: serviceData?.customer_id},
        });
        NotificationsLogsModel.saveLogNotification({
          ...dataNot,
          data: {...dataNot?.data, to_user_id: serviceData?.technical_id},
        });
      }
      // es tecnico y el chat es tipo 1 envia not a cliente
      if (appStoreUserProfile?.type === 2 && chatData?.type === 1) {
        NotificationsLogsModel.saveLogNotification({
          ...dataNot,
          data: {...dataNot?.data, to_user_id: serviceData?.customer_id},
        });
      }
      // es cliente y el chat es tipo 1 envia not a tecnico
      if (appStoreUserProfile?.type === 3 && chatData?.type === 1) {
        NotificationsLogsModel.saveLogNotification({
          ...dataNot,
          data: {...dataNot?.data, to_user_id: serviceData?.technical_id},
        });
      }
      // admin envia mensaje al tecnico de la orden, chat tipo 2
      if (appStoreUserProfile?.type === 1 && chatData?.type === 2) {
        NotificationsLogsModel.saveLogNotification({
          ...dataNot,
          data: {...dataNot?.data, to_user_id: serviceData?.technical_id},
        });
      }
      // tecnico envia mensaje a los admin de la orden, chat tipo 2
      if (appStoreUserProfile?.type === 2 && chatData?.type === 2) {
        NotificationsLogsModel.saveLogNotification({
          ...dataNot,
          to_user_type: 1,
          data: {
            ...dataNot?.data,
            message: `Nuevo mensaje. ${serviceData?.service?.name || '-'} #${
              serviceData?.consecutive || '-'
            }.`,
          },
        });
      }
    }
    // setLoadingSendMessage(false);
    // busca el chat padre, obtiene el type, segun el type envia not a cliente, tecnico, o todos los admin
  };

  const deleteMsg = async messageData => {
    if (!showContent || !messageData?.id || messageData?.id === '') return;
    // const resMessage = await ChatModel.deleteMessage(messageData);
  };

  return (
    <AppLayout ref={layoutRef} hiddenBottomBarMenu>
      <View style={{flex: 1}}>
        {/* 
      Admin y cliente puede solicitar garantia, solo si el servicio esta en 11 puede solicitar y modificar texto
      Tecnico solo ve listado ed garantia
      */}
        <View style={{flex: 1}}>
          <CoreText
            variant="titleMedium"
            style={{marginTop: 10, paddingHorizontal: 5, marginBottom: 5}}>
            Servicio: {chatData?.title || ''}
          </CoreText>
          {showContent ? (
            <FlatList
              data={messages}
              renderItem={renderItem}
              keyExtractor={item => item.local_id}
              inverted // Para que los mensajes recientes aparezcan abajo
            />
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            // style={{flex: 1}}
          >
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                ref={refMessageInput}
                placeholder="Escribe un mensaje"
                disabled={
                  !showContent ||
                  loadingSendMessage ||
                  serviceData?.state === 10 ||
                  serviceData?.state === 11
                }
                value={message}
                onChangeText={setMessage}
                style={styles.textInput}
              />
              {/* <Button mode="contained">Enviar</Button> */}
              <IconButton
                style={{}}
                icon="send"
                mode="contained"
                size={25}
                disabled={
                  !showContent ||
                  loadingSendMessage ||
                  serviceData?.state === 10 ||
                  serviceData?.state === 11
                }
                // iconColor={themeData?.colors?.asistectSec}
                // onPress={() => onSetTechnical()}
                onPress={sendMsg}
              />
            </View>
          </KeyboardAvoidingView>
          {/* <View style={{paddingVertical: 10}}>
          <CoreButton mode="contained">Enviar</CoreButton>
        </View> */}
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    // padding: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10,
    // justifyContent: 'center',
    alignItems: 'center',
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  messageCard: {
    width: '80%',
    marginLeft: 10,
    marginRight: 10,
  },
  user_name: {
    fontWeight: 'bold',
  },
  date: {
    fontSize: 10,
    color: 'gray',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    marginRight: 10,
  },
});

export default IndexView;
