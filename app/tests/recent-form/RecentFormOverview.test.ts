import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import RecentForm from '~/components/Dashboard/RecentForm.vue';
import { getRecentFormSummary } from '~/logic/recent-form';
import { formFixtures, formScores, formTeams } from './fixtures';

describe('Recent Form overview', () => {
  it('shows the fixed five-week overview without the old selectors or expandable cards', async () => {
    const scores = formScores.map(score => score.team === 1 && score.week < 4 ? { ...score, points: 18 } : score);
    const summary = getRecentFormSummary({ teams: formTeams, scores, fixtures: formFixtures, currentGameweek: 6, period: 5 });
    const wrapper = mount(RecentForm, {
      props: { summary, isLoading: false, error: null },
      global: { stubs: { Icon: true, UCard: { template: '<div><slot /></div>' }, WeeklySummaryCard: { template: '<div><slot /></div>' } } },
    });

    expect(wrapper.text()).toContain('Last 5 completed gameweeks');
    expect(wrapper.text()).toContain('GW 2–6');
    expect(wrapper.text()).not.toMatch(/Last 3 weeks|Last 10 weeks|View scores/);
    expect(wrapper.findAll('article')).toHaveLength(4);

    const regularScorers = wrapper.find('[aria-labelledby="form-regular-heading"]');
    expect(regularScorers.findAll('li').map(leader => leader.text())).toEqual(['North Stand', 'Park End']);
    expect(regularScorers.findAll('.stat-caption').map(caption => caption.text())).toContain('Beat the league average in GW 2–6');
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

  it('names the gameweeks each tied regular scorer beat the average', () => {
    const scores = [
      [10, 20, 10, 20, 20, 20],
      [10, 10, 20, 20, 20, 20],
      [10, 15, 15, 10, 10, 10],
    ].flatMap((weeklyPoints, index) => weeklyPoints.map((points, week) => ({
      team: index + 1, week: week + 1, points, goals: 0,
    })));
    const summary = getRecentFormSummary({ teams: formTeams, scores, fixtures: formFixtures, currentGameweek: 6, period: 5 });
    const wrapper = mount(RecentForm, {
      props: { summary, isLoading: false, error: null },
      global: { stubs: { Icon: true, UCard: { template: '<div><slot /></div>' } } },
    });

    const leaders = wrapper.find('[aria-label="Regular high scorers"]').findAll('li');
    expect(leaders.map(leader => leader.find('.team-name').text())).toEqual(['North Stand', 'Park End']);
    expect(leaders.map(leader => leader.find('.stat-caption').text())).toEqual([
      'Beat the average in GW 2, 4, 5 and 6',
      'Beat the average in GW 3, 4, 5 and 6',
    ]);
    wrapper.unmount();
  });
});
