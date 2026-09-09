const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'words.json');

const patterns = [
  {
    word: "I need to",
    meaning: "... yapmam lazım / gerekiyor",
    sentenceEn: "I need to wake up early tomorrow morning.",
    sentenceTr: "Yarın sabah erken uyanmam lazım."
  },
  {
    word: "I want to",
    meaning: "... yapmak istiyorum",
    sentenceEn: "I want to learn how to speak fluent English.",
    sentenceTr: "Nasıl akıcı İngilizce konuşulacağını öğrenmek istiyorum."
  },
  {
    word: "I like to",
    meaning: "... yapmayı severim",
    sentenceEn: "I like to read books before going to sleep.",
    sentenceTr: "Uyumadan önce kitap okumayı severim."
  },
  {
    word: "I'm good at",
    meaning: "... da iyiyim / başarılıyım",
    sentenceEn: "I'm good at solving complex math problems.",
    sentenceTr: "Karmaşık matematik problemlerini çözmekte iyiyimdir."
  },
  {
    word: "I'm tired of",
    meaning: "... den/dan sıkıldım / bıktım",
    sentenceEn: "I'm tired of waiting in traffic every single day.",
    sentenceTr: "Her gün trafikte beklemekten bıktım."
  },
  {
    word: "It's time to",
    meaning: "... zamanı geldi / vakti geldi",
    sentenceEn: "It's time to make a final decision about our plans.",
    sentenceTr: "Planlarımız hakkında nihai bir karar vermenin zamanı geldi."
  },
  {
    word: "Let me",
    meaning: "... yapmama izin ver / bırakayım",
    sentenceEn: "Let me check the schedule before answering.",
    sentenceTr: "Cevap vermeden önce takvimi kontrol etmeme izin ver."
  },
  {
    word: "I have to",
    meaning: "... yapmak zorundayım (mecburiyet)",
    sentenceEn: "I have to submit my project before midnight.",
    sentenceTr: "Projemi gece yarısından önce teslim etmek zorundayım."
  },
  {
    word: "I'm going to",
    meaning: "... yapacağım (planlanmış gelecek)",
    sentenceEn: "I'm going to visit my grandparents this weekend.",
    sentenceTr: "Bu hafta sonu büyükannemleri ziyaret edeceğim."
  },
  {
    word: "I used to",
    meaning: "Eskiden ... yapardım (artık yapmıyorum)",
    sentenceEn: "I used to play basketball when I was in high school.",
    sentenceTr: "Lisedeyken eskiden basketbol oynardım."
  },
  {
    word: "I will",
    meaning: "... yapacağım (anlık karar / söz)",
    sentenceEn: "I will call you as soon as I arrive at the airport.",
    sentenceTr: "Havaalanına varır varmaz seni arayacağım."
  },
  {
    word: "I can",
    meaning: "... yapabilirim (yetenek / izin)",
    sentenceEn: "I can speak three different foreign languages.",
    sentenceTr: "Üç farklı yabancı dil konuşabilirim."
  },
  {
    word: "I cannot (can't)",
    meaning: "... yapamam / elimden gelmez",
    sentenceEn: "I cannot attend the meeting because I am feeling sick.",
    sentenceTr: "Hasta hissettiğim için toplantıya katılamam."
  },
  {
    word: "I have",
    meaning: "... bende var / sahibiyim",
    sentenceEn: "I have a lot of work to complete today.",
    sentenceTr: "Bugün tamamlamam gereken çok işim var."
  },
  {
    word: "I don't have",
    meaning: "... bende yok / sahip değilim",
    sentenceEn: "I don't have enough time to finish this book today.",
    sentenceTr: "Bu kitabı bugün bitirmek için yeterli vaktim yok."
  },
  {
    word: "I need",
    meaning: "... ihtiyacım var",
    sentenceEn: "I need a cup of strong coffee to wake up.",
    sentenceTr: "Uyanmak için sert bir fincan kahveye ihtiyacım var."
  },
  {
    word: "I think",
    meaning: "Bence ... / ... olduğunu düşünüyorum",
    sentenceEn: "I think this is the most practical solution.",
    sentenceTr: "Bence bu en pratik çözümdür."
  },
  {
    word: "I believe",
    meaning: "... inanıyorum",
    sentenceEn: "I believe everyone deserves a second chance.",
    sentenceTr: "Herkesin ikinci bir şansı hak ettiğine inanıyorum."
  },
  {
    word: "According to",
    meaning: "... e/a göre (kaynak/kişi)",
    sentenceEn: "According to the weather forecast, it will rain tomorrow.",
    sentenceTr: "Hava durumuna göre yarın yağmur yağacak."
  },
  {
    word: "It depends on",
    meaning: "... ya/ye bağlı",
    sentenceEn: "Our weekend picnic depends on the weather conditions.",
    sentenceTr: "Hafta sonu pikniğimiz hava şartlarına bağlı."
  },
  {
    word: "I'm responsible for",
    meaning: "... dan/den sorumluyum",
    sentenceEn: "I'm responsible for training new employees in our team.",
    sentenceTr: "Ekibimizdeki yeni çalışanları eğitmekten sorumluyum."
  },
  {
    word: "Can you",
    meaning: "... yapabilir misin? (rica)",
    sentenceEn: "Can you pass the salt, please?",
    sentenceTr: "Lütfen tuzu uzatabilir misin?"
  },
  {
    word: "Could you",
    meaning: "... yapabilir misiniz? (kibar rica)",
    sentenceEn: "Could you explain that topic one more time, please?",
    sentenceTr: "Lütfen bu konuyu bir kez daha açıklayabilir misiniz?"
  },
  {
    word: "Would you like to",
    meaning: "... yapmak ister misiniz? (kibar teklif)",
    sentenceEn: "Would you like to join us for dinner tonight?",
    sentenceTr: "Bu akşam akşam yemeğinde bize katılmak ister misiniz?"
  },
  {
    word: "Do you want to",
    meaning: "... yapmak istiyor musun?",
    sentenceEn: "Do you want to watch a movie after work?",
    sentenceTr: "İşten sonra film izlemek istiyor musun?"
  },
  {
    word: "Are you",
    meaning: "Şu an ... yapıyor musun? / ... misin?",
    sentenceEn: "Are you listening to me carefully right now?",
    sentenceTr: "Şu an beni dikkatlice dinliyor musun?"
  },
  {
    word: "Have you ever",
    meaning: "Hiç ... yaptın mı? (deneyim)",
    sentenceEn: "Have you ever traveled to another country alone?",
    sentenceTr: "Hiç başka bir ülkeye tek başına seyahat ettin mi?"
  },
  {
    word: "What time do you",
    meaning: "Saat kaçta ... yaparsın?",
    sentenceEn: "What time do you usually wake up on weekdays?",
    sentenceTr: "Hafta içi günlerinde genellikle saat kaçta uyanırsın?"
  },
  {
    word: "Why don't you",
    meaning: "Neden ... yapmıyorsun? (tavsiye/öneri)",
    sentenceEn: "Why don't you take a short break and relax?",
    sentenceTr: "Neden kısa bir mola verip rahatlamıyorsun?"
  },
  {
    word: "I guess",
    meaning: "Sanırım / Tahmin ediyorum ki...",
    sentenceEn: "I guess we will have to reschedule our appointment.",
    sentenceTr: "Sanırım randevumuzu yeniden planlamamız gerekecek."
  },
  {
    word: "I suppose",
    meaning: "Tahmin ediyorum / Zannediyorum",
    sentenceEn: "I suppose they will arrive within the next hour.",
    sentenceTr: "Önümüzdeki bir saat içinde varacaklarını zannediyorum."
  },
  {
    word: "Maybe I should",
    meaning: "Belki de ... yapmalıyım",
    sentenceEn: "Maybe I should ask for help before it is too late.",
    sentenceTr: "Belki de çok geç olmadan yardım istemeliyim."
  },
  {
    word: "Perhaps we can",
    meaning: "Belki ... yapabiliriz (öneri)",
    sentenceEn: "Perhaps we can meet for coffee tomorrow afternoon.",
    sentenceTr: "Belki yarın öğleden sonra bir kahve için buluşabiliriz."
  }
];

function appendPatterns() {
  let existingWords = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      existingWords = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
    }
  } catch (e) {
    existingWords = [];
  }

  let addedCount = 0;
  let updatedCount = 0;

  patterns.forEach((p, idx) => {
    const existingIndex = existingWords.findIndex(w => w.word.toLowerCase() === p.word.toLowerCase());
    if (existingIndex !== -1) {
      existingWords[existingIndex].meaning = p.meaning;
      existingWords[existingIndex].sentenceEn = p.sentenceEn;
      existingWords[existingIndex].sentenceTr = p.sentenceTr;
      updatedCount++;
    } else {
      existingWords.push({
        id: `pattern-${Date.now()}-${idx + 1}`,
        word: p.word,
        meaning: p.meaning,
        partOfSpeech: "idiom", // kalıplar ve deyimler kategorisi
        sentenceEn: p.sentenceEn,
        sentenceTr: p.sentenceTr,
        box: 1,
        lastReviewed: null,
        successCount: 0,
        failCount: 0,
        createdAt: new Date().toISOString()
      });
      addedCount++;
    }
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(existingWords, null, 2), 'utf8');
  console.log(`Added: ${addedCount}, Updated: ${updatedCount}, Total Words: ${existingWords.length}`);
}

appendPatterns();
