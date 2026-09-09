// Web Speech API helper with customizable accent and speed settings

export function getSpeechSettings() {
  try {
    const saved = localStorage.getItem('lingua_speech_settings');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // fallback
  }
  return {
    lang: 'en-US', // 'en-US', 'en-GB', 'en-AU'
    rate: 0.85,    // 0.7 to 1.2
    pitch: 1.0
  };
}

export function saveSpeechSettings(settings) {
  try {
    localStorage.setItem('lingua_speech_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save speech settings:', e);
  }
}

export function speak(text, customLang = null) {
  if (!('speechSynthesis' in window)) {
    console.warn('Tarayıcınız sesli telaffuz (Speech Synthesis) özelliğini desteklemiyor.');
    return;
  }

  window.speechSynthesis.cancel();

  const settings = getSpeechSettings();
  const lang = customLang || settings.lang || 'en-US';
  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.lang = lang;
  utterance.rate = settings.rate || 0.85;
  utterance.pitch = settings.pitch || 1.0;

  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(v => v.lang === lang) 
    || voices.find(v => v.lang.startsWith(lang.slice(0, 2)))
    || voices.find(v => v.lang.startsWith('en'));

  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  window.speechSynthesis.speak(utterance);
}
