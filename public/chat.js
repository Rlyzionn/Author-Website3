(() => {
  'use strict';
  const dialog = document.getElementById('reading-chat');
  const launcher = document.querySelector('.chat-launcher');
  if (!dialog || !launcher || typeof dialog.showModal !== 'function') return;
  const form = dialog.querySelector('.chat-form');
  const input = document.getElementById('chat-question');
  const submit = form.querySelector('button');
  const messages = dialog.querySelector('.chat-messages');
  const suggestions = dialog.querySelector('.chat-suggestions');
  const status = dialog.querySelector('.chat-status');
  const greeting = messages.innerHTML;
  const allowedActions = new Set(['#audio', '#books', '#contact', '#about', '#free-chapter', '#reader-guide']);
  let history = [];
  let pending = false;
  let activeController;
  let lastFocus;

  function viewport() {
    const view = window.visualViewport;
    const height = view ? view.height : innerHeight;
    dialog.style.setProperty('--chat-height', `${height}px`);
    dialog.style.setProperty('--chat-offset', `${view ? view.offsetTop : 0}px`);
    dialog.classList.toggle('chat-compact', height < 480);
  }
  function openChat() {
    if (dialog.open) { input.focus(); return; }
    lastFocus = document.activeElement;
    viewport();
    dialog.showModal();
    launcher.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('chat-open');
    window.visualViewport?.addEventListener('resize', viewport);
    window.visualViewport?.addEventListener('scroll', viewport);
    addEventListener('resize', viewport);
    if (dialog.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) dialog.animate([{ opacity: .7, transform: 'translateY(12px) scale(.985)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 230, easing: 'ease-out' });
    input.focus({ preventScroll: true });
  }
  launcher.addEventListener('click', openChat);
  launcher.hidden = false;
  dialog.querySelector('.chat-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    launcher.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('chat-open');
    window.visualViewport?.removeEventListener('resize', viewport);
    window.visualViewport?.removeEventListener('scroll', viewport);
    removeEventListener('resize', viewport);
    if (lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  function scrollMessages() { messages.scrollTop = messages.scrollHeight; }
  function addMessage(role, text, actions = []) {
    const item = document.createElement('div');
    item.className = `chat-message ${role}`;
    const speaker = document.createElement('span');
    speaker.className = 'chat-speaker';
    speaker.textContent = role === 'user' ? 'You' : 'Your reading companion';
    const paragraph = document.createElement('p');
    paragraph.textContent = text.replace(/[\u2014\u2013]/g, ', ');
    item.append(speaker, paragraph);
    const validActions = actions.filter(action => action && typeof action.label === 'string' && allowedActions.has(action.href)).slice(0, 2);
    if (validActions.length) {
      const links = document.createElement('div');
      links.className = 'chat-actions';
      validActions.forEach(action => {
        const link = document.createElement('a');
        link.href = action.href;
        link.textContent = action.label;
        link.addEventListener('click', () => {
          dialog.close();
          const target = document.querySelector(action.href);
          if (target) requestAnimationFrame(() => {
            target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
            const focusTarget = action.href === '#free-chapter' ? document.getElementById('first_name') : target.querySelector('a,button,summary');
            focusTarget?.focus({ preventScroll: true });
          });
        });
        links.append(link);
      });
      item.append(links);
    }
    messages.append(item);
    scrollMessages();
  }
  async function sendQuestion(question) {
    const text = question.trim();
    if (!text || pending) return;
    if (text.length > 1200) { status.textContent = 'Please keep your question under 1,200 characters.'; return; }
    pending = true;
    submit.disabled = true;
    input.value = '';
    suggestions.hidden = true;
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    history = history.slice(-9);
    while (history.length > 1 && history.reduce((size, message) => size + message.content.length, 0) > 6500) history.splice(0, 2);
    status.textContent = 'Finding a little guidance…';
    activeController = new AbortController();
    const controller = activeController;
    const timeout = setTimeout(() => controller.abort(), 28000);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }), signal: controller.signal });
      const result = await response.json();
      if (!response.ok || typeof result.reply !== 'string') throw new Error(result.error || 'I couldn’t finish that reply. Please try again.');
      history.push({ role: 'assistant', content: result.reply.slice(0, 1600) });
      addMessage('assistant', result.reply, Array.isArray(result.actions) ? result.actions : []);
      status.textContent = '';
    } catch (error) {
      if (controller !== activeController) return;
      status.textContent = error.name === 'AbortError' ? 'That reply took too long. Please try again.' : error.message || 'Please try again in a moment.';
    } finally {
      clearTimeout(timeout);
      if (controller === activeController) { pending = false; submit.disabled = false; activeController = null; }
    }
  }
  form.addEventListener('submit', event => { event.preventDefault(); sendQuestion(input.value); });
  suggestions.querySelectorAll('button').forEach(button => button.addEventListener('click', () => sendQuestion(button.textContent)));
  dialog.querySelector('.chat-reset').addEventListener('click', () => {
    activeController?.abort();
    activeController = null;
    history = [];
    pending = false;
    submit.disabled = false;
    messages.innerHTML = greeting;
    suggestions.hidden = false;
    status.textContent = '';
    input.value = '';
    input.focus();
  });
  const themeButton = document.querySelector('.ask-theme');
  if (themeButton) {
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
      const selected = document.querySelector('.theme-nav [aria-selected=true]');
      const topic = ['perspective beyond the headlines', 'prophecy and the days of Noah', 'spiritual discernment and steadier faith'][Number(selected?.dataset.theme || 0)];
      openChat();
      input.value = `How does the book explore ${topic}?`;
      input.focus();
    });
  }
})();
