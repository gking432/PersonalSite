export const catalogProducts = [
  { id: 'arc-task', name: 'Arc Task Chair', code: 'AT-104', category: 'Task seating', page: 1, position: 1, form: 'task', description: 'An adjustable task chair with a breathable back and upholstered seat.', supportedFabrics: ['slate', 'juniper', 'cobalt'] },
  { id: 'field-sofa', name: 'Field Modular Sofa', code: 'FM-220', category: 'Lounge', page: 1, position: 2, form: 'sofa', description: 'A modular two-seat sofa designed for flexible common spaces.', supportedFabrics: ['sand', 'juniper', 'ember', 'cobalt'] },
  { id: 'relay-stool', name: 'Relay Counter Stool', code: 'RC-118', category: 'Café', page: 1, position: 3, form: 'stool', description: 'A compact counter stool with a wrapped upholstered seat.', supportedFabrics: ['slate', 'sand', 'ember'] },
  { id: 'cove-booth', name: 'Cove Privacy Booth', code: 'CP-410', category: 'Focus', page: 1, position: 4, form: 'booth', description: 'A high-back focus booth that softens noise in open workspaces.', supportedFabrics: ['slate', 'juniper', 'cobalt'] },
  { id: 'mesa-table', name: 'Mesa Side Table', code: 'MS-090', category: 'Tables', page: 1, position: 5, form: 'table', description: 'A small powder-coated side table for lounge and waiting areas.', supportedFabrics: [] },
  { id: 'north-ottoman', name: 'North Loop Ottoman', code: 'NO-144', category: 'Lounge', page: 1, position: 6, form: 'ottoman', description: 'A soft rectangular ottoman for informal seating and foot support.', supportedFabrics: ['sand', 'juniper', 'ember', 'cobalt'] },
  { id: 'frame-bench', name: 'Frame Bench', code: 'FB-310', category: 'Public space', page: 2, position: 1, form: 'bench', description: 'A clean-lined bench for reception areas and shared spaces.', supportedFabrics: ['slate', 'sand', 'juniper'] },
  { id: 'hush-chair', name: 'Hush Guest Chair', code: 'HG-201', category: 'Guest seating', page: 2, position: 2, form: 'guest', description: 'A compact guest chair with a supportive upholstered shell.', supportedFabrics: ['slate', 'sand', 'ember'] },
  { id: 'alto-lounge', name: 'Alto Lounge Chair', code: 'AL-330', category: 'Lounge', page: 2, position: 3, form: 'lounge', description: 'A generous lounge chair with a low profile and broad arms.', supportedFabrics: ['sand', 'juniper', 'cobalt'] },
  { id: 'signal-settee', name: 'Signal Settee', code: 'SS-270', category: 'Lounge', page: 2, position: 4, form: 'settee', description: 'A small two-person settee for waiting rooms and collaborative corners.', supportedFabrics: ['slate', 'sand', 'juniper', 'ember'] },
  { id: 'perch-stool', name: 'Perch Work Stool', code: 'PW-160', category: 'Task seating', page: 2, position: 5, form: 'stool', description: 'A height-adjustable stool built for quick touchdown work.', supportedFabrics: ['slate', 'cobalt'] },
  { id: 'harbor-lounge', name: 'Harbor Lounge', code: 'HL-240', category: 'Lounge', page: 2, position: 6, form: 'lounge', description: 'A welcoming lounge chair with a wraparound back and replaceable upholstery.', supportedFabrics: ['sand', 'juniper', 'ember', 'cobalt'], featured: true },
]

export const catalogFabrics = [
  { id: 'slate', name: 'Slate Grid', family: 'Performance weave', color: '#67716e', accent: '#c6cfca', pattern: 'grid', note: 'Durable and neutral. Best when the space already has strong color.' },
  { id: 'sand', name: 'Sandstone', family: 'Textured weave', color: '#c7ae87', accent: '#ede2cf', pattern: 'weave', note: 'Warm, quiet and easy to place in hospitality-style spaces.' },
  { id: 'juniper', name: 'Juniper Bouclé', family: 'Soft texture', color: '#315f4d', accent: '#8fac9f', pattern: 'boucle', note: 'The strongest fit for the Harbor Lounge: warm, tactile and still professional.' },
  { id: 'ember', name: 'Ember Check', family: 'Woven pattern', color: '#9b4c34', accent: '#e6b892', pattern: 'check', note: 'Best used as an accent. Adds energy and contrast to a room.' },
  { id: 'cobalt', name: 'Cobalt Line', family: 'Performance textile', color: '#294d78', accent: '#8da8c6', pattern: 'line', note: 'A clean high-contrast choice for contemporary, high-traffic environments.' },
]

export const profileAnswers = [
  {
    id: 'background',
    label: 'What is Gunnar’s background?',
    keywords: ['background', 'experience', 'career', 'worked'],
    answer: 'Gunnar’s background is in customers, sales teams, product launches and client problems. He later added hands-on product development so he could build and test the systems he proposed.',
    interest: 'Business and technical background',
  },
  {
    id: 'capabilities',
    label: 'What can he build?',
    keywords: ['build', 'technical', 'code', 'capable', 'skills'],
    answer: 'He can take a workflow from rough idea to a functional product: shape the process, design the interface, connect APIs and data, add AI where it is useful, and deploy something people can use. The home-services CRM and its case study are the clearest public evidence.',
    interest: 'Hands-on implementation capability',
  },
  {
    id: 'implementation',
    label: 'Why AI implementation?',
    keywords: ['implementation', 'ai role', 'why ai', 'career change', 'moving'],
    answer: 'The fit is practical. Gunnar understands how employees and customers work, can identify repeated manual steps, and can turn those steps into a usable AI-enabled workflow. His direct evidence comes from self-directed products and functional demonstrations. Business judgment and hands-on building are the core strengths.',
    interest: 'AI implementation fit',
  },
  {
    id: 'projects',
    label: 'Which project should I look at?',
    keywords: ['project', 'portfolio', 'prepme', 'crm', 'proof'],
    answer: 'Start with the home-services CRM case study. It is the clearest example of workflow design, human controls, implementation decisions, and connected AI features working as one system.',
    interest: 'Relevant portfolio proof',
  },
]

export const previewSlots = [
  { id: 'slot-1', day: 'Tuesday', date: 'Aug 11', time: '10:00 AM', zone: 'CT' },
  { id: 'slot-2', day: 'Wednesday', date: 'Aug 12', time: '1:30 PM', zone: 'CT' },
  { id: 'slot-3', day: 'Thursday', date: 'Aug 13', time: '9:00 AM', zone: 'CT' },
]
