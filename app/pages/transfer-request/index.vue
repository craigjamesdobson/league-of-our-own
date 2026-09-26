<script setup lang="ts">
import { SUPPORT_EMAIL } from '~~/shared/utils/contact';

const route = useRoute();
const teamKey = typeof route.query.key === 'string' ? route.query.key : '';

if (teamKey) {
  await navigateTo({
    path: '/manage-team',
    query: { key: teamKey },
  }, { redirectCode: 302 });
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-2xl flex-col gap-5">
    <UCard>
      <template #header>
        <div>
          <p class="text-xs font-black uppercase tracking-[0.2em] text-primary">
            Private team access
          </p>
          <h1 class="mt-1 text-2xl font-black uppercase text-highlighted">
            Find your team link
          </h1>
        </div>
      </template>
      <p class="text-sm text-muted">
        Transfer requests are managed from your private team management link. It was sent to the email address used when your team was submitted.
      </p>
      <p class="mt-3 text-sm text-muted">
        If you cannot find the email, contact
        <a
          class="font-bold underline"
          :href="`mailto:${SUPPORT_EMAIL}`"
        >{{ SUPPORT_EMAIL }}</a>
        and we can resend the link to your registered team email address.
      </p>
    </UCard>
  </div>
</template>
