<script setup lang="ts">
import { whatsNewEntries } from '~~/shared/utils/whatsNew';
import { SUPPORT_EMAIL } from '~~/shared/utils/contact';

const props = withDefaults(defineProps<{
  collapsed?: boolean;
}>(), {
  collapsed: false,
});

const storageKey = 'looo:whats-new:last-seen';
const isOpen = ref(false);
const hasMounted = ref(false);
const lastSeen = ref<{ id: string; publishedAt: string } | null>(null);

const buttonUi = computed(() => ({
  base: props.collapsed
    ? 'min-h-12 w-12 justify-center overflow-hidden p-0'
    : 'min-h-12 w-full justify-start overflow-hidden px-3',
  leadingIcon: 'size-5 text-current',
  label: 'truncate text-sm font-medium',
}));

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
});

const formatDate = (value: string) => dateFormatter.format(new Date(value));

const readLastSeen = () => {
  try {
    const storedValue = localStorage.getItem(storageKey);
    if (!storedValue) {
      lastSeen.value = null;
      return;
    }

    const parsed = JSON.parse(storedValue) as Partial<{ id: string; publishedAt: string }>;
    lastSeen.value = parsed.id && parsed.publishedAt
      ? { id: parsed.id, publishedAt: parsed.publishedAt }
      : null;
  }
  catch {
    lastSeen.value = null;
  }
};

const markAsRead = () => {
  const latestEntry = whatsNewEntries[0];
  if (!latestEntry) return;

  lastSeen.value = {
    id: latestEntry.id,
    publishedAt: latestEntry.publishedAt,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(lastSeen.value));
  }
  catch {
    // The notification remains available if browser storage is disabled.
  }
};

const hasUnreadEntries = computed(() => {
  if (!hasMounted.value || !whatsNewEntries.length) return false;
  if (!lastSeen.value) return true;

  return whatsNewEntries.some(entry => entry.publishedAt > lastSeen.value!.publishedAt
    || (entry.publishedAt === lastSeen.value!.publishedAt && entry.id !== lastSeen.value!.id));
});

watch(isOpen, (open) => {
  if (open) markAsRead();
});

onMounted(() => {
  readLastSeen();
  hasMounted.value = true;

  if (hasUnreadEntries.value) {
    isOpen.value = true;
  }

  window.addEventListener('storage', readLastSeen);
});

onBeforeUnmount(() => {
  window.removeEventListener('storage', readLastSeen);
});
</script>

<template>
  <div>
    <UTooltip
      class="w-full"
      text="What's new"
      :disabled="!props.collapsed"
      :content="{ side: 'right' }"
    >
      <UButton
        type="button"
        :aria-label="hasUnreadEntries ? 'What\'s new - unread updates' : 'What\'s new'"
        :label="props.collapsed ? undefined : 'What\'s new'"
        color="neutral"
        variant="ghost"
        :square="props.collapsed"
        class="relative cursor-pointer rounded-lg text-slate-200 hover:bg-white/10 hover:text-white"
        :ui="buttonUi"
        @click="isOpen = true"
      >
        <template #leading>
          <span class="relative inline-flex shrink-0">
            <Icon
              name="lucide:sparkles"
              class="size-5"
              aria-hidden="true"
            />
            <span
              v-if="hasUnreadEntries"
              class="absolute -right-1 -top-1 size-2 rounded-full bg-warning ring-2 ring-brand"
              aria-label="Unread updates"
            />
          </span>
        </template>
      </UButton>
    </UTooltip>

    <UModal
      v-model:open="isOpen"
      :dismissible="true"
      :ui="{
        overlay: 'bg-slate-950/60',
        content: 'w-[92vw] max-w-2xl overflow-hidden bg-default text-highlighted ring-default',
      }"
    >
      <template #content>
        <div class="flex max-h-[85vh] flex-col">
          <div class="flex items-start justify-between gap-4 border-b border-default p-6 sm:p-7">
            <div class="flex items-start gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon
                  name="lucide:sparkles"
                  class="size-5"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-wide text-muted">
                  Latest updates
                </p>
                <h2 class="mt-1 text-xl font-black uppercase">
                  What's new
                </h2>
              </div>
            </div>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              square
              aria-label="Close What's new"
              title="Close"
              @click="isOpen = false"
            />
          </div>

          <div class="overflow-y-auto p-6 sm:p-7">
            <div class="space-y-8">
              <article
                v-for="entry in whatsNewEntries"
                :key="entry.id"
                class="border-t border-default pt-6 first:border-t-0 first:pt-0"
              >
                <time
                  class="text-xs font-semibold uppercase tracking-wide text-muted"
                  :datetime="entry.publishedAt"
                >
                  {{ formatDate(entry.publishedAt) }}
                </time>
                <h3 class="mt-2 text-xl font-bold sm:text-2xl">
                  {{ entry.title }}
                </h3>
                <p class="mt-3 text-base leading-7 text-muted sm:text-lg">
                  {{ entry.summary }}
                </p>
                <UButton
                  v-if="entry.link"
                  :to="entry.link.to"
                  :label="entry.link.label"
                  icon="i-lucide-arrow-right"
                  trailing
                  color="primary"
                  variant="soft"
                  size="md"
                  class="mt-5"
                  @click="isOpen = false"
                />
                <ul class="mt-6 space-y-3 text-sm leading-6 text-muted">
                  <li
                    v-for="detail in entry.details"
                    :key="detail"
                    class="flex gap-2"
                  >
                    <Icon
                      name="lucide:arrow-right"
                      class="mt-1 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{{ detail }}</span>
                  </li>
                </ul>
              </article>
            </div>
          </div>

          <footer class="border-t border-default bg-muted/20 px-6 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-7">
            <p class="text-xs leading-5 text-muted">
              You can open this again anytime using the
              <span class="font-semibold text-highlighted">What's new</span>
              button.
            </p>
            <p class="mt-2 text-xs leading-5 text-muted sm:mt-0 sm:text-right">
              Found an issue or bug?
              <a
                class="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                :href="`mailto:${SUPPORT_EMAIL}`"
              >Let us know</a>.
            </p>
          </footer>
        </div>
      </template>
    </UModal>
  </div>
</template>
