(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const drawer = document.querySelector('.quote-drawer');
  const quotePanel = drawer?.querySelector('.quote-panel');
  const closeBtn = drawer?.querySelector('.quote-close');
  const backdrop = drawer?.querySelector('.quote-backdrop');
  const mobileCta = document.querySelector('.mobile-sticky-cta');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastFocus = null;
  let scrollFrame = 0;

  requestAnimationFrame(() => body.classList.add('page-ready'));

  const overlayOpen = () => navLinks?.classList.contains('open') || drawer?.classList.contains('open');
  const syncLock = () => body.classList.toggle('locked', Boolean(overlayOpen()));

  const closeMenu = () => {
    navLinks?.classList.remove('open');
    menuBtn?.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    menuBtn?.setAttribute('aria-label', 'Open menu');
    body.classList.remove('menu-open');
    syncLock();
  };

  menuBtn?.addEventListener('click', () => {
    const isOpen = !navLinks?.classList.contains('open');
    if (isOpen) {
      navLinks?.classList.add('open');
      menuBtn.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Close menu');
      body.classList.add('menu-open');
    } else {
      closeMenu();
    }
    syncLock();
  });

  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const openDrawer = () => {
    if (!drawer) return;
    closeMenu();
    lastFocus = document.activeElement;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    body.classList.add('quote-open');
    syncLock();
    requestAnimationFrame(() => quotePanel?.querySelector('input,select,button')?.focus());
  };

  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    body.classList.remove('quote-open');
    syncLock();
    lastFocus?.focus?.();
  };

  document.querySelectorAll('[data-open-quote]').forEach((button) => button.addEventListener('click', openDrawer));
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (drawer?.classList.contains('open')) closeDrawer();
    else closeMenu();
  });

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: '0px' })
    : null;

  const revealVisibleNow = () => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      const rect = el.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
        observer?.unobserve(el);
      }
    });
  };

  document.querySelectorAll('.reveal').forEach((el) => {
    if (observer) observer.observe(el);
    else el.classList.add('is-visible');
  });

  requestAnimationFrame(revealVisibleNow);

  if (matchMedia('(pointer:fine)').matches && !reducedMotion) {
    document.querySelectorAll('.photo-card, .work-card').forEach((card) => {
      const img = card.querySelector('img');
      if (!img) return;
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        img.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width - .5) * 5}px`);
        img.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height - .5) * 5}px`);
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        img.style.setProperty('--mx', '0px');
        img.style.setProperty('--my', '0px');
      });
    });
  }

  document.querySelectorAll('.ba').forEach((ba) => {
    const input = ba.querySelector('input');
    if (!input) return;
    const setPosition = () => {
      ba.style.setProperty('--position', `${input.value}%`);
      input.setAttribute('aria-valuetext', `${input.value}% after image revealed`);
    };
    input.addEventListener('input', setPosition);
    input.addEventListener('pointerdown', () => ba.classList.add('is-dragging'));
    ['pointerup', 'pointercancel', 'blur'].forEach((eventName) => input.addEventListener(eventName, () => ba.classList.remove('is-dragging')));
    setPosition();
  });

  const updateScrollState = () => {
    scrollFrame = 0;
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 18);

    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    header?.style.setProperty('--scroll-progress', Math.min(y / max, 1));

    const hero = document.querySelector('.hero');
    if (hero && !reducedMotion) {
      hero.style.setProperty('--hero-shift-px', `${Math.min(y * .035, 24)}px`);
    }

    if (mobileCta) {
      const footer = document.querySelector('.site-footer');
      const footerTop = footer?.getBoundingClientRect().top ?? Infinity;
      const shouldShow = window.innerWidth <= 680
        && y > Math.min(window.innerHeight * .52, 420)
        && footerTop > window.innerHeight * .78
        && !overlayOpen();
      body.classList.toggle('show-mobile-cta', shouldShow);
    }
  };

  const onScroll = () => {
    // Reveal synchronously so fast Safari/WebKit scroll sequences cannot skip
    // elements between animation frames.
    revealVisibleNow();
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollState);
  };

  updateScrollState();
  revealVisibleNow();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    revealVisibleNow();
    onScroll();
  }, { passive: true });
  window.addEventListener('pageshow', revealVisibleNow, { passive: true });

  const buildEnquiry = (form) => {
    const data = new FormData(form);
    return [
      'Hi Clean Space — I’d love a quote.',
      `Name: ${data.get('name') || ''}`,
      `Suburb: ${data.get('suburb') || ''}`,
      `Clean: ${data.get('service') || ''}`,
      `Home: ${data.get('home') || ''}`,
      `Preferred timing: ${data.get('timing') || ''}`,
      data.get('message') ? `Notes: ${data.get('message')}` : ''
    ].filter(Boolean).join('\n');
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      const copied = document.execCommand('copy');
      temp.remove();
      return copied;
    } catch (_) {
      return false;
    }
  };

  const renderManualCopy = (success, message, opened) => {
    success.replaceChildren();
    const intro = document.createElement('p');
    intro.textContent = opened
      ? 'Instagram is open, but your browser did not allow automatic copying. Nothing has been sent. Copy the message below and paste it into a DM to @cleanspaceau.'
      : 'Your browser blocked the Instagram window and automatic copying. Nothing has been sent. Copy the message below, then open @cleanspaceau.';
    const textarea = document.createElement('textarea');
    textarea.className = 'manual-copy';
    textarea.readOnly = true;
    textarea.value = message;
    const row = document.createElement('div');
    row.className = 'manual-copy-actions';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'button dark';
    copy.textContent = 'Copy message';
    copy.addEventListener('click', async () => {
      const ok = await copyText(message);
      copy.textContent = ok ? 'Copied' : 'Select and copy';
      if (!ok) {
        textarea.focus();
        textarea.select();
      }
    });
    const instagram = document.createElement('a');
    instagram.className = 'button outline';
    instagram.href = 'https://www.instagram.com/cleanspaceau/';
    instagram.target = '_blank';
    instagram.rel = 'noreferrer';
    instagram.textContent = 'Open Instagram ↗';
    row.append(copy, instagram);
    success.append(intro, textarea, row);
    success.classList.add('show');
  };

  document.querySelectorAll('[data-enquiry-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = buildEnquiry(form);
      const success = form.parentElement.querySelector('.quote-success');
      const opened = window.open('https://www.instagram.com/cleanspaceau/', '_blank');
      try { if (opened) opened.opener = null; } catch (_) {}

      copyText(message).then((copied) => {
        if (!success) return;
        success.replaceChildren();
        if (copied) {
          const text = document.createElement('p');
          text.textContent = opened
            ? 'Enquiry copied. Instagram has opened — paste the message into a DM to @cleanspaceau. Nothing has been sent automatically.'
            : 'Enquiry copied. Your browser blocked the Instagram window — open @cleanspaceau and paste the message. Nothing has been sent automatically.';
          success.appendChild(text);
          if (!opened) {
            const link = document.createElement('a');
            link.className = 'button outline';
            link.href = 'https://www.instagram.com/cleanspaceau/';
            link.target = '_blank';
            link.rel = 'noreferrer';
            link.textContent = 'Open Instagram ↗';
            success.appendChild(link);
          }
          success.classList.add('show');
        } else {
          renderManualCopy(success, message, Boolean(opened));
        }
      });
    });
  });
})();

/* === CLEAN SPACE WOW MOTION PASS === */
(() => {
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  body.classList.add('wow-enhanced');

  const ready = () => body.classList.add('wow-ready');
  if (reduceMotion) {
    ready();
  } else {
    Promise.race([
      document.fonts?.ready || Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 420))
    ]).then(() => requestAnimationFrame(() => requestAnimationFrame(ready)));
  }

  // Add restrained editorial numbering to the major sections.
  document.querySelectorAll('main > .section').forEach((section, index) => {
    section.dataset.sectionIndex = String(index + 1).padStart(2, '0');
  });

  // Label inner-page hero canvases without changing business copy.
  const pageHero = document.querySelector('.page-hero .container');
  if (pageHero) {
    const labels = {
      '/services': '02 / SERVICES',
      '/work': '03 / WORK',
      '/about': '04 / ABOUT',
      '/contact': '05 / CONTACT'
    };
    const path = location.pathname.replace(/\/$/, '') || '/';
    pageHero.dataset.pageLabel = labels[path] || '';
  }

  // One observer powers graphic reveals and clean-sweep image moments.
  const wowTargets = document.querySelectorAll(
    '.section, .photo-card, .work-card, .gallery-item, .about-image, .process-card, .testimonial-stage'
  );
  if ('IntersectionObserver' in window && !reduceMotion) {
    const wowObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('wow-visible');
        wowObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    wowTargets.forEach((el) => wowObserver.observe(el));
  } else {
    wowTargets.forEach((el) => el.classList.add('wow-visible'));
  }

  // A very small parallax/light-follow treatment on pointer devices only.
  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
    let heroFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const paintHero = () => {
      heroFrame = 0;
      hero.style.setProperty('--hero-pointer-x', `${50 + pointerX * 22}%`);
      hero.style.setProperty('--hero-pointer-y', `${46 + pointerY * 16}%`);
      hero.style.setProperty('--hero-mouse-x', `${pointerX * 7}px`);
      hero.style.setProperty('--hero-mouse-y', `${pointerY * 5}px`);
    };
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
      if (!heroFrame) heroFrame = requestAnimationFrame(paintHero);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      pointerX = 0;
      pointerY = 0;
      if (!heroFrame) heroFrame = requestAnimationFrame(paintHero);
    }, { passive: true });
  }

  // Tactile magnetic motion is deliberately limited to primary desktop actions.
  if (window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
    document.querySelectorAll('.hero-actions .button, .nav-cta, .cta-band .button').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * 7;
        const y = ((event.clientY - rect.top) / rect.height - .5) * 5;
        button.style.setProperty('--mag-x', `${x}px`);
        button.style.setProperty('--mag-y', `${y}px`);
      }, { passive: true });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
      }, { passive: true });
    });
  }

  // Desktop gallery can be scrubbed with the mouse; touch keeps native swipe.
  const gallery = document.querySelector('.gallery-track');
  if (gallery && window.matchMedia('(pointer:fine)').matches) {
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    gallery.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startScroll = gallery.scrollLeft;
      gallery.classList.add('is-dragging');
      gallery.setPointerCapture?.(event.pointerId);
    });
    gallery.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      gallery.scrollLeft = startScroll - (event.clientX - startX);
    });
    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      gallery.classList.remove('is-dragging');
      try { gallery.releasePointerCapture?.(event.pointerId); } catch (_) {}
    };
    gallery.addEventListener('pointerup', endDrag);
    gallery.addEventListener('pointercancel', endDrag);
    gallery.addEventListener('lostpointercapture', () => {
      dragging = false;
      gallery.classList.remove('is-dragging');
    });
  }

  // Fast transition veil for actual page changes. Hash jumps, external links and
  // new-tab links are intentionally left native.
  const wipe = document.createElement('div');
  wipe.className = 'page-wipe';
  wipe.setAttribute('aria-hidden', 'true');
  body.appendChild(wipe);

  if (!reduceMotion) {
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      if (url.href === location.href) return;

      event.preventDefault();
      body.classList.add('is-leaving');
      window.setTimeout(() => {
        location.href = url.href;
      }, 220);
    });
  }

  // bfcache / back-swipe should never return to a veiled page.
  window.addEventListener('pageshow', () => {
    body.classList.remove('is-leaving');
    if (!body.classList.contains('wow-ready')) ready();
  });
})();
