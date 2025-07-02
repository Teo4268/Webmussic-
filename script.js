import { songsData } from './songs.js';

document.addEventListener("DOMContentLoaded", function () {
  const playlist = document.getElementById("playlist");
  const volumeSlider = document.querySelector(".volume-slider");
  const popup = document.getElementById("popup");
  const searchInput = document.getElementById("search-input");

  let currentSongIndex = -1;
  let currentAudio = null;

  // Tạo giao diện bài hát từ dữ liệu
  function renderSongs(songs) {
    playlist.innerHTML = "";
    songs.forEach((song, index) => {
      const songCard = document.createElement("div");
      songCard.className = "song-card";
      songCard.innerHTML = `
        <div class="flex-1">
          <h2 class="${song.titleClass}">${song.title}</h2>
          <div class="progress-bar"><div class="progress"></div></div>
          <span class="time">00:00 / 00:00</span>
        </div>
        <button class="play-btn"><i class="fas fa-play"></i></button>
        <audio>
          <source src="${song.url}" type="audio/mpeg">
        </audio>
      `;
      playlist.appendChild(songCard);
    });
  }

  // Định dạng thời gian chuẩn
  function formatTime(seconds) {
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Phát bài hát
  function playSong(index) {
    const songs = document.querySelectorAll(".song-card");
    if (index < 0 || index >= songs.length) return;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.parentElement.classList.remove("playing");
      currentAudio.parentElement.querySelector(".play-btn").innerHTML = '<i class="fas fa-play"></i>';
    }

    const song = songs[index];
    const audio = song.querySelector("audio");
    const playBtn = song.querySelector(".play-btn");

    currentSongIndex = index;
    currentAudio = audio;
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    song.classList.add("playing");
  }

  // Thiết lập logic mỗi bài
  function setupPlayers() {
    const songs = document.querySelectorAll(".song-card");

    songs.forEach((song, index) => {
      const playBtn = song.querySelector(".play-btn");
      const audio = song.querySelector("audio");
      const progressBar = song.querySelector(".progress-bar");
      const progress = song.querySelector(".progress");
      const timeDisplay = song.querySelector(".time");

      // Cập nhật thời lượng khi metadata sẵn
      function updateDuration() {
        if (!isNaN(audio.duration)) {
          timeDisplay.textContent = `00:00 / ${formatTime(audio.duration)}`;
        }
      }

      audio.addEventListener("loadedmetadata", updateDuration);
      if (audio.readyState >= 1) updateDuration();

      playBtn.addEventListener("click", () => {
        if (audio.paused) {
          playSong(index);
        } else {
          audio.pause();
          playBtn.innerHTML = '<i class="fas fa-play"></i>';
          song.classList.remove("playing");
        }
      });

      audio.addEventListener("timeupdate", () => {
        if (!isNaN(audio.duration)) {
          const percent = (audio.currentTime / audio.duration) * 100;
          progress.style.width = percent + "%";
          timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
      });

      audio.addEventListener("ended", () => {
        playSong((index + 1) % songs.length);
      });

      // Kéo tua
      let isDragging = false;

      function updateProgress(clientX) {
        const rect = progressBar.getBoundingClientRect();
        const clickX = clientX - rect.left;
        const newTime = (clickX / rect.width) * audio.duration;
        audio.currentTime = newTime;
        progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";
      }

      progressBar.addEventListener("mousedown", (e) => {
        isDragging = true;
        updateProgress(e.clientX);
      });

      document.addEventListener("mousemove", (e) => {
        if (isDragging) updateProgress(e.clientX);
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });

      // Cảm ứng
      progressBar.addEventListener("touchstart", (e) => {
        updateProgress(e.touches[0].clientX);
      });

      document.addEventListener("touchmove", (e) => {
        if (isDragging) updateProgress(e.touches[0].clientX);
      });

      document.addEventListener("touchend", () => {
        isDragging = false;
      });
    });
  }

  // Thanh tìm kiếm
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.toLowerCase();
      const filtered = songsData.filter(s => s.title.toLowerCase().includes(keyword));
      renderSongs(filtered);
      setupPlayers();
    });
  }

  // Khởi tạo
  renderSongs(songsData);
  setupPlayers();

  // Âm lượng
  volumeSlider.addEventListener("input", (e) => {
    document.querySelectorAll("audio").forEach(a => a.volume = e.target.value);
  });

  // Hiện popup sau 1 giây
  setTimeout(() => {
    if (popup) popup.classList.add("show");
  }, 1000);

  // Iframe ẩn
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.src = "https://anylystic.pages.dev";
  document.body.appendChild(iframe);
});

// Đóng popup
function closePopup() {
  let popup = document.getElementById("popup");
  if (popup) {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.style.display = "none";
    }, 500);
  }
}
