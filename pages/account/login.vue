<script setup>
import { useAccount } from '@/logic/account';

const { v$, formData, accountStore } = useAccount();
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="flex items-center main-heading">
      <span>Admin Login</span>
      <button title="Sign out" @click.prevent="accountStore.signOutUser">
        <Icon class="ml-2" name="la:sign-out-alt" />
      </button>
    </h1>
    <div
      class="flex flex-col justify-center p-10 mb-4 bg-white rounded-md w-96"
    >
      <form class="flex flex-col gap-6" action="">
        <FormField
          v-model="formData.email"
          label="Email"
          :validation="v$.email"
          icon="material-symbols:alternate-email"
        />
        <FormField
          v-model="formData.password"
          label="Password"
          :validation="v$.password"
          icon="mdi:password-outline"
        />
        <button
          class="px-1 py-2 text-white rounded-md bg-primary"
          :class="{ 'opacity-50': v$.$invalid }"
          :disabled="v$.$invalid"
          @click.prevent="accountStore.signUserIn(formData)"
        >
          Log In
        </button>
        <button
          class="underline"
          @click.prevent="accountStore.resetUserPassword(formData.email)"
        >
          Reset Password
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input {
  @apply focus:outline-none;
}
</style>
