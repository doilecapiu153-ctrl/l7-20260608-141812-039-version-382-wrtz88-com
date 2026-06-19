(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('.hero');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('.js-filter-input');
    var typeSelect = document.querySelector('.js-filter-type');
    var yearSelect = document.querySelector('.js-filter-year');
    var resetButton = document.querySelector('.js-filter-reset');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.js-card'));
    var emptyState = document.querySelector('.empty-state');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : '');
        var typeValue = normalize(typeSelect ? typeSelect.value : '');
        var yearValue = normalize(yearSelect ? yearSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchType = !typeValue || cardType.indexOf(typeValue) !== -1;
            var matchYear = !yearValue || cardYear === yearValue;
            var shouldShow = matchQuery && matchType && matchYear;

            card.style.display = shouldShow ? '' : 'none';

            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            filterInput.value = q;
        }

        filterInput.addEventListener('input', applyFilters);
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', applyFilters);
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
    }

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            if (filterInput) {
                filterInput.value = '';
            }

            if (typeSelect) {
                typeSelect.value = '';
            }

            if (yearSelect) {
                yearSelect.value = '';
            }

            applyFilters();
        });
    }

    applyFilters();
})();
