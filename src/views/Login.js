// In App.js in a new project

import * as React from 'react';
import {View, Text} from 'react-native';
import {ScrollView, TextInput as NativeTextInput, Linking} from 'react-native';
import {
  CoreButton,
  CoreText,
  CoreTextInput,
  CoreHelperText,
  CoreImage,
  AppLayout,
} from '@src/components/';
import {useCoreReactHookForm} from '@src/hooks/CoreReactHookForm';

import AppConfig from '@src/app.config';
const asistecData = AppConfig.asistec_data;

import {useCoreTheme} from '@src/themes';
// import auth from '@react-native-firebase/auth';
import auth, { getAuth, onAuthStateChanged, signInWithPhoneNumber } from '@react-native-firebase/auth';
import {useAppStore} from '@src/store';

function LoginView({navigation}) {
  const {useForm, Controller, setRules} = useCoreReactHookForm();
  const {setDataStore} = useAppStore();
  const layoutRef = React.useRef(null);
  const {themeData} = useCoreTheme();

  // If null, no SMS has been sent
  const [confirm, setConfirm] = React.useState(null);

  const initialSeconds = 59;
  const [seconds, setSeconds] = React.useState(initialSeconds);
  const [isActive, setIsActive] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [phoneInput, setPhoneInput] = React.useState(null);
  const intervalRef = React.useRef(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      userInput: AppConfig.user_test,
      codeInput: __DEV__ ? '123456' : '',
      emailInput: AppConfig.email_test,
      passwordInput: AppConfig.pass_test,
    },
  });

  React.useEffect(() => {
    if (isActive && !isPaused && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    }

    // Cleanup interval on component unmount or when paused/stopped
    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, seconds]);

  const start = () => {
    setSeconds(initialSeconds);
    setIsActive(true);
    setIsPaused(false);
  };

  const loginPhoneFnt = async ({userInput, passwordInput}) => {
    if (userInput && userInput !== '') {
      setPhoneInput(userInput);
    }
    let phone = userInput && userInput !== '' ? userInput : phoneInput;
    layoutRef?.current?.setLoading({
      state: true,
      message: 'Enviando código...',
    });
    try {
      const auth2 = getAuth()
      // auth2.settings.appVerificationDisabledForTesting = true;
      const response = await signInWithPhoneNumber(auth2, '+57' + phone)
      // const response = await auth().signInWithPhoneNumber('+57' + phone);
      start();
      setConfirm(response);
    } catch (error) {
      console.error('error loginPhoneFnt', error);
      layoutRef?.current?.setSnack({
        state: true,
        message: 'ERROR LOGIN ' + JSON.stringify(error),
        type: 'error',
      });
    } finally {
      layoutRef?.current?.setLoading({state: false});
    }
  };
  const confirmCode = async ({codeInput, passwordInput}) => {
    layoutRef?.current?.setLoading({state: true, message: 'Iniciando...'});
    let res;
    await confirm
      .confirm(codeInput)
      .then(response => {
        res = response;
        setConfirm(null);
        setDataStore({isNewUser: res?.additionalUserInfo?.isNewUser});
      })
      .catch(error => {
        console.error(error);
        layoutRef?.current?.setSnack({
          state: true,
          message: 'Error validando codigo.',
          type: 'error',
        });
      });

    layoutRef?.current?.setLoading({state: false});
  };

  return (
    <AppLayout ref={layoutRef} hiddenBottomBarMenu>
      <ScrollView style={{paddingHorizontal: 20}}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            paddingTop: 30,
          }}>
          <CoreImage
            style={{width: 150, height: 150, alignItems: 'center'}}
            source={require('@src/assets/img/cropped-Logo-PNG.png')}
          />
        </View>
        <CoreText
          style={{textAlign: 'center', paddingTop: 30, fontWeight: 'bold'}}
          variant="displaySmall">
          ¡Bienvenido!
        </CoreText>
        <View style={{paddingTop: 30}}>
          {!confirm ? (
            <>
              <CoreText
                style={{
                  paddingBottom: 20,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Ingresa tu numero de telefono para ingresar o registrarte!
              </CoreText>
              <Controller
                control={control}
                rules={{
                  required: 'El telefono es nesesario',
                  validate: {
                    ...setRules({name: 'Telefono', maxLength: true}),
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <CoreTextInput
                    left={<CoreTextInput.Affix text="+57" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    label="Telefono"
                    mode="outlined"
                    keyboardType="phone-pad"
                  />
                )}
                name="userInput"
              />
              {errors.userInput?.message ? (
                <CoreHelperText type="error">
                  {errors.userInput.message}
                </CoreHelperText>
              ) : (
                <CoreHelperText> </CoreHelperText>
              )}
              <View>
                <CoreText
                  style={{
                    paddingBottom: 10,
                    // fontWeight: 'bold',
                    // textAlign: 'center',
                  }}>
                  Te enviaremos un codigo
                </CoreText>
                <CoreButton
                  mode="contained"
                  onPress={handleSubmit(loginPhoneFnt)}>
                  Ingresar
                </CoreButton>
              </View>
            </>
          ) : (
            ''
          )}

          {confirm ? (
            <>
              <CoreText style={{paddingBottom: 10}}>
                ingresa el codigo que recibiste por mensaje de texto.
              </CoreText>
              <Controller
                control={control}
                rules={{
                  required: 'El codigo es nesesario',
                  validate: {
                    ...setRules({name: 'Codigo', maxLength: true}),
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <CoreTextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    label="Codigo"
                    mode="outlined"
                    keyboardType="numeric"
                  />
                )}
                name="codeInput"
              />
              {errors.codeInput?.message ? (
                <CoreHelperText type="error">
                  {errors.codeInput.message}
                </CoreHelperText>
              ) : (
                <CoreHelperText> </CoreHelperText>
              )}
              <View>
                <CoreButton
                  mode="contained"
                  onPress={handleSubmit(confirmCode)}>
                  Validar e ingresar
                </CoreButton>
                <CoreButton
                  mode="contained-tonal"
                  style={{marginTop: 10}}
                  onPress={loginPhoneFnt}
                  disabled={seconds !== 0}>
                  Reenviar codigo {seconds === 0 ? '' : '0:' + seconds}
                </CoreButton>
              </View>
            </>
          ) : (
            ''
          )}

          <CoreText
            style={{
              paddingTop: 30,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            Al registrate, aceptas:
          </CoreText>
          {/* <CoreText
            style={{
              paddingTop: 10,
              fontWeight: 'bold',
              textAlign: 'center',
              color: themeData?.colors?.primary,
            }}
            onPress={() => {
              Linking.openURL(asistecData.terms_conditions_url);
            }}>
            Terminos y Condiciones
          </CoreText> */}
          <CoreText
            style={{
              paddingTop: 10,
              fontWeight: 'bold',
              textAlign: 'center',
              color: themeData?.colors?.primary,
            }}
            onPress={() => {
              Linking.openURL(asistecData.privacy_policy_url);
            }}>
            Politica de privacidad
          </CoreText>
          {/* <CoreButton
          mode="contained"
          onPress={() => eliminarRegistrosUsuarios()}>
          Ingresar2
        </CoreButton> */}
          {/* <CoreText onPress={() => navigation.navigate('TermsConditionsView')}>
          Terminos y condiciones
        </CoreText> */}
        </View>
      </ScrollView>
    </AppLayout>
  );
}

export default LoginView;
