(() => {
  'use strict';

  function initializeCinematicStory() {
    const root = document.documentElement;
    const portal = document.querySelector('.portal-scene');
    const story = document.querySelector('.scroll-story');
    const stage = story && story.querySelector('.story-stage');
    const bookDetail = document.querySelector('.book-reading');
    const audioScene = document.querySelector('.audio-visual');
    const authorScene = document.querySelector('.author-scene');
    const beats = story ? [...story.querySelectorAll('.story-beat[data-beat]')] : [];
    const visuals = story ? [...story.querySelectorAll('.story-visual[data-beat]')] : [];
    const toggle = document.querySelector('.motion-toggle');
    const preference = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };
    const scenes = [portal, story, bookDetail, audioScene, authorScene].filter(Boolean);
    const nearbyScenes = new Set();
    let userPaused = false;
    let sleeping = document.hidden;
    let frame = 0;
    let forceNextFrame = false;
    let sceneObserver;

    const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
    const ease = value => value * value * (3 - 2 * value);
    const paused = () => userPaused || preference.matches;

    function setVariables(element, variables) {
      if (!element) return;
      Object.entries(variables).forEach(([name, value]) => {
        const serialized = String(value);
        if (element.style.getPropertyValue(name) !== serialized) element.style.setProperty(name, serialized);
      });
    }

    function findActiveBeat(viewportHeight) {
      if (!story || !beats.length) return null;
      const stageRect = stage ? stage.getBoundingClientRect() : null;
      const focusLine = window.innerWidth <= 760 && stageRect
        ? Math.min(viewportHeight * .8, Math.max(viewportHeight * .5, stageRect.bottom + 64))
        : viewportHeight * .5;
      let nearest = beats[0];
      let nearestDistance = Infinity;

      beats.forEach(beat => {
        const rect = beat.getBoundingClientRect();
        const distance = Math.abs((rect.top + rect.bottom) / 2 - focusLine);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = beat;
        }
      });

      return nearest.dataset.beat;
    }

    function setActiveBeat(selected) {
      if (!story || selected === null) return;
      story.dataset.activeBeat = selected;
      beats.forEach(beat => beat.classList.toggle('is-active', beat.dataset.beat === selected));
      visuals.forEach(visual => {
        const active = visual.dataset.beat === selected;
        visual.classList.toggle('is-active', active);
        if (active) visual.setAttribute('aria-current', 'step');
        else visual.removeAttribute('aria-current');
      });
    }

    function setStaticScenes() {
      const selected = findActiveBeat(window.innerHeight || document.documentElement.clientHeight);
      setVariables(portal, {
        '--hero-turn': '-18deg',
        '--hero-lift': '0px',
        '--hero-cloud-y': '0px',
        '--depth-progress': '.5',
        '--light-strength': '.85'
      });
      setVariables(story, {
        '--journey': '.5',
        '--depth-progress': '.5',
        '--book-turn': '-8deg',
        '--book-lift': '0px',
        '--light-strength': '1'
      });
      setVariables(bookDetail, { '--detail-depth': '.5' });
      setVariables(audioScene, { '--audio-depth': '.5' });
      setVariables(authorScene, { '--author-depth': '.5' });
      if (bookDetail) bookDetail.dataset.depthProgress = '.5';
      if (audioScene) audioScene.dataset.depthProgress = '.5';
      if (authorScene) authorScene.dataset.depthProgress = '.5';
      const state = preference.matches ? 'reduced' : 'paused';
      scenes.forEach(scene => { scene.dataset.motionState = state; });
      setActiveBeat(selected);
    }

    function cancelFrame() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      forceNextFrame = false;
    }

    function updateScenes(force = false) {
      if (sleeping || paused()) return;
      const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight);
      // Collect geometry before style writes, so scroll frames do not interleave
      // inherited custom-property updates with repeated layout measurements.
      const portalRect = portal && (force || nearbyScenes.has(portal)) ? portal.getBoundingClientRect() : null;
      const storyRect = story && (force || nearbyScenes.has(story)) ? story.getBoundingClientRect() : null;
      const detailRect = bookDetail && (force || nearbyScenes.has(bookDetail)) ? bookDetail.getBoundingClientRect() : null;
      const audioRect = audioScene && (force || nearbyScenes.has(audioScene)) ? audioScene.getBoundingClientRect() : null;
      const authorRect = authorScene && (force || nearbyScenes.has(authorScene)) ? authorScene.getBoundingClientRect() : null;
      const selected = storyRect ? findActiveBeat(viewportHeight) : null;

      if (portalRect) {
        const progress = clamp(-portalRect.top / Math.max(portalRect.height, viewportHeight * .7));
        const movement = ease(progress);
        setVariables(portal, {
          '--hero-turn': `${(-18 + movement * 10).toFixed(2)}deg`,
          '--hero-lift': `${(-18 * movement).toFixed(2)}px`,
          '--hero-cloud-y': `${(48 * movement).toFixed(2)}px`,
          '--depth-progress': movement.toFixed(4),
          '--light-strength': (.7 + movement * .25).toFixed(3)
        });
        portal.dataset.motionState = nearbyScenes.has(portal) ? 'running' : 'idle';
      }

      if (storyRect) {
        const progress = clamp(-storyRect.top / Math.max(1, storyRect.height - viewportHeight));
        const movement = ease(progress);
        setVariables(story, {
          '--journey': progress.toFixed(4),
          '--depth-progress': movement.toFixed(4),
          '--book-turn': `${(-35 + movement * 65).toFixed(2)}deg`,
          '--book-lift': `${(18 - movement * 36).toFixed(2)}px`,
          '--light-strength': (.32 + movement * .68).toFixed(3)
        });
        setActiveBeat(selected);
        story.dataset.motionState = nearbyScenes.has(story) ? 'running' : 'idle';
      }
      for (const [element, rect, property] of [[bookDetail, detailRect, '--detail-depth'], [audioScene, audioRect, '--audio-depth'], [authorScene, authorRect, '--author-depth']]) {
        if (!rect) continue;
        const progress = ease(clamp((viewportHeight * .9 - rect.top) / (viewportHeight * .7 + Math.min(rect.height, viewportHeight) * .4)));
        setVariables(element, { [property]: progress.toFixed(4) });
        element.dataset.depthProgress = progress.toFixed(4);
        element.dataset.motionState = nearbyScenes.has(element) ? 'running' : 'idle';
      }
    }

    function requestUpdate(force = false) {
      if (sleeping || paused() || (!force && !nearbyScenes.size)) return;
      forceNextFrame = forceNextFrame || force;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const updateAll = forceNextFrame;
        frame = 0;
        forceNextFrame = false;
        updateScenes(updateAll);
      });
    }

    function updateMotionState() {
      const effectivelyPaused = paused();
      root.classList.toggle('motion-paused', effectivelyPaused);
      root.dataset.motionPaused = String(effectivelyPaused);

      if (toggle) {
        const label = preference.matches ? 'Motion reduced' : userPaused ? 'Resume motion' : 'Pause motion';
        const labelElement = toggle.querySelector('.motion-label, [data-motion-label]');
        if (labelElement) labelElement.textContent = label;
        else toggle.textContent = label;
        toggle.setAttribute('aria-label', label);
        toggle.setAttribute('aria-pressed', String(effectivelyPaused));
        toggle.disabled = Boolean(preference.matches);
        toggle.title = preference.matches
          ? 'Your system preference requests reduced motion.'
          : userPaused ? 'Resume the optional visual motion.' : 'Pause the optional visual motion.';
      }

      if (effectivelyPaused) {
        cancelFrame();
        setStaticScenes();
      } else requestUpdate(true);

      document.dispatchEvent(new CustomEvent('cinematicmotionchange', {
        detail: { paused: effectivelyPaused, reducedMotion: Boolean(preference.matches), userPaused }
      }));
    }

    if (toggle) {
      toggle.addEventListener('click', () => {
        if (preference.matches) return;
        userPaused = !userPaused;
        updateMotionState();
      });
      toggle.hidden = false;
    }

    if ('IntersectionObserver' in window) {
      sceneObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) nearbyScenes.add(entry.target);
          else {
            nearbyScenes.delete(entry.target);
            if (!paused()) entry.target.dataset.motionState = 'idle';
          }
        });
        requestUpdate();
      }, { rootMargin: '180px 0px', threshold: 0 });
      scenes.forEach(scene => sceneObserver.observe(scene));
    } else {
      // The static story is already readable; only enhance transforms on user scroll.
      scenes.forEach(scene => nearbyScenes.add(scene));
    }

    window.addEventListener('scroll', () => requestUpdate(), { passive: true });
    window.addEventListener('resize', () => requestUpdate(true), { passive: true });
    document.addEventListener('visibilitychange', () => {
      sleeping = document.hidden;
      if (sleeping) {
        cancelFrame();
        if (!paused()) scenes.forEach(scene => { scene.dataset.motionState = 'inactive'; });
      } else if (paused()) setStaticScenes();
      else requestUpdate(true);
    });
    window.addEventListener('pagehide', () => { sleeping = true; cancelFrame(); });
    window.addEventListener('pageshow', () => {
      sleeping = document.hidden;
      if (!sleeping) requestUpdate(true);
    });
    if (preference.addEventListener) preference.addEventListener('change', updateMotionState);
    else if (preference.addListener) preference.addListener(updateMotionState);

    root.classList.add('depth-ready');
    updateMotionState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeCinematicStory, { once: true });
  else initializeCinematicStory();
})();
