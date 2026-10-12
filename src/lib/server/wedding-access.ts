import { WEDDING_LOCK_AT } from "../wedding-access";

// Only the random salt and PBKDF2 result are shipped with the static site;
// the original password is not committed.
const passwordSalt = "764cab8fc113dc0a432a6ec0f1777b7e";
const passwordHash = "95c88b97d9995f71d7e35d5bc95887d58b60cd1895354983944d32d56e871c89";
const passwordIterations = 210_000;

export function createWeddingAccessData(): {
  lockAt: number;
  passwordSalt: string;
  passwordHash: string;
  passwordIterations: number;
} {
  return {
    lockAt: WEDDING_LOCK_AT,
    passwordSalt,
    passwordHash,
    passwordIterations,
  };
}
