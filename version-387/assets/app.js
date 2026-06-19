(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('.hero-slide', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var panels = selectAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var cards = selectAll('[data-card]', root);
      var input = panel.querySelector('[data-filter-input]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var status = panel.querySelector('[data-filter-status]');

      function apply() {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(typeSelect && typeSelect.value);
        var regionValue = normalize(regionSelect && regionSelect.value);
        var matched = 0;
        cards.forEach(function (card) {
          var content = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var type = normalize(card.getAttribute('data-type'));
          var region = normalize(card.getAttribute('data-region'));
          var visible = true;
          if (keyword && content.indexOf(keyword) === -1) {
            visible = false;
          }
          if (typeValue && type.indexOf(typeValue) === -1) {
            visible = false;
          }
          if (regionValue && region.indexOf(regionValue) === -1) {
            visible = false;
          }
          card.classList.toggle('is-hidden', !visible);
          if (visible) {
            matched += 1;
          }
        });
        if (status) {
          var hasFilter = keyword || typeValue || regionValue;
          status.textContent = hasFilter ? '匹配影片：' + matched : '';
        }
      }

      [input, typeSelect, regionSelect].forEach(function (field) {
        if (field) {
          field.addEventListener('input', apply);
          field.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (input && query) {
        input.value = query;
      }
      apply();
    });
  }

  function setupPlayers() {
    selectAll('[data-video-box]').forEach(function (box) {
      var video = box.querySelector('video[data-stream]');
      var button = box.querySelector('[data-play-button]');
      var hls = null;
      var loaded = false;
      if (!video) {
        return;
      }

      function begin() {
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {});
        }
      }

      function attach() {
        if (loaded) {
          begin();
          return;
        }
        loaded = true;
        box.classList.add('is-ready');
        var stream = video.getAttribute('data-stream');
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            begin();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              try {
                hls.destroy();
              } catch (error) {}
              video.src = stream;
              begin();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', begin, { once: true });
          video.load();
        } else {
          video.src = stream;
          video.load();
          begin();
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          attach();
        });
      }
      video.addEventListener('click', function () {
        if (!loaded) {
          attach();
          return;
        }
        if (video.paused) {
          begin();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-ready');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
})();
