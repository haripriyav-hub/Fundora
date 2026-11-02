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
}

export type ApplicationStatus = 'saved' | 'applying' | 'applied' | 'awarded' | 'renewal'

export type TrackedApplication = {
  schemeId: string
  status: ApplicationStatus
  /** 0–100 */
  progress: number
  nextStep: string
  updatedAt: string
}
