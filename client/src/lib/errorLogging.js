// Technical error logging with Sentry. The SDK is imported only when a DSN is
// set, so it stays out of the entry chunk. Nothing the visitor types is sent:
// no default PII, no input breadcrumbs, no request bodies, no user object.

export function scrubBreadcrumb(crumb) {
  return crumb.category === 'ui.input' ? null : crumb
}

export function scrubEvent(event) {
  if (event.request) {
    delete event.request.data
    delete event.request.cookies
  }
  delete event.user
  return event
}

export async function initErrorLogging(dsn) {
  if (!dsn) return null
  try {
    const Sentry = await import('@sentry/react')
    Sentry.init({
      dsn,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeBreadcrumb: scrubBreadcrumb,
      beforeSend: scrubEvent,
    })
    return Sentry
  } catch {
    // Logging must never break the site.
    return null
  }
}
