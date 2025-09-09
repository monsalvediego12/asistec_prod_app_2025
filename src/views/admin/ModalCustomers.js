import * as React from 'react';
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  CoreHelperText,
  AppLayout,
  CoreIconMaterialCommunity,
} from '@src/components/';
import {Switch, List, Portal, Dialog} from 'react-native-paper';
import {useCoreReactHookForm} from '@src/hooks/CoreReactHookForm';
import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import {UserModel} from '@src/utils/firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import {useCoreTheme} from '@src/themes';
import NavigationService from '@src/navigation/NavigationService';

function AppView({route, navigation}) {
  const params = route.params;
  const {themeData} = useCoreTheme();

  const {useForm, Controller, setRules} = useCoreReactHookForm();

  const layoutRef = React.useRef(null);

  const [showContent, setShowContent] = React.useState(false);

  const [userData, setUserData] = React.useState(null);
  const [isActive, setIsActive] = React.useState(false);

  const [modalDeleteAccount, setModalDeleteAccount] = React.useState(false);
  const [modalCreateAccount, setModalCreateAccount] = React.useState(false);

  let {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      // initContent();
      setForm();
      return () => {
        setShowContent(false);
        setUserData([]);
        setModalDeleteAccount(false);
        setModalCreateAccount(false);
      };
    }, [params]),
  );

  // const initContent = () => {
  //   const timeout = setTimeout(() => {
  //     // setShowContent(true);
  //   }, 100);
  //   return () => clearTimeout(timeout);
  // };

  const setForm = async () => {
    let userProfile = null;

    if (params?.id) {
      userProfile = await UserModel.getById(params.id);
    }
    setUserData(userProfile);
    setValue('full_name', userProfile?.full_name);
    setValue('email', userProfile?.email);
    setValue('address', userProfile?.address);
    setValue('phone', userProfile?.phone);
    setIsActive(userProfile?.is_active);
    setShowContent(true);
  };

  const handleSubmitFnt = async ({
    full_name,
    email,
    phone,
    address,
    accept,
  }) => {
    if (!userData?.id && !accept) {
      setModalCreateAccount(true);
      return;
    }

    setModalCreateAccount(false);

    if (!userData?.id && (!phone || phone === '' || phone?.length !== 10)) {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Telefono incorrecto',
        type: 'error',
      });
      return;
    }

    let telefonoExist = await UserModel.getByPhone('+57' + phone);

    if (telefonoExist) {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Ya existe un usuario con el mismo numero telefonico.',
        type: 'error',
      });
      return;
    }

    layoutRef?.current?.setLoading({state: true, message: 'Cargando'});
    let data;
    if (userData?.id) {
      data = await UserModel.updateProfile({
        id: userData.id,
        full_name,
        email,
        phone,
        address,
        is_active: isActive,
      });
    } else {
      phone = '+57' + phone;
      data = await UserModel.createCustomerProfile({
        full_name,
        email,
        phone,
        address,
        is_active: isActive,
      });
      navigation.navigate({name: 'AdminCustomersView'});
    }

    if (!data) {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Error',
        type: 'error',
      });
    } else {
      layoutRef?.current?.setSnack({state: true, message: 'Correcto!'});
      // NavigationService.goBack();
    }
    layoutRef?.current?.setLoading({state: false});
  };

  const onDeleteAccount = async () => {
    setModalDeleteAccount(false);
    let data;
    layoutRef?.current?.setLoading({
      state: true,
      message: 'Eliminando usuario...',
    });
    data = await UserModel.updateProfile({
      id: userData.id,
      deleted_date: new Date(),
      is_active: false,
    });
    if (!data) {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Error',
        type: 'error',
      });
    } else {
      layoutRef?.current?.setSnack({state: true, message: 'Correcto!'});
      navigation.navigate({name: 'AdminCustomersView'});
    }
    layoutRef?.current?.setLoading({state: false});
  };

  return (
    <>
      <AppLayout ref={layoutRef} hiddenBottomBarMenu>
        <ScrollView>
          {showContent ? (
            <>
              <View style={{paddingHorizontal: 10}}>
                <KeyboardAvoidingView>
                  <View style={{marginTop: 10}}>
                    <Controller
                      control={control}
                      rules={{
                        required: 'El nombre es nesesario',
                        validate: {
                          ...setRules({
                            name: 'Nombre completo',
                            maxLength: true,
                          }),
                        },
                      }}
                      render={({field: {onChange, onBlur, value}}) => (
                        <CoreTextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          label="Nombre completo"
                          mode="outlined"
                        />
                      )}
                      name="full_name"
                    />
                    {errors.full_name?.message ? (
                      <CoreHelperText type="error">
                        {errors.full_name.message}
                      </CoreHelperText>
                    ) : (
                      <CoreHelperText> </CoreHelperText>
                    )}
                    <Controller
                      control={control}
                      rules={{
                        required: 'El telefono es nesesario',
                        validate: {
                          ...setRules({
                            name: 'Telefono',
                            maxLength: true,
                          }),
                        },
                      }}
                      render={({field: {onChange, onBlur, value}}) => (
                        <CoreTextInput
                          disabled={userData?.id}
                          left={
                            userData?.id ? null : (
                              <CoreTextInput.Affix text="+57" />
                            )
                          }
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          label="Telefono"
                          mode="outlined"
                          keyboardType="phone-pad"
                        />
                      )}
                      name="phone"
                    />
                    {errors.phone?.message ? (
                      <CoreHelperText type="error">
                        {errors.phone.message}
                      </CoreHelperText>
                    ) : (
                      <CoreHelperText> </CoreHelperText>
                    )}
                    <Controller
                      control={control}
                      rules={{
                        // required: 'La direccion es nesesario',
                        validate: {
                          ...setRules({
                            name: 'Direccion',
                            maxLength: !require,
                          }),
                        },
                      }}
                      render={({field: {onChange, onBlur, value}}) => (
                        <CoreTextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          label="Direccion"
                          mode="outlined"
                        />
                      )}
                      name="address"
                    />
                    {errors.address?.message ? (
                      <CoreHelperText type="error">
                        {errors.address.message}
                      </CoreHelperText>
                    ) : (
                      <CoreHelperText> </CoreHelperText>
                    )}
                    <Controller
                      control={control}
                      rules={{
                        // required: 'El correo es nesesario',
                        validate: {
                          ...setRules({
                            name: 'Correo',
                            email: !require,
                            maxLength: !require,
                          }),
                        },
                      }}
                      render={({field: {onChange, onBlur, value}}) => (
                        <CoreTextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          label="Correo"
                          mode="outlined"
                          keyboardType="email-address"
                        />
                      )}
                      name="email"
                    />
                    {errors.email?.message ? (
                      <CoreHelperText type="error">
                        {errors.email.message}
                      </CoreHelperText>
                    ) : (
                      <CoreHelperText> </CoreHelperText>
                    )}
                  </View>
                </KeyboardAvoidingView>
              </View>
              <List.Item
                onPress={() => setIsActive(!isActive)}
                title={'Activo'}
                right={props => (
                  <Switch
                    value={isActive}
                    onValueChange={() => setIsActive(!isActive)}
                  />
                )}
              />
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
        <View style={{paddingVertical: 10}}>
          {userData?.id ? (
            <>
              <CoreButton
                mode="contained"
                onPress={() => setModalDeleteAccount(true)}
                buttonColor={themeData.colors.asistectSec}>
                Eliminar
              </CoreButton>
            </>
          ) : (
            <></>
          )}
          <CoreButton mode="contained" onPress={handleSubmit(handleSubmitFnt)}>
            Guardar
          </CoreButton>
        </View>

        <Portal>
          <Dialog
            onDismiss={() => setModalDeleteAccount(false)}
            visible={modalDeleteAccount}>
            <Dialog.Title
              style={{
                textAlign: 'center',
                color: 'orange',
                fontWeight: 'bold',
              }}>
              Eliminar usuario
            </Dialog.Title>
            <Dialog.Content>
              <CoreIconMaterialCommunity
                style={{textAlign: 'center'}}
                name="account-cancel-outline"
                size={80}
                color="orange"
              />
              <CoreText>
                ¿Estas seguro de que quieres eliminar este usuario?
              </CoreText>
            </Dialog.Content>
            <Dialog.Actions>
              <CoreButton onPress={() => setModalDeleteAccount(false)}>
                Cancelar
              </CoreButton>
              <CoreButton
                onPress={() => onDeleteAccount()}
                textColor={themeData.colors.asistectSec}
                labelStyle={{
                  fontWeight: 'bold',
                }}>
                Eliminar
              </CoreButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog
            onDismiss={() => setModalCreateAccount(false)}
            visible={modalCreateAccount}>
            <Dialog.Title
              style={{
                textAlign: 'center',
                color: 'orange',
                fontWeight: 'bold',
              }}>
              Crear usuario
            </Dialog.Title>
            <Dialog.Content>
              <CoreIconMaterialCommunity
                style={{textAlign: 'center'}}
                name="account-plus-outline"
                size={80}
                color="orange"
              />
              <CoreText>
                Al crear un usuario no podras volver a modificar su numero
                telefonico. ¿Confirmas que los datos son correctos y deseas
                continuar creando el usuario?
              </CoreText>
            </Dialog.Content>
            <Dialog.Actions>
              <CoreButton onPress={() => setModalCreateAccount(false)}>
                Cancelar
              </CoreButton>
              <CoreButton
                onPress={() => {
                  const acceptCreateUserValue = true; // Define el valor deseado directamente
                  handleSubmit(formData => {
                    handleSubmitFnt({
                      ...formData,
                      accept: acceptCreateUserValue,
                    });
                  })();
                }}
                textColor={themeData.colors.asistectSec}
                labelStyle={{
                  fontWeight: 'bold',
                }}>
                Crear usuario
              </CoreButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </AppLayout>
    </>
  );
}

export default AppView;
