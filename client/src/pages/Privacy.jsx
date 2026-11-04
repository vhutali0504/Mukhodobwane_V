import { Link } from 'react-router'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { profile } from '../content/profile.js'

export default function Privacy() {
  useDocumentMeta({
    title: `Privacy · ${profile.name}`,
    description: 'What this site collects, why, where it is stored and how to ask for deletion.',
  })
  const mail = `mailto:${profile.email}?subject=Data%20deletion%20request`
  return (
    <main className="page page-narrow">
      <h1>Privacy</h1>
      <p>
        This is a personal portfolio. It collects as little as possible. This page says what, why,
        and how to have it removed.
      </p>

      <h2>What I collect</h2>
      <p>
        Only what you type into the contact form: your name, your email address and your message.
        Nothing else is asked for.
      </p>

      <h2>Why</h2>
      <p>
        To read your message and reply to you. I do not use it for anything else, and I do not send
        marketing email.
      </p>

      <h2>Where it is stored</h2>
      <p>
        The form runs on Netlify Forms, so your submission is stored by Netlify, the company that
        hosts this site. Netlify also filters form spam. I do not run my own server or database.
      </p>

      <h2>How long I keep it</h2>
      <p>
        Until I have dealt with your message, or until you ask me to delete it, whichever comes
        first.
      </p>

      <h2>Analytics</h2>
      <p>
        The site uses GoatCounter, a privacy-friendly page counter. It sets no cookies and stores
        no personal data about you. It only counts page views.
      </p>

      <h2>Cookies</h2>
      <p>This site sets no cookies, so there is no cookie banner.</p>

      <h2>Error logging</h2>
      <p>
        If something breaks, a service called Sentry can log the technical error. It is only active
        if I have set it up, and what you type into the form is not sent to it.
      </p>

      <h2>Ask for deletion</h2>
      <p>
        To have your form submission deleted, email <a href={mail}>{profile.email}</a> and say
        which message was yours. I will delete it and confirm by reply.
      </p>

      <p>
        <Link to="/">Back to home</Link>
      </p>
    </main>
  )
}
