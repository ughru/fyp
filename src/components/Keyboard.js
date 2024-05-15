import React from 'react';
import { KeyboardAvoidingView } from 'react-native';

const Keyboard = ({ children }) => {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
      {children}
    </KeyboardAvoidingView>
  );
};

export default Keyboard;
