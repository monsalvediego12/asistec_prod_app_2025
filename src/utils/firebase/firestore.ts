import {Platform, PermissionsAndroid} from 'react-native';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firebaseApp from '@react-native-firebase/app';
import storage, {firebase} from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';
import {DateTime} from 'luxon';
import uuid from 'react-native-uuid';
import AppConfig from '@src/app.config';
const asistecData = AppConfig.asistec_data;

export interface UserProfileInterface {
  id?: string | null;
  address?: string | null;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  user_uid?: string | null;
  type?: number | 3; // 1 admin, 2 usuario, 3 cliente
  loc_address?: string | null;
  loc_address_ref?: string | null;
  loc_address_coords?: object | null;
  token_id?: string | null;
  number_doc?: string | null;
  blood_type?: string | null;
  photo_url?: string | null;
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  deleted_date?: string | null;
}

export interface ServiceInterface {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  schedules_per_hour?: number | 1;
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  deleted_date?: string | null;
}

export interface ServiceOrderInterface {
  id?: string | null;
  consecutive?: number | null;
  service_id?: string | null;
  service?: any;
  customer_id?: string | null;
  customer?: any;
  technical_id?: string | null;
  technical?: any;
  technical_state?: number | 1; // creado/asignado, 2 rechazado, 3 aceptado
  customer_state?: number | 1; // creado/habilitado, 2 en espera
  receiver_full_name?: string | null;
  receiver_phone?: string | null;
  date?: string | null;
  hour?: string | null;
  book_media?: [] | null; // observaciones cuando se crea la agendacion
  book_obs?: string | null; // observaciones cuando se crea la agendacion
  state?: number | 1; // 1 agenda, 2 llegada tecnico, 3 antes, 4 despues, 5 evidencia
  loc_address?: string | null;
  loc_address_ref?: string | null;
  loc_address_coords?: object | null;
  technical_initial_coords?: object | null;
  technical_last_coords?: object | null;
  warranty_id?: string | null; // si existe un ID entonces hay garantia
  warranty: //
  | [
        {
          id?: string | null;
          consecutive?: number | null;
          obs_customer?: string | null;
          obs?: string | null;
          state?: number | 1; // 1 solicitado, 2 aceptado
          old_date?: string | null; // cuando se solicita garantia se guarda la info original por que se puede modificar el servicio
          old_hour?: string | null; // cuando se solicita garantia se guarda la info original por que se puede modificar el servicio
          //
          created_date?: string | null; // fecha creacion
        },
      ]
    | null;
  // cuando se inicializa un chat se actualizan los campos
  customer_chat_id: string | null; // chat publico (cliente, tecnico, admin)
  technical_chat_id: string | null; // chat privado, (tecnico, admin)
  city_id: string | null;
  city: object | null;
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  deleted_date?: string | null;
}

export interface ServiceOrderMediaInterface {
  id?: string | null;
  service_order_id?: string | null;
  description?: string | null;
  type?: number | null; // 1 agenda, 2 llegada tecnico, 3 ejecucion antes, 4 ejecucion despues, 5 evidencia pago, 6 evidencia pago visita (cliente espera cotizacion)
  media?: [
    {
      name?: string | null;
      description?: string | null;
      ul?: string | null;
      upload_by_id?: string | null;
      //
      is_active?: boolean | 1; // 1 activo 0 1 null, no activo
      deleted_date?: string | null;
    },
  ];
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  deleted_date?: string | null;
}

export interface ServiceOrderCotizacionInterface {
  id?: string | null;
  service_order_id?: string | null;
  state?: number | null; // 1 creada, 2 en espera, 3 aceptada
  state_date?: string | null;
  items?: [
    {
      id?: string | null;
      name?: string | null;
      description?: string | null;
      qty?: number | null;
      price?: any;
      //
      is_active?: boolean | 1; // 1 activo 0 1 null, no activo
      deleted_date?: string | null;
    },
  ];
  obs?: [
    {
      id?: string | null;
      description?: string | null;
      //
      is_active?: boolean | 1; // 1 activo 0 1 null, no activo
      deleted_date?: string | null;
    },
  ];
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  deleted_date?: string | null;
}

export interface ServiceOrderActaInterface {
  id?: string | null;
  service_order_id?: string | null;
  signature_url?: string | null;
  signature_b64?: string | null;
  signature_date?: string | null;
  state?: number | 1; // 1 creada, 2 rechazado, 3 aceptada
  obs?: [
    {
      id?: string | null;
      description?: string | null;
      //
      is_active?: boolean | 1; // 1 activo 0 1 null, no activo
      deleted_date?: string | null;
    },
  ];
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  deleted_date?: string | null;
}

export interface ServiceOrderAdmTechDeliveryInterface {
  id?: string | null;
  service_order_id?: string | null;
  signature_b64_adm?: string | null;
  signature_date_adm?: string | null;
  signature_adm_id?: string | null; // user que firma en el campo admin
  signature_b64_tech?: string | null;
  signature_date_tech?: string | null;
  state?: number | 1; // 1 creada, 2 rechazado, 3 entregado
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  deleted_date?: string | null;
}

export interface NotificationsLogsInterface {
  id?: string | null;
  date?: Date | null; // creacion de la notificacion
  // type, model_type 1 service_order
  // 1 creacion de orden (admin, tecnico, cliente)
  // 2 tecnico se asigna la orden
  // 3 tecnico rechaza la orden
  // 4 tecnico acepta la orden
  // 5 tecnico cambia estado a 3, en camino
  // 6 tecnico cambia estado a 4, en predio
  // 7 cliente cambia customer_state a 2, en espera
  // 8 cliente cambia customer_state a 1 , habilitado en cotizacion
  // 9 tecnico cambia estado a 5, en cotizacion
  // 10 tecnico cambia estado a 6, en ejecucion
  // 11 tecnico cambia estado a 7, en soportes
  // 12 tecnico cambia estado a 8, esperando pago
  // 13 tecnico cambia estado a 9, pagado
  // 14 tecnico cambia estado a 10, finalizado
  // 15 cliente elimina servicio
  // 16 admin elimina servicio
  // 17 cliente acepta cotizacion
  // 18 tecnico/admin para servicio en llegada
  // 19 Garantia solicitada
  type?: number | 1;
  model_type?: number | 1; // 1 service_order, 2 chatServiceOrder
  to_user_id?: string | null; // a quien va la notificacion
  from_user_id?: string | null; // a quien la generó
  state?: number | 1; // 1 creado, 2 leido
  message?: string | null;
  // payload se envia en la notificacion
  payload?:
    | {
        service_order_id?: string | null; // si tiene un ID, redirige a serviceTraking
        chat_id: string | null; // si tiene un ID ChatMessages
      }
    | any; // data adicional para la notificacion
  //
  // service_order_id?: string | null;
  // service_order_last_state?: number | null; // estado anterior orden
  // service_order_state?: number | null; //
  //
  // version, sin version -> existia service_order_id, version 1 -> payload
  version?: number | null; // valida comportamiento segun actualizaciones del modelo
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  deleted_date?: string | null;
}

const defaultNotificationsLogs: NotificationsLogsInterface = {
  date: new Date(),
  model_type: 1,
  type: 1,
  to_user_id: null,
  from_user_id: null,
  state: 1,
  message: '',
  payload: {},
  // service_order_id: null,
  // service_order_state: null,
  // service_order_last_state: null,

  // payload
  // {
  //   service_order_id?: string | null;
  //   service_order_last_state?: number | null; // estado anterior orden
  //   service_order_state?: number | null; //
  // }
  //
  version: 1,
  is_active: true,
  deleted_date: null,
};

// ===== comportamiento para chats de servicios =====
// chat type 1 -> servicio - cliente (publico, admin, cliente, tecnico) -> service_order_id y user_to_id(cliente) y user_from_id is null -> pueden enviar mensajes los 3
// chat type 2 -> admin - tecnico (privado, admin, tecnico) -> service_order_id y user_to_id(tecnico) y user_from_id is null -> solo admin y tecnico
// =============

// export interface ChatInterface {
//   id?: string | null;
//   // type
//   // 1 user_to_id = customer -> service_order -> client chat
//   // 2 user_to_id = technical service_order -> admin-technical chat
//   type?: number | null;
//   service_order_id?: string | null; // si tiene id pertence a un servicio, si no, es un chat normal
//   service_order_name?: string | null; // nombre del chat
//   user_from_id?: string | null; // usuario que crea el chat, ya sea cliente, admin o tecnico
//   user_from_name?: string | null;
//   user_from_type?: number | null;
//   user_to_id?: string | null; // usuario que recibe el chat, ya sea cliente, admin o tecnico
//   user_to_name?: string | null;
//   user_to_type?: number | null;
//   new_messages?: boolean | 0; // cuando se envian mensajes esta variable debe cambiar
//   //
//   is_active?: boolean | 1; // 1 activo 0 1 null, no activo
//   created_date?: string | null;
//   deleted_date?: string | null;
// }

export interface ChatInterface {
  id?: string | null;
  model_type?: number | null; // 1 service_order
  model_id?: string | null; // ex: service_order_id
  // type model_type 1
  // 1 technical - client chat
  // 2 admin-technical chat
  type?: number | null;
  title?: string | null;
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  created_date?: string | null;
  deleted_date?: string | null;
}

export interface ChatUserInterface {
  // usuarios que pertecenen al chat
  id?: string | undefined;
  chat_id?: string | null;
  user_id?: string | null;
  state?: string | null;
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  created_date?: string | null;
  deleted_date?: string | null;
}

export interface ChatMessageInterface {
  id?: string | undefined;
  local_id?: string | null;
  local_state?: string | null; // 1 enviando, 2 enviado, 3 error, ESTO ES SOLO LOCAL, siempre sera 1
  chat_id?: string | null;
  user_id?: string | null; // usuario que envia/crea el mensaje
  user_name?: string | null;
  user_type?: number | null;
  message?: string | null;
  state?: string | null; // 1 enviado, 2 leido, 3 archivado
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  created_date?: string | null;
  deleted_date?: string | null;
}

export interface FCMTokensInterface {
  user_id?: string | null;
  token?: string | null;
}

export interface CitiesConfigInterface {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  region_text?: string | null; // Bogotá, Colombia
  region_lat?: string | null;
  region_lon?: string | null;
  //
  is_active?: boolean | 1; // 1 activo 0 1 null, no activo
  deleted_date?: string | null;
}

class CitiesConfigModel {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  region_text?: string | null;
  region_lat?: string | null;
  region_lon?: string | null;

  is_active?: boolean | 1;

  constructor({
    id = null,
    name = null,
    code = null,
    region_text = null,
    region_lat = null,
    region_lon = null,
    is_active,
  }: CitiesConfigInterface) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.region_text = region_text;
    this.region_lat = region_lat;
    this.region_lon = region_lon;
    this.is_active = is_active;
  }

  static fromDoc(
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): CitiesConfigModel {
    const data = doc.data() as CitiesConfigInterface;
    return new CitiesConfigModel({id: doc.id, ...data});
  }

  // Método estático para obtener por su ID
  static async getById(id: string): Promise<CitiesConfigModel | null> {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const doc = await db.collection('cities_config').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return CitiesConfigModel.fromDoc(doc);
  }

  static async listAll({search_text = null, limit = null} = {}) {
    const db = firestore() as FirebaseFirestoreTypes.Module;

    let snapshot: any = await db.collection('cities_conf');

    snapshot = snapshot.where('is_active', '==', true);

    // snapshot = snapshot.where('deleted_date', '==', null);

    if (limit) {
      snapshot = snapshot.limit(limit);
    }

    snapshot = await snapshot.get().catch((e: any) => {
      console.log(e);
      return [];
    });
    const data: CitiesConfigModel[] = [];
    snapshot.forEach((doc: any) => {
      let pushItem = true;
      const itemData = {id: doc.id, ...doc.data()};
      if (search_text && search_text !== '') {
        const inSerachQ = verificarCoincidencia({
          item: itemData,
          keys: ['name'],
          search_q: search_text,
        });
        if (!inSerachQ) {
          pushItem = false;
        }
      }
      if (pushItem) {
        data.push(itemData);
      }
    });
    return data;
  }
}

class UserModel {
  id?: string | null;
  address?: string | null;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  user_uid?: string | null;
  type?: number | 3;
  loc_address?: string | null;
  loc_address_ref?: string | null;
  loc_address_coords?: object | null;
  number_doc?: string | null;
  blood_type?: string | null;
  photo_url?: string | null;
  is_active?: boolean | 1;

  constructor({
    id = null,
    address = null,
    email = null,
    full_name = null,
    phone = null,
    user_uid = null,
    type = 3,
    loc_address,
    loc_address_ref,
    loc_address_coords,
    number_doc,
    blood_type,
    photo_url,
    is_active,
  }: UserProfileInterface) {
    this.id = id;
    this.address = address;
    this.email = email;
    this.full_name = full_name;
    this.phone = phone;
    this.user_uid = user_uid;
    this.type = type;
    this.loc_address = loc_address;
    this.loc_address_ref = loc_address_ref;
    this.loc_address_coords = loc_address_coords;
    this.number_doc = number_doc;
    this.blood_type = blood_type;
    this.photo_url = photo_url;
    this.is_active = is_active;
  }

  static fromDoc(
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): UserModel {
    const data = doc.data() as UserProfileInterface;
    return new UserModel({id: doc.id, ...data});
  }

  static async logout() {
    return await auth()
      .signOut()
      .then(() => console.log('User signed out!'));
  }

  static async getAuthUserProfile(): Promise<UserModel | null> {
    const db = firestore() as FirebaseFirestoreTypes.Module;

    // Buscar el usuario por su número de teléfono
    const userQuery = await db
      .collection('usuarios')
      .where('phone', '==', auth().currentUser?.phoneNumber)
      .get();

    if (userQuery.empty) {
      // Si no se encuentra ningún usuario con el número de teléfono dado, devolver null
      return null;
    }

    // Obtener el primer usuario que coincida con el número de teléfono y devolverlo
    const doc = userQuery.docs[0];
    return UserModel.fromDoc(doc);
  }

  static async createUserProfile(data: UserProfileInterface) {
    if (!data.phone) {
      return null;
    }

    const exist = await this.getByPhone(data.phone);
    if (exist) {
      return null;
    }

    let dat = {
      address: data.address || null,
      email: data.email || null,
      full_name: data.full_name || null,
      phone: data.phone || null,
      user_uid: data.user_uid || null,
      type: data.type || 2,
      number_doc: data.number_doc || '',
      blood_type: data.blood_type || '',
      photo_url: data.photo_url || '',
      is_active: true,
      deleted_date: null,
    } as UserProfileInterface;

    const db = firestore() as FirebaseFirestoreTypes.Module;
    return await db
      .collection('usuarios')
      .add(dat)
      .then(() => {
        return true;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  }

  static async createCustomerProfile(data: UserProfileInterface) {
    if (!data.phone) {
      return null;
    }

    const exist = await this.getByPhone(data.phone);
    if (exist) {
      return null;
    }

    let dat = {
      address: data.address || null,
      email: data.email || null,
      full_name: data.full_name || null,
      phone: data.phone || null,
      user_uid: data.user_uid || null,
      type: data.type || 3,
      number_doc: data.number_doc || '',
      blood_type: data.blood_type || '',
      photo_url: data.photo_url || '',
      is_active: true,
      deleted_date: null,
    } as UserProfileInterface;

    const db = firestore() as FirebaseFirestoreTypes.Module;
    return await db
      .collection('usuarios')
      .add(dat)
      .then(() => {
        return true;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  }

  static async updateProfile(data: UserProfileInterface) {
    if (!data.id) {
      return;
    }
    const db = firestore() as FirebaseFirestoreTypes.Module;
    return await db
      .collection('usuarios')
      .doc(data.id)
      .update({
        ...data,
      })
      .then(() => {
        return true;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  }

  // Método estático para obtener un usuario por su ID
  static async getById(id: string): Promise<UserModel | null> {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const doc = await db.collection('usuarios').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return UserModel.fromDoc(doc);
  }

  static async getByPhone(phone: string): Promise<UserModel | null> {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const doc = await db
      .collection('usuarios')
      .where('phone', '==', phone)
      .where('deleted_date', '==', null)
      .get()
      .catch(e => {
        console.log(e);
        return {
          empty: true,
          docs: [],
        };
      });
    if (doc.empty) {
      return null;
    }
    return UserModel.fromDoc(doc.docs[0]);
  }

  static async getAllTechnical({
    user = null,
    search_text = null,
    limit = null,
  } = {}) {
    const db = firestore() as FirebaseFirestoreTypes.Module;

    let snapshot: any = await db
      .collection('usuarios')
      .where('phone', '!=', auth().currentUser?.phoneNumber)
      .where('type', '==', 2);

    if (!(user?.type === 1)) {
      snapshot = snapshot.where('is_active', '==', true);
    }

    snapshot = snapshot.where('deleted_date', '==', null);

    if (limit) {
      snapshot = snapshot.limit(limit);
    }

    snapshot = await snapshot.get().catch((e: any) => {
      console.log(e);
      return [];
    });
    const data: UserModel[] = [];
    snapshot.forEach((doc: any) => {
      // data.push(UserModel.fromDoc(doc));
      let pushItem = true;
      const itemData = {id: doc.id, ...doc.data()};
      if (search_text && search_text !== '') {
        const inSerachQ = verificarCoincidencia({
          item: itemData,
          keys: ['full_name', 'phone'],
          search_q: search_text,
        });
        if (!inSerachQ) {
          pushItem = false;
        }
      }
      if (pushItem) {
        data.push(itemData);
      }
    });
    return data;
  }

  static async getAllCustomers({
    user = null,
    search_text = null,
    limit = null,
  } = {}) {
    const db = firestore() as FirebaseFirestoreTypes.Module;

    let snapshot: any = await db
      .collection('usuarios')
      .where('phone', '!=', auth().currentUser?.phoneNumber)
      .where('type', '==', 3);

    if (!(user?.type === 1)) {
      snapshot = await snapshot.where('is_active', '==', true);
    }

    snapshot = snapshot.where('deleted_date', '==', null);

    if (limit) {
      snapshot = snapshot.limit(limit);
    }

    snapshot = await snapshot.get().catch((e: any) => {
      console.log(e);
      return [];
    });
    const data: UserModel[] = [];
    snapshot.forEach((doc: any) => {
      // data.push(UserModel.fromDoc(doc));
      let pushItem = true;
      const itemData = {id: doc.id, ...doc.data()};
      if (search_text && search_text !== '') {
        const inSerachQ = verificarCoincidencia({
          item: itemData,
          keys: ['full_name', 'phone'],
          search_q: search_text,
        });
        if (!inSerachQ) {
          pushItem = false;
        }
      }
      if (pushItem) {
        data.push(itemData);
      }
    });
    return data;
  }
}

class ServiceModel {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  schedules_per_hour?: number | 1;
  is_active?: boolean | 1;

  constructor({
    id = null,
    name = null,
    code = null,
    schedules_per_hour = 1,
    is_active,
  }: ServiceInterface) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.schedules_per_hour = schedules_per_hour;
    this.is_active = is_active;
  }

  static fromDoc(
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): ServiceModel {
    const data = doc.data() as ServiceInterface;
    return new ServiceModel({id: doc.id, ...data});
  }

  static getServiceById = async (id: any) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const doc = await db.collection('services').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {id: doc.id, ...doc.data()};
  };

  static async getAllServices(dataObj: any): Promise<UserModel[]> {
    const db = firestore() as FirebaseFirestoreTypes.Module;

    let snapshot: any = await db.collection('services');

    if (!(dataObj?.user?.type === 1)) {
      snapshot = await snapshot.where('is_active', '==', true);
    }

    snapshot = await snapshot.get().catch((e: any) => {
      console.log(e);
      return [];
    });

    const data: any[] = [];
    snapshot.forEach((doc: any) => {
      data.push({id: doc.id, ...doc.data()});
    });
    return data;
  }

  static createService = async (data: any) => {
    let dat = {
      name: data.name || null,
      schedules_per_hour: data.schedules_per_hour || 1,
      code: data?.code,
      is_active: data?.is_active || true,
    };

    const db = firestore() as FirebaseFirestoreTypes.Module;
    return await db
      .collection('services')
      .add(dat)
      .then(() => {
        return true;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  };

  static updateService = async (data: any) => {
    if (!data.id) {
      return;
    }
    const db = firestore() as FirebaseFirestoreTypes.Module;
    return await db
      .collection('services')
      .doc(data.id)
      .update({
        ...data,
      })
      .then(() => {
        return true;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  };
}

class ServiceOrderModel {
  id?: string | null;
  name?: string | null;
  is_active?: boolean | 1;
  state?: number | 1;

  constructor({id = null, is_active, state}: ServiceOrderInterface) {
    this.id = id;
    this.is_active = is_active;
    this.state = state;
  }

  static fromDoc(
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): ServiceOrderModel {
    const data = doc.data() as ServiceOrderInterface;
    return new ServiceOrderModel({id: doc.id, ...data});
  }

  static async getTechnicalDisponibility(data: any) {
    // verificar si el tecnico tiene algun servicio asignado en el dia y la hora
    // si el service_order tiene un id, debe buscarlo en la db y compararlo con el technical_id a enviar, si son diferentes valida disponibilidad
    // si el campo no existe o es nulo o vacio, la validacion es true por que posiblemente el campo se haya borrado o no se se haya usado para cierta actualizacion

    const db = firestore() as FirebaseFirestoreTypes.Module;
    let res = {
      state: false,
      message: '',
    };

    if ('technical_id' in data && 'date' in data && 'hour' in data) {
      let idValidTech = data?.technical_id;

      if ('id' in data && data.id && data.id !== '') {
        const orderDoc = await db
          .collection('services_order')
          .doc(data.id)
          .get();
        const existingOrder = orderDoc.data();

        if (existingOrder?.technical_id === data.technical_id) {
          res.state = true;
          res.message = 'Ya asignado.';
          return res;
        }
      }

      const query = await db.collection('services_order');
      let filteredQuery: any = query;

      filteredQuery = filteredQuery.where('deleted_date', '==', null);
      filteredQuery = filteredQuery.where(
        'state',
        'in',
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
      );

      filteredQuery = filteredQuery.where('technical_id', '==', idValidTech);

      filteredQuery = filteredQuery.where('hour', '==', data?.hour);

      const startDateObj = data?.date?.seconds
        ? convertTimestampToDate(data.date)
        : new Date(data.date);
      startDateObj?.setHours(0, 0, 0, 0);
      const endDateObj = data?.date?.seconds
        ? convertTimestampToDate(data.date)
        : new Date(data.date);
      endDateObj?.setHours(23, 59, 59, 999);
      filteredQuery = filteredQuery.where('date', '>=', startDateObj);
      filteredQuery = filteredQuery.where('date', '<=', endDateObj);

      // Ejecutar la consulta
      const snapshot = await filteredQuery.get().catch((e: any) => {
        console.error('Error fetching service orders:', e);
        return;
      });

      if (snapshot.empty) {
        res.state = true;
      } else {
        res.message = 'Tecnico sin disponibilidad.';
      }
    } else {
      res.message = 'Informacion insuficiente.';
    }

    return res;
  }

  static async createServiceOrder(
    data: ServiceOrderInterface,
  ): Promise<ServiceOrderInterface | undefined> {
    try {
      let consecutive_default = asistecData.init_consecutive_services_order;
      let prefix = '';
      let minDigitsConsecutive = 5;
      let consecutive;
      let serviceConfig;
      const db = firestore() as FirebaseFirestoreTypes.Module;

      if (data?.service_id) {
        serviceConfig = await db
          .collection('services')
          .doc(data?.service_id)
          .get();
        if (serviceConfig.exists) {
          const serviceCode = serviceConfig?.data()?.code;
          if (serviceCode) {
            prefix =
              (
                asistecData.services_config as {
                  [key: string]: {consecutive_prefix: string};
                }
              )[serviceCode]?.consecutive_prefix || '';
          }
        } else {
          prefix = asistecData.services_config.DEFAULT.consecutive_prefix;
        }
      }

      // Obtener el último consecutivo
      const lastServiceOrder = await db
        .collection('services_order')
        .where('service_id', '==', data?.service_id)
        .where('deleted_date', '==', null)
        .orderBy('consecutive', 'desc')
        .limit(1)
        .get();

      if (!lastServiceOrder.empty) {
        const lastOrderData = lastServiceOrder.docs[0].data();
        const lastConsecutive = lastOrderData?.consecutive;
        prefix = lastConsecutive?.match(/[A-Za-z]+/)[0];
        const numberPart = parseInt(lastConsecutive?.match(/\d+/)[0]);
        const nextNumber = numberPart + 1;

        consecutive =
          prefix +
          nextNumber
            .toString()
            .padStart(minDigitsConsecutive - prefix.length, '0');
      } else {
        consecutive =
          prefix +
          consecutive_default
            .toString()
            .padStart(minDigitsConsecutive - prefix.length, '0');
      }

      const docRef = await db.collection('services_order').add({
        ...data,
        deleted_date: null,
        technical_state: data?.technical_state || 1,
        customer_state: data?.customer_state || 1,
        is_active: true,
        consecutive: consecutive, // Asignar el nuevo consecutivo
      });

      const createdServiceOrder = await docRef.get();
      if (createdServiceOrder.exists) {
        // Combinar datos e ID para claridad y completitud
        return {
          id: createdServiceOrder.id,
          ...createdServiceOrder.data(),
        } as ServiceOrderInterface;
      } else {
        console.warn(
          'La creación del documento falló o el documento no existe después de la creación.',
        );
        return undefined;
      }
    } catch (error) {
      console.error('Error creando la orden de servicio:', error);
      return undefined;
    }
  }

  static updateServiceOrder = async (data: any) => {
    if (!data.id) {
      return null;
    }

    const db = firestore() as FirebaseFirestoreTypes.Module;

    try {
      await db
        .collection('services_order')
        .doc(data.id)
        .update({
          ...data,
        });

      // Obtiene los datos actualizados después de la actualización y los devuelve
      const updatedDoc = await db
        .collection('services_order')
        .doc(data.id)
        .get();
      const updatedData = updatedDoc.exists
        ? {id: updatedDoc.id, ...updatedDoc.data()}
        : null;

      return updatedData;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  static getServiceOrderDisponibilityHours = async ({
    service_order_id,
    service_id,
    date,
  }: any) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query_service = await db.collection('services').doc(service_id).get();
    if (query_service.exists) {
      const service_data = query_service.data();
      const service_schedules_per_hour = Number(
        service_data?.schedules_per_hour || 0,
      );
      const query = await db.collection('services_order');

      let filteredQuery: any = query;
      filteredQuery = filteredQuery.where('service_id', '==', service_id);
      filteredQuery = filteredQuery.where('deleted_date', '==', null);
      filteredQuery = filteredQuery.where(
        'state',
        'in',
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
      );

      if (date) {
        const startDateObj = new Date(date);
        startDateObj.setHours(0, 0, 0, 0);
        const endDateObj = new Date(date);
        endDateObj.setHours(23, 59, 59, 999);

        filteredQuery = filteredQuery.where('date', '>=', startDateObj);
        filteredQuery = filteredQuery.where('date', '<=', endDateObj);
      }

      return filteredQuery
        .get()
        .catch((e: any) => {
          console.error('Error fetching service orders:', e);
          return [];
        })
        .then((snapshot: any) => {
          const data: any[] = [];
          const dataH: any[] = [];
          let serviceOrderData: any; // data del service_order que se esta actualizando
          snapshot.forEach((doc: any) => {
            data.push({id: doc.id, ...doc.data()});
          });

          // encuentro la orden con la que estoy trabajando (voy actualizar)
          if (service_order_id) {
            serviceOrderData = data?.find(x => x?.id === service_order_id);
          }

          asistecData.services_order_book_times.forEach(element => {
            // veces que aparece una orden con la misma hora
            const service_book_times = data.filter(
              x => x.hour === element.id,
            )?.length;

            // agrego los tiempos si no hay ordenes con el tiempo actual
            // o si no ha completado las veces de agendacion
            // o si la orden actual tiene el mismo tiempo actual
            if (
              ((service_book_times || service_book_times === 0) &&
                service_book_times < service_schedules_per_hour) ||
              (serviceOrderData && serviceOrderData?.hour === element.id)
            ) {
              dataH.push(element);
            }
          });
          return dataH;
        });
    }
    return [];
  };

  static getServiceOrderById = async (id: any): Promise<any | undefined> => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const doc = await db.collection('services_order').doc(id).get();
    if (!doc.exists) {
      return;
    }
    return {id: doc.id, ...doc.data()};
  };

  static getAllServiceOrders = async ({
    user,
    startDate,
    endDate,
    state,
    service_id,
    customer_id,
    technical_id,
    city_id,
    search_text,
    limit,
  }: any) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('services_order');
    let filteredQuery: any = query;

    filteredQuery = filteredQuery.where('deleted_date', '==', null);

    if (user.type === 2) {
      // filteredQuery = filteredQuery.where('technical_id', '==', user.id);
      filteredQuery = filteredQuery.where('technical_id', 'in', [
        user.id,
        '',
        null,
      ]);
    }

    if (user.type === 3) {
      filteredQuery = filteredQuery.where('customer_id', '==', user.id);
    }

    if (state) {
      filteredQuery = filteredQuery.where(
        'state',
        'in',
        Array.isArray(state) ? state : [state],
      );
    }

    if (service_id) {
      filteredQuery = filteredQuery.where('service_id', '==', service_id);
    }

    if (customer_id) {
      filteredQuery = filteredQuery.where('customer_id', '==', customer_id);
    }

    if (technical_id) {
      filteredQuery = filteredQuery.where('technical_id', '==', technical_id);
    }

    if (city_id) {
      filteredQuery = filteredQuery.where('city_id', '==', city_id);
    }

    if (startDate) {
      const startDateObj = new Date(startDate);
      startDateObj.setHours(0, 0, 0, 0);
      filteredQuery = filteredQuery.where('date', '>=', startDateObj);
    }
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      filteredQuery = filteredQuery.where('date', '<=', endDateObj);
    }

    if (limit) {
      filteredQuery = filteredQuery.limit(limit);
    }

    filteredQuery = filteredQuery.orderBy('date', 'desc');

    return filteredQuery
      .get()
      .catch((e: any) => {
        console.error('Error fetching service orders:', e);
        return [];
      })
      .then((snapshot: any) => {
        const data: any[] = [];
        snapshot.forEach((doc: any) => {
          let pushItem = true;
          const itemData = {id: doc.id, ...doc.data()};
          if (search_text && search_text !== '') {
            const inSerachQ = verificarCoincidencia({
              item: itemData,
              keys: [
                'consecutive',
                'technical.full_name',
                'customer.full_name',
                'service.name',
              ],
              search_q: search_text,
            });
            if (!inSerachQ) {
              pushItem = false;
            }
          }
          if (pushItem) {
            data.push(itemData);
          }
        });
        return data;
      });
  };

  static async createServiceOrderWarranty(
    data: any,
  ): Promise<ServiceOrderInterface | undefined> {
    const serviceOrderDb = await this.getServiceOrderById(data?.service_id);
    // si tengo un warranty_id, lo busco, saco el consecutivo y seteo el nuevo warranty y warranty_id
    // si no, seteo la info normal
    // guardar info original
    // poner servicio en estado garantia 12, setear el id de la garantia
    let serviceOrderWarranty = {
      id: uuid.v4(),
      consecutive: 1,
      obs_customer: data?.obs_customer || '',
      obs: '',
      state: 1,
      old_date: serviceOrderDb?.date || null,
      old_hour: serviceOrderDb?.hour || null,
      //
      created_date: new Date(),
    };

    let res;

    // busco la garantia actual para obtener el consecutivo
    if (serviceOrderDb?.warranty_id && serviceOrderDb?.warranty_id !== '') {
      let old_warranty = serviceOrderDb?.warranty?.find(
        (x: any) => x.id === serviceOrderDb?.warranty_id,
      );
      if (old_warranty) {
        serviceOrderWarranty.consecutive = old_warranty.consecutive + 1;
      }
    }

    // info que se guardara en el order_service
    let serviceOrderData = {
      id: data?.service_id,
      state: 12, // garantia
      warranty_id: serviceOrderWarranty.id,
      warranty: serviceOrderDb?.warranty || [],
    };

    try {
      serviceOrderData.warranty?.unshift(serviceOrderWarranty);
    } catch (error) {
      serviceOrderData.warranty = [serviceOrderWarranty];
    }

    // updateServiceOrder
    await this.updateServiceOrder(serviceOrderData)
      .then(r => {
        res = r;
      })
      .catch(e => {
        console.log(e);
      });

    return res;
  }
}

class ServiceOrderMediaModel {
  id?: string | null;
  is_active?: boolean | 1;

  constructor({id = null, is_active}: ServiceOrderMediaInterface) {
    this.id = id;
    this.is_active = is_active;
  }

  static fromDoc(
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): ServiceOrderMediaModel {
    const data = doc.data() as ServiceOrderMediaInterface;
    return new ServiceOrderMediaModel({id: doc.id, ...data});
  }

  static async create(
    data: ServiceOrderMediaInterface,
  ): Promise<ServiceOrderMediaInterface | undefined> {
    try {
      const db = firestore() as FirebaseFirestoreTypes.Module;
      const docRef = await db.collection('services_order_media').add({
        ...data,
        is_active: true,
      });

      const createdServiceOrder = await docRef.get();
      if (createdServiceOrder.exists) {
        // Combine data and ID for clarity and completeness
        return {
          ...ServiceOrderMediaModel.fromDoc(createdServiceOrder),
        } as ServiceOrderMediaInterface;
      } else {
        console.warn(
          'Document creation failed or document does not exist after creation.',
        );
        return undefined;
      }
    } catch (error) {
      console.error('Error creating service order:', error);
      return undefined;
    }
  }

  static update = async (data: any) => {
    if (!data.id) {
      return;
    }
    const db = firestore() as FirebaseFirestoreTypes.Module;
    return await db
      .collection('services_order_media')
      .doc(data.id)
      .update({
        ...data,
      })
      .then(() => {
        return true;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  };

  static get = async ({service_order_id, type}: any) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('services_order_media');
    let filteredQuery: any = query;

    if (type) {
      filteredQuery = filteredQuery.where('type', '==', type);
    }

    if (service_order_id) {
      filteredQuery = filteredQuery.where(
        'service_order_id',
        '==',
        service_order_id,
      );
    }

    return filteredQuery
      .get()
      .catch((e: any) => {
        console.error('Error fetching service orders:', e);
        return [];
      })
      .then((snapshot: any) => {
        const data: any[] = [];
        snapshot.forEach((doc: any) => {
          data.push({id: doc.id, ...doc.data()});
        });
        return data;
      });
  };
}

class ServiceOrderCotizacionModel {
  id?: string | null;
  is_active?: boolean | 1;

  constructor({id = null, is_active}: ServiceOrderCotizacionInterface) {
    this.id = id;
    this.is_active = is_active;
  }

  static fromDoc(
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): ServiceOrderCotizacionModel {
    const data = doc.data() as ServiceOrderCotizacionInterface;
    return new ServiceOrderCotizacionModel({id: doc.id, ...data});
  }

  static async create(
    data: ServiceOrderCotizacionInterface,
  ): Promise<ServiceOrderCotizacionInterface | undefined> {
    try {
      const db = firestore() as FirebaseFirestoreTypes.Module;
      const docRef = await db.collection('services_order_cotizacion').add({
        ...data,
        is_active: true,
      });

      const createdServiceOrder = await docRef.get();
      if (createdServiceOrder?.exists) {
        // Combine data and ID for clarity and completeness
        return {
          ...ServiceOrderCotizacionModel.fromDoc(createdServiceOrder),
        } as ServiceOrderCotizacionInterface;
      } else {
        console.warn(
          'Document creation failed or document does not exist after creation.',
        );
        return undefined;
      }
    } catch (error) {
      console.error('Error creating service order:', error);
      return undefined;
    }
  }

  static update = async (data: any) => {
    if (!data.id) {
      return;
    }
    const db = firestore() as FirebaseFirestoreTypes.Module;
    await db
      .collection('services_order_cotizacion')
      .doc(data.id)
      .update({
        ...data,
      })
      .catch(e => {
        console.log(e);
        return false;
      });
    // Obtiene los datos actualizados después de la actualización y los devuelve
    const updatedDoc = await db
      .collection('services_order_cotizacion')
      .doc(data.id)
      .get();
    const updatedData = updatedDoc.exists
      ? {id: updatedDoc.id, ...updatedDoc.data()}
      : null;

    return updatedData;
  };

  static get = async ({service_order_id, state}: any) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('services_order_cotizacion');
    let filteredQuery: any = query;

    if (state) {
      filteredQuery = filteredQuery.where('state', '==', state);
    }

    if (service_order_id) {
      filteredQuery = filteredQuery.where(
        'service_order_id',
        '==',
        service_order_id,
      );
    }

    return filteredQuery
      .get()
      .catch((e: any) => {
        console.error('Error fetching service orders:', e);
        return [];
      })
      .then((snapshot: any) => {
        const data: any[] = [];
        snapshot.forEach((doc: any) => {
          data.push({id: doc.id, ...doc.data()});
        });
        return data;
      });
  };
}

class ServiceOrderActaModel {
  id?: string | null;
  is_active?: boolean | 1;

  constructor({id = null, is_active}: ServiceOrderActaInterface) {
    this.id = id;
    this.is_active = is_active;
  }

  static fromDoc(
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): ServiceOrderActaModel {
    const data = doc.data() as ServiceOrderActaInterface;
    return new ServiceOrderActaModel({id: doc.id, ...data});
  }

  static async create(
    data: ServiceOrderActaInterface,
  ): Promise<ServiceOrderActaInterface | undefined> {
    try {
      const db = firestore() as FirebaseFirestoreTypes.Module;
      const docRef = await db.collection('services_order_acta').add({
        ...data,
        is_active: true,
      });

      const createdServiceOrder = await docRef.get();
      if (createdServiceOrder?.exists) {
        // Combine data and ID for clarity and completeness
        return {
          ...ServiceOrderActaModel.fromDoc(createdServiceOrder),
        } as ServiceOrderActaInterface;
      } else {
        console.warn(
          'Document creation failed or document does not exist after creation.',
        );
        return undefined;
      }
    } catch (error) {
      console.error('Error creating service order:', error);
      return undefined;
    }
  }

  static update = async (data: any) => {
    if (!data.id) {
      return;
    }
    const db = firestore() as FirebaseFirestoreTypes.Module;
    return await db
      .collection('services_order_acta')
      .doc(data.id)
      .update({
        ...data,
      })
      .then(() => {
        return true;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  };

  static get = async ({service_order_id, state}: any) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('services_order_acta');
    let filteredQuery: any = query;

    if (state) {
      filteredQuery = filteredQuery.where('state', '==', state);
    }

    if (service_order_id) {
      filteredQuery = filteredQuery.where(
        'service_order_id',
        '==',
        service_order_id,
      );
    }

    return filteredQuery
      .get()
      .catch((e: any) => {
        console.error('Error fetching service orders:', e);
        return [];
      })
      .then((snapshot: any) => {
        const data: any[] = [];
        snapshot.forEach((doc: any) => {
          data.push({id: doc.id, ...doc.data()});
        });
        return data;
      });
  };
}

class ServiceOrderAdmTechDeliveyModel {
  id?: string | null;
  is_active?: boolean | 1;

  constructor({id = null, is_active}: ServiceOrderActaInterface) {
    this.id = id;
    this.is_active = is_active;
  }

  static fromDoc(
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): ServiceOrderActaModel {
    const data = doc.data() as ServiceOrderActaInterface;
    return new ServiceOrderActaModel({id: doc.id, ...data});
  }

  static async create(
    data: ServiceOrderActaInterface,
  ): Promise<ServiceOrderActaInterface | undefined> {
    try {
      const db = firestore() as FirebaseFirestoreTypes.Module;
      const docRef = await db
        .collection('services_order_adm_tech_delivery')
        .add({
          ...data,
          is_active: true,
        });

      const createdServiceOrder = await docRef.get();
      if (createdServiceOrder?.exists) {
        // Combine data and ID for clarity and completeness
        return {
          ...ServiceOrderActaModel.fromDoc(createdServiceOrder),
        } as ServiceOrderActaInterface;
      } else {
        console.warn(
          'Document creation failed or document does not exist after creation.',
        );
        return undefined;
      }
    } catch (error) {
      console.error('Error creating service order:', error);
      return undefined;
    }
  }

  static update = async (data: any) => {
    if (!data.id) {
      return;
    }
    const db = firestore() as FirebaseFirestoreTypes.Module;
    return await db
      .collection('services_order_adm_tech_delivery')
      .doc(data.id)
      .update({
        ...data,
      })
      .then(() => {
        return true;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  };

  static get = async ({service_order_id, state}: any) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('services_order_adm_tech_delivery');
    let filteredQuery: any = query;

    if (state) {
      filteredQuery = filteredQuery.where('state', '==', state);
    }

    if (service_order_id) {
      filteredQuery = filteredQuery.where(
        'service_order_id',
        '==',
        service_order_id,
      );
    }

    return filteredQuery
      .get()
      .catch((e: any) => {
        console.error('Error fetching service orders:', e);
        return [];
      })
      .then((snapshot: any) => {
        const data: any[] = [];
        snapshot.forEach((doc: any) => {
          data.push({id: doc.id, ...doc.data()});
        });
        return data;
      });
  };
}

class NotificationsLogsModel {
  id?: string | null;
  is_active?: boolean | 1;

  constructor({id = null, is_active}: NotificationsLogsInterface) {
    this.id = id;
    this.is_active = is_active;
  }

  static fromDoc(
    doc: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): ServiceOrderActaModel {
    const data = doc.data() as NotificationsLogsInterface;
    return new ServiceOrderActaModel({id: doc.id, ...data});
  }

  static async create(
    data: NotificationsLogsInterface,
  ): Promise<NotificationsLogsInterface | undefined> {
    try {
      const db = firestore() as FirebaseFirestoreTypes.Module;
      const docRef = await db.collection('notifications_logs').add({
        ...defaultNotificationsLogs,
        ...data,
      });

      const createdServiceOrder = await docRef.get();
      if (createdServiceOrder?.exists) {
        // Combine data and ID for clarity and completeness
        return {
          ...ServiceOrderActaModel.fromDoc(createdServiceOrder),
        } as NotificationsLogsInterface;
      } else {
        console.warn(
          'Document creation failed or document does not exist after creation.',
        );
        return undefined;
      }
    } catch (error) {
      console.error('Error creating service order:', error);
      return undefined;
    }
  }

  static update = async (data: any) => {
    if (!data.id) {
      return;
    }
    const db = firestore() as FirebaseFirestoreTypes.Module;
    return await db
      .collection('notifications_logs')
      .doc(data.id)
      .update({
        ...data,
      })
      .then(() => {
        return true;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  };

  static saveLogNotification = async ({data, to_user_type}: any) => {
    // la idea es que se ejecute en segundo plano
    const targetUserId = [];
    if (data?.to_user_id && data?.to_user_id !== '') {
      targetUserId.push(data?.to_user_id);
    }
    try {
      if (to_user_type && !isNaN(to_user_type)) {
        const usersList = await firestore()
          .collection('usuarios')
          .where('type', '==', to_user_type)
          .get()
          .catch(e => {
            console.log(e);
            return {
              empty: true,
              docs: [],
            };
          });
        if (usersList?.docs) {
          usersList?.docs.forEach(x => {
            targetUserId.push(x.id);
          });
        }
      }
      for (let userIdIndex in targetUserId) {
        const newLogNot = await firestore()
          .collection('notifications_logs')
          .add({
            ...defaultNotificationsLogs,
            ...data,
            date: new Date(),
            to_user_id: targetUserId[userIdIndex],
          });
      }
    } catch (error) {}
  };

  static get = async ({to_user_id, state, type, model_type, limit}: any) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('notifications_logs');
    let filteredQuery: any = query;

    if (state) {
      filteredQuery = filteredQuery.where('state', '==', state);
    }

    if (model_type) {
      filteredQuery = filteredQuery.where('model_type', '==', model_type);
    }

    if (type) {
      filteredQuery = filteredQuery.where('type', '==', type);
    }

    if (to_user_id) {
      filteredQuery = filteredQuery.where('to_user_id', '==', to_user_id);
    }

    if (limit) {
      filteredQuery = filteredQuery.limit(limit);
    }

    filteredQuery = filteredQuery.where('deleted_date', '==', null);
    filteredQuery = filteredQuery.orderBy('date', 'desc');

    return filteredQuery
      .get()
      .catch((e: any) => {
        console.error('Error fetching service orders:', e);
        return [];
      })
      .then((snapshot: any) => {
        const data: any[] = [];
        snapshot.forEach((doc: any) => {
          data.push({id: doc.id, ...doc.data()});
        });
        return data;
      });
  };

  static allReadedByUserId = async ({
    user_id,
    newState = 2,
    model_type = 1,
  }: any) => {
    try {
      const collectionRef = firestore().collection('notifications_logs');

      let query = collectionRef.where('to_user_id', '==', user_id);

      if (model_type) {
        query = collectionRef.where('model_type', '==', model_type);
      }

      const querySnapshot = await query.get();

      const batch = firestore().batch();
      querySnapshot.forEach(doc => {
        const docRef = collectionRef.doc(doc.id);
        batch.update(docRef, {state: newState});
      });
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error al actualizar los registros:', error);
      return false;
    }
  };
}

class ChatModel {
  static getChatService = async (chatData: ChatInterface) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('chats');
    let filteredQuery: any = query;

    if (chatData?.id) {
      filteredQuery = filteredQuery.where('id', '==', chatData?.id);
    }

    let dbMessages = await filteredQuery
      .get()
      .catch((e: any) => {
        console.error('Error fetching messages: ', e);
        return [];
      })
      .then((snapshot: any) => {
        const data: any[] = [];
        snapshot.forEach((doc: any) => {
          data.push({id: doc.id, ...doc.data()});
        });
        return data;
      });

    return dbMessages;
  };
  static initChatServiceOrder = async (chatData: ChatInterface) => {
    // obtiene o crea un chat nuevo
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = await db.collection('chats');
    let filteredQuery: any = query;

    if (chatData?.type) {
      filteredQuery = filteredQuery.where('type', '==', chatData?.type);
    }

    if (chatData?.model_type) {
      filteredQuery = filteredQuery.where(
        'model_type',
        '==',
        chatData?.model_type,
      );
    }

    if (chatData?.model_id) {
      filteredQuery = filteredQuery.where('model_id', '==', chatData?.model_id);
    }

    let dbChats = await filteredQuery
      .get()
      .catch((e: any) => {
        console.error('Error fetching service orders:', e);
        return [];
      })
      .then((snapshot: any) => {
        const data: any[] = [];
        snapshot.forEach((doc: any) => {
          data.push({id: doc.id, ...doc.data()});
        });
        return data;
      });

    // se crea el chat
    if (!dbChats[0]?.id) {
      let dataChatRef = {
        type: chatData?.type,
        model_type: chatData?.model_type || 1,
        model_id: chatData?.model_id || '',
        title: chatData?.title || '',
        //
        is_active: 1,
        created_date: new Date(),
      };
      // se agrega al objeto el id
      let dbChatRef = await db.collection('chats').add(dataChatRef);
      const newChat = await dbChatRef.get();
      if (newChat?.exists) {
        await db.collection('chats').doc(newChat.id).update({
          id: newChat.id,
        });
        dbChats = [{id: newChat.id, ...newChat.data()}];
      }
      // se actualiza los id del service order, customer_chat_id (chat )
      // customer_chat_id
      // technical_chat_id
      if (chatData?.model_type === 1) {
        try {
          let dataServiceOrder: any = {
            id: chatData?.model_id, // service_order_id
          };
          if (chatData?.type === 1) {
            dataServiceOrder.customer_chat_id = newChat.id;
          }
          if (chatData?.type === 2) {
            dataServiceOrder.technical_chat_id = newChat.id;
          }
          const s = await ServiceOrderModel.updateServiceOrder({
            ...dataServiceOrder,
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
    return dbChats[0];
  };
  static createMessage = async (messageData: ChatMessageInterface) => {
    let dataMessage;
    const db = firestore() as FirebaseFirestoreTypes.Module;
    let dbMessageRef = await db.collection('chat_messages').doc();
    await dbMessageRef.set({id: dbMessageRef.id, ...messageData});
    const newMessage = await dbMessageRef.get();
    if (newMessage?.exists) {
      await db.collection('chat_messages').doc(newMessage.id).update({
        id: newMessage.id,
      });
      dataMessage = [{id: newMessage.id, ...newMessage.data()}];
    }
    return dataMessage;
  };
  static updateMessage = async (messageData: ChatMessageInterface) => {
    let dataMessage;
    const db = firestore() as FirebaseFirestoreTypes.Module;
    let dbMessageRef = await db
      .collection('chat_messages')
      .doc(messageData?.id);
    await dbMessageRef.update({...messageData});
    const newMessage = await dbMessageRef.get();
    if (newMessage?.exists) {
      dataMessage = [{id: newMessage.id, ...newMessage.data()}];
    }
    return dataMessage;
  };
  static deleteMessage = async (messageData: ChatMessageInterface) => {
    let dataMessage;
    try {
      await firebase
        .firestore()
        .collection('chat_messages') // Nombre de la colección
        .doc(messageData?.id) // ID del documento a eliminar
        .delete();
      dataMessage = true;
      console.log('Documento eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando el documento: ', error);
    }
    return dataMessage;
  };
  static getChatServiceMessages = async (chatData: ChatMessageInterface) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('chat_messages');
    let filteredQuery: any = query;

    if (chatData?.chat_id) {
      filteredQuery = filteredQuery.where('chat_id', '==', chatData?.chat_id);
    }

    filteredQuery = filteredQuery.orderBy('created_date', 'desc');

    let dbMessages = await filteredQuery
      .get()
      .catch((e: any) => {
        console.error('Error fetching messages: ', e);
        return [];
      })
      .then((snapshot: any) => {
        const data: any[] = [];
        snapshot.forEach((doc: any) => {
          data.push({id: doc.id, ...doc.data()});
        });
        return data;
      });

    return dbMessages;
  };
  static getChatServiceNewMessagesCount = async (
    chatData: ChatMessageInterface,
  ) => {
    if (!chatData?.id) return 0;
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('chat_messages');
    let filteredQuery: any = query;

    filteredQuery = filteredQuery.where('chat_id', '==', chatData?.id);
    filteredQuery = filteredQuery.where('state', '==', chatData?.state); // mensajes sin leer

    // Espera la promesa y luego accede al size
    let querySnapshot = await filteredQuery.get();
    let dbMessages = await querySnapshot.size;

    return dbMessages;
  };
  static registerChatUser = async (chatData: ChatUserInterface) => {
    const db = firestore() as FirebaseFirestoreTypes.Module;
    const query = db.collection('chat_user');
    let filteredQuery: any = query;
    if (!chatData?.user_id || !chatData?.chat_id) return;
    let defaultData = {
      ...chatData,
      created_date: new Date(),
      state: 1,
      is_active: true,
    };

    filteredQuery = filteredQuery.where('chat_id', '==', chatData?.chat_id);
    filteredQuery = filteredQuery.where('user_id', '==', chatData?.user_id);
    filteredQuery = filteredQuery.where('deleted_date', '==', null);

    // Espera la promesa y luego accede al size
    let querySnapshot = await filteredQuery.get();
    let dbMessages = await querySnapshot.size;

    if (!dbMessages || !(dbMessages > 0)) {
      let dbChatRef = await db.collection('chat_user').add(defaultData);
      const newChat = await dbChatRef.get();
      if (newChat?.exists) {
        await db.collection('chat_user').doc(newChat.id).update({
          id: newChat.id,
        });
      }
    }

    // return dbMessages;
  };
}

// FUNCIONES

const verificarCoincidencia = ({item, keys, search_q}: any) => {
  // Función auxiliar para acceder a las propiedades anidadas
  function obtenerValor({obj, path}: any) {
    return path.split('.').reduce((acc: any, key: any) => acc && acc[key], obj);
  }

  // Verificar cada clave en el array
  for (let clave of keys) {
    let valor = obtenerValor({obj: item, path: clave});
    // Verificar si el valor obtenido es una cadena y si coincide con el search_q
    if (
      typeof valor === 'string' &&
      valor.toLowerCase().includes(search_q.toLowerCase())
    ) {
      return true; // Coincidencia encontrada
    }
  }
  return false; // No se encontró ninguna coincidencia
};

const convertTimestamp = (
  timestamp: any,
  format: string = 'yyyy-MM-dd HH:mm:ss',
) => {
  try {
    if (timestamp) {
      const date = DateTime.fromSeconds(timestamp.seconds).plus(
        timestamp.nanoseconds / 1e9,
      );
      return date.toFormat(format);
    }
    return null;
  } catch (error) {
    console.error('Error converting timestamp: ', error);
    return null;
  }
};
const convertTimestampToDate = (timestamp: any) => {
  try {
    if (timestamp) {
      // Crear un objeto Date basado en los segundos y nanosegundos del timestamp de Firestore
      return new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
      );
    }
    return null;
  } catch (error) {
    console.error('Error converting timestamp: ', error);
    return null;
  }
};

const getStorageApp = () => {
  if (
    AppConfig?.firebase_bucket_name &&
    AppConfig?.firebase_bucket_name !== ''
  ) {
    return firebase.app().storage(AppConfig?.firebase_bucket_name);
  } else {
    return storage();
  }
};

const requestUserPermissionMessaging = async () => {
  let enabled;
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    // en ios devuelve valor numerico
    enabled = enabled ? 'granted' : undefined;
  } else {
    let androidPlatformVersion = Platform.Version;
    // apiLevel es mmayor a 33 pide permiso, si no, se otorga automaticamente
    if (Number(androidPlatformVersion) >= 33) {
      enabled = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    } else {
      enabled = 'granted';
    }
  }

  return enabled;
};

const registerDeviceTokenFCM = async () => {
  let res;
  const permisison = await requestUserPermissionMessaging();
  if (permisison === 'granted') {
    // en ios viene por default el auto resgistro... messaging_ios_auto_register_for_remote_messages
    if (Platform.OS !== 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }
    res = await messaging().getToken();
  }
  return res;
};

async function registerUserDeviceFCM({user_id}: any) {
  // console.log('user_id', user_id);
  if (!user_id) {
    return;
  }
  const db = firestore();
  const querySnapshot = await db
    .collection('fcm_tokens')
    .where('user_id', '==', user_id)
    .get();
  const registrosEncontrados = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  const token = await registerDeviceTokenFCM();
  console.log('token', token);
  try {
    if (registrosEncontrados.length === 0) {
      const newToken = await db
        .collection('fcm_tokens')
        .add({token: token || null, user_id});
      const newTokenObj = await newToken.get();
      if (newTokenObj?.exists) {
        await UserModel.updateProfile({id: user_id, token_id: newTokenObj.id});
      }
      return true;
    } else {
      const idRegistro = registrosEncontrados[0].id;
      await db
        .collection('fcm_tokens')
        .doc(idRegistro)
        .update({token: token || null});
      await UserModel.updateProfile({id: user_id, token_id: idRegistro});
      return true;
    }
    // }
  } catch (error) {}
  return false;
}

export {
  UserModel,
  ServiceModel,
  ServiceOrderModel,
  ServiceOrderMediaModel,
  ServiceOrderCotizacionModel,
  ServiceOrderActaModel,
  ServiceOrderAdmTechDeliveyModel,
  NotificationsLogsModel,
  ChatModel,
  CitiesConfigModel,
  convertTimestamp,
  convertTimestampToDate,
  getStorageApp,
  requestUserPermissionMessaging,
  registerUserDeviceFCM,
  //
  functions,
};
