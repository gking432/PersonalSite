export const siteOrigin = 'https://www.gunnarneuman.com'

export const siteMetadata = {
  '/': {
    title: 'Gunnar Neuman | AI Implementation & Business Systems',
    description: 'Gunnar Neuman works at the intersection of business operations and AI: finding the workflow, deciding where AI belongs, and building systems people adopt.',
  },
  '/about': {
    title: 'About Gunnar Neuman | AI Implementation & Business Systems',
    description: 'Gunnar Neuman combines experience in customers, sales operations, product launches, and client work with hands-on AI product development.',
  },
  '/projects': {
    title: 'AI Projects & Implementation Case Studies | Gunnar Neuman',
    description: 'Explore Gunnar Neuman\'s functional AI systems, implementation case studies, and technical product builds.',
  },
  '/projects/home-services-crm': {
    title: 'Home-Services AI CRM Case Study | Gunnar Neuman',
    description: 'See how Gunnar Neuman designed a functional AI CRM demonstration around intake, lead analysis, calls, quotes, scheduling, follow-up, and human approval.',
  },
  '/projects/prepme': {
    title: 'PrepMe AI Interview System | Gunnar Neuman',
    description: 'See how PrepMe connects a live AI interview to structured evidence, evaluation, feedback, and targeted coaching.',
  },
  '/projects/steward': {
    title: 'Steward AI Financial System | Gunnar Neuman',
    description: 'See how Steward combines deterministic financial planning with a bounded AI layer for questions, explanations, and guided setup.',
  },
  '/client-work': {
    title: 'Client Work | Gunnar Neuman',
    description: 'Selected client work from Gunnar Neuman across discovery, websites, commerce, customer acquisition, launch, and reporting.',
  },
  '/writing': {
    title: 'Writing | Gunnar Neuman',
    description: 'Notes from Gunnar Neuman on AI implementation, products, workflows, customers, and building useful systems.',
  },
  '/contact': {
    title: 'Contact Gunnar Neuman',
    description: 'Contact Gunnar Neuman about AI implementation, product ownership, business systems, and related opportunities.',
  },
  '/insights/gunnar-neuman-profile': {
    title: 'Gunnar Neuman | AI Implementation Profile',
    description: 'A detailed profile of Gunnar Neuman\'s business background, AI implementation work, functional products, and project experience.',
  },
}

export const publicRoutes = Object.entries(siteMetadata).map(([path, metadata]) => ({
  path,
  ...metadata,
}))
