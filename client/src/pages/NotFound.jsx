import { Link } from 'react-router'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { profile } from '../content/profile.js'

export default function NotFound() {
  useDocumentMeta({
    title: `404 · ${profile.name}`,
    description: 'This page does not exist.',
  })
  return (
    <main className="nf">
      <div className="nf-term">
        <p className="nf-prompt">visitor@portfolio:~$ cat page</p>
        <h1 className="nf-error">404: file not found</h1>
        <p className="nf-dim">No such file or directory.</p>
        <p>
          <Link className="nf-link" to="/">Back to home</Link>
        </p>
      </div>
    </main>
  )
}
