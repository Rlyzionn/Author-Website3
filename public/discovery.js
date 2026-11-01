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
    });
    window.addEventListener('pagehide', () => cancelWhere(() => true));
    settleMotion();
    root.dataset.discoveryReady = 'true';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeDiscovery, { once: true });
  else initializeDiscovery();
})();
