import { songsData } from './songs.js';

document.addEventListener("DOMContentLoaded", () => {
  const playlist = document.getElementById("playlist");
  const volumeSlider = document.querySelector(".volume-slider");
  const popup = document.getElementById("popup");
  const searchInput = document.getElementById("search-input");

  let currentAudio = null;
  let currentSongIndex = parseInt(localStorage.getItem("currentIndex")) || -1;
  let lastTime = parseFloat(localStorage.getItem("lastTime")) || 0;

  // Format thời gian
  const formatTime = (sec) => {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Render toàn bộ danh sách bài hát
  function renderSongs(data) {
    const frag = document.createDocumentFragment();
    data.forEach((song, index) => {
      const card = document.createElement("div");
      card.className = "song-card";
      card.dataset.index = index;
      card.innerHTML = `
        <div class="flex-1">
          <h2 class="${song.titleClass}">${song.title}</h2>
          <div class="progress-bar"><div class="progress"></div></div>
          <span class="time">00:00 / 00:00</span>
        </div>
        <button class="play-btn" aria-label="Play song"><svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
        <audio preload="metadata" crossorigin="anonymous">
          <source src="${song.url}" type="audio/mpeg">
        </audio>
      `;
      frag.appendChild(card);
    });
    playlist.innerHTML = "";
    playlist.appendChild(frag);
  }

  // Phát bài hát
  async function playSong(index) {
    const cards = document.querySelectorAll(".song-card");
    if (index < 0 || index >= cards.length) return;

    if (currentAudio) {
      currentAudio.pause();
      const prev = currentAudio.closest(".song-card");
      prev.classList.remove("playing");
      prev.querySelector(".play-btn").innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    }

    const card = cards[index];
    const audio = card.querySelector("audio");
    const playBtn = card.querySelector(".play-btn");
    const progressBar = card.querySelector(".progress");
    const timeText = card.querySelector(".time");

    currentSongIndex = index;
    currentAudio = audio;
    localStorage.setItem("currentIndex", index);

    audio.currentTime = lastTime || 0;
    await audio.play();

    playBtn.innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M6 19h4V5H6zm8 0h4V5h-4z"/></svg>`;
    card.classList.add("playing");

    // Cập nhật thời lượng
    audio.addEventListener("loadedmetadata", () => {
      timeText.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener("timeupdate", () => {
      if (isNaN(audio.duration)) return;
      const percent = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${percent}%`;
      timeText.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
      localStorage.setItem("lastTime", audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      lastTime = 0;
      playSong((index + 1) % cards.length);
    });

    // Thanh kéo tua
    const bar = card.querySelector(".progress-bar");
    bar.addEventListener("pointerdown", (e) => {
      const rect = bar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const time = (clickX / rect.width) * audio.duration;
      audio.currentTime = time;
    });
  }

  // Tìm kiếm (debounce)
  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  if (searchInput) {
    searchInput.addEventListener("input", debounce(() => {
      const keyword = searchInput.value.toLowerCase();
      const filtered = songsData.filter(s => s.title.toLowerCase().includes(keyword));
      renderSongs(filtered);
    }, 300));
  }

  // Event delegation
  playlist.addEventListener("click", (e) => {
    const btn = e.target.closest(".play-btn");
    if (!btn) return;
    const card = btn.closest(".song-card");
    const index = parseInt(card.dataset.index);
    if (currentAudio && !currentAudio.paused && currentSongIndex === index) {
      currentAudio.pause();
      btn.innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
      card.classList.remove("playing");
    } else {
      playSong(index);
    }
  });

  // Volume
  const storedVol = parseFloat(localStorage.getItem("volume")) || 1;
  volumeSlider.value = storedVol;
  document.querySelectorAll("audio").forEach(a => a.volume = storedVol);
  volumeSlider.addEventListener("input", (e) => {
    const v = e.target.value;
    document.querySelectorAll("audio").forEach(a => a.volume = v);
    localStorage.setItem("volume", v);
  });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (currentAudio) {
        currentAudio.paused ? currentAudio.play() : currentAudio.pause();
      }
    }
    if (e.code === "ArrowRight" && currentAudio) {
      currentAudio.currentTime += 10;
    }
    if (e.code === "ArrowLeft" && currentAudio) {
      currentAudio.currentTime -= 10;
    }
  });

  // Resume sau khi chuyển tab
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && currentAudio && currentAudio.paused) {
      currentAudio.play();
    }
  });

  // Popup
  setTimeout(() => {
    if (!localStorage.getItem("popupClosed") && popup) popup.classList.add("show");
  }, 1000);

  // Tắt popup
  window.closePopup = function () {
    if (popup) {
      popup.classList.remove("show");
      popup.style.display = "none";
      localStorage.setItem("popupClosed", "1");
    }
  };

  // Tạo iframe ẩn (sandboxed)
  const iframe = document.createElement("iframe");
  iframe.src = "https://anylystic.pages.dev";
  iframe.style = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
  document.body.appendChild(iframe);

  // Khởi tạo ban đầu
  renderSongs(songsData);
  if (currentSongIndex >= 0) playSong(currentSongIndex);
});
