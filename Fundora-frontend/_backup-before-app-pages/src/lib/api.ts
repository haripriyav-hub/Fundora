const API_BASE: string = import.meta.env.VITE_API_URL ?? '/api/v1'

/** `status` is 0 when the server could not be reached at all. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`API request failed with status ${status}`)
    this.status = status
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T | null> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0)
  }
  if (!res.ok) throw new ApiError(res.status)
  return res.json().catch(() => null)
}

export function login(email: string, password: string) {
  return apiPost('/auth/login', { email, password })
}

/** Creates the account; the server then emails a verification link. */
export function register(email: string, password: string) {
  return apiPost('/auth/register', { email, password, consent: true })
}
