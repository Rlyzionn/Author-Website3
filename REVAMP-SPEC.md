# Gabriel Pollard — A place to pause

Audience: readers seeking a grounded biblical perspective in uncertain times. Main conversion: request the free first chapter through the existing Kit form. Keep the approved midnight, parchment and gold identity, but replace angular presentation with curved media, rounded controls and a more intimate author-led reading experience.

## Animation Design

| Moment | Purpose | Trigger / properties | Timing / sequence | Reduced motion |
|---|---|---|---|---|
| Hero title | Introduce the invitation to read | Load; transform and opacity of title lines only | 600ms ease-out, 70ms stagger | Static full text |
| Book and warm light | Suggest discovering the light within the cover | Load; book rotation/translate settles once; light opacity | 700ms, then still | Static book/light |
| Book inspection | Make a real book feel tangible | Fine-pointer movement; shallow rotateX/Y | 200ms response, 350ms reset | Disabled |
| Reader choices | Connect personal interest to a book theme | Click/keyboard; panel opacity and translate | 220ms; update text immediately | Immediate state change |
| Author / reading sections | Move from book to its human author | Enter viewport once; small translate/opacity | 450ms; content visible before setup | Static content |
| Curved buttons, arrow circles | Confirm an actionable control | Hover/focus/press; arrow translate and button scale | 180ms | Color/focus feedback only |
| Signup name | Make the invitation personal | Input; textContent updates, no animation | Immediate; no storage | Same |
| Mobile chapter shortcut | Keep next action within reach | Hero leaves viewport, signup/footer visibility | 180ms opacity/translate; hidden/inert when inactive | Immediate show/hide |

CTA and form remain fully visible throughout. Native scroll, no forced waiting, no autoplay audio, no continuous decorative loop. Respond to motion preference changes and cancel active animations.

## Web Development

Retain buildless HTML/CSS/JS and existing source hosting. Consolidate three overlapping stylesheets into one token-based stylesheet. Replace unnecessary GSAP reveal runtime with native Web Animations and feature-detected IntersectionObserver. All chapter themes and mobile navigation are accessible before enhancement; JS adds tab semantics only once ready. Keep original retailer, audiobook, trailer, contact and Kit endpoints.

## UX Design

First screen: author identity, invitation, book, free-chapter CTA. Reader-interest choices provide three grounded entry points with matching chapter material. Use pill controls, generous target sizes, rounded photo/book panels and visible focus rings. Add honest, source-based author voice and retain the complete biography. Do not fabricate reviews or imply live audiobook playback locally.

## Visual Storytelling

1. Hook — a personal invitation from Gabriel; title settles while the free-chapter action is available.
2. Context — show the real book and the questions it explores.
3. Discovery — reader chooses perspective, patterns or discernment; corresponding verified theme appears.
4. Human connection — supplied portrait and Gabriel's own words explain the writing's personal foundation.
5. Resolution — personalized free-chapter invitation, followed by listening/media/FAQ and a final chapter CTA.

## Performance Optimization

No added libraries. Remove the 73KB GSAP dependency from the page, combine CSS and JS, create responsive WebP portrait/cover/media variants, set intrinsic dimensions and lazy loading below the fold, prioritize the hero cover, and reserve media aspect ratios. Transform/opacity motion only; observers pause/finish once; no perpetual requestAnimationFrame loop. Targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 field p75. These scores are unmeasured until actual evidence is available; verify asset sizes, syntax, browser behavior and responsive layout separately.

## Five-Discipline Acceptance Check

Pending implementation and browser verification. Results will be recorded in the output report.
