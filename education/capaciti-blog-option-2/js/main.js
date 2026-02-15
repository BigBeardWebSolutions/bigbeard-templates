/**
 * Education Blog Listing - Card Layout (Option 2)
 * Main JavaScript - Mobile menu toggle, smooth scroll, header scroll effect
 */

document.addEventListener('DOMContentLoaded', function () {

    // =========================================================
    // Mobile Menu Toggle
    // =========================================================
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function () {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // =========================================================
    // Header Scroll Effect
    // =========================================================
    const header = document.querySelector('.header');

    if (header) {
        var lastScrollY = 0;

        window.addEventListener('scroll', function () {
            var currentScrollY = window.scrollY;

            if (currentScrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScrollY = currentScrollY;
        });
    }

    // =========================================================
    // Smooth Scroll for Anchor Links
    // =========================================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                var headerHeight = header ? header.offsetHeight : 0;
                var targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =========================================================
    // Pagination Active State (client-side demo)
    // =========================================================
    var pageNumbers = document.querySelectorAll('.page-number');

    pageNumbers.forEach(function (pageNum) {
        pageNum.addEventListener('click', function (e) {
            e.preventDefault();
            pageNumbers.forEach(function (p) { p.classList.remove('active'); });
            this.classList.add('active');
        });
    });

});
