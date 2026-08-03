import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, expect, it } from 'vitest';
import TeamAdminMetadataPopover from '~/components/Drafted/TeamAdminMetadataPopover.vue';
import { createMockTeamAdminMetadata } from '~/tests/factories';

const UPopoverStub = defineComponent({
  template: '<div><slot /><div data-testid="popover-content"><slot name="content" /></div></div>',
});

const UButtonStub = defineComponent({
  inheritAttrs: false,
  template: '<button v-bind="$attrs" />',
});

const mountPopover = (updatedAt: string | null, editedCount: number | null) =>
  mount(TeamAdminMetadataPopover, {
    props: {
      metadata: createMockTeamAdminMetadata({
        updated_at: updatedAt,
        edited_count: editedCount,
      }),
    },
    global: {
      stubs: {
        UButton: UButtonStub,
        UPopover: UPopoverStub,
      },
    },
  });

describe('TeamAdminMetadataPopover', () => {
  it('shows the created date, last-edited date, and edit count', () => {
    const wrapper = mountPopover('2025-01-14T18:30:00Z', 2);

    expect(wrapper.get('button').attributes('aria-label')).toBe('View submission history');
    expect(wrapper.get('[data-testid="popover-content"]').text()).toContain('Created');
    expect(wrapper.get('[data-testid="popover-content"]').text()).toContain('12 Jan 2025');
    expect(wrapper.get('[data-testid="popover-content"]').text()).toContain('Last edited');
    expect(wrapper.get('[data-testid="popover-content"]').text()).toContain('14 Jan 2025');
    expect(wrapper.get('[data-testid="popover-content"]').text()).toContain('Edit count');
    expect(wrapper.get('[data-testid="popover-content"]').text()).toContain('2');
  });

  it('handles a team that has never been edited', () => {
    const wrapper = mountPopover(null, null);

    expect(wrapper.get('[data-testid="popover-content"]').text()).toContain('Never edited');
    expect(wrapper.get('[data-testid="popover-content"]').text()).toContain('0');
  });
});
