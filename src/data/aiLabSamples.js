export const opportunitySample = {
  organization: 'Harbor Home Services',
  context: 'A fictional regional home-services company handling inbound leads, estimates, technician scheduling, and customer follow-up across several disconnected tools.',
  executiveSummary: 'The best first AI pilot is not a general chatbot. It is a lead-to-estimate briefing workflow that assembles the information a coordinator already needs, flags what is missing, and drafts the next action for human approval.',
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
    steps: ['Map the current intake fields and handoffs', 'Create a structured brief from existing lead data', 'Add missing-information checks', 'Draft—but do not send—the next action', 'Pilot with one coordinator for two weeks'],
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
  summary: 'The customer reports that two dining chairs arrived with damaged fabric and that the replacement date has already been missed once. They want a concrete resolution, not another general status update.',
  facts: ['Two chairs arrived with damaged upholstery', 'A replacement was previously promised', 'The promised replacement date passed', 'The customer is requesting a refund or confirmed replacement'],
  missingInformation: ['Order number', 'Photos of the damage', 'Preferred resolution if both options are available'],
  recommendedAction: 'Route to a senior customer-care representative, verify the order and replacement inventory, then respond with one confirmed resolution and date.',
  nextSteps: ['Verify the order and previous-contact history', 'Review damage photos and replacement inventory', 'Confirm refund authority if replacement timing is unacceptable', 'Send one approved response with a specific owner and next-update time'],
  escalation: { required: true, reason: 'A prior commitment was missed and the customer is threatening to dispute the charge.' },
  internalNote: 'Do not send another generic apology. Confirm inventory or refund authority before responding. Preserve the prior-contact history for the assigned representative.',
  draftResponse: 'I’m sorry—we missed the replacement date we gave you, and you should not have to keep asking for a clear answer. I’ve escalated this for order verification so we can give you one confirmed resolution: either an available replacement with a firm date or a refund. Please send the order number and, if available, photos of the damaged fabric so the assigned representative can complete the next step without making you repeat the issue.',
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
  role: 'AI Product Owner — fictional equipment manufacturer',
  interviewCase: 'Gunnar is worth interviewing when the role needs someone who can understand users and commercial constraints, shape an AI-enabled workflow, and get hands-on enough to prove the first version.',
  strongestMatches: [
    {
      title: 'Business-to-product translation',
      evidence: 'His background spans sales operations, product launches, customer-facing work, client discovery, and functional product building.',
      relevance: 'That range is useful when requirements have to be discovered across business and technical teams.'
    },
    {
      title: 'Hands-on AI product work',
      evidence: 'He built PrepMe and a functional home-services CRM demonstration with AI embedded inside complete user workflows.',
      relevance: 'He can move beyond a recommendation and produce something stakeholders can actually test.'
    },
    {
      title: 'Adoption and communication',
      evidence: 'At Sub-Zero, he built Power BI tools and trained outside sales users to apply them.',
      relevance: 'It is direct evidence that he understands a useful tool still has to fit how people work.'
    }
  ],
  relevantProjects: [
    { name: 'Home-Services AI CRM', reason: 'Best proof of workflow design, connected AI assistance, and human approval.', href: 'https://new-teal-delta.vercel.app/app' },
    { name: 'PrepMe', reason: 'Best proof of a live, end-to-end AI product built around user-specific inputs.', href: 'https://prep-me-wheat.vercel.app/' }
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
  truthBoundary: 'This brief argues the strongest evidence-based case. It does not claim enterprise AI deployments, formal ML engineering, or experience Gunnar does not have.'
}

export const reputationSampleReviews = `5 stars — The technician was excellent and explained everything clearly. Scheduling was easy and they arrived right on time.
2 stars — The repair itself was fine, but nobody called me back for three days and I had no idea when the part would arrive.
1 star — I received one price on the phone and a different price after the visit. Still waiting for someone to explain the charge.
4 stars — Great work and a friendly crew. The appointment window was too wide, but I would use them again.
2 stars — Had to repeat the same issue to three different people. The technician did not seem to have the notes from my first call.
5 stars — Fast, professional, and the follow-up summary was very helpful.
3 stars — Good service once they arrived. Communication before the appointment needs work.`

export const reputationSample = {
  businessName: 'Harbor Home Services',
  publicProfile: 'Fictional sample business',
  reportSchedule: 'Every Monday at 8:00 AM',
  executiveSummary: 'Customers generally trust the field team and the quality of the work. The reputation risk is concentrated in the handoffs around that work: callbacks, status updates, pricing consistency, and whether technicians receive the original customer context.',
  themes: [
    { theme: 'Field service quality', sentiment: 'Positive', frequency: '3 of 7 reviews', evidence: 'Technicians are described as professional, clear, friendly, and effective.' },
    { theme: 'Communication gaps', sentiment: 'Negative', frequency: '4 of 7 reviews', evidence: 'Customers mention delayed callbacks, weak appointment updates, and uncertainty about next steps.' },
    { theme: 'Context lost at handoff', sentiment: 'Negative', frequency: '1 explicit review; supported by other communication complaints', evidence: 'One customer repeated the issue to multiple employees and the technician lacked the original notes.' },
    { theme: 'Pricing clarity', sentiment: 'Negative', frequency: '1 of 7 reviews', evidence: 'A customer reported different quoted and final prices without a timely explanation.' }
  ],
  operationalIssues: [
    { issue: 'No consistent ownership of pre-visit communication', signal: 'Delayed callbacks and unclear arrival/part status', likelyOwner: 'Scheduling or customer service' },
    { issue: 'Intake context is not reliably reaching the field', signal: 'Repeated explanations and missing technician notes', likelyOwner: 'Dispatch and CRM workflow' },
    { issue: 'Estimate changes are not explained consistently', signal: 'Quoted and invoiced price mismatch', likelyOwner: 'Sales and service management' }
  ],
  risks: ['Strong technician performance may be overshadowed by preventable communication failures', 'Unexplained price changes can turn an ordinary service issue into a trust issue', 'Repeated handoff failures may increase callbacks and employee rework'],
  recommendations: [
    { action: 'Create one customer-status owner for every open job', owner: 'Service operations', timing: 'This week', impact: 'Fewer unanswered status requests and clearer accountability' },
    { action: 'Give technicians an auto-generated pre-visit brief built from intake and prior contacts', owner: 'Dispatch / systems', timing: 'Pilot in 30 days', impact: 'Less repeated context and better first-visit readiness' },
    { action: 'Require a written reason when the final estimate differs from the initial range', owner: 'Sales and service management', timing: 'Within 30 days', impact: 'Reduced pricing confusion and more defensible customer communication' }
  ],
  draftResponses: [
    { situation: 'Delayed callback', response: 'Thank you for calling this out. The service work may have been completed well, but leaving you without an update for three days was not acceptable. We are reviewing the handoff and would like the opportunity to follow up directly.' },
    { situation: 'Pricing discrepancy', response: 'We understand why receiving two different prices would be frustrating. A change in scope should be explained clearly before the work moves forward. Please contact our service manager so we can review the estimate and final charge with you.' }
  ],
  nextMove: 'Fix the communication handoff before spending more on review-response automation. The reviews suggest an operating problem first and a writing problem second.',
  sources: [
    { title: 'Google Business Profile', url: 'https://www.google.com/business/', finding: 'Sample review themes and rating activity' },
    { title: 'Company website', url: 'https://example.com/', finding: 'Sample service and contact context' }
  ],
  evidenceNote: 'This is a fictional sample report. A custom run researches the public business information available at the time of the request.'
}
