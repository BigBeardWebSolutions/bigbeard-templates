/**
 * Sosimple Energy Template - Main JavaScript
 * Handles interactivity, navigation, scroll effects, and animations
 */

(function () {
  'use strict';

  // ============================================
  // DOM Elements
  // ============================================
  const header = document.getElementById('header');
  const navLinks = document.getElementById('nav-links');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const savingsCalculator = document.getElementById('savings-calculator');
  const chatWidget = document.getElementById('chat-widget');
  const chatTrigger = document.getElementById('chat-trigger');

  // ============================================
  // Mobile Menu Toggle
  // ============================================
  function initMobileMenu() {
    if (!mobileMenuToggle || !navLinks) return;

    mobileMenuToggle.addEventListener('click', function () {
      mobileMenuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a nav link
    var links = navLinks.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================
  // Header Scroll Effect
  // ============================================
  function initHeaderScroll() {
    if (!header) return;

    var lastScrollY = 0;
    var scrollThreshold = 100;

    function handleScroll() {
      var currentScrollY = window.scrollY;

      if (currentScrollY > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run on init
  }

  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();

        var headerHeight = header ? header.offsetHeight : 0;
        var targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  }

  // ============================================
  // Active Navigation Link on Scroll
  // ============================================
  function initActiveNav() {
    if (!navLinks) return;

    var sections = document.querySelectorAll('section[id]');
    var links = navLinks.querySelectorAll('a[href^="#"]');

    function updateActiveLink() {
      var scrollY = window.scrollY;
      var headerHeight = header ? header.offsetHeight : 0;

      sections.forEach(function (section) {
        var sectionTop = section.offsetTop - headerHeight - 100;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          links.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  // ============================================
  // Intersection Observer for Scroll Animations
  // ============================================
  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (!animatedElements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
      });

      animatedElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show all elements immediately
      animatedElements.forEach(function (el) {
        el.classList.add('animated');
      });
    }
  }

  // ============================================
  // Savings Calculator
  // ============================================
  function initCalculator() {
    if (!savingsCalculator) return;

    savingsCalculator.addEventListener('submit', function (e) {
      e.preventDefault();

      var formData = new FormData(savingsCalculator);
      var data = {};

      formData.forEach(function (value, key) {
        data[key] = value;
      });

      // Validate required fields
      if (!data.monthly_spend || !data.operating_hours || !data.name || !data.email) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }

      // Email validation
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
      }

      // Calculate estimated savings (simplified estimation)
      var spendRange = data.monthly_spend;
      var savingsPercent = 30; // Default 30% savings
      var minSpend = parseInt(spendRange.split('-')[0]) || 100000;
      var estimatedSavings = Math.round(minSpend * (savingsPercent / 100));

      showNotification(
        'Thank you, ' + data.name + '! Based on your inputs, you could save approximately R' +
        estimatedSavings.toLocaleString() + ' per month. We will contact you at ' + data.email +
        ' with a detailed analysis.',
        'success'
      );

      // Reset form
      savingsCalculator.reset();
    });
  }

  // ============================================
  // Notification System
  // ============================================
  function showNotification(message, type) {
    // Remove existing notifications
    var existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    var notification = document.createElement('div');
    notification.className = 'notification notification-' + (type || 'info');
    notification.style.cssText = [
      'position: fixed',
      'top: 100px',
      'right: 20px',
      'max-width: 400px',
      'padding: 20px 24px',
      'border-radius: 12px',
      'font-family: var(--font-family)',
      'font-size: 16px',
      'line-height: 1.5',
      'z-index: 10000',
      'box-shadow: 0 4px 20px rgba(0,0,0,0.15)',
      'transform: translateX(120%)',
      'transition: transform 0.4s ease',
      'color: #ffffff'
    ].join(';');

    if (type === 'success') {
      notification.style.backgroundColor = '#0b74d7';
    } else if (type === 'error') {
      notification.style.backgroundColor = '#e74c3c';
    } else {
      notification.style.backgroundColor = '#333333';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        notification.style.transform = 'translateX(0)';
      });
    });

    // Auto-dismiss after 6 seconds
    setTimeout(function () {
      notification.style.transform = 'translateX(120%)';
      setTimeout(function () {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, 6000);
  }

  // ============================================
  // Chat Widget
  // ============================================
  function initChatWidget() {
    var chatBtns = [chatWidget, chatTrigger].filter(Boolean);

    chatBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (e.target.closest('button')) {
          showNotification('Chat feature coming soon! Please contact us via email or phone.', 'info');
        }
      });
    });
  }

  // ============================================
  // Stat Counter Animation
  // ============================================
  function initStatCounters() {
    var statValues = document.querySelectorAll('.stat-value');

    if (!statValues.length) return;

    function animateCounter(element) {
      var text = element.textContent.trim();
      var hasPlus = text.includes('+');
      var hasSlash = text.includes('/');
      var hasComma = text.includes(',');

      // Skip complex formats like "24/7" or "4.5/5"
      if (hasSlash) return;

      var numericText = text.replace(/[^0-9.]/g, '');
      var targetValue = parseFloat(numericText);

      if (isNaN(targetValue) || targetValue === 0) return;

      var duration = 2000;
      var startTime = null;
      var startValue = 0;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var currentValue = startValue + (targetValue - startValue) * easedProgress;

        // Format the number
        var formatted;
        if (hasComma) {
          formatted = Math.round(currentValue).toLocaleString();
        } else if (text.includes('.')) {
          formatted = currentValue.toFixed(1);
        } else {
          formatted = Math.round(currentValue).toString();
        }

        // Restore original formatting
        if (hasPlus) formatted += '+';

        element.textContent = formatted;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Restore exact original text
          element.textContent = text;
        }
      }

      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.5
      });

      statValues.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  // ============================================
  // Partner Logo Carousel (for mobile)
  // ============================================
  function initPartnerCarousel() {
    var partnersGrid = document.querySelector('.partners-grid');
    if (!partnersGrid) return;

    // Only enable on mobile
    if (window.innerWidth > 768) return;

    var logos = partnersGrid.querySelectorAll('.partner-logo');
    if (logos.length <= 3) return;

    var currentIndex = 0;
    var visibleCount = 3;

    function updateVisibility() {
      logos.forEach(function (logo, index) {
        if (index >= currentIndex && index < currentIndex + visibleCount) {
          logo.style.display = 'block';
        } else {
          logo.style.display = 'none';
        }
      });
    }

    // Auto-rotate every 3 seconds
    setInterval(function () {
      currentIndex = (currentIndex + 1) % (logos.length - visibleCount + 1);
      updateVisibility();
    }, 3000);

    updateVisibility();
  }

  // ============================================
  // Initialize All Features
  // ============================================
  function init() {
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
    initActiveNav();
    initScrollAnimations();
    initCalculator();
    initChatWidget();
    initStatCounters();
    initPartnerCarousel();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
