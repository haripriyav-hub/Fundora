/** Shapes the Fundora API returns for schemes and the student's tracked applications. */

export type AidType = 'scholarship' | 'loan' | 'feeWaiver' | 'device' | 'hostel' | 'books'
export type ProviderType = 'central' | 'state' | 'private' | 'bank'
export type MatchState = 'eligible' | 'almost' | 'not' | 'unknown'
/** `onlineAndOffline`: the student applies online, then submits hard copies somewhere in person. */
export type SubmissionMode = 'online' | 'onlineAndOffline'
export type SpecialGroup = 'girls' | 'disability' | 'rural'

export type RequiredDocument = {
  id: string
  name: string
  /** Who issues it, which year it must be from, format rules. */
  note: string
}

export type ApplyStep = {
  title: string
  text: string
}

/** A rule the scheme sets, and whether the student's profile meets it. */
export type EligibilityRule = {
  rule: string
  result: 'met' | 'notMet' | 'unknown'
}

/** A document published by the scheme on its official portal (notification, guidelines, FAQ…). */
export type OfficialDocument = {
  title: string
  kind: 'notification' | 'guidelines' | 'faq' | 'manual' | 'form'
  format: 'pdf' | 'web'
  url: string
  /** ISO date it was published, if the portal states one. */
  publishedOn?: string
}

export type ImportantDate = {
  label: string
  /** ISO date */
  date: string
}

export type OfflineSubmission = {
  summary: string
  where: string
  when: string
  carry: string[]
  tip?: string
}

export type Scheme = {
  id: string
  name: string
  provider: string
  providerType: ProviderType
  aidType: AidType
  /** Display text, e.g. "₹50,000 / year" or "Loan up to ₹10 lakh". */
  amount: string
  /** ISO date (YYYY-MM-DD). `null` means applications are open all year. */
  closesOn: string | null
  isOpen: boolean
  mode: SubmissionMode
  /** The official portal the student applies on. Fundora only links to it. */
  portal: { name: string; url: string }
  match: { state: MatchState; reason: string }
  documents: RequiredDocument[]
  steps: ApplyStep[]
  offline: OfflineSubmission | null
  groups: SpecialGroup[]
  /** 1 = most viewed this month. */
  popularity: number
  /** ISO date the details were last checked against the official source. */
  verifiedOn: string

  // Detailed information shown on the scheme's full page. All optional: a section is hidden when empty.
  about?: string
  benefits?: string[]
  eligibility?: EligibilityRule[]
  officialDocuments?: OfficialDocument[]
  importantDates?: ImportantDate[]
  helpline?: { phone?: string; email?: string; hours?: string }
}

/** A scheme the student saved to apply for. Fundora never tracks the application itself: that happens on the official portal. */
export type SavedScheme = {
  schemeId: string
  /** ISO date the student saved it. */
  savedOn: string
}
