import {
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  CircleCheck,
  CircleHelp,
  CircleX,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  Phone,
} from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { LoadState } from '@/components/app/AppLayout'
import { DocumentsList, OfflineInfo, StepsList } from '@/components/app/SchemeSections'
import { DeadlineTag, EligibilityTag, ModeTag } from '@/components/app/Tags'
import { buttonClasses } from '@/components/ui/button'
import { save, unsave, useSavedSchemes } from '@/features/applications/store'
import { deadlineStatus, deadlineText, formatDate, hostOf } from '@/features/schemes/format'
import type { EligibilityRule, Scheme } from '@/features/schemes/types'
import { useSchemes } from '@/features/schemes/useSchemes'
import { cn } from '@/lib/cn'

type SectionId = 'overview' | 'eligibility' | 'documents' | 'steps' | 'offline' | 'official' | 'dates' | 'help'

const ruleIcon: Record<EligibilityRule['result'], { icon: typeof CircleCheck; className: string }> = {
  met: { icon: CircleCheck, className: 'text-eligible' },
  notMet: { icon: CircleX, className: 'text-not' },
  unknown: { icon: CircleHelp, className: 'text-info' },
}

function Section({ id, title, children }: { id: SectionId; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <h2 id={`${id}-title`} className="mb-4 text-2xl font-extrabold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Which sections this scheme has content for, in page order. */
function sectionsFor(s: Scheme): SectionId[] {
  const list: SectionId[] = []
  if (s.about || s.benefits?.length) list.push('overview')
  list.push('eligibility', 'documents', 'steps', 'offline')
  if (s.officialDocuments?.length) list.push('official')
  if (s.importantDates?.length) list.push('dates')
  if (s.helpline) list.push('help')
  return list
}

/** Full page for one scheme: everything a student needs before going to the official portal. */
export function SchemeDetailPage() {
  const { t } = useTranslation()
  const { schemeId } = useParams()
  const { schemes, loading, error, retry } = useSchemes()
  const { list: saved } = useSavedSchemes()
  const scheme = schemes.find((s) => s.id === schemeId)
  const isSaved = saved.some((a) => a.schemeId === schemeId)

  useEffect(() => {
    if (scheme) document.title = `${scheme.name} · Fundora`
  }, [scheme])

  if (loading || error) return <LoadState loading={loading} error={error} onRetry={retry} />

  if (!scheme) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-lg font-semibold">{t('app.detail.notFound')}</p>
        <Link to="/applications" className={buttonClasses({ variant: 'outline' })}>
          {t('app.detail.backToApplications')}
        </Link>
      </div>
    )
  }

  const sections = sectionsFor(scheme)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link
        to={isSaved ? '/applications' : '/browse'}
        className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {isSaved ? t('app.detail.backToApplications') : t('app.detail.backToBrowse')}
      </Link>

      <header className="flex flex-col gap-5 rounded-3xl bg-linear-160 from-brand to-brand-strong p-6 text-white sm:p-9">
        <p className="text-xs font-bold tracking-[0.14em] uppercase">
          {t(`app.aidSingular.${scheme.aidType}`)} · {scheme.provider}
        </p>
        <h1 className="max-w-3xl text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">{scheme.name}</h1>
        <div className="flex flex-wrap gap-2">
          <DeadlineTag status={deadlineStatus(scheme)} />
          <ModeTag mode={scheme.mode} onDark />
        </div>
        <div className="flex max-w-3xl items-start gap-3 rounded-2xl bg-white p-4 text-ink">
          <EligibilityTag state={scheme.match.state} className="shrink-0" />
          <p className="pt-0.5">{scheme.match.reason}</p>
        </div>
        <dl className="grid gap-px overflow-hidden rounded-2xl bg-white/25 sm:grid-cols-3">
          {[
            [t('app.drawer.award'), scheme.amount],
            [t('app.drawer.deadline'), deadlineText(scheme, t)],
            [t('app.drawer.submit'), t(`app.mode.${scheme.mode}`)],
          ].map(([k, v]) => (
            <div key={k} className="bg-brand-strong/60 px-4 py-3">
              <dt className="text-xs font-bold tracking-[0.12em] uppercase opacity-90">{k}</dt>
              <dd className="mt-1 font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          {sections.includes('overview') && (
            <Section id="overview" title={t('app.detail.sections.overview')}>
              {scheme.about && <p className="max-w-prose text-lg leading-relaxed">{scheme.about}</p>}
              {scheme.benefits && scheme.benefits.length > 0 && (
                <div className="mt-5 rounded-2xl border border-line bg-white p-5">
                  <p className="text-xs font-bold tracking-[0.12em] text-muted uppercase">{t('app.detail.benefits')}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {scheme.benefits.map((b) => (
                      <li key={b} className="flex gap-2.5">
                        <CircleCheck className="mt-0.5 size-5 shrink-0 text-eligible" aria-hidden="true" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}

          <Section id="eligibility" title={t('app.detail.sections.eligibility')}>
            {scheme.eligibility && scheme.eligibility.length > 0 ? (
              <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-white">
                {scheme.eligibility.map((r) => {
                  const { icon: Icon, className } = ruleIcon[r.result]
                  return (
                    <li key={r.rule} className="flex items-start gap-3 p-4">
                      <Icon className={cn('mt-0.5 size-5 shrink-0', className)} aria-hidden="true" />
                      <span className="flex-1">{r.rule}</span>
                      <span className={cn('text-sm font-semibold', className)}>{t(`app.detail.rule.${r.result}`)}</span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-muted">{scheme.match.reason}</p>
            )}
          </Section>

          <Section id="documents" title={t('app.detail.sections.documents')}>
            <p className="mb-3 text-muted">{t('app.detail.documentsIntro')}</p>
            <DocumentsList scheme={scheme} />
          </Section>

          <Section id="steps" title={t('app.detail.sections.steps')}>
            <StepsList scheme={scheme} />
          </Section>

          <Section id="offline" title={t('app.detail.sections.offline')}>
            <OfflineInfo scheme={scheme} />
          </Section>

          {scheme.officialDocuments && scheme.officialDocuments.length > 0 && (
            <Section id="official" title={t('app.detail.sections.official')}>
              <p className="mb-3 text-muted">{t('app.detail.officialIntro', { portal: scheme.portal.name })}</p>
              <ul className="flex flex-col gap-2">
                {scheme.officialDocuments.map((d) => {
                  const Icon = d.format === 'pdf' ? FileText : Globe
                  return (
                    <li key={d.title}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 hover:border-ink"
                      >
                        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold group-hover:underline">{d.title}</span>
                          <span className="block text-sm text-muted">
                            {t(`app.detail.docKind.${d.kind}`)} · {t(`app.detail.format.${d.format}`)} · {hostOf(d.url)}
                            {d.publishedOn && ` · ${formatDate(d.publishedOn)}`}
                          </span>
                        </span>
                        <ExternalLink className="size-5 shrink-0 text-muted" aria-hidden="true" />
                        <span className="sr-only">{t('app.newTab')}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </Section>
          )}

          {scheme.importantDates && scheme.importantDates.length > 0 && (
            <Section id="dates" title={t('app.detail.sections.dates')}>
              <ol className="relative flex flex-col gap-0 border-l-2 border-line pl-6">
                {scheme.importantDates.map((d) => (
                  <li key={d.label} className="relative pb-5 last:pb-0">
                    <span aria-hidden="true" className="absolute top-1.5 -left-[31px] size-3 rounded-full border-2 border-white bg-brand" />
                    <p className="text-sm font-semibold text-muted">{formatDate(d.date)}</p>
                    <p className="font-bold">{d.label}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {scheme.helpline && (
            <Section id="help" title={t('app.detail.sections.help')}>
              <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
                {scheme.helpline.phone && (
                  <p className="flex items-center gap-3">
                    <Phone className="size-5 text-muted" aria-hidden="true" />
                    {scheme.helpline.phone}
                  </p>
                )}
                {scheme.helpline.email && (
                  <p className="flex items-center gap-3">
                    <Mail className="size-5 text-muted" aria-hidden="true" />
                    {scheme.helpline.email}
                  </p>
                )}
                {scheme.helpline.hours && <p className="text-sm text-muted">{scheme.helpline.hours}</p>}
                <p className="text-sm text-muted">{t('app.detail.helpNote', { provider: scheme.provider })}</p>
              </div>
            </Section>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:w-80 lg:shrink-0">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
            <a
              href={scheme.portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({}, 'min-h-12 rounded-2xl text-center')}
            >
              {t('app.drawer.open', { portal: scheme.portal.name })}
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="sr-only">{t('app.newTab')}</span>
            </a>
            <button
              type="button"
              aria-pressed={isSaved}
              onClick={() => (isSaved ? unsave(scheme.id) : save(scheme.id))}
              className={buttonClasses({ variant: 'outline' }, 'min-h-12 rounded-2xl text-center')}
            >
              {isSaved ? <BookmarkCheck className="size-5" aria-hidden="true" /> : <BookmarkPlus className="size-5" aria-hidden="true" />}
              {isSaved ? t('app.drawer.saved') : t('app.drawer.save')}
            </button>
            <p className="text-xs text-muted">{t('app.drawer.footnote', { domain: hostOf(scheme.portal.url) })}</p>
            <p className="border-t border-line pt-3 text-xs text-muted">
              {t('app.detail.verified', { date: formatDate(scheme.verifiedOn) })}{' '}
              <a href="#" className="font-semibold text-brand-strong underline">
                {t('app.detail.report')}
              </a>
            </p>
          </div>

          <nav aria-label={t('app.detail.onThisPage')} className="hidden rounded-2xl border border-line bg-white p-5 lg:block">
            <p className="text-xs font-bold tracking-[0.12em] text-muted uppercase">{t('app.detail.onThisPage')}</p>
            <ul className="mt-2 flex flex-col">
              {sections.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} className="block rounded-lg px-2 py-2 text-sm font-medium hover:bg-surface">
                    {t(`app.detail.sections.${id}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  )
}
