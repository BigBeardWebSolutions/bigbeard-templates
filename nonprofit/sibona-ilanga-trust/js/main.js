/**
 * Sibona Ilanga Trust - Nonprofit Template JavaScript
 * Features: Hero slider, mobile menu, scroll effects, smooth scrolling, animations
 */
(function () {
  'use strict';

  /* ================================================================
     HERO BANNER SLIDER / CAROUSEL
     ================================================================ */
  const heroSlider = {
    slides: [],
    dots: [],
    currentIndex: 0,
    intervalId: null,
    autoPlayDelay: 5000,

    init: function () {
      this.slides = document.querySelectorAll('.hero__slide');
      this.dots = document.querySelectorAll('.hero__dot');

      if (this.slides.length === 0) return;

      // Attach dot click listeners
      this.dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          heroSlider.goToSlide(index);
          heroSlider.resetAutoPlay();
        });
      });

      // Start auto-play
      this.startAutoPlay();
    },

    goToSlide: function (index) {
      // Remove active from current
      if (this.slides[this.currentIndex]) {
        this.slides[this.currentIndex].classList.remove('active');
      }
      if (this.dots[this.currentIndex]) {
        this.dots[this.currentIndex].classList.remove('active');
      }

      // Set new index
      this.currentIndex = index;

      // Add active to new
      if (this.slides[this.currentIndex]) {
        this.slides[this.currentIndex].classList.add('active');
      }
      if (this.dots[this.currentIndex]) {
        this.dots[this.currentIndex].classList.add('active');
      }
    },

    nextSlide: function () {
      var nextIndex = (this.currentIndex + 1) % this.slides.length;
      this.goToSlide(nextIndex);
    },

    startAutoPlay: function () {
      this.intervalId = setInterval(function () {
        heroSlider.nextSlide();
      }, this.autoPlayDelay);
    },

    resetAutoPlay: function () {
      clearInterval(this.intervalId);
      this.startAutoPlay();
    }
  };

  /* ================================================================
     MOBILE MENU TOGGLE
     ================================================================ */
  const mobileMenu = {
    toggle: null,
    navList: null,

    init: function () {
      this.toggle = document.querySelector('.header__menu-toggle');
      this.navList = document.getElementById('nav-list');

      if (!this.toggle || !this.navList) return;

      this.toggle.addEventListener('click', function () {
        mobileMenu.toggleMenu();
      });

      // Close menu when clicking a nav link
      var navLinks = this.navList.querySelectorAll('.header__nav-link');
      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.closeMenu();
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', function (e) {
        if (!mobileMenu.toggle.contains(e.target) && !mobileMenu.navList.contains(e.target)) {
          mobileMenu.closeMenu();
        }
      });
    },

    toggleMenu: function () {
      var isOpen = this.navList.classList.toggle('open');
      this.toggle.classList.toggle('active');
      this.toggle.setAttribute('aria-expanded', isOpen);
    },

    closeMenu: function () {
      this.navList.classList.remove('open');
      this.toggle.classList.remove('active');
      this.toggle.setAttribute('aria-expanded', 'false');
    }
  };

  /* ================================================================
     HEADER SCROLL EFFECT
     ================================================================ */
  const headerScroll = {
    header: null,

    init: function () {
      this.header = document.getElementById('header');
      if (!this.header) return;

      window.addEventListener('scroll', function () {
        headerScroll.onScroll();
      }, { passive: true });
    },

    onScroll: function () {
      if (window.scrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    }
  };

  /* ================================================================
     SMOOTH SCROLLING (for anchor links)
     ================================================================ */
  const smoothScroll = {
    init: function () {
      var anchors = document.querySelectorAll('a[href^="#"]');
      anchors.forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
          var targetId = this.getAttribute('href');
          if (targetId === '#') return;

          var target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            var headerHeight = document.getElementById('header')
              ? document.getElementById('header').offsetHeight
              : 0;
            var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  };

  /* ================================================================
     INTERSECTION OBSERVER - SCROLL ANIMATIONS
     ================================================================ */
  const scrollAnimations = {
    init: function () {
      var fadeElements = document.querySelectorAll('.fade-in');

      if (fadeElements.length === 0) return;

      // Check if IntersectionObserver is supported
      if (!('IntersectionObserver' in window)) {
        // Fallback: show all elements
        fadeElements.forEach(function (el) {
          el.classList.add('visible');
        });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
      });

      fadeElements.forEach(function (el) {
        observer.observe(el);
      });
    }
  };

  /* ================================================================
     ACTIVE NAV LINK HIGHLIGHTING
     ================================================================ */
  const activeNav = {
    init: function () {
      var sections = document.querySelectorAll('section[id]');
      var navLinks = document.querySelectorAll('.header__nav-link');

      if (sections.length === 0 || navLinks.length === 0) return;

      if (!('IntersectionObserver' in window)) return;

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var sectionId = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.remove('header__nav-link--active');
              if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('header__nav-link--active');
              }
            });
          }
        });
      }, {
        root: null,
        rootMargin: '-30% 0px -70% 0px',
        threshold: 0
      });

      sections.forEach(function (section) {
        observer.observe(section);
      });
    }
  };

  /* ================================================================
     INITIALISE ALL MODULES
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    heroSlider.init();
    mobileMenu.init();
    headerScroll.init();
    smoothScroll.init();
    scrollAnimations.init();
    activeNav.init();
  });

})();
