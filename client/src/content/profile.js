// Single source of truth for all site text. Derived from the CV (spec Appendix A).
// No phone number here, on purpose: it lives only inside the downloadable CV PDF.

export const profile = {
  name: 'Mukhodobwane Vhutalihandivho',
  shortName: 'Vhutali M.',
  location: 'Johannesburg, South Africa',
  email: 'mukhodobwanevhutali@gmail.com',
  availability: 'Open to roles, starting 2027',
  summary:
    'Final-year BSc Computer Science and Informatics student at the University of Johannesburg and co-founder of a freelance web development partnership. I build full-stack web apps with secure authentication, and I want to keep growing in a structured, high-intensity environment.',
  roles: [
    'Full-stack developer',
    'Co-founder, Elevate Digital Solutions',
    'Secure authentication builder',
  ],
  links: {
    github: 'https://github.com/vhutali0504',
    linkedin: 'https://www.linkedin.com/in/mukhodobwanev',
    tryhackme: 'https://tryhackme.com/p/HawkSpecter',
  },
  cvUrl: '/cv/Mukhodobwane-Vhutalihandivho-CV.pdf',
  photo: {
    base: '/images/portrait',
    alt: 'Portrait of Mukhodobwane Vhutalihandivho',
  },
  stats: [
    { value: 5, label: 'projects built' },
    { value: 5, label: 'programming languages' },
    { value: 2, label: 'junior students mentored' },
    { value: 2026, label: 'co-founded Elevate Digital Solutions' },
  ],
  experience: [
    {
      org: 'Elevate Digital Solutions',
      title: 'Co-Founder & Technical Lead',
      when: '2026 – Present',
      location: 'Johannesburg',
      bullets: [
        'Co-founded Elevate Digital Solutions, a freelance web development partnership, while completing my final year of studies. Took on real clients, managed projects end to end and delivered production software outside of academic work.',
        'Led technical delivery across projects: scoping requirements, architecting solutions, writing production code and handling client communication.',
        'Delivered production websites for clients including an NPO (Thusa Lushaka Empowerment), handling ongoing maintenance and post-launch support.',
      ],
    },
    {
      org: 'StudyTrust',
      title: 'Peer Mentor, Formal Bursary Programme',
      when: 'Feb 2026 – Nov 2026',
      bullets: [
        'Mentored 2 junior Computer Science students through coursework challenges, study planning and academic development as part of a structured bursary programme.',
        'Wrote clear, structured explanations of complex topics (data structures, algorithms and OOP), which also reinforced my own understanding.',
        'Was assigned an industry mentor through the programme, gaining exposure to professional engineering practices and career planning.',
      ],
    },
  ],
  projects: [
    {
      id: 'ksms',
      title: 'MutualTrust – Student Management System (KSMS)',
      kind: 'Final Year Project',
      when: 'Jan 2026 – Oct 2026',
      stack: ['React', 'Node.js', 'PostgreSQL'],
      bullets: [
        'Built both the frontend and backend of a multi-role platform serving student, teacher, centre manager and admin workflows, with full ownership of the authentication and API layers.',
        'Implemented secure auth flows including dual-token JWT, HTTP-only cookies, MFA via email OTP and a refresh queue to handle concurrent API calls safely.',
        'Developed shared utility modules that standardise API communication, validation and UI behaviour across all role-based dashboards.',
        'Worked in a team using Git branching and code reviews, integrating independently developed modules and applying Agile practices throughout.',
      ],
      links: [],
    },
    {
      id: 'fingerprint',
      title: 'Fingerprint Recognition System',
      kind: 'Final Year Project',
      when: 'Apr 2026 – May 2026',
      stack: ['Java', 'Graph Algorithms'],
      bullets: [
        'Designed a graph-based fingerprint matching pipeline that uses Zhang-Suen skeletonisation to extract ridge structure, with minutiae points represented as graph nodes.',
        'Implemented k-NN graph matching to compare fingerprint graphs, enabling similarity scoring and identity classification across benchmark datasets (FVC2002, FVC2004).',
        'Applied graph theory concepts (adjacency, traversal, k-NN) to a real-world biometric problem, linking academic data structures work to a practical application.',
      ],
      links: [{ label: 'Watch demo', url: 'https://youtu.be/2PtRI5dPc_Y' }],
    },
    {
      id: 'tle',
      title: 'Thusa Lushaka Empowerment – NPO Website',
      kind: 'Client Project (EDS)',
      when: '2026',
      stack: ['React', 'Vite', 'React Router', 'Netlify'],
      bullets: [
        'Designed and built a complete multi-section website for a South African youth NPO (Thusa Lushaka Empowerment, Nzhelele, Limpopo), covering their programmes, annual academic awards and the Miss Thusa Lushaka beauty pageant.',
        'Built dedicated pages and sections for About, Programs, Awards, Pageant, Gallery and Donate, with React Router handling navigation and Netlify Forms powering the contact and inquiry forms without a backend.',
        'Built and deployed the site on my own initiative, then pitched it to the organisation and handled the full client conversation from first email to demo presentation.',
      ],
      links: [],
    },
    {
      id: 'job-tracker',
      title: 'Job Application Tracker',
      kind: 'Full-Stack Web App',
      when: '2025',
      stack: ['Node.js', 'Express.js', 'PostgreSQL', 'JWT'],
      bullets: [
        'Built a full-stack REST API backend in Node.js and Express, deployed on Railway, with a plain HTML, CSS and JS frontend hosted on Netlify. It is live and publicly accessible.',
        'Implemented JWT authentication with bcrypt password hashing, protecting all job-related endpoints from unauthenticated access.',
        'Supported full CRUD for job applications with status tracking across four stages (Applied, Interview, Offer and Rejected), giving users a clear view of their search pipeline.',
        'Resolved cross-origin resource sharing (CORS) issues between the separate frontend and backend deployments, a common production challenge for full-stack apps.',
      ],
      links: [
        { label: 'Live app', url: 'https://job-application-tracking1.netlify.app/' },
        { label: 'Source', url: 'https://github.com/vhutali0504/job-tracker-api' },
      ],
    },
    {
      id: 'this-portfolio',
      title: 'Interactive 3D Developer Portfolio',
      kind: 'Personal Project',
      when: '2026',
      stack: ['React', 'Vite', 'React Three Fiber (Three.js)'],
      bullets: [
        'Built a dual-mode portfolio: a clean professional page for recruiters and an interactive 3D "hacker room" (React Three Fiber) where visitors sit at a virtual desk and explore my CV on the monitors.',
        'The 3D room features a typed terminal, a fingerprint-scan boot sequence, a tech trivia quiz and a password-cracking mini-game, with a text-only fallback for low-powered devices and tap controls for mobile.',
        'Over 190 unit tests (Vitest) and 17 end-to-end tests (Playwright); Lighthouse 100 for performance, accessibility and SEO; Netlify Forms contact with spam protection; CSP headers and zero cookies.',
      ],
      links: [{ label: 'Source', url: 'https://github.com/vhutali0504/Mukhodobwane_V' }],
    },
  ],
  skills: [
    { group: 'Languages', items: ['JavaScript (ES6+)', 'Java', 'C++', 'C#', 'SQL'] },
    {
      group: 'Web & Backend',
      items: ['Node.js', 'Express.js', 'REST API design', 'React', 'Vite', 'HTML5', 'CSS3'],
    },
    {
      group: 'Databases',
      items: ['PostgreSQL', 'SQL schema design', 'Relational data modelling'],
    },
    {
      group: 'Security',
      items: ['JWT (dual-token with refresh queue)', 'bcrypt', 'HTTP-only cookies', 'MFA via email OTP'],
    },
    {
      group: 'Tools & Practices',
      items: ['Git', 'GitHub', 'OOP', 'Data Structures & Algorithms', 'Agile/SDLC', 'Railway', 'Netlify'],
    },
  ],
  education: {
    school: 'University of Johannesburg',
    degree: 'BSc Computer Science and Informatics',
    when: '2023 – 2026',
    coursework: [
      'Data Structures & Algorithms',
      'Software Engineering (Requirements, SDLC, Agile)',
      'Priority Queues',
      'Heaps',
      'Hash Tables',
      'Graph Theory',
      'Binary Trees',
    ],
    notes: [
      'Applied coursework practically through team and individual projects spanning backend APIs, graph-based systems and secure authentication architectures.',
      'South African citizen, based in Johannesburg.',
    ],
  },
};
