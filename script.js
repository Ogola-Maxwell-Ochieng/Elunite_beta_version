// ==========================
// ELUNITE Main JS - COMPLETE
// ==========================

// ===== NAVIGATION =====
document.addEventListener('DOMContentLoaded', function () {
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = mobileMenuBtn.querySelector('.menu-icon');
  const closeIcon = mobileMenuBtn.querySelector('.close-icon');
  let isMobileMenuOpen = false;

  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Mobile-only: header sits in normal flow until the hero
  // announcement pill has scrolled fully out of view (~120px), then
  // it pops to fixed + glassmorphism. Instant toggle, same threshold
  // both ways — no direction-based show/hide, no smoothing.
  var MOBILE_STICKY_THRESHOLD = 120;
  function handleMobileStickyHeader() {
    if (window.scrollY > MOBILE_STICKY_THRESHOLD) {
      navbar.classList.add('mobile-stuck');
    } else {
      navbar.classList.remove('mobile-stuck');
    }
  }

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
    mobileMenuBtn.setAttribute('aria-expanded', String(isMobileMenuOpen));
    if (isMobileMenuOpen) {
      mobileMenu.classList.remove('hidden');
      menuIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.add('hidden');
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function closeMobileMenu() {
    if (isMobileMenuOpen) toggleMobileMenu();
  }

  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');
  if (mobileMenuCloseBtn) {
    mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
  }

  // Clicking anywhere outside the open panel (the dimmed backdrop area,
  // since it's a box-shadow, not a real element) closes it
  document.addEventListener('click', function (e) {
    if (
      isMobileMenuOpen &&
      !mobileMenu.contains(e.target) &&
      !mobileMenuBtn.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });

  function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('scroll', handleMobileStickyHeader);
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

  // Same bfcache pitfall as the bottom tab bar's panels: if this drawer
  // was open when the user navigated away, Back would otherwise restore
  // it open (and body scroll still locked) instead of the plain page.
  window.addEventListener('pageshow', closeMobileMenu);

  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .mobile-nav-sublink, .nav-dropdown-item');
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      // Dropdown triggers (Destinations/Services/Programs) only expand
      // their submenu, they should never close the whole drawer/menu
      if (this.classList.contains('mobile-nav-dropdown-trigger') ||
          this.classList.contains('nav-dropdown-trigger')) {
        return;
      }
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        scrollToSection(href.substring(1));
      }
      closeMobileMenu();
    });
  });

  window.scrollToSection = scrollToSection;
  handleScroll();

  // ===== Nav dropdowns (Destinations, Services, etc.) =====
  const navDropdowns = document.querySelectorAll('.nav-dropdown');
  navDropdowns.forEach(function (dropdown) {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // Close any other open dropdown
      navDropdowns.forEach(function (other) {
        if (other !== dropdown) {
          other.classList.remove('open');
          other.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
        }
      });
    });
  });
  document.addEventListener('click', function (e) {
    navDropdowns.forEach(function (dropdown) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        dropdown.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      navDropdowns.forEach(function (dropdown) {
        dropdown.classList.remove('open');
        dropdown.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });

  function closeAllNavDropdowns() {
    navDropdowns.forEach(function (dropdown) {
      dropdown.classList.remove('open');
      dropdown.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
    });
  }

  // Close any open dropdown as soon as the page is scrolled
  window.addEventListener('scroll', closeAllNavDropdowns, { passive: true });

  // Hovering a different nav item cleanly switches/closes dropdowns
  // instead of leaving a click-opened one stuck open
  navDropdowns.forEach(function (dropdown) {
    dropdown.addEventListener('mouseenter', function () {
      navDropdowns.forEach(function (other) {
        if (other !== dropdown) {
          other.classList.remove('open');
          other.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
        }
      });
    });
  });
  document.querySelectorAll('.nav-link:not(.nav-dropdown-trigger)').forEach(function (link) {
    link.addEventListener('mouseenter', closeAllNavDropdowns);
  });

  const mobileNavGroups = document.querySelectorAll('.mobile-nav-group');
  mobileNavGroups.forEach(function (group) {
    const mobileTrigger = group.querySelector('.mobile-nav-dropdown-trigger');
    mobileTrigger.addEventListener('click', function () {
      const isOpen = group.classList.toggle('open');
      mobileTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // When the browser restores this page from bfcache (e.g. the user opened
  // a dropdown, clicked a link inside it, then hit Back), the DOM is
  // restored exactly as it was left — dropdown still open. Force every
  // nav toggle closed so Back always lands on a clean, collapsed nav.
  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;
    closeAllNavDropdowns();
    mobileNavGroups.forEach(function (group) {
      group.classList.remove('open');
      group.querySelector('.mobile-nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
    });
    closeMobileMenu();
  });
});


// ===== SERVICES MEGA-MENU SEARCH =====
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('services-menu-search-input');
  const resultsBox = document.getElementById('services-menu-search-results');
  const servicesDropdown = document.getElementById('nav-services-dropdown');
  if (!searchInput || !resultsBox) return;

  // Mirrors the service groups and individual offerings listed on service.html,
  // so a query like "visa interview" or "immigration" surfaces the specific
  // bullet point, not just the parent service page.
  const SERVICES = [
    { title: 'Study Abroad Services', href: 'study-abroad-services.html' },
    { title: 'Academic profiling and long-term career mapping', group: 'Study Abroad Services', href: 'study-abroad-services.html' },
    { title: 'Course and institution selection aligned with global demand', group: 'Study Abroad Services', href: 'study-abroad-services.html' },
    { title: 'Undergraduate, postgraduate, and professional program placement', group: 'Study Abroad Services', href: 'study-abroad-services.html' },
    { title: 'Scholarship identification and application positioning', group: 'Study Abroad Services', href: 'study-abroad-services.html' },
    { title: 'Documentation preparation, visa advisory, and interview prep', group: 'Study Abroad Services', href: 'study-abroad-services.html' },
    { title: 'Pre-departure readiness and post-arrival support', group: 'Study Abroad Services', href: 'study-abroad-services.html' },

    { title: 'Visa Application Support', href: 'visa-purchase.html' },

    { title: 'Work Abroad & Relocation', href: 'work-abroad-relocation.html' },
    { title: 'Candidate skills profiling and documentation optimization', group: 'Work Abroad & Relocation', href: 'work-abroad-relocation.html' },
    { title: 'Skilled and semi-skilled workforce deployment', group: 'Work Abroad & Relocation', href: 'work-abroad-relocation.html' },
    { title: 'Immigration and work permit advisory', group: 'Work Abroad & Relocation', href: 'work-abroad-relocation.html' },
    { title: 'Employment contract coordination', group: 'Work Abroad & Relocation', href: 'work-abroad-relocation.html' },
    { title: 'Relocation planning and settlement support', group: 'Work Abroad & Relocation', href: 'work-abroad-relocation.html' },
    { title: 'Workplace integration coaching', group: 'Work Abroad & Relocation', href: 'work-abroad-relocation.html' },

    { title: 'Scholarships & Exchange Programs', href: 'scholarships-exchange-programs.html' },
    { title: 'Fully funded and partial scholarship programs', group: 'Scholarships & Exchange Programs', href: 'scholarships-exchange-programs.html' },
    { title: 'International internship placements', group: 'Scholarships & Exchange Programs', href: 'scholarships-exchange-programs.html' },
    { title: 'Academic exchange initiatives', group: 'Scholarships & Exchange Programs', href: 'scholarships-exchange-programs.html' },
    { title: 'Short-term mobility and research programs', group: 'Scholarships & Exchange Programs', href: 'scholarships-exchange-programs.html' },
    { title: 'Professional training attachments abroad', group: 'Scholarships & Exchange Programs', href: 'scholarships-exchange-programs.html' },

    { title: 'Business Strategy & Development', href: 'business-strategy-development.html' },
    { title: 'Strategic advisory for international positioning', group: 'Business Strategy & Development', href: 'business-strategy-development.html' },
    { title: 'Organizational readiness assessments', group: 'Business Strategy & Development', href: 'business-strategy-development.html' },
    { title: 'Development of recruitment compliance frameworks', group: 'Business Strategy & Development', href: 'business-strategy-development.html' },
    { title: 'Risk and documentation control systems', group: 'Business Strategy & Development', href: 'business-strategy-development.html' },
    { title: 'Cross-border institutional partnership structuring', group: 'Business Strategy & Development', href: 'business-strategy-development.html' },

    { title: 'Mentorship & Capacity Building', href: 'mentorship-capacity-building.html' },
    { title: 'Personalized academic and professional mentoring', group: 'Mentorship & Capacity Building', href: 'mentorship-capacity-building.html' },
    { title: 'Career strategy planning and professional branding', group: 'Mentorship & Capacity Building', href: 'mentorship-capacity-building.html' },
    { title: 'Interview preparation and leadership development', group: 'Mentorship & Capacity Building', href: 'mentorship-capacity-building.html' },
    { title: 'Youth empowerment initiatives', group: 'Mentorship & Capacity Building', href: 'mentorship-capacity-building.html' },
    { title: 'Capacity-building workshops aligned with global standards', group: 'Mentorship & Capacity Building', href: 'mentorship-capacity-building.html' },

    { title: 'Corporate & Institutional Training', href: 'corporate-institutional-training.html' },
    { title: 'Advisory on international recruitment compliance', group: 'Corporate & Institutional Training', href: 'corporate-institutional-training.html' },
    { title: 'Workforce readiness and institutional transformation', group: 'Corporate & Institutional Training', href: 'corporate-institutional-training.html' },
    { title: 'International partnership development plans', group: 'Corporate & Institutional Training', href: 'corporate-institutional-training.html' },
    { title: 'Leadership workshops on mobility governance', group: 'Corporate & Institutional Training', href: 'corporate-institutional-training.html' }
  ];

  const MAX_RESULTS = 8;
  const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (ch) { return ESCAPE_MAP[ch]; });
  }

  function highlight(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0, idx)) +
      '<mark>' + escapeHtml(text.slice(idx, idx + query.length)) + '</mark>' +
      escapeHtml(text.slice(idx + query.length));
  }

  function closeResults() {
    resultsBox.classList.remove('is-open');
    resultsBox.innerHTML = '';
    searchInput.setAttribute('aria-expanded', 'false');
  }

  function renderResults(rawQuery) {
    const query = rawQuery.trim();
    if (!query) {
      closeResults();
      return;
    }

    const q = query.toLowerCase();
    const matches = SERVICES.filter(function (service) {
      return service.title.toLowerCase().includes(q) ||
        (service.group && service.group.toLowerCase().includes(q));
    }).slice(0, MAX_RESULTS);

    if (!matches.length) {
      resultsBox.innerHTML = '<div class="services-menu-search-empty">No services found for "' + escapeHtml(query) + '"</div>';
    } else {
      resultsBox.innerHTML = matches.map(function (service) {
        return '<a href="' + service.href + '" class="services-menu-search-result" role="option">' +
          '<span class="services-menu-search-result-title">' + highlight(service.title, query) + '</span>' +
          (service.group ? '<span class="services-menu-search-result-sub">' + escapeHtml(service.group) + '</span>' : '') +
          '</a>';
      }).join('');
    }
    resultsBox.classList.add('is-open');
    searchInput.setAttribute('aria-expanded', 'true');
  }

  searchInput.addEventListener('input', function () {
    renderResults(searchInput.value);
  });

  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      searchInput.value = '';
      closeResults();
      searchInput.blur();
    } else if (e.key === 'Enter') {
      const first = resultsBox.querySelector('.services-menu-search-result');
      if (first) {
        e.preventDefault();
        window.location.href = first.getAttribute('href');
      }
    }
  });

  // Clear the search whenever the Services panel is dismissed, so reopening
  // it later starts fresh instead of showing a stale query/result list.
  if (servicesDropdown) {
    servicesDropdown.addEventListener('mouseleave', function () {
      searchInput.value = '';
      closeResults();
    });
  }
  document.addEventListener('click', function (e) {
    if (servicesDropdown && !servicesDropdown.contains(e.target)) {
      searchInput.value = '';
      closeResults();
    }
  });
});


// ===== CONTACT FORM =====
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const thankYouMsg = document.getElementById('thank-you-msg');
  const WHATSAPP_NUMBER = '918050306510'; // no + or spaces, per wa.me format

  if (form) {
    const submitBtn = form.querySelector('.form-submit-btn');
    const formRenderedAt = Date.now();
    const MIN_FILL_TIME_MS = 3000; // real people can't fill 3 fields faster than this
    const RESUBMIT_COOLDOWN_MS = 60000; // 1 minute between submissions from this browser
    const COOLDOWN_KEY = 'elunite_contact_last_submit';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Honeypot: real visitors never see or fill this field, bots that
      // auto-fill every input do. Silently drop the submission.
      if (form._gotcha && form._gotcha.value) {
        form.reset();
        return;
      }

      // Time trap: a submission faster than a human could type is almost
      // certainly a bot script. Silently drop it.
      if (Date.now() - formRenderedAt < MIN_FILL_TIME_MS) {
        form.reset();
        return;
      }

      // Cooldown: block rapid repeat submissions from the same browser.
      const lastSubmit = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
      if (Date.now() - lastSubmit < RESUBMIT_COOLDOWN_MS) {
        thankYouMsg.style.display = 'block';
        thankYouMsg.textContent =
          "You've already sent a message — our team has it. Please wait a moment before sending another.";
        setTimeout(() => { thankYouMsg.style.display = 'none'; }, 6000);
        return;
      }

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending...';
      }

      const formData = new FormData(form);
      let emailSent = false;

      try {
        // Sends an email notification via Formspree (endpoint already set in the form's action attribute)
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });
        emailSent = response.ok;
        if (!response.ok) {
          console.error('Formspree submission failed:', response.status);
        }
      } catch (error) {
        console.error('Form submission error:', error);
      }

      // Build a pre-filled WhatsApp message regardless of email outcome,
      // so the lead always reaches the team one way or another.
      const waText = encodeURIComponent(
        `Hi ELUNITE! My name is ${name}.\nEmail: ${email}\nMessage: ${message}`
      );
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));

      thankYouMsg.style.display = 'block';
      if (!emailSent) {
        thankYouMsg.textContent =
          "🎉 Thanks for reaching out! We couldn't confirm the email went through, but we're opening WhatsApp for you now so we don't miss your message.";
      }
      form.reset();

      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtn.dataset.originalText;
        }
      }, 1200);

      // Hide the thank-you message automatically after 10 seconds
      setTimeout(() => {
        thankYouMsg.style.display = 'none';
      }, 10000);
    });
  }
});


// ===== SHARED LEAD-FORM SUBMIT HANDLER =====
// Used by all three lead-capture forms (main process card, popup modal,
// side-panel enquiry) so the anti-spam checks, Formspree submission, and
// button disable-during-submit logic exist in exactly one place. Each form
// still supplies its own success/error UI via callbacks, since the three
// forms show results differently (inline message, modal swap, WhatsApp
// handoff).
function initLeadFormSubmit(form, opts) {
  opts = opts || {};
  var submitBtn = opts.submitBtn || form.querySelector('button[type="submit"]');
  var minFillMs = opts.minFillMs || 3000;
  var cooldownMs = opts.cooldownMs || 60000;
  var getRenderedAt = opts.getRenderedAt || function () { return 0; };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Honeypot — bots fill every field, real visitors never see this one
    if (form._gotcha && form._gotcha.value) {
      form.reset();
      return;
    }

    // Time trap — faster than a human could type is almost certainly a bot
    if (Date.now() - getRenderedAt() < minFillMs) {
      form.reset();
      return;
    }

    if (opts.validate && !opts.validate()) return;

    var lastSubmit = Number(localStorage.getItem(opts.cooldownKey) || 0);
    if (Date.now() - lastSubmit < cooldownMs) {
      if (opts.onCooldown) opts.onCooldown(submitBtn);
      return;
    }

    if (opts.beforeSubmit) opts.beforeSubmit(form);

    var originalText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    var formData = new FormData(form);
    var ok = false;
    try {
      var response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      ok = response.ok;
      if (!ok) console.error('Formspree submission failed:', response.status);
    } catch (error) {
      ok = false;
      console.error('Form submission error:', error);
    }

    localStorage.setItem(opts.cooldownKey, String(Date.now()));

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }

    if (ok && opts.onSuccess) opts.onSuccess(formData, form);
    if (!ok && opts.onError) opts.onError(formData, form);
  });
}


// ===== GET IN TOUCH — SLIDE-IN ENQUIRY PANEL =====
document.addEventListener('DOMContentLoaded', function () {
  const tab = document.getElementById('enquiry-tab');
  const panel = document.getElementById('enquiry-panel');
  if (!tab || !panel) return;

  // Tracks when the panel was last opened, so the bot time-trap below
  // measures fill speed from when the form actually appeared to the
  // visitor — not from page load, which could be long before they ever
  // clicked the tab and would falsely flag a genuinely fast fill as a bot.
  let formRenderedAt = Date.now();

  function closePanel() {
    panel.classList.remove('open');
    tab.classList.remove('active');
    tab.setAttribute('aria-expanded', 'false');
  }

  tab.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = panel.classList.toggle('open');
    tab.classList.toggle('active', isOpen);
    tab.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) formRenderedAt = Date.now();
  });

  document.addEventListener('click', function (e) {
    if (
      panel.classList.contains('open') &&
      !panel.contains(e.target) &&
      !tab.contains(e.target)
    ) {
      closePanel();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  const form = document.getElementById('enquiry-form');
  if (!form) return;

  const WHATSAPP_NUMBER = '918050306510';
  const msgEl = form.querySelector('.enquiry-form-msg');

  function showMsg(text) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.hidden = false;
    setTimeout(() => { msgEl.hidden = true; }, 8000);
  }

  function openWhatsApp() {
    const name = form.first_name.value.trim();
    const email = form.email.value.trim();
    const fullPhone = `${form.country_code.value} ${form.phone.value.trim()}`;
    const waText = encodeURIComponent(
      `Hi ELUNITE! My name is ${name}.\nEmail: ${email}\nPhone: ${fullPhone}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, '_blank', 'noopener');
  }

  initLeadFormSubmit(form, {
    submitBtn: form.querySelector('.enquiry-submit'),
    cooldownKey: 'elunite_enquiry_last_submit',
    getRenderedAt: () => formRenderedAt,
    beforeSubmit(form) {
      const sourceField = form.querySelector('.enquiry-source-page');
      if (sourceField) sourceField.value = window.location.pathname;
    },
    onCooldown(submitBtn) {
      if (!submitBtn) return;
      const original = submitBtn.textContent;
      submitBtn.textContent = 'Already sent — please wait';
      setTimeout(() => { submitBtn.textContent = original; }, 3000);
    },
    onSuccess() {
      openWhatsApp();
      showMsg("🎉 Thanks! We've got your details and opened WhatsApp so we can chat right away.");
      form.reset();
      setTimeout(closePanel, 1200);
    },
    onError() {
      openWhatsApp();
      showMsg("We couldn't confirm your message went through, but we've opened WhatsApp so we don't miss you.");
      form.reset();
      setTimeout(closePanel, 1200);
    },
  });
});


// ===== MOBILE TAB BAR — full-screen slide-in panels =====
document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.mobile-tabbar-item[data-panel-target]');
  if (!tabButtons.length) return;

  function closeAllPanels() {
    document.querySelectorAll('.tab-panel.open').forEach(function (p) {
      p.classList.remove('open');
    });
    tabButtons.forEach(function (btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  // Tapping a program/service/etc. card navigates to a new page while a
  // panel is open. Browsers restore that frozen DOM (bfcache) on Back,
  // panel-open state and all — reset it so Back lands on the plain page
  // you started from, not back inside the panel you had open.
  window.addEventListener('pageshow', closeAllPanels);

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.dataset.panelTarget;
      const target = document.getElementById(targetId);
      if (!target) return;

      const alreadyOpen = target.classList.contains('open');
      closeAllPanels();

      // Tapping the already-active tab closes it; tapping any other tab
      // opens its panel directly (no intermediate closed state needed
      // since only one panel is ever open at a time).
      if (!alreadyOpen) {
        target.classList.add('open');
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Segmented "By Category" / "By Destination" style toggles inside panels
  document.querySelectorAll('.panel-segmented').forEach(function (group) {
    const segments = group.querySelectorAll('.panel-segment');
    segments.forEach(function (seg) {
      seg.addEventListener('click', function () {
        const targetId = seg.dataset.segmentTarget;
        const target = document.getElementById(targetId);
        if (!target) return;

        segments.forEach(function (s) {
          s.classList.remove('active');
          s.setAttribute('aria-selected', 'false');
        });
        seg.classList.add('active');
        seg.setAttribute('aria-selected', 'true');

        segments.forEach(function (s) {
          const otherTarget = document.getElementById(s.dataset.segmentTarget);
          if (otherTarget) otherTarget.hidden = otherTarget !== target;
        });
      });
    });
  });

  // Site Menu panel — expandable sections. Independent: opening one
  // never closes another that's already open.
  document.querySelectorAll('.site-menu-group').forEach(function (group) {
    const trigger = group.querySelector('.site-menu-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      const isOpen = group.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
  });
});


// ===== TESTIMONIALS DATA =====
// NOTE: Steven Gideon (below) and Maddoh Yoavi studied in Russia and Canada
// respectively — neither is one of Elunite's 6 current destination pages
// (India, USA, China, Germany, Australia, Ireland). The data itself is
// internally consistent (no mismatch), just off-message versus what the
// site currently promotes. TODO: confirm with owner whether to keep these,
// swap in different real testimonials, or reword to de-emphasize the country.
const testimonials = [
  {
    name: 'Steven Gideon',
    image: 'images/students/Steven_Gideon.webp',
    program: 'Petroleum Engineering',
    university: 'Kazan University, Russia',
    quote: 'Elunite made my dream of studying abroad a reality. Their guidance through the application process was invaluable, and I received a full scholarship too!',
    rating: 5
  },
  {
    name: 'Joel Yaovi',
    image: 'images/students/Joel_Yaovi.webp',
    program: 'Cyber Security',
    university: 'Jessup University, USA',
    quote: 'Elunite guided me through the entire admission application process and helped me secure admission with an affordable tuition fee. Their support was exceptional!',
    rating: 4.5
  },
  {
    name: 'Oliver Odhiambo',
    image: 'images/students/Oliver_odhiambo.webp',
    program: 'Economics',
    university: 'Krupanidhi, India',
    quote: 'Thanks to Elunite\'s expert counseling, I got admission to my reputed university. Their test preparation helped me achieve the required scores and secure 100% scholarship.',
    rating: 5
  },
  {
    // TODO: confirm with owner — university says "Jain University, India" but
    // the quote names "Cambridge Institute of Technology". Fix whichever is wrong.
    name: 'Debra Chebet',
    image: 'images/students/Debra.webp',
    program: 'ECE Student',
    university: 'Jain University, India',
    quote: 'The personalized approach at Elunite helped me secure admission to Cambridge Institute of Technology. Their scholarship guidance was exceptional and saved my family thousands.',
    rating: 5
  },
  {
    name: 'Faraj Lema',
    image: 'images/students/Faraj_Lema.webp',
    program: 'Cardiovascular Technology',
    university: 'South Carolina University, USA',
    quote: 'Studying in USA was always my goal. Elunite\'s counselors understood my aspirations and guided me perfectly through the entrance exams and interviews.',
    rating: 5
  },
  {
    name: 'Safaa Salum',
    image: 'images/students/Safaa_Salum.webp',
    program: 'Pharmaceutical Science',
    university: 'Guru Kashi University, India',
    quote: 'Elunite\'s guidance and academic support made my transition to India smooth. Today, I am confidently pursuing my pharmaceutical course.',
    rating: 4.5
  },
  {
    name: 'Petro Kipilanga',
    image: 'images/students/Kapingala.webp',
    program: 'Computer Science',
    university: 'University of Sydney, Australia',
    quote: 'Elunite\'s visa guidance was flawless. I faced no complications and received my student visa within the expected timeframe. Highly recommend their services!',
    rating: 5
  },
  {
    name: 'Maddoh Yoavi',
    image: 'images/students/Mazama_Moddoh.webp',
    program: 'Data Science',
    university: 'University of Waterloo, Canada',
    quote: 'The scholarship I received through Elunite\'s guidance covered 80% of my tuition. Their expertise in finding funding opportunities is unmatched.',
    rating: 5
  },
  {
    // TODO: confirm with owner — university says "NIMS University, India" but
    // the quote names "LSE" (London School of Economics). Fix whichever is wrong.
    name: 'Nathalie Juma',
    image: 'images/students/Nathalie Maghembe.webp',
    program: 'Public Health',
    university: 'NIMS University, India',
    quote: 'From application essays to interview preparation, Elunite\'s comprehensive support helped me get into LSE. Their expertise is truly world-class.',
    rating: 5
  },
  {
    // TODO: confirm with owner — university says "CIT University, India" but
    // the quote describes "the complex US admission process" and Stanford. Fix whichever is wrong.
    name: 'Catherine Kipeleka',
    image: 'images/students/Catherine.webp',
    program: 'Artificial Intelligence',
    university: 'CIT University, India',
    quote: 'Elunite\'s guidance helped me navigate the complex US admission process. Now I\'m pursuing my passion for AI at Stanford — a dream come true!',
    rating: 5
  }
];


// ===== DESTINATIONS MOBILE CAROUSEL =====
document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('destinations-grid');
  const dotsContainer = document.getElementById('destinations-dots');

  if (!grid || !dotsContainer) return;

  const cards = Array.from(grid.querySelectorAll('.destination-card'));
  if (!cards.length) return;

  dotsContainer.innerHTML = cards
    .map(function (_, i) {
      return '<span class="dot' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '"></span>';
    })
    .join('');
  const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

  function setActive(index) {
    cards.forEach(function (card, i) {
      card.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }

  setActive(0);

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          setActive(cards.indexOf(entry.target));
        }
      });
    },
    { root: grid, threshold: [0.6] }
  );

  cards.forEach(function (card) {
    observer.observe(card);
  });

  dotsContainer.addEventListener('click', function (e) {
    const dot = e.target.closest('.dot');
    if (!dot) return;
    const index = parseInt(dot.dataset.slide, 10);
    cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });
});

// ===== SERVICES "OUR PROCESS" CAROUSEL =====
// Desktop shows several cards at once, so an intersection-ratio threshold
// (fine for the destinations carousel, one card per view) can't reliably
// tell which single card is "active" here. Track position by scroll
// offset instead: works the same whether 1 or 4 cards are in view.
document.addEventListener('DOMContentLoaded', function () {
  const track = document.getElementById('process-timeline');
  const dotsContainer = document.getElementById('process-dots');
  const prevBtn = document.getElementById('process-prev');
  const nextBtn = document.getElementById('process-next');

  if (!track || !dotsContainer) return;

  const steps = Array.from(track.querySelectorAll('.process-step'));
  if (!steps.length) return;

  dotsContainer.innerHTML = steps
    .map(function (_, i) {
      return '<button type="button" class="dot' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '" aria-label="Go to step ' + (i + 1) + '"></button>';
    })
    .join('');
  const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

  function setActive(index) {
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }

  function stepWidth() {
    return steps.length > 1 ? steps[1].offsetLeft - steps[0].offsetLeft : steps[0].offsetWidth;
  }

  function currentIndex() {
    const width = stepWidth();
    if (!width) return 0;
    const raw = Math.round(track.scrollLeft / width);
    return Math.max(0, Math.min(steps.length - 1, raw));
  }

  function goTo(index) {
    const clamped = Math.max(0, Math.min(steps.length - 1, index));
    steps[clamped].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  let scrollTimeout;
  track.addEventListener('scroll', function () {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
      setActive(currentIndex());
    }, 100);
  });

  dotsContainer.addEventListener('click', function (e) {
    const dot = e.target.closest('.dot');
    if (!dot) return;
    goTo(parseInt(dot.dataset.slide, 10));
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentIndex() - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentIndex() + 1); });
});

// ===== TESTIMONIALS CAROUSEL =====
// Inline icon strings shared by the summary card and every testimonial card.
var TST_STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z';
var TST_VERIFIED_SVG =
  '<svg class="tst-verified" viewBox="0 0 24 24" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="10" fill="#081b49"></circle>' +
  '<path d="M8 12.5l2.5 2.5L16 9.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>' +
  '</svg>';

function tstRenderStars(rating) {
  var html = '';
  for (var i = 0; i < 5; i++) {
    var pct = Math.max(0, Math.min(1, rating - i)) * 100;
    html +=
      '<span class="tst-star">' +
      '<svg class="tst-star-bg" viewBox="0 0 24 24"><path d="' + TST_STAR_PATH + '"></path></svg>' +
      '<span class="tst-star-fill" style="width:' + pct + '%">' +
      '<svg viewBox="0 0 24 24"><path d="' + TST_STAR_PATH + '"></path></svg>' +
      '</span>' +
      '</span>';
  }
  return html;
}

document.addEventListener('DOMContentLoaded', function () {
  var viewport = document.getElementById('tst-track-viewport');
  var track = document.getElementById('testimonials-carousel');
  var nextBtn = document.getElementById('testimonials-next');
  var prevBtn = document.getElementById('testimonials-prev');
  var dotsContainer = document.getElementById('testimonials-dots');
  var summaryStars = document.getElementById('tst-summary-stars');

  if (!viewport || !track || !nextBtn || !dotsContainer) return;

  if (summaryStars) {
    // TODO: replace 4.8 with Elunite's real Google Business Profile rating
    // (also update the score/count text next to it in index.html).
    summaryStars.innerHTML = tstRenderStars(4.8);
  }

  var total = testimonials.length;
  var currentPage = 0;

  function getPageSize() {
    if (window.matchMedia('(max-width: 600px)').matches) return 1;
    if (window.matchMedia('(max-width: 900px)').matches) return 2;
    return 3;
  }

  function totalPages() {
    return Math.max(1, Math.ceil(total / getPageSize()));
  }

  function renderCard(t, id, isClone) {
    var meta = [t.program, t.university].filter(Boolean).join(' — ');
    // Clones exist purely so the "next" auto-advance can slide forward
    // seamlessly instead of snapping back — they're pixel-identical
    // duplicates of real cards, so hide them from assistive tech and
    // keyboard focus (inert also drops them from the tab order).
    var hiddenAttrs = isClone ? ' aria-hidden="true" inert' : '';
    return (
      '<div class="tst-card"' + hiddenAttrs + '>' +
      '<div class="tst-card-top">' +
      '<img src="' + t.image + '" alt="' + t.name + '" class="tst-avatar" loading="lazy" />' +
      '<div>' +
      '<div class="tst-name-row">' +
      '<span class="tst-name">' + t.name + '</span>' +
      TST_VERIFIED_SVG +
      '</div>' +
      '<div class="tst-meta">' + meta + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="tst-stars">' + tstRenderStars(t.rating) + '</div>' +
      '<p class="tst-quote" id="' + id + '">' + t.quote + '</p>' +
      '<button type="button" class="tst-readmore" data-target="' + id + '"' + (isClone ? ' tabindex="-1"' : '') + '>Read more</button>' +
      '</div>'
    );
  }

  // A clone of the first (max page size) cards is appended after the real
  // set so advancing past the last page can keep sliding forward into what
  // looks like the start, instead of visibly snapping backwards — then once
  // that slide finishes we jump the track back to 0 with transitions off,
  // which is imperceptible since the clone is pixel-identical to page one.
  var CLONE_COUNT = Math.min(3, total);

  function renderCards() {
    var real = testimonials.map(function (t, index) {
      return renderCard(t, 'tst-quote-' + index, false);
    }).join('');
    var clones = testimonials.slice(0, CLONE_COUNT).map(function (t, index) {
      return renderCard(t, 'tst-quote-clone-' + index, true);
    }).join('');
    track.innerHTML = real + clones;
  }

  function renderDots(activeIndex) {
    var pages = totalPages();
    var active = typeof activeIndex === 'number' ? activeIndex : currentPage;
    var html = '';
    for (var i = 0; i < pages; i++) {
      html +=
        '<button type="button" class="dot' + (i === active ? ' active' : '') + '"' +
        ' data-page="' + i + '"' +
        ' aria-label="Go to testimonials page ' + (i + 1) + ' of ' + pages + '"' +
        (i === active ? ' aria-current="true"' : '') +
        '></button>';
    }
    dotsContainer.innerHTML = html;
  }

  function applyPage() {
    var pages = totalPages();
    currentPage = Math.min(currentPage, pages - 1);
    track.style.transform = 'translateX(-' + (currentPage * viewport.clientWidth) + 'px)';
    renderDots();
  }

  var isWrapping = false;

  function goToPage(page) {
    if (isWrapping) return;
    var pages = totalPages();
    currentPage = ((page % pages) + pages) % pages;
    applyPage();
  }

  function nextPage() {
    if (isWrapping) return;
    var pages = totalPages();

    if (currentPage < pages - 1) {
      currentPage++;
      applyPage();
      return;
    }

    // Last real page — slide into the cloned page instead of wrapping back,
    // then silently reset to page 0 once that slide finishes.
    isWrapping = true;
    renderDots(0);
    track.style.transform = 'translateX(-' + (pages * viewport.clientWidth) + 'px)';

    track.addEventListener('transitionend', function handler() {
      track.removeEventListener('transitionend', handler);
      track.style.transition = 'none';
      currentPage = 0;
      track.style.transform = 'translateX(0px)';
      void track.offsetWidth; // force reflow before re-enabling the transition
      track.style.transition = '';
      isWrapping = false;
    });
  }

  function prevPage() {
    goToPage(currentPage - 1);
  }

  nextBtn.addEventListener('click', nextPage);
  if (prevBtn) prevBtn.addEventListener('click', prevPage);

  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextPage();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevPage();
    }
  });

  dotsContainer.addEventListener('click', function (e) {
    var dot = e.target.closest('.dot');
    if (!dot) return;
    goToPage(parseInt(dot.dataset.page, 10));
  });

  // "Read more" / "Read less" toggle — real expand/collapse of the clamped quote.
  track.addEventListener('click', function (e) {
    var btn = e.target.closest('.tst-readmore');
    if (!btn) return;
    var quote = document.getElementById(btn.dataset.target);
    if (!quote) return;
    var expanded = quote.classList.toggle('tst-expanded');
    btn.textContent = expanded ? 'Read less' : 'Read more';
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (isWrapping) return;
      applyPage();
    }, 150);
  });

  // Defer the actual card render (10 cards + images via innerHTML) off the
  // critical rendering path so it doesn't block first paint / interactivity.
  var scheduleIdle = window.requestIdleCallback || function (fn) { setTimeout(fn, 200); };
  scheduleIdle(function () {
    renderCards();
    applyPage();
    setInterval(nextPage, 6000);
  });
});


// ===== SCROLL TO TOP =====
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function () {
  var scrollBtn = document.querySelector('.scroll-to-top');
  if (scrollBtn) scrollBtn.addEventListener('click', scrollToTop);
});


// ===== SOCIAL MEDIA LINKS =====
// Footer social icons are now real <a href> links (see index.html), so no
// click-to-navigate JS is needed here any more.


// ===== FOOTER LINK NAVIGATION =====
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.footer-link').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        window.scrollToSection(href.substring(1));
      }
    });
  });
});

// Scroll-in animation
const rows = document.querySelectorAll(".zz-row");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.1 },
);
rows.forEach((r) => io.observe(r));


// ============================================================
// CURRENCY CONVERTER
// ============================================================
const currencyData = {
  USD: { symbol: '$', country: 'US', flag: '🇺🇸', rate: 1 },
  INR: { symbol: '₹', country: 'IN', flag: '🇮🇳', rate: 83.12 },
  GBP: { symbol: '£', country: 'GB', flag: '🇬🇧', rate: 0.79 },
  EUR: { symbol: '€', country: 'EU', flag: '🇪🇺', rate: 0.92 },
  CAD: { symbol: 'C$', country: 'CA', flag: '🇨🇦', rate: 1.36 },
  AUD: { symbol: 'A$', country: 'AU', flag: '🇦🇺', rate: 1.52 },
  KES: { symbol: 'KSh', country: 'KE', flag: '🇰🇪', rate: 129.50 },
  TZS: { symbol: 'TSh', country: 'TZ', flag: '🇹🇿', rate: 2640.00 },
  UGX: { symbol: 'USh', country: 'UG', flag: '🇺🇬', rate: 3820.00 },
  NGN: { symbol: '₦', country: 'NG', flag: '🇳🇬', rate: 1540.00 },
  ZAR: { symbol: 'R', country: 'ZA', flag: '🇿🇦', rate: 18.50 },
  GHS: { symbol: '₵', country: 'GH', flag: '🇬🇭', rate: 13.80 },
  EGP: { symbol: '£', country: 'EG', flag: '🇪🇬', rate: 50.00 },
  ETB: { symbol: 'Br', country: 'ET', flag: '🇪🇹', rate: 126.80 },
  MAD: { symbol: 'd.م.', country: 'MA', flag: '🇲🇦', rate: 9.80 },
  RWF: { symbol: 'FRw', country: 'RW', flag: '🇷🇼', rate: 1310.00 }
};

const countryToCurrency = {
  'US': 'USD', 'GB': 'GBP', 'IN': 'INR', 'DE': 'EUR', 'FR': 'EUR',
  'CA': 'CAD', 'AU': 'AUD', 'JP': 'USD', 'SG': 'USD', 'AE': 'USD',
  'KE': 'KES', 'TZ': 'TZS', 'UG': 'UGX', 'NG': 'NGN', 'ZA': 'ZAR',
  'GH': 'GHS', 'EG': 'EGP', 'ET': 'ETB', 'MA': 'MAD', 'RW': 'RWF'
};

let currentCurrency = 'USD';

// Detect user's currency based on IP location
async function detectUserCurrency() {
  // If the page doesn't have currency elements or dynamic prices, skip detection
  if (!document.getElementById('currencyCode') && !document.querySelector('[data-price]')) {
    return;
  }
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code;
    currentCurrency = countryToCurrency[countryCode] || 'USD';
    updateCurrencyDisplay();
  } catch (error) {
    console.log('Could not detect location, defaulting to USD');
    currentCurrency = 'USD';
    updateCurrencyDisplay();
  }
}

function updateCurrencyDisplay() {
  const currencyCode = document.getElementById('currencyCode');
  const currencyFlag = document.getElementById('currencyFlag');

  if (currencyCode) {
    currencyCode.textContent = currentCurrency;
  }
  if (currencyFlag && currencyData[currentCurrency]) {
    currencyFlag.textContent = currencyData[currentCurrency].flag;
  }

  updateAllPrices();
  updateDropdownSelection();
}

function updateAllPrices() {
  const rate = currencyData[currentCurrency].rate;
  const symbol = currencyData[currentCurrency].symbol;

  document.querySelectorAll('[data-price]').forEach(el => {
    const baseAmount = parseFloat(el.dataset.price);
    if (baseAmount === 0) {
      el.textContent = 'Free';
    } else {
      const convertedPrice = Math.round(baseAmount * rate);
      el.textContent = `${symbol}${convertedPrice.toLocaleString()}`;
    }
  });
}

function updateDropdownSelection() {
  document.querySelectorAll('.prg-currency-option').forEach(opt => {
    opt.style.background = 'transparent';
    opt.style.color = '#1a1a2e';
    opt.style.fontWeight = '500';
    if (opt.dataset.currency === currentCurrency) {
      opt.style.background = '#f0f0ff';
      opt.style.color = '#6366f1';
      opt.style.fontWeight = '600';
    }
  });
}

// Currency dropdown toggle
const currencyBtn = document.getElementById('currencyBtn');
if (currencyBtn) {
  currencyBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const dropdown = document.getElementById('currencyDropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
  });
}

// Currency selection
document.querySelectorAll('.prg-currency-option').forEach(option => {
  option.addEventListener('click', function () {
    currentCurrency = this.dataset.currency;
    document.getElementById('currencyDropdown').style.display = 'none';
    updateCurrencyDisplay();
  });
  option.addEventListener('mouseover', function () {
    this.style.background = '#f5f5f5';
  });
  option.addEventListener('mouseout', function () {
    if (this.dataset.currency !== currentCurrency) {
      this.style.background = 'transparent';
    }
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
  const dropdown = document.getElementById('currencyDropdown');
  if (!e.target.closest('div[style*="position: relative"]') && dropdown) {
    dropdown.style.display = 'none';
  }
});

// Initialize currency detection on page load
window.addEventListener('load', detectUserCurrency);

document.addEventListener('click', function (event) {
  const btn = event.target.closest('.faq-question');

  if (!btn) return;

  const item = btn.closest('.faq-item');
  const answer = item?.querySelector('.faq-answer');
  const faqList = item?.closest('.faq-list');

  if (!item || !answer || !faqList) return;

  const isOpen = item.classList.contains('open');

  faqList.querySelectorAll('.faq-item.open').forEach(function (openItem) {
    openItem.classList.remove('open');
    const openAnswer = openItem.querySelector('.faq-answer');
    const openBtn = openItem.querySelector('.faq-question');

    if (openAnswer) openAnswer.style.maxHeight = '0px';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  });

  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    btn.setAttribute('aria-expanded', 'true');
  } else {
    answer.style.maxHeight = '0px';
    btn.setAttribute('aria-expanded', 'false');
  }
});

// ===== WhatsApp floating widget =====
document.addEventListener('DOMContentLoaded', function () {
  const widget = document.querySelector('.whatsapp-widget');
  const toggleBtn = document.getElementById('whatsapp-toggle');
  const popup = document.getElementById('whatsapp-popup');
  const teaser = document.getElementById('whatsapp-teaser');
  const closeBtn = popup ? popup.querySelector('.whatsapp-popup-close') : null;
  const teaserCloseBtn = teaser ? teaser.querySelector('.whatsapp-teaser-close') : null;
  const badge = toggleBtn ? toggleBtn.querySelector('.whatsapp-badge') : null;
  // The "1" badge is a first-visit nudge, not a real unread-message count —
  // hide it permanently for this browser once they've ever opened the chat,
  // instead of showing "1" again on every fresh page load.
  var BADGE_SEEN_KEY = 'elunite_whatsapp_badge_seen';
  if (badge && localStorage.getItem(BADGE_SEEN_KEY)) {
    badge.hidden = true;
  }

  if (!widget || !toggleBtn || !popup) return;

  let audioCtx = null;
  let soundPending = false;
  let teaserTimer = null;

  function ensureAudioCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        audioCtx = null;
      }
    }
    return audioCtx;
  }

  function emitTone() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  function playPop() {
    const ctx = ensureAudioCtx();
    if (!ctx) return; // Web Audio unavailable — widget still works fine without sound
    if (ctx.state === 'suspended') {
      // Browser is blocking audio until the visitor interacts — queue it so the
      // very next click/tap/key/scroll plays it immediately (see unlock listeners below)
      soundPending = true;
      ctx.resume().then(function () {
        if (soundPending) {
          soundPending = false;
          emitTone();
        }
      }).catch(function () {});
      return;
    }
    emitTone();
  }

  // Prime the audio context on the visitor's very first interaction with the
  // page (not just when the teaser tries to play), so that by the time the
  // auto-greet fires the sound is already unlocked and plays right away.
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (evt) {
    window.addEventListener(
      evt,
      function () {
        const ctx = ensureAudioCtx();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume().then(function () {
            if (soundPending) {
              soundPending = false;
              emitTone();
            }
          }).catch(function () {});
        }
      },
      { passive: true }
    );
  });

  function openTeaser(withSound) {
    if (!teaser) return;
    teaser.classList.add('is-open');
    teaser.setAttribute('aria-hidden', 'false');
    if (withSound) playPop();
    window.clearTimeout(teaserTimer);
    teaserTimer = window.setTimeout(closeTeaser, 9000);
  }

  function closeTeaser() {
    if (!teaser) return;
    window.clearTimeout(teaserTimer);
    teaser.classList.remove('is-open');
    teaser.setAttribute('aria-hidden', 'true');
  }

  function openPopup() {
    closeTeaser();
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    if (badge) {
      badge.hidden = true;
      localStorage.setItem(BADGE_SEEN_KEY, '1');
    }
  }

  function closePopup() {
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
  }

  toggleBtn.addEventListener('click', function () {
    if (popup.classList.contains('is-open')) {
      closePopup();
    } else {
      openPopup();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePopup();
    });
  }

  if (teaserCloseBtn) {
    teaserCloseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeTeaser();
    });
  }

  document.addEventListener('click', function (e) {
    if (widget.contains(e.target)) return;
    if (popup.classList.contains('is-open')) closePopup();
    if (teaser && teaser.classList.contains('is-open')) closeTeaser();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closePopup();
    closeTeaser();
  });

  // Greet with a small teaser bubble + sound on every page view;
  // the full card only opens when the visitor actually clicks the icon.
  window.setTimeout(function () {
    openTeaser(true);
  }, 3000);
});

document.addEventListener('DOMContentLoaded', function () {
  // india.html FAQ accordion (pgi-* classes)
  document.querySelectorAll('.pgi-faq-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.pgi-faq-item');
      const isOpen = item.classList.contains('pgi-open');

      document.querySelectorAll('.pgi-faq-item.pgi-open').forEach(function (openItem) {
        openItem.classList.remove('pgi-open');
        openItem.querySelector('.pgi-faq-btn').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('pgi-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
});


// ===== LEAD CAPTURE MODAL — "Book Free Counselling" =====
document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('lead-modal');
  var form = document.getElementById('lead-modal-form');
  if (!modal || !form) return;

  var card = modal.querySelector('.lead-modal-card');
  var successEl = document.getElementById('lead-modal-success');
  var errorEl = document.getElementById('lead-modal-error');
  var closeEls = modal.querySelectorAll('[data-lead-modal-close]');
  var lastFocusedEl = null;
  // Tracks when the modal was last opened, so the bot time-trap below
  // measures fill speed from when the form actually appeared to the
  // visitor — not from page load, which could be long before they ever
  // clicked the CTA and would falsely flag a genuinely fast fill as a bot.
  var formRenderedAt = Date.now();

  function getFocusable() {
    return Array.prototype.slice
      .call(card.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      var focusables = getFocusable();
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openModal(trigger) {
    lastFocusedEl = trigger || document.activeElement;
    formRenderedAt = Date.now();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    form.hidden = false;
    successEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
    var focusables = getFocusable();
    if (focusables.length) focusables[0].focus();
    document.addEventListener('keydown', handleKeydown);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeydown);
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  closeEls.forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  // Only CTA buttons that express booking/consultation intent open the
  // modal — the plain "Contact" nav link (desktop menu, mobile drawer,
  // footer, Site Menu panel) still navigates to the real contact page.
  var TRIGGER_SELECTOR = [
    'a[href="contact.html"].btn-primary',
    'a[href="contact.html"].service-btn-primary',
    'a[href="contact.html"].success-cta-btn-solid',
    'a[href="contact.html"].sa-btn-outline',
    'a[href="contact.html"].sap-btn',
    'a[href="contact.html"].prg-btn',
    'a[href="contact.html"].btn-solid',
    'a[href="contact.html"].services-callout-btn-outline',
    'a[href="contact.html"].elu-inline-link',
    'a[href="contact.html"].svd-btn-dark',
    'a[href="contact.html"].svd-final-btn',
    'a[href="contact.html"].sas-hero-btn-outline',
    'a[href="contact.html"].sas-hero-btn-primary',
    'a[href="contact.html"].sep-hero-btn-outline',
    'a[href="contact.html"].mcb-hero-btn-outline',
    'a[href="contact.html"].wab-hero-btn-outline',
    'a[href="contact.html"].wab-context-cta',
    'a[href="contact.html"].wab-final-btn-outline',
    'a[href="contact.html"].cit-hero-btn-outline',
    'a[href="contact.html"].cit-context-cta',
    'a[href="contact.html"].cit-final-btn-outline',
    '.cit-call-links a[href="contact.html"]',
    'a[href="contact.html"].bsd-hero-btn-outline',
    'a[href="contact.html"].bsd-context-cta',
    'a[href="contact.html"].blog-hero-btn-primary',
  ].join(', ');

  document.querySelectorAll(TRIGGER_SELECTOR).forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(trigger);
    });
  });

  // ----- Validation -----
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

  function setFieldError(field, message) {
    if (!field) return;
    var errorEl = field.querySelector('.lead-field-error');
    field.classList.toggle('lead-field-invalid', !!message);
    if (errorEl) errorEl.textContent = message || '';
  }

  function validateForm() {
    var valid = true;

    var nameInput = document.getElementById('lead-name');
    if (!nameInput.value.trim()) {
      setFieldError(nameInput.closest('.lead-field'), 'Please enter your first name');
      valid = false;
    } else {
      setFieldError(nameInput.closest('.lead-field'), '');
    }

    var cityInput = document.getElementById('lead-home-country');
    if (!cityInput.value) {
      setFieldError(cityInput.closest('.lead-field'), 'Please select your country');
      valid = false;
    } else {
      setFieldError(cityInput.closest('.lead-field'), '');
    }

    var emailInput = document.getElementById('lead-email');
    if (!EMAIL_RE.test(emailInput.value.trim())) {
      setFieldError(emailInput.closest('.lead-field'), 'Enter a valid email address');
      valid = false;
    } else {
      setFieldError(emailInput.closest('.lead-field'), '');
    }

    var phoneInput = document.getElementById('lead-phone');
    var digitsOnly = phoneInput.value.replace(/[^0-9]/g, '');
    if (!PHONE_RE.test(phoneInput.value.trim()) || digitsOnly.length < 7 || digitsOnly.length > 15) {
      setFieldError(phoneInput.closest('.lead-field'), 'Enter a valid phone number');
      valid = false;
    } else {
      setFieldError(phoneInput.closest('.lead-field'), '');
    }

    var countryInput = document.getElementById('lead-country');
    if (!countryInput.value) {
      setFieldError(countryInput.closest('.lead-field'), 'Please select your preferred study destination');
      valid = false;
    } else {
      setFieldError(countryInput.closest('.lead-field'), '');
    }

    return valid;
  }

  // ----- Submission (shared anti-spam + Formspree handler used by all
  // three lead forms on the site) -----
  initLeadFormSubmit(form, {
    submitBtn: form.querySelector('.lead-modal-submit'),
    cooldownKey: 'elunite_lead_modal_last_submit',
    getRenderedAt: function () { return formRenderedAt; },
    validate: validateForm,
    onCooldown: function (submitBtn) {
      if (!submitBtn) return;
      var original = submitBtn.textContent;
      submitBtn.textContent = 'Already sent — please wait';
      setTimeout(function () {
        submitBtn.textContent = original;
      }, 3000);
    },
    beforeSubmit: function (form) {
      form.querySelector('.lead-modal-timestamp').value = new Date().toISOString();
      form.querySelector('.lead-modal-source-page').value = window.location.pathname;
    },
    onSuccess: function () {
      form.hidden = true;
      successEl.hidden = false;
      if (errorEl) errorEl.hidden = true;
      var focusables = getFocusable();
      if (focusables.length) focusables[0].focus();
    },
    onError: function () {
      // Keep the filled-in form visible so they can retry without
      // re-typing everything, and show a real error instead of a fake
      // success message.
      if (errorEl) errorEl.hidden = false;
    },
  });
});


// ===== PROCESS SECTION LEAD FORM (index.html "From application to
// boarding pass" card) — same Formspree + WhatsApp fallback + anti-spam
// pattern as the other lead forms on the site =====
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('process-lead-form');
  if (!form) return;

  var msgEl = document.getElementById('pf-form-msg');
  var formRenderedAt = Date.now();
  var WHATSAPP_NUMBER = '918050306510';

  function showMessage(text) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.hidden = false;
    setTimeout(function () {
      msgEl.hidden = true;
    }, 8000);
  }

  function buildWhatsAppUrl() {
    var name = form.first_name.value.trim();
    var email = form.email.value.trim();
    var phone = form.phone.value.trim();
    var homeCountry = form.home_country.value;
    var country = form.destination_country.value;
    var message = form.message.value.trim();
    var waLines = [
      'Hi ELUNITE! My name is ' + name + '.',
      'Email: ' + email,
      'Phone: ' + phone,
      'Country: ' + homeCountry,
      'Destination: ' + country,
    ];
    if (message) waLines.push('Message: ' + message);
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(waLines.join('\n'));
  }

  initLeadFormSubmit(form, {
    submitBtn: form.querySelector('.lead-modal-submit'),
    cooldownKey: 'elunite_process_form_last_submit',
    getRenderedAt: function () { return formRenderedAt; },
    onCooldown: function () {
      showMessage("You've already sent this — our team has it. Please wait a moment before sending another.");
    },
    onSuccess: function () {
      var waUrl = buildWhatsAppUrl();
      showMessage("🎉 Thanks! We've got your details — opening WhatsApp so we can chat right away.");
      form.reset();
      setTimeout(function () { window.open(waUrl, '_blank', 'noopener'); }, 1200);
    },
    onError: function () {
      var waUrl = buildWhatsAppUrl();
      showMessage("We couldn't confirm your message went through. Opening WhatsApp so we don't miss you — please also try again shortly.");
      setTimeout(function () { window.open(waUrl, '_blank', 'noopener'); }, 1200);
    },
  });
});