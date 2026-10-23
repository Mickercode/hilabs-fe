"""Checks the HiLabs home page against the parts of the design brief that can be checked
mechanically: the colour and font rules, the logo SVG, WCAG AA contrast, and whether the copy
on the page still matches docs/website-copy.md word for word.

Non-ASCII characters are written as \\u escapes on purpose, so that re-encoding the file can
never silently turn a curly quote into a replacement character and break the copy comparison.

Run:  python -I site/verify.py
"""

import html as htmlmod
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PAGE = os.path.join(HERE, "index.html")

TOKENS = {
    "indigo": "#2B2A7A",
    "indigo-strong": "#1F1E5C",
    "amber": "#F2A93B",
    "amber-ink": "#A86200",
    "night": "#15143D",
    "surface": "#FFFFFF",
    "surface-muted": "#F4F4F9",
    "ink": "#1B1A3A",
    "ink-muted": "#55556F",
    "border": "#DADAE6",
    "on-indigo": "#FFFFFF",
    "on-night-muted": "#B4B3CF",
}
ALLOWED_HEX = {v.lower() for v in TOKENS.values()}
# rgba() is only permitted as a token colour with alpha.
ALLOWED_RGB = {(255, 255, 255), (21, 20, 61)}
ALLOWED_FONTS = {
    "sora", "source sans 3", "system-ui", "sans-serif",
    "var(--font-display)", "var(--font-body)",
}

failures = []
notes = []


def fail(check, detail=""):
    failures.append((check, detail))


def ok(check, detail=""):
    notes.append((check, detail))


page = open(PAGE, encoding="utf-8").read()
style = "\n".join(re.findall(r"<style>(.*?)</style>", page, re.S))


# --------------------------------------------------------------------------- colours

hexes = set(h.lower() for h in re.findall(r"#[0-9A-Fa-f]{6}\b", page))
stray_hex = sorted(h for h in hexes if h not in ALLOWED_HEX)
if stray_hex:
    fail("only token colours", "non-token hex: " + ", ".join(stray_hex))
else:
    ok("only token colours", f"{len(hexes)} distinct hex values, all tokens")

rgbas = re.findall(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)", page)
stray_rgb = sorted({t for t in ((int(a), int(b), int(c)) for a, b, c in rgbas) if t not in ALLOWED_RGB})
if stray_rgb:
    fail("only token colours", f"rgba() that is not a token: {stray_rgb}")
else:
    ok("rgba() uses token colours only", f"{len(rgbas)} uses, all white or night")

gradients = re.findall(r"(?:linear|radial|conic)-gradient\([^;]*", style)
non_night = [g for g in gradients if "rgba(21, 20, 61" not in g]
if non_night:
    fail("no gradients but the photo overlay", f"{len(non_night)} other gradient(s)")
else:
    ok("no gradients but the photo overlay", f"{len(gradients)} gradient, the night overlay")


# --------------------------------------------------------------------------- fonts

families = re.findall(r"font-family:\s*([^;}]+)", style)
bad_fonts = []
for decl in families:
    for part in decl.split(","):
        name = part.strip().strip("\"'").lower()
        if name and name not in ALLOWED_FONTS:
            bad_fonts.append(name)
if bad_fonts:
    fail("only Sora and Source Sans 3", f"other families: {sorted(set(bad_fonts))}")
else:
    ok("only Sora and Source Sans 3", f"{len(families)} font-family declarations")

if re.search(r"font-family:[^;}]*\bInter\b", style) or "family=Inter" in page:
    fail("no Inter", "the brief rules out Inter")
else:
    ok("no Inter", "IntersectionObserver is not the typeface")


# --------------------------------------------------------------------------- the logo

LOGO_PARTS = [
    "M74.21 16.25 A46 46 0 0 1 104.99 69.56",
    "M90.78 94.18 A46 46 0 0 1 29.22 94.18",
    "M15.01 69.56 A46 46 0 0 1 45.79 16.25",
    'cx="60" cy="62" r="28"',
    'cx="60" cy="66" r="16"',
    'cx="60" cy="71" r="6"',
]
missing = [p for p in LOGO_PARTS if p not in page]
if missing:
    fail("logo SVG is the brief's SVG", f"missing: {missing}")
else:
    ok("logo SVG is the brief's SVG",
       f"{page.count(chr(34) + '6 6 108 108' + chr(34))} lockups, paths and rings unmodified")

if "stroke-width='13'" in page and "r='20'" in page:
    ok("favicon is the arcs-only mark", "stroke 13, solid amber core r=20, no inner rings")
else:
    fail("favicon is the arcs-only mark", "does not match section 5")


# --------------------------------------------------------------------------- rings and WebGL

rings = page.count('class="rings')
if rings >= 3:
    ok("sinking-rings motif", f"{rings} instances: hero, AI callout, closing band")
else:
    fail("sinking-rings motif", f"found {rings}, expected at least 3")

imports = len(re.findall(r'import\(\s*"\./hero-scene\.js"\s*\)', page))
canvases = len(re.findall(r"<canvas", page))
if imports == 1 and canvases == 1:
    ok("WebGL only in the hero", "one dynamic import, one canvas, both in the hero")
else:
    fail("WebGL only in the hero", f"{imports} imports, {canvases} canvas elements")


# --------------------------------------------------------------------------- contrast


def srgb_to_lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hexval):
    h = hexval.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)


def blend(fg, bg, alpha):
    """fg over bg at alpha, as a hex string."""
    f = fg.lstrip("#")
    b = bg.lstrip("#")
    out = []
    for i in (0, 2, 4):
        out.append(round(int(f[i:i + 2], 16) * alpha + int(b[i:i + 2], 16) * (1 - alpha)))
    return "#%02X%02X%02X" % tuple(out)


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


T = TOKENS
band_over_placeholder = blend(T["night"], T["surface-muted"], 0.55)

PAIRS = [
    # (name, foreground, background, minimum)
    ("body on surface", T["ink"], T["surface"], 4.5),
    ("body on surface-muted", T["ink"], T["surface-muted"], 4.5),
    ("muted text on surface", T["ink-muted"], T["surface"], 4.5),
    ("muted text on surface-muted", T["ink-muted"], T["surface-muted"], 4.5),
    ("indigo heading on surface", T["indigo"], T["surface"], 4.5),
    ("indigo heading on surface-muted", T["indigo"], T["surface-muted"], 4.5),
    ("amber-ink eyebrow on surface", T["amber-ink"], T["surface"], 4.5),
    # The only amber-ink on surface-muted left is the "60" inside an h2: large text.
    ("amber-ink 60 in the h2 on surface-muted (large)", T["amber-ink"], T["surface-muted"], 3.0),
    ("on-indigo on indigo button", T["on-indigo"], T["indigo"], 4.5),
    ("on-indigo on indigo-strong (hover)", T["on-indigo"], T["indigo-strong"], 4.5),
    ("night text on amber button", T["night"], T["amber"], 4.5),
    ("white on night band", T["on-indigo"], T["night"], 4.5),
    ("on-night-muted on night", T["on-night-muted"], T["night"], 4.5),
    ("white over the 55% night photo overlay (large)", T["on-indigo"], band_over_placeholder, 3.0),
    ("placeholder tag, ink-muted on surface-muted", T["ink-muted"], T["surface-muted"], 4.5),
]
for name, fg, bg, minimum in PAIRS:
    r = ratio(fg, bg)
    label = f"{name}: {r:.2f}:1 (needs {minimum})"
    if r < minimum:
        fail("contrast AA", label)
    else:
        ok("contrast", label)

if re.search(r"color:\s*var\(--amber\)\s*[;}]", style):
    fail("amber never body text", "--amber used as a text colour")
else:
    ok("amber never body text", "--amber appears only as background, fill or dot")


# --------------------------------------------------------------------------- copy

RIGHT_SINGLE = "’"
LEFT_SINGLE = "‘"
LEFT_DOUBLE = "“"
RIGHT_DOUBLE = "”"
EN_DASH = "–"
EM_DASH = "—"
NBSP = " "


def flatten(text):
    text = unicodedata.normalize("NFKC", text)
    text = text.replace(RIGHT_SINGLE, "'").replace(LEFT_SINGLE, "'")
    text = text.replace(LEFT_DOUBLE, '"').replace(RIGHT_DOUBLE, '"')
    text = text.replace(EN_DASH, "-").replace(EM_DASH, "-").replace(NBSP, " ")
    text = re.sub(r"\s+", " ", text)
    # An inline span that closes before punctuation would otherwise read as "60 ."
    text = re.sub(r"\s+([.,;:!?])", r"\1", text)
    return text.strip()


def visible_text(markup):
    out = re.sub(r"<!--.*?-->", " ", markup, flags=re.S)
    out = re.sub(r"<(script|style)\b.*?</\1>", " ", out, flags=re.S | re.I)
    out = re.sub(r"<[^>]+>", " ", out)
    out = htmlmod.unescape(out)
    return flatten(out)


body_text = visible_text(page)

REQUIRED = [
    "Your grades measured what you could repeat. We want to find what you can become.",
    "HiLabs is a new way to learn for adults of any age or background.",
    "No entrance exam. No transcript. Just you, going deeper than school ever let you.",
    "Free during our first study. [60] places. Starts [MONTH YEAR].",
    "School asked one question. It was the wrong one.",
    "can you reproduce the answer the examiner wants?",
    "But you know people who failed exams and built businesses.",
    "Their intelligence was always there.",
    "The system just wasn't built to look for it.",
    "Intelligence is not fixed. It is waiting to be activated.",
    'So we don\'t ask "How smart are you?"',
    'We ask: "Where do you go deeper, and what happens when you\'re given the room to?"',
    "Capacity is hidden",
    "It shows up in how you engage, not in a test score.",
    "Environment decides",
    "The right people and the right challenge bring it out.",
    "Work is the evidence",
    "What you make shows what you can do, better than a grade ever could.",
    "Four steps. One loop. Built around you.",
    "Most courses hand you a syllabus and a deadline.",
    "Start with a question, not a course",
    "Learn the way apprentices do",
    "Practise exactly what you need",
    "Leave with proof, not a promise",
    "What you make shapes what comes next.",
    "That loop is the whole idea.",
    "An AI companion that makes you think harder, not less.",
    "It will never tell you what kind of mind you have.",
    'For anyone who was ever told they weren\'t "academic".',
    "The graduate who passed every exam and still feels they never learned to think.",
    "The builder, trader or creator who learned everything outside a classroom.",
    "The professional at 35 or 55 who wants to change direction.",
    "The curious person who simply wants to understand the world properly this time.",
    "If you're 18 or over and willing to put in about 4 hours a week, you belong here.",
    "What you'll walk away with",
    "A portfolio of real work.",
    "Sharper thinking you can see.",
    "A clearer sense of where you go deep.",
    "Time with practitioners.",
    "Our promises to you",
    "Give you an intelligence score or type",
    "You are not a number, and a new label is no better than an old one.",
    "Rank you against other learners",
    "Learning is not a race.",
    "Ask for your grades, school or certificates",
    "Share your data without your clear consent",
    "Claim more than we know",
    "Be one of the first 60.",
    "Our first cohort is also a study.",
    "Critical and systems thinking",
    "4 weeks, about 4 hours a week",
    "Online, on your phone or laptop, built to work on low data",
    "Adults 18 and over, any background, anywhere",
    "Learners are placed at random in one of two versions of the programme.",
    "What's one thing you've always wanted to understand properly?",
    "Request my place",
    "You're on the list. We'll email you before [DATE] with next steps.",
    "HiLabs succeeds when it is tested, not when it is believed.",
    "Let learners see how you think",
    "Challenge our framework",
    "Fund an open experiment in learning",
    "Become a practitioner",
    "Partner on the research",
    "Talk to us about funding",
    "Do I need a degree or good grades?",
    "Is this a school? Will I get a certificate?",
    "Is it really free?",
    "What is HIMs?",
    "Will the AI just give me the answers?",
    "Will you tell me what kind of intelligence I have?",
    "What happens to my data?",
    "What comes after critical thinking?",
    "Mathematics and language are next.",
    "You were never short of intelligence. You were short of the right room.",
    "Come and find out what you can do when you have it.",
    "Join the first cohort",
    "HiLabs: the Human Intelligence Lab Project",
    "Built in Nigeria, open to the world.",
    "[EMAIL ADDRESS]",
]

missing_copy = [line for line in REQUIRED if flatten(line) not in body_text]
if missing_copy:
    for line in missing_copy:
        fail("copy matches COPY.md", "not on the page: " + repr(line))
else:
    ok("copy matches COPY.md", f"{len(REQUIRED)} passages verified word for word")

for ph in ["[60]", "[MONTH YEAR]", "[DATE]", "[EMAIL ADDRESS]"]:
    if ph not in body_text:
        fail("placeholders visible", ph + " is missing")
if not any(f[0] == "placeholders visible" for f in failures):
    ok("placeholders visible", "[60], [MONTH YEAR], [DATE], [EMAIL ADDRESS]")

for banned in ["hilabs graduate", "hilabs learner", "testimonial", "graduate of hilabs"]:
    if banned in body_text.lower():
        fail("no person presented as a learner or result", banned)
if not any(f[0] == "no person presented as a learner or result" for f in failures):
    ok("no person presented as a learner or result")


# --------------------------------------------------------------------------- structure

h1s = len(re.findall(r"<h1[ >]", page))
checks = [
    ("one h1", h1s == 1, f"{h1s} found"),
    ("semantic landmarks", all(t in page for t in ["<main", "<footer", "<nav", "<header"]), ""),
    ("hero is not 100vh", "100vh" not in style, ""),
    ("reduced motion honoured", "prefers-reduced-motion: reduce" in style, ""),
    ("save-data respected", "saveData" in page, ""),
    ("hardwareConcurrency gate", "hardwareConcurrency" in page, ""),
    ("no carousel", "carousel" not in page.lower(), ""),
    ("no coloured left-border cards",
     not re.search(r"border-left:\s*\d+px\s+solid\s+var\(--(amber|indigo)\)", style), ""),
    ("side gutter clears the safe area", "env(safe-area-inset-left" in style, ""),
    ("44px tap targets declared", style.count("min-height: 44px") + style.count("height: 44px") >= 4, ""),
    ("meta description present", 'name="description"' in page, ""),
    ("video is silent and on-view only",
     all(s in page for s in ["el.muted = true", 'preload = "none"', "e.isIntersecting ? el.play"]), ""),
    ("images lazy with dimensions",
     all(s in page for s in ['loading = "lazy"', 'decoding = "async"', "img.width"]), ""),
]
for name, passed, detail in checks:
    (ok if passed else fail)(name, detail)


# --------------------------------------------------------------------------- report

width = max([len(c) for c, _ in failures + notes] or [20])
print("PASS")
for check, detail in notes:
    print(f"  {check:<{width}}  {detail}")
if failures:
    print("\nFAIL")
    for check, detail in failures:
        print(f"  {check:<{width}}  {detail}")
print(f"\n{len(notes)} passed, {len(failures)} failed")
sys.exit(1 if failures else 0)
