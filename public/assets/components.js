(() => {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const nav = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <nav class="nav" aria-label="Primary navigation">
        <a class="brand" href="/" aria-label="Clean Space home">
          <span class="brand-logo-wrap">
            <img class="brand-logo brand-logo-original" src="/images/logo-header.webp" alt="Clean Space — Let us do the magic">
          </span>
        </a>
        <div class="nav-links" id="site-nav-links">
          <a href="/services" ${path==='/services'?'aria-current="page"':''}>Services</a>
          <a href="/work" ${path==='/work'?'aria-current="page"':''}>Our work</a>
          <a href="/about" ${path==='/about'?'aria-current="page"':''}>About</a>
          <a href="/contact" ${path==='/contact'?'aria-current="page"':''}>Contact</a>
          <button class="button nav-cta" data-open-quote>Get a quote</button>
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
                <img class="brand-logo brand-logo-original" src="/images/logo-header.webp" alt="Clean Space — Let us do the magic">
              </span>
            </a>
            <p>Thoughtful home cleaning across Melbourne. Real work, carefully finished — so your home feels lighter the moment you walk in.</p>
          </div>
          <div class="footer-col"><h4>Explore</h4><a href="/services">Services</a><a href="/work">Our work</a><a href="/about">About</a></div>
          <div class="footer-col"><h4>Enquire</h4><a href="/contact">Get a quote</a><a href="tel:+61426379247">0426 379 247</a><a href="https://www.instagram.com/cleanspaceau/" target="_blank" rel="noreferrer">Instagram</a></div>
          <div class="footer-col"><h4>Location</h4><a href="/contact">Melbourne, Victoria</a></div>
        </div>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} Clean Space.</span><span>Let us do the magic.</span></div>
      </div>
    </footer>`;

  const drawer = `
    <div class="quote-drawer" aria-hidden="true">
      <div class="quote-backdrop"></div>
      <aside class="quote-panel" role="dialog" aria-modal="true" aria-label="Get a Clean Space quote">
        <button class="quote-close" aria-label="Close quote form">×</button>
        <div class="quote-fallback">
          <div class="kicker">Get a tailored quote</div>
          <h2>Tell us what you need.</h2>
          <p>The interactive quote takes a few taps. Only your name and mobile number need typing. Nothing is sent from this website automatically.</p>
          <a class="button dark" href="tel:+61426379247">Call 0426 379 247</a>
        </div>
      </aside>
    </div>`;

  document.querySelector('[data-site-nav]')?.insertAdjacentHTML('afterbegin', nav);
  const mobileCta = `<button class="mobile-sticky-cta" data-open-quote aria-label="Get a Clean Space quote"><span>Get a quote</span><span aria-hidden="true">→</span></button>`;
  document.querySelector('[data-site-footer]')?.insertAdjacentHTML('beforeend', footer + drawer + mobileCta);
})();