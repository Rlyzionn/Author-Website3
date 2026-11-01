(() => {
  'use strict';

  function initializeDiscovery() {
    const root = document.documentElement;
    const preference = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };
    let coordinatorPaused = root.classList.contains('motion-paused');
    const animations = new Set();
    const paused = () => coordinatorPaused || preference.matches || document.hidden;

    function play(element, frames, options, onSettled) {
      if (paused() || !element || typeof element.animate !== 'function') {
        if (onSettled) onSettled();
        return null;
      }
      const animation = element.animate(frames, { ...options, fill: 'none' });
      const record = { animation, element, settle: onSettled };
      animations.add(record);
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        animations.delete(record);
        if (onSettled) onSettled();
      };
      animation.addEventListener('finish', settle, { once: true });
      animation.addEventListener('cancel', settle, { once: true });
      record.cancel = () => { animation.cancel(); settle(); };
      return record;
    }

    function cancelWhere(predicate) {
      [...animations].forEach(record => { if (predicate(record.element)) record.cancel(); });
    }

    function decoration(className) {
      const layer = document.createElement('span');
      layer.className = className;
      layer.setAttribute('aria-hidden', 'true');
      return layer;
    }

    // Each visual anchor has one entrance. Body text and controls never wait.
    const entranceObservers = [];
    const entrancePending = new Map();
    function onEntrance(anchor, run) {
      if (!anchor) return;
      let entered = false;
      let observer;
      const enter = () => {
        if (entered || document.hidden) return;
        entered = true;
        entrancePending.delete(anchor);
        anchor.dataset.chapterArrival = paused() ? 'static' : 'revealed';
        if (!paused()) run();
      };
      entrancePending.set(anchor, enter);
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) enter();
          else if (entered) cancelWhere(element => anchor.contains(element));
        }), { threshold: .08 });
        observer.observe(anchor);
        entranceObservers.push(observer);
      } else {
        anchor.dataset.chapterArrival = 'static';
        entrancePending.delete(anchor);
      }
    }
    const entranceEase = 'cubic-bezier(.22,.68,.2,1)';
    function partClouds(anchor, duration, hero = false) {
      if (!anchor) return;
      anchor.classList.add('arrival-surface');
      const left = decoration('arrival-cloud arrival-cloud-left');
      const right = decoration('arrival-cloud arrival-cloud-right');
      anchor.append(left, right);
      onEntrance(anchor, () => {
        const mobile = window.innerWidth <= 720;
        const distance = hero ? (mobile ? 30 : 44) : 25;
        const opacity = hero ? (mobile ? .62 : .84) : .42;
        play(left, [
          { opacity, transform: 'translate3d(0,0,0) scale(1.08)' },
          { opacity: .35, offset: .42, transform: `translate3d(-${distance * .35}%, -3%, 0) scale(1.12)` },
          { opacity: 0, transform: `translate3d(-${distance}%, -8%, 0) scale(1.18)` }
        ], { duration, easing: entranceEase });
        play(right, [
          { opacity, transform: 'translate3d(0,0,0) scaleX(-1)' },
          { opacity: .3, offset: .42, transform: `translate3d(${distance * .35}%, 2%, 0) scaleX(-1)` },
          { opacity: 0, transform: `translate3d(${distance}%, 7%, 0) scaleX(-1)` }
        ], { duration, easing: entranceEase });
        if (hero) {
          const cover = anchor.querySelector('.volume-front');
          play(cover, [{ opacity: .45 }, { opacity: 1 }], { duration: 950, easing: entranceEase });
          const light = anchor.querySelector('.cover-reveal-light');
          play(light, [
            { opacity: 0, transform: 'translateZ(19px) translateX(-60%)' },
            { opacity: .65, offset: .4, transform: 'translateZ(19px) translateX(0)' },
            { opacity: 0, transform: 'translateZ(19px) translateX(60%)' }
          ], { duration: 1000, delay: 300, easing: entranceEase });
        }
      });
    }
    const heroEntrance = document.querySelector('.cinematic-hero');
    const heroBook = document.querySelector('.portal-book');
    if (heroBook) {
      const shine = decoration('cover-reveal-light');
      shine.style.setProperty('--cover-sweep', '0%');
      shine.style.setProperty('--cover-shine', '1');
      shine.style.opacity = '0';
      heroBook.append(shine);
    }
    partClouds(heroEntrance, 1700, true);
    partClouds(document.querySelector('.story-stage'), 1100);
    partClouds(document.querySelector('.author-scene'), 1000);

    function lightPass(anchor, duration) {
      if (!anchor) return;
      anchor.classList.add('arrival-surface');
      const glint = decoration('arrival-glint');
      anchor.append(glint);
      onEntrance(anchor, () => play(glint, [
        { opacity: 0, transform: 'translateX(-25%) scaleX(.5)' },
        { opacity: .8, offset: .42, transform: 'translateX(0) scaleX(1)' },
        { opacity: 0, transform: 'translateX(25%) scaleX(.5)' }
      ], { duration, easing: entranceEase }));
    }
    lightPass(document.querySelector('.book-reading'), 850);
    lightPass(document.querySelector('.video-link'), 750);
    for (const selector of ['.chapter', '.faq', '.contact']) {
      const section = document.querySelector(selector);
      if (!section) continue;
      section.classList.add('arrival-surface');
      const rule = decoration('arrival-rule');
      section.append(rule);
      onEntrance(section, () => play(rule, [
        { opacity: 0, transform: 'scaleX(.05)' },
        { opacity: .9, offset: .65, transform: 'scaleX(.8)' },
        { opacity: 0, transform: 'scaleX(1)' }
      ], { duration: selector === '.chapter' ? 800 : 650, easing: entranceEase }));
    }
    const soundRings = document.querySelector('.sound-sculpture');
    onEntrance(document.querySelector('.audio-artwork'), () => play(soundRings, [
      { opacity: 0, transform: 'perspective(1000px) scale(.6) rotateY(-30deg)' },
      { opacity: 1, transform: 'perspective(1000px) scale(1) rotateY(0)' }
    ], { duration: 900, easing: entranceEase }));

    // A native disclosure opens an actual page of the book's existing contents.
    const contents = document.querySelector('#books details.synopsis');
    if (contents) {
      const list = contents.querySelector('ul');
      if (list) {
        const sheet = document.createElement('div');
        sheet.className = 'discovery-page-sheet';
        contents.insertBefore(sheet, list);
        sheet.append(decoration('discovery-page-edge'), list);
        contents.dataset.discoveryContents = contents.open ? 'open' : 'closed';
        contents.addEventListener('toggle', () => {
          cancelWhere(element => element === sheet);
          contents.dataset.discoveryContents = contents.open ? 'open' : 'closed';
          if (!contents.open) return;
          play(sheet, [
            { opacity: .72, transform: 'perspective(900px) translateX(10px) rotateY(-5deg)' },
            { opacity: 1, transform: 'perspective(900px) translateX(0) rotateY(0)' }
          ], { duration: 420, easing: 'cubic-bezier(.22,.68,.2,1)' });
        });
      }
    }

    // Light and veils sit behind the selected theme. No readable text is masked.
    const theme = document.querySelector('#reader-guide .theme-grid');
    let themeSerial = 0;
    if (theme) {
      theme.classList.add('discovery-theme-surface');
      const light = decoration('discovery-theme-layer discovery-theme-light');
      const left = decoration('discovery-theme-layer discovery-theme-veil-left');
      const right = decoration('discovery-theme-layer discovery-theme-veil-right');
      theme.prepend(light, left, right);
      const initialTab = document.querySelector('#reader-guide [role="tab"][aria-selected="true"]');
      theme.dataset.discoveryTheme = initialTab ? initialTab.dataset.theme || '0' : '0';
      theme.dataset.discoveryState = 'settled';

      onEntrance(theme, () => {
        play(left, [{ opacity: .48, transform: 'translateX(15px)' }, { opacity: .12, transform: 'translateX(-18px)' }], { duration: 800, easing: entranceEase });
        play(right, [{ opacity: .48, transform: 'translateX(-15px)' }, { opacity: .12, transform: 'translateX(18px)' }], { duration: 800, easing: entranceEase });
        play(light, [{ opacity: .08, transform: 'scaleX(.5)' }, { opacity: .35, transform: 'scaleX(1.08)' }], { duration: 800, easing: entranceEase });
      });

      document.addEventListener('bookthemechange', event => {
        const index = Number(event.detail && event.detail.index);
        if (!Number.isInteger(index) || index < 0 || index > 2) return;
        const serial = ++themeSerial;
        cancelWhere(element => element === light || element === left || element === right);
        theme.dataset.discoveryTheme = String(index);
        theme.dataset.discoveryState = paused() ? 'static' : 'illuminating';
        const finish = () => {
          if (serial === themeSerial) theme.dataset.discoveryState = paused() ? 'static' : 'settled';
        };
        play(left, [
          { opacity: .42, transform: 'translateX(4px)' },
          { opacity: .12, transform: 'translateX(-18px)' }
        ], { duration: 450, easing: 'cubic-bezier(.22,.68,.2,1)' });
        play(right, [
          { opacity: .4, transform: 'translateX(-4px)' },
          { opacity: .12, transform: 'translateX(18px)' }
        ], { duration: 450, easing: 'cubic-bezier(.22,.68,.2,1)' });
        play(light, [
          { opacity: .16, transform: 'scaleX(.76)' },
          { opacity: .6, transform: 'scaleX(1)', offset: .55 },
          { opacity: .35, transform: 'scaleX(1.08)' }
        ], { duration: 450, easing: 'cubic-bezier(.22,.68,.2,1)' }, finish);
      });
    }

    // Only the flap moves; the actual form and its controls stay fully available.
    const form = document.querySelector('#free-chapter form');
    let letterOpened = false;
    let letterObserver;
    let openLetter;
    if (form) {
      form.classList.add('discovery-letter');
      const flap = decoration('discovery-letter-flap');
      form.prepend(flap);
      const title = form.querySelector('#signup-title');
      if (title) title.classList.add('discovery-letter-heading');
      form.dataset.discoveryLetter = 'ready';
      form.dataset.discoveryWriting = 'false';
      form.addEventListener('focusin', () => {
        form.classList.add('discovery-writing');
        form.dataset.discoveryWriting = 'true';
      });

      openLetter = () => {
        if (letterOpened || document.hidden) return;
        letterOpened = true;
        if (letterObserver) letterObserver.unobserve(form);
        form.dataset.discoveryLetter = paused() ? 'static' : 'opening';
        play(flap, [
          { opacity: .3, transform: 'translateY(12px) rotateX(-65deg)' },
          { opacity: .72, transform: 'translateY(0) rotateX(0)' }
        ], { duration: 500, easing: 'cubic-bezier(.22,.68,.2,1)' }, () => {
          form.dataset.discoveryLetter = paused() ? 'static' : 'opened';
        });
      };

      if ('IntersectionObserver' in window) {
        letterObserver = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) openLetter();
        }, { threshold: .18 });
        letterObserver.observe(form);
      } else {
        // Static, fully open paper is a useful fallback without another scroll handler.
        letterOpened = true;
        form.dataset.discoveryLetter = 'static';
      }
    }

    function settleMotion() {
      if (!paused()) return;
      cancelWhere(() => true);
      if (theme) theme.dataset.discoveryState = 'static';
      if (form && letterOpened) form.dataset.discoveryLetter = 'static';
    }
    document.addEventListener('cinematicmotionchange', event => {
      coordinatorPaused = Boolean(event.detail && event.detail.paused);
      settleMotion();
    });
    if (preference.addEventListener) preference.addEventListener('change', settleMotion);
    else if (preference.addListener) preference.addListener(settleMotion);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) settleMotion();
      else if (form && !letterOpened && openLetter) {
        const rect = form.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) openLetter();
      }
      if (!document.hidden) entrancePending.forEach((enter, anchor) => {
        const rect = anchor.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) enter();
      });
    });
    window.addEventListener('pagehide', () => cancelWhere(() => true));
    settleMotion();
    root.dataset.discoveryReady = 'true';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeDiscovery, { once: true });
  else initializeDiscovery();
})();
