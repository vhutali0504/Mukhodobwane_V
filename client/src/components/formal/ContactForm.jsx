import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { profile } from '../../content/profile.js'
import { validateContact } from '../../lib/validateContact.js'
import { submitContact } from '../../api/contact.js'

const ORDER = ['name', 'email', 'message', 'consent']

export default function ContactForm() {
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', message: '', consent: false })
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const inFlight = useRef(false)
  const alertRef = useRef(null)

  // Move focus to the error so keyboard users do not lose their place.
  useEffect(() => {
    if (failed) alertRef.current?.focus()
  }, [failed])

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: key === 'consent' ? e.target.checked : e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    if (inFlight.current) return
    const bot = e.currentTarget.elements['bot-field']?.value
    const found = validateContact(values)
    setErrors(found)
    setFailed(false)
    const first = ORDER.find((f) => found[f])
    if (first) {
      e.currentTarget.elements[first]?.focus()
      return
    }
    if (bot) {
      // Spam bot: act as if it worked, send nothing.
      navigate('/thanks')
      return
    }
    inFlight.current = true
    setPending(true)
    try {
      await submitContact(values)
      navigate('/thanks')
    } catch {
      setFailed(true)
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }

  const a11y = (id) => ({
    id: `c-${id}`,
    name: id,
    'aria-invalid': errors[id] ? 'true' : undefined,
    'aria-describedby': errors[id] ? `c-${id}-err` : undefined,
  })
  const err = (id) =>
    errors[id] && (
      <p className="field-error" id={`c-${id}-err`}>
        {errors[id]}
      </p>
    )

  return (
    <section className="section contact" aria-labelledby="contact">
      <h2 id="contact">Contact</h2>
      <div className="contact-grid">
        <div className="contact-side">
          <p>Questions, roles or a project to discuss? Send a message and I will reply by email.</p>
          <ul className="contact-links">
            <li>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <div className="hp" aria-hidden="true">
            <label>
              Leave this field empty
              <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="field">
            <label htmlFor="c-name">Name</label>
            <input
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={set('name')}
              {...a11y('name')}
            />
            {err('name')}
          </div>
          <div className="field">
            <label htmlFor="c-email">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={set('email')}
              {...a11y('email')}
            />
            {err('email')}
          </div>
          <div className="field">
            <label htmlFor="c-message">Message</label>
            <textarea rows={6} value={values.message} onChange={set('message')} {...a11y('message')} />
            {err('message')}
          </div>
          <div className="field consent">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={set('consent')}
              {...a11y('consent')}
            />
            <label htmlFor="c-consent">
              I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">
                privacy policy<span className="visually-hidden"> (opens in a new tab)</span>
              </a> so you can reply to me.
            </label>
            {err('consent')}
          </div>
          {failed && (
            <p className="form-error" role="alert" tabIndex={-1} ref={alertRef}>
              Something went wrong sending your message. Please try again or{' '}
              <a href={`mailto:${profile.email}`}>email me directly</a>.
            </p>
          )}
          <button type="submit" className="btn solid" disabled={pending}>
            {pending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </section>
  )
}
