// Returns error messages keyed by field, or {} when valid. Inputs are trimmed first.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContact({ name = '', email = '', message = '', consent = false }) {
  const errors = {}
  const n = name.trim()
  const e = email.trim()
  const m = message.trim()

  if (!n) errors.name = 'Please enter your name.'
  else if (n.length > 100) errors.name = 'Please keep your name to 100 characters or fewer.'

  if (e.length > 254) errors.email = 'Please keep your email to 254 characters or fewer.'
  else if (!EMAIL.test(e)) errors.email = 'Please enter a valid email address.'

  if (m.length < 10) errors.message = 'Please write at least 10 characters.'
  else if (m.length > 5000) errors.message = 'Please keep your message to 5000 characters or fewer.'

  if (!consent) errors.consent = 'Please agree to the privacy policy so I can reply.'
  return errors
}
