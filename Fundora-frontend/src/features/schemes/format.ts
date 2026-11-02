import type { TFunction } from 'i18next'
import type { Scheme } from './types'

const DAY = 24 * 60 * 60 * 1000

export function daysUntil(isoDate: string) {
  const end = new Date(`${isoDate}T23:59:59`)
  return Math.ceil((end.getTime() - Date.now()) / DAY)
}

export function formatDate(isoDate: string, locale = 'en-IN') {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** "Closes 14 Nov 2026 · 12 days left", "Apply any time" or "Closed". */
export function deadlineText(scheme: Scheme, t: TFunction, withCountdown = true) {
  if (!scheme.isOpen) return t('app.deadline.closed')
  if (!scheme.closesOn) return t('app.deadline.rolling')
  const closes = t('app.deadline.closes', { date: formatDate(scheme.closesOn) })
  if (!withCountdown) return closes
  const days = daysUntil(scheme.closesOn)
  return days >= 0 ? `${closes} · ${t('app.deadline.daysLeft', { count: days })}` : closes
}

export function hostOf(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export type DeadlineStatus = 'closingSoon' | 'open' | 'rolling' | 'closed'

/** Where a scheme's deadline stands today. "Closing soon" is 14 days or fewer. */
export function deadlineStatus(scheme: Scheme): DeadlineStatus {
  if (!scheme.isOpen) return 'closed'
  if (!scheme.closesOn) return 'rolling'
  const days = daysUntil(scheme.closesOn)
  if (days < 0) return 'closed'
  return days <= 14 ? 'closingSoon' : 'open'
}
