import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { profile } from '../content/profile.js'

export default function Home() {
  useDocumentMeta({
    title: `${profile.name} · Software Developer`,
    description: profile.summary,
  })
  return (
    <main>
      <h1>{profile.name}</h1>
    </main>
  )
}
