// Evaluation set for the Customer Request Router.
//
// These are hand-written inputs with the category I believe is correct for each.
// They exist so the router's accuracy is a measured number rather than an
// impression formed from the four examples on the demo page. Several cases are
// deliberately awkward: mixed intent, missing detail, or a complaint that is
// really a billing question wearing a product complaint's clothes.
//
// To produce results: `node scripts/run-router-eval.mjs` (needs OPENAI_API_KEY).
// It writes src/data/routerEvalResults.json, which the Lab renders. Until that
// file exists the Lab says the eval has not been run rather than showing a score.

export const routerEvalCases = [
  { id: 'EV-01', request: 'We are opening three new locations and need pricing for 120 units by October.', expected: 'Sales Inquiry', note: 'Clean sales case' },
  { id: 'EV-02', request: 'My replacement was promised last week, but nobody has followed up.', expected: 'Returns', note: 'Replacement already in motion' },
  { id: 'EV-03', request: 'Since the last update, the mobile app crashes whenever I upload an invoice.', expected: 'Product Issue', note: 'Clean product defect' },
  { id: 'EV-04', request: 'I have contacted support four times and need a manager to review this today.', expected: 'Management Escalation', note: 'Explicit escalation request' },
  { id: 'EV-05', request: 'I was charged twice for the same order in March and once again in April.', expected: 'Billing', note: 'Clean billing case' },
  { id: 'EV-06', request: 'I cannot log in. The reset email never arrives, and I have checked spam.', expected: 'Account Access', note: 'Clean access case' },
  { id: 'EV-07', request: 'The tracking has said "out for delivery" for four days.', expected: 'Delivery', note: 'Clean fulfillment case' },
  { id: 'EV-08', request: 'I need to move Thursday\'s install to the following week if a slot is open.', expected: 'Appointment', note: 'Clean scheduling case' },
  { id: 'EV-09', request: 'The unit is getting hot enough to smell and I have unplugged it. Is this dangerous?', expected: 'Safety', note: 'Safety must beat product issue' },
  { id: 'EV-10', request: 'Hi, quick question about my thing.', expected: 'General Support', note: 'Almost no signal; should not over-classify' },

  // Harder cases: intent is mixed, buried, or misleading.
  { id: 'EV-11', request: 'The app has been broken since the update, and I want a refund for the months I could not use it.', expected: 'Billing', note: 'Product complaint, but the ask is money' },
  { id: 'EV-12', request: 'Nobody has called me back about the broken panel and I am done being polite about it.', expected: 'Management Escalation', note: 'Escalation implied, not stated' },
  { id: 'EV-13', request: 'We are evaluating vendors. Before we commit, how do you handle a unit that fails in year two?', expected: 'Sales Inquiry', note: 'Sounds like support, is pre-sales' },
  { id: 'EV-14', request: 'Your tech came out Tuesday, could not finish, and said someone would call to reschedule. Nobody did.', expected: 'Appointment', note: 'Service story, scheduling ask' },
  { id: 'EV-15', request: 'I want to return this, but I bought it fourteen months ago.', expected: 'Returns', note: 'Route on the ask, not on eligibility' },
  { id: 'EV-16', request: 'The invoice shows a service call I never scheduled and never happened.', expected: 'Billing', note: 'Billing dispute wearing a scheduling coat' },
  { id: 'EV-17', request: 'Can someone confirm whether my account is still active? I have not been billed in three months.', expected: 'Account Access', note: 'Billing detail, access question' },
  { id: 'EV-18', request: 'The delivery driver left the unit in the rain and the box is soaked. I have not opened it.', expected: 'Delivery', note: 'Damage, but the failure is in transit' },
  { id: 'EV-19', request: 'This is the third defective unit in a row. At what point do you stop sending replacements and just refund me?', expected: 'Management Escalation', note: 'Repeat failure; pattern beats the individual issue' },
  { id: 'EV-20', request: 'Following up on the quote from last month, and separately my current unit is leaking.', expected: 'Sales Inquiry', note: 'Two intents in one message; single-label routing must drop one' },
]

export const routerEvalCategories = [
  'Returns', 'Sales Inquiry', 'Product Issue', 'Billing', 'Account Access',
  'Delivery', 'Appointment', 'Safety', 'Management Escalation', 'General Support',
]
