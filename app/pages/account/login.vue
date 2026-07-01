<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { useToast as useNuxtToast } from '@nuxt/ui/composables';
import { z } from 'zod';
import { useAccount } from '@/logic/account';

const { formData, accountStore } = useAccount();
const router = useRouter();
const toast = useNuxtToast();

const loginSchema = z.object({
  email: z.string().min(1, 'The email field is required').email('Invalid email format'),
  password: z.string().min(1, 'The password field is required').min(6, 'Password must be at least 6 characters'),
});

type LoginSchema = z.output<typeof loginSchema>;

const handleUserLogin = async (event: FormSubmitEvent<LoginSchema>) => {
  try {
    await accountStore.signUserIn(event.data);
    router.push({ path: '/account' });
  }
  catch (err) {
    handleApiError(err, toast);
  }
};
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center">
    <h1 class="main-heading flex items-center">
      <span>Admin Dashboard</span>
    </h1>
    <div
      class="mb-4 flex w-full max-w-96 flex-col justify-center rounded-md border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <UForm
        :schema="loginSchema"
        :state="formData"
        class="flex flex-col gap-6"
        @submit="handleUserLogin"
      >
        <UFormField
          label="Email"
          name="email"
        >
          <UInput
            v-model="formData.email"
            class="w-full"
            type="email"
            icon="material-symbols:alternate-email"
          />
        </UFormField>
        <UFormField
          label="Password"
          name="password"
        >
          <UInput
            v-model="formData.password"
            class="w-full"
            type="password"
            icon="mdi:password-outline"
          />
        </UFormField>
        <UButton
          class="justify-center"
          type="submit"
          label="Log in"
        />
      </UForm>
    </div>
    <UAlert
      color="info"
      variant="soft"
      :ui="{ root: 'max-w-2xl' }"
    >
      <template #description>
        Please report any bugs or issues by emailing
        <a
          class="font-bold underline"
          href="mailto:leagueofourown.fpl@gmail.com"
        >leagueofourown.fpl@gmail.com</a>
        with as much information as possible.
      </template>
    </UAlert>
  </div>
</template>
