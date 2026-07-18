import { UserStatus, UserType } from "@/types/User";
import { UserRow } from "./UserRow";

const ROLES = ["Admin", "Moderator", "Support", "Editor", "Viewer"];

const FIRST_NAMES = [
  "Yossi",
  "Rachel",
  "Mendel",
  "Chaya",
  "Sara",
  "Dovid",
  "Esther",
  "Avi",
  "Leah",
  "Shlomo",
  "Miriam",
  "Yitzchok",
];
const LAST_NAMES = [
  "Brandt",
  "Green",
  "Klein",
  "Weiss",
  "Cohen",
  "Stern",
  "Friedman",
  "Roth",
  "Katz",
  "Berger",
  "Schwartz",
  "Adler",
];

const TOTAL_USERS = 500;

function generateUsers(total: number): UserRow[] {
  return Array.from({ length: total }, (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];

    return {
      id: "8cc12192-9f4c-421d-9ba5-fd8f5dd82998",
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@jewishchat.com`,
      mobile:
        index % 4 === 0
          ? undefined
          : `(555) ${String(100 + (index % 900)).padStart(3, "0")}-${String(
              1000 + ((index * 7) % 9000),
            ).padStart(4, "0")}`,
      whatsappVerified: index % 3 === 0,
      status: index % 5 === 0 ? UserStatus.SUSPENDED : UserStatus.ACTIVE,
      role: ROLES[index % ROLES.length],
      userType: index % 4 === 0 ? UserType.INTERNAL : UserType.EXTERNAL,
    };
  });
}

export const ALL_USERS = generateUsers(TOTAL_USERS);
