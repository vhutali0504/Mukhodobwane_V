import { Link } from 'react-router'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { profile } from '../content/profile.js'

export default function Thanks() {
  useDocumentMeta({
    title: `Thanks · ${profile.name}`,
    description: 'Your message was sent.',
  })
  return (
    <main className="page page-narrow">
      <h1>Thanks, your message is in.</h1>
      <p>I have received it and will reply to the email address you gave.</p>
      <p>
        <Link to="/">Back to home</Link>
      </p>
    </main>
  )
}
