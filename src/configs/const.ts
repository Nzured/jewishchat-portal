export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "lowercase", label: "One lowercase letter", regex: /[a-z]/ },
  { id: "special", label: "One special character", regex: /[^A-Za-z0-9]/ },
  { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
  { id: "number", label: "One number", regex: /[0-9]/ },
];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMAIL_CHECK_DEBOUNCE_MS = 400;
export const EMAIL_EXISTS_MESSAGE = "An account with this email already exists.";

export const COUNTRY_CODES = [
  { value: "+972", label: "+972" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
  { value: "+94", label: "+94" },
  { value: "+91", label: "+91" },
];

export const RESEND_OTP_COOLDOWN_SECONDS = 120;

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const USER_TYPE_COOKIE = "userType";

export const REFRESH_TOKEN_ENDPOINT = "api/v1/auth/refresh-token";

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const NOT_APPLICABLE = "N/A";
export const URL = "https://www.jewishchat.com/";
export const NAME_PART_ONE = "Jewish";
export const NAME_PART_TWO = "Chat";
export const GROUP_SERVICE = "/group-service/api/v1/admin/groups";
export const DEFAULT_SORT = "createdOn,desc";
