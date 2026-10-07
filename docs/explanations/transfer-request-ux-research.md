# Transfer request UX research

Researched: 2026-10-07. Scope: choosing between online transfers and a manual email request on the public team-management page. The user selected the “Choose first” layout, which is implemented in the working tree. The source guidance and design reasoning below are not usability findings from league members.

## Selected layout

The three public pages share `TransferEntryLayout` for their panel, heading, back navigation and support footer. Generic controls remain Nuxt UI components: cards, buttons, icons, form fields, inputs and textareas. The landing page links and player-lookup CTA use the same soft style and trailing arrow; copy and email submission use primary actions.

The initial `/manage-team` page shows two brief, unboxed choices. `/manage-team/email` displays the address, subject, instructions and complete copyable template. `/manage-team/online` provides the registered-email form, security check and generic confirmation. Existing private URLs still open `/manage-team?key=...` directly; changing the query remounts that page so private and public state cannot be carried between team keys or the choice page.

The email template keeps the agreed fields, the optional second transfer and the budget reminder. Copy feedback tells the user to paste into a new email; permission failures select the template for manual copying. Following user feedback on visual consistency, all three pages use the site's existing bold uppercase headings, standard text scale, Nuxt UI controls and a single shared page surface. Public panels are horizontally centred within the main content area. The short choice page also centres vertically on larger screens; longer instruction and form pages remain top-aligned, with natural page scrolling on mobile. The two choice rows remain unboxed, controls retain generous click targets, and support stays in a consistent position. The existing private selection, validation and approval behaviour is preserved.

## What the primary sources support

- **Design for varied needs, not an age stereotype.** W3C's older-user research identifies overlap with accessibility needs around vision, motor control, concentration and memory. It says existing accessibility standards address most older-user needs. Age does not tell us an individual's confidence or ability. [W3C: Older users and web accessibility](https://www.w3.org/WAI/older-users/)
- **Make the task structure obvious.** W3C recommends logical sections, descriptive headings, whitespace and visible grouping. It explicitly includes cards, borders and shading as helpful techniques; boxes are not inherently inaccessible. Too many decorative cues can create clutter. [W3C: Clear page structure](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o2p03-page-structure/)
- **Reduce competing detail while keeping necessary instructions.** W3C advises simple screens with few main choices, short text and no unnecessary content. It also warns that too little instruction can be as harmful as too much. This is supplemental cognitive accessibility advice, not a WCAG conformance requirement. [W3C: Avoid too much content](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p03-manageable-quantity/)
- **Start with one decision or task per page.** GOV.UK recommends separating forms into pages around one decision, question or piece of information, then merging where user research supports it. This helps unfamiliar users focus and recover from errors; it is a starting point, not a rule to add screens indiscriminately. [GOV.UK: Structuring forms](https://www.gov.uk/service-manual/design/form-structure)
- **Use familiar action words.** Explain unfamiliar terms and remove vague or unnecessary words. [W3C: Use clear words](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p01-clear-words/)
- **Keep a clear next action.** GOV.UK advises against multiple visually primary buttons on the same task page because they compete for attention. [GOV.UK: Buttons](https://design-system.service.gov.uk/components/button/)
- **Make reading comfortable.** W3C recommends text that enlarges to 200%, left-aligned readable text, visible focus and sufficient contrast. GOV.UK's current body-text scale uses 19px with 25px line height on large and small screens. Neither source mandates that exact size for this site. [W3C: Applying accessibility guidance to older users](https://www.w3.org/WAI/older-users/developing/), [GOV.UK: Type scale](https://design-system.service.gov.uk/styles/type-scale/)
- **Give controls enough space.** WCAG 2.2 AA target-size guidance sets 24 by 24 CSS pixels or a spacing alternative, with exceptions; the enhanced AAA criterion uses 44 by 44. Aim for the larger size for important actions here. [W3C: Minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [W3C: Enhanced target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
- **Show what information is needed and where to get it.** GOV.UK recommends sizing inputs for expected content, clear labels and hints showing where unfamiliar identifiers can be found; copy and paste must remain available. Ask only for information the service needs. [GOV.UK: Text inputs](https://design-system.service.gov.uk/components/text-input/), [GOV.UK: Question pages](https://design-system.service.gov.uk/patterns/question-pages/)

## Interpretation for this flow

**Release scope, 7 October 2026:** the owner chose to release the simpler email
instructions and template first. `/manage-team` now opens that workflow directly.
The choice-first design below remains the research direction for a future online
release; the online routes, request APIs and approval workflow are disabled by
default, rather than presented to participants now.

The likely source of overload is showing two complete workflows at once: descriptions, email recovery input, security check, support message, email instructions, reminder and a long template. Equal-height full-width cards further spread related content apart. These are design hypotheses based on the current arrangement and the reported reaction, not findings proven by the sources above.

### Preferred candidate: choose a route, then do that task

The initial page should show:

> Request a transfer
>
> Choose how you would like to send your request.
>
> **Online** — Get your team link, choose your players and review your request.
> **Continue online**
>
> **By email** — Use your own email account. Copy our template, fill in your details and send it to us.
> **View email instructions**

Use two short, vertically arranged sections separated by space and a thin rule. Use matching headings and clear destination links rather than large coloured equal-height containers. Both routes remain visible and equally understandable. Do not label either route “quick” or supply a time estimate without measuring it.

Each destination should have a clear title, a link back to the two options, and a discreet support contact in a consistent position. Dedicated pages are a stronger way to reduce simultaneous content than an accordion or tabs, and support bookmarks, browser Back and refresh. The extra navigation step is a tradeoff to test. Do not infer that this requires restoring the previously removed `/transfer-request` route.

**Online destination:** title “Get your team link”; one sentence saying that entering the email used to register the team sends a link to choose transfers. Label “Your registered email address”. Keep the capped input width, security check and “Email my team link” action together. Explain that this step sends a link rather than submitting transfers. Keep existing success/error behaviour, including help for a message that does not arrive.

**Email destination:** title “Request transfers by email”; show the address and subject as real selectable text. Give three short instructions: copy the template, paste it into a new email and fill in the details, send the email. Keep the subject “Transfer request – [your team name]” in these instructions. Place “Copy template” beside or directly above the visible template, not at a distant card footer. Show “Template copied — paste it into a new email” on success; preserve manual selection when copying fails. Copying does not send a request.

Keep the established template unchanged in substance: team name, manager name, manager email; separate OUT and IN headings, with player ID first, then name, club and price; optional second transfer; no team-total field. Keep the light budget reminder next to the instructions. Provide a clearly labelled link to find player IDs and prices, using an actual existing destination. No team link/login is required for email; do not make Gmail, a mailto handler or automatic calculations prerequisites. Do not promise a reply time until the league can support it.

### Lower-change candidate

If separate pages feel like an unnecessary click, retain one page but replace the large cards with sequential sections and no forced equal heights. Keep headings, brief route descriptions and anchors near the top so the email option remains easy to find. Both workflows stay expanded. This preserves current immediacy but leaves substantially more content on the page; changing borders alone will not solve that.

## Validate before committing to a layout

Run a small round with 4–6 actual league members of varied confidence, including older participants and people who use larger text or need support. GOV.UK suggests 4–8 people for a qualitative round and recruiting a varied group; such a round finds usability problems rather than statistically proving one design is best. [GOV.UK: Plan research](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service)

Observe participants using their own phone or computer with realistic tasks: send a manual email request without getting a team link; obtain a link and explain the next step; find an outgoing/incoming player's ID and price; prepare one transfer without mistakenly treating the second as required. Use test information and stop before sending real requests. Ask them to think aloud without explaining which controls to use. [GOV.UK: Moderated usability testing](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing)

Record whether they recognise both options, choose without help, understand that copying is not sending, find player data, recover from copy/link problems, and know what to do next. Compare the choice-first candidate with the simpler single-page candidate, vary presentation order, fix observed problems and repeat. Also check keyboard operation, 200% text, narrow-screen reflow and light/dark contrast; these checks complement observing real members.

---

**Last updated:** 2026-10-07
