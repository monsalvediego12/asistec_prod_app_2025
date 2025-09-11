import {Store} from 'pullstate';
import {APP_INITIAL_STATE} from '@src/Apps/Asistec/store/pullstate/AsistecStore';

export const UIStore = new Store({
  app: {...APP_INITIAL_STATE},
  // appCobrar: {...APP_COBRAR_INITIAL_STATE},
});
