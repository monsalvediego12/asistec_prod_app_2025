import {Store} from 'pullstate';
// import {CORE_STORE_INITIAL_STATE} from './CoreStore'
import {APP_INITIAL_STATE} from './AsistecStore';
// import {APP_COBRAR_INITIAL_STATE} from '@src/apps/appCobrar/store'

export const UIStore = new Store({
  // app: {...CORE_STORE_INITIAL_STATE},
  app: {...APP_INITIAL_STATE},
  // appCobrar: {...APP_COBRAR_INITIAL_STATE},
});
