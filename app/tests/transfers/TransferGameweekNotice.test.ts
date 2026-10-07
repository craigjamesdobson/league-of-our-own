import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { mount } from '@vue/test-utils';
import { computed, nextTick, ref } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import TransferGameweekNotice from '~/components/TransferGameweekNotice.vue';
import type { AppSettings } from '../../../shared/utils/appSettings';
import { getTransferTargetGameweek } from '../../../shared/utils/transferGameweek';

const settings = ref<Pick<AppSettings, 'currentGameweek'> | null>(null);

mockNuxtImport('useAppSettings', () => () => ({
  settings,
  transferTargetGameweek: computed(() => settings.value
    ? getTransferTargetGameweek(settings.value.currentGameweek)
    : null),
}));

const mountNotice = () => mount(TransferGameweekNotice, {
  global: { stubs: { UIcon: true } },
});

describe('transfer gameweek notice', () => {
  beforeEach(() => {
    settings.value = { currentGameweek: 7 };
  });

  it('shows the next gameweek and updates when the configured week changes', async () => {
    const wrapper = mountNotice();
    expect(wrapper.get('[role="status"]').text()).toContain('Gameweek 8');

    settings.value = { currentGameweek: 37 };
    await nextTick();
    expect(wrapper.text()).toContain('Gameweek 38');
    wrapper.unmount();
  });

  it('shows the closed-season message instead of gameweek 39', () => {
    settings.value = { currentGameweek: 38 };
    const wrapper = mountNotice();
    expect(wrapper.text()).toContain('closed for this season');
    expect(wrapper.text()).not.toContain('Gameweek 39');
    wrapper.unmount();
  });

  it('does not label requests closed or invent a week when settings are unavailable', () => {
    settings.value = null;
    const wrapper = mountNotice();
    expect(wrapper.text()).toContain('cannot confirm the transfer gameweek');
    expect(wrapper.text()).not.toContain('closed');
    wrapper.unmount();
  });
});
