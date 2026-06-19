(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var slideIndex = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('active', itemIndex === slideIndex);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('active', itemIndex === slideIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      setSlide(Number(dot.getAttribute('data-slide') || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      setSlide(slideIndex + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function filterCards(input) {
    var term = normalize(input.value);
    var root = input.closest('main') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card, .horizontal-card'));
    var activeYearButton = root.querySelector('.filter-chips button.active');
    var year = activeYearButton ? activeYearButton.getAttribute('data-filter-year') : 'all';

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardYear = card.getAttribute('data-year');
      var matchTerm = !term || haystack.indexOf(term) !== -1;
      var matchYear = !year || year === 'all' || cardYear === year;
      card.classList.toggle('is-hidden', !(matchTerm && matchYear));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(input);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.filter-chips button')).forEach(function (button) {
    button.addEventListener('click', function () {
      var chips = button.closest('.filter-chips');
      var root = button.closest('main') || document;
      Array.prototype.slice.call(chips.querySelectorAll('button')).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      var input = root.querySelector('.site-search');
      if (input) {
        filterCards(input);
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.clear-filter')).forEach(function (button) {
    button.addEventListener('click', function () {
      var root = button.closest('main') || document;
      var input = root.querySelector('.site-search');
      if (input) {
        input.value = '';
      }
      Array.prototype.slice.call(root.querySelectorAll('.filter-chips button')).forEach(function (chip) {
        chip.classList.toggle('active', chip.getAttribute('data-filter-year') === 'all');
      });
      if (input) {
        filterCards(input);
      }
    });
  });

  function playBox(box) {
    var video = box.querySelector('video');
    var src = box.getAttribute('data-stream');
    if (!video || !src) {
      return;
    }

    if (!video.getAttribute('src')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = src;
      }
    }

    box.classList.add('is-playing');
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        box.classList.remove('is-playing');
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (box) {
    var startButton = box.querySelector('.player-start');
    var video = box.querySelector('video');

    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playBox(box);
      });
    }

    box.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      playBox(box);
    });

    if (video) {
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          box.classList.remove('is-playing');
        }
      });
    }
  });
})();
