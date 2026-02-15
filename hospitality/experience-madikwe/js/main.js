/**
 * Experience Madikwe - Safari Lodge Template - Main JavaScript
 *
 * Features:
 * - Mobile hamburger menu toggle
 * - Smooth scrolling for anchor links
 * - Header scroll effect (transparent to solid)
 * - Lodge gallery lightbox
 * - Intersection Observer for scroll animations (fade-in)
 * - Active nav link highlight on scroll
 */

(function () {
    'use strict';

    /* -----------------------------------------------------------------------
       DOM References
       ----------------------------------------------------------------------- */
    var header = document.getElementById('header');
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');
    var navAnchors = document.querySelectorAll('.nav-menu a[href^="#"]');
    var lodgeCards = document.querySelectorAll('.lodge-card');

    /* -----------------------------------------------------------------------
       Mobile Hamburger Menu Toggle
       ----------------------------------------------------------------------- */
    function initMobileMenu() {
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', function () {
            var isOpen = navMenu.classList.contains('open');
            navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(!isOpen));
            document.body.style.overflow = isOpen ? '' : 'hidden';
        });

        // Close menu when a nav link is clicked
        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu on click outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.header') && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    /* -----------------------------------------------------------------------
       Smooth Scrolling for Anchor Links
       ----------------------------------------------------------------------- */
    function initSmoothScroll() {
        navAnchors.forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = this.getAttribute('href');
                var targetElement = document.querySelector(targetId);

                if (targetElement) {
                    var headerHeight = header ? header.offsetHeight : 80;
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
       Header Scroll Effect (Transparent to Solid)
       ----------------------------------------------------------------------- */
    function initHeaderScroll() {
        if (!header) return;

        var scrollThreshold = 60;
        var ticking = false;

        function handleScroll() {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

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
       Lodge Gallery Lightbox
       ----------------------------------------------------------------------- */
    function initLightbox() {
        if (!lodgeCards.length) return;

        // Create lightbox overlay
        var overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Image lightbox');
        overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;justify-content:center;align-items:center;cursor:pointer;';

        var lightboxImg = document.createElement('img');
        lightboxImg.style.cssText = 'max-width:90%;max-height:90%;object-fit:contain;border-radius:8px;box-shadow:0 4px 40px rgba(0,0,0,0.5);';
        lightboxImg.alt = '';

        var closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close lightbox');
        closeBtn.style.cssText = 'position:absolute;top:20px;right:30px;font-size:48px;color:#fff;background:none;border:none;cursor:pointer;line-height:1;';

        overlay.appendChild(lightboxImg);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        function openLightbox(imgSrc, imgAlt) {
            lightboxImg.src = imgSrc;
            lightboxImg.alt = imgAlt;
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            overlay.style.display = 'none';
            lightboxImg.src = '';
            document.body.style.overflow = '';
        }

        lodgeCards.forEach(function (card) {
            card.addEventListener('click', function () {
                var img = card.querySelector('img');
                if (img) {
                    openLightbox(img.src, img.alt);
                }
            });
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target === closeBtn) {
                closeLightbox();
            }
        });

        closeBtn.addEventListener('click', closeLightbox);

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.style.display === 'flex') {
                closeLightbox();
            }
        });
    }

    /* -----------------------------------------------------------------------
       Intersection Observer for Scroll Animations (fade-in)
       ----------------------------------------------------------------------- */
    function initScrollAnimations() {
        var fadeElements = document.querySelectorAll('.fade-in');
        if (!fadeElements.length) return;

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

            fadeElements.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            // Fallback: show all elements immediately
            fadeElements.forEach(function (el) {
                el.classList.add('visible');
            });
        }
    }

    /* -----------------------------------------------------------------------
       Active Nav Link Highlight on Scroll
       ----------------------------------------------------------------------- */
    function initActiveNavHighlight() {
        var sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        function highlightNav() {
            var scrollPosition = window.scrollY + 120;

            sections.forEach(function (section) {
                var sectionTop = section.offsetTop - 120;
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
        initLightbox();
        initScrollAnimations();
        initActiveNavHighlight();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
