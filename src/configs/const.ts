export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  // { id: "lowercase", label: "One lowercase letter", regex: /[a-z]/ },
  // { id: "special", label: "One special character", regex: /[^A-Za-z0-9]/ },
  // { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
  { id: "number", label: "One number", regex: /[0-9]/ },
];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMAIL_CHECK_DEBOUNCE_MS = 400;
export const EMAIL_EXISTS_MESSAGE = "An account with this email already exists.";

/** Characters required before a search fires. */
export const SEARCH_MIN_LENGTH = 4;

/** Idle time after the last keystroke before the home page hero search
 *  commits the query — fires the API call and posts the chat message. */
export const HERO_SEARCH_DEBOUNCE_MS = 300;

export const RESEND_OTP_COOLDOWN_SECONDS = 120;

export const EXTERNAL_HOME_PATH = "/";

// Public group directory listing. A group's own detail page lives at the
// root instead, under its category — see `getGroupPath` in `@/lib/publicPaths`.
export const EXTERNAL_GROUPS_PATH = "/groups";

// Create-group stepper. Users who reach the final step signed out are sent to
// sign in/up and bounced back here — see PendingGroupDraftRedirect.
export const EXTERNAL_GROUPS_NEW_PATH = `${EXTERNAL_GROUPS_PATH}/new`;

// The category *index* (every live category). A single category's own page
// lives at the root — `/{category-slug}` — see `getCategoryPath`.
export const EXTERNAL_CATEGORIES_PATH = "/categories";

// FR-SEO-URL-06 — category and group slugs must never collide with these
// top-level system routes (existing or planned), so a public listing can
// never shadow, or be shadowed by, a real app page.
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

// The production host the SEO spec's canonical tags, structured data, and
// title templates are all written against (SEO & Structured Data
// Requirements v2.0) — distinct from the app's current "JewishChat" UI
// branding and the unrelated `URL` constant below.
export const CANONICAL_SITE_URL = "https://chatlist.link";
export const SITE_NAME = "ChatList";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const USER_TYPE_COOKIE = "userType";

export const REFRESH_TOKEN_ENDPOINT = "auth-service/api/v1/auth/refresh-token";

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** The API's first page index. Zero-based — send this to services, not to the UI. */
export const DEFAULT_PAGE = 0;
/** The paginated UI's first page. One-based — table state and DataTable both assume this. */
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

/**
 * Content-Type sent with the pre-signed S3 upload. The URL is signed with
 * `content-type` among its SignedHeaders, so this has to match the value the
 * backend signed with byte for byte — it is not the picked file's own type.
 */
export const GROUP_PHOTO_UPLOAD_CONTENT_TYPE = "image/png";
