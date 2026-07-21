export const REGEX_CONSTANTS = {
  PASSWORD_POLICY:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE_NUMBER: /^[6-9]\d{9}$/,
  PINCODE: /^\d{6}$/,
};
