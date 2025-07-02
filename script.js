import { songs } from "./songs.js";

const playlist = document.getElementById("playlist");
const searchInput = document.getElementById("search");

function createSongCard(song) {
  const card = document.createElement("div");
  card.className = "song-card";
  card.innerHTML = `
    <div class="flex-1">
      <h2 class="text-lg font-bold ${song.rainbow ? 'rainbow-text2' : ''}">${song.title}</h2>
      <div class="progress-bar"><div class="progress"></div></div>
      <span class="time">00:00 / 00:00</span>
    </div>
    <button class="play-btn"><i class="fas fa-play"></i></button>
    <audio>
      <source src="${song.src}" type="audio/mpeg">
    </audio>
  `;
  playlist.appendChild(card);
}

function renderSongs(filter = "") {
  playlist.innerHTML = "";
  songs.forEach(song => {
    if (song.title.toLowerCase().includes(filter.toLowerCase())) {
      createSongCard(song);
    }
  });
  setupPlayers();
}

function setupPlayers() {
  const cards = document.querySelectorAll(".song-card");
  cards.forEach(card => {
    const btn = card.querySelector(".play-btn");
    const audio = card.querySelector("audio");
    const progress = card.querySelector(".progress");
    const time = card.querySelector(".time");
    const bar = card.querySelector(".progress-bar");

    btn.onclick = () => {
      document.querySelectorAll("audio").forEach(a => {
        if (a !== audio) a.pause();
      });
      document.querySelectorAll(".play-btn").forEach(b => {
        if (b !== btn) b.innerHTML = "<i class='fas fa-play'></i>";
      });

      if (audio.paused) {
        audio.play();
        btn.innerHTML = "<i class='fas fa-pause'></i>";
      } else {
        audio.pause();
        btn.innerHTML = "<i class='fas fa-play'></i>";
      }
    };

    audio.ontimeupdate = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + "%";
      const f = s => {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const sec = Math.floor(s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
      };
      time.textContent = `${f(audio.currentTime)} / ${f(audio.duration || 0)}`;
    };

    bar.onclick = e => {
      const percent = e.offsetX / bar.offsetWidth;
      audio.currentTime = percent * audio.duration;
    };
  });

  document.querySelector(".volume-slider").oninput = e => {
    const vol = e.target.value;
    document.querySelectorAll("audio").forEach(a => a.volume = vol);
  };
}

searchInput.oninput = () => {
  renderSongs(searchInput.value);
};

window.closePopup = () => {
  document.getElementById("popup").classList.remove("show");
};

setTimeout(() => {
  document.getElementById("popup").classList.add("show");
}, 1000);

renderSongs();
