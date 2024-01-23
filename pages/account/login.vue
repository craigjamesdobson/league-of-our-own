<script setup>
import { useAccount } from '@/logic/account';

const { v$, formData, accountStore } = useAccount();
const router = useRouter();
const toast = useToast();

const handleUserLogin = async () => {
  try {
    await accountStore.signUserIn(formData);
    router.push({ path: '/account' });
  } catch (err) {
    handleApiError(err, toast);
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <Toast />
    <h1 class="flex items-center main-heading">
      <span>Admin Dashboard</span>
    </h1>
    <div
      class="flex flex-col justify-center p-10 mb-4 bg-white rounded-md w-96"
    >
      <form class="flex flex-col gap-6" @submit.prevent="handleUserLogin">
        <GenericFormField
          v-model="formData.email"
          label="Email"
          :validation="v$.email"
          icon="material-symbols:alternate-email"
          @keydown.enter="handleUserLogin"
        />
        <GenericFormField
          v-model="formData.password"
          label="Password"
          :validation="v$.password"
          icon="mdi:password-outline"
          @keydown.enter="handleUserLogin"
        />
        <Button
          type="submit"
          label="Log in"
          :class="{ 'opacity-50': v$.$invalid }"
          :disabled="v$.$invalid"
        />
      </form>
    </div>
    <Message :closable="false">
      Please report any bugs or issues by emailing
      <a
        class="underline font-bold"
        href="mailto:craigjamesdobson.dev@gmail.com"
        >craigjamesdobson.dev@gmail.com</a
      >
      with as much information as possible.
    </Message>
  </div>
</template>

<style lang="scss" scoped>
input {
  @apply focus:outline-none;
}
</style>
