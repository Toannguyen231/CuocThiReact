/* ========================================
   CHIẾU NẪU - Main JavaScript
   Animations, Interactions & Effects
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- Page Loader ---
  const loader = document.querySelector('.page-loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('loaded'), 400);
    });
    // Fallback in case load event already fired
    setTimeout(() => loader.classList.add('loaded'), 2000);
  }

  // --- Navbar Scroll Effect ---
  const navbar = document.querySelector('.navbar');
  const handleNavScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleNavScroll);
  handleNavScroll(); // Initial check

  // --- Mobile Navigation ---
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Parallax Hero Effect ---
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const rate = scrolled * 0.4;
      heroBg.style.transform = `translateY(${rate}px)`;
    });
  }

  // --- Scroll Reveal (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Accordion ---
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all accordions
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // --- Counter Animation ---
  const counters = document.querySelectorAll('.stat-number[data-target], .impact-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const update = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.floor(current) + (counter.dataset.suffix || '');
            requestAnimationFrame(update);
          } else {
            counter.textContent = target + (counter.dataset.suffix || '');
          }
        };
        update();
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // --- Back to Top ---
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Active nav link based on current page ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || 
        (currentPage === '' && href === 'index.html') ||
        (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Product Filter & Single Product View (san-pham.html) ---
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const productSections = document.querySelectorAll('.product-section-item');
  const filterBanner = document.getElementById('filterInfoBanner');
  const filterNameElem = document.getElementById('filterProductName');
  const resetBtn = document.getElementById('btnResetFilter');

  const productNameMap = {
    'tui-xach': 'Túi Xách Cói Bán Nguyệt',
    'lot-noi': 'Lót Nồi Cói Đan Thủ Công',
    'quat-coi': 'Quạt Cói Truyền Thống',
    'tui-deo-cheo': 'Túi Đeo Chéo Cói'
  };

  function applyProductFilter(filterId, updateHash = true) {
    if (!productSections.length) return;

    if (filterId === 'all' || !filterId || !productNameMap[filterId]) {
      // Show all products
      productSections.forEach(sec => sec.classList.remove('hidden-by-filter'));
      filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'all');
      });
      if (filterBanner) filterBanner.classList.remove('active');
      if (updateHash && window.location.hash) {
        history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    } else {
      // Show ONLY the single matching product section
      productSections.forEach(sec => {
        if (sec.dataset.productId === filterId) {
          sec.classList.remove('hidden-by-filter');
        } else {
          sec.classList.add('hidden-by-filter');
        }
      });
      filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filterId);
      });
      if (filterBanner) {
        filterBanner.classList.add('active');
        if (filterNameElem) filterNameElem.textContent = productNameMap[filterId] || filterId;
      }
      if (updateHash) {
        window.location.hash = filterId;
      }
      // Scroll smoothly to target section
      const targetSec = document.getElementById(filterId);
      if (targetSec) {
        setTimeout(() => {
          const offset = 90;
          const top = targetSec.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 100);
      }
    }
  }

  if (productSections.length) {
    // Initial check based on URL hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && productNameMap[initialHash]) {
      applyProductFilter(initialHash, false);
    }

    // Filter button click events
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyProductFilter(btn.dataset.filter, true);
      });
    });

    // Reset button click
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        applyProductFilter('all', true);
      });
    }

    // Hash change event
    window.addEventListener('hashchange', () => {
      const currentHash = window.location.hash.replace('#', '');
      applyProductFilter(currentHash || 'all', false);
    });
  }
});

