// Posts the contact form to Netlify Forms (detected via the static form in index.html).
export async function submitContact(fields, { fetchImpl = fetch, timeoutMs = 10000 } = {}) {
  const body = new URLSearchParams({
    'form-name': 'contact',
    name: fields.name.trim(),
    email: fields.email.trim(),
    message: fields.message.trim(),
    consent: fields.consent ? 'yes' : '',
  }).toString()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let res
  try {
    res = await fetchImpl('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('timeout')
    throw err
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new Error(`http_${res.status}`)
}
