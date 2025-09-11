import {CommonActions, useRoute} from '@react-navigation/native';

interface Navigator {
  dispatch(action: CommonActions.Action): void;
  getCurrentRoute?(): {name?: string} | null; // Optional property for flexibility
}

let navigator: Navigator | null = null;

function setTopLevelNavigator(navigatorRef: Navigator | null) {
  navigator = navigatorRef;
}

function navigate({name, params}: {name: string; params?: object}) {
  if (!navigator) {
    throw new Error('Navigator not set'); // Handle missing navigator
  }
  navigator.dispatch(CommonActions.navigate({name, params}));
}

function push({name, params}: {name: string; params?: object}) {
  if (!navigator) {
    throw new Error('Navigator not set'); // Handle missing navigator
  }
  navigator.dispatch(CommonActions.push({name, params}));
}

function goBack() {
  if (!navigator) {
    throw new Error('Navigator not set'); // Handle missing navigator
  }
  navigator.dispatch(CommonActions.goBack());
}

function reset(routeName: string, params?: object) {
  if (!navigator) {
    throw new Error('Navigator not set'); // Handle missing navigator
  }
  const resetAction = CommonActions.reset({
    index: 0,
    routes: [{name: routeName, params}],
  });
  navigator.dispatch(resetAction);
}

function getCurrentRouteName(): string | null {
  if (!navigator || !navigator.getCurrentRoute) {
    return null;
  }
  const route = navigator.getCurrentRoute();
  return route?.name ?? null; // Use nullish coalescing for default value
}

interface AppViews {
  auth?: ViewList;
  no_auth?: ViewList;
  shared?: ViewList;
  modals?: ViewList;
  [key: string]: ViewList | undefined;
}

interface ViewList {
  views: View[];
}

interface View {
  name: string;
  componentName: string;
}

function viewsList(views: AppViews = {} as AppViews): {
  views: AppViews;
  routes: View[];
} {
  const keysName = ['auth', 'no_auth', 'shared', 'modals'];
  const routes: View[] = [];

  Object.keys(views).forEach(key => {
    if (!keysName.includes(key)) {
      return;
    }

    const potentialViews = (views[key] as ViewList)?.views;

    if (potentialViews && potentialViews.length) {
      const validViews = potentialViews.filter(view => {
        return view.name && view.componentName;
      });

      if (validViews.length) {
        validViews.forEach(view => {
          routes.push({
            name: view.name,
            componentName: view.componentName,
          });
        });
      }
    }
  });

  return {
    views,
    routes,
  };
}

export default {
  navigate,
  push,
  goBack,
  reset,
  setTopLevelNavigator,
  getCurrentRouteName,
  viewsList,
};
