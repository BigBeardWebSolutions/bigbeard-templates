/**
 * HASA Main Site - JavaScript
 * Mobile menu, smooth scroll, header scroll effect, members carousel
 */
(function () {
  "use strict";

  /* ============================================
     DOM REFERENCES
     ============================================ */
  const header = document.getElementById("header");
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mainNav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(".nav-link");
  const membersDots = document.querySelectorAll("#membersDots .dot");

  /* ============================================
     HEADER SCROLL EFFECT (Frosted Glass)
     ============================================ */
  function handleHeaderScroll() {
    if (!header) return;
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 60) {
      header.classList.add("header--scrolled");
    } else {
      header.classList.remove("header--scrolled");
    }
  }

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ============================================
     MOBILE MENU TOGGLE
     ============================================ */
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener("click", function () {
      const isOpen = mainNav.classList.toggle("open");
      mobileMenuToggle.classList.toggle("active");
      mobileMenuToggle.setAttribute("aria-expanded", isOpen.toString());

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close menu when a nav link is clicked
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        mobileMenuToggle.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ============================================
     SMOOTH SCROLL for anchor links
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;

      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        var headerOffset = header ? header.offsetHeight : 0;
        var elementPosition = targetEl.getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset - 16;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  /* ============================================
     MEMBERS CAROUSEL DOTS
     ============================================ */
  if (membersDots.length > 0) {
    membersDots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        // Remove active from all dots
        membersDots.forEach(function (d) {
          d.classList.remove("dot--active");
        });
        // Set active on clicked dot
        dot.classList.add("dot--active");
      });
    });
  }

  /* ============================================
     ACTIVE NAV LINK on scroll
     ============================================ */
  function setActiveNavOnScroll() {
    var sections = document.querySelectorAll("section[id]");
    var scrollPos = window.scrollY + (header ? header.offsetHeight : 0) + 50;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(function (link) {
          link.classList.remove("nav-link--active");
          var href = link.getAttribute("href");
          if (href === "#" + id) {
            link.classList.add("nav-link--active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", setActiveNavOnScroll, { passive: true });

  /* ============================================
     CLOSE MOBILE MENU on ESC
     ============================================ */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mainNav && mainNav.classList.contains("open")) {
      mainNav.classList.remove("open");
      mobileMenuToggle.classList.remove("active");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
})();
