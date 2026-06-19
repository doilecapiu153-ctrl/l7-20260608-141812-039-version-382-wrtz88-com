import { H as Hls } from "./hls.js";

function setupPlayer(root) {
    var video = root.querySelector("video[data-stream]");
    var button = root.querySelector("[data-play-button]");
    if (!video || !button) {
        return;
    }
    var stream = video.dataset.stream;
    var attached = false;
    var hls = null;

    function attach() {
        if (attached || !stream) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            return;
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        }
    }

    function play() {
        attach();
        button.classList.add("is-hidden");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-video-player]").forEach(setupPlayer);
});
