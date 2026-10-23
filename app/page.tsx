import styles from "./page.module.css";

// The four steps a learner sees. They are the product's spine, so they live here as data rather
// than as markup repeated across screens.
const STEPS = [
  {
    n: "01",
    name: "Explore",
    line: "Start with a question, not a course.",
  },
  {
    n: "02",
    name: "Learn",
    line: "Spend time around people who do the work well.",
  },
  {
    n: "03",
    name: "Develop",
    line: "Practise against the gaps in your own work.",
  },
  {
    n: "04",
    name: "Demonstrate",
    line: "Leave with a portfolio, not a promise.",
  },
] as const;

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Human Intelligence Lab</p>

        <h1 className={styles.title}>
          The learner application is <span className={styles.hl}>being built</span>.
        </h1>

        <p className={styles.lead}>
          HiLabs is a learning platform and a research study. This app will carry the learner
          journey; the public site is where the first cohort signs up.
        </p>

        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.n} className={styles.step}>
              <span className={styles.n}>{step.n}</span>
              <span className={styles.name}>{step.name}</span>
              <span className={styles.line}>{step.line}</span>
            </li>
          ))}
        </ol>

        <p className={styles.note}>
          Nothing here reports a score, a type or a ranking of a learner, and it never will.
        </p>
      </div>
    </main>
  );
}
