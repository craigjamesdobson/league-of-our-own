<script setup lang="ts">
import WeeklySummaryCard from '@/components/Dashboard/WeeklySummaryCard.vue';
import { loadPlayerFallbackImage } from '@/utils/images';
import type { WeeklyTransfer, TeamTransfers } from '@/types/Dashboard';

const props = defineProps({
  transfers: {
    type: Array as PropType<readonly WeeklyTransfer[]>,
    default: () => [],
  },
  currentGameweek: {
    type: Number,
    default: 1,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasResults: {
    type: Boolean,
    default: false,
  },
});

const { isFavouriteTeam } = useFavouriteTeam();

const groupedTransfers = computed(() => {
  const grouped: Record<string, TeamTransfers> = {};

  props.transfers.forEach((transfer) => {
    const key = String(transfer.drafted_team_id);
    if (!grouped[key]) {
      grouped[key] = {
        drafted_team_id: transfer.drafted_team_id,
        team_name: transfer.team_name,
        team_owner: transfer.team_owner,
        transfers: [],
      };
    }
    grouped[key].transfers.push(transfer);
  });

  return Object.values(grouped);
});
</script>

<template>
  <WeeklySummaryCard
    :is-loading="isLoading"
  >
    <template #skeleton>
      <!-- Weekly Transfers Skeleton - matches team sections with transfer listings -->
      <div class="h-full space-y-4">
        <div
          v-for="n in 2"
          :key="n"
          class="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 shadow-sm dark:from-slate-800 dark:to-slate-900 dark:border-slate-700"
        >
          <!-- Team Header -->
          <div class="flex items-center justify-between mb-3">
            <div>
              <USkeleton class="mb-2 h-4 w-32" />
              <USkeleton class="h-3.5 w-40" />
            </div>
          </div>

          <!-- Transfers in compact vertical layout -->
          <div class="space-y-3">
            <div
              v-for="m in 1"
              :key="m"
              class="flex items-center md:grid md:grid-cols-[auto_1fr_auto_1fr_auto] gap-3 md:gap-8 p-3 rounded bg-gradient-to-r from-red-50 via-slate-50 to-green-50 border border-slate-200 dark:from-red-950/50 dark:via-slate-900 dark:to-green-950/50 dark:border-slate-700"
            >
              <!-- Left Arrow (desktop only) -->
              <div class="hidden md:flex justify-start">
                <USkeleton class="h-5 w-5 rounded-full" />
              </div>

              <!-- Player Out Section -->
              <div class="flex flex-col items-center gap-2 flex-1 md:relative md:flex-none">
                <USkeleton class="h-12 w-12 rounded-full border border-red-500" />
                <div class="text-center text-sm">
                  <USkeleton class="mb-1 h-4 w-16" />
                  <USkeleton class="h-3 w-10" />
                </div>
              </div>

              <!-- Swap Icon -->
              <div class="flex justify-center flex-shrink-0 px-4 md:px-0">
                <USkeleton class="h-6 w-6 rounded-full" />
              </div>

              <!-- Player In Section -->
              <div class="flex flex-col items-center gap-2 flex-1 md:relative md:flex">
                <USkeleton class="h-12 w-12 rounded-full border border-green-500" />
                <div class="text-center text-sm">
                  <USkeleton class="mb-1 h-4 w-16" />
                  <USkeleton class="h-3 w-10" />
                </div>
              </div>

              <!-- Right Arrow (desktop only) -->
              <div class="hidden md:flex justify-end">
                <USkeleton class="h-5 w-5 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div
      v-if="groupedTransfers && groupedTransfers.length > 0"
      class="h-full space-y-4"
    >
      <div
        v-for="teamGroup in groupedTransfers"
        :key="teamGroup.drafted_team_id"
        class="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 shadow-sm dark:from-slate-800 dark:to-slate-900 dark:border-slate-700"
      >
        <!-- Compact Team Header -->
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="flex items-center gap-1.5 font-bold text-base text-slate-800 uppercase dark:text-slate-100">
              {{ teamGroup.team_name }}
              <Icon
                v-if="isFavouriteTeam(teamGroup.drafted_team_id)"
                name="lucide:user-round-check"
                size="15"
                class="shrink-0 text-amber-500"
                aria-hidden="true"
              />
            </div>
            <div class="text-sm text-slate-600 uppercase dark:text-slate-300">
              {{ teamGroup.team_owner }} | {{ teamGroup.transfers.length }} transfer{{ teamGroup.transfers.length > 1 ? 's' : '' }}
            </div>
          </div>
        </div>

        <!-- Transfers in compact vertical layout -->
        <div class="space-y-3">
          <div
            v-for="transfer in teamGroup.transfers"
            :key="transfer.drafted_transfer_id"
            class="flex items-center md:grid md:grid-cols-[auto_1fr_auto_1fr_auto] gap-3 md:gap-8 p-3 rounded bg-gradient-to-r from-red-50 via-slate-50 to-green-50 border border-slate-200 dark:from-red-950/50 dark:via-slate-900 dark:to-green-950/50 dark:border-slate-700"
          >
            <!-- Unified Layout with Responsive CSS -->
            <!-- Left Arrow (desktop only) -->
            <div class="hidden md:flex justify-start">
              <Icon
                name="lucide:arrow-left"
                size="20"
                class="text-red-500"
              />
            </div>

            <!-- Player Out Section -->
            <div class="flex flex-col items-center gap-2 flex-1 md:relative md:h-12 md:flex-none">
              <img
                v-if="transfer.player_out_image"
                class="h-12 w-12 rounded-full border border-red-500 bg-white object-cover object-top md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:aspect-square dark:bg-slate-800"
                :src="transfer.player_out_image"
                :alt="transfer.player_out"
                @error="loadPlayerFallbackImage"
              >
              <UAvatar
                v-else
                :text="transfer.player_out.charAt(0)"
                class="bg-red-100 text-red-700 border border-red-500 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 dark:bg-red-950 dark:text-red-200"
              />
              <div class="text-center text-sm md:absolute md:left-[calc(50%+40px)] md:top-1/2 md:-translate-y-1/2 md:whitespace-nowrap md:text-left">
                <div class="font-semibold text-slate-800 dark:text-slate-100">
                  {{ transfer.player_out }}
                </div>
                <div class="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                  £{{ transfer.player_out_cost.toFixed(1) }}m
                </div>
              </div>
            </div>

            <!-- Swap Icon -->
            <div class="flex justify-center flex-shrink-0 px-4 md:px-0">
              <Icon
                name="eva:swap-fill"
                size="24"
                class="text-slate-400 dark:text-slate-500"
              />
            </div>

            <!-- Player In Section -->
            <div class="flex flex-col items-center gap-2 flex-1 md:relative md:h-12 md:flex-none">
              <img
                v-if="transfer.player_in_image"
                class="h-12 w-12 rounded-full border border-green-500 bg-white object-cover object-top md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:aspect-square dark:bg-slate-800"
                :src="transfer.player_in_image"
                :alt="transfer.player_in"
                @error="loadPlayerFallbackImage"
              >
              <UAvatar
                v-else
                :text="transfer.player_in.charAt(0)"
                class="bg-green-100 text-green-700 border border-green-500 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 dark:bg-green-950 dark:text-green-200"
              />
              <div class="text-center text-sm md:absolute md:right-[calc(50%+40px)] md:top-1/2 md:-translate-y-1/2 md:whitespace-nowrap md:text-right">
                <div class="font-semibold text-slate-800 dark:text-slate-100">
                  {{ transfer.player_in }}
                </div>
                <div class="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                  £{{ transfer.player_in_cost.toFixed(1) }}m
                </div>
              </div>
            </div>

            <!-- Right Arrow (desktop only) -->
            <div class="hidden md:flex justify-end">
              <Icon
                name="lucide:arrow-right"
                size="20"
                class="text-green-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8"
    >
      <Icon
        name="carbon:user-follow"
        size="48"
        class="mx-auto text-slate-400 mb-2 dark:text-slate-500"
      />
      <div class="text-slate-500 mb-4 dark:text-slate-400">
        <p class="font-medium mb-1">
          No transfers made for Gameweek {{ currentGameweek }}
        </p>
        <p class="text-sm">
          <span v-if="hasResults">All managers are keeping their current squads</span>
          <span v-else>Transfer deadline has passed - awaiting results</span>
        </p>
      </div>
      <UBadge
        v-if="hasResults"
        color="success"
        variant="soft"
        label="All teams keeping their squads"
      />
      <UBadge
        v-else
        color="info"
        variant="soft"
        label="No changes this gameweek"
      />
    </div>
  </WeeklySummaryCard>
</template>
