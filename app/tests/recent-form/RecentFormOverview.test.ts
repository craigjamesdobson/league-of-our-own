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
      global: { stubs: { Icon: true, UCard: { template: '<div><slot /></div>' }, UPopover: { template: '<div><slot /></div>' } } },
    });

    expect(wrapper.text()).toContain('Last 5 completed gameweeks');
    expect(wrapper.text()).toContain('GW 2–6');
    expect(wrapper.text()).not.toMatch(/Last 3 weeks|Last 10 weeks|View scores/);
    expect(wrapper.findAll('article')).toHaveLength(4);

    const regularScorers = wrapper.find('[aria-labelledby="form-regular-heading"]');
    expect(regularScorers.findAll('.team-name').map(name => name.text())).toEqual(['North Stand', 'Park End']);
    const indicators = regularScorers.findAll('li')[0]!.findAll('button');
    expect(indicators).toHaveLength(5);
    expect(indicators.every(button => button.text() === '')).toBe(true);
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

  it('shows each regular scorer’s gameweeks and exposes the score details', () => {
    const scores = [
      [10, 20, 10, 20, 20, 20],
      [10, 10, 20, 20, 20, 20],
      [10, 15, 15, 10, 10, 10],
    ].flatMap((weeklyPoints, index) => weeklyPoints.map((points, week) => ({
      team: index + 1, week: week + 1, points, goals: 0,
    })));
    const summary = getRecentFormSummary({ teams: formTeams, scores, fixtures: formFixtures, currentGameweek: 6, period: 5 });
    summary.regularScorers[0]!.scores[0]!.leagueAverage = 19.98;
    const wrapper = mount(RecentForm, {
      props: { summary, isLoading: false, error: null },
      global: { stubs: { Icon: true, UCard: { template: '<div><slot /></div>' }, UPopover: { template: '<div><slot /></div>' } } },
    });

    const leaders = wrapper.find('[aria-label="Regular high scorers"]').findAll('li');
    expect(leaders.map(leader => leader.find('.team-name').text())).toEqual(['North Stand', 'Park End']);
    const [weekTwo, weekThree] = leaders[0]!.findAll('button');
    expect(weekTwo!.find('span').classes()).toContain('bg-primary/90');
    expect(weekThree!.find('span').classes()).toContain('bg-primary/20');
    expect(weekTwo!.attributes('aria-label')).toBe('GW 2: 20 pts · League average 19.98 pts · Above average');
    expect(weekThree!.attributes('aria-label')).toBe('GW 3: 10 pts · League average 15 pts · At or below average');
    wrapper.unmount();
  });
});
