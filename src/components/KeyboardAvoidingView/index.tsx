// https://medium.com/@nickopops/keyboardavoidingview-not-working-properly-c413c0a200d4

import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  KeyboardAvoidingViewProps as RNKeyboardAvoidingViewProps,
  Platform,
  StyleSheet,
} from 'react-native';

const BEHAVIOR = Platform.OS === 'ios' ? 'padding' : undefined;

const KeyboardAvoidingView = ({
  style,
  ...props
}: RNKeyboardAvoidingViewProps) => (
  <RNKeyboardAvoidingView
    style={[styles.container, style]}
    behavior={BEHAVIOR}
    {...props}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default KeyboardAvoidingView;
