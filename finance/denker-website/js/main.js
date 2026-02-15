/**
 * Finance Investment Company Website - Main JavaScript
 * Template: finance-denker-website-v1
 *
 * Vanilla JavaScript for interactive elements:
 * - Mobile hamburger menu toggle
 * - Smooth scrolling for anchor links
 * - Header scroll effect (sticky/shadow)
 * - Dropdown menus for navigation items
 * - Hero pagination dots
 * - Newsletter form handling
 * - Scroll-triggered fade-in animations
 */

(function () {
    'use strict';

    // =========================================
    // DOM Ready
    // =========================================
    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initSmoothScrolling();
        initHeaderScrollEffect();
        initDropdownMenus();
        initHeroPagination();
        initSubscribeForm();
        initScrollAnimations();
    });

    // =========================================
    // Mobile Hamburger Menu Toggle
    // =========================================
    function initMobileMenu() {
        var navToggle = document.querySelector('.nav-toggle');
        var navLinks = document.querySelector('.nav-links');
        var header = document.querySelector('.header');

        if (!navToggle || !navLinks) return;

        navToggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('active');
            navToggle.classList.toggle('active', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));

            // Prevent body scroll when menu is open on mobile
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close mobile menu when a link is clicked
        var links = navLinks.querySelectorAll('a');
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!header.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close mobile menu on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                navToggle.focus();
            }
        });
    }

    // =========================================
    // Smooth Scrolling for Anchor Links
    // =========================================
    function initSmoothScrolling() {
        var anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;

                var targetElement = document.querySelector(targetId);
                if (!targetElement) return;

                e.preventDefault();

                var header = document.querySelector('.header');
                var headerHeight = header ? header.offsetHeight : 0;
                var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL hash without jumping
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    // =========================================
    // Header Scroll Effect (Sticky Shadow)
    // =========================================
    function initHeaderScrollEffect() {
        var header = document.querySelector('.header');
        if (!header) return;

        var scrollThreshold = 50;
        var ticking = false;

        function updateHeader() {
            if (window.pageYOffset > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });

        // Run once on load in case page is already scrolled
        updateHeader();
    }

    // =========================================
    // Dropdown Menus for Navigation
    // =========================================
    function initDropdownMenus() {
        var dropdownItems = document.querySelectorAll('.has-dropdown');

        dropdownItems.forEach(function (item) {
            var link = item.querySelector('a');
            var chevron = item.querySelector('i');

            if (!link) return;

            // Toggle dropdown on click (mobile) or hover (desktop)
            link.addEventListener('click', function (e) {
                // On mobile, toggle the dropdown open/close state
                if (window.innerWidth <= 1024) {
                    item.classList.toggle('dropdown-open');
                    if (chevron) {
                        chevron.style.transform = item.classList.contains('dropdown-open')
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)';
                    }
                }
            });

            // Desktop hover behavior for chevron rotation
            item.addEventListener('mouseenter', function () {
                if (window.innerWidth > 1024 && chevron) {
                    chevron.style.transform = 'rotate(180deg)';
                }
            });

            item.addEventListener('mouseleave', function () {
                if (window.innerWidth > 1024 && chevron) {
                    chevron.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    // =========================================
    // Hero Pagination Dots
    // =========================================
    function initHeroPagination() {
        var dots = document.querySelectorAll('.hero-pagination .dot');
        if (dots.length === 0) return;

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                // Remove active class from all dots
                dots.forEach(function (d) {
                    d.classList.remove('active');
                });
                // Add active to clicked dot
                dot.classList.add('active');
            });
        });
    }

    // =========================================
    // Newsletter Subscribe Form
    // =========================================
    function initSubscribeForm() {
        var form = document.querySelector('.subscribe-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var emailInput = form.querySelector('input[type="email"]');
            if (!emailInput) return;

            var email = emailInput.value.trim();

            // Basic email validation
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                emailInput.style.borderColor = '#e74c3c';
                emailInput.setAttribute('aria-invalid', 'true');
                return;
            }

            // Reset validation styling
            emailInput.style.borderColor = '';
            emailInput.setAttribute('aria-invalid', 'false');

            // Visual feedback for successful submission
            var submitBtn = form.querySelector('.subscribe-btn');
            if (submitBtn) {
                var originalHTML = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-check"></i>';
                submitBtn.style.backgroundColor = '#27ae60';

                setTimeout(function () {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.backgroundColor = '';
                }, 2000);
            }

            // Clear the input
            emailInput.value = '';

            // Dispatch custom event for integration
            var event = new CustomEvent('newsletter:subscribe', {
                detail: { email: email }
            });
            document.dispatchEvent(event);
        });
    }

    // =========================================
    // Scroll-Triggered Fade-In Animations
    // =========================================
    function initScrollAnimations() {
        // Observe fund sections for entrance animations
        var sections = document.querySelectorAll('.fund-section');

        if (!('IntersectionObserver' in window)) {
            // Fallback: show all sections immediately
            sections.forEach(function (section) {
                section.style.opacity = '1';
            });
            return;
        }

        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var content = entry.target.querySelector('.fund-section__content');
                    var team = entry.target.querySelector('.fund-section__team') ||
                               entry.target.querySelector('.fund-section__partner');

                    if (content) {
                        content.classList.add('fade-in-up');
                    }
                    if (team) {
                        team.classList.add('fade-in-up', 'delay-2');
                    }

                    // Unobserve once animated
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

})();
