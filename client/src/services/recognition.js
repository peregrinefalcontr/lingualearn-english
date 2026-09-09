// Web Speech Recognition API for interactive English pronunciation practice

export function isSpeechRecognitionSupported() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function createSpeechRecognizer(targetText, onResult, onError, lang = 'en-US') {
  if (!isSpeechRecognitionSupported()) {
    onError && onError('Tarayıcınız mikrofon ile konuşma tanıma (Speech Recognition) desteği sunmuyor. Chrome veya Edge önerilir.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();

  recognizer.lang = lang;
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.onresult = (event) => {
    const spoken = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence;

    // Calculate similarity
    const cleanSpoken = (spoken || '').toLowerCase().replace(/[.,!?;:"]/g, '').trim();
    const cleanTarget = (targetText || '').toLowerCase().replace(/[.,!?;:"]/g, '').trim();

    const isMatch = cleanSpoken === cleanTarget || cleanTarget.includes(cleanSpoken) || cleanSpoken.includes(cleanTarget);
    
    // Levenshtein / Token similarity
    const targetWords = cleanTarget.split(/\s+/);
    const spokenWords = cleanSpoken.split(/\s+/);
    let matchedWords = 0;
    targetWords.forEach(w => {
      if (spokenWords.includes(w)) matchedWords++;
    });

    const accuracyScore = targetWords.length > 0 
      ? Math.round((matchedWords / targetWords.length) * 100) 
      : (isMatch ? 100 : 0);

    onResult && onResult({
      spokenText: spoken,
      targetText,
      isMatch,
      accuracyScore,
      confidence
    });
  };

  recognizer.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    onError && onError(event.error === 'not-allowed' ? 'Mikrofon izni verilmedi.' : 'Ses anlaşılamadı, lütfen tekrar deneyin.');
  };

  return recognizer;
}
