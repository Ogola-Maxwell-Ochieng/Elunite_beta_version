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

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
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
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

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

    { title: 'Visa Assistance', href: 'visa_purchase.html' },

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



// ===== TESTIMONIALS DATA =====
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
    name: 'Nathalie Juma',
    image: 'images/students/Nathalie Maghembe.webp',
    program: 'Public Health',
    university: 'NIMS University, India',
    quote: 'From application essays to interview preparation, Elunite\'s comprehensive support helped me get into LSE. Their expertise is truly world-class.',
    rating: 5
  },
  {
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

// ===== TESTIMONIALS CAROUSEL =====
document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.getElementById('testimonials-carousel');
  const prevBtn = document.getElementById('testimonials-prev');
  const nextBtn = document.getElementById('testimonials-next');
  const dotsContainer = document.getElementById('testimonials-dots');

  if (!carousel || !prevBtn || !nextBtn || !dotsContainer) return;

  let currentIndex = 0;
  const total = testimonials.length;

  function renderTestimonials() {
    carousel.innerHTML = testimonials.map((t, index) => `
            <div class="testimonial-carousel-card" data-index="${index}">
                <div class="testimonial-header">
                    <img src="${t.image}" alt="${t.name}" class="testimonial-image"/>
                    <div class="testimonial-info">
                        <div class="testimonial-name">${t.name}</div>
                        <div class="testimonial-position">${t.program}</div>
                        <div class="testimonial-university">${t.university}</div>
                    </div>
                </div>
                <div class="testimonial-quote">
                    <div class="quote-icon">&#10077;</div>
                    <p>${t.quote}</p>
                </div>
                <div class="testimonial-rating">${'&#11088;'.repeat(Math.floor(t.rating))}</div>
            </div>
        `).join('');

    updateClasses();
    renderDots();
  }

  function updateClasses() {
    const cards = document.querySelectorAll('.testimonial-carousel-card');
    cards.forEach(card => card.classList.remove('active', 'prev', 'next'));
    const prevIndex = (currentIndex - 1 + total) % total;
    const nextIndex = (currentIndex + 1) % total;
    cards[currentIndex].classList.add('active');
    cards[prevIndex].classList.add('prev');
    cards[nextIndex].classList.add('next');
  }

  function renderDots() {
    dotsContainer.innerHTML = testimonials.map((_, i) =>
      `<span class="dot ${i === currentIndex ? 'active' : ''}" data-slide="${i}"></span>`
    ).join('');
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % total;
    updateClasses();
    renderDots();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + total) % total;
    updateClasses();
    renderDots();
  }

  function goToSlide(index) {
    currentIndex = index;
    updateClasses();
    renderDots();
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  dotsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dot')) {
      goToSlide(parseInt(e.target.dataset.slide));
    }
  });

  // Defer the actual card render (10 cards + images via innerHTML) off the
  // critical rendering path so it doesn't block first paint / interactivity.
  var scheduleIdle = window.requestIdleCallback || function (fn) { setTimeout(fn, 200); };
  scheduleIdle(function () {
    renderTestimonials();
    setInterval(nextSlide, 6000);
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
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const platform = this.dataset.platform;
      const urls = {
        facebook: 'https://www.facebook.com/elunite/',
        instagram: 'https://www.instagram.com/elunite_education/',
        linkedin: 'https://linkedin.com/company/elunite',
        twitter: 'https://x.com/EluniteEd'
      };
      if (urls[platform]) window.open(urls[platform], '_blank', 'noopener,noreferrer');
    });
  });
});


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

// Mobile menu
const btn = document.getElementById("mobile-menu-btn");
const menu = document.getElementById("mobile-menu");
if (btn && menu) {
  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("hidden") === false;
    btn.setAttribute("aria-expanded", open);
    btn.querySelector(".menu-icon").classList.toggle("hidden", open);
    btn.querySelector(".close-icon").classList.toggle("hidden", !open);
  });
}

// Navbar scroll
window.addEventListener("scroll", () => {
  document
    .getElementById("navbar")
    ?.classList.toggle("scrolled", window.scrollY > 50);
});


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

// Filter functionality
document.querySelectorAll('.prg-filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const filter = this.dataset.filter;

    document.querySelectorAll('.prg-filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    document.querySelectorAll('.prg-card').forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = '';
        setTimeout(() => card.style.opacity = '1', 10);
      } else {
        card.style.opacity = '0';
        setTimeout(() => card.style.display = 'none', 300);
      }
    });
  });
});


// ── CONTACT POPUP ──
function openContactModal() {
  document.getElementById('contact-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeContactModal() {
  document.getElementById('contact-modal').classList.remove('open');
  document.getElementById('modal-form-body').style.display = 'block';
  document.getElementById('modal-success').style.display = 'none';
  document.body.style.overflow = '';
}
function submitContactForm() {
  const name = document.getElementById('m-name').value.trim();
  const country = document.getElementById('m-country').value;
  const email = document.getElementById('m-email').value.trim();
  const phone = document.getElementById('m-phone').value.trim();

  if (!name || !country || !email || !phone) {
    alert('Please fill in all required fields.');
    return;
  }
  // ── Swap below with your real API/form submission ──
  document.getElementById('modal-form-body').style.display = 'none';
  document.getElementById('modal-success').style.display = 'block';
  setTimeout(closeContactModal, 2800);
}

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeContactModal();
});

// Hook your CTA buttons — add data-open-modal to any button you want
document.querySelectorAll('[data-open-modal]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    openContactModal();
  });
});

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
    if (badge) badge.hidden = true;
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