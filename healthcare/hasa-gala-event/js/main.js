/**
 * HASA Gala Event Template - Main JavaScript
 * Handles: mobile menu, smooth scroll, accordion, scroll-based header
 */

(function () {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    const header = document.getElementById('header');
    const secretariatToggle = document.getElementById('secretariatToggle');
    const secretariatContent = document.getElementById('secretariatContent');

    // ========================================
    // Mobile Menu
    // ========================================
    let backdrop = null;

    function createBackdrop() {
        backdrop = document.createElement('div');
        backdrop.classList.add('nav-backdrop');
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', closeMobileMenu);
    }

    function openMobileMenu() {
        if (mobileToggle && navLinks) {
            mobileToggle.classList.add('active');
            navLinks.classList.add('active');
            if (backdrop) {
                backdrop.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        if (mobileToggle && navLinks) {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
            if (backdrop) {
                backdrop.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    }

    function toggleMobileMenu() {
        if (navLinks && navLinks.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    if (mobileToggle) {
        createBackdrop();
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu on nav link click
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // Close mobile menu on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    // ========================================
    // Smooth Scrolling
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                var headerHeight = header ? header.offsetHeight : 0;
                var announcementBar = document.querySelector('.announcement-bar');
                var announcementHeight = announcementBar ? announcementBar.offsetHeight : 0;
                var offsetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // Secretariat Accordion
    // ========================================
    if (secretariatToggle && secretariatContent) {
        secretariatToggle.addEventListener('click', function () {
            var isExpanded = this.getAttribute('aria-expanded') === 'true';

            this.setAttribute('aria-expanded', String(!isExpanded));
            secretariatContent.classList.toggle('active');
        });
    }

    // ========================================
    // Header Scroll Effect
    // ========================================
    var lastScrollY = 0;
    var headerHidden = false;

    function handleHeaderScroll() {
        var currentScrollY = window.pageYOffset;
        var scrollThreshold = 200;

        if (header) {
            // Add shadow on scroll
            if (currentScrollY > 10) {
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
            } else {
                header.style.boxShadow = 'none';
            }

            // Hide/show header on scroll direction
            if (currentScrollY > scrollThreshold && currentScrollY > lastScrollY && !headerHidden) {
                header.style.transform = 'translateY(-100%)';
                header.style.transition = 'transform 0.3s ease';
                headerHidden = true;
            } else if (currentScrollY < lastScrollY && headerHidden) {
                header.style.transform = 'translateY(0)';
                headerHidden = false;
            }
        }

        lastScrollY = currentScrollY;
    }

    var scrollTimeout;
    window.addEventListener('scroll', function () {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(handleHeaderScroll);
    }, { passive: true });

    // ========================================
    // Intersection Observer for Animations
    // ========================================
    if ('IntersectionObserver' in window) {
        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe detail items
        document.querySelectorAll('.detail-item').forEach(function (item, index) {
            item.style.opacity = '0';
            item.style.transform = 'translateY(24px)';
            item.style.transition = 'opacity 0.6s ease ' + (index * 0.15) + 's, transform 0.6s ease ' + (index * 0.15) + 's';
            observer.observe(item);
        });

        // Observe event details left
        var eventLeft = document.querySelector('.event-details-left');
        if (eventLeft) {
            eventLeft.style.opacity = '0';
            eventLeft.style.transform = 'translateY(24px)';
            eventLeft.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(eventLeft);
        }
    }

    // ========================================
    // Year auto-update (optional utility)
    // ========================================
    document.querySelectorAll('[data-auto-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

})();
