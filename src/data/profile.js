// Single source of truth. Every theme renders from this object.
// Update your details here and all three profiles stay in sync.

export const profile = {
  name: "Mukhodobwane Vhutalihandivho",
  shortName: "JV",
  location: "Johannesburg, South Africa",
  tagline:
    "Final-year BSc Computer Science and Informatics student at the University of Johannesburg, co-founder of Elevate Digital Solutions, and builder of systems where security is a feature, not an afterthought.",
  email: "Mukhodobwanevhutali@gmail.com",
  photo: "/images/me.png",
  links: {
    github: { label: "github.com/vhutali0504", url: "https://github.com/vhutali0504" },
    linkedin: { label: "linkedin.com/in/mukhodobwanev", url: "https://www.linkedin.com/in/mukhodobwanev" },
    tryhackme: { label: "HawkSpecter", url: "https://tryhackme.com/p/HawkSpecter" }, 
  },
  availability: "Available: graduate roles 2027",

  projects: [
    {
      id: "ksms",
      title: "Kutlwanong Student Management System",
      subtitle: "KSMS — MutualTrust",
      stack: ["React", "Node.js", "PostgreSQL"],
      status: "In development",
      role: "Frontend architecture & auth",
      summary:
        "Final-year team project: a multi-role platform serving student, teacher and admin workflows.",
      points: [
        "Dual-token JWT auth with HTTP-only cookies, email OTP MFA and a refresh queue that keeps concurrent API calls safe.",
        "Shared utility modules standardising API communication, validation and UI behaviour across all dashboards.",
        "Git branching and code reviews across independently developed modules.",
      ],
      links: [],
    },
    {
      id: "fingerprint",
      title: "Fingerprint Recognition System",
      image: "/images/projects/fingerprint.png",
      subtitle: "Graph-based biometric matching",
      stack: ["Java", "Graph algorithms"],
      status: "Team project",
      role: "Matching pipeline",
      summary:
        "Graph-based fingerprint matching evaluated on the FVC2002 and FVC2004 benchmark datasets.",
      points: [
        "Zhang-Suen skeletonisation to extract ridge structure from fingerprint images.",
        "Minutiae detected as graph nodes; k-NN graph matching for similarity scoring and identity classification.",
      ],
      links: [{ label: "Watch demo", url: "https://youtu.be/2PtRI5dPc_Y" }],
    },
    {
      id: "job-tracker",
      title: "Job Application Tracker",
      image: "/images/projects/jobtracker.jpg",
      subtitle: "Full-stack, live in production",
      stack: ["Node.js", "Express", "PostgreSQL", "JWT"],
      status: "Live",
      role: "Solo build",
      summary:
        "REST API backend on Railway with a vanilla JS frontend on Netlify, deployed separately and talking across origins.",
      points: [
        "JWT auth with bcrypt hashing protecting every job-related endpoint.",
        "Full CRUD with a four-stage pipeline: Applied, Interview, Offer, Rejected.",
        "Debugged and resolved real production CORS issues between deployments.",
      ],
      links: [
        { label: "Live app", url: "https://job-application-tracking1.netlify.app/" },
        { label: "Source", url: "https://github.com/vhutali0504/job-tracker-api" },
      ],
    },
    {
      id: "terminal",
      title: "Terminal-style portfolio",
      image: "/images/projects/terminal.png",
      subtitle: "The previous identity",
      stack: ["HTML", "CSS", "Vanilla JS"],
      status: "Live",
      role: "Solo build",
      summary:
        "An interactive terminal built from scratch with DOM manipulation and no frameworks. Kept on record as evidence of range.",
      points: [],
      links: [
        { label: "Visit", url: "https://terminalportfolio1.netlify.app/" },
        { label: "Source", url: "https://github.com/vhutali0504/portfolio" },
      ],
    },
  ],

  experience: [
   {
      when: "2025 — Present", // TODO: confirm EDS start date
      title: "Co-Founder & Technical Lead",
      org: "Elevate Digital Solutions · Johannesburg",
      summary:
        "Lead technical direction at a web agency: built and shipped the agency's own site (React/Vite, Netlify, POPIA-compliant consent) and deliver client websites end to end, from requirements through deployment.",
    },
    {
      when: "Feb 2026 — Present",
      title: "Peer Mentor",
      org: "StudyTrust Bursary Programme",
      summary:
        "Mentor two junior CS students through coursework and study planning; paired with an industry mentor for exposure to professional engineering practice.",
    },
    {
      when: "2023 — 2026",
      title: "BSc Computer Science & Informatics",
      org: "University of Johannesburg",
      summary:
        "Data structures & algorithms, software engineering, graph theory — applied through backend APIs, biometric systems and secure authentication work.",
    },
  ],

  skills: {
    Languages: ["JavaScript ES6+", "Java", "C++", "C#", "SQL"],
    "Web & Backend": ["Node.js", "Express", "React", "REST APIs", "PostgreSQL"],
    Security: ["JWT (dual-token)", "bcrypt", "HTTP-only cookies", "MFA / OTP", "TryHackMe"],
    "Tools & Practice": ["Git & GitHub", "Agile / SDLC", "Railway", "Netlify", "Vite"],
  },
};

// The three viewing profiles. Content is identical; only the lens changes.
export const THEMES = [
  {
    id: "student",
    name: "The Student",
    blurb: "Final-year at UJ. Clean and straightforward.",
  },
  {
    id: "cyber",
    name: "ShadowHawk",
    blurb: "The security side. Enter if you dare.",
  },
  {
    id: "swe",
    name: "The Engineer",
    blurb: "Systems, structure, shipped work.",
  },
];