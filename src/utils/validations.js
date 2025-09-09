const emailMatchPatternValidation = ({value}) =>
  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);

const maxLengthValidation = ({value, length = 30}) => value.length <= length;

export {emailMatchPatternValidation, maxLengthValidation};
