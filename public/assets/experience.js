
(() => {
  const PHONE_DISPLAY = '0426 379 247';
  const PHONE_E164 = '+61426379247';
  const INSTAGRAM = 'https://www.instagram.com/cleanspaceau/';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const by = (sel, root = document) => root.querySelector(sel);
  const all = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Opening moment: short, clean and only on the homepage.
  if (location.pathname === '/' && !reducedMotion) {
    const intro = document.createElement('div');
    intro.className = 'magic-intro';
    intro.setAttribute('aria-hidden', 'true');
    intro.innerHTML = `
      <div class="magic-intro-inner">
        <div class="magic-intro-mark">Clean Space</div>
        <div class="magic-intro-sub">Let us do the magic</div>
      </div>`;
    document.body.appendChild(intro);
    setTimeout(() => intro.remove(), 1700);
  }

  // Signature thread + restrained sparks.
  const hero = by('.hero');
  if (hero) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'magic-thread');
    svg.setAttribute('viewBox', '0 0 760 700');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
      <defs>
        <linearGradient id="magicGradient" x1="0" x2="1">
          <stop offset="0" stop-color="rgba(255,255,255,0)"/>
          <stop offset=".35" stop-color="#ffffff"/>
          <stop offset=".72" stop-color="#d8bea1"/>
          <stop offset="1" stop-color="rgba(216,190,161,0)"/>
        </linearGradient>
      </defs>
      <path d="M740 62 C 510 32, 640 250, 402 232 S 190 320, 330 410 S 530 530, 160 650"/>
      <circle cx="402" cy="232" r="3.3"/>
      <circle cx="330" cy="410" r="2.5"/>
      <circle cx="160" cy="650" r="3.2"/>
    `;
    hero.appendChild(svg);

    if (!reducedMotion) {
      [
        [79, 24, 0],
        [88, 43, .7],
        [68, 64, 1.4],
        [92, 72, 2.2],
        [61, 34, 3.1]
      ].forEach(([x, y, delay]) => {
        const spark = document.createElement('span');
        spark.className = 'hero-spark';
        spark.style.left = `${x}%`;
        spark.style.top = `${y}%`;
        spark.style.animationDelay = `${delay}s`;
        hero.appendChild(spark);
      });

      if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
        hero.addEventListener('pointermove', (event) => {
          const rect = hero.getBoundingClientRect();
          hero.style.setProperty('--spot-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
          hero.style.setProperty('--spot-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
        }, { passive: true });
      }
    }
  }

  // Small tactile light response on key actions.
  all('.button, .nav-cta, .mobile-sticky-cta').forEach((el) => {
    el.setAttribute('data-magic-hover', '');
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--x', `${event.clientX - rect.left}px`);
      el.style.setProperty('--y', `${event.clientY - rect.top}px`);
    }, { passive: true });
  });

  // Expand useful footer navigation without bloating the primary desktop nav.
  const footerExplore = all('.footer-col').find((col) => /Explore/i.test(col.querySelector('h4')?.textContent || ''));
  if (footerExplore) {
    [
      ['/before-after', 'Before & after'],
      ['/reviews', 'Reviews'],
      ['/faq', 'FAQ']
    ].forEach(([href, label]) => {
      if (!footerExplore.querySelector(`a[href="${href}"]`)) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        footerExplore.appendChild(a);
      }
    });
  }

  const footerEnquire = all('.footer-col').find((col) => /Enquire/i.test(col.querySelector('h4')?.textContent || ''));
  if (footerEnquire && !footerEnquire.querySelector(`a[href="tel:${PHONE_E164}"]`)) {
    const call = document.createElement('a');
    call.href = `tel:${PHONE_E164}`;
    call.textContent = `Call / text ${PHONE_DISPLAY}`;
    footerEnquire.prepend(call);
  }

  // Quote wizard. Only name + phone require typing; all other answers are choices.
  const drawer = by('.quote-drawer');
  const panel = drawer?.querySelector('.quote-panel');
  const close = panel?.querySelector('.quote-close');

  const state = {
    step: 0,
    service: '',
    rhythm: '',
    home: '',
    timing: '',
    name: '',
    phone: ''
  };

  const steps = [
    {
      key: 'service',
      question: 'What would make the biggest difference?',
      hint: 'Pick the closest match. You can keep it simple.',
      choices: [
        ['Regular home care', 'Keep the everyday clean under control.'],
        ['One-off reset', 'A proper refresh when the whole home needs attention.'],
        ['Kitchen + bathroom', 'Focus on the high-use spaces and finishing detail.'],
        ['Not sure yet', 'Choose this and shape the clean together.']
      ]
    },
    {
      key: 'rhythm',
      question: 'How often are you thinking?',
      hint: 'No commitment here — this just helps shape the conversation.',
      choices: [
        ['Just this once', 'One clean, one reset.'],
        ['Weekly', 'Consistent ongoing home care.'],
        ['Fortnightly', 'A regular reset every two weeks.'],
        ['I’m flexible', 'Recommend what makes sense.']
      ]
    },
    {
      key: 'home',
      question: 'What are we cleaning?',
      hint: 'Tap the closest option.',
      choices: [
        ['Apartment / unit', 'Compact home or apartment.'],
        ['1–2 bedroom', 'Smaller house or townhouse.'],
        ['3–4 bedroom', 'Family-sized home.'],
        ['5+ bedroom', 'Larger home.']
      ]
    },
    {
      key: 'timing',
      question: 'When would you like it?',
      hint: 'A rough timeframe is enough.',
      choices: [
        ['As soon as possible', 'I’d like the next suitable opening.'],
        ['This week', 'Ideally within the next few days.'],
        ['Next week', 'Plan it for next week.'],
        ['I’m flexible', 'Timing can work around availability.']
      ]
    }
  ];

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function firstName(value = '') {
    return value.trim().split(/\s+/)[0] || 'there';
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      const ok = document.execCommand('copy');
      temp.remove();
      return ok;
    } catch (_) {
      return false;
    }
  }

  const createWizard = () => {
    if (!panel || !close) return;

    [...panel.children].forEach((child) => {
      if (child !== close) child.remove();
    });

    const wizard = document.createElement('div');
    wizard.className = 'quote-wizard';
    wizard.innerHTML = `
      <div class="quote-wizard-head">
        <div class="kicker">Get a tailored quote</div>
        <h2>Tell us what you need.</h2>
        <div class="quote-progress" aria-label="Quote progress">
          ${Array.from({length: 5}, (_, i) => `<span data-progress="${i}"></span>`).join('')}
        </div>
      </div>
      <div class="quote-stage" aria-live="polite"></div>
      <div class="quote-wizard-foot">
        <button class="wizard-back" type="button">← Back</button>
        <button class="wizard-next" type="button">Continue →</button>
      </div>`;
    panel.appendChild(wizard);

    const stage = by('.quote-stage', wizard);
    const back = by('.wizard-back', wizard);
    const next = by('.wizard-next', wizard);

    const setProgress = () => {
      all('[data-progress]', wizard).forEach((bar, i) => {
        bar.classList.toggle('is-active', i <= Math.min(state.step, 4));
      });
    };

    const renderChoiceStep = (config) => {
      stage.innerHTML = `
        <div class="quote-step is-active" data-step="${state.step}">
          <h3 class="quote-question">${config.question}</h3>
          <p class="quote-hint">${config.hint}</p>
          <div class="choice-grid">
            ${config.choices.map(([label, desc]) => `
              <button type="button" class="choice${state[config.key] === label ? ' is-selected' : ''}" data-choice="${escapeHtml(label)}">
                <strong>${escapeHtml(label)}</strong>
                <small>${escapeHtml(desc)}</small>
              </button>`).join('')}
          </div>
        </div>`;
      next.disabled = !state[config.key];

      all('.choice', stage).forEach((button) => {
        button.addEventListener('click', () => {
          state[config.key] = button.dataset.choice || '';
          all('.choice', stage).forEach((item) => item.classList.toggle('is-selected', item === button));
          next.disabled = false;
          setTimeout(() => {
            if (state.step < 4) {
              state.step += 1;
              render();
            }
          }, 180);
        });
      });
    };

    const renderContactStep = () => {
      stage.innerHTML = `
        <div class="quote-step is-active" data-step="4">
          <h3 class="quote-question">Last thing — how can Clean Space reach you?</h3>
          <p class="quote-hint">Only your name and mobile number. No long form.</p>
          <div class="contact-fields">
            <div class="wizard-field">
              <label for="wizard-name">Your name</label>
              <input id="wizard-name" name="name" autocomplete="name" value="${escapeHtml(state.name)}" placeholder="Name" required>
            </div>
            <div class="wizard-field">
              <label for="wizard-phone">Mobile number</label>
              <input id="wizard-phone" name="phone" autocomplete="tel" inputmode="tel" value="${escapeHtml(state.phone)}" placeholder="04xx xxx xxx" required>
            </div>
          </div>
          <div class="wizard-error" role="alert"></div>
        </div>`;
      next.textContent = 'Create my quote request →';
      next.disabled = false;

      const name = by('#wizard-name', stage);
      const phone = by('#wizard-phone', stage);
      name?.addEventListener('input', () => { state.name = name.value; });
      phone?.addEventListener('input', () => { state.phone = phone.value; });
      setTimeout(() => name?.focus(), 50);
    };

    const summaryMarkup = () => `
      <div class="quote-summary">
        <div><span>Clean</span><strong>${escapeHtml(state.service)}</strong></div>
        <div><span>Frequency</span><strong>${escapeHtml(state.rhythm)}</strong></div>
        <div><span>Home</span><strong>${escapeHtml(state.home)}</strong></div>
        <div><span>Timing</span><strong>${escapeHtml(state.timing)}</strong></div>
      </div>`;

    const messageText = () => [
      'Hi Clean Space — I’d love a quote.',
      `Name: ${state.name.trim()}`,
      `Phone: ${state.phone.trim()}`,
      `Clean: ${state.service}`,
      `Frequency: ${state.rhythm}`,
      `Home: ${state.home}`,
      `Timing: ${state.timing}`
    ].join('\n');

    const renderFinish = () => {
      const message = messageText();
      const smsSeparator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?';
      const sms = `sms:${PHONE_E164}${smsSeparator}body=${encodeURIComponent(message)}`;
      stage.innerHTML = `
        <div class="quote-step is-active quote-finish">
          <div class="finish-icon">✓</div>
          <h3 class="quote-question">Perfect, ${escapeHtml(firstName(state.name))}.</h3>
          <p class="quote-hint">Your request is ready. Nothing has been sent automatically.</p>
          ${summaryMarkup()}
          <div class="finish-actions">
            <a class="primary-action" href="${sms}">Text Clean Space</a>
            <a class="secondary-action" href="tel:${PHONE_E164}">Call ${PHONE_DISPLAY}</a>
            <button type="button" class="secondary-action" data-copy-enquiry>Copy enquiry</button>
            <a class="secondary-action" href="${INSTAGRAM}" target="_blank" rel="noreferrer">Instagram ↗</a>
            <button type="button" class="secondary-action" data-start-over>Start over</button>
          </div>
          <div class="wizard-error" data-copy-status aria-live="polite"></div>
        </div>`;
      by('[data-copy-enquiry]', stage)?.addEventListener('click', async () => {
        const ok = await copyText(message);
        by('[data-copy-status]', stage).textContent = ok ? 'Copied — ready to paste.' : 'Could not copy automatically. Use the text or call button.';
      });
      by('[data-start-over]', stage)?.addEventListener('click', () => {
        Object.assign(state, {
          step: 0,
          service: '',
          rhythm: '',
          home: '',
          timing: '',
          name: '',
          phone: ''
        });
        render();
      });
      next.hidden = true;
    };

    function render() {
      setProgress();
      back.hidden = state.step === 0;
      next.hidden = false;
      next.textContent = state.step === 4 ? 'Create my quote request →' : 'Continue →';

      if (state.step < 4) {
        renderChoiceStep(steps[state.step]);
      } else if (state.step === 4) {
        renderContactStep();
      } else {
        renderFinish();
      }
    }

    back.addEventListener('click', () => {
      if (state.step <= 0) return;
      state.step -= 1;
      render();
    });

    next.addEventListener('click', () => {
      if (state.step < 4) {
        const key = steps[state.step].key;
        if (!state[key]) return;
        state.step += 1;
        render();
        return;
      }

      if (state.step === 4) {
        const name = by('#wizard-name', stage);
        const phone = by('#wizard-phone', stage);
        state.name = name?.value.trim() || state.name.trim();
        state.phone = phone?.value.trim() || state.phone.trim();
        const error = by('.wizard-error', stage);
        const digits = state.phone.replace(/\D/g, '');

        if (state.name.length < 2) {
          error.textContent = 'Please add your name.';
          name?.focus();
          return;
        }
        if (digits.length < 8) {
          error.textContent = 'Please add a valid mobile number.';
          phone?.focus();
          return;
        }
        error.textContent = '';
        state.step = 5;
        render();
      }
    });

    render();
  };

  createWizard();

  // Reliable way for dynamic CTAs to open the existing accessible drawer.
  const boundQuoteButton = () => all('[data-open-quote]').find((el) => el.isConnected && !el.closest('.quote-panel'));
  const openQuote = () => {
    const bound = boundQuoteButton();
    if (bound) {
      bound.click();
      return;
    }
    if (drawer) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('locked', 'quote-open');
    }
  };

  // Make the Contact page conversion-first rather than form-heavy.
  if (location.pathname.replace(/\/$/, '') === '/contact') {
    const card = by('.form-card');
    if (card && !card.querySelector('[data-open-quote-dynamic]')) {
      card.classList.add('is-wizard-launcher');
      const launcher = document.createElement('div');
      launcher.innerHTML = `
        <div class="kicker">Fast quote</div>
        <h2>Two minutes. Mostly taps.</h2>
        <p>Choose what you need, then add only your name and mobile number.</p>
        <div class="contact-fast-path">
          <button type="button" class="fast-button primary" data-open-quote-dynamic><span>Start quote</span><span>→</span></button>
          <a class="fast-button light" href="tel:${PHONE_E164}"><span>Call / text</span><span>${PHONE_DISPLAY}</span></a>
          <a class="fast-button light" href="${INSTAGRAM}" target="_blank" rel="noreferrer"><span>Instagram</span><span>@cleanspaceau ↗</span></a>
        </div>`;
      card.appendChild(launcher);
    }

    const contactCard = by('.contact-card');
    const links = contactCard?.querySelector('.contact-links');
    if (links && !links.querySelector(`a[href="tel:${PHONE_E164}"]`)) {
      const phone = document.createElement('a');
      phone.className = 'contact-link';
      phone.href = `tel:${PHONE_E164}`;
      phone.innerHTML = `<span>Call / text</span><span>${PHONE_DISPLAY}</span>`;
      links.prepend(phone);
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-quote-dynamic]');
    if (!trigger) return;
    event.preventDefault();
    openQuote();
  });

  // /book keeps a visible start button instead of forcing the drawer open.
})();
