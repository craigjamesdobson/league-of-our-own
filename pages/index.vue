<template>
  <div class="flex flex-col gap-5 items-center justify-center h-full">
    <div class="text-primary font-display flex items-center justify-center">
      <div class="flex flex-col rounded-sm bg-white p-10 text-center">
        <div class="bg-primary flex justify-items-center self-center rounded-full p-4">
          <Icon class="text-slate-100" size="64" name="carbon:soccer" />
        </div>
        <h1
          class="border-primary mb-6 border-b text-4xl font-black uppercase tracking-wider md:text-[72px] md:leading-[72px]">
          League of our own
        </h1>
        <span class="text-xl text-neutral-800">ESTABLISHED. 1989/1990</span>
      </div>
    </div>
    <div class="flex flex-col items-center gap-2.5">
      <Message pt:text:class="text-lg" pt:icon:class="w-6 h-6 mr-2.5" :closable="false">Welcome to the 24/25 season!
        Please use the new <strong>team builder</strong> to submit your team this year.</Message>
      <NuxtLink class="gtm-team-builder-cta" to="/team-builder">
        <Button label="Pick a team!" />
      </NuxtLink>
    </div>
  </div>
</template>
