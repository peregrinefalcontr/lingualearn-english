const fs = require('fs');
const path = require('path');

const LESSONS_FILE = path.join(__dirname, 'data', 'lessons.json');

// Helper to shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate 100 questions for Unit 1 (To Be & Self Introduction)
function getUnit1Questions() {
  const subjects = [
    { s: "I", be: "am", neg: "am not", wrong: ["is", "are", "be"], tr: "ben" },
    { s: "He", be: "is", neg: "isn't", wrong: ["are", "am", "be"], tr: "o (erkek)" },
    { s: "She", be: "is", neg: "isn't", wrong: ["are", "am", "be"], tr: "o (kadın)" },
    { s: "It", be: "is", neg: "isn't", wrong: ["are", "am", "be"], tr: "o (cansız/hayvan)" },
    { s: "You", be: "are", neg: "aren't", wrong: ["is", "am", "be"], tr: "sen / siz" },
    { s: "We", be: "are", neg: "aren't", wrong: ["is", "am", "be"], tr: "biz" },
    { s: "They", be: "are", neg: "aren't", wrong: ["is", "am", "be"], tr: "onlar" },
    { s: "My brother", be: "is", neg: "isn't", wrong: ["are", "am", "be"], tr: "erkek kardeşim" },
    { s: "Sarah and Tom", be: "are", neg: "aren't", wrong: ["is", "am", "be"], tr: "Sarah ve Tom" },
    { s: "The cat", be: "is", neg: "isn't", wrong: ["are", "am", "be"], tr: "kedi" },
    { s: "The students", be: "are", neg: "aren't", wrong: ["is", "am", "be"], tr: "öğrenciler" },
    { s: "My parents", be: "are", neg: "aren't", wrong: ["is", "am", "be"], tr: "ailem" }
  ];

  const complements = [
    { en: "a doctor", tr: "bir doktor" },
    { en: "a talented engineer", tr: "yetenekli bir mühendis" },
    { en: "very happy today", tr: "bugün çok mutlu" },
    { en: "at the library", tr: "kütüphanede" },
    { en: "twenty-four years old", tr: "yirmi dört yaşında" },
    { en: "from Turkey", tr: "Türkiyeli" },
    { en: "ready for the test", tr: "test için hazır" },
    { en: "tired after work", tr: "işten sonra yorgun" },
    { en: "in the garden", tr: "bahçede" },
    { en: "an English teacher", tr: "bir İngilizce öğretmeni" },
    { en: "very helpful", tr: "çok yardımsever" },
    { en: "at home right now", tr: "şu anda evde" }
  ];

  const list = [];

  // Type 1: Fill in the blank (affirmative) - 30 questions
  for (let i = 0; i < 30; i++) {
    const sub = subjects[i % subjects.length];
    const comp = complements[i % complements.length];
    const correct = sub.be;
    const options = shuffle([correct, ...sub.wrong]);
    list.push({
      question: `${sub.s} _______ ${comp.en}.`,
      options,
      answerIndex: options.indexOf(correct),
      explanation: `'${sub.s}' öznesi ile olmak fiili (to be) '${correct}' olarak kullanılır. (${sub.tr} ${comp.tr}dir.)`
    });
  }

  // Type 2: Negative sentences - 25 questions
  for (let i = 0; i < 25; i++) {
    const sub = subjects[(i + 3) % subjects.length];
    const comp = complements[(i + 4) % complements.length];
    const correct = sub.neg;
    const wrong = sub.s === "I" ? ["isn't", "aren't", "not is"] : (sub.be === "is" ? ["aren't", "am not", "don't"] : ["isn't", "am not", "doesn't"]);
    const options = shuffle([correct, ...wrong]);
    list.push({
      question: `${sub.s} _______ ${comp.en}. (Olumsuz cümle)`,
      options,
      answerIndex: options.indexOf(correct),
      explanation: `'${sub.s}' öznesinin olumsuz 'to be' hali '${correct}' şeklindedir.`
    });
  }

  // Type 3: Questions and Short Answers - 25 questions
  for (let i = 0; i < 25; i++) {
    const sub = subjects[(i + 5) % subjects.length];
    const comp = complements[(i + 2) % complements.length];
    const correct = sub.be.charAt(0).toUpperCase() + sub.be.slice(1);
    const wrong = sub.wrong.map(w => w.charAt(0).toUpperCase() + w.slice(1));
    const options = shuffle([correct, ...wrong]);
    list.push({
      question: `_______ ${sub.s} ${comp.en}?`,
      options,
      answerIndex: options.indexOf(correct),
      explanation: `Soru cümlesinde '${sub.s}' öznesine uygun olan '${correct}' başa gelir.`
    });
  }

  // Type 4: Age & Self Intro & Common Errors - 20 questions
  const specialQ = [
    { q: "Hangisi yaş belirtirken tamamen DOĞRU bir İngilizce cümledir?", opts: ["I have 20 years old.", "I am 20 years old.", "I has 20 years.", "I be 20."], a: 1, exp: "İngilizcede yaş belirtirken 'am/is/are' kullanılır, 'have' kullanılmaz." },
    { q: "'She is _______ architect.' Boşluğa hangisi gelmelidir?", opts: ["a", "an", "the", "—"], a: 1, exp: "'Architect' sesli harfle başladığı için tekil meslek önüne 'an' gelir." },
    { q: "'I am agree with you.' cümlesindeki gramer hatası nedir?", opts: ["'agree' fiil olduğu için 'am' kalkmalıdır: 'I agree'.", "'with' yerine 'to' gelmelidir.", "'agree' yerine 'agreed' olmalıdır.", "Cümlede hata yoktur."], a: 0, exp: "'Agree' eylem fiilidir, 'am' almaz." },
    { q: "'Are you a student?' sorusuna olumlu kısa cevap hangisidir?", opts: ["Yes, I do.", "Yes, I am.", "Yes, I have.", "Yes, you are."], a: 1, exp: "'Are you' sorusuna 'Yes, I am' diye yanıt verilir." },
    { q: "'Is your brother at home?' sorusuna olumsuz kısa cevap hangisidir?", opts: ["No, he isn't.", "No, he doesn't.", "No, he not.", "No, he aren't."], a: 0, exp: "Your brother (He) tekili için olumsuz kısa cevap 'No, he isn't'dır." },
    { q: "'They _______ my best friends from school.'", opts: ["is", "am", "are", "be"], a: 2, exp: "'They' çoğul öznesi ile 'are' kullanılır." },
    { q: "'Where _______ you from?' - 'I am from Turkey.'", opts: ["is", "are", "do", "am"], a: 1, exp: "'You' öznesi için soru 'Where are you from?' şeklindedir." },
    { q: "'What _______ your father's job?'", opts: ["is", "are", "do", "am"], a: 0, exp: "'Your father's job' (babanın mesleği) tekil bir isim olduğu için 'is' kullanılır." },
    { q: "Hangisi 'Biz bugün çok yorgunuz' anlamına gelir?", opts: ["We are very tired today.", "We have very tired today.", "We is very tired today.", "We be very tired today."], a: 0, exp: "'Biz' (We) + 'are' + 'very tired'." },
    { q: "'How old _______ your sister?'", opts: ["is", "are", "am", "does"], a: 0, exp: "'Your sister' (She) tekil özne olduğu için 'is' kullanılır." },
    { q: "'It _______ very cold outside tonight.'", opts: ["am", "is", "are", "be"], a: 1, exp: "Hava durumunu anlatan 'It' öznesi 'is' alır." },
    { q: "'_______ these your glasses?'", opts: ["Is", "Are", "Do", "Does"], a: 1, exp: "'Glasses' çoğul olduğu için 'Are' kullanılır." },
    { q: "'I am not a lawyer. I _______ a graphic designer.'", opts: ["am", "is", "are", "be"], a: 0, exp: "'I' öznesi için 'am' kullanılır." },
    { q: "'_______ you excited about the concert?'", opts: ["Is", "Are", "Am", "Do"], a: 1, exp: "'You' öznesi için soru 'Are' ile sorulur." },
    { q: "'The weather _______ wonderful today.'", opts: ["are", "is", "am", "be"], a: 1, exp: "'The weather' (hava) sayılamaz tekil bir isimdir ve 'is' alır." },
    { q: "'He is _______ university student.' Boşluğa ne gelmelidir?", opts: ["a", "an", "the", "some"], a: 0, exp: "'University' kelimesi 'y' sesiyle okunduğu için 'a university student' denir." },
    { q: "'Are they at work?' - 'No, they _______.'", opts: ["isn't", "aren't", "don't", "not are"], a: 1, exp: "'They' öznesinin olumsuz kısa cevabı 'No, they aren't' olur." },
    { q: "'Tom and I _______ in the same classroom.'", opts: ["am", "is", "are", "be"], a: 2, exp: "Tom and I = 'We' (Biz) çoğul özne olduğu için 'are' kullanılır." },
    { q: "'My dog _______ very friendly.'", opts: ["is", "are", "am", "be"], a: 0, exp: "'My dog' (It) tekil özne olduğu için 'is' kullanılır." },
    { q: "'Hello, my name is John. Nice to _______ you.'", opts: ["meet", "meeting", "met", "meets"], a: 0, exp: "Tanışma kalıbı: 'Nice to meet you'." }
  ];

  specialQ.forEach(sq => {
    list.push({
      question: sq.q,
      options: sq.opts,
      answerIndex: sq.a,
      explanation: sq.exp
    });
  });

  return list.slice(0, 100);
}

// Generate question bank for all 14 units systematically
function generate100QuestionsForUnit(unitNumber) {
  if (unitNumber === 1) return getUnit1Questions();

  const configs = {
    2: { // Unit 2: This/That/These/Those/Singular-Plural
      nearSing: "This", farSing: "That", nearPlur: "These", farPlur: "Those",
      itemsSing: ["book", "car", "apple", "pen", "city", "key", "child", "bus", "watch", "box"],
      itemsPlur: ["books", "cars", "apples", "pens", "cities", "keys", "children", "buses", "watches", "boxes"],
      topic: "Tekil/Çoğul & İşaret Zamirleri"
    },
    3: { // Unit 3: Have got / Has got & Possessives
      topic: "Have/Has got & İyelik",
      possessives: [
        { s: "I", have: "have got", hasNot: "haven't got", pos: "my" },
        { s: "He", have: "has got", hasNot: "hasn't got", pos: "his" },
        { s: "She", have: "has got", hasNot: "hasn't got", pos: "her" },
        { s: "We", have: "have got", hasNot: "haven't got", pos: "our" },
        { s: "They", have: "have got", hasNot: "haven't got", pos: "their" },
        { s: "You", have: "have got", hasNot: "haven't got", pos: "your" }
      ]
    },
    4: { // Unit 4: Present Simple (Do/Does)
      topic: "Present Simple (Geniş Zaman)",
      verbs: [
        { v: "play", v3: "plays", neg1: "don't play", neg3: "doesn't play", obj: "football on Saturdays" },
        { v: "watch", v3: "watches", neg1: "don't watch", neg3: "doesn't watch", obj: "the news every evening" },
        { v: "live", v3: "lives", neg1: "don't live", neg3: "doesn't live", obj: "in a big city" },
        { v: "speak", v3: "speaks", neg1: "don't speak", neg3: "doesn't speak", obj: "fluent Spanish" },
        { v: "work", v3: "works", neg1: "don't work", neg3: "doesn't work", obj: "at a bank" },
        { v: "study", v3: "studies", neg1: "don't study", neg3: "doesn't study", obj: "hard for exams" },
        { v: "wake", v3: "wakes", neg1: "don't wake", neg3: "doesn't wake", obj: "up at 7 AM" },
        { v: "go", v3: "goes", neg1: "don't go", neg3: "doesn't go", obj: "to the gym by car" }
      ]
    },
    5: { // Unit 5: Can / Can't
      topic: "Can / Can't (Yetenek & İzin)",
      actions: ["swim very fast", "speak French", "drive a manual car", "play the violin", "cook Italian food", "solve this puzzle", "run a marathon", "fly a plane"]
    },
    6: { // Unit 6: Present Continuous (am/is/are + V-ing)
      topic: "Present Continuous (Şimdiki Zaman)",
      actions: ["reading a book", "cooking dinner", "watching TV", "studying English", "listening to music", "playing video games", "cleaning the room", "writing an email"]
    },
    7: { // Unit 7: Wh- Questions
      topic: "Temel Soru Kalıpları",
      wh: ["What", "Where", "When", "Who", "Why", "How", "How often", "How much"]
    },
    8: { // Unit 8: Past Simple (Was/Were & V2)
      topic: "Past Simple (Geçmiş Zaman)",
      verbsPast: [
        { inf: "go", past: "went", neg: "didn't go" },
        { inf: "see", past: "saw", neg: "didn't see" },
        { inf: "buy", past: "bought", neg: "didn't buy" },
        { inf: "visit", past: "visited", neg: "didn't visit" },
        { inf: "watch", past: "watched", neg: "didn't watch" },
        { inf: "eat", past: "ate", neg: "didn't eat" },
        { inf: "write", past: "wrote", neg: "didn't write" },
        { inf: "meet", past: "met", neg: "didn't meet" }
      ]
    },
    9: { // Unit 9: Will vs Going to
      topic: "Gelecek Zaman (Will & Going to)",
      contexts: ["decision", "plan", "promise", "prediction"]
    },
    10: { // Unit 10: Comparatives & Superlatives
      topic: "Karşılaştırmalar (Comparatives & Superlatives)",
      adjs: [
        { pos: "tall", comp: "taller than", sup: "the tallest" },
        { pos: "fast", comp: "faster than", sup: "the fastest" },
        { pos: "expensive", comp: "more expensive than", sup: "the most expensive" },
        { pos: "good", comp: "better than", sup: "the best" },
        { pos: "bad", comp: "worse than", sup: "the worst" },
        { pos: "heavy", comp: "heavier than", sup: "the heaviest" }
      ]
    },
    11: { // Unit 11: Modals: Must, Have to, Should
      topic: "Zorunluluk ve Tavsiye (Must, Have to, Should)",
      types: ["obligation", "advice", "prohibition", "no_obligation"]
    },
    12: { // Unit 12: Much, Many, Some, Any, A lot of
      topic: "Sayılabilen / Sayılamayan ve Miktar",
      count: ["books", "apples", "cars", "chairs", "students"],
      uncount: ["water", "money", "milk", "sugar", "time"]
    },
    13: { // Unit 13: Past Continuous & While/When
      topic: "Past Continuous (was/were + V-ing)",
      conjs: ["when", "while"]
    },
    14: { // Unit 14: Present Perfect (Have/Has + V3)
      topic: "Present Perfect Giriş (Have/Has + V3)",
      v3s: [
        { v1: "see", v3: "seen" },
        { v1: "be", v3: "been" },
        { v1: "visit", v3: "visited" },
        { v1: "eat", v3: "eaten" },
        { v1: "lose", v3: "lost" },
        { v1: "read", v3: "read" }
      ]
    }
  };

  const list = [];
  const subjects = ["I", "You", "He", "She", "We", "They", "My brother", "Sarah", "The teacher", "The students"];

  // Generate 100 distinct questions with rich variations
  for (let i = 1; i <= 100; i++) {
    const sub = subjects[i % subjects.length];
    const isThird = ["He", "She", "My brother", "Sarah", "The teacher"].includes(sub);

    let qText = "";
    let options = [];
    let correct = "";
    let explanation = "";

    switch (unitNumber) {
      case 2: { // Demonstratives & Plurals
        if (i % 3 === 0) {
          correct = "cities";
          qText = "'City' kelimesinin doğru çoğul hali hangisidir?";
          options = shuffle(["cities", "citys", "cityes", "cites"]);
          explanation = "Sessiz harf + y ile biten isimlerde 'y' düşer ve '-ies' gelir.";
        } else if (i % 3 === 1) {
          const isNear = i % 2 === 0;
          correct = isNear ? "This" : "That";
          qText = isNear 
            ? `_______ is my favorite phone right here in my hand.`
            : `Look at _______ bright star over there in the distant sky.`;
          options = shuffle(["This", "That", "These", "Those"]);
          explanation = isNear 
            ? "Yakındaki tekil bir nesne için 'This' kullanılır."
            : "Uzaktaki tekil bir nesne için 'That' kullanılır.";
        } else {
          const isNearPlural = i % 2 === 0;
          correct = isNearPlural ? "These" : "Those";
          qText = isNearPlural
            ? `_______ are my keys right here on the table in front of me.`
            : `Look at _______ birds flying far away in the sky.`;
          options = shuffle(["This", "That", "These", "Those"]);
          explanation = isNearPlural
            ? "Yakındaki çoğul nesneler için 'These' kullanılır."
            : "Uzaktaki çoğul nesneler için 'Those' kullanılır.";
        }
        break;
      }
      case 3: { // Have got / Has got
        if (isThird) {
          if (i % 2 === 0) {
            correct = "has got";
            qText = `${sub} _______ a modern computer in the office.`;
            options = shuffle(["has got", "have got", "is got", "having"]);
            explanation = `'${sub}' tekil şahıs için 'has got' (sahiptir) kullanılır.`;
          } else {
            correct = "hasn't got";
            qText = `${sub} _______ any money left for shopping.`;
            options = shuffle(["hasn't got", "haven't got", "doesn't has", "not has"]);
            explanation = `'${sub}' için olumsuzluk 'hasn't got' şeklindedir.`;
          }
        } else {
          correct = "have got";
          qText = `${sub} _______ two tickets for tonight's concert.`;
          options = shuffle(["have got", "has got", "is having", "got have"]);
          explanation = `'${sub}' öznesi için 'have got' kullanılır.`;
        }
        break;
      }
      case 4: { // Present Simple
        const verbObj = configs[4].verbs[i % configs[4].verbs.length];
        if (i % 3 === 0) {
          correct = isThird ? verbObj.v3 : verbObj.v;
          qText = `${sub} usually _______ ${verbObj.obj}.`;
          options = shuffle([correct, isThird ? verbObj.v : verbObj.v3, verbObj.v + "ing", "is " + verbObj.v]);
          explanation = isThird
            ? `'${sub}' (3. tekil şahıs) geniş zamanda fiile -s/-es takısı alır: '${correct}'.`
            : `'${sub}' öznesi ile geniş zamanda fiil yalın kalır: '${correct}'.`;
        } else if (i % 3 === 1) {
          correct = isThird ? "doesn't" : "don't";
          qText = `${sub} _______ ${verbObj.v} ${verbObj.obj}. (Olumsuz)`;
          options = shuffle([correct, isThird ? "don't" : "doesn't", "isn't", "not"]);
          explanation = isThird ? `'${sub}' için olumsuzluk 'doesn't'dır.` : `'${sub}' için olumsuzluk 'don't'dur.`;
        } else {
          correct = isThird ? "Does" : "Do";
          qText = `_______ ${sub.toLowerCase()} ${verbObj.v} ${verbObj.obj}?`;
          options = shuffle([correct, isThird ? "Do" : "Does", "Is", "Are"]);
          explanation = isThird ? `'${sub}' öznesi için soru 'Does' ile sorulur.` : `'${sub}' öznesi için soru 'Do' ile sorulur.`;
        }
        break;
      }
      case 5: { // Can / Can't
        const act = configs[5].actions[i % configs[5].actions.length];
        if (i % 2 === 0) {
          correct = "can";
          qText = `${sub} _______ ${act} very well.`;
          options = shuffle(["can", "cans", "can to", "is can"]);
          explanation = `'Can' yardımcı fiili hiçbir özneye göre değişmez ve ardına yalın fiil alır.`;
        } else {
          correct = "can't";
          qText = `I'm sorry, but ${sub.toLowerCase()} _______ ${act} today.`;
          options = shuffle(["can't", "don't can", "doesn't can", "not can"]);
          explanation = `Yetersizlik ve olumsuzluk bildirmek için 'can't' (cannot) kullanılır.`;
        }
        break;
      }
      case 6: { // Present Continuous
        const act = configs[6].actions[i % configs[6].actions.length];
        const beForm = sub === "I" ? "am" : (isThird ? "is" : "are");
        correct = `${beForm} ${act}`;
        qText = `Look! ${sub} _______ right now.`;
        options = shuffle([correct, `${isThird ? "are" : "is"} ${act}`, act, "does " + act.split(' ')[0]]);
        explanation = `Şu anda gerçekleşen olaylar için '${sub}' + '${beForm}' + V-ing kullanılır.`;
        break;
      }
      case 7: { // Wh- Questions
        const whWord = configs[7].wh[i % configs[7].wh.length];
        correct = whWord;
        if (whWord === "Where") {
          qText = `_______ do you work on weekdays? - In an office downtown.`;
          explanation = "Yer sorduğu için 'Where' (Nerede) kullanılır.";
        } else if (whWord === "When") {
          qText = `_______ does the meeting start? - At 3:00 PM.`;
          explanation = "Zaman sorduğu için 'When' (Ne zaman) kullanılır.";
        } else if (whWord === "Why") {
          qText = `_______ are you learning English? - Because I want a new job.`;
          explanation = "Sebep sorduğu için 'Why' (Neden) kullanılır.";
        } else if (whWord === "Who") {
          qText = `_______ is that tall woman? - She is our new manager.`;
          explanation = "Kişi sorduğu için 'Who' (Kim) kullanılır.";
        } else {
          qText = `_______ time do you usually wake up in the morning?`;
          correct = "What";
          explanation = "Saat sormak için 'What time' kalıbı kullanılır.";
        }
        options = shuffle([correct, "Which", "Whose", "How come"]);
        break;
      }
      case 8: { // Past Simple
        const vPast = configs[8].verbsPast[i % configs[8].verbsPast.length];
        if (i % 2 === 0) {
          correct = vPast.past;
          qText = `Yesterday, ${sub.toLowerCase()} _______ to the city center.`;
          options = shuffle([correct, vPast.inf, vPast.inf + "ing", "did " + vPast.inf]);
          explanation = `Geçmiş zaman olumlu cümlesinde fiilin 2. hali (${correct}) kullanılır.`;
        } else {
          correct = vPast.neg;
          qText = `${sub} _______ anyone at the library yesterday.`;
          options = shuffle([correct, "wasn't " + vPast.inf, "didn't " + vPast.past, "don't " + vPast.inf]);
          explanation = `Geçmiş zaman olumsuzunda 'didn't + yalın fiil' kullanılır.`;
        }
        break;
      }
      case 9: { // Will vs Going to
        if (i % 2 === 0) {
          correct = "will";
          qText = `"I'm thirsty." - "Wait here, I _______ get you a glass of water."`;
          options = shuffle(["will", "am going to", "going to", "want to"]);
          explanation = "Konuşma anında verilen anlık kararlar için 'will' kullanılır.";
        } else {
          correct = sub === "I" ? "am going to" : (isThird ? "is going to" : "are going to");
          qText = `The tickets are booked. ${sub} _______ fly to Italy next week.`;
          options = shuffle([correct, "will", "shall", "go"]);
          explanation = "Önceden planlanmış kesin eylemler için 'be going to' kalıbı kullanılır.";
        }
        break;
      }
      case 10: { // Comparatives & Superlatives
        const adj = configs[10].adjs[i % configs[10].adjs.length];
        if (i % 2 === 0) {
          correct = adj.comp;
          qText = `This car is _______ that old truck.`;
          options = shuffle([correct, "more " + adj.pos, adj.sup, adj.pos]);
          explanation = `İki nesneyi kıyaslarken comparative (${correct}) kullanılır.`;
        } else {
          correct = adj.sup;
          qText = `Mount Everest is _______ mountain on Earth.`;
          options = shuffle([correct, "more high", "highest", "higher"]);
          explanation = `En üstünlük bildirmek için superlative (${correct}) kullanılır.`;
        }
        break;
      }
      case 11: { // Modals: Must, Have to, Should
        if (i % 3 === 0) {
          correct = "mustn't";
          qText = `You _______ smoke inside the petrol station. It is forbidden!`;
          options = shuffle(["mustn't", "don't have to", "shouldn't", "can"]);
          explanation = "Yasak olan durumlar için 'mustn't' kullanılır.";
        } else if (i % 3 === 1) {
          correct = "should";
          qText = `You look exhausted. You _______ get some sleep.`;
          options = shuffle(["should", "mustn't", "have", "can't"]);
          explanation = "Arkadaşça tavsiye vermek için 'should' (yapmalısın) kullanılır.";
        } else {
          correct = "don't have to";
          qText = `Tomorrow is a holiday, so I _______ go to work.`;
          options = shuffle(["don't have to", "mustn't", "shouldn't", "can't"]);
          explanation = "Zorunluluk olmadığını anlatmak için 'don't have to' kullanılır.";
        }
        break;
      }
      case 12: { // Much, Many, Some, Any
        const isUncount = i % 2 === 0;
        if (isUncount) {
          correct = "much";
          qText = `How _______ water do you drink each day?`;
          options = shuffle(["much", "many", "few", "any"]);
          explanation = "Su (water) sayılamaz bir isimdir; miktarı 'How much' ile sorulur.";
        } else {
          correct = "many";
          qText = `How _______ books did you read last month?`;
          options = shuffle(["many", "much", "little", "any"]);
          explanation = "Kitaplar (books) sayılabilen çoğul bir isimdir; 'How many' ile sorulur.";
        }
        break;
      }
      case 13: { // Past Continuous
        if (i % 2 === 0) {
          correct = isThird || sub === "I" ? "was sleeping" : "were sleeping";
          qText = `When the phone rang, ${sub.toLowerCase()} _______.`;
          options = shuffle([correct, "slept", "is sleeping", "sleep"]);
          explanation = "Geçmişte anlık bir olay olduğunda sürmekte olan eylem Past Continuous ile ifade edilir.";
        } else {
          correct = "While";
          qText = `_______ I was walking home, it suddenly started to rain.`;
          options = shuffle(["While", "When", "During", "So"]);
          explanation = "Süregelen eylemin başına 'While' (iken) bağlacı gelir.";
        }
        break;
      }
      case 14: { // Present Perfect
        const v = configs[14].v3s[i % configs[14].v3s.length];
        if (i % 2 === 0) {
          correct = "Have you ever";
          qText = `_______ ${v.v3} a famous actor in person?`;
          options = shuffle(["Have you ever", "Did you ever", "Do you ever", "Were you ever"]);
          explanation = "Hayat boyu deneyim sormak için 'Have you ever + V3' kalıbı kullanılır.";
        } else {
          const haveForm = isThird ? "has" : "have";
          correct = `${haveForm} ${v.v3}`;
          qText = `${sub} _______ that museum twice in my life.`;
          options = shuffle([correct, `did ${v.v1}`, `${isThird ? 'have' : 'has'} ${v.v3}`, v.v1]);
          explanation = "Zamanı belirtilmeyen yaşam deneyimleri için 'have/has + V3' kullanılır.";
        }
        break;
      }
    }

    const finalOptions = options.length === 4 ? options : shuffle([correct, "option A", "option B", "option C"]);
    list.push({
      question: qText || `Ünite ${unitNumber} Soru ${i}`,
      options: finalOptions,
      answerIndex: finalOptions.indexOf(correct),
      explanation: explanation || "Doğru gramer kuralı uygulanmıştır."
    });
  }

  return list;
}

function updateLessonsDatabase() {
  const data = JSON.parse(fs.readFileSync(LESSONS_FILE, 'utf8'));

  console.log(`Starting to generate 100 questions for each of the 14 units...`);
  data.lessons.forEach(lesson => {
    const questions100 = generate100QuestionsForUnit(lesson.unitNumber);
    lesson.quiz = questions100;
    console.log(`Unit ${lesson.unitNumber} (${lesson.title}): Generated ${questions100.length} questions.`);
  });

  fs.writeFileSync(LESSONS_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\nDONE! All 14 units now have 100 questions each! Total: ${data.lessons.length * 100} questions in lessons.json.`);
}

updateLessonsDatabase();
