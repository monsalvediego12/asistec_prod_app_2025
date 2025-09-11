export default {
  name: 'App',
  version: '0.1.10',
  is_dev: false, //__DEV__, Siempre debe ser DEV !!! se setea true para generar apk y revisar algunas cosas del panel DEV
  show_dev_menu: false, // Estando __DEV__ puede mostrar u ocultar el panel dev
  email_test: __DEV__ ? 'user1@test.com' : '',
  user_test: __DEV__ ? '1111111111' : '',
  pass_test: __DEV__ ? '123456' : '', // 'abcd.1234' : '',
  host_backend: 'http://192.168.10.179:8000', //'https://07d7-186-83-255-56.ngrok-free.app', // 'http://192.168.10.60:8000',
  android_apikey: 'AIzaSyA468-FD6yfAZy1ZEjIU-Nx7mrkKxP49-0',
  ios_apikey: 'AIzaSyDFsMmvYTxzNl2vwyn3vpemUu7rNlMkaA0',
  // firebase_bucket_name, si tiene name, lo usa, si no, usa el predeterminado, en TODA LA APP
  firebase_bucket_name: '', //'gs://asistec-30f18',
  aws_fetch_app_token: false, // valida token de app
  aws_url_fetch_app_token:
    'https://wgauh5fsj3.execute-api.us-east-2.amazonaws.com/v1/customers/v-app/',
  aws_app_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWNlbnNlIjoxfQ.1A49nfGkf2wiW5oiesK7aZ8uEb9vx6pu1mdzduU7o20',
  asistec_data: {
    contact_number_1: '3013808976',
    contact_number_1_pref: '+57',
    init_consecutive_services_order: 1,
    min_digits_consecutive: 5,
    terms_conditions_url: 'https://asistec.com.co/app-terms-and-conditions',
    privacy_policy_url: 'https://asistec.com.co/politica-de-privacidad/',
    // 'https://www.termsfeed.com/live/f88eea6c-1972-42e0-a11f-f22417bc939b',
    // privacy_policy_url: 'https://asistec.com.co/app-privacy-policy',
    contact_url_1:
      'https://asistec.com.co/contactenos-asistet-servicios-tecnicos-para-el-hogar/',
    region_text: 'Bogotá, Colombia',
    services_config: {
      DEFAULT: {
        home_img: require('@src/Apps/Asistec/assets/img/image-remove.png'),
        consecutive_prefix: '',
      },
      JARDINERIA: {
        home_img: require('@src/Apps/Asistec/assets/img/jardineria_service_card.png'),
        consecutive_prefix: 'J',
      },
      VIDRERIA: {
        home_img: require('@src/Apps/Asistec/assets/img/vidreria_service_card.png'),
        consecutive_prefix: 'V',
      },
      GASNATURAL: {
        home_img: require('@src/Apps/Asistec/assets/img/gas_natural_service_card.png'),
        consecutive_prefix: 'G',
      },
      PLOMERIA: {
        home_img: require('@src/Apps/Asistec/assets/img/plomeria_service_card.png'),
        consecutive_prefix: 'P',
      },
      ELECTRICIDAD: {
        home_img: require('@src/Apps/Asistec/assets/img/electricidad_service_card.png'),
        consecutive_prefix: 'E',
      },
    },
    services_order_acta_obs_default: [
      {
        id: 1,
        description: 'Observacion',
      },
    ],
    services_order_book_times: [
      {
        id: 1,
        name: '08:00 AM',
      },
      {
        id: 2,
        name: '10:00 AM',
      },
      {
        id: 3,
        name: '12:00 PM',
      },
      {
        id: 4,
        name: '02:00 PM',
      },
      {
        id: 5,
        name: '04:00 PM',
      },
    ],
    services_order_state: [
      {
        id: 1,
        name: 'Agendado',
        desc: 'Agendado (No iniciado)',
        color: '#fff',
      },
      {
        id: 2,
        name: 'En Espera',
        color: '#b2b2b273',
      },
      {
        id: 3,
        name: 'En Camino',
        color: '#fff',
      },
      {
        id: 4,
        name: 'En Predio',
        color: '#fff',
      },
      {
        id: 5,
        name: 'Cotizacion',
        color: '#fff',
      },
      {
        id: 6,
        name: 'Ejecucion',
        color: '#fff',
      },
      {
        id: 7,
        name: 'Acta serv.',
        color: '#fff',
      },
      {
        id: 8,
        name: 'Pago',
        color: '#fff',
      },
      {
        id: 9,
        name: 'Pagado',
        color: '#fff',
      },
      {
        id: 10,
        name: 'Finalizado',
        color: '#abfae43b',
      },
      {
        id: 11,
        name: 'Entregado', // entregado
        color: '#abfae43b',
      },
      {
        id: 12,
        name: 'Garantia',
        desc: 'Solicitud de garantia por el cliente',
        color: '#aeabfa3b',
      },
    ],
  },
};
