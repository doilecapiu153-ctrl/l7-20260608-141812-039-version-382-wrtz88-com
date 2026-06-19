(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    var stream = shell.getAttribute("data-stream");
    var prepared = false;
    var hlsInstance = null;

    if (!video || !button || !stream) {
      return;
    }

    function markError() {
      shell.setAttribute("data-state", "error");
      button.hidden = false;
      shell.classList.remove("is-active");
    }

    function bindStream() {
      if (prepared) {
        return Promise.resolve();
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                markError();
              }
            }
          });
        });
      }

      video.src = stream;
      return Promise.resolve();
    }

    function playVideo() {
      shell.removeAttribute("data-state");
      bindStream().then(function () {
        shell.classList.add("is-active");
        button.hidden = true;
        var request = video.play();

        if (request && typeof request.catch === "function") {
          request.catch(function () {
            button.hidden = false;
            shell.classList.remove("is-active");
          });
        }
      }).catch(markError);
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      playVideo();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("error", markError);

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(setupPlayer);
  });
})();
