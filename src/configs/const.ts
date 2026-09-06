export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "number", label: "One number", regex: /[0-9]/ },
];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMAIL_CHECK_DEBOUNCE_MS = 400;
export const EMAIL_EXISTS_MESSAGE = "An account with this email already exists.";

export const SEARCH_MIN_LENGTH = 4;

export const HERO_SEARCH_DEBOUNCE_MS = 300;

export const RESEND_OTP_COOLDOWN_SECONDS = 120;

export const EXTERNAL_HOME_PATH = "/";

export const EXTERNAL_GROUPS_PATH = "/groups";

export const EXTERNAL_GROUPS_NEW_PATH = `${EXTERNAL_GROUPS_PATH}/new`;

export const EXTERNAL_GROUPS_MINE_PATH = `${EXTERNAL_GROUPS_PATH}/mine`;

export const EXTERNAL_CATEGORIES_PATH = "/categories";

export const EXTERNAL_PROFILE_PATH = "/profile";

export const RESERVED_ROUTE_SLUGS = [
  "search",
  "login",
  "add-group",
  "dashboard",
  "profile",
  "drafts",
  "blog",
  "api",
  "city",
  "topic",
  "categories",
  "about",
  "contact",
  "policies",
];

export const HOME_PAGE_TITLE = "ChatList - Find Jewish Community WhatsApp Groups";
export const HOME_PAGE_DESCRIPTION =
  "Discover and join WhatsApp groups for Jewish businesses, organizations, and communities.";

export const CANONICAL_SITE_URL = "https://chatlist.link";
export const SITE_NAME = "ChatList";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const USER_TYPE_COOKIE = "userType";

export const REFRESH_TOKEN_ENDPOINT = "auth-service/api/v1/auth/refresh-token";

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const DEFAULT_PAGE = 0;
export const FIRST_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const NOT_APPLICABLE = "N/A";
export const URL = "https://www.jewishchat.com/";
export const PUBLIC_HOST = (process.env.NEXT_PUBLIC_API_URL ?? "")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "")
  .replace(/^api\./, "");
export const NAME_PART_ONE = "Jewish";
export const NAME_PART_TWO = "Chat";
export const GROUP_SERVICE_ADMIN = "/group-service/api/v1/admin/groups";
export const GROUP_SERVICE = "/group-service/api/v1/";

export const DEFAULT_SORT = "createdOn,desc";

export const IMAGE_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const GROUP_PHOTO_UPLOAD_CONTENT_TYPE = "image/png";
