export const opportunitySample = {
  organization: 'Harbor Home Services',
  context: 'A fictional regional home-services company handling inbound leads, estimates, technician scheduling, and customer follow-up across several disconnected tools.',
  executiveSummary: 'A strong first AI pilot is a lead-to-estimate briefing workflow. It assembles the information a coordinator already needs, flags what is missing, and drafts the next action for human approval.',
  opportunities: [
    {
      title: 'Lead-to-estimate briefing',
      workflow: 'Combine the inquiry, service history, photos, service area, and scheduling constraints into one coordinator-ready brief.',
      value: 'High',
      complexity: 'Medium',
      risk: 'Low',
      why: 'Coordinators repeatedly gather and rewrite the same context before a lead can move forward.',
      humanControl: 'A coordinator confirms the service recommendation, estimate language, and customer-facing reply.'
    },
    {
      title: 'Post-visit follow-up',
      workflow: 'Turn technician notes into a clear recap, recommended next step, and draft customer message.',
      value: 'High',
      complexity: 'Low',
      risk: 'Medium',
      why: 'The source information already exists, but the quality and timing of follow-up varies by employee.',
      humanControl: 'The technician or account owner approves pricing, commitments, and the final message.'
    },
    {
      title: 'Review issue routing',
      workflow: 'Classify new reviews, identify the likely operating issue, and route urgent complaints to the right owner.',
      value: 'Medium',
      complexity: 'Low',
      risk: 'Low',
      why: 'The company can respond faster while learning which operational problems are recurring.',
      humanControl: 'A manager approves public responses and decides whether a service-recovery action is warranted.'
    }
  ],
  recommendedPilot: {
    title: 'Start with the lead-to-estimate brief',
    reason: 'It is frequent, bounded, measurable, and leaves the customer-facing decision with a person.',
    steps: ['Map the current intake fields and handoffs', 'Create a structured brief from existing lead data', 'Add missing-information checks', 'Draft the next action and hold it for approval', 'Pilot with one coordinator for two weeks'],
    successMetric: 'Time from complete inquiry to coordinator-ready estimate brief, plus the percentage of briefs accepted with minor or no edits.'
  },
  guardrails: ['Do not generate final pricing without approved business rules', 'Do not send customer communication without review during the pilot', 'Keep source information visible so employees can verify the output'],
  evidenceNote: 'This is a sample analysis of a fictional company. A custom run uses the public website and context you provide.'
}

export const complaintSample = {
  caseId: 'LAB-4821',
  needsClarification: false,
  clarificationQuestion: '',
  clarificationReason: '',
  receivedFrom: 'Web form',
  originalRequest: 'My two dining chairs arrived damaged, and support never followed up after promising replacements last week. I need this resolved before I dispute the charge.',
  category: 'Billing and product quality',
  urgency: 'High',
  sentiment: 'Frustrated',
  customerIntent: 'Replacement or refund plus an explanation',
  department: 'Customer care · priority queue',
  routeReason: 'The request combines damaged merchandise, a missed prior commitment, and a potential charge dispute, so it needs an experienced service-recovery owner.',
  summary: 'The customer reports that two dining chairs arrived with damaged fabric and that the replacement date has already been missed once. They want a concrete resolution after receiving general status updates.',
  facts: ['Two chairs arrived with damaged upholstery', 'A replacement was previously promised', 'The promised replacement date passed', 'The customer is requesting a refund or confirmed replacement'],
  missingInformation: ['Order number', 'Photos of the damage', 'Preferred resolution if both options are available'],
  recommendedAction: 'Route to a senior customer-care representative, verify the order and replacement inventory, then respond with one confirmed resolution and date.',
  nextSteps: ['Verify the order and previous-contact history', 'Review damage photos and replacement inventory', 'Confirm refund authority if replacement timing is unacceptable', 'Send one approved response with a specific owner and next-update time'],
  escalation: { required: true, reason: 'A prior commitment was missed and the customer is threatening to dispute the charge.' },
  internalNote: 'Do not send another generic apology. Confirm inventory or refund authority before responding. Preserve the prior-contact history for the assigned representative.',
  draftResponse: 'I’m sorry. We missed the replacement date we gave you, and you should have received a clear answer by now. I’ve escalated this for order verification so we can give you one confirmed resolution: either an available replacement with a firm date or a refund. Please send the order number and, if available, photos of the damaged fabric so the assigned representative can complete the next step without making you repeat the issue.',
  similarCases: [
    { id: 'DEMO-101', type: 'Damaged delivery', issue: 'Two upholstered chairs arrived with visible transit damage.', solution: 'Support verified the order and photos, checked replacement inventory, and gave the customer one confirmed resolution path.', outcome: 'Replacement inventory was confirmed and the customer received a specific delivery window.' },
    { id: 'DEMO-102', type: 'Missed follow-up', issue: 'A customer contacted support twice without receiving the promised update.', solution: 'The case was assigned to one owner, the prior contact history was summarized, and a firm next-update time was established.', outcome: 'The customer stopped repeating the issue and the case closed after one owner completed the follow-through.' }
  ],
  automationLog: [
    { label: 'Message received', detail: 'Complaint captured from the website form' },
    { label: 'Intent classified', detail: 'Replacement or refund requested' },
    { label: 'Risk checked', detail: 'Missed commitment and charge-dispute risk detected' },
    { label: 'Owner selected', detail: 'Priority customer-care queue' },
    { label: 'Ticket prepared', detail: 'Internal summary and response draft created' },
    { label: 'Human approval required', detail: 'Inventory, refund authority, and final response remain human-controlled' }
  ]
}

export const roleMatchSample = {
  role: 'AI Product Owner, fictional equipment manufacturer',
  interviewCase: 'Gunnar is worth interviewing when the role needs someone who can understand users and commercial constraints, shape an AI-enabled workflow, and get hands-on enough to prove the first version.',
  strongestMatches: [
    {
      title: 'Business-to-product translation',
      evidence: 'His background spans sales operations, product launches, customer-facing work, client discovery, and functional product building.',
      relevance: 'That range is useful when requirements have to be discovered across business and technical teams.'
    },
    {
      title: 'Hands-on AI product work',
      evidence: 'He built a functional PrepMe interview demo and a functional home-services CRM demonstration that models AI assistance inside complete user workflows.',
      relevance: 'He can move beyond a recommendation and produce something stakeholders can test.'
    },
    {
      title: 'Adoption and communication',
      evidence: 'At Sub-Zero, he built Power BI tools and trained outside sales users to apply them.',
      relevance: 'It is direct evidence that he understands a useful tool still has to fit how people work.'
    }
  ],
  relevantProjects: [
    { name: 'Home-Services AI CRM', reason: 'Best proof of workflow design, connected AI assistance, and human approval.', href: 'https://new-teal-delta.vercel.app/app' },
    { name: 'PrepMe', reason: 'A functional interview demo built around user-specific inputs and a complete practice workflow.', href: 'https://prep-me-wheat.vercel.app/' }
  ],
  transferableEvidence: ['Cross-functional launch support', 'Client and stakeholder discovery', 'Business reporting and user training', 'Rapid functional prototyping', 'Customer and commercial judgment'],
  discussionAreas: [
    'Ask how he would move a successful prototype into a governed production environment.',
    'Explore how he would partner with deeper engineering, security, and data specialists.',
    'Discuss which operating workflow the team most needs a product owner to untangle.'
  ],
  interviewQuestions: ['Walk me through how you decide what AI should handle and what should remain human-controlled.', 'How did the CRM workflow change as you moved from the idea to a functioning product?', 'Tell me about a time users needed help adopting a tool you built.'],
  recommendedPages: [
    { label: 'View Gunnar’s projects', href: '/projects' },
    { label: 'Read his background', href: '/about' },
    { label: 'Open his résumé', href: '/Gunnar-Neuman-Resume.pdf' }
  ],
  truthBoundary: 'This brief argues the strongest evidence-based case. Its scope excludes enterprise AI deployments, formal ML engineering, and unverified experience.'
}
