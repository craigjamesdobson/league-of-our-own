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

  it('shows a single in-form team after breaking a tie', () => {
    const summary = getRecentFormSummary({ teams: formTeams, scores: formScores.map(score => ({ ...score, points: 0 })), fixtures: formFixtures, currentGameweek: 6, period: 5 });
    const wrapper = mount(RecentForm, {
      props: { summary, isLoading: false, error: null },
      global: { stubs: { Icon: true, UCard: { template: '<div><slot /></div>' }, WeeklySummaryCard: { template: '<div><slot /></div>' } } },
    });

    const card = wrapper.find('[aria-labelledby="form-team-heading"]');
    expect(card.findAll('.team-name').map(team => team.text())).toEqual(['North Stand']);
    expect(card.findAll('ol li')).toHaveLength(5);
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

  it('keeps each ranking to five teams and lists the remaining ties in a popover', () => {
    const summary = getRecentFormSummary({ teams: formTeams, scores: formScores, fixtures: formFixtures, currentGameweek: 6, period: 5 });
    const leader = summary.regularScorers[0]!;
    summary.regularScorers = Array.from({ length: 9 }, (_, index) => ({
      ...leader, drafted_team_id: index + 1, team_name: `Team ${index + 1}`,
    }));
    summary.climbers = Array.from({ length: 7 }, (_, index) => ({
      ...leader, drafted_team_id: index + 1, team_name: `Climber ${index + 1}`, value: 3,
      startPosition: index + 4, endPosition: index + 1,
    }));
    const wrapper = mount(RecentForm, {
      props: { summary, isLoading: false, error: null },
      global: {
        stubs: {
          Icon: true,
          UCard: { template: '<div><slot /></div>' },
          UPopover: { template: '<div><slot /><slot name="content" /></div>' },
          UButton: { props: ['label'], template: '<button>{{ label }}</button>' },
        },
      },
    });

    const card = wrapper.find('[aria-labelledby="form-regular-heading"]');
    const visibleNames = card.find('ol').findAll('.team-name').map(name => name.text());
    const extraNames = card.find('ul').findAll('li span:first-child').map(name => name.text());
    expect(visibleNames).toEqual(['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5']);
    expect(extraNames).toEqual(['Team 6', 'Team 7', 'Team 8', 'Team 9']);
    expect(card.get(`button[aria-label="Show 4 more teams on ${leader.value}/5"]`).text()).toBe('+4');

    const climbers = wrapper.find('[aria-labelledby="form-climber-heading"]');
    expect(climbers.findAll('ol li')).toHaveLength(5);
    expect(climbers.find('ul').findAll('li span:first-child').map(name => name.text())).toEqual(['Climber 6', 'Climber 7']);
    expect(climbers.get('button[aria-label="Show 2 more teams tied at +3 places"]').text()).toBe('+2');
    wrapper.unmount();
  });
});
