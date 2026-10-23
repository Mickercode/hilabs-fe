/**
 * Every image and video on the HiLabs home page is listed here, so media can be swapped
 * without touching the layout. Each key matches a `data-media` slot in index.html.
 *
 * `base: null` or `mp4: null` means the media has not been shot or licensed yet. The page keeps
 * the labelled placeholder that is already in the HTML, which states the intended subject. A gap
 * is never filled with generic stock.
 *
 * The photographs below are openly licensed stand-ins from Wikimedia Commons, cropped and graded
 * to one treatment. Every one is credited on /credits, and docs/credits.md holds the same record.
 * An open licence covers copyright, not the rights of the people pictured: before any paid
 * campaign these should be replaced with commissioned photography and signed model releases, as
 * the design brief section 6c says. Nobody shown is a HiLabs learner, mentor or result.
 *
 * Files follow `<base>-<width>.<avif|webp>`.
 */

export const media = {
  /* Section 2, between the problem and the belief. Full-bleed band. */
  "problem-band": {
    kind: "image",
    base: "media/problem-band",
    widths: [480, 960, 1440, 2000],
    sizes: "100vw",
    ratio: [16, 7],
    alt: "A mechanic leans into an open engine bay, both hands working on a part, face turned down to the task",
    credit: "Bembety",
    licence: "CC0 1.0",
    source: "https://commons.wikimedia.org/wiki/File:Mechanic_repairing_car_engine.jpg"
  },

  /* Section 3, step 02 Learn. Silent looping clip.
     Still a placeholder on purpose: a stock clip of a stranger at a whiteboard would present
     them as a HiLabs practitioner, which the brief's rule 5 forbids. This one has to be filmed. */
  "learn-loop": {
    kind: "video",
    mp4: null,
    webm: null,
    poster: null,
    widths: [480, 960, 1440],
    sizes: "(min-width: 1024px) 46vw, 100vw",
    ratio: [4, 3],
    alt: null,
    description: "An experienced practitioner works through a real problem aloud at a workbench while a learner watches.",
    subject: "VIDEO 8-12s, silent: a practitioner thinking out loud at a whiteboard or workbench, a learner watching. Poster frame graded to match.",
    licence: null
  },

  /* Section 4, who it's for. Four 4:5 portraits, one per line of copy. */
  "who-graduate": {
    kind: "image",
    base: "media/who-graduate",
    widths: [480, 960],
    sizes: "(min-width: 1024px) 28vw, 44vw",
    ratio: [4, 5],
    alt: "A young man at an office desk, head bent over a sheaf of papers he is reading",
    credit: "Petbluzz",
    licence: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:A_busy_day_in_the_office_02.jpg"
  },
  "who-builder": {
    kind: "image",
    base: "media/who-builder",
    widths: [480, 960],
    sizes: "(min-width: 1024px) 28vw, 44vw",
    ratio: [4, 5],
    alt: "Two craftsmen weaving cane chairs outside a workshop, finished baskets on the ground beside them",
    credit: "AndeyWiki",
    licence: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Craftsmen_weaving_craft_works.jpg"
  },
  "who-professional": {
    kind: "image",
    base: "media/who-professional",
    widths: [480, 960],
    sizes: "(min-width: 1024px) 28vw, 44vw",
    ratio: [4, 5],
    alt: "A woman stands at an office desk with a telephone to her ear, writing in an open ledger",
    credit: "Eyenor",
    licence: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:AFRICAN_OFFICE_LADY.jpg"
  },
  "who-curious": {
    kind: "image",
    base: "media/who-curious",
    widths: [480, 960],
    sizes: "(min-width: 1024px) 28vw, 44vw",
    ratio: [4, 5],
    alt: "A phone repairer works at a bench covered with opened handsets, small screwdrivers in hand",
    credit: "Johnnybam",
    licence: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Skilled_Phone_Repairer_at_Work.jpg"
  },

  /* Section 5, behind the left column at 12% opacity. Desktop only. */
  "cohort-quiet": {
    kind: "image",
    base: "media/cohort-quiet",
    widths: [480, 960, 1440],
    sizes: "50vw",
    ratio: [4, 3],
    alt: "A hand writing in a lined notebook under low light",
    credit: "Tookapic",
    licence: "CC0 1.0",
    source: "https://commons.wikimedia.org/wiki/File:Pen-writing-notes-studying.jpg"
  },

  /* Section 7, behind the closing band at 25% opacity. Optional, and still unshot. */
  "closing-loop": {
    kind: "video",
    mp4: null,
    webm: null,
    poster: null,
    widths: [960, 1440],
    sizes: "100vw",
    ratio: [16, 9],
    alt: null,
    subject: "VIDEO 8-12s, silent: hands drawing interconnected circles on paper, slow.",
    licence: null
  }
};

/** True when the connection or the viewer's preferences say not to fetch heavy media. */
export function mediaAllowed() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return true;
  if (c.saveData) return false;
  return c.effectiveType !== "2g" && c.effectiveType !== "slow-2g";
}
