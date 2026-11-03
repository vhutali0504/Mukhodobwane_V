import { profile } from '../../content/profile.js'
import ProjectRow from './ProjectRow.jsx'

export default function Work() {
  return (
    <section className="section work" aria-labelledby="work">
      <h2 id="work">Selected work</h2>
      <ol className="rows">
        {profile.projects.map((p, i) => (
          <ProjectRow key={p.id} project={p} index={i} />
        ))}
      </ol>
    </section>
  )
}
