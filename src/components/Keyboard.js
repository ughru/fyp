import React from 'react';
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

const Keyboard = ({ children }) => {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}>
      {children}
    </KeyboardAvoidingView>
  );
};

export default Keyboard;
