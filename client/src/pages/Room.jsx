// Temporary placeholder. Task 12 replaces this with the 3D room.
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { profile } from '../content/profile.js'

export default function Room() {
  useDocumentMeta({
    title: `Room · ${profile.name}`,
    description: 'An interactive hacker-room version of the portfolio.',
  })
  return (
    <main>
      <h1>Room</h1>
    </main>
  )
}
