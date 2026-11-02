export type EmailError = 'required' | 'invalid'

export type EmailCheck =
  { ok: false; error: EmailError } | { ok: true; email: string; suggestion?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Providers students use most; a domain one or two letters off these is almost always a typo.
const COMMON_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.co.in',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'rediffmail.com',
]

function editDistance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = row
  }
  return prev[b.length]
}

/**
 * Checks the address is well-formed and catches likely typos in the domain.
 * Deliberately does not ask the server whether an account exists, since that
 * would let anyone find out which emails are registered.
 */
export function checkEmail(raw: string): EmailCheck {
  const email = raw.trim().toLowerCase()
  if (!email) return { ok: false, error: 'required' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'invalid' }

  const [user, domain] = email.split('@')
  if (COMMON_DOMAINS.includes(domain)) return { ok: true, email }
  const close = COMMON_DOMAINS.find((d) => editDistance(domain, d) <= 2)
  return close ? { ok: true, email, suggestion: `${user}@${close}` } : { ok: true, email }
}
