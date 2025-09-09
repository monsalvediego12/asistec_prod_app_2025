import {createSlice} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

const defaultFilters = {
  date_type: 1, // 1 today, 2 custom
  start_date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
  // end_date: new Date(new Date().setHours(23, 59, 59, 999)).getTime(),
  end_date: new Date(
    new Date(new Date().setMonth(new Date().getMonth() + 4, 0)).setHours(
      23,
      59,
      59,
      999,
    ),
  ).getTime(),
  // start_date: null,
  // end_date: null,
  state_order: 0,
  service: null,
  customer: null,
  technical: null,
  city: null,
};

const APP_INITIAL_STATE = {
  data: {
    first_time: true,
    isNewUser: false,
  },
  user: null,
  user_profile: null,
  filters_services_list_view: defaultFilters,
  loader_view_msg: 'Cargando',
};

export const appSlice = createSlice({
  name: 'app',
  initialState: APP_INITIAL_STATE,
  reducers: {
    setDefaultFilters: (state, action) => {
      state.filters_services_list_view = defaultFilters;
    },
    setLoaderViewMsg: (state, action) => {
      state.loader_view_msg = action?.payload?.msg || 'Cargando';
    },
    setFiltersListServicesOrderView: (state, action) => {
      state.filters_services_list_view = {
        ...state.filters_services_list_view,
        ...action.payload,
      };
    },
  },
});

export function useAppState() {
  return useSelector(state => state.app.loader);
}

export const {
  setFiltersListServicesOrderView,
  setDefaultFilters,
  setLoaderViewMsg,
} = appSlice.actions;

export default appSlice.reducer;
