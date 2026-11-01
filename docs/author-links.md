# Gabriel's connected pages

## Public sources checked

- Author and free-chapter page: https://gabriel-pollard.kit.com/4d3a077d86
- Geepoll Bookstore: https://app.revvue.co/w/geepoll-bookstore

Both pages loaded in the browser. The author page links to the bookstore in two places. Its subscription form posts to `https://app.kit.com/forms/10059322/subscriptions`, which matches this website's existing chapter form. No real subscription was submitted during verification.

## Connections added

- Header Bookstore link and book-section bookstore link.
- Reader-page link beneath the free-chapter form.
- More from Gabriel cards for both existing pages in the contact section.
- LinkedIn with its logo: https://www.linkedin.com/in/gabriel-p-22452642b/ (provided directly by the user).
- Reading companion navigation to the public page and social-link area.

Existing Amazon, Barnes & Noble, ElevenReader, Goodreads, Instagram, TikTok, Facebook, YouTube and email routes remain. The bookstore's LinkedIn URL pointed to account settings, so that destination was replaced with the supplied public profile. Its YouTube link used a relative URL; the author website retains its direct YouTube destination instead.

The two new page cards were clicked in local browser QA and opened the expected external URLs. Desktop and 320px mobile review showed no horizontal overflow. The page links are standard anchors with descriptive names, keyboard focus support and `noopener` for new tabs.

The research document supplied broad author-website recommendations rather than a verified directory of Gabriel's pages. This update uses his two actual public pages and the user-confirmed LinkedIn URL, without inventing a blog or unpublished book pages.

## Integrated page panel

Three interactive buttons open an on-site dialog: Explore bookstore, Get the free chapter and Follow Gabriel. The header Bookstore link also opens the store panel on an ordinary click; its external href remains usable without JavaScript and with modified clicks. Direct page cards remain external anchors.

The bookstore panel provides the book artwork, official bookstore, Amazon, Barnes & Noble and audiobook destinations. The reader panel temporarily hosts the same existing signup form, preserving its input handlers and verified Kit action. A layout placeholder preserves its original place. Switching away or closing restores the form; there are no duplicate field IDs. The follow panel uses the six existing verified/supplied social links and their logos.

Animation Design: A finite 240ms panel transition respects pause, reduced motion and page visibility. Web Development: native dialog, semantic tabs and keyboard navigation; no iframe or new library. UX Design: desktop and 320px mobile QA verified opening, arrow-key tab switching, Escape, required-field validation, preserved name personalization and form restoration. A sticky dialog header keeps Close accessible while scrolling. Visual Storytelling: the book remains the central object, with reader and social actions next to it. Performance Optimization: existing artwork and icons are reused; no extra animation loop. Field performance metrics were not measured.

No real newsletter subscription was submitted during testing. Native input validation was exercised with empty fields. These are integrated navigation and signup controls; the external bookstore checkout and reader page remain on their own services.
