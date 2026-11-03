import { profile } from '../../content/profile.js'

export default function Footer() {
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
          <a href="/privacy">Privacy</a>
        </li>
        <li>
          <a href="/room">Enter the room</a>
        </li>
      </ul>
    </footer>
  )
}
