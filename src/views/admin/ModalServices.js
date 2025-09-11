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
} from '@src/components/';
import {Switch, List} from 'react-native-paper';
import {useCoreReactHookForm} from '@src/hooks/CoreReactHookForm';
import {useCoreComponents} from '@src/components/CoreComponentsProvider';
import {ServiceModel} from '@src/utils/firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigationBack} from '@src/hooks/useNavigationBack';
import {useCoreTheme} from '@src/themes';

function AppView({route, navigation}) {
  const params = route.params;
  const {themeData} = useCoreTheme();
  
  // Hook personalizado para manejar navegación hacia atrás
  const {goBack} = useNavigationBack({
    fallbackRoute: 'AdminServicesView',
  });

  const {useForm, Controller, setRules} = useCoreReactHookForm();
  const layoutRef = React.useRef(null);

  const [showContent, setShowContent] = React.useState(false);

  const [userData, setUserData] = React.useState(null);
  const [isActive, setIsActive] = React.useState(false);

  let {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      code: '',
      schedules_per_hour: '',
      // phone: '',
      // address: '',
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      initContent();
      setForm();
      return () => {
        setShowContent(false);
        setUserData([]);
      };
    }, []),
  );

  const initContent = () => {
    const timeout = setTimeout(() => {
      // setShowContent(true);
    }, 100);
    return () => clearTimeout(timeout);
  };

  const setForm = async () => {
    let userProfile = null;

    if (params?.id) {
      userProfile = await ServiceModel.getServiceById(params.id);
    }
    setUserData(userProfile);
    setValue('name', userProfile?.name);
    setValue('code', userProfile?.code);
    setValue('schedules_per_hour', userProfile?.schedules_per_hour);
    setIsActive(userProfile?.is_active);
    setShowContent(true);
  };

  const handleSubmitFnt = async ({name, code, schedules_per_hour}) => {
    layoutRef?.current?.setLoading({state: true, message: 'Cargando'});
    let data;
    if (userData?.id) {
      data = await ServiceModel.updateService({
        id: userData.id,
        name,
        schedules_per_hour,
        code,
        is_active: isActive,
      });
    } else {
      data = await ServiceModel.createService({
        name,
        schedules_per_hour,
        code,
        is_active: isActive,
      });
      goBack();
    }

    if (!data) {
      layoutRef?.current?.setSnack({
        state: true,
        message: 'Error',
        type: 'error',
      });
    } else {
      layoutRef?.current?.setSnack({state: true, message: 'Correcto!'});
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
                            name: 'Nombre',
                            maxLength: true,
                          }),
                        },
                      }}
                      render={({field: {onChange, onBlur, value}}) => (
                        <CoreTextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          label="Nombre"
                          mode="outlined"
                        />
                      )}
                      name="name"
                    />
                    {errors.name?.message ? (
                      <CoreHelperText type="error">
                        {errors.name.message}
                      </CoreHelperText>
                    ) : (
                      <CoreHelperText> </CoreHelperText>
                    )}
                    <Controller
                      control={control}
                      rules={{
                        required: false, //'El codigo es nesesario',
                        validate: {
                          ...setRules({
                            name: 'Codigo',
                            maxLength: true,
                          }),
                        },
                      }}
                      render={({field: {onChange, onBlur, value}}) => (
                        <CoreTextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          label="Agendaciones por Hora"
                          mode="outlined"
                          keyboardType="numeric"
                        />
                      )}
                      name="schedules_per_hour"
                    />
                    {errors.schedules_per_hour?.message ? (
                      <CoreHelperText type="error">
                        {errors.schedules_per_hour.message}
                      </CoreHelperText>
                    ) : (
                      <CoreHelperText> </CoreHelperText>
                    )}
                    <Controller
                      control={control}
                      rules={{
                        required: 'El codigo es nesesario',
                        validate: {
                          ...setRules({
                            name: 'Codigo',
                            maxLength: true,
                          }),
                        },
                      }}
                      render={({field: {onChange, onBlur, value}}) => (
                        <CoreTextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          label="Codigo"
                          mode="outlined"
                        />
                      )}
                      name="code"
                    />
                    {errors.code?.message ? (
                      <CoreHelperText type="error">
                        {errors.code.message}
                      </CoreHelperText>
                    ) : (
                      <CoreHelperText> </CoreHelperText>
                    )}
                    {/*  <Controller
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
                  )} */}
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
          <CoreButton mode="contained" onPress={handleSubmit(handleSubmitFnt)}>
            Guardar
          </CoreButton>
          <CoreButton
            mode="contained"
            buttonColor={themeData.colors.asistectSec}
            onPress={goBack}>
            Cerrar
          </CoreButton>
        </View>
      </AppLayout>
    </>
  );
}

export default AppView;
