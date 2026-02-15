/**
 * Amandla Omoya Trust - Nonprofit Template
 * Main JavaScript
 */

(function () {
  'use strict';

  // ============================================
  // Mobile Menu Toggle
  // ============================================
  function initMobileMenu() {
    var toggle = document.getElementById('mobile-toggle');
    var nav = document.getElementById('nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
    });

    // Close mobile menu when clicking a nav link
    var navLinks = nav.querySelectorAll('.nav__link, .nav__cta');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('active');
        nav.classList.remove('active');
      });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        toggle.classList.remove('active');
        nav.classList.remove('active');
      }
    });
  }

  // ============================================
  // Smooth Scrolling
  // ============================================
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        var headerHeight = document.querySelector('.header').offsetHeight;
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  }

  // ============================================
  // Header Scroll Effect
  // ============================================
  function initHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;

    var scrollThreshold = 100;

    function updateHeader() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // ============================================
  // Hero Banner Slider
  // ============================================
  function initHeroSlider() {
    var slides = document.querySelectorAll('.hero__slide');
    var dots = document.querySelectorAll('.hero__dot');

    if (slides.length === 0) return;

    var currentSlide = 0;
    var slideInterval = null;
    var intervalDuration = 5000;

    function goToSlide(index) {
      slides.forEach(function (slide) {
        slide.classList.remove('active');
      });
      dots.forEach(function (dot) {
        dot.classList.remove('active');
      });

      currentSlide = index;
      if (currentSlide >= slides.length) currentSlide = 0;
      if (currentSlide < 0) currentSlide = slides.length - 1;

      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) {
        dots[currentSlide].classList.add('active');
      }
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function startAutoPlay() {
      slideInterval = setInterval(nextSlide, intervalDuration);
    }

    function stopAutoPlay() {
      if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
      }
    }

    // Dot click handlers
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var slideIndex = parseInt(this.getAttribute('data-slide'), 10);
        stopAutoPlay();
        goToSlide(slideIndex);
        startAutoPlay();
      });
    });

    // Pause on hover
    var heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', stopAutoPlay);
      heroSection.addEventListener('mouseleave', startAutoPlay);
    }

    // Start autoplay
    startAutoPlay();
  }

  // ============================================
  // Intersection Observer for Scroll Animations
  // ============================================
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');

    if (elements.length === 0) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      elements.forEach(function (element) {
        observer.observe(element);
      });
    } else {
      // Fallback: show all elements immediately
      elements.forEach(function (element) {
        element.classList.add('visible');
      });
    }
  }

  // ============================================
  // Contact Form Handler
  // ============================================
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });

      // Placeholder for form submission logic
      // In production, this would send to an API endpoint
      console.log('Form submitted:', data);

      // Show success feedback
      var submitBtn = form.querySelector('.contact__form-submit');
      var originalText = submitBtn.textContent;
      submitBtn.textContent = 'Message Sent!';
      submitBtn.style.opacity = '0.8';
      submitBtn.disabled = true;

      setTimeout(function () {
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
        form.reset();
      }, 3000);
    });
  }

  // ============================================
  // Active Nav Link Highlight
  // ============================================
  function initActiveNavHighlight() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav__link');

    if (sections.length === 0 || navLinks.length === 0) return;

    function updateActiveLink() {
      var scrollPos = window.scrollY + 200;

      sections.forEach(function (section) {
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          navLinks.forEach(function (link) {
            link.classList.remove('nav__link--active');
            var href = link.getAttribute('href');
            if (href === '#' + sectionId) {
              link.classList.add('nav__link--active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
  }

  // ============================================
  // Initialize All
  // ============================================
  function init() {
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initHeroSlider();
    initScrollAnimations();
    initContactForm();
    initActiveNavHighlight();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
