import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OnlineTransferEntry from '~/pages/manage-team/online.vue';

const requestLink = vi.fn();
const resetSecurityCheck = vi.fn();

const UInputStub = defineComponent({
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  template: '<input type="email" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">',
});

const UButtonStub = defineComponent({
  props: {
    to: { type: String, default: undefined },
    label: { type: String, default: '' },
    loading: { type: Boolean, default: false },
  },
  template: '<a v-if="to" :href="to">{{ label }}</a><button v-else :disabled="loading">{{ label }}</button>',
});

const TurnstileStub = defineComponent({
  emits: ['update:modelValue'],
  setup(_props, { expose }) {
    expose({ reset: resetSecurityCheck });
  },
  template: '<button type="button" @click="$emit(\'update:modelValue\', \'verified-test-token\')">Complete security check</button>',
});

const mountEntry = () => mount(OnlineTransferEntry, {
  global: {
    stubs: {
      UInput: UInputStub,
      UButton: UButtonStub,
      UFormField: defineComponent({ template: '<div><slot /></div>' }),
      NuxtTurnstile: TurnstileStub,
      TransferGameweekNotice: true,
    },
  },
});

describe('online transfer entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestLink.mockResolvedValue({});
    vi.stubGlobal('$fetch', requestLink);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks for the security check before requesting a team link', async () => {
    const wrapper = mountEntry();
    await wrapper.get('input').setValue('manager@example.com');
    await wrapper.get('form').trigger('submit');

    expect(requestLink).not.toHaveBeenCalled();
    expect(wrapper.get('[role="alert"]').text()).toContain('complete the security check');
    wrapper.unmount();
  });

  it('requests a link and confirms receipt without revealing whether a team exists', async () => {
    const wrapper = mountEntry();
    await wrapper.get('input').setValue('manager@example.com');
    await wrapper.get('button[type="button"]').trigger('click');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(requestLink).toHaveBeenCalledWith('/api/team-management-link', {
      method: 'POST',
      body: { email: 'manager@example.com', turnstileToken: 'verified-test-token' },
    });
    expect(wrapper.get('h1').text()).toBe('Check your inbox');
    expect(wrapper.get('[role="status"]').text()).toContain('If a team that can make transfers is registered');
    expect(wrapper.get('[role="status"]').text()).toContain('choose your players');
    expect(resetSecurityCheck).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it('keeps the email and requires a fresh security check after a failed request', async () => {
    requestLink.mockRejectedValueOnce({ statusMessage: 'Please wait before requesting another link.' });
    const wrapper = mountEntry();
    await wrapper.get('input').setValue('manager@example.com');
    await wrapper.get('button[type="button"]').trigger('click');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(wrapper.get('[role="alert"]').text()).toContain('Please wait');
    expect(wrapper.get('input').element.value).toBe('manager@example.com');
    expect(resetSecurityCheck).toHaveBeenCalledOnce();
    await wrapper.get('form').trigger('submit');
    expect(requestLink).toHaveBeenCalledOnce();
    expect(wrapper.get('[role="alert"]').text()).toContain('complete the security check');

    await wrapper.get('button[type="button"]').trigger('click');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.get('h1').text()).toBe('Check your inbox');
    wrapper.unmount();
  });

  it('submits once while a team-link request is in progress', async () => {
    let completeRequest: (() => void) | undefined;
    requestLink.mockImplementationOnce(() => new Promise((resolve) => {
      completeRequest = () => resolve({});
    }));
    const wrapper = mountEntry();
    await wrapper.get('input').setValue('manager@example.com');
    await wrapper.get('button[type="button"]').trigger('click');
    await wrapper.get('form').trigger('submit');
    await wrapper.get('form').trigger('submit');

    expect(requestLink).toHaveBeenCalledOnce();
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined();
    completeRequest?.();
    await flushPromises();
    expect(wrapper.get('h1').text()).toBe('Check your inbox');
    wrapper.unmount();
  });
});
