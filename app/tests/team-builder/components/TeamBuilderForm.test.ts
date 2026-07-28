import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import TeamBuilderForm from '@/components/TeamBuilder/TeamBuilderForm.vue';
import { createMockTeamInsertData } from '@/tests/factories';

const mountTeamBuilderForm = (overrides = {}) => {
  const submitTeam = vi.fn();

  const wrapper = mount(TeamBuilderForm, {
    props: {
      draftedTeamData: createMockTeamInsertData(overrides),
      turnstileToken: 'token',
      isExistingDraftedTeam: false,
      remainingBudget: 10,
      teamBudget: 90,
      teamValue: 80,
      teamSubmissionDeadline: '2026-08-20',
      isOverBudget: false,
      loading: { submittingForm: false },
      submitTeam,
    },
    global: {
      stubs: {
        UAlert: defineComponent({
          template: '<div><slot name="description" /></div>',
        }),
        UButton: defineComponent({
          props: {
            label: {
              type: String,
              default: '',
            },
            type: {
              type: String,
              default: 'button',
            },
          },
          template: '<button :type="type">{{ label }}</button>',
        }),
        UCheckbox: defineComponent({
          props: {
            modelValue: {
              type: Boolean,
              default: false,
            },
          },
          emits: ['update:modelValue'],
          template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)">',
        }),
        UForm: defineComponent({
          props: {
            schema: {
              type: Object,
              required: true,
            },
            state: {
              type: Object,
              required: true,
            },
          },
          emits: ['submit'],
          methods: {
            onSubmit() {
              const result = this.schema.safeParse(this.state);
              if (result.success) {
                this.$emit('submit', { data: result.data });
              }
            },
          },
          template: '<form @submit.prevent="onSubmit"><slot /></form>',
        }),
        UFormField: defineComponent({
          template: '<label><slot /></label>',
        }),
        UInput: defineComponent({
          props: {
            modelValue: {
              type: [String, null],
              default: '',
            },
          },
          emits: ['update:modelValue'],
          template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">',
        }),
        USeparator: true,
        NuxtTurnstile: true,
      },
    },
  });

  return { wrapper, submitTeam };
};

describe('TeamBuilderForm', () => {
  it('does not submit when team details are invalid', async () => {
    const { wrapper, submitTeam } = mountTeamBuilderForm({
      team_email: 'not-an-email',
    });

    await wrapper.find('form').trigger('submit');

    expect(submitTeam).not.toHaveBeenCalled();
  });

  it('submits when team details are valid', async () => {
    const { wrapper, submitTeam } = mountTeamBuilderForm();

    await wrapper.find('form').trigger('submit');

    expect(submitTeam).toHaveBeenCalledOnce();
  });
});
