// Configure your ML backend endpoint dynamically (auto-detects local vs Vercel deployment):
const ML_API_ENDPOINT = (
  typeof window !== 'undefined' &&
  window.location &&
  window.location.hostname &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  window.location.protocol !== 'file:'
) ? '/predict' : 'http://127.0.0.1:8000/predict';

// Sample test presets so you can quickly test your UI & ML API
const SAMPLE_INPUT_PRESETS = {
  rice:        { N: 90,  P: 42,  K: 43,  temperature: 20.88, humidity: 82.00, ph: 6.50, rainfall: 202.94 },
  maize:       { N: 78,  P: 48,  K: 20,  temperature: 22.39, humidity: 65.09, ph: 6.25, rainfall: 84.77 },
  chickpea:    { N: 40,  P: 68,  K: 80,  temperature: 18.87, humidity: 16.86, ph: 7.34, rainfall: 80.06 },
  kidneybeans: { N: 21,  P: 68,  K: 20,  temperature: 20.12, humidity: 21.61, ph: 5.75, rainfall: 105.92 },
  pigeonpeas:  { N: 21,  P: 68,  K: 20,  temperature: 27.74, humidity: 48.06, ph: 5.79, rainfall: 149.46 },
  mothbeans:   { N: 21,  P: 48,  K: 20,  temperature: 28.19, humidity: 53.16, ph: 6.83, rainfall: 51.20 },
  mungbean:    { N: 21,  P: 47,  K: 20,  temperature: 28.53, humidity: 85.50, ph: 6.72, rainfall: 48.40 },
  blackgram:   { N: 40,  P: 67,  K: 19,  temperature: 29.97, humidity: 65.12, ph: 7.13, rainfall: 67.88 },
  lentil:      { N: 19,  P: 68,  K: 19,  temperature: 24.51, humidity: 64.80, ph: 6.93, rainfall: 45.68 },
  pomegranate: { N: 19,  P: 19,  K: 40,  temperature: 21.84, humidity: 90.13, ph: 6.43, rainfall: 107.53 },
  banana:      { N: 100, P: 82,  K: 50,  temperature: 27.38, humidity: 80.36, ph: 5.98, rainfall: 104.63 },
  mango:       { N: 20,  P: 27,  K: 30,  temperature: 31.21, humidity: 50.16, ph: 5.77, rainfall: 94.70 },
  grapes:      { N: 23,  P: 133, K: 200, temperature: 23.85, humidity: 81.88, ph: 6.03, rainfall: 69.61 },
  watermelon:  { N: 99,  P: 17,  K: 50,  temperature: 25.59, humidity: 85.16, ph: 6.50, rainfall: 50.79 },
  muskmelon:   { N: 100, P: 18,  K: 50,  temperature: 28.66, humidity: 92.34, ph: 6.36, rainfall: 24.69 },
  apple:       { N: 21,  P: 134, K: 200, temperature: 22.63, humidity: 92.33, ph: 5.93, rainfall: 112.65 },
  orange:      { N: 20,  P: 17,  K: 10,  temperature: 22.77, humidity: 92.17, ph: 7.02, rainfall: 110.47 },
  papaya:      { N: 50,  P: 59,  K: 50,  temperature: 33.72, humidity: 92.40, ph: 6.74, rainfall: 142.63 },
  coconut:     { N: 22,  P: 17,  K: 31,  temperature: 27.41, humidity: 94.84, ph: 5.98, rainfall: 175.69 },
  cotton:      { N: 118, P: 46,  K: 20,  temperature: 23.99, humidity: 79.84, ph: 6.91, rainfall: 80.40 },
  jute:        { N: 78,  P: 47,  K: 40,  temperature: 24.96, humidity: 79.64, ph: 6.73, rainfall: 174.79 },
  coffee:      { N: 101, P: 29,  K: 30,  temperature: 25.54, humidity: 58.87, ph: 6.79, rainfall: 158.07 }
};

function getSevenInputs() {
  return {
    N: parseFloat(document.getElementById('input-n').value) || 0,
    P: parseFloat(document.getElementById('input-p').value) || 0,
    K: parseFloat(document.getElementById('input-k').value) || 0,
    ph: parseFloat(document.getElementById('input-ph').value) || 6.5,
    temperature: parseFloat(document.getElementById('input-temp').value) || 25,
    humidity: parseFloat(document.getElementById('input-humidity').value) || 60,
    rainfall: parseFloat(document.getElementById('input-rainfall').value) || 100
  };
}

function setSevenInputs(n, p, k, temp, hum, ph, rain) {
  document.getElementById('input-n').value = Math.round(n);
  document.getElementById('slider-n').value = Math.round(n);
  document.getElementById('input-p').value = Math.round(p);
  document.getElementById('slider-p').value = Math.round(p);
  document.getElementById('input-k').value = Math.round(k);
  document.getElementById('slider-k').value = Math.round(k);
  document.getElementById('input-temp').value = Number(temp).toFixed(2);
  document.getElementById('temp-slider').value = Number(temp).toFixed(2);
  document.getElementById('input-humidity').value = Number(hum).toFixed(2);
  document.getElementById('slider-humidity').value = Number(hum).toFixed(2);
  document.getElementById('input-ph').value = Number(ph).toFixed(2);
  document.getElementById('slider-ph').value = Number(ph).toFixed(2);
  document.getElementById('input-rainfall').value = Number(rain).toFixed(2);
  document.getElementById('rainfall-slider').value = Number(rain).toFixed(2);
  syncInputGuideUI();
}

function syncFromSlider(key) {
  document.getElementById('input-' + key).value = document.getElementById('slider-' + key).value;
  syncInputGuideUI();
}

function syncFromNumber(key) {
  const numEl = document.getElementById('input-' + key);
  const sldEl = document.getElementById('slider-' + key);
  if (numEl && sldEl && numEl.value !== '') sldEl.value = numEl.value;
  syncInputGuideUI();
}

function syncTempFromSlider() {
  document.getElementById('input-temp').value = document.getElementById('temp-slider').value;
  syncInputGuideUI();
}

function syncTempFromNumber() {
  const val = document.getElementById('input-temp').value;
  if (val !== '') document.getElementById('temp-slider').value = val;
  syncInputGuideUI();
}

function syncRainFromSlider() {
  document.getElementById('input-rainfall').value = document.getElementById('rainfall-slider').value;
  syncInputGuideUI();
}

function syncRainFromNumber() {
  const val = document.getElementById('input-rainfall').value;
  if (val !== '') document.getElementById('rainfall-slider').value = val;
  syncInputGuideUI();
}

function loadCropPreset(label) {
  const d = SAMPLE_INPUT_PRESETS[label];
  if (!d) return;
  setSevenInputs(d.N, d.P, d.K, d.temperature, d.humidity, d.ph, d.rainfall);
  showToast(`Loaded sample inputs for ${label.toUpperCase()}`);
}

function loadRandomCsvRow() {
  const keys = Object.keys(SAMPLE_INPUT_PRESETS);
  const pick = keys[Math.floor(Math.random() * keys.length)];
  const sel = document.getElementById('csv-preset-select');
  if (sel) sel.value = pick;
  loadCropPreset(pick);
}

function syncInputGuideUI() {
  const inp = getSevenInputs();
  const lp = document.getElementById('info-live-p');    if (lp) lp.textContent = Math.round(inp.P) + ' kg/ha';
  const lk = document.getElementById('info-live-k');    if (lk) lk.textContent = Math.round(inp.K) + ' kg/ha';
  const ln = document.getElementById('info-live-n');    if (ln) ln.textContent = Math.round(inp.N) + ' kg/ha';
  const lph = document.getElementById('info-live-ph');  if (lph) lph.textContent = 'pH ' + inp.ph.toFixed(2);
  const lt = document.getElementById('info-live-temp'); if (lt) lt.textContent = inp.temperature.toFixed(2) + ' °C';
  const lh = document.getElementById('info-live-hum');  if (lh) lh.textContent = inp.humidity.toFixed(2) + '%';
  const lr = document.getElementById('info-live-rain'); if (lr) lr.textContent = inp.rainfall.toFixed(2) + ' mm';

  const recap = document.getElementById('banner-input-recap');
  if (recap) {
    recap.textContent = `N ${Math.round(inp.N)} · P ${Math.round(inp.P)} · K ${Math.round(inp.K)} · pH ${inp.ph.toFixed(2)} · ${inp.temperature.toFixed(2)}°C · ${inp.humidity.toFixed(2)}% humidity · ${inp.rainfall.toFixed(2)} mm rainfall`;
  }
}

async function handleRecommendSubmit() {
  const payload = getSevenInputs();
  syncInputGuideUI();

  const cropNameEl = document.getElementById('banner-crop-name');
  const cropSubEl = document.getElementById('banner-crop-hindi');
  const confEl = document.getElementById('banner-confidence');
  const advHead = document.getElementById('advisory-headline');
  const advBody = document.getElementById('advisory-body');

  if (cropNameEl) cropNameEl.textContent = 'Predicting...';

  try {
    const res = await fetch(ML_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const predictedCrop = (data.crop || data.prediction || data.label || 'Unknown').toString();
    const confidence = data.confidence || data.probability || null;

    const apiOptions = Array.isArray(data.recommendations)
      ? data.recommendations
      : Array.isArray(data.predictions)
        ? data.predictions
        : null;

    renderPredictionResult(predictedCrop, confidence, payload, true, apiOptions);
    showToast(`ML Model Recommended: ${predictedCrop.toUpperCase()}`);
  } catch (err) {
    if (cropNameEl) cropNameEl.textContent = 'Recommendation unavailable';
    if (cropSubEl) cropSubEl.textContent = 'The recommendation service is not reachable';
    if (confEl) confEl.textContent = 'Try again';
    if (advHead) advHead.textContent = 'Field values are ready';
    if (advBody) {
      advBody.textContent = 'Check your connection and run the assessment again.';
    }
    renderProfileAlternatives(payload);
    showToast('Unable to reach the recommendation service');
  }
}

function normalizedOptions(apiOptions, predictedCrop, confidence, payload) {
  if (apiOptions && apiOptions.length) {
    return apiOptions.slice(0, 3).map((item, index) => {
      if (typeof item === 'string') {
        return { name: item, score: index === 0 && confidence ? `${confidence}% confidence` : 'Recommended' };
      }
      const name = item.crop || item.prediction || item.label || item.name || 'Unknown';
      const score = item.confidence || item.probability || item.score;
      return { name: String(name), score: score ? `${score}% match` : 'Recommended' };
    });
  }

  const keys = Object.keys(SAMPLE_INPUT_PRESETS).filter((key) => key !== predictedCrop.toLowerCase());
  const ranked = keys.map((key) => {
    const preset = SAMPLE_INPUT_PRESETS[key];
    const distance =
      Math.pow((preset.N - payload.N) / 140, 2) +
      Math.pow((preset.P - payload.P) / 145, 2) +
      Math.pow((preset.K - payload.K) / 205, 2) +
      Math.pow((preset.ph - payload.ph) / 7, 2) +
      Math.pow((preset.temperature - payload.temperature) / 45, 2) +
      Math.pow((preset.humidity - payload.humidity) / 100, 2) +
      Math.pow((preset.rainfall - payload.rainfall) / 300, 2);
    const match = Math.max(55, Math.round((1 - Math.min(distance, 1)) * 100));
    return { name: key, score: `${match}% profile match` };
  }).sort((a, b) => parseInt(b.score, 10) - parseInt(a.score, 10));

  return [
    { name: predictedCrop, score: confidence ? `${confidence}% model confidence` : 'Top model result' },
    ...ranked.slice(0, 2)
  ];
}

function renderProfileAlternatives(payload) {
  const ranked = Object.keys(SAMPLE_INPUT_PRESETS).map((key) => {
    const preset = SAMPLE_INPUT_PRESETS[key];
    const distance =
      Math.pow((preset.N - payload.N) / 140, 2) +
      Math.pow((preset.P - payload.P) / 145, 2) +
      Math.pow((preset.K - payload.K) / 205, 2) +
      Math.pow((preset.ph - payload.ph) / 7, 2) +
      Math.pow((preset.temperature - payload.temperature) / 45, 2) +
      Math.pow((preset.humidity - payload.humidity) / 100, 2) +
      Math.pow((preset.rainfall - payload.rainfall) / 300, 2);
    const match = Math.max(55, Math.round((1 - Math.min(distance, 1)) * 100));
    return { name: key, score: `${match}% profile match` };
  }).sort((a, b) => parseInt(b.score, 10) - parseInt(a.score, 10)).slice(0, 3);
  const cards = document.querySelectorAll('#crop-options .crop-option');
  cards.forEach((card, index) => {
    const item = ranked[index];
    card.classList.toggle('active', index === 0);
    card.querySelector('.crop-option-label').textContent = index === 0 ? 'Nearest profile' : 'Alternative';
    card.querySelector('.crop-option-name').textContent = item
      ? item.name.charAt(0).toUpperCase() + item.name.slice(1)
      : 'Not available';
    card.querySelector('.crop-option-score').textContent = item ? item.score : 'No additional result';
  });
}

function renderPredictionResult(cropLabel, confidence, payload, fromApi, apiOptions) {
  const title = cropLabel.charAt(0).toUpperCase() + cropLabel.slice(1);
  const confText = confidence ? `${confidence}% confidence` : 'Top model result';

  document.getElementById('banner-crop-name').textContent = title;
  document.getElementById('banner-crop-hindi').textContent = fromApi
    ? 'Based on the field values you entered'
    : 'Run the assessment to see a result';
  document.getElementById('banner-confidence').textContent = confText;
  document.getElementById('top-match-summary').textContent = confText;
  document.getElementById('advisory-headline').textContent = `Recommendation: ${title}`;
  document.getElementById('advisory-body').textContent =
    `Based on N ${payload.N}, P ${payload.P}, K ${payload.K}, pH ${payload.ph}, ${payload.temperature}°C, ${payload.humidity}% humidity, and ${payload.rainfall} mm rainfall.`;

  const options = normalizedOptions(apiOptions, cropLabel, confidence, payload);
  const cards = document.querySelectorAll('#crop-options .crop-option');
  cards.forEach((card, index) => {
    const item = options[index];
    const name = card.querySelector('.crop-option-name');
    const score = card.querySelector('.crop-option-score');
    const label = card.querySelector('.crop-option-label');
    card.classList.toggle('active', index === 0);
    if (item) {
      name.textContent = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      score.textContent = item.score;
      label.textContent = index === 0 ? 'Best match' : 'Alternative';
    } else {
      name.textContent = 'Not available';
      score.textContent = 'No additional result';
      label.textContent = 'Alternative';
    }
  });
}

function runAssessmentAndScroll() {
  document.getElementById('assessment-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const VIDEO_CHAPTERS = [
  { title: '1/4: Terraced Rice & Jute Paddies — India', caption: 'Aerial flyover across lush green terraced rice paddies & humid delta crops in India.' },
  { title: '2/4: Millets (Bajra, Jowar & Maize) — Semi-Arid India', caption: 'Gliding over golden-rust pearl millet, sorghum, and maize fields in dryland India.' },
  { title: '3/4: Cotton & Pulses (Chickpea, Moong, Urad) — Dark Soil', caption: 'Low-altitude drone pass over neat green cotton and pulse crop rows.' },
  { title: '4/4: Tropical Orchards & Coconut Plantations — South India', caption: 'Soaring over mango, banana, and coconut palm plantations at sunrise.' }
];

let activeChapterIdx = 0;
let isVideoPlaying = true;
let isLooping = true;
let droneLoopTimer = null;

function showDroneSlide(idx) {
  activeChapterIdx = (idx + VIDEO_CHAPTERS.length) % VIDEO_CHAPTERS.length;
  for (let i = 0; i < VIDEO_CHAPTERS.length; i++) {
    const img = document.getElementById('drone-img-' + i);
    if (img) img.classList.toggle('active', i === activeChapterIdx);
  }
  const ch = VIDEO_CHAPTERS[activeChapterIdx];
  const badge = document.getElementById('sim-chapter-badge');
  const cap = document.getElementById('sim-caption-text');
  if (badge) badge.textContent = ch.title;
  if (cap) cap.textContent = ch.caption;
}

function stepCanvasChapter(dir) {
  showDroneSlide(activeChapterIdx + dir);
}

function toggleCanvasVideo() {
  isVideoPlaying = !isVideoPlaying;
  const icon = document.getElementById('sim-play-icon');
  if (icon) icon.textContent = isVideoPlaying ? '⏸ Pause' : '▶ Play';
  for (let i = 0; i < VIDEO_CHAPTERS.length; i++) {
    const img = document.getElementById('drone-img-' + i);
    if (img) img.classList.toggle('drone-paused', !isVideoPlaying);
  }
}

function toggleMonsoonRain() {
  isLooping = !isLooping;
  const btn = document.getElementById('sim-rain-btn');
  if (btn) btn.textContent = isLooping ? '🔁 Loop: ON' : '⏹ Loop: OFF';
}

function startCropVideoLoop() {
  if (droneLoopTimer) clearInterval(droneLoopTimer);
  showDroneSlide(0);
  droneLoopTimer = setInterval(() => {
    if (isVideoPlaying && isLooping) showDroneSlide(activeChapterIdx + 1);
  }, 5500);
}

function copyHex(hex, name) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(hex).then(() => showToast(`Copied ${name} (${hex})`));
  }
}

let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('flex');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 2800);
}

window.addEventListener('DOMContentLoaded', () => {
  syncInputGuideUI();
  startCropVideoLoop();
});
function fallbackImg(img, filename) {
  const step = parseInt(img.dataset.fbStep || '0', 10);
  if (step === 0) {
    img.dataset.fbStep = '1';
    img.src = filename; // Try same folder as index.html
  } else if (step === 1) {
    img.dataset.fbStep = '2';
    img.src = '/static/images/' + filename; // Try Flask/FastAPI static/images/
  } else if (step === 2) {
    img.dataset.fbStep = '3';
    img.src = '/static/' + filename; // Try Flask/FastAPI static/
  }
}