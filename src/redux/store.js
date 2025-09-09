import {configureStore, combineReducers} from '@reduxjs/toolkit';
import appReducer from './slice/appSlice';

// Los combinamos todos en un solo reducer
const rootReducer = combineReducers({
  app: appReducer,
});

export default configureStore({
  reducer: rootReducer,
});
