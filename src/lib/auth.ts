import { ACCESS_TOKEN_COOKIE, COOKIE_MAX_AGE, USER_TYPE_COOKIE } from "@/configs/const";
import { UserType } from "@/types/User";

export function getHomePathForUserType(userType: UserType) {
  return userType === UserType.INTERNAL ? "/internal" : "/external";
}

export function setAuthSession(accessToken: string, userType: UserType) {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${accessToken}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `${USER_TYPE_COOKIE}=${userType}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  localStorage.setItem("auth", JSON.stringify({ accessToken, userType }));
}

export function clearAuthSession() {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${USER_TYPE_COOKIE}=; path=/; max-age=0`;
  localStorage.removeItem("auth");
}
