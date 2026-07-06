export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
  // { id: "lowercase", label: "One lowercase letter", regex: /[a-z]/ },
  // { id: "number", label: "One number", regex: /[0-9]/ },
];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const USER_TYPE_COOKIE = "userType";

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const NOT_APPLICABLE = "N/A";
export const URL = "https://www.jewishchat.com/";
