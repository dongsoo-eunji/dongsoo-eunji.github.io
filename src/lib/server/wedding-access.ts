import { WEDDING_LOCK_AT } from "../wedding-access";

// Generated once from .env see_passwd. Only the random salt and PBKDF2 result
// are shipped with the static site; the original password is not committed.
const passwordSalt = "4019b7cf938739ce3af82880aae56d1d";
const passwordHash = "37e408fbc41773ea2496020ce82cde7fe692fb1b89a957ff1872f9afb9ea0ff3";
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
