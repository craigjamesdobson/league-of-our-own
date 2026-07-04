<script setup lang="ts">
import { useToast as useNuxtToast } from '@nuxt/ui/composables';
import { useFixtureStore } from '~/stores/fixtures';
import type { Fixture } from '~/types/Fixture';
import type { PlayerWithStats } from '~/types/Player';
import { handleApiError, handleApiSuccess } from '~/utils/api';
import { getImageUrl } from '~/utils/images';
import { navigateTo } from '#app';

type PageHeaderState = {
  title?: string;
  subtitle?: string;
};

definePageMeta({
  keepalive: true,
});

const route = useRoute();
const fixtureStore = useFixtureStore();
const toast = useNuxtToast();

const fixture: Ref<Fixture | null> = ref(null);
const pageHeader = useState<PageHeaderState>('page-header', () => ({}));

const setFixturePageHeader = () => {
  if (!fixture.value) {
    return;
  }

  pageHeader.value = {
    title: `${fixture.value.home_team.name} vs ${fixture.value.away_team.name}`,
    subtitle: `Fixture ${fixture.value.id}`,
  };
};

const fixtureId = route.params.id;
if (!fixtureId) {
  throw createError({ statusCode: 404, statusMessage: 'Fixture not found' });
}

fixture.value = await fixtureStore.fetchFixtureByID(+fixtureId);

await nextTick();
setFixturePageHeader();

if (!fixtureStore.fixtures && fixture.value?.game_week) {
  fixtureStore.fetchFixtures(fixture.value.game_week);
}

const homePlayers: Ref<PlayerWithStats[] | undefined> = ref();
const awayPlayers: Ref<PlayerWithStats[] | undefined> = ref();

const populatePlayers = async () => {
  homePlayers.value = await fixtureStore.fetchPlayersWithStatistics(
    fixture.value!.id,
    fixture.value!.home_team.id,
  );

  awayPlayers.value = await fixtureStore.fetchPlayersWithStatistics(
    fixture.value!.id,
    fixture.value!.away_team.id,
  );
};

populatePlayers();

const updateFixture = async () => {
  if (!fixture.value) throw new Error('No fixture');

  if (!homePlayers.value || !awayPlayers.value) throw new Error('No players');

  try {
    const a = fixtureStore.updateFixtureScore(fixture.value);
    const b = fixtureStore.updatePlayerStatistics(
      [...homePlayers.value, ...awayPlayers.value],
      fixture.value.id,
    );

    await Promise.all([a, b]);

    await navigateTo({
      path: '/fixtures',
      query: {
        week: fixture.value.game_week,
      },
    });

    handleApiSuccess('Fixture has been updated', toast);
  }
  catch (error) {
    handleApiError(error, toast);
  }
};

const toggleVerification = async () => {
  if (!fixture.value) return;

  try {
    const newStatus = !isVerified.value;
    const updatedFixture = await fixtureStore.updateFixtureVerificationStatus(fixture.value.id, newStatus);

    // Update local fixture with returned data instead of refetching
    if (updatedFixture) {
      fixture.value = updatedFixture;
    }

    handleApiSuccess(
      `Fixture ${newStatus ? 'verified' : 'unverified'}`,
      toast,
    );

    // Return to fixtures page after verification
    if (newStatus) {
      await navigateTo({
        path: '/fixtures',
        query: {
          week: fixture.value.game_week,
        },
      });
    }
  }
  catch (error) {
    handleApiError(error, toast);
  }
};

const nextUnverifiedFixture = computed(() => {
  if (!fixtureStore.fixtures || !fixture.value) return null;

  return fixtureStore.fixtures.find(f =>
    f.id !== fixture.value!.id
    && !f.verified_by // Not verified (no verified_by means not verified)
    && f.populated_by && f.populated_at // Is populated (both fields required)
    && f.home_team_score !== null
    && f.away_team_score !== null,
  );
});

const goToNextUnverified = () => {
  if (nextUnverifiedFixture.value) {
    navigateTo(`/fixtures/${nextUnverifiedFixture.value.id}`);
  }
};

const currentUser = useSupabaseUser();

const isPopulated = computed(() => {
  return !!(fixture.value?.populated_by && fixture.value?.populated_at);
});

const isVerified = computed(() => {
  return !!(fixture.value?.verified_by && fixture.value?.verified_at);
});

const canVerify = computed(() => {
  if (!fixture.value || !currentUser.value) return false;

  // Can't verify if fixture hasn't been populated
  if (!isPopulated.value) {
    return false;
  }

  // Can't verify if already verified
  if (isVerified.value) {
    return false;
  }

  // Can't verify if the same user populated the fixture
  if (fixture.value.populated_by === currentUser.value.id) {
    return false;
  }

  return true;
});

const scoreStepperButton = {
  color: 'neutral' as const,
  variant: 'ghost' as const,
  class: 'dark:!text-slate-50 dark:hover:!bg-slate-800',
};
</script>

<template>
  <div>
    <div
      v-if="!!fixture"
      class="flex flex-col"
    >
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div>
          <div
            class="mx-auto my-10 flex w-full max-w-96 items-center justify-center gap-5 rounded border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <img
              class="aspect-square h-32 w-32"
              :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
            >
            <div class="flex flex-col items-center gap-2.5">
              <p class="text-xl font-black uppercase">
                {{ fixture?.home_team.name }}
              </p>
              <UInputNumber
                v-model="fixture.home_team_score"
                class="w-24"
                :min="0"
                :increment="scoreStepperButton"
                :decrement="scoreStepperButton"
              />
            </div>
          </div>
          <FixtureStatsInput
            v-if="homePlayers"
            v-model:players="homePlayers"
            :disable-cleansheet="fixture.away_team_score > 0"
          />
          <div v-else>
            <SkeletonStatsInput />
          </div>
        </div>
        <div>
          <div
            class="mx-auto my-10 flex w-full max-w-96 items-center justify-center gap-5 rounded border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <div class="flex flex-col items-center gap-2.5">
              <p class="text-xl font-black uppercase">
                {{ fixture?.away_team.name }}
              </p>
              <UInputNumber
                v-model="fixture.away_team_score"
                class="w-24"
                :min="0"
                :increment="scoreStepperButton"
                :decrement="scoreStepperButton"
              />
            </div>
            <img
              class="aspect-square h-32 w-32"
              :src="getImageUrl(fixture.away_team.short_name.toLowerCase())"
            >
          </div>
          <FixtureStatsInput
            v-if="awayPlayers"
            v-model:players="awayPlayers"
            :disable-cleansheet="fixture.home_team_score > 0"
          />
          <div v-else>
            <SkeletonStatsInput />
          </div>
        </div>
      </div>
      <div class="flex justify-center gap-4 my-5">
        <UButton
          label="Save Fixture"
          @click="updateFixture"
        />
        <UButton
          :label="isVerified ? 'Unverify Fixture' : 'Verify Fixture'"
          :color="isVerified ? 'neutral' : 'success'"
          :variant="isVerified ? 'outline' : 'solid'"
          :disabled="!isVerified && !canVerify"
          @click="toggleVerification"
        />
        <UButton
          v-if="nextUnverifiedFixture"
          label="Next Unverified"
          color="neutral"
          variant="outline"
          icon="lucide:arrow-right"
          @click="goToNextUnverified"
        />
        <UButton
          label="Back to Fixtures"
          color="neutral"
          variant="outline"
          @click="navigateTo({ path: '/fixtures', query: { week: fixture.game_week } })"
        />
      </div>
      <div class="flex flex-col justify-center items-center gap-5">
        <UAlert
          v-if="fixture.populated_by"
          color="info"
          variant="soft"
        >
          <template #description>
            <strong>Populated by:</strong> {{ fixtureStore.getUserFullName(fixture.populated_profile) }}
            <span
              v-if="fixture.populated_at"
            >
              on {{ new Date(fixture.populated_at).toLocaleString() }}
            </span>
          </template>
        </UAlert>

        <UAlert
          v-if="fixture.verified_by"
          color="success"
          variant="soft"
        >
          <template #description>
            <strong>Verified by:</strong> {{ fixtureStore.getUserFullName(fixture.verified_profile) }}
            <span
              v-if="fixture.verified_at"
            >
              on {{ new Date(fixture.verified_at).toLocaleString() }}
            </span>
          </template>
        </UAlert>

        <UAlert
          v-if="!canVerify && fixture.populated_by === currentUser?.id"
          color="warning"
          variant="soft"
          description="You cannot verify a fixture you populated. Please ask another admin to verify."
        />

        <UAlert
          v-if="!canVerify && !isPopulated"
          color="info"
          variant="soft"
          description="Fixture must be populated before it can be verified."
        />
      </div>
    </div>
    <div
      v-else
      class="text-slate-600 dark:text-slate-300"
    >
      Loading...
    </div>
  </div>
</template>
