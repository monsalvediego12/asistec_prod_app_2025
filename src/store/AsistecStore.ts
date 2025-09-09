import {UIStore} from './store';

import {UserProfileInterface} from '@src/utils/firebase/firestore';

const defaultFilters = {
  date_type: 1, // 1 today, 2 custom
  start_date: new Date(),
  end_date: new Date(),
  state_order: 0,
  service: null,
  customer: null,
  technical: null,
};

const APP_INITIAL_STATE = {
  data: {
    first_time: true,
    isNewUser: false,
  },
  user: null,
  user_profile: null || ({} as UserProfileInterface),
  filters_services_list_view: defaultFilters,
  user_notifications: {
    unreaded: 0,
    items: [],
  },
};

const useAppStore = () => {
  const {
    data,
    user,
    user_profile,
    filters_services_list_view,
    user_notifications,
  } = UIStore.useState(s => s.app);

  const setDataStore = ({data}: any) => {
    UIStore.update(s => {
      s.app.data = {...s.app.data, ...data};
    });
  };

  const setUserStore = (data: any) => {
    UIStore.update(s => {
      s.app.user = data;
    });
  };

  const setFiltersListServicesOrderView = (data: any) => {
    UIStore.update(s => {
      s.app.filters_services_list_view = data;
    });
  };

  const setUserProfileStore = (data: UserProfileInterface) => {
    UIStore.update(s => {
      s.app.user_profile = data;
    });
  };

  const setUserNotifications = (data: any) => {
    let countUnreaded = 0;
    try {
      data?.forEach((x: any) => {
        if (x?.state === 1) {
          countUnreaded = countUnreaded + 1;
        }
      });
    } catch (error) {}
    UIStore.update(s => {
      s.app.user_notifications.items = data;
      s.app.user_notifications.unreaded = countUnreaded;
    });
  };

  const appStoreData = data;
  const appFiltersListServicesOrderView = filters_services_list_view;
  const appStoreUser: any = user;
  const appStoreUserProfile: UserProfileInterface = user_profile;
  const appStoreUserNotifications = user_notifications;

  return {
    setDataStore,
    setUserStore,
    setUserProfileStore,
    setUserNotifications,
    appStoreUserNotifications,
    appStoreData,
    appStoreUser,
    appStoreUserProfile,
    setFiltersListServicesOrderView,
    appFiltersListServicesOrderView,
  };
};

export {APP_INITIAL_STATE, useAppStore};
