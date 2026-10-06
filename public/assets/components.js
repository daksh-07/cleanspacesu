(() => {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const nav = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <nav class="nav" aria-label="Primary navigation">
        <a class="brand" href="/" aria-label="Clean Space home">
          <span class="brand-logo-wrap">
            <img class="brand-logo brand-logo-original" src="/images/logo-brand.webp" alt="Clean Space — Let us do the magic">
          </span>
        </a>
        <div class="nav-links" id="site-nav-links">
          <a href="/services" ${path==='/services'?'aria-current="page"':''}>Services</a>
          <a href="/work" ${path==='/work'?'aria-current="page"':''}>Our work</a>
          <a href="/about" ${path==='/about'?'aria-current="page"':''}>About</a>
          <a href="/contact" ${path==='/contact'?'aria-current="page"':''}>Contact</a>
          <button class="button nav-cta" data-open-quote>Request a clean</button>
        </div>
        <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav-links"><span></span><span></span><span></span></button>
      </nav>
    </header>`;

  const footer = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="brand" href="/" aria-label="Clean Space home">
              <span class="brand-logo-wrap">
                <img class="brand-logo brand-logo-original" src="/images/logo-brand.webp" alt="Clean Space — Let us do the magic">
              </span>
            </a>
            <p>Thoughtful home cleaning across Melbourne. Real work, carefully finished — so your home feels lighter the moment you walk in.</p>
          </div>
          <div class="footer-col"><h4>Explore</h4><a href="/services">Services</a><a href="/work">Our work</a><a href="/about">About</a></div>
          <div class="footer-col"><h4>Enquire</h4><a href="/contact">Request a clean</a><a href="https://www.instagram.com/cleanspaceau/" target="_blank" rel="noreferrer">Instagram</a></div>
          <div class="footer-col"><h4>Location</h4><a href="/contact">Melbourne, Victoria</a></div>
        </div>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} Clean Space.</span><span>Let us do the magic.</span></div>
      </div>
    </footer>`;

  const drawer = `
    <div class="quote-drawer" aria-hidden="true">
      <div class="quote-backdrop"></div>
      <aside class="quote-panel" role="dialog" aria-modal="true" aria-label="Request a Clean Space quote">
        <button class="quote-close" aria-label="Close quote form">×</button>
        <div class="kicker">A cleaner home starts here</div>
        <h2>Tell us about your space.</h2>
        <p>Share the basics and we’ll prepare a message for Clean Space. Nothing is sent from this website — Instagram opens so you can review and send the message yourself.</p>
        <form data-enquiry-form class="form-grid">
          <div class="field"><label for="q-name">Name</label><input id="q-name" name="name" required autocomplete="name"></div>
          <div class="field"><label for="q-suburb">Melbourne suburb</label><input id="q-suburb" name="suburb" required autocomplete="address-level2"></div>
          <div class="field"><label for="q-service">What do you need?</label><select id="q-service" name="service"><option>Regular home clean</option><option>One-off reset</option><option>Kitchen & bathroom detail</option><option>Tidying + home refresh</option><option>Not sure yet</option></select></div>
          <div class="field"><label for="q-home">Home size</label><select id="q-home" name="home"><option>Apartment / unit</option><option>1–2 bedroom home</option><option>3–4 bedroom home</option><option>5+ bedroom home</option></select></div>
          <div class="field full"><label for="q-timing">Preferred timing</label><input id="q-timing" name="timing" placeholder="e.g. Friday morning / next week"></div>
          <div class="field full"><label for="q-message">Anything we should know?</label><textarea id="q-message" name="message" placeholder="Rooms to focus on, pets, access, or anything else"></textarea></div>
          <div class="field full"><button class="button dark" type="submit">Prepare enquiry & open Instagram <span class="arrow">↗</span></button></div>
        </form>
        <div class="quote-success" role="status" aria-live="polite"></div>
      </aside>
    </div>`;

  document.querySelector('[data-site-nav]')?.insertAdjacentHTML('afterbegin', nav);
  const mobileCta = `<button class="mobile-sticky-cta" data-open-quote aria-label="Request a Clean Space clean"><span>Request a clean</span><span aria-hidden="true">→</span></button>`;
  document.querySelector('[data-site-footer]')?.insertAdjacentHTML('beforeend', footer + drawer + mobileCta);
})();