(() => {
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const drawer = document.querySelector('.quote-drawer');
  const quotePanel = drawer?.querySelector('.quote-panel');
  const openers = document.querySelectorAll('[data-open-quote]');
  const closeBtn = drawer?.querySelector('.quote-close');
  const backdrop = drawer?.querySelector('.quote-backdrop');
  let lastFocus = null;

  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 24);
    const hero = document.querySelector('.hero');
    if (hero) {
      const y = Math.min(window.scrollY * .055, 36);
      hero.style.setProperty('--hero-shift', `${-4 + y / 10}%`);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  menuBtn?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuBtn.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('locked', isOpen);
  });
  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navLinks.classList.remove('open'); menuBtn?.classList.remove('open'); document.body.classList.remove('locked');
  }));

  const openDrawer = () => {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    document.body.classList.add('locked');
    requestAnimationFrame(() => quotePanel?.querySelector('input,select,button')?.focus());
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    document.body.classList.remove('locked');
    lastFocus?.focus?.();
  };
  openers.forEach((button) => button.addEventListener('click', openDrawer));
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); } });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  document.querySelectorAll('.ba').forEach((ba) => {
    const input = ba.querySelector('input');
    const setPosition = () => ba.style.setProperty('--position', `${input.value}%`);
    input?.addEventListener('input', setPosition); setPosition();
  });

  const buildEnquiry = (form) => {
    const data = new FormData(form);
    const parts = [
      'Hi Clean Space — I’d love a quote.',
      `Name: ${data.get('name') || ''}`,
      `Suburb: ${data.get('suburb') || ''}`,
      `Clean: ${data.get('service') || ''}`,
      `Home: ${data.get('home') || ''}`,
      `Preferred timing: ${data.get('timing') || ''}`,
      data.get('message') ? `Notes: ${data.get('message')}` : ''
    ].filter(Boolean);
    return parts.join('\n');
  };

  document.querySelectorAll('[data-enquiry-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = buildEnquiry(form);
      try { await navigator.clipboard.writeText(message); } catch (_) {}
      const success = form.parentElement.querySelector('.quote-success');
      if (success) success.classList.add('show');
      setTimeout(() => window.open('https://www.instagram.com/cleanspaceau/', '_blank', 'noopener,noreferrer'), 250);
    });
  });
})();
