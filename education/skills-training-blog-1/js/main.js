/* Education Blog Listing Page - JavaScript */

document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    var toggle = document.querySelector('.mobile-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (toggle && navLinks) {
        toggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var headerHeight = document.querySelector('.header').offsetHeight;
                var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });

                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    toggle.classList.remove('active');
                }
            }
        });
    });

    // Header scroll effect
    var header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Pagination active state handler
    var paginationItems = document.querySelectorAll('.pagination-item');
    paginationItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            paginationItems.forEach(function (pi) {
                pi.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
});
