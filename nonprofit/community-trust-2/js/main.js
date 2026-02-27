/**
 * Nonprofit Community Trust Website Template
 * Main JavaScript - Interactive behaviors
 *
 * Features:
 * - Mobile menu toggle
 * - Smooth scrolling navigation
 * - Header scroll effect (sticky + shadow)
 * - Hero banner slider / carousel
 * - Intersection Observer for scroll animations
 * - Contact form validation
 */

(function () {
  'use strict';

  // ==========================================================================
  // DOM Element References
  // ==========================================================================
  const header = document.getElementById('header');
  const mainNav = document.getElementById('mainNav');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const heroSlider = document.getElementById('heroSlider');
  const heroDots = document.getElementById('heroDots');
  const contactForm = document.getElementById('contactForm');

  // ==========================================================================
  // Mobile Menu Toggle
  // ==========================================================================
  function initMobileMenu() {
    if (!mobileMenuToggle || !mainNav) return;

    mobileMenuToggle.addEventListener('click', function () {
      this.classList.toggle('active');
      mainNav.classList.toggle('header__nav--open');
      document.body.style.overflow = mainNav.classList.contains('header__nav--open') ? 'hidden' : '';
    });

    // Close menu when a nav link is clicked
    var navLinks = mainNav.querySelectorAll('.header__nav-link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenuToggle.classList.remove('active');
        mainNav.classList.remove('header__nav--open');
        document.body.style.overflow = '';
      });
    });
  }

  // ==========================================================================
  // Smooth Scrolling
  // ==========================================================================
  function initSmoothScrolling() {
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          var headerOffset = 200;
          var elementPosition = targetElement.getBoundingClientRect().top;
          var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ==========================================================================
  // Header Scroll Effect
  // ==========================================================================
  function initHeaderScrollEffect() {
    if (!header) return;

    var scrollThreshold = 50;

    function handleScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
  }

  // ==========================================================================
  // Hero Banner Slider / Carousel
  // ==========================================================================
  function initHeroSlider() {
    if (!heroSlider) return;

    var slides = heroSlider.querySelectorAll('.hero__slide');
    var dots = heroDots ? heroDots.querySelectorAll('.hero__dot') : [];
    var currentSlide = 0;
    var slideInterval = null;
    var autoplayDelay = 5000;

    function showSlide(index) {
      // Clamp index
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('hero__slide--active', i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('hero__dot--active', i === index);
      });

      currentSlide = index;
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function startAutoplay() {
      stopAutoplay();
      slideInterval = setInterval(nextSlide, autoplayDelay);
    }

    function stopAutoplay() {
      if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
      }
    }

    // Dot click handlers
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var slideIndex = parseInt(this.getAttribute('data-slide'), 10);
        showSlide(slideIndex);
        stopAutoplay();
        startAutoplay();
      });
    });

    // Touch / swipe support
    var touchStartX = 0;
    var touchEndX = 0;

    heroSlider.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSlider.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          showSlide(currentSlide + 1);
        } else {
          showSlide(currentSlide - 1);
        }
        stopAutoplay();
        startAutoplay();
      }
    }, { passive: true });

    // Start autoplay
    if (slides.length > 1) {
      startAutoplay();
    }
  }

  // ==========================================================================
  // Intersection Observer for Scroll Animations
  // ==========================================================================
  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (!animatedElements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      animatedElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show all elements immediately
      animatedElements.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  // ==========================================================================
  // Contact Form Validation
  // ==========================================================================
  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var isValid = true;
      var requiredFields = contactForm.querySelectorAll('[required]');

      requiredFields.forEach(function (field) {
        // Remove previous error styling
        field.style.borderColor = '';

        if (field.type === 'checkbox' && !field.checked) {
          isValid = false;
          field.style.borderColor = 'var(--error-color)';
        } else if (field.type === 'radio') {
          var radioGroup = contactForm.querySelectorAll('input[name="' + field.name + '"]');
          var isChecked = Array.from(radioGroup).some(function (radio) { return radio.checked; });
          if (!isChecked) {
            isValid = false;
          }
        } else if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = 'var(--error-color)';
        } else if (field.type === 'email' && !isValidEmail(field.value)) {
          isValid = false;
          field.style.borderColor = 'var(--error-color)';
        }
      });

      if (isValid) {
        // Form is valid - in a real implementation, this would submit to an endpoint
        var submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.textContent = 'Message Sent!';
          submitButton.style.opacity = '0.7';
          submitButton.disabled = true;

          setTimeout(function () {
            contactForm.reset();
            submitButton.textContent = submitButton.getAttribute('data-original-text') || 'Send Message';
            submitButton.style.opacity = '1';
            submitButton.disabled = false;
          }, 3000);
        }
      }
    });

    // Store original button text
    var submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.setAttribute('data-original-text', submitBtn.textContent);
    }
  }

  function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ==========================================================================
  // Active Navigation Link Highlighting
  // ==========================================================================
  function initActiveNavHighlight() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.header__nav-link');

    if (!sections.length || !navLinks.length) return;

    function highlightNav() {
      var scrollPosition = window.scrollY + 250;

      sections.forEach(function (section) {
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach(function (link) {
            link.classList.remove('header__nav-link--active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('header__nav-link--active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
  }

  // ==========================================================================
  // Initialize All Modules
  // ==========================================================================
  function init() {
    initMobileMenu();
    initSmoothScrolling();
    initHeaderScrollEffect();
    initHeroSlider();
    initScrollAnimations();
    initContactForm();
    initActiveNavHighlight();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
