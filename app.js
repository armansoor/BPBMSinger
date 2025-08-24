// app.js — YG-GEN main logic (generator + who-sings + TTS + audio render + gallery)
// Author: Abdur Rahman Mansoor — 2025

// ---------- MEMBERS ----------
const BLACKPINK = ["Jisoo (V)", "Jennie (R/V)", "Rosé (V)", "Lisa (R)"];
const BABYMONSTER = ["Ahyeon (V)", "Ruka (R)", "Rami (V)", "Asa (R)", "Haram (V)", "Pharita (V)", "Chiquita (V)"];
const ALL = [...BLACKPINK, ...BABYMONSTER];

// ---------- DATASET ----------
const THEMES = {
  love: {
    en: ["I can't escape this pull", "Your spark lights up the night", "Falling softer than before", "Hold me closer, don't let go", "Our echoes sound like home", "This heartbeat won't be tamed"],
    kr: ["너의 손길에 난 흔들려", "밤하늘에 불빛처럼 빛나", "더 깊이 빠져들어가", "다신 놓지 않을게", "우리 노래는 영원해", "이 심장은 멈추지 않아"]
  },
  power: {
    en: ["We rise to the top, no fear", "Crown on, don't stop now", "Stronger than yesterday", "We own this moment", "Break the silence — start the riot"],
    kr: ["우린 절대 멈추지 않아", "왕관을 쓰고 달려가", "어제보다 더 강해", "지금 이 순간을 가져", "침묵을 깨고 일어나"]
  },
  youth: {
    en: ["Neon nights and restless dreams", "Run with me into sunrise", "We were born to shine", "Keep the flame alive", "Dancing till the sun will rise"],
    kr: ["네온 불빛 아래 춤춰", "해 뜰 때까지 달려", "우린 빛나기 위해 태어났어", "불씨를 꺼지지 않게 해", "젊음의 밤은 끝없어"]
  }
};
const ADLIB = { en:["Oh", "Yeah", "Na-na", "Woah", "Hey"], kr:["어", "예", "나나", "우와", "오"] };

// ---------- STRUCTURE ----------
const STRUCT = [
  {name:"Intro", min:3, max:5},
  {name:"Verse 1", min:5, max:7},
  {name:"Pre-Chorus", min:3, max:5},
  {name:"Chorus", min:7, max:9},
  {name:"Verse 2", min:5, max:7},
  {name:"Rap", min:6, max:9},
  {name:"Bridge", min:3, max:5},
  {name:"Chorus (Repeat)", min:7, max:9},
  {name:"Outro", min:2, max:4}
];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

// ---------- VOICE LOADING ----------
let voices = [];
function loadVoices(){
  voices = window.speechSynthesis.getVoices() || [];
}
if ('speechSynthesis' in window){
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// ---------- BUILD UI SELECTORS ----------
document.addEventListener("DOMContentLoaded", ()=>{
  // theme choices on all pages
  const themeSelects = document.querySelectorAll("#themeChoice, #themeChoiceGen, #themeChoiceGal, #themeChoiceAbout");
  themeSelects.forEach(s=>{
    if(!s) return;
    s.addEventListener("change", ()=>applyStyle(s.value));
    // set default from localStorage
    const stored = localStorage.getItem("yg_style") || "yg";
    s.value = stored;
    applyStyle(stored);
  });

  // build solo/custom selectors
  const solo = document.getElementById("soloMember");
  const customList = document.getElementById("customList");
  if(solo && customList){
    ALL.forEach(m=>{
      const opt = document.createElement("option"); opt.value = m; opt.textContent = m; solo.appendChild(opt);
      const lab = document.createElement("label"); lab.style.marginRight="8px";
      const chk = document.createElement("input"); chk.type="checkbox"; chk.value=m; chk.name="customMember";
      lab.appendChild(chk); lab.appendChild(document.createTextNode(" "+m));
      customList.appendChild(lab);
    });
  }

  // show/hide solo/custom containers on page with radios
  document.querySelectorAll('input[name="who"]').forEach(r=>{
    r.addEventListener("change", ()=>{
      const soloBox = document.getElementById("soloSelect");
      const customBox = document.getElementById("customSelect");
      if(!soloBox||!customBox) return;
      soloBox.classList.toggle("hidden", r.value!=="solo");
      customBox.classList.toggle("hidden", r.value!=="custom");
    });
  });

  // bind generator
  bindGenerator();
  populateGallery();
});

// ---------- STYLE APPLY ----------
function applyStyle(key){
  document.documentElement.setAttribute("data-style", key === "cute" ? "cute" : "yg");
  localStorage.setItem("yg_style", key);
  // also set selects to the same value if multiple on page
  document.querySelectorAll("#themeChoice, #themeChoiceGen, #themeChoiceGal, #themeChoiceAbout").forEach(s=>{
    if(s) s.value = key;
  });
}

// ---------- SONG GENERATOR ----------
function generateStructuredSong(memberSet, langMode="mixed", targetSec=180){
  const title = pick(["Neon Dreams","Starlight Fever","Midnight Blaze","Forever Young","Moonlight Run","Monster Neon"]);
  const themeKey = pick(Object.keys(THEMES));
  const pool = THEMES[themeKey];
  const isMixed = langMode === "mixed";
  let roster = shuffle([...memberSet]);
  let ridx = 0;
  let out = `Title: ${title}\nTheme: ${themeKey}\nDuration target: ${Math.round(targetSec)}s\n\n`;

  STRUCT.forEach(sec=>{
    out += `[${sec.name}]\n`;
    const lines = sec.min + Math.floor(Math.random()*(sec.max - sec.min + 1));
    for(let i=0;i<lines;i++){
      const member = roster[ridx % roster.length]; ridx++;
      let lang = langMode === "en" ? "en" : (langMode === "ko" ? "kr" : (Math.random() < 0.55 ? "en":"kr"));
      let phrase = pick(pool[lang]);
      if(Math.random() < 0.36) phrase += (lang === "en" ? " — " + pick(ADLIB.en) : " — " + pick(ADLIB.kr));
      if(isMixed && Math.random() < 0.12) phrase += " (la la)";
      out += `${member}: ${phrase}\n`;
    }
    out += "\n";
  });

  return out;
}

// ---------- UI BINDING (generator page) ----------
function bindGenerator(){
  const generateBtn = document.getElementById("generateBtn");
  const playTTSBtn = document.getElementById("playTTS");
  const stopTTSBtn = document.getElementById("stopTTS");
  const renderWavBtn = document.getElementById("renderWav");
  const saveBtn = document.getElementById("saveBtn");
  const lyricsEl = document.getElementById("lyricsOutput");
  const durTargetEl = document.getElementById("durTarget");
  const combosEl = document.getElementById("combos");
  const downloadLink = document.getElementById("downloadLink");
  const audioEl = document.getElementById("downloadableAudio");

  if(combosEl) combosEl.textContent = "≥ " + (120000).toLocaleString();

  let currentSong = "";

  // Generate
  if(generateBtn){
    generateBtn.addEventListener("click", ()=>{
      const who = document.querySelector('input[name="who"]:checked').value;
      let members = [];
      if(who === "blackpink") members = [...BLACKPINK];
      else if(who === "babymonster") members = [...BABYMONSTER];
      else if(who === "both") members = [...ALL];
      else if(who === "solo"){
        const s = document.getElementById("soloMember").value;
        if(!s) return alert("Select a solo member.");
        members = [s];
      } else {
        const checked = Array.from(document.querySelectorAll('input[name="customMember"]:checked')).map(c=>c.value);
        if(checked.length === 0) return alert("Pick 2–3 members.");
        if(checked.length > 3) return alert("Pick at most 3 members.");
        members = checked;
      }
      const langMode = document.getElementById("langMode").value;
      const duration = parseInt(document.getElementById("duration").value,10);
      currentSong = generateStructuredSong(members, langMode, duration);
      lyricsEl.textContent = currentSong;
      durTargetEl.textContent = `~${Math.floor(duration/60)}:${String(duration%60).padStart(2,"0")}`;
      renderWavBtn.disabled = false;
      downloadLink.classList.add("disabled");
      audioEl.src = "";
    });
  }

  // Play Live TTS
  playTTSBtn && playTTSBtn.addEventListener("click", ()=>{
    if(!currentSong) return alert("Generate a song first.");
    // Build lines
    const lines = currentSong.split("\n").filter(l=>l.trim().length>0 && !/^\[/.test(l) && !/^(Title:|Theme:|Duration)/i.test(l));
    speechSynthesis.cancel();
    const utterances = [];
    lines.forEach(line=>{
      const text = line.split(":").slice(1).join(":").trim();
      if(!text) return;
      const u = new SpeechSynthesisUtterance(text);
      // prefer Korean if Hangul detected
      if(/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text)){
        u.lang = "ko-KR";
        const v = voices.find(x=>x.lang && x.lang.startsWith("ko"));
        if(v) u.voice = v;
      } else {
        u.lang = "en-US";
        const v = voices.find(x=>x.lang && x.lang.startsWith("en"));
        if(v) u.voice = v;
      }
      u.rate = 0.95 + Math.random()*0.1;
      u.pitch = 1.0 + (Math.random()*0.2-0.1);
      utterances.push(u);
    });
    if(utterances.length === 0) return;
    stopTTSBtn.disabled = false;
    // chain
    let i = 0;
    utterances[i].onend = function next(){
      i++;
      if(i < utterances.length){
        speechSynthesis.speak(utterances[i]);
        utterances[i].onend = next;
      } else {
        stopTTSBtn.disabled = true;
      }
    };
    speechSynthesis.speak(utterances[0]);
  });

  stopTTSBtn && stopTTSBtn.addEventListener("click", ()=>{
    speechSynthesis.cancel();
    stopTTSBtn.disabled = true;
  });

  // Render WAV (WebAudio synth + MediaRecorder)
  renderWavBtn && renderWavBtn.addEventListener("click", async ()=>{
    if(!currentSong) return alert("Generate a song first.");
    renderWavBtn.disabled = true;
    document.getElementById("renderStatus").textContent = "Rendering audio... (may take 10–40s)";
    try{
      const dur = parseInt(document.getElementById("duration").value,10) || 180;
      const blob = await renderSongToBlob(currentSong, {lengthSec: dur, bpm: 108});
      const url = URL.createObjectURL(blob);
      audioEl.src = url;
      const dl = document.getElementById("downloadLink");
      dl.href = url; dl.classList.remove("disabled");
      dl.download = "ygfan_song.webm"; // browser-produced container
      document.getElementById("renderStatus").textContent = "Render complete.";
    }catch(err){
      console.error(err);
      alert("Audio render failed: " + (err.message||err));
      document.getElementById("renderStatus").textContent = "Render failed.";
    } finally {
      renderWavBtn.disabled = false;
      setTimeout(()=>document.getElementById("renderStatus").textContent = "Idle", 3500);
    }
  });

  // Save to gallery
  saveBtn && saveBtn.addEventListener("click", ()=>{
    if(!document.getElementById("lyricsOutput").textContent) return alert("Generate a song first.");
    const songs = JSON.parse(localStorage.getItem("yg_songs") || "[]");
    const audioSrc = document.getElementById("downloadableAudio").src || null;
    songs.unshift({lyrics: document.getElementById("lyricsOutput").textContent, date: new Date().toLocaleString(), audio: audioSrc});
    localStorage.setItem("yg_songs", JSON.stringify(songs.slice(0,80)));
    alert("Saved to Gallery.");
    populateGallery();
  });

  // Download lyrics quickly via keyboard-like button (exists earlier)
  const dlLyricsBtn = document.getElementById("downloadLyricsBtn");
  if(dlLyricsBtn) dlLyricsBtn.addEventListener("click", ()=>{
    const text = document.getElementById("lyricsOutput").textContent;
    if(!text) return alert("Generate a song first.");
    const blob = new Blob([text], {type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lyrics.txt"; a.click();
    URL.revokeObjectURL(url);
  });
}

// ---------- RENDER TO BLOB (simplified but reliable) ----------
async function renderSongToBlob(lyricsText, opts={bpm:108, lengthSec:180}){
  // Create AudioContext and destination (MediaStream)
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const dest = ctx.createMediaStreamDestination();
  master.connect(dest);

  // small synths: pad, kick, snare, vocal vowel
  function pad(time, freq){
    const o1 = ctx.createOscillator(); o1.type="sawtooth"; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type="sawtooth"; o2.frequency.value = freq*1.01;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.001, time); g.gain.linearRampToValueAtTime(0.3, time+0.1); g.gain.linearRampToValueAtTime(0.02, time+1.6);
    o1.connect(g); o2.connect(g); g.connect(master);
    o1.start(time); o2.start(time); o1.stop(time+1.9); o2.stop(time+1.9);
  }
  function kick(time){
    const o = ctx.createOscillator(); o.type="sine"; const g = ctx.createGain();
    o.frequency.setValueAtTime(120, time);
    g.gain.setValueAtTime(0.001, time); g.gain.exponentialRampToValueAtTime(0.7, time+0.02); g.gain.exponentialRampToValueAtTime(0.0001, time+0.35);
    o.connect(g); g.connect(master);
    o.start(time); o.stop(time+0.4);
  }
  function snare(time){
    const size = ctx.sampleRate * 0.14;
    const buf = ctx.createBuffer(1, size, ctx.sampleRate); const d = buf.getChannelData(0);
    for(let i=0;i<size;i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(ctx.sampleRate*0.02));
    const s = ctx.createBufferSource(); s.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1500;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, 0);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(time); s.stop(time+0.18);
  }
  function singVowel(time, freq, vowel='a', dur=0.16){
    const o = ctx.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(freq, time);
    const b1 = ctx.createBiquadFilter(); b1.type="bandpass";
    const b2 = ctx.createBiquadFilter(); b2.type="bandpass";
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, time);
    const formants = { a:[800,1200], e:[400,1700], i:[300,2200], o:[450,800], u:[300,600] };
    const f = formants[vowel] || formants.a;
    b1.frequency.value = f[0]; b2.frequency.value = f[1];
    o.connect(b1); o.connect(b2); b1.connect(g); b2.connect(g); g.connect(master);
    g.gain.exponentialRampToValueAtTime(0.45, time+0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, time+dur);
    o.start(time); o.stop(time+dur+0.02);
  }

  // prepare lines (strip headings)
  const raw = lyricsText.split("\n").filter(l=>l.trim().length>0 && !/^(Title:|Theme:|Duration)/i.test(l));
  const lines = raw.filter(l=>!/^\[/.test(l)).map(l=>l.split(":").slice(1).join(":").trim());

  // schedule events
  const bpm = opts.bpm || 108;
  const avgLine = Math.max(1.6, Math.min(4.0, (opts.lengthSec || 180) / Math.max(1, lines.length)));
  let t = ctx.currentTime + 0.6;
  for(let i=0;i<lines.length;i++){
    pad(t, 220 + (Math.random()*30));
    kick(t + 0.08);
    snare(t + (avgLine*0.5));
    const text = lines[i];
    const vowels = (text.match(/[aeiouAEIOU]/g) || []).slice(0,8);
    const syllCount = Math.max(1, Math.min(8, vowels.length || Math.ceil(avgLine/0.45)));
    for(let s=0;s<syllCount;s++){
      const vowel = vowels[s] ? vowels[s].toLowerCase() : ['a','e','i','o','u'][Math.floor(Math.random()*5)];
      const freq = 220 + (Math.sin(i+s)*36) + (Math.random()*60);
      const when = t + (s * (avgLine / syllCount));
      singVowel(when, freq, vowel, 0.12 + Math.random()*0.18);
    }
    t += avgLine * (0.92 + Math.random()*0.18);
  }

  const stopAt = t + 0.8;
  const recorder = new MediaRecorder(dest.stream);
  const parts = [];
  recorder.ondataavailable = e => parts.push(e.data);
  recorder.start();

  // wait until done
  await new Promise(res => setTimeout(res, Math.max(1200, Math.floor((stopAt - ctx.currentTime)*1000))));
  recorder.stop();
  await new Promise(res => recorder.onstop = res);

  // create blob (type may be audio/webm or audio/ogg depending on browser)
  const blob = new Blob(parts, {type: parts[0]?.type || 'audio/webm'});
  try{ ctx.close(); }catch(e){}
  return blob;
}

// ---------- GALLERY ----------
function populateGallery(){
  const container = document.getElementById("galleryContainer");
  if(!container) return;
  const songs = JSON.parse(localStorage.getItem("yg_songs") || "[]");
  if(songs.length === 0){
    container.innerHTML = "<div class='card'>No saved songs yet. Generate a song and press Save.</div>"; return;
  }
  container.innerHTML = songs.map(s=>{
    const audio = s.audio ? `<audio controls src="${s.audio}" style="width:100%"></audio>` : "";
    return `<div class="card"><div style="color:var(--muted);font-size:.85rem">${s.date}</div><pre style="white-space:pre-wrap;margin-top:8px">${s.lyrics}</pre>${audio}</div>`;
  }).join("\n");
        }
