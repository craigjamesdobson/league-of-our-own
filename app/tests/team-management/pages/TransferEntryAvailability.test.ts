import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TransferEntry from '~/pages/manage-team/index.vue';

const enabled = ref(false);
const loadOnlineWorkflow = vi.fn();

mockNuxtImport('useAppSettings', () => () => ({
  onlineTransferRequestsEnabled: enabled,
}));

const mountEntry = () => mount(TransferEntry, {
  global: {
    stubs: {
      OnlineTeamManagement: defineComponent({
        setup() { loadOnlineWorkflow(); },
        template: '<div>Online transfer workflow</div>',
      }),
      TransferEmailInstructions: defineComponent({
        template: '<div>Email instructions and template</div>',
      }),
    },
  },
});

describe('transfer entry availability', () => {
  beforeEach(() => {
    enabled.value = false;
    vi.clearAllMocks();
  });

  it('shows the email workflow without loading private-team or request logic', () => {
    const wrapper = mountEntry();

    expect(wrapper.text()).toBe('Email instructions and template');
    expect(loadOnlineWorkflow).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('keeps the online workflow available for a deliberate future activation', () => {
    enabled.value = true;
    const wrapper = mountEntry();

    expect(wrapper.text()).toBe('Online transfer workflow');
    expect(loadOnlineWorkflow).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
