(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const activeAnimations = new Set();
  function animate(element, frames, options) {
    if (motion.matches || document.documentElement.classList.contains('motion-paused') || !element || !element.animate) return;
    const animation = element.animate(frames, options);
    activeAnimations.add(animation);
    animation.addEventListener('finish', () => activeAnimations.delete(animation), { once: true });
    animation.addEventListener('cancel', () => activeAnimations.delete(animation), { once: true });
    return animation;
  }

  // Navigation is visible without JavaScript. Only collapse it after handlers exist.
  const menu = document.getElementById('menu');
  const nav = document.getElementById('navigation');
  function closeMenu(returnFocus = false) {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.documentElement.classList.add('enhanced');

  // Every chapter theme exists in static HTML. Enhance into a keyboard tablist.
  const guide = document.getElementById('reader-guide');
  const tablist = guide.querySelector('.theme-nav');
  const tabs = [...tablist.querySelectorAll('button')];
  const panels = tabs.map((_, i) => document.getElementById(`theme-panel-${i}`));
  const invitations = [
    'Looking for perspective? Begin by seeing beyond the headlines.',
    'Curious about prophecy? Begin with the patterns in Scripture.',
    'Seeking steadier faith? Begin with spiritual discernment.'
  ];
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-orientation', 'vertical');
  tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
  });
  function selectTheme(index, focus = false, withMotion = true) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    guide.querySelector('.reader-invitation').textContent = invitations[index];
    if (focus) tabs[index].focus();
    document.dispatchEvent(new CustomEvent('bookthemechange', { detail: { index } }));
    if (withMotion) animate(panels[index], [{ opacity: .55, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTheme(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTheme(next, true); }
    });
  });
  selectTheme(0, false, false);
  tablist.hidden = false;
  guide.classList.add('reader-enhanced');

  // A source-based reflection; native dialog supplies focus containment and Escape.
  const dialog = document.getElementById('reflection-dialog');
  const reflectionTrigger = document.querySelector('.reflection-trigger');
  if (typeof dialog.showModal === 'function') {
    reflectionTrigger.hidden = false;
    reflectionTrigger.addEventListener('click', () => {
      dialog.showModal();
      document.documentElement.classList.add('dialog-open');
      animate(dialog, [{ opacity: .6, transform: 'translateY(16px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 250, easing: 'ease-out' });
    });
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('dialog-open');
    });
    dialog.querySelector('a').addEventListener('click', () => {
      dialog.close();
      requestAnimationFrame(() => document.getElementById('first_name').focus({ preventScroll: true }));
    });
  }

  // Local, ephemeral personalization. Names are never stored or sent before submission.
  const firstName = document.getElementById('first_name');
  const email = document.getElementById('email');
  const signupTitle = document.getElementById('signup-title');
  firstName.addEventListener('input', () => {
    const name = firstName.value.trim().split(/\s+/)[0].slice(0, 24);
    firstName.setCustomValidity(firstName.value && !firstName.value.trim() ? 'Please enter your first name.' : '');
    signupTitle.textContent = name ? `A chapter for you, ${name}.` : 'A chapter, just for you.';
    if (firstName.validity.valid) { firstName.removeAttribute('aria-invalid'); document.getElementById('first-name-error').textContent = ''; }
  });
  [firstName, email].forEach(input => {
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    const validate = () => {
      if (input === firstName) firstName.setCustomValidity(input.value && !input.value.trim() ? 'Please enter your first name.' : '');
      input.setAttribute('aria-invalid', String(!input.validity.valid));
      error.textContent = input.validity.valid ? '' : input === firstName ? 'Please enter your first name.' : input.validity.valueMissing ? 'Please enter your email address.' : 'Please enter an email address, such as you@example.com.';
    };
    input.addEventListener('blur', validate);
    input.addEventListener('invalid', validate);
    input.addEventListener('input', () => { if (input.validity.valid) { input.removeAttribute('aria-invalid'); error.textContent = ''; } });
  });

  // The action stays visible. Only the message and real book settle into place.
  document.querySelectorAll('#hero-title>span').forEach((line, i) => {
    animate(line, [{ opacity: .4, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600, delay: i * 70, easing: 'cubic-bezier(.2,.7,.2,1)' });
  });
  function resetBook() {}

  let revealObserver;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = entry.target.matches('.news-grid>article') && entry.target.previousElementSibling ? 90 : 0;
      animate(entry.target, [{ opacity: .68, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 680, delay, easing: 'cubic-bezier(.22,.68,.2,1)' });
      revealObserver.unobserve(entry.target);
    }), { threshold: .12 });
    document.querySelectorAll('.cover-stage,.split-heading,.portrait,.about blockquote,.chapter>div,.chapter form,.audio-copy h2,.audio-visual,.news-grid>article,.closing h2').forEach(el => revealObserver.observe(el));
  }

  // Decorative waveform: no audio is played here. It rests outside the viewport.
  const soundscape = document.querySelector('.audio-visual');
  const waveToggle = document.querySelector('.wave-toggle');
  let audioVisible = false;
  let userPausedWave = false;
  function updateWave() {
    if (!soundscape || !waveToggle) return;
    const enabled = 'IntersectionObserver' in window && !motion.matches;
    const running = enabled && !document.documentElement.classList.contains('motion-paused') && audioVisible && !document.hidden && !userPausedWave;
    soundscape.classList.toggle('wave-live', running);
    waveToggle.hidden = !enabled;
    waveToggle.querySelector('.wave-control-label').textContent = userPausedWave ? 'Resume motion' : 'Pause motion';
    waveToggle.querySelector('.wave-control-icon').textContent = userPausedWave ? '↻' : 'Ⅱ';
    waveToggle.setAttribute('aria-label', userPausedWave ? 'Resume waveform animation' : 'Pause waveform animation');
  }
  if (soundscape && waveToggle && 'IntersectionObserver' in window) {
    const audioObserver = new IntersectionObserver(entries => {
      audioVisible = entries[0].isIntersecting;
      updateWave();
    }, { threshold: .12 });
    audioObserver.observe(soundscape);
    waveToggle.addEventListener('click', () => { userPausedWave = !userPausedWave; updateWave(); });
    updateWave();
  }

  // Hidden sticky actions are removed from focus order as well as from view.
  const sticky = document.querySelector('.mobile-reader');
  if ('IntersectionObserver' in window) {
    let heroVisible = true, formVisible = false, footerVisible = false, dialogVisible = false;
    const updateSticky = () => {
      const show = !heroVisible && !formVisible && !footerVisible && !dialogVisible;
      const wasHidden = sticky.hidden;
      sticky.hidden = !show;
      sticky.inert = !show;
      sticky.tabIndex = show ? 0 : -1;
      if (show && wasHidden) animate(sticky, [{ opacity: .3, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180, easing: 'ease-out' });
    };
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target.matches('.hero')) heroVisible = entry.isIntersecting;
        if (entry.target.id === 'free-chapter') formVisible = entry.isIntersecting;
        if (entry.target.tagName === 'FOOTER') footerVisible = entry.isIntersecting;
      });
      updateSticky();
    });
    [document.querySelector('.hero'), document.getElementById('free-chapter'), document.querySelector('footer')].forEach(el => visibility.observe(el));
    dialog.addEventListener('toggle', () => { dialogVisible = dialog.open; updateSticky(); });
  }

  function updateMotion() {
    updateWave();
    if (!motion.matches) return;
    activeAnimations.forEach(animation => animation.cancel());
    resetBook();
  }
  document.addEventListener('cinematicmotionchange', event => {
    if (event.detail.paused) activeAnimations.forEach(animation => animation.cancel());
    updateWave();
  });
  if (motion.addEventListener) motion.addEventListener('change', updateMotion);
  else if (motion.addListener) motion.addListener(updateMotion);
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetBook(); updateWave(); });
})();
