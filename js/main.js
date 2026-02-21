const body = document.body;
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section');
const form = document.querySelector('#contact-form');
const toast = document.querySelector('#toast');
const scrollTopBtn = document.querySelector('.scroll-top');

const showToast = (message) => {
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
};

const closeMenu = () => {
  body.classList.remove('nav-open');
  if (navToggle) {
    navToggle.setAttribute('aria-expanded', 'false');
  }
};

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (link.getAttribute('href')?.startsWith('#')) {
      closeMenu();
    }
  });
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

if (sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => observer.observe(section));
}

const counters = document.querySelectorAll('.stat-number');
if (counters.length) {
  const parseStat = (value) => {
    const raw = String(value).trim();
    if (raw.includes('/')) {
      const [left, right] = raw.split('/');
      const numeric = parseFloat(left.replace(/[^0-9.]/g, ''));
      return {
        target: Number.isNaN(numeric) ? 0 : numeric,
        suffix: right ? `/${right}` : '/'
      };
    }
    const numeric = parseFloat(raw.replace(/[^0-9.]/g, ''));
    return {
      target: Number.isNaN(numeric) ? 0 : numeric,
      suffix: raw.replace(/[0-9.]/g, '')
    };
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const el = entry.target;
        const targetRaw = el.dataset.target || el.textContent || '0';
        const parsed = parseStat(targetRaw);
        const target = parsed.target;
        const suffix = parsed.suffix;
        const duration = 1400;
        const start = performance.now();

        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const value = Math.floor(progress * target);
          el.textContent = `${value}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = `${target}${suffix}`;
          }
        };

        requestAnimationFrame(animate);
        observer.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    showToast("Thanks! We'll contact you soon.");
    form.reset();
  });
}

if (scrollTopBtn) {
  const toggleScrollButton = () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  };

  window.addEventListener('scroll', toggleScrollButton);
  toggleScrollButton();

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const pageLoader = document.querySelector('#page-loader');
if (pageLoader) {
  const hasShown = sessionStorage.getItem('vlr_loader_shown');
  if (hasShown) {
    pageLoader.classList.add('hidden');
  }
  window.addEventListener('load', () => {
    setTimeout(() => {
      pageLoader.classList.add('hidden');
      sessionStorage.setItem('vlr_loader_shown', 'true');
    }, 3000);
  });
}
