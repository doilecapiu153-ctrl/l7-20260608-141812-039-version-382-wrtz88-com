(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (button && mobileNav) {
      button.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var controls = Array.prototype.slice.call(document.querySelectorAll("[data-hero-control]"));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });

      controls.forEach(function (control, controlIndex) {
        control.classList.toggle("active", controlIndex === activeIndex);
      });
    }

    controls.forEach(function (control) {
      control.addEventListener("click", function () {
        var index = Number(control.getAttribute("data-hero-control"));
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 6000);
    }

    var searchInput = document.querySelector("[data-movie-search]");
    var filterType = document.querySelector("[data-filter-type]");
    var filterRegion = document.querySelector("[data-filter-region]");
    var filterYear = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var noResult = document.querySelector("[data-no-result]");

    function cardMatches(card) {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var typeValue = filterType ? filterType.value : "";
      var regionValue = filterRegion ? filterRegion.value : "";
      var yearValue = filterYear ? filterYear.value : "";
      var text = card.getAttribute("data-search") || "";
      var type = card.getAttribute("data-type") || "";
      var region = card.getAttribute("data-region") || "";
      var year = card.getAttribute("data-year") || "";

      if (query && text.indexOf(query) === -1) {
        return false;
      }

      if (typeValue && type !== typeValue) {
        return false;
      }

      if (regionValue && region !== regionValue) {
        return false;
      }

      if (yearValue && year !== yearValue) {
        return false;
      }

      return true;
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var visible = 0;

      cards.forEach(function (card) {
        var matched = cardMatches(card);
        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (noResult) {
        noResult.hidden = visible !== 0;
      }
    }

    [searchInput, filterType, filterRegion, filterYear].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  });
})();
