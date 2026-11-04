// The 3D hacker room. Lazy-loaded from App.jsx, so three.js and all room code
// stay out of the formal page's bundle.
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { profile } from '../content/profile.js'
import { RoomShell } from '../room/scene/RoomShell.jsx'

export default function Room() {
  useDocumentMeta({
    title: `Room · ${profile.name}`,
    description: 'An interactive hacker-room version of the portfolio.',
  })
  return (
    <main className="room-page">
      <h1 className="visually-hidden">{`${profile.name}'s hacker room`}</h1>
      <RoomShell />
    </main>
  )
}
