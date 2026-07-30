<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
    <header class="mb-10 rounded-3xl bg-brand px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
      <div class="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="mb-3 text-sm font-black uppercase tracking-[0.25em] text-white/60">
            League of Our Own
          </p>
          <h1 class="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Fantasy Football Rules
          </h1>
          <p class="mt-3 text-lg text-white/75">
            2026/27 season
          </p>
        </div>
        <UButton
          href="/rules.pdf"
          label="Download PDF"
          icon="i-lucide-download"
          target="_blank"
          color="neutral"
          variant="soft"
          size="md"
          class="h-10 shrink-0 self-end sm:ml-auto sm:self-center"
        />
      </div>
    </header>

    <div class="mx-auto space-y-12 xl:max-w-4xl">
      <section
        id="pricing"
        class="scroll-mt-6 border-b border-slate-200 pb-12 last:border-0 dark:border-slate-800"
      >
        <RulesSectionHeading
          number="1"
          title="Pricing"
          icon="i-lucide-wallet-cards"
        />
        <div class="grid gap-5 lg:grid-cols-2">
          <RulesRuleCard title="Option 1">
            You will have <strong>£85 million</strong> to spend with up to
            <strong>four transfers</strong>. Two transfers can be used before 1 January
            and two after. See the Transfers section for the full rules.
          </RulesRuleCard>
          <RulesRuleCard title="Option 2">
            You will have <strong>£90 million</strong> to spend with
            <strong>no transfers</strong> available for the whole season.
          </RulesRuleCard>
        </div>
        <p class="mt-5 text-muted">
          Each team contains eleven players. The team builder checks the required
          positions and budget automatically when you submit.
        </p>
      </section>

      <section
        id="scoring"
        class="scroll-mt-6 border-b border-slate-200 pb-12 last:border-0 dark:border-slate-800"
      >
        <RulesSectionHeading
          number="2"
          title="Scoring"
          icon="i-lucide-chart-no-axes-combined"
        />
        <div class="grid gap-5 sm:grid-cols-2">
          <RulesRuleCard
            title="Clean sheets"
            icon="i-lucide-shield-check"
          >
            <p><strong>5 points</strong> for a goalkeeper keeping a clean sheet.</p>
            <p class="mt-2">
              <strong>2 points</strong> for a defender keeping a clean sheet.
            </p>
          </RulesRuleCard>
          <RulesRuleCard
            title="Red cards"
            icon="i-lucide-square"
          >
            <strong>10 points will be deducted</strong> for any player receiving a red card.
          </RulesRuleCard>
          <RulesRuleCard
            title="Goals"
            icon="i-lucide-goal"
          >
            <ul class="space-y-2">
              <li><strong>10 points</strong> for a goalkeeper scoring a goal</li>
              <li><strong>7 points</strong> for a defender scoring a goal</li>
              <li><strong>5 points</strong> for a midfielder scoring a goal</li>
              <li><strong>3 points</strong> for a forward scoring a goal</li>
              <li><strong>5 extra points</strong> for two goals in one game</li>
              <li><strong>10 extra points</strong> for a hat-trick or more</li>
            </ul>
          </RulesRuleCard>
          <RulesRuleCard
            title="Assists"
            icon="i-lucide-hand-helping"
          >
            <strong>3 points</strong> will be awarded for each assist. No bonus points are
            awarded for multiple assists.
          </RulesRuleCard>
        </div>
        <p class="mt-5 text-sm text-muted">
          All scoring data is taken from the official Premier League site:
          <a
            href="https://www.premierleague.com/en/fixtures"
            target="_blank"
            rel="noreferrer"
            class="font-semibold text-primary underline underline-offset-4"
          >
            premierleague.com
          </a>.
        </p>
      </section>

      <section
        id="fixtures"
        class="scroll-mt-6 border-b border-slate-200 pb-12 last:border-0 dark:border-slate-800"
      >
        <RulesSectionHeading
          number="3"
          title="Weekly fixtures"
          icon="i-lucide-calendar-days"
        />
        <div class="prose prose-slate max-w-none text-muted dark:prose-invert">
          <p>
            Each gameweek is the actual set of Premier League fixtures assigned to that
            scoring period. It may contain more or fewer than ten matches.
          </p>
          <ul>
            <li>All matches assigned to that gameweek count once they are scored.</li>
            <li>
              Rearranged matches count in the gameweek to which they are ultimately
              assigned.
            </li>
          </ul>
          <p>
            This keeps scores current each week instead of waiting for postponed matches
            to be played months later.
          </p>
        </div>
      </section>

      <section
        id="transfers"
        class="scroll-mt-6 border-b border-slate-200 pb-12 last:border-0 dark:border-slate-800"
      >
        <RulesSectionHeading
          number="4"
          title="Transfers"
          icon="i-lucide-arrow-left-right"
        />
        <div class="space-y-4 text-muted">
          <p><strong>Four transfers</strong> can be made throughout the season: two before 1 January and two after.</p>
          <p>Unused transfers carry over into the second half of the season.</p>
          <p>
            The weekly transfer deadline is <strong>7pm on Friday</strong>. A transfer
            submitted on Monday will therefore count from that Friday’s gameweek.
          </p>
          <p>
            Players transferred in must be in the same playing position and cost no more
            than the outgoing player, plus any unused money in the team’s total budget.
          </p>
          <p>
            Player availability and prices are shown in the team builder.
          </p>
        </div>
      </section>

      <section
        id="entry-fee"
        class="scroll-mt-6 border-b border-slate-200 pb-12 last:border-0 dark:border-slate-800"
      >
        <RulesSectionHeading
          number="5"
          title="Entry fee"
          icon="i-lucide-pound-sterling"
        />
        <p class="text-muted">
          The entry fee is <strong>£20.00</strong>. Please pay when you submit your team,
          or pay the balance if you kept money in your account. Include your team name as
          the payment reference.
        </p>
        <p class="mt-4 text-muted">
          Please contact us for the current bank details.
        </p>
      </section>

      <section
        id="prize-money"
        class="scroll-mt-6 border-b border-slate-200 pb-12 last:border-0 dark:border-slate-800"
      >
        <RulesSectionHeading
          number="6"
          title="Prize money"
          icon="i-lucide-trophy"
        />
        <div class="grid gap-5 lg:grid-cols-2">
          <RulesRuleCard
            title="Weekly prizes"
            icon="i-lucide-trophy"
          >
            A weekly prize of <strong>£10.00</strong> is awarded to the team or teams that
            win a weekly fixture. The prize is shared if there is more than one winner.
          </RulesRuleCard>
          <RulesRuleCard
            title="Season prize pool"
            icon="i-lucide-award"
          >
            After weekly prizes are paid, the remaining season prize pool is shared between
            the top five finishers:
            <ul class="mt-4 space-y-2">
              <li class="flex items-center gap-2 rounded-lg bg-surface-100 p-2 dark:bg-slate-900">
                <strong class="inline-flex w-12 justify-center rounded-full bg-primary px-3 py-1 text-sm text-white">1st</strong>
                <span class="ml-auto">50%</span>
              </li>
              <li class="flex items-center gap-2 rounded-lg bg-surface-100 p-2 dark:bg-slate-900">
                <strong class="inline-flex w-12 justify-center rounded-full bg-primary/85 px-3 py-1 text-sm text-white">2nd</strong>
                <span class="ml-auto">25%</span>
              </li>
              <li class="flex items-center gap-2 rounded-lg bg-surface-100 p-2 dark:bg-slate-900">
                <strong class="inline-flex w-12 justify-center rounded-full bg-primary/70 px-3 py-1 text-sm text-white">3rd</strong>
                <span class="ml-auto">12.5%</span>
              </li>
              <li class="flex items-center gap-2 rounded-lg bg-surface-100 p-2 dark:bg-slate-900">
                <strong class="inline-flex w-12 justify-center rounded-full bg-primary/55 px-3 py-1 text-sm text-white">4th</strong>
                <span class="ml-auto">7.5%</span>
              </li>
              <li class="flex items-center gap-2 rounded-lg bg-surface-100 p-2 dark:bg-slate-900">
                <strong class="inline-flex w-12 justify-center rounded-full bg-primary/40 px-3 py-1 text-sm text-primary">5th</strong>
                <span class="ml-auto">5%</span>
              </li>
            </ul>
          </RulesRuleCard>
        </div>
        <p class="mt-5 text-sm text-muted">
          The exact prize amounts depend on the number of entries.
        </p>
      </section>

      <section
        id="team-builder"
        class="scroll-mt-6 border-b border-slate-200 pb-12 last:border-0 dark:border-slate-800"
      >
        <RulesSectionHeading
          number="7"
          title="Team builder"
          icon="i-lucide-shirt"
        />
        <div class="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
          <p class="text-muted">
            Please use the online team builder. It removes manual data entry and checks
            player IDs, positions, the eleven-player requirement, and your budget before
            submission.
          </p>
          <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <UButton
              to="/team-builder"
              label="Build your team"
              trailing-icon="i-lucide-arrow-right"
              color="primary"
            />
            <p class="text-sm font-bold text-primary">
              Submission deadline: {{ deadlineLabel }}
            </p>
          </div>
        </div>
      </section>

      <section
        id="final-notes"
        class="scroll-mt-6 border-b border-slate-200 pb-12 last:border-0 dark:border-slate-800"
      >
        <RulesSectionHeading
          number="8"
          title="Final notes"
          icon="i-lucide-mail"
        />
        <div class="space-y-4 text-muted">
          <p>
            Emails will be sent after the weekly games are complete, allowing a few days
            for scores and results to be finalised.
          </p>
          <p>
            For questions, email
            <a
              href="mailto:leagueofourown.fpl@gmail.com"
              class="font-semibold text-primary underline underline-offset-4"
            >
              leagueofourown.fpl@gmail.com
            </a>
            with “Footy” in the subject line.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
const { teamSubmissionDeadline, refreshAppSettings } = useAppSettings();

await refreshAppSettings();

const deadlineLabel = computed(() => {
  if (!teamSubmissionDeadline.value) {
    return 'the published deadline';
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${teamSubmissionDeadline.value}T00:00:00`));
});
</script>
