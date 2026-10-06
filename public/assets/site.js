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

  const requestedService = new URLSearchParams(location.search).get('service');
  if (requestedService) {
    document.querySelectorAll('[data-enquiry-form] select[name="service"]').forEach((select) => {
      const option = [...select.options].find((item) => item.value === requestedService || item.textContent.trim() === requestedService);
      if (option) select.value = option.value;
    });
  }

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