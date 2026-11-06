/* LingoCards word list. Edit, add or remove words here.
   Each batch = 10 words + a boss. Row format is described just below. */
/* ------------------------------------------------------------------
   Deck: cards 1–100 of the 2,000-word core list, 10 themed batches.
   Each word: [article, word, pos, IPA, phonetic guide, English,
               example, example translation, form used in example, alt spellings]
------------------------------------------------------------------- */
window.LINGO_DATA = [
  { t: "Greetings & Essentials", de: "Grüße und Grundwörter",
    boss: { n: "Der Türsteher", g: "the bouncer", e: "🕶️", s: "Saturday night in Berlin. The bouncer at the club door only lets in people who can speak German." },
    w: [
      ["", "Hallo", "interj", "haˈloː", "hah-LOH", "hello / hi", "Hallo, wie geht's?", "Hello, how are you?", "Hallo"],
      ["", "danke", "interj", "ˈdaŋkə", "DAHN-keh", "thank you / thanks", "Danke für den Kaffee!", "Thanks for the coffee!", "Danke"],
      ["", "bitte", "interj", "ˈbɪtə", "BIT-teh", "please / you're welcome", "Ein Wasser, bitte.", "A water, please.", "bitte"],
      ["", "ja", "interj", "jaː", "yah", "yes", "Ja, das ist richtig.", "Yes, that is right.", "Ja"],
      ["", "nein", "interj", "naɪ̯n", "nine", "no", "Nein, danke.", "No, thank you.", "Nein"],
      ["", "Tschüss", "interj", "tʃʏs", "chüss (round your lips)", "bye", "Tschüss, bis morgen!", "Bye, see you tomorrow!", "Tschüss", ["tschüs"]],
      ["", "Entschuldigung", "interj", "ɛntˈʃʊldɪɡʊŋ", "ent-SHOOL-dee-goong", "excuse me / sorry", "Entschuldigung, wo ist der Bahnhof?", "Excuse me, where is the train station?", "Entschuldigung"],
      ["", "Guten Morgen", "phrase", "ˈɡuːtn̩ ˈmɔʁɡn̩", "GOO-ten MOR-gen", "good morning", "Guten Morgen, Anna!", "Good morning, Anna!", "Guten Morgen"],
      ["", "gut", "adj", "ɡuːt", "goot", "good / well", "Mir geht es gut.", "I am doing well.", "gut"],
      ["", "sehr", "adv", "zeːɐ̯", "zair", "very", "Das Essen ist sehr gut.", "The food is very good.", "sehr"]
    ] },
  { t: "People & Pronouns", de: "Menschen",
    boss: { n: "Die Schwiegermutter", g: "the mother-in-law", e: "👵", s: "Sunday lunch with your partner's family. Their mother wants to hear about every person in your life." },
    w: [
      ["", "ich", "pron", "ɪç", "ish (soft, breathy ch)", "I", "Ich bin Tom.", "I am Tom.", "Ich"],
      ["", "du", "pron", "duː", "doo", "you (informal)", "Du bist nett.", "You are nice.", "Du"],
      ["", "er", "pron", "eːɐ̯", "air", "he", "Er ist mein Bruder.", "He is my brother.", "Er"],
      ["", "sie", "pron", "ziː", "zee", "she / they", "Sie wohnt in Berlin.", "She lives in Berlin.", "Sie"],
      ["", "wir", "pron", "viːɐ̯", "veer", "we", "Wir lernen Deutsch.", "We are learning German.", "Wir"],
      ["der", "Mann", "noun", "man", "mahn", "man / husband", "Der Mann trinkt Kaffee.", "The man drinks coffee.", "Mann"],
      ["die", "Frau", "noun", "fʁaʊ̯", "frow (rhymes with now)", "woman / wife", "Die Frau liest ein Buch.", "The woman is reading a book.", "Frau"],
      ["das", "Kind", "noun", "kɪnt", "kint", "child", "Das Kind spielt im Garten.", "The child plays in the garden.", "Kind"],
      ["der", "Freund", "noun", "fʁɔʏ̯nt", "froynt", "friend / boyfriend", "Mein Freund kommt heute.", "My friend is coming today.", "Freund"],
      ["die", "Familie", "noun", "faˈmiːli̯ə", "fah-MEE-lee-eh", "family", "Meine Familie ist groß.", "My family is big.", "Familie"]
    ] },
  { t: "Core Verbs", de: "Wichtige Verben",
    boss: { n: "Der Verb-Drache", g: "the verb dragon", e: "🐉", s: "A dragon made of conjugations guards the old bridge. Only complete, correct sentences may cross." },
    w: [
      ["", "sein", "verb", "zaɪ̯n", "zine", "to be", "Ich bin müde.", "I am tired.", "bin"],
      ["", "haben", "verb", "ˈhaːbn̩", "HAH-ben", "to have", "Ich habe einen Hund.", "I have a dog.", "habe"],
      ["", "machen", "verb", "ˈmaxn̩", "MAH-khen", "to do / to make", "Was machst du heute?", "What are you doing today?", "machst"],
      ["", "gehen", "verb", "ˈɡeːən", "GAY-en", "to go (on foot)", "Wir gehen nach Hause.", "We are going home.", "gehen"],
      ["", "kommen", "verb", "ˈkɔmən", "KOM-men", "to come", "Kommst du mit?", "Are you coming along?", "Kommst"],
      ["", "sagen", "verb", "ˈzaːɡn̩", "ZAH-gen", "to say", "Was sagst du?", "What are you saying?", "sagst"],
      ["", "sehen", "verb", "ˈzeːən", "ZAY-en", "to see", "Ich sehe den Bus.", "I see the bus.", "sehe"],
      ["", "wissen", "verb", "ˈvɪsn̩", "VISS-en", "to know (a fact)", "Ich weiß es nicht.", "I don't know.", "weiß"],
      ["", "können", "verb", "ˈkœnən", "KUR-nen (no r)", "can / to be able to", "Kannst du mir helfen?", "Can you help me?", "Kannst"],
      ["", "wollen", "verb", "ˈvɔlən", "VOL-len", "to want", "Ich will schlafen.", "I want to sleep.", "will"]
    ] },
  { t: "Food & Drink", de: "Essen und Trinken",
    boss: { n: "Der Kellner", g: "the waiter", e: "🤵", s: "A famously grumpy Munich waiter is taking your order. He will not ask twice." },
    w: [
      ["das", "Wasser", "noun", "ˈvasɐ", "VAH-ser", "water", "Ich trinke viel Wasser.", "I drink a lot of water.", "Wasser"],
      ["der", "Kaffee", "noun", "ˈkafe", "KAH-feh", "coffee", "Der Kaffee ist heiß.", "The coffee is hot.", "Kaffee"],
      ["das", "Brot", "noun", "bʁoːt", "broht", "bread", "Das Brot ist frisch.", "The bread is fresh.", "Brot"],
      ["", "essen", "verb", "ˈɛsn̩", "ESS-en", "to eat", "Wir essen um sieben Uhr.", "We eat at seven o'clock.", "essen"],
      ["", "trinken", "verb", "ˈtʁɪŋkn̩", "TRINK-en", "to drink", "Was möchtest du trinken?", "What would you like to drink?", "trinken"],
      ["der", "Apfel", "noun", "ˈapfl̩", "AHP-fel", "apple", "Der Apfel ist rot.", "The apple is red.", "Apfel"],
      ["die", "Milch", "noun", "mɪlç", "milsh (soft ch)", "milk", "Ich nehme Milch in den Kaffee.", "I take milk in my coffee.", "Milch"],
      ["der", "Käse", "noun", "ˈkɛːzə", "KAY-zeh", "cheese", "Der Käse kommt aus der Schweiz.", "The cheese comes from Switzerland.", "Käse"],
      ["das", "Frühstück", "noun", "ˈfʁyːʃtʏk", "FRÜH-shtük", "breakfast", "Das Frühstück ist fertig.", "Breakfast is ready.", "Frühstück"],
      ["", "lecker", "adj", "ˈlɛkɐ", "LEK-er", "tasty / delicious", "Die Suppe ist lecker!", "The soup is delicious!", "lecker"]
    ] },
  { t: "At Home", de: "Zu Hause",
    boss: { n: "Der Hausmeister", g: "the caretaker", e: "🧹", s: "The building caretaker caught you carrying boxes up the stairs. Explain your new place to him." },
    w: [
      ["das", "Haus", "noun", "haʊ̯s", "house", "house", "Das Haus ist alt.", "The house is old.", "Haus"],
      ["die", "Wohnung", "noun", "ˈvoːnʊŋ", "VOH-noong", "apartment / flat", "Die Wohnung hat drei Zimmer.", "The apartment has three rooms.", "Wohnung"],
      ["das", "Zimmer", "noun", "ˈtsɪmɐ", "TSIM-er", "room", "Mein Zimmer ist klein.", "My room is small.", "Zimmer"],
      ["die", "Küche", "noun", "ˈkʏçə", "KÜ-kheh (soft ch)", "kitchen", "Wir kochen in der Küche.", "We cook in the kitchen.", "Küche"],
      ["das", "Bett", "noun", "bɛt", "bet", "bed", "Das Bett ist sehr bequem.", "The bed is very comfortable.", "Bett"],
      ["der", "Tisch", "noun", "tɪʃ", "tish", "table", "Das Buch liegt auf dem Tisch.", "The book is on the table.", "Tisch"],
      ["der", "Stuhl", "noun", "ʃtuːl", "shtool", "chair", "Der Stuhl ist neu.", "The chair is new.", "Stuhl"],
      ["die", "Tür", "noun", "tyːɐ̯", "tüer (round your lips)", "door", "Mach bitte die Tür zu.", "Please close the door.", "Tür"],
      ["das", "Fenster", "noun", "ˈfɛnstɐ", "FEN-ster", "window", "Das Fenster ist offen.", "The window is open.", "Fenster"],
      ["", "wohnen", "verb", "ˈvoːnən", "VOH-nen", "to live (reside)", "Ich wohne in Hamburg.", "I live in Hamburg.", "wohne"]
    ] },
  { t: "Time", de: "Die Zeit",
    boss: { n: "Die Kuckucksuhr", g: "the cuckoo clock", e: "🕰️", s: "Deep in the Black Forest, a cursed cuckoo clock will only stop calling if you talk about time." },
    w: [
      ["", "heute", "adv", "ˈhɔʏ̯tə", "HOY-teh", "today", "Heute ist Montag.", "Today is Monday.", "Heute"],
      ["", "morgen", "adv", "ˈmɔʁɡn̩", "MOR-gen", "tomorrow", "Morgen habe ich frei.", "Tomorrow I have the day off.", "Morgen"],
      ["", "gestern", "adv", "ˈɡɛstɐn", "GESS-tern", "yesterday", "Gestern war es kalt.", "Yesterday it was cold.", "Gestern"],
      ["", "jetzt", "adv", "jɛtst", "yetst", "now", "Ich muss jetzt gehen.", "I have to go now.", "jetzt"],
      ["der", "Tag", "noun", "taːk", "tahk", "day", "Einen schönen Tag!", "Have a nice day!", "Tag"],
      ["die", "Nacht", "noun", "naxt", "nahkht", "night", "Gute Nacht, schlaf gut!", "Good night, sleep well!", "Nacht"],
      ["die", "Woche", "noun", "ˈvɔxə", "VOKH-eh", "week", "Die Woche hat sieben Tage.", "The week has seven days.", "Woche"],
      ["das", "Jahr", "noun", "jaːɐ̯", "yaar", "year", "Das Jahr hat zwölf Monate.", "The year has twelve months.", "Jahr"],
      ["die", "Zeit", "noun", "tsaɪ̯t", "tsite", "time", "Hast du Zeit?", "Do you have time?", "Zeit"],
      ["", "immer", "adv", "ˈɪmɐ", "IM-er", "always", "Er ist immer pünktlich.", "He is always on time.", "immer"]
    ] },
  { t: "Numbers", de: "Zahlen",
    boss: { n: "Der Rechenmeister", g: "the math master", e: "🧮", s: "A strict math teacher counts every mistake you make. Count right back at him." },
    w: [
      ["", "eins", "num", "aɪ̯ns", "eyns", "one", "Ich nehme Nummer eins.", "I'll take number one.", "eins"],
      ["", "zwei", "num", "tsvaɪ̯", "tsvy", "two", "Zwei Kaffee, bitte.", "Two coffees, please.", "Zwei"],
      ["", "drei", "num", "dʁaɪ̯", "dry", "three", "Ich habe drei Kinder.", "I have three children.", "drei"],
      ["", "vier", "num", "fiːɐ̯", "feer", "four", "Wir sind vier Personen.", "We are four people.", "vier"],
      ["", "fünf", "num", "fʏnf", "fünf (round your lips)", "five", "Es ist fünf Uhr.", "It is five o'clock.", "fünf"],
      ["", "sechs", "num", "zɛks", "zeks", "six", "Der Zug kommt um sechs.", "The train comes at six.", "sechs"],
      ["", "sieben", "num", "ˈziːbn̩", "ZEE-ben", "seven", "Das Kind ist sieben Jahre alt.", "The child is seven years old.", "sieben"],
      ["", "acht", "num", "axt", "ahkht", "eight", "Ich arbeite acht Stunden.", "I work eight hours.", "acht"],
      ["", "neun", "num", "nɔʏ̯n", "noyn", "nine", "Der Film beginnt um neun.", "The film starts at nine.", "neun"],
      ["", "zehn", "num", "tseːn", "tsayn", "ten", "Das kostet zehn Euro.", "That costs ten euros.", "zehn"]
    ] },
  { t: "Daily Routine", de: "Der Alltag",
    boss: { n: "Der Montagmorgen", g: "Monday morning", e: "⏰", s: "Monday morning has come for you. Fight your way through the daily routine." },
    w: [
      ["", "aufstehen", "verb", "ˈaʊ̯fˌʃteːən", "OWF-shtay-en", "to get up", "Ich stehe um sechs Uhr auf.", "I get up at six o'clock.", "stehe"],
      ["", "schlafen", "verb", "ˈʃlaːfn̩", "SHLAH-fen", "to sleep", "Das Baby schläft.", "The baby is sleeping.", "schläft"],
      ["", "arbeiten", "verb", "ˈaʁbaɪ̯tn̩", "AR-bye-ten", "to work", "Sie arbeitet im Büro.", "She works in the office.", "arbeitet"],
      ["", "lernen", "verb", "ˈlɛʁnən", "LAIR-nen", "to learn / to study", "Ich lerne jeden Tag Deutsch.", "I learn German every day.", "lerne"],
      ["", "kaufen", "verb", "ˈkaʊ̯fn̩", "KOW-fen", "to buy", "Ich kaufe Brot im Supermarkt.", "I buy bread at the supermarket.", "kaufe"],
      ["", "kochen", "verb", "ˈkɔxn̩", "KOKH-en", "to cook", "Mein Vater kocht gern.", "My father likes to cook.", "kocht"],
      ["", "lesen", "verb", "ˈleːzn̩", "LAY-zen", "to read", "Ich lese die Zeitung.", "I read the newspaper.", "lese"],
      ["", "spielen", "verb", "ˈʃpiːlən", "SHPEE-len", "to play", "Die Kinder spielen Fußball.", "The children play soccer.", "spielen"],
      ["", "brauchen", "verb", "ˈbʁaʊ̯xn̩", "BROW-khen", "to need", "Ich brauche einen Stift.", "I need a pen.", "brauche"],
      ["", "fahren", "verb", "ˈfaːʁən", "FAH-ren", "to drive / to go (by vehicle)", "Wir fahren mit dem Zug.", "We are going by train.", "fahren"]
    ] },
  { t: "Travel & City", de: "Unterwegs",
    boss: { n: "Der Schaffner", g: "the train conductor", e: "🎫", s: "The conductor on the Intercity wants your ticket and some directions. Answer before the next stop." },
    w: [
      ["die", "Stadt", "noun", "ʃtat", "shtaht", "city / town", "Die Stadt ist sehr schön.", "The city is very beautiful.", "Stadt"],
      ["die", "Straße", "noun", "ˈʃtʁaːsə", "SHTRAH-seh", "street / road", "Die Straße ist lang.", "The street is long.", "Straße"],
      ["der", "Bahnhof", "noun", "ˈbaːnˌhoːf", "BAHN-hohf", "train station", "Der Bahnhof ist dort drüben.", "The train station is over there.", "Bahnhof"],
      ["der", "Zug", "noun", "tsuːk", "tsook", "train", "Der Zug hat Verspätung.", "The train is delayed.", "Zug"],
      ["das", "Auto", "noun", "ˈaʊ̯to", "OW-toh", "car", "Das Auto steht vor dem Haus.", "The car is parked in front of the house.", "Auto"],
      ["der", "Bus", "noun", "bʊs", "booss", "bus", "Der Bus kommt gleich.", "The bus is coming soon.", "Bus"],
      ["das", "Hotel", "noun", "hoˈtɛl", "ho-TEL", "hotel", "Das Hotel ist im Zentrum.", "The hotel is in the center.", "Hotel"],
      ["", "links", "adv", "lɪŋks", "links", "left", "Gehen Sie hier links.", "Go left here.", "links"],
      ["", "rechts", "adv", "ʁɛçts", "rekhts (soft ch)", "right (direction)", "Der Bahnhof ist rechts.", "The train station is on the right.", "rechts"],
      ["", "wo", "adv", "voː", "voh", "where", "Wo ist die Toilette?", "Where is the restroom?", "Wo"]
    ] },
  { t: "Describing Things", de: "Eigenschaften",
    boss: { n: "Das Adjektiv-Monster", g: "the adjective monster", e: "👾", s: "The last boss of this deck feeds on bland sentences. Describe the world in color to beat it." },
    w: [
      ["", "groß", "adj", "ɡʁoːs", "grohss", "big / tall", "Das Haus ist groß.", "The house is big.", "groß"],
      ["", "klein", "adj", "klaɪ̯n", "kline", "small / little", "Die Katze ist klein.", "The cat is small.", "klein"],
      ["", "neu", "adj", "nɔʏ̯", "noy", "new", "Ich habe ein neues Handy.", "I have a new phone.", "neues"],
      ["", "alt", "adj", "alt", "ahlt", "old", "Mein Opa ist achtzig Jahre alt.", "My grandpa is eighty years old.", "alt"],
      ["", "schön", "adj", "ʃøːn", "shurn (no r, round lips)", "beautiful / nice", "Das Wetter ist schön.", "The weather is nice.", "schön"],
      ["", "heiß", "adj", "haɪ̯s", "hice", "hot", "Im Sommer ist es heiß.", "It is hot in summer.", "heiß"],
      ["", "kalt", "adj", "kalt", "kahlt", "cold", "Das Wasser ist kalt.", "The water is cold.", "kalt"],
      ["", "teuer", "adj", "ˈtɔʏ̯ɐ", "TOY-er", "expensive", "Das Hotel ist zu teuer.", "The hotel is too expensive.", "teuer"],
      ["", "billig", "adj", "ˈbɪlɪç", "BILL-ish", "cheap", "Das Brot ist billig.", "The bread is cheap.", "billig"],
      ["", "schnell", "adj", "ʃnɛl", "shnell", "fast / quick", "Der Zug fährt schnell.", "The train goes fast.", "schnell"]
    ] }
];
