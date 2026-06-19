(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupFiltering() {
    var inputs = selectAll("[data-filter-input]");
    if (!inputs.length) {
      return;
    }
    var targets = selectAll("[data-search], [data-title]");
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        targets.forEach(function (target) {
          var text = normalize((target.getAttribute("data-search") || "") + " " + (target.getAttribute("data-title") || "") + " " + target.textContent);
          if (!query || text.indexOf(query) !== -1) {
            target.removeAttribute("data-hidden-by-filter");
          } else {
            target.setAttribute("data-hidden-by-filter", "true");
          }
        });
      });
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10));
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("player-overlay");
    if (!video || !overlay || !source) {
      return;
    }
    var attached = false;
    var hls = null;

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      overlay.hidden = true;
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          overlay.hidden = false;
        });
      }
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      overlay.hidden = true;
    });
    video.addEventListener("ended", function () {
      if (hls && typeof hls.stopLoad === "function") {
        hls.stopLoad();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupFiltering();
    setupHeroSlider();
  });
})();
