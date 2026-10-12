// Demo data only: the app is not wired to a database. Timestamps are generated
// relative to "now" so the seeded workspace always looks current.

const HOUR = 60 * 60 * 1000;

export const AGENTS = [
  { id: 'a1', name: 'Priya Nair', email: 'priya@deskline.dev', role: 'Support lead', team: 'Tier 2', presence: 'online', csat: 97 },
  { id: 'a2', name: 'Marcus Chen', email: 'marcus@deskline.dev', role: 'Support engineer', team: 'Tier 2', presence: 'online', csat: 94 },
  { id: 'a3', name: 'Sofia Alvarez', email: 'sofia@deskline.dev', role: 'Support specialist', team: 'Tier 1', presence: 'away', csat: 92 },
  { id: 'a4', name: 'Daniel Okafor', email: 'daniel@deskline.dev', role: 'Billing specialist', team: 'Billing', presence: 'online', csat: 95 },
  { id: 'a5', name: 'Hana Sato', email: 'hana@deskline.dev', role: 'Support specialist', team: 'Tier 1', presence: 'offline', csat: 90 },
];

export const CURRENT_AGENT_ID = 'a1';

export const CUSTOMERS = [
  { id: 'c1', name: 'Olivia Bennett', email: 'olivia@northwind.io', company: 'Northwind', plan: 'Enterprise', location: 'London, UK' },
  { id: 'c2', name: 'Ethan Park', email: 'ethan@lumenlabs.co', company: 'Lumen Labs', plan: 'Business', location: 'Seoul, KR' },
  { id: 'c3', name: 'Amara Diallo', email: 'amara@brightpath.org', company: 'Brightpath', plan: 'Starter', location: 'Dakar, SN' },
  { id: 'c4', name: 'Lucas Moreau', email: 'lucas@atelier-nine.fr', company: 'Atelier Nine', plan: 'Business', location: 'Lyon, FR' },
  { id: 'c5', name: 'Isabella Rossi', email: 'isabella@vertexhq.com', company: 'Vertex HQ', plan: 'Enterprise', location: 'Milan, IT' },
  { id: 'c6', name: 'Noah Fischer', email: 'noah@kitefly.app', company: 'Kitefly', plan: 'Starter', location: 'Berlin, DE' },
  { id: 'c7', name: 'Aisha Rahman', email: 'aisha@meridian.health', company: 'Meridian Health', plan: 'Enterprise', location: 'Dubai, AE' },
  { id: 'c8', name: 'Liam O’Connor', email: 'liam@harbor.dev', company: 'Harbor Dev', plan: 'Business', location: 'Dublin, IE' },
];

// [number, subject, description, status, priority, category, channel, customer, assignee, hoursAgo, tags, thread]
// thread entries: [author ('c' customer | agent id), hoursAfterCreate, body, internal?]
const RAW = [
  [1048, 'Cannot log in after enabling SSO', 'Since we switched on SAML SSO this morning, nobody on our team can sign in. We get "invalid assertion" after the IdP redirect.', 'open', 'urgent', 'Technical', 'email', 'c1', 'a1', 1.5, ['sso', 'login'], [
    ['a1', 0.4, 'Hi Olivia, thanks for the detail. Could you send the SAML response from your browser’s network tab? I’m checking our logs in parallel.'],
    ['a1', 0.5, 'Assertion audience looks wrong in logs - likely entity ID mismatch.', true],
  ]],
  [1047, 'Invoice shows double charge for October', 'Our October invoice lists the Business plan twice. Card was charged $1,180 instead of $590.', 'in_progress', 'high', 'Billing', 'email', 'c2', 'a4', 5, ['invoice', 'refund'], [
    ['a4', 1, 'Hi Ethan, I can see the duplicate line. I’ve raised a refund for $590 - it should land in 5–7 business days.'],
    ['c', 2, 'Thanks Daniel. Can you also send a corrected invoice for our records?'],
  ]],
  [1046, 'Export to CSV times out on large reports', 'Exporting the yearly report (~80k rows) spins for a few minutes then fails with a 504.', 'in_progress', 'high', 'Bug report', 'web', 'c5', 'a2', 9, ['export', 'performance'], [
    ['a2', 1.5, 'Reproduced on our side with a 75k row dataset. Escalated to engineering as BUG-2231.'],
  ]],
  [1045, 'How do I add a teammate as an admin?', 'I invited a colleague but they only have viewer access. Where do I change roles?', 'pending', 'low', 'Account', 'chat', 'c3', 'a3', 14, ['roles'], [
    ['a3', 0.2, 'Hi Amara! Go to Settings → Members, click the teammate, and choose “Admin” under Role. Does that work for you?'],
  ]],
  [1044, 'Webhook deliveries failing with 401', 'Our endpoint started returning 401 for every webhook since yesterday. We haven’t changed anything.', 'open', 'high', 'Technical', 'email', 'c8', null, 3, ['webhooks', 'api'], []],
  [1043, 'Request: dark mode for the mobile app', 'Our support team works night shifts and would love a dark theme on iOS.', 'open', 'low', 'Feature request', 'web', 'c6', null, 20, ['mobile'], []],
  [1042, 'Data residency question for EU customers', 'Before renewing we need confirmation that all customer data is stored in the EU region.', 'pending', 'medium', 'Account', 'email', 'c4', 'a1', 30, ['compliance', 'renewal'], [
    ['a1', 3, 'Hi Lucas, workspaces on the EU region keep data in Frankfurt. I’ve attached our DPA - can you confirm your workspace ID so I can verify?'],
  ]],
  [1041, 'Patient records page loads slowly', 'The records list takes 10+ seconds to load for our clinicians during peak hours.', 'in_progress', 'urgent', 'Bug report', 'phone', 'c7', 'a2', 6, ['performance', 'enterprise'], [
    ['a2', 0.5, 'Thanks Aisha, we’re seeing elevated query times on your shard. Engineering is adding an index now.'],
    ['a2', 0.7, 'Paged on-call DB team. ETA 2h.', true],
  ]],
  [1040, 'Update billing email address', 'Please send invoices to finance@lumenlabs.co instead of my address.', 'resolved', 'low', 'Billing', 'email', 'c2', 'a4', 48, ['invoice'], [
    ['a4', 2, 'Done - future invoices will go to finance@lumenlabs.co.'],
    ['c', 3, 'Perfect, thank you!'],
  ]],
  [1039, 'API rate limit too low for nightly sync', 'We keep hitting 429s during our nightly sync job. Can the limit be raised?', 'resolved', 'medium', 'Technical', 'email', 'c5', 'a2', 72, ['api'], [
    ['a2', 4, 'We’ve raised your limit to 1,200 requests/min. Let us know if the job still fails.'],
  ]],
  [1038, 'Two-factor codes not arriving by SMS', 'Some of our staff in the UAE never receive the SMS code.', 'open', 'medium', 'Account', 'chat', 'c7', 'a3', 11, ['2fa'], []],
  [1037, 'Bulk-edit tickets from the list view', 'It would save us a lot of time to change status on many tickets at once.', 'closed', 'low', 'Feature request', 'web', 'c1', 'a1', 140, ['ux'], [
    ['a1', 6, 'Great news - bulk actions shipped this week. You can now select rows and change status in one go.'],
  ]],
  [1036, 'Downgrade plan at end of cycle', 'We’d like to move from Business to Starter when our cycle ends on the 30th.', 'pending', 'medium', 'Billing', 'email', 'c8', 'a4', 26, ['plan-change'], [
    ['a4', 2, 'Hi Liam, I’ve scheduled the downgrade. Before it applies, note that Starter allows 3 seats - you currently use 5.'],
  ]],
  [1035, 'Attachments over 10MB fail to upload', 'Uploading a 15MB PDF to a ticket shows “Something went wrong”.', 'open', 'medium', 'Bug report', 'web', 'c4', 'a5', 18, ['attachments'], []],
  [1034, 'Need audit log export for SOC 2', 'Our auditors need 12 months of admin audit logs.', 'in_progress', 'high', 'Account', 'email', 'c1', 'a1', 22, ['compliance', 'enterprise'], [
    ['a1', 1, 'On it - I’ve requested a full export from engineering and will share a secure link.'],
  ]],
  [1033, 'Password reset link expired immediately', 'Every reset link says it has expired, even when clicked right away.', 'resolved', 'high', 'Technical', 'chat', 'c6', 'a3', 60, ['login'], [
    ['a3', 0.5, 'This was caused by a clock skew on one mail server. It’s fixed - please request a new link.'],
    ['c', 1, 'Working now, thanks Sofia.'],
  ]],
  [1032, 'Zapier integration missing new fields', 'Custom fields we created last week don’t show up in Zapier.', 'open', 'low', 'Technical', 'web', 'c3', null, 40, ['integrations'], []],
  [1031, 'Charged VAT despite valid VAT ID', 'We entered our EU VAT ID but the last invoice still includes 20% VAT.', 'in_progress', 'medium', 'Billing', 'email', 'c4', 'a4', 34, ['vat', 'invoice'], [
    ['a4', 3, 'I’ve validated your VAT ID and applied reverse charge going forward. Issuing a credit note for the last invoice now.'],
  ]],
  [1030, 'Reports dashboard shows wrong timezone', 'All times in reports appear in UTC rather than our workspace timezone.', 'closed', 'low', 'Bug report', 'email', 'c5', 'a5', 160, ['reports'], [
    ['a5', 8, 'Fixed in today’s release - reports now follow the workspace timezone.'],
  ]],
  [1029, 'Onboarding call for new team', 'We added 12 agents and would like a 30-min onboarding session.', 'resolved', 'medium', 'Account', 'phone', 'c7', 'a1', 96, ['onboarding'], [
    ['a1', 5, 'Booked for Thursday 10:00 GST. Calendar invite sent!'],
  ]],
  [1028, 'Macro variables not replaced in replies', 'Using {{customer.first_name}} in a macro sends the literal text.', 'pending', 'medium', 'Bug report', 'chat', 'c2', 'a2', 44, ['macros'], [
    ['a2', 2, 'Could you share the macro name? I want to check whether it was created before the variable syntax update.'],
  ]],
  [1027, 'Slack notifications stopped', 'We no longer receive new-ticket alerts in our #support channel.', 'resolved', 'high', 'Technical', 'email', 'c8', 'a3', 84, ['integrations', 'slack'], [
    ['a3', 1, 'The Slack token had been revoked. Reconnecting from Settings → Integrations fixes it.'],
  ]],
];

export function createSeedTickets(now = Date.now()) {
  return RAW.map(([number, subject, description, status, priority, category, channel, customerId, assigneeId, hoursAgo, tags, thread]) => {
    const createdAt = now - hoursAgo * HOUR;
    const messages = [
      { id: `${number}-0`, author: 'customer', authorId: customerId, body: description, at: createdAt, internal: false },
      ...thread.map(([author, after, body, internal], i) => ({
        id: `${number}-${i + 1}`,
        author: author === 'c' ? 'customer' : 'agent',
        authorId: author === 'c' ? customerId : author,
        body,
        at: createdAt + after * HOUR,
        internal: Boolean(internal),
      })),
    ];
    const updatedAt = messages[messages.length - 1].at;
    const firstAgentReply = messages.find((m) => m.author === 'agent' && !m.internal);
    return {
      id: `TCK-${number}`,
      number,
      subject,
      status,
      priority,
      category,
      channel,
      customerId,
      assigneeId,
      tags,
      createdAt,
      updatedAt,
      firstResponseAt: firstAgentReply ? firstAgentReply.at : null,
      messages,
      activity: [{ at: createdAt, text: `Ticket created via ${channel === 'web' ? 'web form' : channel}` }],
    };
  });
}

export function createSeedState(now = Date.now()) {
  return {
    tickets: createSeedTickets(now),
    agents: AGENTS,
    customers: CUSTOMERS,
    currentAgentId: CURRENT_AGENT_ID,
  };
}
