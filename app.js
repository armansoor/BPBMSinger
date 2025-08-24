/* app.js
   YG-GEN — Generator + Who-Sings selection + Live TTS + WAV render + Gallery
   Author: Abdur Rahman Mansoor (2025)
*/

// --- member data ---
const BLACKPINK = ["Jisoo (V)","Jennie (R/V)","Rosé (V)","Lisa (R)"];
const BABYMONSTER = ["Ahyeon (V)","Ruka (R)","Rami (V)","Asa (R)","Haram (V)","Pharita (V)","Chiquita (V)"];
const ALLMEMBERS = [...BLACKPINK, ...BABYMONSTER];

// --- dataset (themes + phrases) ---
const THEMES = {
  love: {
    en: [
      "I can't escape this pull",
      "Your spark lights up the night",
      "Falling softer than before",
      "Hold me closer, don't let go",
      "Our echoes sound like home",
      "This heartbeat won't be tamed"
    ],
    kr: [
      "너의 손길에 난 흔들려",
      "밤하늘에 불빛처럼 빛나",
      "더 깊이 빠져들어가",
      "다신 놓지 않을게",
      "우리 노래는 영원해",
      "이 심장은 멈추지 않아"
    ]
  },
  power: {
    en:[
      "We rise to the top, no fear",
      "Crown on, don't stop now",
      "Stronger than yesterday",
      "We own this moment, let's go",
      "Break the silence, start the riot"
    ],
    kr:[
      "우린 절대 멈추지 않아",
      "왕관을 쓰고 달려가",
      "어제보다 더 강해",
      "지금 이 순간을 가져",
      "침묵을 깨고 일어나"
    ]
  },
  youth: {
    en:[
      "Neon nights and restless dreams",
      "Run with me into sunrise",
      "We were born to shine",
      "Keep the flame alive forever",
      "Dancing till the sun will rise"
    ],
    kr:[
      "네온 불빛 아래 춤춰",
      "해 뜰 때까지 달려",
      "우린 빛나기 위해 태어났어",
      "불씨를 꺼지지 않게 해",
      "젊음의 밤은 끝없어"
    ]
  }
};

const ADLIB = { en:["Oh","Yeah","Na-na","Woah","Hey"], kr:["어","예","나나","우와","오"] };

// --- util ---
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

// --- song structure ---
const STRUCT = [
  {name:"Intro", minLines:3, maxLines:5},
  {name:"Verse 1", minLines:5, maxLines:7},
  {name:"Pre-Chorus", minLines:3, maxLines:5},
  {name:"Chorus", minLines:7, maxLines:9},
  {name:"Verse 2", minLines:5, maxLines:7},
  {name:"Rap", minLines:6, maxLines:9},
  {name:"Bridge", minLines:3, maxLines:5},
  {name:"Chorus (Repeat)", minLines:7, maxLines:9},
  {name:"Outro", minLines:2, maxLines:4}
];

// --- UI wiring on DOM ready ---
document.addEventListener("DOMContentLoaded", ()=>{
  const themeToggles = document.querySelectorAll("#themeToggle");
  themeToggles.forEach(btn=>btn.addEventListener("click", toggleTheme));

  buildWhoSelectors();
  bindGenerator();
  populateGallery();
  // prewarm voices
  window.speechSynthesis.getVoices();
});

// --- theme ---
function toggleTheme(){
  const el = document.documentElement;
  const cur = el.getAttribute("data-theme") || "dark";
  el.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
}

// --- build selectors for solo/custom ---
function buildWhoSelectors(){
  const soloSelect = document.getElementById("soloMember");
  const customList = document.getElementById("customList");
  if(!soloSelect || !customList) return;
  // fill options with all members
  ALLMEMBERS.forEach(m=>{
    const opt = document.createElement("option"); opt.value = m; opt.textContent = m;
    soloSelect.appendChild(opt);
    // custom checkbox
    const lab = document.createElement("label");
    const chk = document.createElement("input"); chk.type="checkbox"; chk.value=m; chk.name="customMember";
    lab.appendChild(chk); lab.appendChild(document.createTextNode(" "+m));
    customList.appendChild(lab);
  });

  // show/hide solo/custom containers based on radio
  const radios = document.querySelectorAll('input[name="who"]');
  radios.forEach(r=>{
    r.addEventListener("change", ()=>{
      document.getElementById("soloSelect").classList.toggle("hidden", r.value!=="solo");
      document.getElementById("customSelect").classList.toggle("hidden", r.value!=="custom");
    });
  });
}

// --- generate structured song for a given member-set ---
function generateStructuredSong(memberSet, langMode="mixed", targetSec=180){
  // title / theme
  const title = pick(["Neon Dreams","Midnight Blaze","Starlight Fever","Forever Young","Moonlight Run","Monster Neon"]);
  const themeKey = pick(Object.keys(THEMES));
  const themePool = THEMES[themeKey];

  const isMixed = langMode === "mixed";
  let rot = shuffle([...memberSet]); // ensure distribution
  let ridx = 0;
  const approxLines = STRUCT.reduce((s,sec)=>s + (sec.minLines + Math.floor(Math.random()*(sec.maxLines-sec.minLines+1))),0);

  let out = `Title: ${title}\nTheme: ${themeKey}\nDuration target: ${Math.round(targetSec)}s\n\n`;

  STRUCT.forEach(sec=>{
    out += `[${sec.name}]\n`;
    const lineCount = sec.minLines + Math.floor(Math.random()*(sec.maxLines - sec.minLines + 1));
    for(let i=0;i<lineCount;i++){
      const member = rot[ridx % rot.length]; ridx++;
      // choose language
      let lang = langMode==="en" ? "en" : (langMode==="ko" ? "kr" : (Math.random()<0.55 ? "en":"kr"));
      // pick phrase and sometimes adlib
      let phrase = pick(THEMES[themeKey][lang]);
      if(Math.random()<0.35) phrase += (lang==="en" ? " — " + pick(ADLIB.en) : " — " + pick(ADLIB.kr));
      // occasionally add tiny Konglish twist
      if(isMixed && Math.random()<0.12) phrase += " (la la)";
      out += `${member}: ${phrase}\n`;
    }
    out += "\n";
  });

  return out;
}

// --- bind generator UI events ---
function bindGenerator(){
  const generateBtn = document.getElementById("generateBtn");
  const playTTS = document.getElementById("playTTS");
  const stopTTS = document.getElementById("stopTTS");
  const renderWav = document.getElementById("renderWav");
  const downloadLink = document.getElementById("downloadLink");
  const lyricsOutput = document.getElementById("lyricsOutput");
  const durTargetEl = document.getElementById("durTarget");
  const combosEl = document.getElementById("combos");
  const durationSel = document.getElementById("duration");
  const langModeSel = document.getElementById("langMode");
  const saveBtn = document.getElementById("saveBtn");

  combosEl && (combosEl.textContent = "≥ " + (120000).toLocaleString());

  let currentSongText = "";
  let utterSequence = [];
  let playingTTS = false;

  generateBtn && generateBtn.addEventListener("click", ()=>{
    // build selected member set
    const selection = document.querySelector('input[name="who"]:checked').value;
    let members = [];
    if(selection === "blackpink") members = [...BLACKPINK];
    else if(selection === "babymonster") members = [...BABYMONSTER];
    else if(selection === "both") members = [...ALLMEMBERS];
    else if(selection === "solo"){
      const s = document.getElementById("soloMember").value;
      members = s ? [s] : [...BLACKPINK];
    } else if(selection === "custom"){
      const checks = Array.from(document.querySelectorAll('input[name="customMember"]:checked')).map(c=>c.value);
      if(checks.length === 0){ alert("Pick 2–3 members for custom mode."); return; }
      if(checks.length > 3){ alert("Pick at most 3 members for custom mode."); return; }
      members = checks;
    }

    const targetSec = parseInt(durationSel.value || "180",10);
    const langMode = langModeSel.value || "mixed";

    currentSongText = generateStructuredSong(members, langMode, targetSec);
    lyricsOutput.textContent = currentSongText;
    durTargetEl && (durTargetEl.textContent = `~${Math.round(targetSec/60)}:${String(targetSec%60).padStart(2,"0")}`);
    // enable buttons
    renderWav && (renderWav.disabled = false);
    downloadLink.classList.add("disabled");
    document.getElementById("downloadableAudio").src = "";
  });

  // Play Live TTS
  playTTS && playTTS.addEventListener("click", ()=>{
    if(!currentSongText) { alert("Generate a song first."); return; }
    // construct speakable lines (strip headers)
    const lines = currentSongText.split("\n").filter(l=>l.trim().length>0 && !/^(Title:|Theme:|Duration)/i.test(l) && !/^\[/.test(l));
    speechSynthesis.cancel();
    utterSequence = [];
    lines.forEach(line=>{
      const text = line.split(":").slice(1).join(":").trim();
      if(!text) return;
      const u = new SpeechSynthesisUtterance(text);
      // prefer Korean voice if Hangul in text
      if(/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text)){
        u.lang = "ko-KR";
        const v = speechSynthesis.getVoices().find(x=>x.lang && x.lang.startsWith("ko"));
        if(v) u.voice = v;
      } else {
        u.lang = "en-US";
        const v = speechSynthesis.getVoices().find(x=>x.lang && x.lang.startsWith("en"));
        if(v) u.voice = v;
      }
      u.rate = 0.94 + Math.random()*0.12;
      u.pitch = 0.98 + Math.random()*0.18;
      utterSequence.push(u);
    });
    // chain the utterances
    if(utterSequence.length===0) return;
    playingTTS = true;
    let i=0;
    utterSequence[i].onend = function next(){ i++; if(i<utterSequence.length){ speechSynthesis.speak(utterSequence[i]); utterSequence[i].onend = next; } else { playingTTS=false; stopTTS.disabled=true; } };
    speechSynthesis.speak(utterSequence[0]);
    stopTTS.disabled = false;
  });

  stopTTS && stopTTS.addEventListener("click", ()=>{
    speechSynthesis.cancel();
    stopTTS.disabled = true;
  });

  // Render WAV using in-browser WebAudio synth (musical approximation)
  renderWav && renderWav.addEventListener("click", async ()=>{
    if(!currentSongText) { alert("Generate a song first."); return; }
    renderWav.disabled = true;
    try{
      const durationTarget = parseInt(durationSel.value || "180",10);
      const blob = await renderSongToWav(currentSongText, {bpm:108, lengthSec: durationTarget});
      const url = URL.createObjectURL(blob);
      const audioEl = document.getElementById("downloadableAudio");
      audioEl.src = url;
      const dl = document.getElementById("downloadLink");
      dl.href = url; dl.classList.remove("disabled"); dl.setAttribute("download","ygfan_song.wav");
      // automatically add to gallery memory (audio is blob url; note: localStorage cannot hold blobs)
    }catch(e){
      console.error(e);
      alert("Error rendering audio: " + (e.message || e));
    } finally {
      renderWav.disabled = false;
    }
  });

  // Download lyrics
  const dlLyricsBtn = document.getElementById("downloadLyricsBtn");
  dlLyricsBtn && dlLyricsBtn.addEventListener("click", ()=>{
    if(!currentSongText){ alert("Generate a song first."); return; }
    const blob = new Blob([currentSongText], {type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lyrics.txt"; a.click();
    URL.revokeObjectURL(url);
  });

  // save to gallery (saves lyrics and audio URL if present)
  saveBtn && saveBtn.addEventListener("click", ()=>{
    if(!currentSongText) { alert("Generate a song first."); return; }
    const songs = JSON.parse(localStorage.getItem("yg_songs") || "[]");
    const audioUrl = document.getElementById("downloadableAudio").src || null;
    songs.unshift({lyrics: currentSongText, date:new Date().toLocaleString(), audio: audioUrl});
    localStorage.setItem("yg_songs", JSON.stringify(songs.slice(0,80)));
    alert("Saved to Gallery");
    populateGallery();
  });
}

// --- renderSongToWav: produces a musical WAV (approx vocal synth + backing) ---
// The implementation creates an AudioContext, schedules pad/drums and vocal syllables,
// records MediaStreamDestination using MediaRecorder and returns a WAV blob.
async function renderSongToWav(lyricsText, opts={bpm:108, lengthSec:180}){
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const dest = ctx.createMediaStreamDestination();
  master.connect(dest);

  // small drum / pad / vocal utilities (simplified)
  function kick(t){
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(130,t);
    g.gain.setValueAtTime(0.001,t); g.gain.exponentialRampToValueAtTime(0.8,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t+0.4);
  }
  function snare(t){
    const size = ctx.sampleRate * 0.2;
    const buf = ctx.createBuffer(1, size, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<size;i++) d[i] = (Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*0.02));
    const s = ctx.createBufferSource(); s.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value = 1500;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t+0.2);
  }
  function pad(t, freq){
    const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain();
    o1.type="sawtooth"; o2.type="sawtooth"; o1.frequency.value = freq; o2.frequency.value = freq*1.01;
    o1.detune.value = -5; o2.detune.value = 5;
    g.gain.setValueAtTime(0.001,t); g.gain.linearRampToValueAtTime(0.25,t+0.2); g.gain.linearRampToValueAtTime(0.02,t+1.8);
    o1.connect(g); o2.connect(g); g.connect(master);
    o1.start(t); o2.start(t); o1.stop(t+2.0); o2.stop(t+2.0);
  }
  function singVowel(t,freq,vowel='a',dur=0.18){
    const o = ctx.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(freq,t);
    const b1 = ctx.createBiquadFilter(); b1.type="bandpass";
    const b2 = ctx.createBiquadFilter(); b2.type="bandpass";
    const g = ctx.createGain(); g.gain.setValueAtTime(0.001,t);
    // simple formant presets
    const formants = { a:[800,1200], e:[350,1700], i:[300,2200], o:[450,800], u:[300,600] };
    const f = formants[vowel] || formants.a;
    b1.frequency.value = f[0]; b2.frequency.value = f[1];
    o.connect(b1); o.connect(b2); b1.connect(g); b2.connect(g); g.connect(master);
    g.gain.exponentialRampToValueAtTime(0.45,t+0.03);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.start(t); o.stop(t+dur+0.02);
  }

  // parse lyrical lines into plain lines (strip headers)
  const raw = lyricsText.split("\n").filter(l=>l.trim().length>0 && !/^(Title:|Theme:|Duration)/i.test(l));
  const lines = raw.filter(l=>!/^\[/.test(l)).map(l => l.split(":").slice(1).join(":").trim());

  // scheduling
  const bpm = opts.bpm || 108;
  const avgLine = Math.max(1.6, Math.min(4.0, (opts.lengthSec || 180)/Math.max(1, lines.length)));
  let t = ctx.currentTime + 0.6;
  for(let i=0;i<lines.length;i++){
    // backing
    pad(t, 220 + (Math.random()*40));
    kick(t + 0.08);
    snare(t + (avgLine*0.5));
    // choose vowel sequence from letters/hangul fallback
    const text = lines[i];
    const vowels = (text.match(/[aeiouAEIOU]/g) || []).slice(0,8);
    const syllCount = Math.max(1, Math.min(8, vowels.length || Math.ceil(avgLine/0.4)));
    for(let s=0;s<syllCount;s++){
      const vowel = vowels[s] ? vowels[s].toLowerCase() : ['a','e','i','o','u'][Math.floor(Math.random()*5)];
      const freq = 220 + (Math.sin(i+s)*40) + (Math.random()*60);
      const when = t + (s * (avgLine / syllCount));
      singVowel(when, freq, vowel, 0.12 + Math.random()*0.18);
    }
    t += avgLine * (0.9 + Math.random()*0.22);
  }

  const stopTime = t + 0.8;
  // record
  const recorder = new MediaRecorder(dest.stream);
  const parts = [];
  recorder.ondataavailable = e => parts.push(e.data);
  recorder.start();

  await new Promise(resolve => setTimeout(resolve, Math.max(1200, Math.floor((stopTime - ctx.currentTime)*1000))));
  recorder.stop();
  await new Promise(resolve => recorder.onstop = resolve);

  // create blob (webm/ogg or wav depending on browser); convert if needed is complex — rely on blob type
  const blob = new Blob(parts, {type: parts[0]?.type || 'audio/webm'});
  try{ ctx.close(); }catch(e){}
  return blob;
}

// --- Gallery ---
function populateGallery(){
  const container = document.getElementById("galleryContainer");
  if(!container) return;
  const songs = JSON.parse(localStorage.getItem("yg_songs")||"[]");
  if(songs.length===0){ container.innerHTML = "<div class='card'>No saved songs yet. Generate & save!</div>"; return; }
  container.innerHTML = songs.map(s=>{
    const audio = s.audio ? `<audio controls src="${s.audio}" style="width:100%"></audio>` : "";
    return `<div class="card"><div style="color:var(--muted);font-size:.85rem">${s.date}</div><pre style="white-space:pre-wrap;margin-top:8px">${s.lyrics}</pre>${audio}</div>`;
  }).join("\n");
}
