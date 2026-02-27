/**
 * Manufacturing Creative Factory Website Template
 * Template ID: manufacturing-fuse-factory-v1
 * Main JavaScript - Interactions and Animations
 */

(function () {
    'use strict';

    // ========== DOM ELEMENTS ==========
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-nav a');
    const testimonialsGrid = document.getElementById('testimonials-grid');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');

    // ========== MOBILE MENU TOGGLE ==========
    function toggleMobileMenu() {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when a link is clicked
    mobileMenuLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            if (mobileMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // Close mobile menu on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            toggleMobileMenu();
        }
    });

    // ========== HEADER SCROLL EFFECT ==========
    var lastScrollY = 0;
    var ticking = false;

    function updateHeader() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });

    // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                var headerHeight = header.offsetHeight;
                var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== TESTIMONIAL CAROUSEL ==========
    var testimonialCards = [];
    var currentSlide = 0;
    var cardsPerView = 3;

    function initTestimonialCarousel() {
        if (!testimonialsGrid) return;

        testimonialCards = Array.from(testimonialsGrid.querySelectorAll('.testimonial-card'));
        if (testimonialCards.length === 0) return;

        updateCardsPerView();
        window.addEventListener('resize', updateCardsPerView);
    }

    function updateCardsPerView() {
        var windowWidth = window.innerWidth;
        if (windowWidth <= 768) {
            cardsPerView = 1;
        } else if (windowWidth <= 1024) {
            cardsPerView = 2;
        } else {
            cardsPerView = 3;
        }
        currentSlide = 0;
        showSlide(currentSlide);
    }

    function showSlide(index) {
        testimonialCards.forEach(function (card, i) {
            if (i >= index && i < index + cardsPerView) {
                card.style.display = 'flex';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });
    }

    function nextSlide() {
        if (testimonialCards.length === 0) return;
        currentSlide += cardsPerView;
        if (currentSlide >= testimonialCards.length) {
            currentSlide = 0;
        }
        showSlide(currentSlide);
    }

    function prevSlide() {
        if (testimonialCards.length === 0) return;
        currentSlide -= cardsPerView;
        if (currentSlide < 0) {
            currentSlide = Math.max(0, testimonialCards.length - cardsPerView);
        }
        showSlide(currentSlide);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    initTestimonialCarousel();

    // ========== SCROLL ANIMATIONS (INTERSECTION OBSERVER) ==========
    function initScrollAnimations() {
        var animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without IntersectionObserver
            animatedElements.forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    initScrollAnimations();

    // ========== SUBSCRIBE FORM HANDLER ==========
    var subscribeForm = document.querySelector('.subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                // Placeholder: Replace with actual form submission logic
                var submitBtn = this.querySelector('button[type="submit"]');
                var originalText = submitBtn.textContent;
                submitBtn.textContent = 'Thank you!';
                emailInput.value = '';
                setTimeout(function () {
                    submitBtn.textContent = originalText;
                }, 3000);
            }
        });
    }

    // ========== YEAR AUTO-UPDATE ==========
    // Dynamically update the year placeholder if left as default
    var copyrightSpans = document.querySelectorAll('.footer-copyright span');
    copyrightSpans.forEach(function (span) {
        if (span.textContent.indexOf('{{YEAR}}') !== -1) {
            span.textContent = span.textContent.replace('{{YEAR}}', new Date().getFullYear());
        }
    });

})();
