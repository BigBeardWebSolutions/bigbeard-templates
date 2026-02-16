/**
 * Digital Marketing Agency Template - Main JavaScript
 * Handles: Mobile menu, smooth scroll, header scroll effect,
 * service accordion, approach step navigation, partner/client carousels,
 * video play button handler.
 */
(function () {
  'use strict';

  // ============================================
  // DOM READY
  // ============================================
  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeaderScrollEffect();
    initSmoothScroll();
    initServiceAccordion();
    initApproachSteps();
    initPartnerCarousel();
    initClientCarousel();
    initVideoPlayButton();
  });

  // ============================================
  // MOBILE MENU TOGGLE
  // ============================================
  function initMobileMenu() {
    var menuToggle = document.getElementById('menuToggle');
    var mobileMenu = document.getElementById('mobileMenu');
    var menuClose = document.getElementById('menuClose');

    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    if (menuClose) {
      menuClose.addEventListener('click', function () {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close menu when clicking a link
    var menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  function initHeaderScrollEffect() {
    var header = document.getElementById('header');
    if (!header) return;

    var scrollThreshold = 50;

    function handleScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();

        var headerHeight = document.querySelector('.header')
          ? document.querySelector('.header').offsetHeight
          : 0;

        var targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  }

  // ============================================
  // SERVICE ACCORDION
  // ============================================
  function initServiceAccordion() {
    var serviceItems = document.querySelectorAll('.service-item');

    serviceItems.forEach(function (item) {
      var header = item.querySelector('.service-item__header');
      if (!header) return;

      header.addEventListener('click', function () {
        var isActive = item.classList.contains('active');

        // Close all items
        serviceItems.forEach(function (otherItem) {
          otherItem.classList.remove('active');
        });

        // Toggle clicked item
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // ============================================
  // APPROACH STEPS NAVIGATION
  // ============================================
  function initApproachSteps() {
    var stepIndicators = document.querySelectorAll(
      '.approach__step-indicator'
    );
    var stepLabel = document.getElementById('stepLabel');
    var stepDescription = document.getElementById('stepDescription');
    var stepPrev = document.getElementById('stepPrev');
    var stepNext = document.getElementById('stepNext');

    if (!stepIndicators.length || !stepLabel || !stepDescription) return;

    var currentStep = 1;
    var totalSteps = stepIndicators.length;

    // Step data is driven by placeholder tokens in the HTML.
    // We read the data-step attribute from each indicator button.
    // The actual content replacement is handled by the template engine.

    function setActiveStep(stepNum) {
      currentStep = stepNum;

      stepIndicators.forEach(function (indicator) {
        var indicatorStep = parseInt(indicator.getAttribute('data-step'), 10);
        if (indicatorStep === stepNum) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }

    // Click on step indicator tabs
    stepIndicators.forEach(function (indicator) {
      indicator.addEventListener('click', function () {
        var step = parseInt(this.getAttribute('data-step'), 10);
        setActiveStep(step);
      });
    });

    // Previous button
    if (stepPrev) {
      stepPrev.addEventListener('click', function () {
        var prevStep = currentStep - 1;
        if (prevStep < 1) prevStep = totalSteps;
        setActiveStep(prevStep);
      });
    }

    // Next button
    if (stepNext) {
      stepNext.addEventListener('click', function () {
        var nextStep = currentStep + 1;
        if (nextStep > totalSteps) nextStep = 1;
        setActiveStep(nextStep);
      });
    }
  }

  // ============================================
  // PARTNER LOGO CAROUSEL
  // ============================================
  function initPartnerCarousel() {
    var carousel = document.getElementById('partnersCarousel');
    var prevBtn = document.getElementById('partnersPrev');
    var nextBtn = document.getElementById('partnersNext');

    if (!carousel || !prevBtn || !nextBtn) return;

    var scrollAmount = 300;

    prevBtn.addEventListener('click', function () {
      carousel.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    });

    nextBtn.addEventListener('click', function () {
      carousel.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    });
  }

  // ============================================
  // CLIENT LOGO CAROUSEL
  // ============================================
  function initClientCarousel() {
    var carousel = document.getElementById('clientsCarousel');
    var prevBtn = document.getElementById('clientsPrev');
    var nextBtn = document.getElementById('clientsNext');

    if (!carousel || !prevBtn || !nextBtn) return;

    var scrollAmount = 300;

    prevBtn.addEventListener('click', function () {
      carousel.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    });

    nextBtn.addEventListener('click', function () {
      carousel.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    });
  }

  // ============================================
  // VIDEO PLAY BUTTON HANDLER
  // ============================================
  function initVideoPlayButton() {
    var videoPlayBtn = document.getElementById('videoPlayBtn');
    if (!videoPlayBtn) return;

    videoPlayBtn.addEventListener('click', function () {
      // Dispatch a custom event for template consumers to handle
      var event = new CustomEvent('videoPlay', {
        detail: { source: 'hero-video' },
      });
      document.dispatchEvent(event);

      // Default behavior: log to console for template development
      console.log('Video play button clicked. Attach your video handler via the "videoPlay" custom event.');
    });
  }
})();
