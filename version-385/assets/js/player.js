(function () {
    function prepareVideo(video, streamUrl) {
        if (!video || video.dataset.ready === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = streamUrl;
        }

        video.dataset.ready = 'true';
    }

    window.initPlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);

        if (!video || !streamUrl) {
            return;
        }

        function start() {
            prepareVideo(video, streamUrl);

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var playAction = video.play();

            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.dataset.ready !== 'true' || video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    };
})();
