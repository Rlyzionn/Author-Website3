# Landing page audit: Gabriel Pollard

**Looked at:** the published version 7 page and source; full-page captures at 1280px and 390px; refined preview at 1280px, 390px and 320px. This is an author and spiritual nonfiction landing page.

**Benchmarks:** skipped because the Landingfolio MCP is not connected. Findings use the supplied audit rules and actual page values.

The original page used a dark storm-and-gold hero with a floating cover, followed by a three-part scroll story, another cover showcase, reader choices, author, chapter form, audio, trailer/quote cards, FAQ and a final chapter promotion. The new pass preserves that visual identity while giving each section a clearer purpose.

Section categories: hero; how-it-works scroll story; product detail; interactive reader guide; author feature; signup call-to-action; audio feature; video feature; FAQ; contact/footer.

## Critical

None observed. The book and the primary action were identifiable, and the page remained navigable.

## Major

### 1. Reading copy and controls became microtype on phones

**Where:** `.hero-copy .intro`, `.hero-copy .button`, `.theme-grid p`, `.chapter form label`, `.faq summary`.

**Violates:** typography.md, Type scale / Fonts; hierarchy.md, Emphasis comes from more than size; spacing.md, Responsive sizing.

**Why it matters:** the 390px browser capture measured 12px introductory copy and 10px primary-button text beside a 68px headline. Other prose fell to 12–13px. The hierarchy relied too heavily on extremes of size.

**Fix applied:** prose now uses 16px on phones, the hero lead uses 18px on desktop, and actions/field labels use 14px. Metadata generally uses 12px. The phone hero scales to roughly 51.5px at 390px, with more natural leading. At 320px its primary CTA remains in the first screen.

### 2. Display type and heading sizes lacked distinct roles

**Where:** hero, section titles, theme titles, signup heading and chat heading across `site.css` and `cinematic.css`.

**Violates:** typography.md, Fonts / Type scale / Line height; consistency.md, A system, not one-offs.

**Why it matters:** regular Instrument Serif and numerous local overrides produced a thin display treatment across large and compact headings, with mobile section titles nearly as large as the hero. Later overrides made the intended scale hard to maintain.

**Fix applied:** old font overrides were removed from the layout styles. `typography.css` now defines the roles in one place: EB Garamond for Roman serif headings and quotations, Source Sans 3 for reading and controls, with real medium/semibold weights. Section and card headings have separate sizes and leading. Font files are served locally, with licenses retained. Sources: [EB Garamond](https://fonts.google.com/specimen/EB+Garamond), [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3), [EB Garamond license](https://raw.githubusercontent.com/google/fonts/main/ofl/ebgaramond/OFL.txt), [Source Sans 3 license](https://raw.githubusercontent.com/google/fonts/main/ofl/sourcesans3/OFL.txt).

### 3. Repeated showcases and promotional blocks diluted the story

**Where:** announcement, ribbon, hero author note, third cover display, portrait badge, quote card, closing CTA and overlapping FAQ answers.

**Violates:** landing-page.md, Section rhythm; hierarchy.md, One focal point per view; consistency.md, Accents are used sparingly.

**Why it matters:** the author motto appeared three times, the cover had three full presentations before the audio edition, and several adjacent sections repeated the chapter invitation. These blocks lengthened the visit without adding a new idea.

**Fix applied:** one author quotation remains. The third cover display became a book detail and interactive paper panel. Promotional strips, the duplicate quote card, portrait badge and separate closing pitch were removed. The trailer is one editorial section, and FAQ now contains two distinct answers. Necessary header, hero, form and mobile navigation actions remain.

### 4. A legacy audio caption override weakened dark-theme readability

**Where:** `.audio-platform-note`.

**Violates:** color.md, Contrast; consistency.md, A system, not one-offs.

**Why it matters:** a legacy important declaration forced 10px brown text onto the navy audio surface, overriding the new theme. Against the base `#101e2f` surface its approximate contrast was 3.26:1.

**Fix applied:** the important override was removed; the caption now uses the shared 12px metadata role and a lighter blue-tinted neutral.

## Minor

### 5. Small decorative layers needed consolidation

**Where:** the signup form’s tape accent and the new paper flap; repeated hero cover captions and orbit text.

**Violates:** surfaces.md, Separation without clutter; consistency.md, Accents are used sparingly.

**Why it matters:** overlapping motifs competed with the book cover and made the form feel assembled from separate effects.

**Fix applied:** tape and duplicate cover labels were removed. A single paper flap and focus underline now support the letter motif.

## What is working

- The real cover and the navy/gold atmospheric art remain the visual anchor.
- The scroll story turns the book and opens the doorway through three source-grounded ideas.
- The primary chapter action stays distinct from buying, watching and asking the book guide.

## Animation Design

| Moment | Trigger and motion | Duration | Purpose and fallback |
|---|---|---|---|
| Book themes as a page | Native disclosure opens; shallow page rotation/translation and edge accent | 420ms | Reveal the existing overview; immediate when motion is reduced or paused |
| Reader cloudbreak | Theme click or arrow-key selection parts inert veils and warms light behind text | 450ms | Connect the chosen topic with discovery; text stays readable throughout |
| Reader letter | One viewport entry opens an inert flap; first field focus draws a baseline | 500ms / 220ms | Support the existing local name personalization; fields are always available |

The existing 3D scroll scene and decorative audio waveform retain their pause, offscreen and reduced-motion behavior. No new continuous animation loop or animation library was added.

## Web Development

Changes are in `content/site.html`, `public/typography.css`, `public/fonts.css`, `public/editorial-layout.css`, `public/discovery.js`, `public/discovery.css` and the existing page styles/interaction event wiring. The existing server-side chat, signup destination, retailer links, social logos and Opus Publishing credit remain. Font licenses are included in `public/assets/fonts/`.

## UX Design

Browser verification covered 1280px desktop, 390px phone and 320px narrow phone layouts, menu navigation, native disclosure, keyboard theme selection, personalized form heading and the shared pause control. The chat composer also fits at 320×360 with its compact layout. No signup or purchase was submitted. A full accessibility compliance audit and an actual OS reduced-motion change were not performed.

## Visual Storytelling

The cover supplies the visual vocabulary: storm, doorway, light and a closer look. The page now moves from that question to a scroll journey, an opening overview of the book’s themes, a personal reading choice, the writer, a reader’s letter and listening/watching routes. New motion uses the same vocabulary at a decision or disclosure rather than adding unrelated floating decorations. No new book passages, reviews or claims about the private upcoming project were invented.

## Performance Optimization

Three Latin variable WOFF2 files total 121,148 bytes. The Roman and reading faces are preloaded; the italic face is loaded when needed. They replace remote font CSS requests. New interaction code is 7,625 bytes before compression and has no idle rendering loop. Inert layers use transform/opacity, cancel on hidden tabs or pause, and settle to readable states. Syntax, CSS parsing, content, asset/font checks and mocked chatbot validation passed. Browser checks confirmed the selected theme state, opened native page, one letter flap, personalization and pause behavior. Isolated behavior checks also covered cancellation and reduced motion.

The production build also passed after the browser checks. Core Web Vitals, frame rate and throttled-device performance were not measured. They are not claimed results.

## Next step

Review the refinement on the existing public Site using the same short link.

## Five-Discipline Acceptance Check

| Discipline | Status | Evidence |
|---|---|---|
| Animation Design | Pass | Three purposeful interactions, existing coordinator, pause and reduced-motion handling |
| Web Development | Pass | Working HTML/CSS/JS, valid assets/fonts and content checks; production build passed |
| UX Design | Pass | Desktop/phone layouts, disclosure, keyboard selection, form focus, compact chat |
| Visual Storytelling | Pass | Book-derived page, cloudbreak and letter motifs; redundant sections removed |
| Performance Optimization | Pass | Local WOFF2, no heavy runtime, bounded native motion; field metrics not verified |
