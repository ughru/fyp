import React from 'react';
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const Keyboard = ({ children }) => {
  return (
    <KeyboardAwareScrollView
      keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
      enableAutomaticScroll={Platform.OS === 'ios'}
      keyboardShouldPersistTaps='handled'
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default Keyboard;