/**
 * HASA NHI Healthcare Template - Main JavaScript
 *
 * Features:
 * - Mobile menu toggle
 * - Smooth scroll navigation
 * - Header scroll effect (shadow on scroll)
 * - FAQ accordion toggle
 */

(function () {
    'use strict';

    /* -----------------------------------------------------------------------
       DOM References
       ----------------------------------------------------------------------- */
    const header = document.getElementById('header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const faqItems = document.querySelectorAll('.faq-item');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    /* -----------------------------------------------------------------------
       Mobile Menu Toggle
       ----------------------------------------------------------------------- */
    function initMobileMenu() {
        if (!mobileToggle || !navLinks) return;

        mobileToggle.addEventListener('click', function () {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu on click outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.nav') && navLinks.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    /* -----------------------------------------------------------------------
       Smooth Scroll Navigation
       ----------------------------------------------------------------------- */
    function initSmoothScroll() {
        navAnchors.forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = this.getAttribute('href');
                var targetElement = document.querySelector(targetId);

                if (targetElement) {
                    var headerHeight = header ? header.offsetHeight : 72;
                    var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* -----------------------------------------------------------------------
       Header Scroll Effect
       ----------------------------------------------------------------------- */
    function initHeaderScroll() {
        if (!header) return;

        var scrollThreshold = 50;

        function handleScroll() {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Debounce scroll for performance
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial check
        handleScroll();
    }

    /* -----------------------------------------------------------------------
       FAQ Accordion Toggle
       ----------------------------------------------------------------------- */
    function initFaqAccordion() {
        if (!faqItems.length) return;

        faqItems.forEach(function (item) {
            var question = item.querySelector('.faq-question');
            if (!question) return;

            question.addEventListener('click', function () {
                var isActive = item.classList.contains('active');

                // Close all FAQ items
                faqItems.forEach(function (otherItem) {
                    otherItem.classList.remove('active');
                    var otherQuestion = otherItem.querySelector('.faq-question');
                    if (otherQuestion) {
                        otherQuestion.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    /* -----------------------------------------------------------------------
       Active Nav Link Highlight on Scroll
       ----------------------------------------------------------------------- */
    function initActiveNavHighlight() {
        var sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        function highlightNav() {
            var scrollPosition = window.scrollY + 100;

            sections.forEach(function (section) {
                var sectionTop = section.offsetTop - 100;
                var sectionBottom = sectionTop + section.offsetHeight;
                var sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    navAnchors.forEach(function (anchor) {
                        anchor.classList.remove('active');
                        if (anchor.getAttribute('href') === '#' + sectionId) {
                            anchor.classList.add('active');
                        }
                    });
                }
            });
        }

        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    highlightNav();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /* -----------------------------------------------------------------------
       Initialize All
       ----------------------------------------------------------------------- */
    function init() {
        initMobileMenu();
        initSmoothScroll();
        initHeaderScroll();
        initFaqAccordion();
        initActiveNavHighlight();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
