import "dotenv/config";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const initialQuestions = [
  {
    id: "q-01",
    stateCode: "IN-RJ",
    stateName: "Rajasthan",
    title:
      "Angela Merkel begins her journey not in Berlin, but in a land once divided by walls. She looks east to Poland, where borders have shifted more than once in history. From there, she studies a curious military tale: not of conquest, but of confusion. An army marches with confidence, maps in hand, crosses a border unnoticed, is welcomed rather than resisted, and returns home richer; not in land, but in friendship, bringing back one more soul than they took. First, name the country. Then count and add only the symbols Rome would recognize within its name. What is the nearest Armstrong number to your solution?",
    image: "",
    answer: "153",
    hint: "A very tiny landlocked country in the alps... Roman numerals and then Armstrong number",
    maxScore: 180,
  },
  {
    id: "q-02",
    stateCode: "IN-AP",
    stateName: "Andhra Pradesh",
    title:
      "My pet Octopus, Ashtabhuj, went on a roadtrip to Finland in his Kia Seltos car. But he was constantly on his phone since he was busy managing his Pedigree orders. His friend Kukkur got bored seeing him on his phone and snatched & threw his phone in a nearby river. Milne ki koi aasha toh nahi thi, but even in this no hope time, Ashtabhuj got down of his car and magically bas 1100m baad, found his fallen phone there. What's the name of the town where all this happened?",
    image: "",
    answer: "Nokia",
    hint: "",
    maxScore: 150,
  },
  {
    id: "q-03",
    stateCode: "IN-AR",
    stateName: "Arunachal Pradesh",
    title:
      'The song was composed by Bhimsen Joshi and arranged by Louis Banks, with lyrics by Piyush Pandey (now, executive chairman of Ogilvy, India). It was telecast for the first time on Independence Day, 1988, on Doordarshan. The lyrics roughly translate to "as our notes mingle together".',
    image: "",
    answer: "Mile Sur mera tumhara|Mile Sur Mera Tumhara|Mile sur|Mile Sur",
    hint: "Most famous version sung by Lata Mangeshkar",
    maxScore: 120,
  },
  {
    id: "q-04",
    stateCode: "IN-TN",
    stateName: "Tamil Nadu",
    title: "Let the integral be I. If the answer is a/b, what's the LCM of a/\u03C0\u00B2 and b?",
    image: "/images/tamilnadu.jpg",
    answer: "360",
    hint: "",
    maxScore: 180,
  },
  {
    id: "q-05",
    stateCode: "IN-KL",
    stateName: "Kerala",
    title:
      "Monsoon clouds gathered over the Malabar Coast, as a flight from the desert returned home. The runway stood atop a plateau \u2014 safe in clear skies, but unforgiving when kissed by 2020's rain. The aircraft touched down, but the earth fell away where it should have held firm. A city of spices and centuries watched in silence, its name once given by traders who could not shape its sounds. Name the city where this tragedy occurred.",
    image: "",
    answer: "Kozhikode|Calicut|Kozhikkode|Kozhikodu",
    hint: "Aug 2020 plane crash",
    maxScore: 140,
  },
  {
    id: "q-06",
    stateCode: "IN-PB",
    stateName: "Punjab",
    title:
      'In 2015, Oxford Dictionaries selected a "word" of the year that: contains no letters, expresses emotion universally, is understood across languages, and often appears after something funny. What was it?',
    image: "",
    answer: "\uD83D\uDE02|face with tears of joy|tears of joy|laughing crying emoji|laughing crying|joy emoji|😂",
    hint: "Has dena bus",
    maxScore: 130,
  },
  {
    id: "q-07",
    stateCode: "IN-HP",
    stateName: "Himachal Pradesh",
    title:
      "What is the current time at the North Pole? (Fun fact: Whatever time you write, it's both right and wrong at the same time)",
    image: "",
    answer: "Anytime|Any time|Any|All times|Every time|Every timezone|All timezones",
    hint: "",
    maxScore: 130,
  },
  {
    id: "q-08",
    stateCode: "IN-SK",
    stateName: "Sikkim",
    title:
      "A certain number can be written as the sum of two positive cubes in two distinct ways. Identify the least possible of these numbers.",
    image: "",
    answer: "1729",
    hint: "Hardy's taxi number",
    maxScore: 100,
  },
  {
    id: "q-09",
    stateCode: "IN-UT",
    stateName: "Uttarakhand",
    title:
      "This Nobel laureate worked extensively on radioactivity and was awarded the Nobel Prize in Chemistry in 1935 for the synthesis of new radioactive elements. Her work demonstrated that stable elements could be made radioactive in the laboratory, a breakthrough that transformed nuclear science. Name the scientist.",
    image: "",
    answer: "Ir\u00E8ne Joliot-Curie|Irene Joliot-Curie|Irene Joliot Curie|Ir\u00E8ne Joliot Curie|Joliot-Curie|Joliot Curie|Irene Curie|Ir\u00E8ne Curie",
    hint: "Not Marie Curie",
    maxScore: 120,
  },
  {
    id: "q-10",
    stateCode: "IN-DL",
    stateName: "Delhi",
    title:
      "You are under attack. The only fragment of code recovered from the attacker's transmission is:\n.05 .000 .00 .05.7.03 .7 .0 .4 -7\nDecode the exact message that was being transmitted. (The answer is almost the name of a place.)",
    image: "",
    answer: "INDIA GATX|INDIAGATX",
    hint: "Important monument in Delhi",
    maxScore: 200,
  },
  {
    id: "q-11",
    stateCode: "IN-KA",
    stateName: "Karnataka",
    title:
      "If Ram's childhood : Bala Kaand, then Hanuman's search for Sita : A\nAlso, if Vibheeshana : Lanka, then Sugreeva : B?\nWhat are A and B? Write as A & B.",
    image: "",
    answer: "Sundar Kaand & Kishkindha|Sundara Kanda & Kishkindha|Sundar Kand & Kishkindha|Sundarkand & Kishkindha|Sundarkaand & Kishkindha|Sundar Kaand and Kishkindha|Sundara Kanda and Kishkindha|Sundar Kand and Kishkindha|Sundarkand and Kishkindha|Sundarkaand and Kishkindha|Sundar Kaand & Kishkinda|Sundar Kand & Kishkinda|Sundara Kanda & Kishkinda|Sundar Kaand and Kishkinda|Sundar Kand and Kishkinda",
    hint: "",
    maxScore: 180,
  },
  {
    id: "q-12",
    stateCode: "IN-TG",
    stateName: "Telangana",
    title:
      "Actually, the story is kinda interTWINED\u2026 This american boi, who also happens to be a writer (greatest humorist the US has produced, probably after TRUMP). So, apparently one day he feels lonely and then attaches himself to an icy piece of stone. He establishes a brand new connection to the hail. He finds that he was born two weeks after this icy wanderer went closest to the Helios. Now, he feels that he should EXIT with the wanderer's next visit or it will be the greatest disappointment. Who's this satirist? Ps. if this boy was me, I'd be waiting for my death in 2061 now.",
    image: "",
    answer: "Mark Twain|Samuel Clemens|Samuel Langhorne Clemens",
    hint: "",
    maxScore: 170,
  },
  {
    id: "q-13",
    stateCode: "IN-HR",
    stateName: "Haryana",
    title:
      'You are an explorer who has finally breached the inner sanctum of a hidden chamber in central India. There are no inscriptions on the walls, only a rusted bronze mariner\'s compass fixed to a pedestal. Beside it lies a scrap of parchment with a sequence of degree rotations and a singular instruction:\n\n"To find my legacy, you must first dance the needle of the compass. Align your heart with the wind, and your feet with the cardinal poles. Let the zero be the breath between each step."\n\nThe parchment contains two distinct sequences:\n180 - 0 - 360 - 180 - 0 / 270 - 0 - 360 - 180\n\nYou have one more information where 0 is the set of all vowels.\nYour objective is to find the word(s) that can be made by deciphering these numbers.',
    image: "",
    answer: "SENSE WINS",
    hint: "Look at the compass angles",
    maxScore: 150,
  },
  {
    id: "q-14",
    stateCode: "IN-CT",
    stateName: "Chhattisgarh",
    title:
      "It is the ORYOL DESTB RITI SHTE RRIT. Cheers mate!\nA common misconception is that it is in the Caribbean but it's not, lmao.\nThe closest land outside this territory is in North Carolina, US.\nI won't call it equi-sided, bet you won't either\u2026Anyways, Let's NOT GO there.\nWhat place am I really heading to, which I shouldn't?",
    image: "",
    answer: "Bermuda|Bermuda Triangle|The Bermuda Triangle",
    hint: "",
    maxScore: 150,
  },
  {
    id: "q-15",
    stateCode: "IN-WB",
    stateName: "West Bengal",
    title:
      "This lexical leviathan is the art of making mountains out of molehills by declaring the mountains to be molehills first. A word so long it fears its own reflection, stitched from scraps that individually mean almost nothing, yet together perform the grand dismissal of worth. It is the bureaucrat's shrug, the troll's thesis, the empire's view of its colonies, and the pedant's favorite party trick. Built from four fragments of futility, it weaponizes worthlessness into rhetoric. What is this magnificent exercise in magniloquent minimization?",
    image: "",
    answer: "Floccinaucinihilipilification",
    hint: "The word means the act of considering something/someone worthless",
    maxScore: 180,
  },
  {
    id: "q-16",
    stateCode: "IN-MH",
    stateName: "Maharashtra",
    title:
      "What is the missing number X?\n5 (2004)\n1 (2005)\n3 (2008)\n2 (2009)\nX (2011)\n\u00BD (2014)\n1 (2016)\n105 (2018)\n1 (2020)\n400 (2021)",
    image: "",
    answer: "2020|Revolution 2020",
    hint: "A book series - these are all the numbers in Chetan Bhagat's compositions from earliest to latest. In 2011, he composed Revolution 2020.",
    maxScore: 200,
  },
  {
    id: "q-17",
    stateCode: "IN-GA",
    stateName: "Goa",
    title:
      'Wtf is "Tangy Liquid Sphere Bites"?\n"Stuffed semolina shots"\n"Flavoured H2O bombs"?\nWrong answers only!',
    image: "",
    answer: "!reject:golgappe|panipuri|puchka|pani puri|gol gappe|gol gappa|golgappa|gol gape|phuchka|puchkas|phuchkas|paani puri|pani-puri|gupchup|gup chup|pani ke batashe|batashe|batasha|pani ke patashi|patashi|pani patashi|pakodi|pani ke puri|panipuris",
    hint: "",
    maxScore: 50,
  },
  {
    id: "q-18",
    stateCode: "IN-AN",
    stateName: "Andaman and Nicobar Islands",
    title:
      '"I am the shadow of the Emancipator. We were born on the exact same day, of the exact same year, on opposite sides of the Atlantic. He broke the chains of men; I broke the chains of divine origin. He saved a Union; I discovered a Descent. Who am I?"',
    image: "",
    answer: "Charles Darwin|Darwin|Charles Robert Darwin",
    hint: "",
    maxScore: 200,
  },
  {
    id: "q-19",
    stateCode: "IN-GJ",
    stateName: "Gujarat",
    title:
      "In 1889, the British built a railway bridge in Sukkur, Sindh. No driver was willing to drive the train across the bridge. However, a prisoner sentenced to death came forward to drive the train in exchange for his freedom. His successful crossing led to his freedom. In celebration, his relatives composed a very famous Sindhi folk song, often still played at the happiest Sindhi events. Which famous folk song?",
    image: "",
    answer: "Ho Jamalo|Hey Jamalo|Ho Jamlo|Hey Jamlo|Jamalo|Jamlo|Ho Jamallo|Hey Jamallo",
    hint: "You can see Prabhu Deva dancing on the updated version of this song",
    maxScore: 190,
  },
  {
    id: "q-20",
    stateCode: "IN-BR",
    stateName: "Bihar",
    title:
      "A spacecraft departs Earth at 00:00:02 on 28-02-2026 (midnight). Onboard is a 13-hour analog clock that completes one full cycle every 13 hours. The spacecraft travels at speed c for exactly 56 hours 23 minutes 49 seconds (Earth time) and then instantly returns to Earth at the same speed. What time will the onboard 13-hour clock display upon return? Give your answer strictly in the format: HH:MM:SS",
    image: "",
    answer: "00:00:02|0:00:02|0:0:02|0:0:2|00:00:2",
    hint: "Time is relative",
    maxScore: 170,
  },
  {
    id: "q-21",
    stateCode: "IN-MP",
    stateName: "Madhya Pradesh",
    title:
      'In the ancient city of Contraria stood a peculiar library. On the left wing, scholars worshipped precision. Every scroll was cataloged, indexed, and cross-referenced. Silence ruled. On the right wing, artists ruled the halls. Pages were scattered, ideas overlapped, colors bled into margins. Noise echoed freely.\n\nFor years, both sides argued about how knowledge should be preserved. One night, the Head Archivist locked the entire building and left a message carved into the entrance:\n"Wisdom is not found at the edges, but where opposites cancel each other."\n\nBelow the message was a list:\n200, 179, 173, 165, 147, 135, 122\n\nThe next morning, the door was unlocked. Nothing was stolen. Nothing was moved. But a new single word was written at the center of the main hall. What was the word?',
    image: "",
    answer: "Fusion",
    hint: "1. Take difference and convert them to alphabet. 2. Where opposites cancel each other -> Mirror the Alphabet",
    maxScore: 200,
  },
  {
    id: "q-22",
    stateCode: "IN-ML",
    stateName: "Meghalaya",
    title:
      'In the kingdom of Dualis, two clans believed strength meant standing apart. The elders disagreed. They said:\n"When opposites reflect, and time moves back twice, the truth appears."\nCarved beneath the message were five letters:\nH O T I D\nWhat was the word the elders wanted them to remember?',
    image: "",
    answer: "UNITY",
    hint: "1. Subtract -2 each alphabet. 2. When opposite reflect -> Mirror them as A -> Z and B -> Y",
    maxScore: 100,
  },
  {
    id: "q-23",
    stateCode: "IN-TR",
    stateName: "Tripura",
    title:
      'In an old observatory, ten lenses were aligned toward the horizon. The astronomer whispered:\n"Do not read everything. Only trust the even beginnings, the prime watchers, and the final light."\nHe left behind a sequence carved into brass:\nTCRXIPMAQSOBNLSEKJY\nAnd scribbled on the margin:\n2, 3, 5, 7, 10, 11, 13, 15, 17, 19\n"Two words describe what the horizon becomes at dusk."\nWhat phrase was hidden in the sky?',
    image: "",
    answer: "CRIMSON SKY",
    hint: "",
    maxScore: 70,
  },
  {
    id: "q-24",
    stateCode: "IN-JK",
    stateName: "Jammu and Kashmir",
    title:
      "\"The address of this place is strangely UNGROUNDED\u2026 This elder, who also happens to be a civil servant (greatest messenger of the valley, probably after the PIGEON).\n\nSo, apparently, one day he decides the earth is too rigid and attaches himself to a giant carved wooden ark. He establishes a permanent residence on the 'Jewel in the Crown' of the mountains, refusing to ever touch dry land again.\n\nHe finds that he is the SOLITARY survivor of his kind in the entire world \u2014 every other office of his type has sunk or anchored. Now, he feels that if you send a message through him, it must bear a unique scar: a seal not of a king, but of a boatman rowing a shikara.\n\nWho is this floating servant/structure?\"",
    image: "",
    answer: "The Floating Post Office|Floating Post Office|Floating Post Office of Dal Lake|Dal Lake Floating Post Office|Dal Lake Post Office",
    hint: "The elder is from Kashmir",
    maxScore: 150,
  },
  {
    id: "q-25",
    stateCode: "IN-OR",
    stateName: "Odisha",
    title:
      'When a massive star collapses, its structure rearranges itself like a table of order. The astronomer left behind a final instruction:\n"Look not at the name, but at its position. Period before group. Row before column."\nBeneath the observatory lens were etched eight coordinates:\n(3,14) (3,15) (4,4) (1,1) (2,1) (3,15) (3,18) (2,13)\nHe whispered before vanishing:\n"The table is periodic for a reason."\nWhat phrase was born from the collapse?',
    image: "",
    answer: "NOVACORE|NOVA CORE|Nova Core|Novacore",
    hint: "1. (period, group) in periodic table. 2. Converting atomic number to alphabet",
    maxScore: 160,
  },
  {
    id: "q-26",
    stateCode: "IN-JH",
    stateName: "Jharkhand",
    title:
      "He was born in a city that once answered to Constantinople, but his empire was built in celluloid dreams. He gave the world a mouse before he gave it a castle. His kingdom has no army, yet millions queue at its gates every year. Take the name of the company he founded. Count only the letters that are also Roman numerals. Multiply that count by the number of parks worldwide bearing its crown. What perfect number lies closest to your result?",
    image: "",
    answer: "6|six",
    hint: "",
    maxScore: 150,
  },
  {
    id: "q-27",
    stateCode: "IN-AS",
    stateName: "Assam",
    title:
      "During the late Cold War, the Soviet Union faced difficulties paying Western companies due to the non-convertibility of the ruble. To continue selling its beverages in the USSR, this corporation entered into barter agreements: first exchanging its beverages for the rights to distribute Soviet vodka in the United States, and later accepting a fleet of decommissioned Soviet naval vessels, including submarines and a cruiser, as payment. Which multinational company was involved in this unusual trade arrangement with the Soviet Union?",
    image: "",
    answer: "PepsiCo|Pepsi|Pepsi Co|Pepsi-Co|PepsiCo Inc|PepsiCo, Inc|PepsiCo Inc.",
    hint: "",
    maxScore: 130,
  },
  {
    id: "q-28",
    stateCode: "IN-UP",
    stateName: "Uttar Pradesh",
    title:
      'This is one of the smartest UX tricks and it\'s not on an app. It\'s present in Amsterdam washrooms. With an extravagant nightlife, these washrooms are frequented by drunk men during nights. Hence, they used to face a big problem. Poor aim led to more splashback that led to even more cleaning required. Someone came up with an ingenious idea, "Don\'t change behaviour with rules, change the environment instead." This change made men aim better. They applied something in the urinals and it reduced spillage by 80%. Cleaning costs dropped by 8% and bathrooms stayed cleaner. What did they use? Answer shall be a max three word phrase.',
    image: "",
    answer: "Fake fly stickers|Fly sticker|Fly stickers|Fake fly sticker|Fake fly|A fly|Fly|Fly image|Fly etching|Fly decal|Sticker of a fly|Fly in the urinal|Fly on urinal|Etching of a fly",
    hint: "Why would you aim better? Think of it!",
    maxScore: 190,
  },
];

async function seed() {
  for (const q of initialQuestions) {
    await sql`
      INSERT INTO questions (id, state_code, state_name, title, image, answer, hint, max_score, current_score, solved, solved_by)
      VALUES (${q.id}, ${q.stateCode}, ${q.stateName}, ${q.title}, ${q.image}, ${q.answer}, ${q.hint}, ${q.maxScore}, ${q.maxScore}, false, '{}')
      ON CONFLICT (id) DO UPDATE SET
        state_code = EXCLUDED.state_code,
        state_name = EXCLUDED.state_name,
        title = EXCLUDED.title,
        image = EXCLUDED.image,
        answer = EXCLUDED.answer,
        hint = EXCLUDED.hint,
        max_score = EXCLUDED.max_score,
        current_score = EXCLUDED.current_score,
        solved = EXCLUDED.solved,
        solved_by = EXCLUDED.solved_by
    `;
  }
  console.log("Seeded " + initialQuestions.length + " questions successfully.");
}

seed();
