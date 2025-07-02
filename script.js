document.addEventListener("DOMContentLoaded", function () {
  const playlistEl = document.getElementById("playlist");
  const searchInput = document.getElementById("search");
  const volumeSlider = document.querySelector(".volume-slider");
  const popup = document.getElementById("popup");
  let currentAudio = null;
  let currentIndex = -1;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function createSongCard(song, index) {
    const card = document.createElement("div");
    card.className = "song-card";

    const title = document.createElement("h2");
    title.className = song.rainbow ? "rainbow-text2" : "text-lg font-bold";
    title.textContent = song.title;

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = "00:00 / 00:00";

    const progress = document.createElement("div");
    progress.className = "progress";

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.appendChild(progress);

    const playBtn = document.createElement("button");
    playBtn.className = "play-btn";
    playBtn.innerHTML = '<i class="fas fa-play"></i>';

    const audio = document.createElement("audio");
    const source = document.createElement("source");
    source.src = song.src;
    source.type = "audio/mpeg";
    audio.appendChild(source);

    const flex = document.createElement("div");
    flex.className = "flex-1";
    flex.appendChild(title);
    flex.appendChild(progressBar);
    flex.appendChild(time);

    card.appendChild(flex);
    card.appendChild(playBtn);
    card.appendChild(audio);

    // Xử lý play/pause
    playBtn.addEventListener("click", () => {
      if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        const prevBtn = document.querySelectorAll(".play-btn")[currentIndex];
        if (prevBtn) prevBtn.innerHTML = '<i class="fas fa-play"></i>';
      }

      if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        currentAudio = audio;
        currentIndex = index;
      } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      time.textContent = `00:00 / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener("timeupdate", () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + "%";
      time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      audio.currentTime = (x / rect.width) * audio.duration;
    });

    return card;
  }

  function renderSongs(filter = "") {
    playlistEl.innerHTML = "";
    songsData
      .filter(song => song.title.toLowerCase().includes(filter.toLowerCase()))
      .forEach((song, index) => {
        const card = createSongCard(song, index);
        playlistEl.appendChild(card);
      });
  }

  renderSongs();

  searchInput.addEventListener("input", () => {
    renderSongs(searchInput.value);
  });

  volumeSlider.addEventListener("input", () => {
    document.querySelectorAll("audio").forEach(a => a.volume = volumeSlider.value);
  });

  // Hiện popup
  setTimeout(() => {
    popup.classList.add("show");
  }, 500);
});

// Hàm đóng popup
function closePopup() {
  const popup = document.getElementById("popup");
  popup.classList.remove("show");
}
