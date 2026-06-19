(function() {
  function matchesText(card, query) {
    if (!query) {
      return true;
    }
    var haystack = [
      card.getAttribute("data-title"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-category")
    ].join(" ").toLowerCase();
    return haystack.indexOf(query.toLowerCase()) !== -1;
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;

    function show(next) {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = next;
      slides[index].classList.add("is-active");
      dots[index].classList.add("is-active");
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
      });
    });

    window.setInterval(function() {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }

    var input = panel.querySelector("[data-search-input]");
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-group]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var filters = {};

    buttons.forEach(function(button) {
      var group = button.getAttribute("data-filter-group");
      if (!filters[group]) {
        filters[group] = "全部";
      }
      button.addEventListener("click", function() {
        var value = button.getAttribute("data-filter-value");
        filters[group] = value;
        buttons
          .filter(function(item) {
            return item.getAttribute("data-filter-group") === group;
          })
          .forEach(function(item) {
            item.classList.toggle("is-active", item === button);
          });
        apply();
      });
    });

    function apply() {
      var query = input ? input.value.trim() : "";
      var visible = 0;
      cards.forEach(function(card) {
        var pass = matchesText(card, query);
        Object.keys(filters).forEach(function(group) {
          var value = filters[group];
          if (value && value !== "全部") {
            pass = pass && card.getAttribute("data-" + group) === value;
          }
        });
        card.classList.toggle("is-hidden", !pass);
        if (pass) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function(player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var button = player.querySelector(".player-start");
      if (!video) {
        return;
      }
      var url = video.getAttribute("data-video-url");
      var ready = false;
      var hls = null;

      function attach() {
        if (ready || !url) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        ready = true;
      }

      function start() {
        attach();
        player.classList.add("is-playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function() {});
        }
      }

      player.__startPlayback = start;

      if (button) {
        button.addEventListener("click", start);
      }
      if (cover && cover !== button) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function() {
        if (!ready) {
          start();
        }
      });
      window.addEventListener("pagehide", function() {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-start-player]")).forEach(function(trigger) {
      trigger.addEventListener("click", function() {
        var player = document.querySelector("[data-player]");
        if (player && typeof player.__startPlayback === "function") {
          player.scrollIntoView({ behavior: "smooth", block: "center" });
          player.__startPlayback();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
