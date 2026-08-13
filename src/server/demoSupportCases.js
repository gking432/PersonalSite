export const demoSupportCases = [
  {
    id: 'DEMO-101',
    type: 'Damaged delivery',
    issue: 'Two upholstered chairs arrived with visible transit damage.',
    solution: 'Support verified the order and photos, checked replacement inventory, and gave the customer one confirmed resolution path.',
    outcome: 'Replacement inventory was confirmed and the customer received a specific delivery window.',
  },
  {
    id: 'DEMO-102',
    type: 'Missed follow-up',
    issue: 'A customer contacted support twice without receiving the promised update.',
    solution: 'The case was assigned to one owner, the prior contact history was summarized, and a firm next-update time was established.',
    outcome: 'The customer stopped repeating the issue and the case closed after one owner completed the follow-through.',
  },
  {
    id: 'DEMO-103',
    type: 'Billing discrepancy',
    issue: 'The final charge did not match the amount discussed before service.',
    solution: 'Billing compared the original quote, approved changes, and invoice before a representative explained the difference.',
    outcome: 'An unsupported charge was corrected and the remaining amount was documented for the customer.',
  },
  {
    id: 'DEMO-104',
    type: 'Account access',
    issue: 'A user could not sign in after resetting a password multiple times.',
    solution: 'Support checked account status and authentication events, then cleared the stale login session before sending a fresh access link.',
    outcome: 'Access was restored without creating a duplicate account.',
  },
  {
    id: 'DEMO-105',
    type: 'Sales request',
    issue: 'A prospective customer needed pricing and compatibility guidance before placing a multi-location order.',
    solution: 'The request was routed to sales with the use case, quantity, locations, timing, and unresolved product questions attached.',
    outcome: 'Sales entered the conversation with a complete brief and avoided a second discovery call.',
  },
  {
    id: 'DEMO-106',
    type: 'Potential safety issue',
    issue: 'A customer reported that a device became unusually hot during normal use.',
    solution: 'The automation flagged safety language, instructed the representative not to troubleshoot continued use, and routed the case for immediate human review.',
    outcome: 'A safety specialist took ownership before any replacement or liability decision was made.',
  },
  {
    id: 'DEMO-107',
    type: 'Wrong item received',
    issue: 'The delivered model did not match the order confirmation.',
    solution: 'Support compared the order, fulfillment record, and product identifier before arranging the appropriate correction.',
    outcome: 'The fulfillment error was confirmed and the correct item was sent through the approved process.',
  },
  {
    id: 'DEMO-108',
    type: 'Cancellation request',
    issue: 'A subscriber wanted to cancel after another renewal charge appeared.',
    solution: 'The request was separated into cancellation and billing-review tasks so each could be handled under the correct policy.',
    outcome: 'Renewal was stopped and billing reviewed the disputed charge independently.',
  },
  {
    id: 'DEMO-109',
    type: 'Product defect',
    issue: 'A software feature repeatedly failed after a recent update.',
    solution: 'Support captured the exact error, environment, and reproduction steps, then routed a structured defect report to product engineering.',
    outcome: 'The team reproduced the defect and gave support a verified workaround while the fix was prepared.',
  },
  {
    id: 'DEMO-110',
    type: 'Missed appointment',
    issue: 'A customer waited through an appointment window but no technician arrived.',
    solution: 'Dispatch checked the schedule and technician status before offering a confirmed recovery appointment and manager follow-up.',
    outcome: 'The visit was rebooked with a specific owner and the scheduling failure was logged for operations review.',
  },
]

export const demoSupportCaseIds = demoSupportCases.map((item) => item.id)

export function expandDemoCases(ids = []) {
  return ids
    .map((id) => demoSupportCases.find((item) => item.id === id))
    .filter(Boolean)
}
