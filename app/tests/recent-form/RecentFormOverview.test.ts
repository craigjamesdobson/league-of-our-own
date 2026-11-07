import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import RecentForm from '~/components/Dashboard/RecentForm.vue';
import { getRecentFormSummary } from '~/logic/recent-form';
import { formFixtures, formScores, formTeams } from './fixtures';

describe('Recent Form overview', () => {
  it('shows the fixed five-week overview without the old selectors or expandable cards', async () => {
    const summary = getRecentFormSummary({ teams: formTeams, scores: formScores, fixtures: formFixtures, currentGameweek: 6, period: 5 });
    const wrapper = mount(RecentForm, {
      props: { summary, isLoading: false, error: null },
      global: { stubs: { Icon: true, UCard: { template: '<div><slot /></div>' }, WeeklySummaryCard: { template: '<div><slot /></div>' } } },
    });

    expect(wrapper.text()).toContain('Last 5 completed gameweeks');
    expect(wrapper.text()).toContain('GW 2–6');
    expect(wrapper.text()).not.toMatch(/Last 3 weeks|Last 10 weeks|View scores/);
    expect(wrapper.findAll('article')).toHaveLength(4);
    wrapper.unmount();
  });

  it('shows every tied team directly in the overview', async () => {
    const summary = getRecentFormSummary({ teams: formTeams, scores: formScores.map(score => ({ ...score, points: 0 })), fixtures: formFixtures, currentGameweek: 6, period: 5 });
    const wrapper = mount(RecentForm, {
      props: { summary, isLoading: false, error: null },
      global: { stubs: { Icon: true, UCard: { template: '<div><slot /></div>' }, WeeklySummaryCard: { template: '<div><slot /></div>' } } },
    });

    const tiedTeams = wrapper.find('[aria-label="In-form teams"]');
    formTeams.forEach(team => expect(tiedTeams.text()).toContain(team.team_name));
    expect(wrapper.text()).not.toContain('View scores');
    wrapper.unmount();
  });
});
