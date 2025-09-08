module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'react-native/no-inline-styles': 'off',
    'react/no-unstable-nested-components': [
      'off' || 'warn' || 'error',
      {
        allowAsProps: true || false,
        customValidators:
          [] /* optional array of validators used for propTypes validation */,
      },
    ],
  },  
};
