/**
 * Manufacturing/Industrial Company Website - Main JavaScript
 * Vanilla JS - No frameworks required
 */

(function() {
    'use strict';

    // =========================================================================
    // Mobile Navigation Toggle
    // =========================================================================
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.getElementById('header');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }

    // Close mobile nav when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(function(link) {
        link.addEventListener('click', function() {
            if (mobileToggle) {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        });
    });

    // =========================================================================
    // Sticky Header on Scroll
    // =========================================================================
    let lastScrollY = 0;
    const topBar = document.querySelector('.top-bar');

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.classList.add('scrolled');
            if (topBar) {
                topBar.classList.add('hidden');
            }
        } else {
            header.classList.remove('scrolled');
            if (topBar) {
                topBar.classList.remove('hidden');
            }
        }

        lastScrollY = currentScrollY;
    });

    // =========================================================================
    // Product Carousel / Slider
    // =========================================================================
    const carousel = document.querySelector('.product-carousel');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    if (carousel && prevBtn && nextBtn) {
        let currentSlide = 0;
        const slides = carousel.querySelectorAll('.product-slide');
        const totalSlides = slides.length;
        const slidesPerView = getSlidesPerView();

        function getSlidesPerView() {
            if (window.innerWidth < 768) return 1;
            if (window.innerWidth < 1024) return 2;
            return 3;
        }

        function updateCarousel() {
            const slideWidth = slides[0].offsetWidth;
            const gap = 30;
            carousel.style.transform = 'translateX(-' + (currentSlide * (slideWidth + gap)) + 'px)';
        }

        prevBtn.addEventListener('click', function() {
            currentSlide = Math.max(0, currentSlide - 1);
            updateCarousel();
        });

        nextBtn.addEventListener('click', function() {
            const maxSlide = totalSlides - getSlidesPerView();
            currentSlide = Math.min(maxSlide, currentSlide + 1);
            updateCarousel();
        });

        window.addEventListener('resize', function() {
            currentSlide = 0;
            updateCarousel();
        });
    }

    // =========================================================================
    // Scroll-triggered Animations (Intersection Observer)
    // =========================================================================
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(function(el) {
            observer.observe(el);
        });
    } else {
        // Fallback: show all elements immediately
        animatedElements.forEach(function(el) {
            el.classList.add('animated');
        });
    }

    // =========================================================================
    // Counter Animation for Statistics
    // =========================================================================
    const counters = document.querySelectorAll('.stat-value');

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);
            el.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    if ('IntersectionObserver' in window && counters.length > 0) {
        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function(counter) {
            counterObserver.observe(counter);
        });
    }

    // =========================================================================
    // Smooth Scroll for Anchor Links
    // =========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var headerOffset = header ? header.offsetHeight : 0;
                var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =========================================================================
    // Newsletter Form Submission
    // =========================================================================
    var newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var emailInput = this.querySelector('input[type="email"]');
            var email = emailInput.value.trim();

            if (email && isValidEmail(email)) {
                // Show success state
                var btn = this.querySelector('button[type="submit"]');
                var originalText = btn.textContent;
                btn.textContent = 'Subscribed!';
                btn.classList.add('success');
                emailInput.value = '';

                setTimeout(function() {
                    btn.textContent = originalText;
                    btn.classList.remove('success');
                }, 3000);
            }
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // =========================================================================
    // Back to Top Button
    // =========================================================================
    var backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

})();
