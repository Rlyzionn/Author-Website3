# Landing page audit — Gabriel Pollard

**Looked at:** Published author/book landing page, full-page screenshots at 1280 × 800 and 390 × 844, local HTML/CSS, and the revised page at both widths.
**Benchmarks:** Skipped — Landingfolio MCP not connected. The skill's design rules were used; no gallery comparisons are claimed. Connection instructions: https://www.landingfolio.com/mcp
**Category:** Author / book marketing and reader signup.

## Critical

No critical findings. The original page identified the book, offered a visible action, and retained its content on mobile.

## Major

### 1. Mobile headline breaks into five short lines
**Where:** Hero › h1 at 390px; original mobile font size 68px.
**Violates:** `landing-page.md` — mobile headlines should not break into one or two words per line; `spacing.md` — display type should shrink faster than body text.
**Why it matters:** The headline consumes most of the first screen and delays the book visual and next step.
**Fix applied:** 48px maximum phone headline, tighter proportional tracking, three-line composition, reduced hero decoration, and a full-width chapter action visible within the first screen. The cover starts within or immediately after the first screen.

### 2. Supporting information is undersized
**Where:** Chapter form, section descriptions, metadata, social links, and footer; original sizes range from 8–13px in many places.
**Violates:** `hierarchy.md` — hierarchy should use tone and weight rather than giant headlines against tiny supporting text; `typography.md` — use a small, deliberate type scale.
**Why it matters:** Form explanations, book context, and navigation become difficult to read, especially on phones.
**Fix applied:** Defined 12/14/16/20px supporting text tokens; body paragraphs use 16px with 1.65 line-height, actionable links use 14px or more, and most metadata uses 12px. Small brand/announcement exceptions preserve the compact header.

### 3. Primary button treatment changes meaning
**Where:** Hero, purchase buttons, audiobook, and chapter form.
**Violates:** `landing-page.md` — one primary style for the same action; `hierarchy.md` — primary/secondary/tertiary button tiers; `consistency.md` — same component, same look.
**Why it matters:** Dark solid buttons previously meant browsing, purchasing, and listening, while signing up used gold. Readers could not learn a consistent visual priority.
**Fix applied:** Copper solid buttons consistently represent free-chapter signup; the header echoes copper with an outline; retailer and audiobook buttons use quiet ink outlines. Shared button and field geometry establishes a 48px minimum height.

### 4. Biography visual is incorrectly identified as the author
**Where:** About › `.portrait img`, originally `assets/author.png`.
**Violates:** `images.md` — use real subject/product visuals and appropriate photo crops.
**Why it matters:** The original bookstore's profile-image URL contains book artwork. Calling it an author portrait and captioning it “the person behind the pages” creates a visible mismatch.
**Fix applied:** Replaced the artwork with the portrait used in Gabriel's supplied Kit landing page. Used a deliberate 4:5 crop with his face and book visible. No new portrait or personal identity was invented.

## Minor

### 5. Phone links and disclosures have small touch areas
**Where:** Mobile menu, text CTAs, secondary retailer links, social links, FAQ, and back-to-top link.
**Violates:** `landing-page.md` — mobile tap targets should be at least 44px tall; `consistency.md` — consistent controls and finishing details.
**Why it matters:** Short text links and small menu controls require unnecessarily precise taps.
**Fix applied:** At least 44px height for the menu, text CTAs, social links, FAQ summaries, and footer action; main buttons and inputs are at least 48px. Retailer actions stack clearly on phones. The synopsis list also uses restrained checkmarks instead of browser-default bullets.

## What's working

- Genuine supplied book artwork gives the hero a concrete subject.
- Warm paper, ink, copper, and gold form a coherent author identity.
- Alternating surfaces and varied compositions distinguish the reading, signup, biography, and media sections.
- Original book, author, audiobook, news, FAQ, and contact content is preserved.

## Validation and limits

- Reviewed original full-page desktop and mobile screenshots and the revised responsive page.
- Checked mobile horizontal overflow, primary CTA position, menu expansion/collapse, FAQ expansion, and image loading.
- Kept the existing Kit form destination. No signup was submitted; email delivery is outside this visual audit.
- No invented reviews, press logos, ratings, or testimonials were added to satisfy a generic proof rule.

## Next step

Fixes applied and prepared for publication on the existing Site, preserving its audience.
