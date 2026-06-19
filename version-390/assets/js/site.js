
(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.querySelector('[data-mobile-menu]');

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            toggle.classList.toggle('is-open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll('.poster-wrap img, .category-preview img, .detail-bg img, .hero-bg').forEach(function (image) {
            image.addEventListener('error', function () {
                var wrapper = image.closest('.poster-wrap');
                if (wrapper) {
                    wrapper.classList.add('is-missing');
                } else {
                    image.style.opacity = '0';
                }
            }, { once: true });
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var previous = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                startAutoPlay();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAutoPlay();
            });
        });

        root.addEventListener('mouseenter', stopAutoPlay);
        root.addEventListener('mouseleave', startAutoPlay);
        show(0);
        startAutoPlay();
    }

    function setupCardFilter() {
        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('[data-card-filter]');
            var count = panel.querySelector('[data-filter-count]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

            if (!input || !cards.length) {
                return;
            }

            function applyFilter() {
                var keyword = normalize(input.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var content = normalize(card.getAttribute('data-search-content'));
                    var matched = !keyword || content.indexOf(keyword) !== -1;
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + ' 部影片';
                }
            }

            input.addEventListener('input', applyFilter);
            applyFilter();
        });
    }

    function setupSearchPage() {
        var app = document.querySelector('[data-search-app]');
        if (!app || !window.MOVIES) {
            return;
        }

        var queryInput = app.querySelector('[data-search-query]');
        var categorySelect = app.querySelector('[data-search-category]');
        var typeSelect = app.querySelector('[data-search-type]');
        var yearSelect = app.querySelector('[data-search-year]');
        var regionSelect = app.querySelector('[data-search-region]');
        var resetButton = app.querySelector('[data-search-reset]');
        var count = app.querySelector('[data-search-count]');
        var results = app.querySelector('[data-search-results]');
        var pagination = app.querySelector('[data-search-pagination]');
        var movies = window.MOVIES;
        var currentPage = 1;
        var pageSize = 48;

        function readUrlQuery() {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && queryInput) {
                queryInput.value = q;
            }
        }

        function movieMatches(movie) {
            var keyword = normalize(queryInput && queryInput.value);
            var category = categorySelect ? categorySelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                movie.categoryLabel,
                (movie.tags || []).join(' ')
            ].join(' '));

            if (keyword && haystack.indexOf(keyword) === -1) {
                return false;
            }
            if (category && movie.categorySlug !== category) {
                return false;
            }
            if (type && String(movie.type).indexOf(type) === -1) {
                return false;
            }
            if (year && String(movie.year) !== year) {
                return false;
            }
            if (region && String(movie.region).indexOf(region) === -1) {
                return false;
            }
            return true;
        }

        function cardHtml(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '' +
                '<a class="movie-card" href="' + escapeHtml(movie.detailUrl) + '">' +
                    '<span class="poster-wrap">' +
                        '<span class="poster-fallback">' + escapeHtml(movie.title) + '</span>' +
                        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="poster-glow"></span>' +
                        '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
                    '</span>' +
                    '<span class="card-body">' +
                        '<strong class="card-title">' + escapeHtml(movie.title) + '</strong>' +
                        '<span class="card-desc">' + escapeHtml(movie.oneLine || '') + '</span>' +
                        '<span class="card-tags">' + tags + '</span>' +
                        '<span class="card-meta">' +
                            '<span>' + escapeHtml(movie.year) + '</span>' +
                            '<span>' + escapeHtml(movie.region) + '</span>' +
                            '<span>★ ' + Number(movie.rating || 0).toFixed(1) + '</span>' +
                        '</span>' +
                    '</span>' +
                '</a>';
        }

        function renderPagination(totalPages) {
            if (!pagination) {
                return;
            }

            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }

            var html = '';
            var start = Math.max(1, currentPage - 3);
            var end = Math.min(totalPages, currentPage + 3);

            if (currentPage > 1) {
                html += '<button type="button" data-page="' + (currentPage - 1) + '">上一页</button>';
            }

            for (var page = start; page <= end; page += 1) {
                html += '<button type="button" class="' + (page === currentPage ? 'is-active' : '') + '" data-page="' + page + '">' + page + '</button>';
            }

            if (currentPage < totalPages) {
                html += '<button type="button" data-page="' + (currentPage + 1) + '">下一页</button>';
            }

            pagination.innerHTML = html;
        }

        function render() {
            var filtered = movies.filter(movieMatches);
            var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

            if (currentPage > totalPages) {
                currentPage = totalPages;
            }

            var start = (currentPage - 1) * pageSize;
            var pageMovies = filtered.slice(start, start + pageSize);

            if (count) {
                count.textContent = '共找到 ' + filtered.length + ' 部影片，当前显示第 ' + currentPage + ' 页';
            }

            if (results) {
                results.innerHTML = pageMovies.map(cardHtml).join('');
                setupImageFallbacks();
            }

            renderPagination(totalPages);
        }

        [queryInput, categorySelect, typeSelect, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', function () {
                    currentPage = 1;
                    render();
                });
                control.addEventListener('change', function () {
                    currentPage = 1;
                    render();
                });
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                [queryInput, categorySelect, typeSelect, yearSelect, regionSelect].forEach(function (control) {
                    if (control) {
                        control.value = '';
                    }
                });
                currentPage = 1;
                render();
            });
        }

        if (pagination) {
            pagination.addEventListener('click', function (event) {
                var target = event.target.closest('[data-page]');
                if (!target) {
                    return;
                }
                currentPage = Number(target.getAttribute('data-page')) || 1;
                render();
                window.scrollTo({ top: app.offsetTop, behavior: 'smooth' });
            });
        }

        readUrlQuery();
        render();
    }

    function setupPlayers() {
        document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
            var video = shell.querySelector('[data-video-element]');
            var button = shell.querySelector('[data-player-start]');
            var status = shell.querySelector('[data-player-status]');
            var source = shell.getAttribute('data-video-src');
            var initialized = false;
            var hlsInstance = null;

            function setStatus(message, isError) {
                if (status) {
                    status.textContent = message;
                }
                shell.classList.toggle('has-error', Boolean(isError));
            }

            function playVideo() {
                if (!video) {
                    return;
                }

                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setStatus('浏览器阻止了自动播放，请再次点击播放按钮。', false);
                    });
                }
            }

            function initialize() {
                if (initialized || !video || !source) {
                    playVideo();
                    return;
                }

                initialized = true;
                setStatus('正在初始化 HLS 播放器...', false);

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源加载完成，正在开始播放...', false);
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('播放源加载失败，请检查网络或稍后重试。', true);
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        playVideo();
                    }, { once: true });
                } else {
                    setStatus('当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Firefox 或 Safari。', true);
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    initialize();
                });
            }

            shell.addEventListener('click', function () {
                initialize();
            });

            if (video) {
                video.addEventListener('play', function () {
                    shell.classList.add('is-playing');
                    setStatus('正在播放...', false);
                });
                video.addEventListener('pause', function () {
                    shell.classList.remove('is-playing');
                });
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupImageFallbacks();
        setupHero();
        setupCardFilter();
        setupSearchPage();
        setupPlayers();
    });
}());
