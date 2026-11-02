export type Strength = 'short' | 'fair' | 'good' | 'strong'

export const MIN_PASSWORD_LENGTH = 8

/** Rough strength guide: length matters most, mixing character types helps. */
export function passwordStrength(password: string): Strength {
  if (password.length < MIN_PASSWORD_LENGTH) return 'short'
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length
  if (password.length >= 14 || (password.length >= 10 && kinds >= 3)) return 'strong'
  if (password.length >= 10 || kinds >= 3) return 'good'
  return 'fair'
}
