/**
 * HASA Conference Newsletter - Main JavaScript
 *
 * Minimal script for web-viewing of the email template.
 * Email clients strip JavaScript, so this only enhances
 * the browser preview experience.
 */

(function () {
    'use strict';

    /**
     * Smooth scroll for anchor links when viewed in browser.
     * Provides a polished navigation experience for the web preview.
     */
    function initSmoothScroll() {
        var links = document.querySelectorAll('a[href^="#"]');

        links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                var targetId = this.getAttribute('href');

                if (targetId === '#') {
                    return;
                }

                var targetElement = document.querySelector(targetId);

                if (targetElement) {
                    event.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Add current year to copyright placeholder if not already set.
     */
    function setCurrentYear() {
        var yearElements = document.querySelectorAll('[data-year]');
        var currentYear = new Date().getFullYear();

        yearElements.forEach(function (el) {
            if (el.textContent.indexOf('{{YEAR}}') !== -1) {
                el.textContent = el.textContent.replace('{{YEAR}}', currentYear);
            }
        });
    }

    /**
     * Initialize when DOM is ready.
     */
    function init() {
        initSmoothScroll();
        setCurrentYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
