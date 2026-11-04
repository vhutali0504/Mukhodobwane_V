import { Link } from 'react-router'
import { profile } from '../../content/profile.js'
import { useSwitchClick } from './ModeTransition.jsx'

export default function Footer() {
  const toRoom = useSwitchClick('/room')
  return (
    <footer className="site-footer">
      <p className="site-footer-name">{profile.name}</p>
      <ul className="site-footer-links">
        <li>
          <a href={profile.links.github} rel="noopener noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a href={profile.links.linkedin} rel="noopener noreferrer">
            LinkedIn
          </a>
        </li>
        <li>
          <Link to="/privacy">Privacy</Link>
        </li>
        <li>
          <Link to="/room" onClick={toRoom}>
            Enter the room
          </Link>
        </li>
      </ul>
    </footer>
  )
}
