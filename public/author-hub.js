(() => {
  'use strict';
  function initializeHub() {
    const hub = document.getElementById('author-hub');
    if (!hub || typeof hub.showModal !== 'function') return;
    const tabs = [...hub.querySelectorAll('[data-hub-tab]')];
    const signup = document.querySelector('.chapter form');
    const slot = hub.querySelector('.hub-reader-form');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let placeholder, entrance;
    function restoreForm() {
      if (!placeholder) return;
      placeholder.replaceWith(signup);
      placeholder = null;
    }
    function select(key, focus = false) {
      if (!tabs.some(tab => tab.dataset.hubTab === key)) key = 'store';
      if (key === 'reader' && signup && !placeholder) {
        placeholder = document.createElement('div');
        placeholder.className = 'hub-form-placeholder';
        placeholder.style.height = `${signup.getBoundingClientRect().height}px`;
        signup.before(placeholder);
        slot.append(signup);
      } else if (key !== 'reader') restoreForm();
      tabs.forEach(tab => {
        const active = tab.dataset.hubTab === key;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
        if (active && focus) tab.focus();
      });
      hub.dataset.activePage = key;
      entrance?.cancel();
      if (!reduced.matches && !document.documentElement.classList.contains('motion-paused') && !document.hidden) {
        entrance = document.getElementById(`hub-panel-${key}`).animate([
          { opacity: .5, transform: 'translateY(7px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 240, easing: 'ease-out' });
      }
    }
    document.querySelectorAll('[data-open-hub]').forEach(trigger => {
      trigger.hidden = false;
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', 'author-hub');
      trigger.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        select(trigger.dataset.openHub);
        document.querySelectorAll('dialog[open]').forEach(dialog => { if (dialog !== hub) dialog.close(); });
        if (!hub.open) hub.showModal();
        document.documentElement.classList.add('hub-open');
        tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.focus();
      });
    });
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.hubTab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); select(tabs[next].dataset.hubTab, true); }
      });
    });
    hub.querySelectorAll('[data-hub-switch]').forEach(button => button.addEventListener('click', () => select(button.dataset.hubSwitch, true)));
    document.querySelectorAll('.socials>a').forEach(link => hub.querySelector('.hub-social-grid').append(link.cloneNode(true)));
    hub.querySelector('.hub-close').addEventListener('click', () => hub.close());
    hub.addEventListener('close', () => {
      restoreForm();
      entrance?.cancel();
      document.documentElement.classList.remove('hub-open');
    });
    document.addEventListener('cinematicmotionchange', event => { if (event.detail?.paused) entrance?.cancel(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) entrance?.cancel(); });
    reduced.addEventListener?.('change', () => { if (reduced.matches) entrance?.cancel(); });
    window.addEventListener('pagehide', () => { if (hub.open) hub.close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeHub, { once: true });
  else initializeHub();
})();
