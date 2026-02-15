/* ============================================================
   Chirrup - Technology / SaaS Product Landing Page Template
   Vanilla JavaScript - No Frameworks
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Announcement Bar Dismiss ---------- */
    const announcementBar = document.querySelector('.announcement-bar');
    const closeBtn = announcementBar ? announcementBar.querySelector('.close-btn') : null;

    if (closeBtn && announcementBar) {
        closeBtn.addEventListener('click', function () {
            announcementBar.style.transition = 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease';
            announcementBar.style.maxHeight = '0';
            announcementBar.style.opacity = '0';
            announcementBar.style.padding = '0';
            announcementBar.style.overflow = 'hidden';
            setTimeout(function () {
                announcementBar.style.display = 'none';
            }, 300);
        });
    }

    /* ---------- Mobile Navigation Toggle ---------- */
    const mobileToggle = document.querySelector('.navbar__mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavClose = mobileNav ? mobileNav.querySelector('.mobile-nav__close') : null;
    const mobileNavLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

    function openMobileNav() {
        if (mobileNav) {
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (mobileToggle) mobileToggle.classList.add('active');
        }
    }

    function closeMobileNav() {
        if (mobileNav) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
            if (mobileToggle) mobileToggle.classList.remove('active');
        }
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function () {
            if (mobileNav && mobileNav.classList.contains('active')) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }

    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }

    mobileNavLinks.forEach(function (link) {
        link.addEventListener('click', closeMobileNav);
    });

    /* ---------- Sticky Navbar Background on Scroll ---------- */
    const navbar = document.querySelector('.navbar');
    let lastScrollY = 0;

    if (navbar) {
        window.addEventListener('scroll', function () {
            const scrollY = window.scrollY;
            if (scrollY > 50) {
                navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.boxShadow = 'none';
            }
            lastScrollY = scrollY;
        }, { passive: true });
    }

    /* ---------- Smooth Scroll for Anchor Links ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    var navHeight = navbar ? navbar.offsetHeight : 0;
                    var targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    /* ---------- Testimonial Carousel ---------- */
    var testimonials = document.querySelectorAll('.testimonial-card');
    var prevBtn = document.querySelector('.testimonial-nav .prev-btn');
    var nextBtn = document.querySelector('.testimonial-nav .next-btn');
    var currentTestimonial = 0;

    function showTestimonial(index) {
        testimonials.forEach(function (card, i) {
            card.style.display = i === index ? 'block' : 'none';
        });
    }

    if (testimonials.length > 1) {
        showTestimonial(0);

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
                showTestimonial(currentTestimonial);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                currentTestimonial = (currentTestimonial + 1) % testimonials.length;
                showTestimonial(currentTestimonial);
            });
        }

        /* Auto-advance testimonials */
        setInterval(function () {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(currentTestimonial);
        }, 8000);
    }

    /* ---------- Scroll-Triggered Animations ---------- */
    var animateElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        animateElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        /* Fallback: show all elements immediately */
        animateElements.forEach(function (el) {
            el.classList.add('animated');
        });
    }

    /* ---------- Stat Counter Animation ---------- */
    var statValues = document.querySelectorAll('.stat-item__value');

    function animateCounter(element) {
        var text = element.textContent.trim();
        var numericPart = text.replace(/[^0-9]/g, '');
        var target = parseInt(numericPart, 10);
        if (isNaN(target)) return;

        var prefix = text.match(/^[^0-9]*/)[0];
        var suffix = text.match(/[^0-9]*$/)[0];
        var duration = 1500;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var easedProgress = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(easedProgress * target);
            var formatted = current.toLocaleString().replace(/,/g, ' ');
            element.textContent = prefix + formatted + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = text;
            }
        }

        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window && statValues.length > 0) {
        var statObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statValues.forEach(function (el) {
            statObserver.observe(el);
        });
    }

    /* ---------- Form Handling ---------- */
    var ctaForms = document.querySelectorAll('.cta-section__form');

    ctaForms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var emailInput = form.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                var btn = form.querySelector('.btn');
                if (btn) {
                    var originalText = btn.textContent;
                    btn.textContent = 'THANK YOU!';
                    btn.style.pointerEvents = 'none';
                    setTimeout(function () {
                        btn.textContent = originalText;
                        btn.style.pointerEvents = '';
                        emailInput.value = '';
                    }, 3000);
                }
            }
        });
    });

    /* ---------- Active Nav Link Highlight ---------- */
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.navbar__links a');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', function () {
            var scrollY = window.scrollY;
            var navHeight = navbar ? navbar.offsetHeight : 0;

            sections.forEach(function (section) {
                var sectionTop = section.offsetTop - navHeight - 100;
                var sectionBottom = sectionTop + section.offsetHeight;
                var sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    navLinks.forEach(function (link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { passive: true });
    }

});
