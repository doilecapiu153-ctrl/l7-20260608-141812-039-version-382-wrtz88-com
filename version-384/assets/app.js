(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.textContent
        ].join(" "));
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupSiteSearch() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            window.clearInterval(timer);
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });
        carousel.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        carousel.addEventListener("mouseleave", start);
        start();
    }

    function setupCardFilter() {
        var input = document.querySelector("[data-card-filter]");
        var list = document.querySelector("[data-card-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var active = "全部";
        function apply() {
            var query = normalize(input.value);
            var chip = normalize(active === "全部" ? "" : active);
            cards.forEach(function (card) {
                var text = cardText(card);
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedChip = !chip || text.indexOf(chip) !== -1;
                card.classList.toggle("is-hidden", !(matchedQuery && matchedChip));
            });
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                active = chip.dataset.filterValue || "全部";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                apply();
            });
        });
        if (chips[0]) {
            chips[0].classList.add("is-active");
        }
        input.addEventListener("input", apply);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"movie-poster\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
            "<span class=\"poster-play\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h3 class=\"movie-card-title\"><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p class=\"movie-card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.category) + "</p>" +
            "<p class=\"movie-card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"movie-tags\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function setupSearchPage() {
        var results = document.getElementById("searchResults");
        var form = document.querySelector("[data-search-page-form]");
        if (!results || !form || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var input = form.querySelector("input[name='q']");
        var params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";
        function render() {
            var query = normalize(input.value);
            var items = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                if (!query) {
                    return true;
                }
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" "));
                return text.indexOf(query) !== -1;
            }).slice(0, 120);
            if (!items.length) {
                results.innerHTML = "<p class=\"empty-result\">没有找到匹配影片</p>";
                return;
            }
            results.innerHTML = items.map(createSearchCard).join("");
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var value = input.value.trim();
            var nextUrl = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
            window.history.replaceState(null, "", nextUrl);
            render();
        });
        input.addEventListener("input", render);
        render();
    }

    ready(function () {
        setupMobileNav();
        setupSiteSearch();
        setupHeroCarousel();
        setupCardFilter();
        setupSearchPage();
    });
}());
