import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, expect, it } from 'vitest';
import DraftedTeam from '~/components/Drafted/DraftedTeam.vue';
import { createMockDraftedTeam, createMockTeamAdminMetadata } from '~/tests/factories';

const SlotStub = defineComponent({
  template: '<div><slot /><slot name="content" /></div>',
});

describe('DraftedTeam', () => {
  it('renders the submission history control when admin metadata is provided', () => {
    const wrapper = mount(DraftedTeam, {
      props: {
        draftedTeam: createMockDraftedTeam(),
        adminMetadata: createMockTeamAdminMetadata(),
      },
      global: {
        stubs: {
          DraftedPlayerEditDialog: true,
          Icon: true,
          UButton: defineComponent({
            inheritAttrs: false,
            template: '<button v-bind="$attrs" />',
          }),
          UCard: SlotStub,
          UPopover: SlotStub,
          UTooltip: SlotStub,
        },
      },
    });

    expect(wrapper.find('[aria-label="View submission history"]').exists()).toBe(true);
  });
});
