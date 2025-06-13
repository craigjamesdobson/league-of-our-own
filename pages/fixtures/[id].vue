<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useFixtureStore } from '~/stores/fixtures';
import type { Fixture } from '~/types/Fixture';
import type { PlayerWithStats } from '~/types/Player';

definePageMeta({
  keepalive: true,
});

const route = useRoute();
const fixtureStore = useFixtureStore();
const toast = useToast();

const fixture: Ref<Fixture | null> = ref(null);

fixture.value = await fixtureStore.fetchFixtureByID(+route.params.id);

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
    const newStatus = !fixture.value.verified;
    await fixtureStore.updateFixtureVerificationStatus(fixture.value.id, newStatus);
    fixture.value.verified = newStatus;
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
    && !f.verified
    && f.home_team_score !== null
    && f.away_team_score !== null,
  );
});

const goToNextUnverified = () => {
  if (nextUnverifiedFixture.value) {
    navigateTo(`/fixtures/${nextUnverifiedFixture.value.id}`);
  }
};
</script>

<template>
  <div>
    <Toast />
    <div
      v-if="!!fixture"
      class="flex flex-col"
    >
      <div class="grid grid-cols-2 gap-5">
        <div>
          <div
            class="mx-auto my-10 flex w-96 items-center justify-center gap-5 rounded border bg-white p-5"
          >
            <img
              class="aspect-square h-32 w-32"
              :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
            >
            <div class="flex flex-col items-center gap-2.5">
              <p class="text-xl font-black uppercase">
                {{ fixture?.home_team.name }}
              </p>
              <input
                v-model="fixture.home_team_score"
                class="h-10 w-20 rounded border p-2 text-lg"
                type="number"
                min="0"
              >
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
            class="mx-auto my-10 flex w-96 items-center justify-center gap-5 rounded border bg-white p-5"
          >
            <div class="flex flex-col items-center gap-2.5">
              <p class="text-xl font-black uppercase">
                {{ fixture?.away_team.name }}
              </p>
              <input
                v-model="fixture.away_team_score"
                class="h-10 w-20 rounded border p-2 text-lg"
                type="number"
                min="0"
              >
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
        <Button
          label="Save Fixture"
          @click="updateFixture"
        />
        <Button
          :label="fixture.verified ? 'Unverify Fixture' : 'Verify Fixture'"
          :severity="fixture.verified ? 'secondary' : 'success'"
          :disabled="!fixture.verified && (fixture.home_team_score === null || fixture.away_team_score === null)"
          @click="toggleVerification"
        />
        <Button
          v-if="nextUnverifiedFixture"
          label="Next Unverified"
          severity="secondary"
          icon="pi pi-arrow-right"
          @click="goToNextUnverified"
        />
        <Button
          label="Back to Fixtures"
          severity="secondary"
          icon="pi pi-arrow-left"
          @click="navigateTo({ path: '/fixtures', query: { week: fixture.game_week } })"
        />
      </div>
      <div
        v-if="fixture.verified"
        class="text-center"
      >
        <Message
          class="!m-0 inline-flex"
          :closable="false"
          severity="success"
        >
          This fixture has been verified
        </Message>
      </div>
    </div>
    <div v-else>
      Loading...
    </div>
  </div>
</template>
