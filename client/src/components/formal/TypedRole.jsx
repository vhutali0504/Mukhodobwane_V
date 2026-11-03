import { profile } from '../../content/profile.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import { useTypewriter } from '../../hooks/useTypewriter.js'

export default function TypedRole() {
  const reduced = useReducedMotion()
  const text = useTypewriter(profile.roles, { enabled: !reduced })
  return (
    <p className="role">
      <span className="visually-hidden">{profile.roles.join(', ')}</span>
      <span aria-hidden="true">
        <span className="role-typed">{text}</span>
        {!reduced && <span className="role-cursor" />}
      </span>
    </p>
  )
}
