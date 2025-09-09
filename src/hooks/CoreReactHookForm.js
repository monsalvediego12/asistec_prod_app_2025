import * as React from 'react';
import {useForm, Controller} from 'react-hook-form';
import {
  emailMatchPatternValidation,
  maxLengthValidation,
} from '@src/utils/validations';

const useCoreReactHookForm = () => {
  const maxLengthValueGlobal = 50;

  const maxLengthFnt = ({value, name, length}) => {
    return (
      maxLengthValidation({value, length}) ||
      (name
        ? `${name} should have at most ${length} characters`
        : `Maximum characters allowed: ${length}`)
    );
  };

  const matchPatternEmailFnt = ({value, name}) => {
    return (
      emailMatchPatternValidation({value}) ||
      (name ? `${name} must be a valid email address` : 'Email no valid')
    );
  };

  const setRules = ({
    name,
    maxLength = false,
    maxLengthValue = maxLengthValueGlobal,
    email = false,
  }) => {
    const rules = {};

    if (maxLength) {
      rules.maxLength = value =>
        maxLengthFnt({value, name, length: maxLengthValue});
    }

    if (email) {
      rules.matchPattern = value => matchPatternEmailFnt({value, name});
    }

    return rules;
  };

  return {
    useForm,
    Controller,
    setRules,
  };
};

export {useCoreReactHookForm};
