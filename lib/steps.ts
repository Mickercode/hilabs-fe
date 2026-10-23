/**
 * The four steps a learner sees. Explore, Learn, Develop, Demonstrate are the product's spine,
 * so the names, order and routes live in one place rather than being repeated per screen.
 */
export interface Step {
  n: string;
  name: string;
  href: string;
  line: string;
}

export const STEPS: readonly Step[] = [
  {
    n: '01',
    name: 'Explore',
    href: '/explore',
    line: 'Start with a question, not a course.',
  },
  {
    n: '02',
    name: 'Learn',
    href: '/learn',
    line: 'Spend time around people who do the work well.',
  },
  {
    n: '03',
    name: 'Develop',
    href: '/develop',
    line: 'Practise against the gaps in your own work.',
  },
  {
    n: '04',
    name: 'Demonstrate',
    href: '/demonstrate',
    line: 'Leave with a portfolio, not a promise.',
  },
] as const;
