import {configureStore, combineReducers} from '@reduxjs/toolkit';
import appReducer from '@src/Apps/Asistec/store/redux/slice/appSlice';

// Los combinamos todos en un solo reducer
const rootReducer = combineReducers({
  app: appReducer,
});

export default configureStore({
  reducer: rootReducer,
});
