export const ENGNOVATE_LINKS = [
  { id: 'listening', title: 'Listening', sub: 'Engnovate Audio', url: 'https://engnovate.com/ielts-listening-tests/ielts-vol-9-academic-listening-test-6/' },
  { id: 'reading', title: 'Reading', sub: 'Passages & Headings', url: 'https://engnovate.com/mini-ielts-exercises/ielts-academic-reading-matching-headings-practice-exercises/' },
  { id: 'writing', title: 'Writing', sub: 'Task 1 & Task 2', url: 'https://engnovate.com/ielts-writing-tests/ielts-simulation-tests-academic-writing-test-10/' },
  { id: 'speaking', title: 'Speaking', sub: 'Full Sim + AI', url: 'https://engnovate.com/ielts-speaking-tests/cambridge-ielts-21-academic-speaking-test-1/' }
];

export const EXTRA_PRACTICE_LINKS = [
  { label: 'Все тесты Engnovate', url: 'https://engnovate.com/ielts-tests/' },
  { label: 'Daily Exams', url: 'https://engnovate.com/ielts-exam-events/' },
  { label: 'Mini Exercises', url: 'https://engnovate.com/mini-ielts-exercises/' },
  { label: 'Forecast Topics', url: 'https://engnovate.com/ielts-exam-topics/' },
  { label: 'IELTS.org Samples', url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test' }
];

export const ERROR_TYPES = [
  'Reading: T/F/NG & Y/N/NG',
  'Reading: Matching Headings',
  'Reading: Не хватило времени на P3',
  'Listening: Self-Correction (P1-2)',
  'Listening: Part 3 MCQ перефраз',
  'Listening: Part 4 орфография / -s',
  'Writing: Слабый Overview (Task 1)',
  'Writing: Нет чёткой позиции (Task 2)',
  'Writing: Клише / бедная грамматика',
  'Speaking: Паузы на Part 2 (2 мин)'
];

export const BEAST_28_DAYS = Array.from({ length: 28 }, (_, idx) => {
  const day = idx + 1;
  const week = Math.floor(idx / 7) + 1;
  const dow = idx % 7; // 0=Mon ... 6=Sun

  if (dow === 6) {
    return {
      day,
      week,
      tag: 'Разгрузка',
      title: `День ${day} • Отдых + Погружение`,
      blocks: [
        'Никаких тестов и таймеров — мозгу нужно закрепить связи.',
        'Посмотри 1 фильм или 2 серии Netflix / Anime EN Dub из вкладки «Медиа» чисто в кайф.',
        'Выпиши 3–5 реально крутых фраз, которые зацепили слух.'
      ]
    };
  }

  if (dow === 5) {
    return {
      day,
      week,
      tag: 'Full Mock',
      title: `День ${day} • Субботний Full Mock`,
      blocks: [
        'Сдай полный экзамен подряд на Engnovate (Listening + Reading + Writing, 2ч 40м без пауз).',
        'Запиши свежие баллы через кнопку «+ Мок» и отметь главные ошибки в Error Wall.',
        'Вечером 20 мин лёгкого Speaking Part 1–2.'
      ]
    };
  }

  const weekThemes = {
    1: {
      focus: 'Фундамент и закрытие дыр 5.5',
      wTask: '1 Task 2 (Opinion / Discussion) по 12-предложенной схеме без жёсткого таймера — фокус на 100% логику и 0 клише.',
      lrTask: dow % 2 === 0
        ? 'Reading на Engnovate: фокус на T/F/NG и Gap Fill (выписывай доказательство из текста).'
        : 'Listening на Engnovate: цель 19–20/20 в Parts 1–2, лови все self-correction ловушки.'
    },
    2: {
      focus: 'Все типы Writing + Тайминг 15/20/25',
      wTask: dow < 3
        ? '1 Task 2 (Adv/Disadv, Problem/Sol или Two-Part) за 45 минут + проверка чек-листом.'
        : '1 Task 1 (Line / Bar / Pie / Table) за 20 минут — железный Overview без цифр.',
      lrTask: dow % 2 === 0
        ? 'Reading строго по сплит-таймеру 15 / 20 / 25 мин + 1 блок Matching Headings.'
        : 'Listening полный тест + разбор всех ошибок Part 3 MCQ.'
    },
    3: {
      focus: 'Апгрейд до 7.0–7.5+ (Сложные части)',
      wTask: 'Task 1 (20 мин) + Task 2 (40 мин) с обязательными 1 Noun Clause + 1 Concession + 1 Inversion.',
      lrTask: dow % 2 === 0
        ? 'Reading Passage 3 на время + 1 эссе на Aeon/Psyche с выпиской 5 коллокаций.'
        : 'Listening Parts 3–4 на скорости 1.15x + диктовка сложных слов Part 4.'
    },
    4: {
      focus: 'Экзаменационная полировка',
      wTask: 'Полный Writing за 60 мин + прогон через Gemini Examiner (или чек-лист 4 критериев).',
      lrTask: 'Симуляция L+R подряд без перерыва + точечный добив топ-2 ошибок из Error Wall.'
    }
  };

  const t = weekThemes[week];
  return {
    day,
    week,
    tag: `Неделя ${week}`,
    title: `День ${day} • ${t.focus}`,
    blocks: [
      `Блок 1 — Writing (90 мин): ${t.wTask}`,
      `Блок 2 — L/R Практика (75 мин): ${t.lrTask}`,
      'Блок 3 — Разбор ошибок + Словарь (45 мин): разбери каждую ошибку по причине и запиши 5 живых коллокаций.',
      'Блок 4 — Speaking (30 мин): 1 Cue Card (1+2 мин таймер) + 3 вопроса Part 3 вслух.'
    ]
  };
});

export const TASK2_TYPES = [
  {
    id: 'opinion',
    name: 'Agree / Disagree',
    prompt: 'Some people believe AI tutors will eventually replace human teachers in secondary schools. To what extent do you agree or disagree?',
    steps: [
      { id: 'S1', part: 'Intro', title: 'Перефраз темы (без копирования)', example: 'As adaptive AI platforms rapidly enter classrooms, many argue that human educators could soon become obsolete.' },
      { id: 'S2', part: 'Intro', title: 'Чёткая позиция + 2 причины сразу', example: 'While AI excels at routine drills, I firmly disagree that it can replace teachers, as teenage learning relies heavily on emotional mentorship and classroom accountability.' },
      { id: 'S3', part: 'Body 1', title: 'Topic Sentence (1 идея + Noun Clause)', example: 'What makes human teachers irreplaceable is that adolescents require empathy and tailored psychological support.' },
      { id: 'S4', part: 'Body 1', title: 'Механизм (Why / How)', example: 'Unlike algorithms that only track right or wrong answers, an attentive teacher notices subtle signs of burnout or quiet self-doubt.' },
      { id: 'S5', part: 'Body 1', title: 'Конкретный жизненный пример', example: 'For instance, a teenager struggling with exam anxiety often needs a brief, encouraging conversation after class rather than another automated worksheet.' },
      { id: 'S6', part: 'Body 1', title: 'Последствие / Связка к тезису', example: 'Without this human connection, many students lose intrinsic motivation and treat studying as a mechanical chore.' },
      { id: 'S7', part: 'Body 2', title: 'Уступка (Concession)', example: 'Admittedly, AI platforms bring undeniable efficiency to secondary education.' },
      { id: 'S8', part: 'Body 2', title: 'Развитие уступки (Inversion)', example: 'Not only can software grade essays in seconds, but it also adapts exercises to each student\'s individual pace.' },
      { id: 'S9', part: 'Body 2', title: 'Поворот к своей позиции', example: 'However, secondary school is not merely about transferring facts; it is where young people learn to debate, collaborate, and read social cues.' },
      { id: 'S10', part: 'Body 2', title: 'Пример + Итог абзаца', example: 'Spontaneous group discussions guided by a skilled teacher build critical thinking and resilience in ways a screen cannot replicate.' },
      { id: 'S11', part: 'Conclusion', title: 'Перефраз позиции (без "In conclusion")', example: 'Ultimately, although AI is a powerful teaching assistant, it cannot substitute for human mentorship.' },
      { id: 'S12', part: 'Conclusion', title: 'Финальный практический вывод', example: 'The smartest path forward is a hybrid classroom where technology handles repetitive grading so teachers can focus on inspiring students.' }
    ]
  },
  {
    id: 'discuss',
    name: 'Discuss Both Views',
    prompt: 'Some people think students should study only subjects they enjoy, while others believe they should study a broad range of subjects. Discuss both views and give your own opinion.',
    steps: [
      { id: 'S1', part: 'Intro', title: 'Обе стороны в одном предложении', example: 'While some contend that teenagers thrive when allowed to focus solely on favorite subjects, others insist that a broad curriculum remains essential.' },
      { id: 'S2', part: 'Intro', title: 'Твоя позиция СРАЗУ (не прячь до конца)', example: 'Although passion undeniably boosts engagement, I believe a well-rounded foundation serves students far better in the long run.' },
      { id: 'S3–S6', part: 'Body 1', title: 'Чужая сторона (4 предл.) + мягкий переход', example: 'Proponents of early specialization point out that genuine curiosity accelerates mastery... Yet narrowing a teenager\'s horizons too early carries a serious blind spot.' },
      { id: 'S7–S10', part: 'Body 2', title: 'ТВОЯ сторона (5 предл. + Noun Clause)', example: 'What makes a broad curriculum far more valuable is that adolescents\' career interests evolve rapidly, and cross-disciplinary skills open far more doors.' },
      { id: 'S11–S12', part: 'Conclusion', title: 'Баланс + подтверждение твоего выбора', example: 'In short, electives should nurture personal passion, yet core general education must remain non-negotiable.' }
    ]
  },
  {
    id: 'adv',
    name: 'Adv / Disadv (Outweigh)',
    prompt: 'More young people are choosing remote freelance careers over traditional office jobs. Do the advantages outweigh the disadvantages?',
    steps: [
      { id: 'S1–S2', part: 'Intro', title: 'Перефраз + прямой ответ на OUTWEIGH', example: 'Although remote freelancing introduces income instability, I believe its long-term advantages decisively outweigh the drawbacks.' },
      { id: 'S3–S6', part: 'Body 1', title: 'Меньшая сторона (Минусы, 4 предл.)', example: 'Granted, working independently carries tangible risks, particularly irregular paychecks and isolation—yet these hurdles can be managed with discipline.' },
      { id: 'S7–S10', part: 'Body 2', title: 'Главная сторона (Плюсы + Inversion)', example: 'Not only can graduates in smaller cities compete for global clients, but they also reclaim hours lost to exhausting daily commutes.' },
      { id: 'S11–S12', part: 'Conclusion', title: 'Итоговый перевес', example: 'Ultimately, the autonomy and global earning ceiling of remote work far outweigh its manageable early risks.' }
    ]
  },
  {
    id: 'problem',
    name: 'Problem / Solution',
    prompt: 'Traffic congestion in major cities is worsening every year. What are the main causes, and what measures can tackle it?',
    steps: [
      { id: 'S1–S2', part: 'Intro', title: 'Перефраз проблемы + краткий анонс причин и мер', example: 'Severe urban gridlock stems largely from unreliable public transit and sprawling suburbs, yet targeted infrastructure investment and congestion pricing can reverse it.' },
      { id: 'S3–S6', part: 'Body 1', title: '2 конкретные причины с механизмом', example: 'When buses are slow and overcrowded, commuters treat private cars as a necessity rather than a luxury.' },
      { id: 'S7–S10', part: 'Body 2', title: 'Решения, бьющие РОВНО в причины Body 1', example: 'Faced with dedicated bus lanes, reliable metro networks, and peak-hour city center tolls, drivers naturally switch to public transport—as demonstrated in Singapore.' },
      { id: 'S11–S12', part: 'Conclusion', title: 'Связка причины → решения', example: 'Only by making public transit faster and cheaper than driving can cities truly unclog their roads.' }
    ]
  },
  {
    id: 'twopart',
    name: 'Two-Part Question',
    prompt: 'People spend far less time with their neighbors than in the past. Why is this happening, and is it a positive or negative development?',
    steps: [
      { id: 'S1–S2', part: 'Intro', title: 'Ответ на ОБА вопроса в одном Intro', example: 'Frequent relocation and digital socializing have weakened neighborhood ties, which I view as a largely negative shift for community resilience.' },
      { id: 'S3–S6', part: 'Body 1', title: 'Полный ответ на 1-й вопрос (Why?)', example: 'Young professionals move apartments every few years for work, leaving little incentive to build lasting local friendships.' },
      { id: 'S7–S10', part: 'Body 2', title: 'Полный ответ на 2-й вопрос (Pos / Neg)', example: 'While reduced contact offers greater privacy, the erosion of local trust leaves residents—especially elderly ones—isolated during emergencies.' },
      { id: 'S11–S12', part: 'Conclusion', title: 'Итог по обеим частям', example: 'Restoring casual neighborhood spaces is vital to counter the quiet loneliness of modern urban life.' }
    ]
  }
];

export const TASK1_TYPES = [
  { name: 'Line Graph', overview: 'Overall, digital video courses surged dramatically and overtook printed textbooks, which declined steadily throughout the period.', vocab: ['surged / climbed steadily / plateaued / plummeted', 'overtook X in 2020', 'narrowed the gap'] },
  { name: 'Bar Chart', overview: 'Overall, Norway consistently maintained the highest renewable share, whereas the UK recorded the steepest relative expansion.', vocab: ['accounted for the largest share', 'lagged well behind', 'roughly three times as high as', 'respectively'] },
  { name: 'Pie Charts', overview: 'Overall, housing and food remained the two dominant household expenses in both years, while spending on entertainment nearly doubled.', vocab: ['comprised / constituted', 'just over a quarter (26%)', 'a negligible fraction (2%)'] },
  { name: 'Table', overview: 'Overall, European nations outperformed Asian counterparts across all three metrics, with the widest disparity seen in research funding.', vocab: ['outperformed all other nations', 'stood at / hovered around', 'a stark disparity between X and Y'] },
  { name: 'Process Diagram', overview: 'Overall, the linear manufacturing process consists of seven main stages, beginning with harvesting raw beans and culminating in retail packaging.', vocab: ['Initially / Subsequently / Once dried, the material is...', 'undergoes a process of', 'is fed into'] },
  { name: 'Map (Before/After)', overview: 'Overall, the quiet coastal village was transformed into a modern tourist hub with upgraded roads, while the northern forest remained untouched.', vocab: ['was demolished to make way for', 'has been converted into', 'remained intact', 'adjacent to / directly opposite'] }
];

export const STARTER_FRAMES = [
  { label: '+ Noun Clause', text: 'What many observers overlook is that ' },
  { label: '+ Inversion', text: 'Not only does this approach cut costs, but it also ' },
  { label: '+ Concession', text: 'While it is tempting to assume that , the reality is far more nuanced.' },
  { label: '+ Participle', text: 'Faced with mounting pressure, ' },
  { label: '+ Cleft', text: 'It is consistent daily practice, rather than raw talent, that ' }
];

export const GRAMMAR_WEAPONS = [
  { name: 'Noun Clauses', formula: 'What + [verb phrase] + is that + [clause]', bad: 'It is very important that teens sleep enough.', good: 'What many parents overlook is that chronic sleep loss directly impairs teenage memory.' },
  { name: 'Negative Inversion', formula: 'Not only + does/do/can + S + V, but S + also...', bad: 'Remote work saves time and lowers stress.', good: 'Not only does remote work eliminate exhausting commutes, but it also boosts autonomy.' },
  { name: 'Participle Clauses', formula: 'Faced with + [noun], S + V...', bad: 'Because cities face severe traffic, they build metros.', good: 'Faced with crippling congestion, cities are investing heavily in rapid transit.' },
  { name: 'Cleft Sentences', formula: 'It is [X], rather than [Y], that + [verb]', bad: 'Lack of practice causes low scores, not lack of talent.', good: 'It is inconsistent practice, rather than a lack of talent, that holds candidates back.' },
  { name: 'Natural Hedging', formula: 'While it is tempting to assume..., the reality is...', bad: 'Social media completely destroys real friendships.', good: 'While it is tempting to assume social media erodes friendships, it often sustains distant ties.' }
];

export const WRITING_CHECKLIST = [
  { id: 'c1', crit: 'TR/TA', text: 'Ответил на ВСЕ части вопроса (мнение чётко есть в Intro и Conclusion).' },
  { id: 'c2', crit: 'TR/TA', text: 'Task 1: есть Overview БЕЗ цифр. Task 2: минимум 260 слов.' },
  { id: 'c3', crit: 'CC', text: '4 абзаца, 1 абзац = 1 идея. Нет роботских Firstly / Moreover / Nowadays.' },
  { id: 'c4', crit: 'LR', text: 'Убраны very good / very bad / big problem / a lot of.' },
  { id: 'c5', crit: 'GRA', text: 'Вставлены 1 Noun Clause, 1 Inversion или Participle и 1 Concession.' },
  { id: 'c6', crit: 'GRA', text: 'Проверил артикли (a/the), окончания -s и орфографию.' }
];

export const SKILL_PLAYBOOKS = {
  reading: [
    { tag: 'Тайминг 15 / 20 / 25', title: 'Никогда не дели 60 минут поровну', items: ['Passage 1 (15 мин): самый прямой — сразу сканируй по якорям (имена, даты, термины).', 'Passage 2 (20 мин): Matching Headings решай ПОСЛЕ остальных вопросов к этому пассажу.', 'Passage 3 (25 мин): читай абзацы вдумчиво, лови тон автора (merely, scarcely, arguably, ironically).'] },
    { tag: 'T/F/NG vs Y/N/NG', title: '3-шаговый тест против слива баллов', items: ['TRUE/YES: та же мысль, но перефразированная синонимами.', 'FALSE/NO: в тексте есть ПРЯМОЕ противоречие (можно ткнуть пальцем в строку).', 'NOT GIVEN: факта нет или добавили сравнение (cheaper, faster, first), которого нет в тексте.'] }
  ],
  listening: [
    { tag: 'Parts 1–2 (Цель 20/20)', title: 'Ловушка Self-Correction', items: ['Жди до конца фразы: спикер называет цену/дату и тут же правит себя ("Oh wait, actually...", "It used to be...").', 'Следи за лимитом слов (ONE WORD ONLY) и орфографией (accommodation, government, environment, Wednesday).'] },
    { tag: 'Parts 3–4', title: 'Перефраз и предсказание', items: ['В Part 3 точное слово из варианта A часто ловушка — слушай согласие ВТОРОГО студента.', 'За 30 сек до Part 4 подпиши часть речи в каждом пропуске и проверяй множественное число (-s).'] }
  ],
  speaking: [
    { tag: 'Part 2 (Cue Card)', title: 'Правило PPF на 2 минуты без пауз', items: ['Past (35 сек): как всё началось и предыстория.', 'Present (45 сек): детали, эмоции, почему это круто сейчас.', 'Future (35 сек): как это поможет дальше или что планируешь.'] },
    { tag: 'Part 3 (Band 7.5–8.5)', title: 'Живой ответ вместо эссе', items: ['Формула: Позиция ("Honestly, it cuts both ways...") → Причина ("mainly because...") → Контраст ("That said, for older generations...").', 'Замени "In my humble opinion / Firstly" на "To be completely honest / Off the top of my head / That said".'] }
  ]
};

export const INTERESTS = [
  { id: 'netflix', label: 'Netflix / HBO' },
  { id: 'anime', label: 'Аниме' },
  { id: 'movies', label: 'Фильмы' },
  { id: 'sports', label: 'Спорт' },
  { id: 'gaming', label: 'Игры & Tech' },
  { id: 'books', label: 'Книги' },
  { id: 'articles', label: 'Статьи & Эссе' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'podcasts', label: 'Подкасты' }
];

export const MEDIA_DB = [
  { id: 'n1', cat: 'netflix', plat: 'Netflix', skills: ['listening', 'speaking'], band: '7.5–8.5', title: 'Peaky Blinders', why: 'Мощная прокачка сложных британских акцентов. После Томми Шелби IELTS Listening кажется лёгкой прогулкой.', take: ['call the shots — принимать решения', 'on thin ice — на тонком льду'] },
  { id: 'n2', cat: 'netflix', plat: 'Netflix', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'Breaking Bad', why: 'Идеальный баланс разговорного американского и точной научной/жизненной лексики.', take: ['cross the line — перейти черту', 'take full responsibility — взять ответственность'] },
  { id: 'n3', cat: 'netflix', plat: 'Netflix', skills: ['speaking', 'writing'], band: '7.5–9.0', title: 'Better Call Saul', why: 'Юридические дебаты и филигранная аргументация — школа для Speaking Part 3 и Task 2.', take: ['bend the rules — обходить правила', 'make a compelling case — привести сильный аргумент'] },
  { id: 'n4', cat: 'netflix', plat: 'Netflix', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Black Mirror', why: 'Каждая серия — готовый банк аргументов для эссе про ИИ, соцсети и приватность.', take: ['unintended consequences — непредвиденные последствия', 'slippery slope — скользкая дорожка'] },
  { id: 'n5', cat: 'netflix', plat: 'Netflix', skills: ['listening', 'speaking'], band: '7.5–8.5', title: 'Mindhunter', why: 'Глубокие психологические интервью — крутая тренировка академической лексики.', take: ['underlying motive — скрытый мотив', 'draw a parallel — провести параллель'] },
  { id: 'n6', cat: 'netflix', plat: 'Netflix', skills: ['listening'], band: '7.5–9.0', title: 'The Crown', why: 'Эталонный классический британский и богатейший C1/C2 словарь политики.', take: ['uphold tradition — сохранять традицию', 'constitutional crisis — конституционный кризис'] },
  { id: 'n7', cat: 'netflix', plat: 'BBC', skills: ['listening'], band: '7.5–8.5', title: 'Sherlock (BBC)', why: 'Сверхбыстрая британская речь — после неё аудио IELTS Part 4 кажется замедленным.', take: ['jump to conclusions — делать поспешные выводы', 'plain sight — на самом виду'] },
  { id: 'n8', cat: 'netflix', plat: 'Apple TV+', skills: ['speaking', 'listening'], band: '6.5–8.0', title: 'Ted Lasso', why: 'Лучший сериал для естественного Speaking + идеальный контраст US и UK акцентов.', take: ['be on the same page — быть на одной волне', 'take it on the chin — стойко принять удар'] },
  { id: 'n9', cat: 'netflix', plat: 'HBO', skills: ['speaking', 'writing'], band: '8.0–9.0', title: 'Succession', why: 'Элитный C2 английский, переговоры, медиа и корпоративные конфликты.', take: ['read the room — чувствовать обстановку', 'leverage an advantage — использовать преимущество'] },
  { id: 'n10', cat: 'netflix', plat: 'Apple TV+', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Severance', why: 'Острая тема work-life balance и корпоративной культуры — хит в Task 2.', take: ['blur the boundary — размыть границу', 'mental compartmentalization — разделение сфер'] },
  { id: 'a1', cat: 'anime', plat: 'EN Dub', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Code Geass (English Dub)', why: 'Эталонный английский дубляж с лексикой политики, морали и стратегии.', take: ['justify the means — оправдывать средства', 'shift the balance of power — изменить баланс сил'] },
  { id: 'a2', cat: 'anime', plat: 'EN Dub', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'Death Note (English Dub)', why: 'Логика, дедукция и Conditionals в каждом диалоге L и Лайта.', take: ['draw a conclusion — сделать вывод', 'leap of logic — скачок в логике'] },
  { id: 'a3', cat: 'anime', plat: 'EN Dub', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Monster (English Dub)', why: 'Взрослый психологический триллер с размеренной чистой речью и моральными дилеммами.', take: ['moral compass — моральный компас', 'erode one\'s humanity — разрушать человечность'] },
  { id: 'a4', cat: 'anime', plat: 'EN Dub', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'Vinland Saga (English Dub)', why: 'Философские диалоги о насилии, мире и свободе — мощный словарь для эссе.', take: ['break the cycle — разорвать порочный круг', 'at any cost — любой ценой'] },
  { id: 'a5', cat: 'anime', plat: 'Netflix EN', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'Arcane (Original English)', why: 'Живая эмоциональная речь с разными акцентами и современными идиомами.', take: ['bridge the gap — сократить разрыв', 'tip the scales — перевесить чашу весов'] },
  { id: 'a6', cat: 'anime', plat: 'Netflix EN', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'Cyberpunk: Edgerunners (EN Dub)', why: 'Быстрый современный сленг + темы технологий и социального неравенства.', take: ['pay the price — заплатить цену', 'burn out — выгореть'] },
  { id: 'm1', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'The Social Network', why: 'Молниеносные диалоги — лучший тренажёр скорости слуха + словарь стартапов.', take: ['intellectual property — интеллектуальная собственность', 'gain traction — набирать обороты'] },
  { id: 'm2', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '7.5–8.5', title: 'Oppenheimer', why: 'Наука, этика и политика — 100% совпадение с серьёзными темами Listening Part 4.', take: ['ethical dilemma — этическая дилемма', 'point of no return — точка невозврата'] },
  { id: 'm3', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'The Big Short', why: 'Сложная экономика объяснена живым языком — словарь по финансам и кризисам.', take: ['systemic failure — системный сбой', 'turn a blind eye — закрывать глаза'] },
  { id: 'm4', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '6.5–8.0', title: 'Interstellar', why: 'Климат, ресурсы и наука — частые темы Reading Passage 3.', take: ['finite resources — ограниченные ресурсы', 'against all odds — вопреки всему'] },
  { id: 'm5', cat: 'movies', plat: 'Film', skills: ['speaking', 'listening'], band: '6.5–8.0', title: 'Moneyball', why: 'Аналитика, спорт и решения против системы — тонна живых фраз.', take: ['buck the trend — идти против тренда', 'undervalued asset — недооценённый ресурс'] },
  { id: 'm6', cat: 'movies', plat: 'Film', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Dune (Part One & Two)', why: 'Чёткая дикция, экология, политика и власть.', take: ['scarce resource — дефицитный ресурс', 'long-term vision — долгосрочное видение'] },
  { id: 'sp1', cat: 'sports', plat: 'YouTube', skills: ['listening', 'writing'], band: '6.5–8.0', title: 'Tifo Football / The Athletic', why: 'Аналитический британский с графиками — 1-в-1 под Listening Part 4 и Task 1.', take: ['marginal gains — небольшие решающие улучшения', 'outperform expectations — превзойти ожидания'] },
  { id: 'sp2', cat: 'sports', plat: 'Netflix', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'Formula 1: Drive to Survive', why: 'Микс британского, австралийского и европейского акцентов под давлением.', take: ['under immense pressure — под огромным давлением', 'pay off in the long run — окупиться в долгую'] },
  { id: 'sp3', cat: 'sports', plat: 'Netflix', skills: ['speaking', 'listening'], band: '7.0–8.0', title: 'The Last Dance', why: 'Мощный сторителлинг про дисциплину и лидерство — готовые примеры для Part 2.', take: ['relentless drive — неудержимое стремление', 'rise to the occasion — проявить себя'] },
  { id: 'sp4', cat: 'sports', plat: 'Prime Video', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'All or Nothing (Arsenal / Man City)', why: 'Реальная раздевалка, британский акцент тренеров без сценария.', take: ['bounce back — быстро оправиться', 'keep one\'s composure — сохранять хладнокровие'] },
  { id: 'g1', cat: 'gaming', plat: 'YouTube', skills: ['listening', 'writing'], band: '7.5–9.0', title: 'Jacob Geller (Video Essays)', why: 'Интеллектуальные видео-эссе про игры и архитектуру — уровень Band 8.5–9.0.', take: ['evoke a sense of — вызывать ощущение', 'subvert expectations — ломать ожидания'] },
  { id: 'g2', cat: 'gaming', plat: 'YouTube', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'MKBHD (Marques Brownlee)', why: 'Кристальный американский и идеальная структура аргументации.', take: ['diminishing returns — убывающая отдача', 'practical trade-off — практический компромисс'] },
  { id: 'g3', cat: 'gaming', plat: 'YouTube', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'ColdFusion', why: 'Документалки про Apple, Nvidia, ИИ и экономику — идеальный формат для Part 4.', take: ['disrupt an industry — перевернуть индустрию', 'at a breakneck pace — в бешеном темпе'] },
  { id: 'g4', cat: 'gaming', plat: 'YouTube', skills: ['listening'], band: '7.0–8.0', title: 'Game Maker\'s Toolkit (GMTK)', why: 'Чистейший британский разбор систем и дизайна.', take: ['core loop — базовый цикл', 'intuitive design — интуитивный дизайн'] },
  { id: 'b1', cat: 'books', plat: 'Book', skills: ['reading', 'writing', 'speaking'], band: '6.5–8.0', title: 'Atomic Habits — James Clear', why: 'Лёгкий старт чтения на английском + тонна идей для эссе про дисциплину.', take: ['compound effect — накопительный эффект', 'frictionless environment — среда без трения'] },
  { id: 'b2', cat: 'books', plat: 'Book', skills: ['reading', 'writing'], band: '7.5–9.0', title: 'Sapiens — Yuval Noah Harari', why: 'Язык и глубина абзацев 1-в-1 как IELTS Reading Passage 3.', take: ['cognitive revolution — когнитивная революция', 'collective fiction — коллективный миф'] },
  { id: 'b3', cat: 'books', plat: 'Book', skills: ['reading', 'writing'], band: '7.5–9.0', title: 'Thinking, Fast and Slow — Kahneman', why: 'Когнитивные искажения — из этой книги буквально берут темы для Reading.', take: ['cognitive bias — когнитивное искажение', 'jump to conclusions — поспешные выводы'] },
  { id: 'b4', cat: 'books', plat: 'Book', skills: ['reading', 'speaking'], band: '7.0–8.5', title: '1984 — George Orwell', why: 'Короткая классика, качающая понимание подтекста и словарь по Government & Privacy.', take: ['constant surveillance — постоянная слежка', 'distort the truth — искажать правду'] },
  { id: 'b5', cat: 'books', plat: 'Book', skills: ['reading', 'speaking'], band: '6.5–8.0', title: 'Project Hail Mary — Andy Weir', why: 'Динамичный сай-фай — читается запоем и разгоняет скорость Reading.', take: ['trial and error — метод проб и ошибок', 'viable solution — рабочее решение'] },
  { id: 'ar1', cat: 'articles', plat: 'Web', skills: ['reading', 'writing'], band: '7.5–9.0', title: 'Aeon Essays', why: 'Золотой стандарт для выхода на Reading 8.5+. Читай 1 эссе раз в 2 дня.', take: ['erode trust — подрывать доверие', 'empirical evidence — эмпирические данные'], url: 'https://aeon.co/essays' },
  { id: 'ar2', cat: 'articles', plat: 'Web', skills: ['reading', 'speaking'], band: '7.0–8.5', title: 'Psyche Guides', why: 'Короче и живее Aeon, но с сочным C1 словарём про психологию.', take: ['mental bandwidth — ментальный ресурс', 'cognitive overload — когнитивная перегрузка'], url: 'https://psyche.co/guides' },
  { id: 'ar3', cat: 'articles', plat: 'Web', skills: ['reading', 'writing'], band: '7.5–9.0', title: 'The Guardian Long Reads', why: 'Эталонная британская журналистика про климат, города и технологии.', take: ['stark contrast — резкий контраст', 'systemic issue — системная проблема'] },
  { id: 'ar4', cat: 'articles', plat: 'Web', skills: ['reading', 'writing'], band: '7.0–8.5', title: 'Wait But Why', why: 'Длинные умные статьи про ИИ и прокрастинацию живым языком.', take: ['instant gratification — мгновенное удовольствие', 'exponential growth — экспоненциальный рост'] },
  { id: 'y1', cat: 'youtube', plat: 'YouTube', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Veritasium', why: 'Научные расследования на 15–20 минут — тренажёр концентрации для Part 4.', take: ['counterintuitive — вопреки интуиции', 'underlying mechanism — скрытый механизм'] },
  { id: 'y2', cat: 'youtube', plat: 'YouTube', skills: ['listening', 'writing'], band: '6.5–8.0', title: 'Kurzgesagt – In a Nutshell', why: 'Кристальный голос диктора, плотный академический словарь.', take: ['existential threat — экзистенциальная угроза', 'unprecedented scale — беспрецедентный масштаб'] },
  { id: 'y3', cat: 'youtube', plat: 'YouTube', skills: ['listening', 'writing'], band: '7.0–8.5', title: 'Vox Explainers', why: 'Короткие разборы урбанистики, экономики и истории — клад для Task 1 & 2.', take: ['root cause — первопричина', 'ripple effect — эффект домино'] },
  { id: 'y4', cat: 'youtube', plat: 'YouTube', skills: ['listening', 'speaking'], band: '7.5–8.5', title: 'LEMMiNO', why: 'Атмосферные мини-документалки с чистым, спокойным языком.', take: ['shrouded in mystery — окутано тайной', 'compelling evidence — веские доказательства'] },
  { id: 'p1', cat: 'podcasts', plat: 'Podcast', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'TED Talks Daily', why: '10–15 минут в день, разные мировые акценты и актуальные темы экзамена.', take: ['rethink our approach — пересмотреть подход', 'tangible impact — ощутимый эффект'] },
  { id: 'p2', cat: 'podcasts', plat: 'BBC', skills: ['listening', 'speaking'], band: '6.5–8.0', title: 'BBC 6 Minute English', why: 'Быстрый утренний разогрев на британском с разбором 6 выражений.', take: ['strike a balance — найти баланс', 'food for thought — пища для размышлений'] },
  { id: 'p3', cat: 'podcasts', plat: 'Podcast', skills: ['listening', 'speaking'], band: '7.0–8.5', title: 'The Diary of a CEO (Clips)', why: 'Живой британский разговорный английский про карьеру и привычки.', take: ['move the needle — реально изменить ситуацию', 'non-negotiable — не подлежит обсуждению'] }
];
