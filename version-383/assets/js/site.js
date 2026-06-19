(function() {
    var header = document.querySelector('[data-site-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (menuButton && mobileNav && header) {
        menuButton.addEventListener('click', function() {
            var opened = mobileNav.classList.toggle('is-open');
            header.classList.toggle('is-open', opened);
            document.body.classList.toggle('menu-open', opened);
        });
    }

    document.querySelectorAll('[data-spotlight]').forEach(function(block) {
        var slides = Array.prototype.slice.call(block.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(block.querySelectorAll('[data-slide-dot]'));
        var prev = block.querySelector('[data-slide-prev]');
        var next = block.querySelector('[data-slide-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5800);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                play();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-slide-dot') || 0));
                play();
            });
        });
        block.addEventListener('mouseenter', stop);
        block.addEventListener('mouseleave', play);
        show(0);
        play();
    });

    document.querySelectorAll('[data-search-input]').forEach(function(input) {
        var scope = input.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row'));

        function applySearch() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-tags') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', Boolean(keyword) && haystack.indexOf(keyword) === -1);
            });
        }

        input.addEventListener('input', applySearch);
    });

    document.querySelectorAll('[data-filter-group]').forEach(function(group) {
        var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));
        var scope = group.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                var value = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function(item) {
                    item.classList.toggle('is-active', item === button);
                });
                cards.forEach(function(card) {
                    var year = card.getAttribute('data-year') || '';
                    var matched = value === 'all' || year.indexOf(value) !== -1;
                    card.classList.toggle('is-hidden', !matched);
                });
            });
        });
    });
}());