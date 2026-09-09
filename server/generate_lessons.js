const fs = require('fs');
const path = require('path');

const LESSONS_FILE = path.join(__dirname, 'data', 'lessons.json');

const lessonsData = {
  lessons: [
    // --- A1 LEVEL (Units 1 to 7) ---
    {
      id: "a1-1",
      level: "A1",
      unitNumber: 1,
      title: "To Be (am / is / are) & Kendini Tanıtma",
      subtitle: "İngilizcenin omurgası: 'Olmak' fiili, zamirler, yaş, meslek ve durum bildirme",
      formula: {
        positive: "Özne (I / He / She / It / You / We / They) + am / is / are + Sıfat / İsim",
        negative: "Özne + am not / isn't / aren't + Sıfat / İsim",
        question: "Am / Is / Are + Özne + Sıfat / İsim?",
        ruleNote: "İngilizcede fiil (eylem) içermeyen durum cümlelerinde mutlaka 'am / is / are' kullanılır. 'I am happy', 'She is a doctor'."
      },
      commonMistakes: [
        {
          wrong: "I am agree with you.",
          correct: "I agree with you.",
          explanation: "'Agree' bir sıfat değil, eylem bildiren bir fiildir. Bu yüzden 'am' ile birleşmez."
        },
        {
          wrong: "I have 25 years old.",
          correct: "I am 25 years old.",
          explanation: "İngilizcede yaş söylenirken 'sahip olmak' (have) değil, 'olmak' (am/is) fiili kullanılır."
        },
        {
          wrong: "She is teacher.",
          correct: "She is a teacher.",
          explanation: "Tekil meslek isimlerinin önüne mutlaka 'a' veya 'an' getirilmelidir."
        }
      ],
      dialogues: [
        { speaker: "Alex", textEn: "Hello! My name is Alex. What is your name?", textTr: "Merhaba! Benim adım Alex. Senin adın ne?" },
        { speaker: "Elif", textEn: "Hi Alex! I am Elif. I am from Turkey.", textTr: "Selam Alex! Ben Elif. Türkiyeliyim." },
        { speaker: "Alex", textEn: "Nice to meet you! Are you a student here?", textTr: "Tanıştığıma memnun oldum! Burada öğrenci misin?" },
        { speaker: "Elif", textEn: "Yes, I am. I am very excited to learn English.", textTr: "Evet, öğrenciyim. İngilizce öğreneceğim için çok heyecanlıyım." }
      ],
      quiz: [
        {
          question: "Sarah and Tom _______ at the library right now.",
          options: ["is", "am", "are", "be"],
          answerIndex: 2,
          explanation: "Sarah ve Tom çoğul özne (They) olduğu için 'are' kullanılır."
        },
        {
          question: "Hangisi yaş belirtirken doğru bir kullanımdır?",
          options: ["I have 22 years.", "I am 22 years old.", "I has 22 years.", "I be 22."],
          answerIndex: 1,
          explanation: "İngilizcede yaş bildirmek için 'I am ... years old' kalıbı kullanılır."
        },
        {
          question: "My father _______ a pilot. He is an engineer.",
          options: ["isn't", "aren't", "not is", "doesn't"],
          answerIndex: 0,
          explanation: "'My father' (He) tekil öznesi için olumsuzluk 'isn't' ile yapılır."
        },
        {
          question: "'_______ you ready for the trip tomorrow?'",
          options: ["Is", "Are", "Do", "Am"],
          answerIndex: 1,
          explanation: "'You' öznesi soru cümlesinde 'Are' ile başlar."
        },
        {
          question: "'She is _______ architect.' Boşluğa ne gelmelidir?",
          options: ["a", "an", "the", "—"],
          answerIndex: 1,
          explanation: "'Architect' kelimesi sesli harfle (a) başladığı için 'an' gelir."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a1-2",
      level: "A1",
      unitNumber: 2,
      title: "Tekil/Çoğul & İşaret Zamirleri (This, That, These, Those)",
      subtitle: "Nesneleri gösterme, yakın/uzak kavramı ve çoğul ekleri (-s, -es)",
      formula: {
        positive: "Yakın Tekil: This is... | Uzak Tekil: That is...\nYakın Çoğul: These are... | Uzak Çoğul: Those are...",
        negative: "This isn't... / These aren't...",
        question: "Is this...? / Are these...?",
        ruleNote: "Elimizle dokunabildiğimiz yakındaki tek nesne için 'This', uzaktaki için 'That'; yakındaki birden çok nesne için 'These', uzaktakiler için 'Those' kullanılır."
      },
      commonMistakes: [
        {
          wrong: "These book are expensive.",
          correct: "These books are expensive.",
          explanation: "'These' çoğul olduğu için yanındaki isim de mutlaka çoğul eki (-s) almalıdır."
        },
        {
          wrong: "Look at that cars over there.",
          correct: "Look at those cars over there.",
          explanation: "Uzakta ve çoğul olan nesneler için 'that' değil 'those' kullanılır."
        }
      ],
      dialogues: [
        { speaker: "Customer", textEn: "Excuse me, how much is this jacket?", textTr: "Afedersiniz, bu ceket ne kadar?" },
        { speaker: "Seller", textEn: "This jacket is fifty dollars. But those shirts over there are on sale.", textTr: "Bu ceket elli dolar. Ancak şu ilerideki gömlekler indirimde." },
        { speaker: "Customer", textEn: "Are these shoes also on sale?", textTr: "Bu ayakkabılar da indirimde mi?" },
        { speaker: "Seller", textEn: "Yes, these are thirty percent off.", textTr: "Evet, bunlarda yüzde otuz indirim var." }
      ],
      quiz: [
        {
          question: "'_______ is my cup of coffee here, and _______ is yours over there.'",
          options: ["This / that", "These / those", "That / this", "This / these"],
          answerIndex: 0,
          explanation: "Buradaki yakın nesne için 'this', uzaktaki için 'that' kullanılır."
        },
        {
          question: "'_______ are my favorite keys in my pocket.'",
          options: ["This", "That", "These", "It"],
          answerIndex: 2,
          explanation: "Cepteki (yakın) ve çoğul nesneler (keys) için 'These' uygundur."
        },
        {
          question: "Hangisi 'city' kelimesinin doğru çoğul halidir?",
          options: ["citys", "cities", "cityes", "cites"],
          answerIndex: 1,
          explanation: "Sessiz harf + y ile biten isimler çoğul yapılırken 'y' düşer ve '-ies' gelir."
        },
        {
          question: "'Are _______ your glasses on the table over there?'",
          options: ["this", "that", "those", "these"],
          answerIndex: 2,
          explanation: "Uzaktaki masanın üzerindeki çoğul nesne (glasses) için 'those' kullanılır."
        },
        {
          question: "Hangisi düzensiz çoğul bir isimdir?",
          options: ["cars", "books", "children", "pens"],
          answerIndex: 2,
          explanation: "'Child' tekildir, çoğul hali '-s' almaz ve düzensiz olarak 'children' olur."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a1-3",
      level: "A1",
      unitNumber: 3,
      title: "Have got / Has got & İyelik Sıfatları (My, Your, His, Her)",
      subtitle: "Sahip olduklarımızı söyleme ve kime ait olduğunu belirtme",
      formula: {
        positive: "I / You / We / They + have got (veya have) | He / She / It + has got (veya has)",
        negative: "I haven't got... / He hasn't got...",
        question: "Have you got...? / Has she got...?",
        ruleNote: "İngilizcede sahiplik bildirmek için 'have got' (veya basitçe 'have') kullanılır. Aitlik için My (benim), Your (senin), His (onun-erkek), Her (onun-kadın), Our (bizim), Their (onların) kullanılır."
      },
      commonMistakes: [
        {
          wrong: "He have got a blue car.",
          correct: "He has got a blue car.",
          explanation: "'He/She/It' özneleriyle 'have' değil 'has' kullanılır."
        },
        {
          wrong: "This is she bag.",
          correct: "This is her bag.",
          explanation: "'She' özne zamiridir. İsimden önce aitlik belirtmek için iyelik sıfatı 'her' kullanılır."
        }
      ],
      dialogues: [
        { speaker: "Emma", textEn: "Have you got a pen I can borrow?", textTr: "Ödünç alabileceğim bir tükenmez kalemin var mı?" },
        { speaker: "Liam", textEn: "Yes, I have got two pens in my bag. Here you go.", textTr: "Evet, çantamda iki tane kalemim var. Buyrun." },
        { speaker: "Emma", textEn: "Thank you! Has your brother got a car?", textTr: "Teşekkürler! Erkek kardeşinin arabası var mı?" },
        { speaker: "Liam", textEn: "No, he hasn't got a car, but he has a motorcycle.", textTr: "Hayır, arabası yok ama motosikleti var." }
      ],
      quiz: [
        {
          question: "My sister _______ got two cute cats.",
          options: ["have", "has", "is", "are"],
          answerIndex: 1,
          explanation: "My sister = She olduğu için 'has got' kullanılır."
        },
        {
          question: "We _______ got any milk left in the fridge.",
          options: ["haven't", "hasn't", "aren't", "don't has"],
          answerIndex: 0,
          explanation: "'We' öznesi ile olumsuz sahiplik 'haven't got' ile ifade edilir."
        },
        {
          question: "This is my brother. _______ name is David.",
          options: ["He", "His", "Him", "Her"],
          answerIndex: 1,
          explanation: "Erkek için iyelik sıfatı 'His' (onun) olmalıdır."
        },
        {
          question: "'_______ you got a passport?' - 'Yes, I _______.'",
          options: ["Have / have", "Has / has", "Do / have", "Are / am"],
          answerIndex: 0,
          explanation: "'Have you got' sorusuna kısa cevap 'Yes, I have' şeklinde verilir."
        },
        {
          question: "Hangisi 'Bizim arabamız çok hızlı' cümlesinin doğru İngilizcesidir?",
          options: ["We car is very fast.", "Us car is very fast.", "Our car is very fast.", "Ours car is fast."],
          answerIndex: 2,
          explanation: "'Bizim' iyelik sıfatı 'Our' kelimesidir."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a1-4",
      level: "A1",
      unitNumber: 4,
      title: "Present Simple (Geniş Zaman - Do / Does & Günlük Rutinler)",
      subtitle: "Alışkanlıklar, tekrarlanan eylemler, genel doğrular ve -s takısı kuralı",
      formula: {
        positive: "I / You / We / They + V1 | He / She / It + V1 (-s / -es)",
        negative: "I / You / We / They + don't + V1 | He / She / It + doesn't + V1",
        question: "Do + I/you/we/they + V1? | Does + he/she/it + V1?",
        ruleNote: "Olumlu cümlede He/She/It fiiline -s eklenir. Olumsuz ve soru cümlelerinde 'does / doesn't' geldiği için fiilin -s takısı DÜŞER ve yalın hali (V1) kullanılır."
      },
      commonMistakes: [
        {
          wrong: "He doesn't likes coffee.",
          correct: "He doesn't like coffee.",
          explanation: "'doesn't' zaten tekillik ekini üstlendiği için fiil yalın kalır (like)."
        },
        {
          wrong: "I am play soccer on Sundays.",
          correct: "I play soccer on Sundays.",
          explanation: "Geniş zamanda eylem fiili varken 'am/is/are' KULLANILMAZ."
        },
        {
          wrong: "She watch TV every night.",
          correct: "She watches TV every night.",
          explanation: "He/She/It öznelerinde fiil mutlaka -s veya -es takısı almalıdır."
        }
      ],
      dialogues: [
        { speaker: "Mark", textEn: "What time do you usually wake up?", textTr: "Genellikle saat kaçta uyanırsın?" },
        { speaker: "Anna", textEn: "I always wake up at 7:00 AM, but my brother wakes up at 9:00 AM.", textTr: "Ben her zaman sabah 7'de uyanırım ama kardeşim 9'da uyanır." },
        { speaker: "Mark", textEn: "Does he work on weekends?", textTr: "Hafta sonları çalışır mı?" },
        { speaker: "Anna", textEn: "No, he doesn't work on Saturdays and Sundays.", textTr: "Hayır, cumartesi ve pazar günleri çalışmaz." }
      ],
      quiz: [
        {
          question: "My father _______ to work by train every morning.",
          options: ["go", "goes", "is go", "going"],
          answerIndex: 1,
          explanation: "My father (He) geniş zamanda fiile -es takısı alır: 'goes'."
        },
        {
          question: "She _______ drink coffee in the evening.",
          options: ["don't", "doesn't", "isn't", "not"],
          answerIndex: 1,
          explanation: "Geniş zamanda She öznesi için olumsuzluk yardımcı fiili 'doesn't'dır."
        },
        {
          question: "'_______ they live in London?'",
          options: ["Does", "Do", "Are", "Is"],
          answerIndex: 1,
          explanation: "'They' öznesi ile geniş zaman sorusu 'Do' ile sorulur."
        },
        {
          question: "He _______ his homework right after school.",
          options: ["do", "does", "doing", "is do"],
          answerIndex: 1,
          explanation: "'He' öznesi için 'do' fiili -es alarak 'does' olur."
        },
        {
          question: "Hangisi dilbilgisi açısından tamamen doğrudur?",
          options: ["She don't like milk.", "She doesn't likes milk.", "She doesn't like milk.", "She not like milk."],
          answerIndex: 2,
          explanation: "'doesn't' sonrası fiil yalın olmalıdır: 'She doesn't like milk'."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a1-5",
      level: "A1",
      unitNumber: 5,
      title: "Can & Can't (Yetenekler, İzin ve Rica)",
      subtitle: "Neleri yapabildiğimizi veya yapamadığımızı anlatma; kibar istekler",
      formula: {
        positive: "Özne (tümü) + can + V1 (fiilin yalın hali)",
        negative: "Özne (tümü) + cannot / can't + V1",
        question: "Can + Özne + V1?",
        ruleNote: "'Can' modali hiçbir özneye göre değişmez (he/she de olsa -s takısı almaz). Can'den sonraki fiil hiçbir zaman 'to' veya '-ing' almaz."
      },
      commonMistakes: [
        {
          wrong: "He cans speak English.",
          correct: "He can speak English.",
          explanation: "'Can' bir yardımcı fiildir ve üçüncü tekil şahısta bile asla -s takısı almaz."
        },
        {
          wrong: "I can to swim very well.",
          correct: "I can swim very well.",
          explanation: "'Can' sonrasında doğrudan fiilin yalın hali gelir, 'to' kullanılmaz."
        }
      ],
      dialogues: [
        { speaker: "Interviewer", textEn: "Can you speak any foreign languages?", textTr: "Yabancı dil konuşabiliyor musunuz?" },
        { speaker: "Applicant", textEn: "Yes, I can speak English and a little bit of German.", textTr: "Evet, İngilizce ve biraz da Almanca konuşabiliyorum." },
        { speaker: "Interviewer", textEn: "Can you drive a car?", textTr: "Araba sürebiliyor musunuz?" },
        { speaker: "Applicant", textEn: "No, I can't drive, but I am taking lessons.", textTr: "Hayır, süremiyorum ama ders alıyorum." }
      ],
      quiz: [
        {
          question: "She _______ play the guitar beautifully.",
          options: ["can", "cans", "can to", "is can"],
          answerIndex: 0,
          explanation: "'Can' ek almaz ve arkasından doğrudan yalın fiil gelir."
        },
        {
          question: "I'm sorry, but I _______ help you right now. I am very busy.",
          options: ["can", "can't", "don't can", "not can"],
          answerIndex: 1,
          explanation: "Yardım edememe durumu 'can't' (cannot) ile ifade edilir."
        },
        {
          question: "'_______ you swim across the river?' - 'No, I _______.'",
          options: ["Can / can't", "Do / don't", "Are / aren't", "Can / cannot not"],
          answerIndex: 0,
          explanation: "'Can you swim' sorusunun olumsuz cevabı 'No, I can't' olur."
        },
        {
          question: "Hangisi doğru bir cümle yapısıdır?",
          options: ["He can to drive.", "He can driving.", "He can drives.", "He can drive."],
          answerIndex: 3,
          explanation: "Can + V1 (yalın fiil): 'He can drive'."
        },
        {
          question: "'Can you please pass the salt?' cümlesinin anlamı nedir?",
          options: ["Tuzu geçebilir misin?", "Tuzu uzatabilir misiniz?", "Tuz sever misin?", "Tuzun var mı?"],
          answerIndex: 1,
          explanation: "Bu bir kibar rica kalıbıdır: 'Tuzu uzatabilir misiniz?'."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a1-6",
      level: "A1",
      unitNumber: 6,
      title: "Present Continuous (Şimdiki Zaman - am/is/are + V-ing)",
      subtitle: "Şu anda, konuşma anında gerçekleşen eylemleri anlatma",
      formula: {
        positive: "Özne + am / is / are + Fiil(-ing)",
        negative: "Özne + am not / isn't / aren't + Fiil(-ing)",
        question: "Am / Is / Are + Özne + Fiil(-ing)?",
        ruleNote: "Cümlede 'now' (şimdi), 'at the moment' (şu anda), 'look!' (bak!), 'listen!' (dinle!) gibi ipuçları varsa şimdiki zaman kullanılır."
      },
      commonMistakes: [
        {
          wrong: "I am wanting a coffee right now.",
          correct: "I want a coffee right now.",
          explanation: "'Want', 'like', 'know', 'understand' gibi duygu ve durum bildiren fiiller (Stative verbs) kural olarak -ing takısı almaz; geniş zamanda söylenir."
        },
        {
          wrong: "Look! The baby crying.",
          correct: "Look! The baby is crying.",
          explanation: "-ing tek başına şimdiki zaman yapmaz; mutlaka 'am / is / are' yardımcı fiili ile birlikte kullanılmalıdır."
        }
      ],
      dialogues: [
        { speaker: "Mom", textEn: "Tom, what are you doing in your room?", textTr: "Tom, odanda ne yapıyorsun?" },
        { speaker: "Tom", textEn: "I am studying for my English exam, Mom.", textTr: "İngilizce sınavıma çalışıyorum anne." },
        { speaker: "Mom", textEn: "Is your sister helping you?", textTr: "Kız kardeşin sana yardım ediyor mu?" },
        { speaker: "Tom", textEn: "No, she is listening to music downstairs.", textTr: "Hayır, o alt katta müzik dinliyor." }
      ],
      quiz: [
        {
          question: "Listen! Somebody _______ the piano in the other room.",
          options: ["plays", "is playing", "are playing", "play"],
          answerIndex: 1,
          explanation: "'Listen!' konuşma anını gösterir; tekil özne için 'is playing' kullanılır."
        },
        {
          question: "We _______ dinner right now, can I call you back?",
          options: ["have", "are having", "is having", "having"],
          answerIndex: 1,
          explanation: "'We' öznesi + 'right now' zaman zarfı için 'are having' uygundur."
        },
        {
          question: "'_______ she watching television at the moment?'",
          options: ["Does", "Do", "Is", "Are"],
          answerIndex: 2,
          explanation: "Şimdiki zaman soru cümlesinde 'she' öznesi için 'Is' başa gelir."
        },
        {
          question: "Hangi fiil şimdiki zamanda genellikle '-ing' ALMAZ?",
          options: ["run", "eat", "know", "write"],
          answerIndex: 2,
          explanation: "'Know' (bilmek) zihinsel durum fiilidir ve kural olarak -ing almaz."
        },
        {
          question: "They _______ sleeping. They are playing video games.",
          options: ["aren't", "isn't", "don't", "not are"],
          answerIndex: 0,
          explanation: "They öznesi için şimdiki zaman olumsuzu 'aren't'dir."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a1-7",
      level: "A1",
      unitNumber: 7,
      title: "Temel Soru Kalıpları (Wh- Questions: What, Where, When, Who, Why, How)",
      subtitle: "Bilgi istemek için soru sorma sanatı ve soru kelimelerinin sırası",
      formula: {
        positive: "Soru Kelimesi + Yardımcı Fiil (do/does/is/are) + Özne + Asıl Fiil?",
        negative: "Why don't you...? / Why isn't he...?",
        question: "What (Ne) | Where (Nerede) | When (Ne zaman) | Who (Kim) | Why (Neden) | How (Nasıl)",
        ruleNote: "İngilizcede soru cümlesi kurarken soru kelimesinden hemen sonra yardımcı fiil (do/does/is/are/can) gelmek ZORUNDADIR. 'Where you live?' yanlıştır."
      },
      commonMistakes: [
        {
          wrong: "Where you work?",
          correct: "Where do you work?",
          explanation: "Soru kelimesinden (Where) hemen sonra özneye uygun yardımcı fiil (do) gelmelidir."
        },
        {
          wrong: "Why he is late?",
          correct: "Why is he late?",
          explanation: "Soru cümlesinde yardımcı fiil 'is', özne 'he'nin önüne geçer."
        }
      ],
      dialogues: [
        { speaker: "Officer", textEn: "Where do you live in this city?", textTr: "Bu şehirde nerede yaşıyorsunuz?" },
        { speaker: "Tourist", textEn: "I live near the central park.", textTr: "Merkez parkın yakınında yaşıyorum." },
        { speaker: "Officer", textEn: "How do you go to work every day?", textTr: "İşe her gün nasıl gidiyorsunuz?" },
        { speaker: "Tourist", textEn: "I take the subway because it is fast.", textTr: "Hızlı olduğu için metroyu kullanıyorum." }
      ],
      quiz: [
        {
          question: "'_______ is your birthday?' - 'It is in October.'",
          options: ["Where", "When", "What", "Who"],
          answerIndex: 1,
          explanation: "Zaman sorduğu için 'When' (Ne zaman) kullanılır."
        },
        {
          question: "'_______ do you study English?' - 'Because I want to travel.'",
          options: ["Why", "How", "What", "Where"],
          answerIndex: 0,
          explanation: "Sebep sorulduğu için 'Why' (Neden) kullanılır."
        },
        {
          question: "'_______ is that man standing near the door?' - 'He is our teacher.'",
          options: ["What", "Who", "Where", "When"],
          answerIndex: 1,
          explanation: "Kişi sorulduğu için 'Who' (Kim) kullanılır."
        },
        {
          question: "Hangisi gramer olarak doğru bir soru cümlesidir?",
          options: ["Where she goes on Sundays?", "Where does she go on Sundays?", "Where does she goes on Sundays?", "Where she do go on Sundays?"],
          answerIndex: 1,
          explanation: "Soru kelimesi (Where) + Does + she + yalın fiil (go)."
        },
        {
          question: "'How old are you?' sorusu neyi öğrenmek için sorulur?",
          options: ["Nasıl olduğunu", "Nerede olduğunu", "Yaşını", "Mesleğini"],
          answerIndex: 2,
          explanation: "'How old' yaş sormak için kullanılır."
        }
      ],
      completed: false,
      quizScore: null
    },

    // --- A2 LEVEL (Units 8 to 14) ---
    {
      id: "a2-8",
      level: "A2",
      unitNumber: 8,
      title: "Past Simple (Geçmiş Zaman - Was / Were & Düzenli/Düzensiz Fiiller)",
      subtitle: "Geçmişte tamamlanmış olaylar, -ed takısı ve düzensiz fiillerin 2. hali (V2)",
      formula: {
        positive: "Durum: Özne + was / were | Eylem: Özne + V2 (worked, went, bought)",
        negative: "Özne + didn't + V1 (fiil yalın hale döner!)",
        question: "Did + Özne + V1?",
        ruleNote: "Olumlu cümlede fiilin 2. hali kullanılır. Ancak olumsuz ve sorularda 'didn't / did' kullanıldığı için fiil YALIN haline (V1) döner: 'I went' ➔ 'I didn't go'."
      },
      commonMistakes: [
        {
          wrong: "I didn't saw him yesterday.",
          correct: "I didn't see him yesterday.",
          explanation: "'didn't' zaten geçmiş zamanı ifade ettiği için fiil 1. haline (see) döner."
        },
        {
          wrong: "Where did you went last night?",
          correct: "Where did you go last night?",
          explanation: "'Did' kullanılan soru cümlelerinde fiil her zaman yalın olmalıdır (go)."
        }
      ],
      dialogues: [
        { speaker: "James", textEn: "Where were you yesterday afternoon?", textTr: "Dün öğleden sonra neredeydin?" },
        { speaker: "Sophia", textEn: "I was at home. I watched an exciting movie.", textTr: "Evdeydim. Heyecanlı bir film izledim." },
        { speaker: "James", textEn: "Did you finish your history homework?", textTr: "Tarih ödevini bitirdin mi?" },
        { speaker: "Sophia", textEn: "Yes, I finished it before dinner.", textTr: "Evet, akşam yemeğinden önce bitirdim." }
      ],
      quiz: [
        {
          question: "We _______ to Italy for our summer holiday last year.",
          options: ["go", "went", "gone", "were go"],
          answerIndex: 1,
          explanation: "'Go' fiilinin geçmiş zaman 2. hali düzensizdir ve 'went' olur."
        },
        {
          question: "He _______ come to school yesterday because he was sick.",
          options: ["doesn't", "wasn't", "didn't", "don't"],
          answerIndex: 2,
          explanation: "Geçmiş zamanda bir eylemin olumsuzu 'didn't + V1' ile yapılır."
        },
        {
          question: "'_______ they happy with the exam results?'",
          options: ["Was", "Were", "Did", "Are"],
          answerIndex: 1,
          explanation: "'Happy' sıfattır, eylem yoktur. 'They' için geçmiş zaman durum fiili 'Were' kullanılır."
        },
        {
          question: "'Did you _______ the new Batman movie?'",
          options: ["see", "saw", "seen", "seeing"],
          answerIndex: 0,
          explanation: "'Did' bulunan soruda fiil yalın olmalıdır: 'Did you see'."
        },
        {
          question: "'Buy' (satın almak) fiilinin geçmiş zaman (V2) hali nedir?",
          options: ["buyed", "bought", "bring", "baught"],
          answerIndex: 1,
          explanation: "'Buy' düzensiz bir fiildir ve 2. hali 'bought'tur."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a2-9",
      level: "A2",
      unitNumber: 9,
      title: "Gelecek Zaman (Will vs Be Going To)",
      subtitle: "Anlık kararlar ve tahminler (Will) ile önceden planlanmış hedefler (Be Going To)",
      formula: {
        positive: "Will: Özne + will + V1 | Be Going To: Özne + am/is/are going to + V1",
        negative: "Özne + won't + V1 | Özne + am/is/are not going to + V1",
        question: "Will + Özne + V1? | Is/Are + Özne + going to + V1?",
        ruleNote: "Konuşma anında karar verdiyseniz veya tahmin yapıyorsanız 'Will'; önceden plan yaptıysanız veya gözünüzün önünde belirgin bir kanıt varsa (örn: kara bulutlar) 'Be going to' kullanılır."
      },
      commonMistakes: [
        {
          wrong: "Look at those dark clouds! It will rain.",
          correct: "Look at those dark clouds! It is going to rain.",
          explanation: "Gözle görülür belirgin bir kanıt varsa (kara bulutlar) 'be going to' tercih edilir."
        },
        {
          wrong: "I will going to meet my friend.",
          correct: "I am going to meet my friend.",
          explanation: "'Will' ile 'going to' aynı anda kullanılmaz."
        }
      ],
      dialogues: [
        { speaker: "Phone", textEn: "*Ring ring! The phone is ringing!*", textTr: "*Zırr! Telefon çalıyor!*" },
        { speaker: "David", textEn: "Don't worry, I will answer it!", textTr: "Endişelenme, ben bakarım! (Anlık karar)" },
        { speaker: "David", textEn: "By the way, what are your plans for the weekend?", textTr: "Bu arada, hafta sonu planların neler?" },
        { speaker: "Lisa", textEn: "I am going to visit my sister in Paris.", textTr: "Paris'teki kız kardeşimi ziyaret edeceğim. (Önceden planlanmış)" }
      ],
      quiz: [
        {
          question: "'The phone is ringing.' - 'Okay, I _______ answer it.'",
          options: ["will", "am going to", "going to", "want"],
          answerIndex: 0,
          explanation: "Konuşma anında verilen anlık kararlar için 'will' kullanılır."
        },
        {
          question: "I have bought my plane ticket. I _______ to London next Friday.",
          options: ["fly", "will fly", "am going to fly", "flew"],
          answerIndex: 2,
          explanation: "Bilet alınmış, plan kesinleşmiştir; 'am going to fly' kullanılır."
        },
        {
          question: "Look at that car! It is moving too fast. It _______ crash!",
          options: ["will", "is going to", "shall", "does"],
          answerIndex: 1,
          explanation: "Mevcut fiziksel bir kanıta dayalı tahminlerde 'is going to' kullanılır."
        },
        {
          question: "I promise I _______ tell your secret to anyone.",
          options: ["won't", "not will", "am not going", "don't"],
          answerIndex: 0,
          explanation: "Söz verirken 'will / won't' kullanılır (won't = will not)."
        },
        {
          question: "'What _______ you going to do after university?'",
          options: ["will", "are", "do", "is"],
          answerIndex: 1,
          explanation: "'You' öznesi için 'are you going to do' kalıbı kullanılır."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a2-10",
      level: "A2",
      unitNumber: 10,
      title: "Karşılaştırmalar (Comparatives & Superlatives)",
      subtitle: "İki şeyi kıyaslama (-er / more) ve 'en' iyiyi seçme (-est / the most)",
      formula: {
        positive: "Kısa Sıfat: Sıfat-er + than (faster than) | Uzun Sıfat: more + Sıfat + than (more expensive than)\nEn Üstünlük: the + Sıfat-est (the fastest) | the most + Sıfat (the most expensive)",
        negative: "not as ... as (kadar değil): London is not as hot as Rome.",
        question: "Which one is faster? / What is the biggest city?",
        ruleNote: "Düzensiz sıfatlar kural dışıdır: Good ➔ Better ➔ The best | Bad ➔ Worse ➔ The worst."
      },
      commonMistakes: [
        {
          wrong: "This car is more cheaper than mine.",
          correct: "This car is cheaper than mine.",
          explanation: "Kısa sıfatlar '-er' alır; başına ayrıca 'more' getirilmez."
        },
        {
          wrong: "He is the more intelligent student in class.",
          correct: "He is the most intelligent student in class.",
          explanation: "Tüm sınıf arasındaki 'en' üstünlük için 'the most' kullanılır."
        }
      ],
      dialogues: [
        { speaker: "Customer", textEn: "Which laptop do you recommend?", textTr: "Hangi dizüstü bilgisayarı önerirsiniz?" },
        { speaker: "Technician", textEn: "The silver one is lighter and faster than the black one.", textTr: "Gümüş olan siyah olandan daha hafif ve daha hızlı." },
        { speaker: "Customer", textEn: "Is it also the most expensive one in the store?", textTr: "Mağazadaki en pahalı olan da o mu?" },
        { speaker: "Technician", textEn: "No, this gold one is the most expensive, but also the best.", textTr: "Hayır, bu altın olan en pahalısı ama aynı zamanda en iyisi." }
      ],
      quiz: [
        {
          question: "My brother is _______ than me.",
          options: ["tall", "taller", "more tall", "the tallest"],
          answerIndex: 1,
          explanation: "Kısa sıfatlarda karşılaştırma için '-er + than' gelir: 'taller than'."
        },
        {
          question: "Mount Everest is _______ mountain in the world.",
          options: ["the highest", "higher", "the most high", "highest"],
          answerIndex: 0,
          explanation: "Dünyadaki 'en' yüksek dağ olduğu için 'the highest' kullanılır."
        },
        {
          question: "Health is _______ than money.",
          options: ["important", "more important", "importanter", "the most important"],
          answerIndex: 1,
          explanation: "Üç heceli uzun bir sıfat olduğu için 'more important than' kullanılır."
        },
        {
          question: "'Good' sıfatının karşılaştırma (comparative) hali nedir?",
          options: ["gooder", "more good", "better", "best"],
          answerIndex: 2,
          explanation: "'Good' düzensizdir ve comparative hali 'better' olur."
        },
        {
          question: "This test was _______ difficult than the previous one.",
          options: ["less", "least", "little", "more less"],
          answerIndex: 0,
          explanation: "'Daha az zor' demek için 'less difficult than' kullanılır."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a2-11",
      level: "A2",
      unitNumber: 11,
      title: "Modals: Zorunluluk ve Tavsiye (Must, Have to, Should)",
      subtitle: "Kurallar, mecburiyetler, yasaklar ve arkadaşça tavsiye verme kalıpları",
      formula: {
        positive: "Zorunluluk: Must / Have to + V1 | Tavsiye: Should + V1",
        negative: "Yasak: Mustn't (Yapamazsın!) | Gerek Yok: Don't have to (Zorunda değilsin)",
        question: "Do I have to...? / Should I...?",
        ruleNote: "Mustn't yasak belirtir (kuraldır, yaparsan ceza alırsın). Don't have to ise mecburiyet olmadığını, istersen yapabileceğini söyler."
      },
      commonMistakes: [
        {
          wrong: "You must to stop at the red light.",
          correct: "You must stop at the red light.",
          explanation: "'Must' sonrasında 'to' KULLANILMAZ; doğrudan yalın fiil gelir."
        },
        {
          wrong: "You mustn't wake up early on Sunday, you can sleep.",
          correct: "You don't have to wake up early on Sunday, you can sleep.",
          explanation: "Pazar günü erken uyanmak yasak değil, sadece mecburiyet yoktur; 'don't have to' kullanılır."
        }
      ],
      dialogues: [
        { speaker: "Doctor", textEn: "You look exhausted. You should sleep at least 8 hours.", textTr: "Çok yorgun görünüyorsun. En az 8 saat uyumalısın. (Tavsiye)" },
        { speaker: "Patient", textEn: "Do I have to take this medicine with food?", textTr: "Bu ilacı yemekle birlikte mi almak zorundayım?" },
        { speaker: "Doctor", textEn: "Yes, you must take it after breakfast. And you mustn't drink coffee with it.", textTr: "Evet, kahvaltıdan sonra almalısın. Ve yanında kesinlikle kahve içmemelisin. (Yasak)" }
      ],
      quiz: [
        {
          question: "You have a high fever. You _______ see a doctor immediately.",
          options: ["should", "mustn't", "don't have to", "can't"],
          answerIndex: 0,
          explanation: "Tavsiye vermek için 'should' (yapmalısın) kullanılır."
        },
        {
          question: "In a museum, you _______ touch the ancient paintings. It is forbidden!",
          options: ["don't have to", "mustn't", "should", "must"],
          answerIndex: 1,
          explanation: "Yasaklanan durumlar için 'mustn't' kullanılır."
        },
        {
          question: "Tomorrow is Sunday, so I _______ go to work. I can stay in bed.",
          options: ["mustn't", "don't have to", "shouldn't", "can't"],
          answerIndex: 1,
          explanation: "Zorunluluk olmaması 'don't have to' (zorunda değilim) ile anlatılır."
        },
        {
          question: "All passengers _______ fasten their seatbelts before takeoff.",
          options: ["must", "must to", "should to", "ought"],
          answerIndex: 0,
          explanation: "Resmi güvenlik zorunluluğu için 'must' kullanılır."
        },
        {
          question: "Hangisi 'Sigara içmemelisin' anlamına gelen tavsiye cümlesidir?",
          options: ["You don't have to smoke.", "You shouldn't smoke.", "You might smoke.", "You can smoke."],
          answerIndex: 1,
          explanation: "'Shouldn't' tavsiye niteliğindeki olumsuzluktur: 'You shouldn't smoke'."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a2-12",
      level: "A2",
      unitNumber: 12,
      title: "Sayılabilen/Sayılamayan & Miktar (Much, Many, A lot of, Some, Any)",
      subtitle: "Kaç tane? Ne kadar? İsimlerin sayılabilirlik durumları ve alışveriş kalıpları",
      formula: {
        positive: "Sayılabilen Çoğul: Many / A lot of | Sayılamayan (Tekil): Much / A lot of\nOlumlu cümle: Some | Olumsuz ve Soru: Any",
        negative: "There isn't any milk. / There aren't many apples.",
        question: "How many + Çoğul İsim? (Kaç tane?) | How much + Sayılamayan İsim? (Ne kadar?)",
        ruleNote: "Su, para, şeker, pirinç gibi maddeler İngilizcede sayılamaz (uncountable) kabul edilir. 'How much money?' denir, 'How many moneys' denmez."
      },
      commonMistakes: [
        {
          wrong: "How much apples did you buy?",
          correct: "How many apples did you buy?",
          explanation: "Elma (apples) sayılabilen çoğul bir isimdir; 'How many' ile sorulur."
        },
        {
          wrong: "I don't have some money.",
          correct: "I don't have any money.",
          explanation: "Olumsuz cümlelerde 'some' yerine 'any' (hiç) kullanılır."
        }
      ],
      dialogues: [
        { speaker: "Chef", textEn: "How much sugar do we need for the dessert?", textTr: "Tatlı için ne kadar şekere ihtiyacımız var?" },
        { speaker: "Assistant", textEn: "We need two cups of sugar, but we haven't got any left.", textTr: "İki fincan şekere ihtiyacımız var ama hiç kalmamış." },
        { speaker: "Chef", textEn: "How many eggs are there in the basket?", textTr: "Sepette kaç tane yumurta var?" },
        { speaker: "Assistant", textEn: "There are a lot of eggs, about ten.", textTr: "Çok yumurta var, yaklaşık on tane." }
      ],
      quiz: [
        {
          question: "How _______ water do you drink every day?",
          options: ["many", "much", "few", "any"],
          answerIndex: 1,
          explanation: "Su (water) sayılamaz bir isimdir; miktarını sormak için 'How much' kullanılır."
        },
        {
          question: "There aren't _______ students in the classroom today.",
          options: ["much", "many", "some", "little"],
          answerIndex: 1,
          explanation: "Öğrenciler (students) sayılabilir çoğuldur; olumsuzda 'many' uygundur."
        },
        {
          question: "Do you have _______ questions about the lesson?",
          options: ["any", "some", "much", "a"],
          answerIndex: 0,
          explanation: "Standart soru cümlelerinde 'any' (hiç / herhangi) kullanılır."
        },
        {
          question: "Would you like _______ tea?",
          options: ["any", "some", "many", "a"],
          answerIndex: 1,
          explanation: "İkram ve kibar teklif sorularında istisnai olarak 'some' tercih edilir."
        },
        {
          question: "Hangisi sayılamayan (uncountable) bir isimdir?",
          options: ["car", "bottle", "money", "chair"],
          answerIndex: 2,
          explanation: "Para genel bir kavram olarak İngilizcede sayılamaz (much money) kabul edilir."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a2-13",
      level: "A2",
      unitNumber: 13,
      title: "Past Continuous (Geçmişte Süregelen Zaman - When / While)",
      subtitle: "Geçmişte devam eden eylemler ve araya giren anlık olaylar",
      formula: {
        positive: "Özne + was / were + Fiil(-ing)",
        negative: "Özne + wasn't / weren't + Fiil(-ing)",
        question: "Was / Were + Özne + Fiil(-ing)?",
        ruleNote: "While genellikle uzun süren eylemin (Past Continuous: While I was studying) başına gelir; When ise araya aniden giren kısa eylemin (Past Simple: when the phone rang) başına gelir."
      },
      commonMistakes: [
        {
          wrong: "While I walked home, it began to rain.",
          correct: "While I was walking home, it began to rain.",
          explanation: "'While' süregelen bir süreci bağlar; arkasından Past Continuous (was walking) gelir."
        },
        {
          wrong: "They was playing football at 4 PM.",
          correct: "They were playing football at 4 PM.",
          explanation: "'They' çoğul öznesi için 'was' değil 'were' kullanılır."
        }
      ],
      dialogues: [
        { speaker: "Officer", textEn: "What were you doing yesterday at 8:00 PM?", textTr: "Dün akşam saat 8'de ne yapıyordunuz?" },
        { speaker: "Witness", textEn: "I was cooking dinner in the kitchen.", textTr: "Mutfakta akşam yemeği pişiriyordum." },
        { speaker: "Officer", textEn: "Did you hear anything unusual?", textTr: "Olağandışı bir şey duydunuz mu?" },
        { speaker: "Witness", textEn: "Yes, while I was cooking, I heard a loud crash outside.", textTr: "Evet, ben yemek pişirirken dışarıda büyük bir çarpma sesi duydum." }
      ],
      quiz: [
        {
          question: "I _______ a book when the power suddenly went out.",
          options: ["read", "was reading", "were reading", "am reading"],
          answerIndex: 1,
          explanation: "Elektrik kesildiğinde o anda devam eden eylem: 'I was reading'."
        },
        {
          question: "What were you _______ at this time yesterday?",
          options: ["do", "did", "doing", "done"],
          answerIndex: 2,
          explanation: "Past Continuous soru kalıbı: 'were you doing'."
        },
        {
          question: "While my brother _______ video games, my mother was reading the newspaper.",
          options: ["played", "was playing", "is playing", "were playing"],
          answerIndex: 1,
          explanation: "İki eşzamanlı süregelen eylem; brother (he) için 'was playing'."
        },
        {
          question: "They _______ sleeping when the earthquake happened.",
          options: ["was", "were", "are", "did"],
          answerIndex: 1,
          explanation: "'They' öznesi ile geçmişte süreklilik için 'were' kullanılır."
        },
        {
          question: "'When the doorbell rang, I was taking a shower.' Cümlesinin anlamı nedir?",
          options: [
            "Kapı zili çaldığında duş alıyordum.",
            "Duş aldıktan sonra kapı zili çaldı.",
            "Kapı zili çalınca duşa girdim.",
            "Kapı zilini duyunca duştan çıktım."
          ],
          answerIndex: 0,
          explanation: "Tam olarak: 'Kapı zili çaldığında duş alıyordum'."
        }
      ],
      completed: false,
      quizScore: null
    },
    {
      id: "a2-14",
      level: "A2",
      unitNumber: 14,
      title: "Present Perfect Giriş (Have / Has + V3 - Deneyimler)",
      subtitle: "Zamanı belirtilmeyen yaşam deneyimleri: 'Have you ever...?' kalıbı",
      formula: {
        positive: "I / You / We / They + have + V3 (fiilin 3. hali) | He / She / It + has + V3",
        negative: "I haven't + V3 | He hasn't + V3",
        question: "Have you ever + V3? (Hiç ... yaptın mı?)",
        ruleNote: "Eğer bir eylemin NE ZAMAN yapıldığı belliyse (yesterday, last year, two days ago) ASLA Present Perfect kullanılmaz, Past Simple kullanılır! Zaman önemsizse ve sadece deneyim konuşuluyorsa Present Perfect kullanılır."
      },
      commonMistakes: [
        {
          wrong: "I have seen that movie yesterday.",
          correct: "I saw that movie yesterday.",
          explanation: "'Yesterday' kesin zaman belirttiği için Past Simple (saw) kullanılmalıdır."
        },
        {
          wrong: "Did you ever be to Paris?",
          correct: "Have you ever been to Paris?",
          explanation: "Hayat boyu bir yerde bulunma deneyimi sorulurken 'Have you ever been to...?' kalıbı kullanılır."
        }
      ],
      dialogues: [
        { speaker: "Traveler", textEn: "Have you ever visited London?", textTr: "Hiç Londra'yı ziyaret ettin mi?" },
        { speaker: "Local", textEn: "Yes, I have been there twice. It is a fantastic city.", textTr: "Evet, orada iki kez bulundum. Harika bir şehir." },
        { speaker: "Traveler", textEn: "When did you go there?", textTr: "Oraya ne zaman gittin? (Zaman sorusu)" },
        { speaker: "Local", textEn: "I went there last summer.", textTr: "Geçen yaz gittim. (Past Simple cevabı)" }
      ],
      quiz: [
        {
          question: "_______ you ever eaten sushi?",
          options: ["Did", "Have", "Has", "Do"],
          answerIndex: 1,
          explanation: "Yaşam deneyimi sorusu 'Have you ever + V3' kalıbıdır."
        },
        {
          question: "She has _______ to five different countries.",
          options: ["be", "was", "been", "being"],
          answerIndex: 2,
          explanation: "'Be' fiilinin 3. hali (V3) 'been'dir."
        },
        {
          question: "I _______ my keys! I cannot open the door now.",
          options: ["lost", "have lost", "did lose", "was losing"],
          answerIndex: 1,
          explanation: "Geçmişte olmuş ama sonucu şu anı etkileyen durumlar için 'have lost' kullanılır."
        },
        {
          question: "Hangisi hatalı bir cümledir?",
          options: [
            "I have visited Paris twice.",
            "I visited Paris in 2022.",
            "I have visited Paris yesterday.",
            "Have you ever been to Paris?"
          ],
          answerIndex: 2,
          explanation: "'Yesterday' gibi net zaman bildiren kelimelerle 'have visited' kullanılamaz."
        },
        {
          question: "'See' (görmek) fiilinin 3. hali (past participle) nedir?",
          options: ["saw", "seen", "seeing", "seed"],
          answerIndex: 1,
          explanation: "See (V1) ➔ Saw (V2) ➔ Seen (V3)."
        }
      ],
      completed: false,
      quizScore: null
    }
  ],

  // 20-question comprehensive level exams
  exams: {
    A1: {
      title: "A1 Seviye Bitirme Sınavı",
      description: "Temel A1 konularının (To Be, Zamirler, Geniş Zaman, Can, Şimdiki Zaman, Soru Kalıpları) tamamını ölçen 20 soruluk genel değerlendirme sınavı.",
      passingScore: 70,
      questions: [
        { q: "My sister and I _______ students at this school.", options: ["am", "is", "are", "be"], a: 2 },
        { q: "Where _______ your brother work?", options: ["do", "does", "is", "are"], a: 1 },
        { q: "Look at _______ birds high up in the sky over there.", options: ["this", "that", "these", "those"], a: 3 },
        { q: "He _______ got any brothers or sisters.", options: ["haven't", "hasn't", "isn't", "doesn't"], a: 1 },
        { q: "What time _______ you usually have breakfast?", options: ["does", "do", "are", "have"], a: 1 },
        { q: "Sarah _______ to the gym on Mondays.", options: ["go", "goes", "is go", "going"], a: 1 },
        { q: "Can you speak Spanish? - No, I _______.", options: ["can", "can't", "don't", "am not"], a: 1 },
        { q: "Listen! The baby _______ right now.", options: ["cries", "is crying", "cry", "was crying"], a: 1 },
        { q: "_______ is that woman talking to your mother?", options: ["What", "Where", "Who", "When"], a: 2 },
        { q: "I have _______ apple and _______ banana in my bag.", options: ["a / a", "an / a", "a / an", "an / an"], a: 1 },
        { q: "This is David. _______ car is parked outside.", options: ["He", "His", "Him", "Her"], a: 1 },
        { q: "They _______ like spicy Mexican food.", options: ["doesn't", "don't", "aren't", "not"], a: 1 },
        { q: "I am interested in art. I _______ painting.", options: ["love", "loves", "loving", "am love"], a: 0 },
        { q: "Are _______ your shoes by the front door?", options: ["this", "that", "these", "it"], a: 2 },
        { q: "Why _______ you studying English?", options: ["do", "are", "is", "does"], a: 1 },
        { q: "My father _______ coffee. He prefers tea.", options: ["doesn't drink", "don't drink", "doesn't drinks", "isn't drink"], a: 0 },
        { q: "_______ you ready to order your food, sir?", options: ["Is", "Do", "Are", "Can"], a: 2 },
        { q: "We _______ a new computer at our office.", options: ["have got", "has got", "is having", "having"], a: 0 },
        { q: "He can _______ very fast.", options: ["run", "to run", "runs", "running"], a: 0 },
        { q: "_______ is the nearest hospital? - On Main Street.", options: ["When", "Where", "Who", "Why"], a: 1 }
      ]
    },
    A2: {
      title: "A2 Seviye Bitirme Sınavı",
      description: "A2 konularını (Geçmiş Zaman, Gelecek Zaman, Sıfat Kıyaslamaları, Modallar, Miktar Kalıpları, Past Continuous ve Present Perfect) kapsayan 20 soruluk sınav.",
      passingScore: 70,
      questions: [
        { q: "Where _______ you go for your vacation last summer?", options: ["did", "do", "were", "was"], a: 0 },
        { q: "I _______ see him at the party yesterday.", options: ["wasn't", "didn't", "don't", "haven't"], a: 1 },
        { q: "Look at those dark grey clouds! It _______ rain.", options: ["will", "is going to", "shall", "does"], a: 1 },
        { q: "I promise I _______ be late for the meeting.", options: ["won't", "am not going", "don't", "not will"], a: 0 },
        { q: "A plane is _______ than a train.", options: ["fast", "faster", "more fast", "fastest"], a: 1 },
        { q: "This is _______ book I have ever read.", options: ["the best", "better", "the most good", "goodest"], a: 0 },
        { q: "You _______ smoke inside the hospital. It is strictly forbidden.", options: ["don't have to", "mustn't", "should", "can"], a: 1 },
        { q: "Tomorrow is my day off, so I _______ wake up early.", options: ["mustn't", "don't have to", "shouldn't", "can't"], a: 1 },
        { q: "You have a bad cough. You _______ drink cold water.", options: ["should", "shouldn't", "must", "have to"], a: 1 },
        { q: "How _______ money do you need for the concert ticket?", options: ["many", "much", "few", "any"], a: 1 },
        { q: "There are _______ books on the shelf, about twenty.", options: ["much", "a lot of", "little", "any"], a: 1 },
        { q: "I don't have _______ butter left in the fridge.", options: ["some", "any", "many", "a"], a: 1 },
        { q: "While I _______ dinner, the doorbell rang.", options: ["cooked", "was cooking", "am cooking", "cook"], a: 1 },
        { q: "What were you doing _______ the accident happened?", options: ["while", "when", "during", "as soon as"], a: 1 },
        { q: "They _______ playing soccer when it started to pour.", options: ["was", "were", "did", "are"], a: 1 },
        { q: "_______ you ever ridden a horse?", options: ["Did", "Have", "Has", "Do"], a: 1 },
        { q: "She has _______ to New York three times.", options: ["be", "was", "been", "went"], a: 2 },
        { q: "I _______ that museum two years ago.", options: ["visited", "have visited", "visit", "was visiting"], a: 0 },
        { q: "German is _______ difficult than English.", options: ["much", "more", "most", "many"], a: 1 },
        { q: "He didn't _______ any milk at the grocery store.", options: ["bought", "buy", "buying", "buys"], a: 1 }
      ]
    }
  }
};

fs.writeFileSync(LESSONS_FILE, JSON.stringify(lessonsData, null, 2), 'utf8');
console.log('Successfully generated lessons.json with 14 full units and 2 comprehensive level exams!');
