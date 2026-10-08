export interface ExerciseQuestion {
  prompt: string;
  options: string[];
  answer: number;
}

export interface AgeDifficultyProfile {
  age: number;
  arabicChallenge: string;
  arabicExercises: string;
  arabicSessionSize: number;
  mathChallenge: string;
  mathExercises: string;
  mathSessionSize: number;
  englishFocus: string;
  lessonLoad: string;
  englishSessionSize: number;
  sampleArabicQuestion: string;
  arabicQuestions: ExerciseQuestion[];
  mathQuestions: ExerciseQuestion[];
  englishQuestions: ExerciseQuestion[];
}

export const AGE_PROFILES: AgeDifficultyProfile[] = [
  {
    age: 5,
    arabicChallenge: 'تمييز الحروف وأشكالها وحركاتها، قراءة كلمات قصيرة مشكولة، ترتيب كلمات قليلة، والإجابة عن أسئلة فهم مباشرة.',
    arabicExercises: '٥–٦ أسئلة عربية قصيرة في الجولة.',
    arabicSessionSize: 5,
    mathChallenge: 'الأعداد والكميات حتى ٢٠، جمع وطرح محسوسان، مقارنة وأنماط بسيطة.',
    mathExercises: '٣–٤ مسائل مصورة في الجولة.',
    mathSessionSize: 3,
    englishFocus: 'تأسيس هادئ بالحروف الكبيرة والصغيرة، أصوات أولية، أرقام ٠–١٠ وكلمات مصورة مألوفة.',
    lessonLoad: '٣ أسئلة إنجليزية سهلة في الجولة، دون قواعد أو قراءة طويلة.',
    englishSessionSize: 3,
    sampleArabicQuestion: 'اقرأ «سَمَكَةٌ» ثم اختر الحرف الذي تبدأ به الكلمة.',
    arabicQuestions: [
      { prompt: 'أي كلمة تبدأ بحرف «س»؟', options: ['سَمَكٌ', 'قَمَرٌ', 'بَابٌ'], answer: 0 },
      { prompt: 'ما الحركة على حرف الباء في «بُرْتُقَال»؟', options: ['ضمة', 'فتحة', 'كسرة'], answer: 0 },
      { prompt: 'اختر كلمة أولها حرف «م».', options: ['مَوْزٌ', 'وَرْدٌ', 'بَيْتٌ'], answer: 0 },
      { prompt: 'ما الحرف الأول في كلمة «قَلَمٌ»؟', options: ['ق', 'ل', 'م'], answer: 0 },
      { prompt: 'أي كلمة فيها مدّ بالألف؟', options: ['بَابٌ', 'بَيْتٌ', 'بِنْتٌ'], answer: 0 },
      { prompt: 'أي مقطع فيه كسرة؟', options: ['بِ', 'بَ', 'بُ'], answer: 0 },
      { prompt: 'أكمل كلمة «بَا...»: أي حرف يجعلها «بَاب»؟', options: ['ب', 'م', 'ت'], answer: 0 },
      { prompt: 'أي كلمة تنتهي بتاء مربوطة؟', options: ['مَدْرَسَةٌ', 'قَلَمٌ', 'بَابٌ'], answer: 0 },
      { prompt: 'ما الحرف الذي يأتي بعد «ا»؟', options: ['ب', 'ت', 'ج'], answer: 0 },
      { prompt: 'اختر كلمة تبدأ بحرف «ت».', options: ['تُفَّاحٌ', 'قَمَرٌ', 'مَوْزٌ'], answer: 0 },
      { prompt: 'أي كلمة يظهر فيها حرف «م» في الوسط؟', options: ['جَمَلٌ', 'مَوْزٌ', 'بَابٌ'], answer: 0 },
      { prompt: 'أي صورة تناسب كلمة «بَاب»؟', options: ['🚪', '🌙', '🐟'], answer: 0 },
    ],
    mathQuestions: [
      { prompt: 'معك ٣ تفاحات وأضفت ٢. كم تفاحة أصبحت لديك؟', options: ['٥', '٤', '٦'], answer: 0 },
      { prompt: 'كان لديك ٦ مكعبات وأزلت ٢. كم بقي؟', options: ['٤', '٣', '٥'], answer: 0 },
      { prompt: 'ما العدد الذي يأتي بعد ٧؟', options: ['٨', '٦', '٩'], answer: 0 },
      { prompt: 'أي العددين أكبر؟', options: ['٨', '٥', 'متساويان'], answer: 0 },
      { prompt: 'في السلة ٤ كرات حمراء و١ زرقاء. كم كرة فيها؟', options: ['٥', '٣', '٦'], answer: 0 },
      { prompt: 'أكمل النمط: ٢، ٤، ٦، ...', options: ['٨', '٧', '٩'], answer: 0 },
      { prompt: 'عدّ النجوم: ⭐ ⭐ ⭐ ⭐ ⭐', options: ['٥', '٤', '٦'], answer: 0 },
      { prompt: 'أي شكل له ثلاثة أضلاع؟', options: ['مثلث', 'دائرة', 'مربع'], answer: 0 },
      { prompt: 'ما العدد الذي يسبق ١٠؟', options: ['٩', '١١', '٨'], answer: 0 },
      { prompt: 'لدى ليلى ٣ مكعبات، وأعطاها أخوها ٣ أخرى. كم أصبح معها؟', options: ['٦', '٥', '٧'], answer: 0 },
    ],
    englishQuestions: [
      { prompt: 'Which one is the letter A?', options: ['A', 'B', 'T'], answer: 0 },
      { prompt: 'Match the big letter B with the small letter.', options: ['b', 'd', 'p'], answer: 0 },
      { prompt: 'Count the stars: ⭐ ⭐ ⭐', options: ['2', '3', '5'], answer: 1 },
      { prompt: 'Which word starts with the sound /b/?', options: ['ball', 'cat', 'sun'], answer: 0 },
      { prompt: 'Match the number word “two”.', options: ['2', '4', '5'], answer: 0 },
      { prompt: 'Which word names this animal? 🐱', options: ['cat', 'pen', 'red'], answer: 0 },
      { prompt: 'Which word is a color?', options: ['red', 'dog', 'bag'], answer: 0 },
      { prompt: 'Complete the letters: A, B, ...', options: ['C', 'E', 'G'], answer: 0 },
    ],
  },
  {
    age: 6,
    arabicChallenge: 'قراءة جمل مشكولة، إكمال حروف ناقصة، ترتيب الكلمات، والبحث عن معلومة في نص قصير.',
    arabicExercises: '٧–٨ أسئلة عربية في الجولة، تشمل قراءة وفهمًا وإملاءً وتركيب كلمات.',
    arabicSessionSize: 7,
    mathChallenge: 'العد حتى ٥٠، الجمع والطرح ضمن ٢٠، الآحاد والعشرات، وأنماط ومسائل لفظية من خطوة.',
    mathExercises: '٥–٦ مسائل في الجولة، من الحساب المباشر إلى المسألة المصورة.',
    mathSessionSize: 5,
    englishFocus: 'مراجعة A–Z كبيرًا وصغيرًا وأصوات الحروف، الأرقام ٠–٢٠ وكلمات قصيرة مثل sun وcat.',
    lessonLoad: '٤ أسئلة إنجليزية قصيرة في الجولة: حرف أو صوت أو رقم أو كلمة مصورة، دون قواعد متقدمة.',
    englishSessionSize: 4,
    sampleArabicQuestion: 'اقرأ «ذَهَبَ سامرٌ إلى الحديقة» ثم أجب: أين ذهب سامر؟',
    arabicQuestions: [
      { prompt: 'أكمل الكلمة: مَكْتَـ...ة', options: ['ب', 'س', 'ر'], answer: 0 },
      { prompt: 'رتّب الكلمات: «في الحديقة / لعبَ / سامرٌ».', options: ['لعبَ سامرٌ في الحديقة', 'في لعبَ سامرٌ الحديقة', 'الحديقة سامرٌ لعبَ في'], answer: 0 },
      { prompt: 'قرأَت ليلى قصةً ثم حكتها لأختها. ماذا قرأت ليلى؟', options: ['قصةً', 'رسالةً', 'خريطةً'], answer: 0 },
      { prompt: 'أي كلمة تحتوي على مدّ بالألف؟', options: ['كِتَابٌ', 'قَلَمٌ', 'سَمَكٌ'], answer: 0 },
      { prompt: 'اختر الكلمة المشكولة بطريقة صحيحة.', options: ['ذَهَبَ', 'ذَهِبَ', 'ذَهَبُ'], answer: 0 },
      { prompt: 'أي كلمة تبدأ بحرف «ش»؟', options: ['شَمْسٌ', 'قَمَرٌ', 'وَرْدٌ'], answer: 0 },
      { prompt: 'ما الحرف الذي يأتي بعد «ب» في ترتيب الحروف؟', options: ['ت', 'ا', 'ر'], answer: 0 },
      { prompt: 'أي كلمة فيها حرف «س» في آخرها؟', options: ['شَمْسٌ', 'سَمَكٌ', 'سُكَّرٌ'], answer: 0 },
      { prompt: 'جلس عمر في الحديقة وقرأ كتابًا. أين جلس عمر؟', options: ['في الحديقة', 'في المطبخ', 'في الحافلة'], answer: 0 },
      { prompt: 'اختر الكتابة الصحيحة لكلمة «مدرسة».', options: ['مَدْرَسَة', 'مَذْرَسَة', 'مَدْرَصَة'], answer: 0 },
      { prompt: 'ما عكس كلمة «سريع»؟', options: ['بطيء', 'قريب', 'طويل'], answer: 0 },
      { prompt: 'ما الحركة على حرف الباء في «بِسْمَة»؟', options: ['كسرة', 'فتحة', 'ضمة'], answer: 0 },
    ],
    mathQuestions: [
      { prompt: 'احسب: ٨ + ٧ = ؟', options: ['١٥', '١٤', '١٦'], answer: 0 },
      { prompt: 'احسب: ١٥ − ٦ = ؟', options: ['٩', '٨', '١٠'], answer: 0 },
      { prompt: 'ما العدد الذي يأتي بعد ٢٩؟', options: ['٣٠', '٢٨', '٣٩'], answer: 0 },
      { prompt: 'أي العددين أكبر؟', options: ['٤٣', '٣٤', 'متساويان'], answer: 0 },
      { prompt: 'في العدد ٢٦، كم عشرة وكم آحاد؟', options: ['عشرتان و٦ آحاد', '٦ عشرات وآحادان', 'عشرتان و٥ آحاد'], answer: 0 },
      { prompt: 'لدى سارة ٦ أقلام، وأخذت ٥ أخرى. كم قلمًا لديها؟', options: ['١١', '١٠', '١٢'], answer: 0 },
      { prompt: 'احسب: ٢٠ − ٨ = ؟', options: ['١٢', '١١', '١٣'], answer: 0 },
      { prompt: 'أكمل النمط: ٥، ١٠، ١٥، ...', options: ['٢٠', '١٨', '٢٥'], answer: 0 },
      { prompt: 'أي العددين أصغر؟', options: ['١٦', '١٨', 'كلاهما متساويان'], answer: 0 },
      { prompt: 'أكمل: ١٢، ١٤، ١٦، ...', options: ['١٨', '١٧', '٢٠'], answer: 0 },
    ],
    englishQuestions: [
      { prompt: 'Which picture word starts with the sound /s/?', options: ['sun', 'cat', 'ball'], answer: 0 },
      { prompt: 'What number comes after 9?', options: ['8', '10', '12'], answer: 1 },
      { prompt: 'Choose the small letter for M.', options: ['m', 'n', 'w'], answer: 0 },
      { prompt: 'Match the number word “five”.', options: ['5', '7', '9'], answer: 0 },
      { prompt: 'Which letter starts the word “dog”?', options: ['D', 'B', 'S'], answer: 0 },
      { prompt: 'Which one is an animal?', options: ['cat', 'pen', 'blue'], answer: 0 },
      { prompt: 'Choose a greeting.', options: ['Hello', 'Goodbye', 'Red'], answer: 0 },
      { prompt: 'How many dots? ● ● ● ●', options: ['3', '4', '5'], answer: 1 },
    ],
  },
  {
    age: 7,
    arabicChallenge: 'قراءة فقرة قصيرة، فهم السبب والنتيجة والاستدلال من النص، إملاء واختيار كتابة صحيحة، وتكوين جملة.',
    arabicExercises: '٨–١٠ أسئلة عربية في الجولة، مع تحدٍ مركب يمكن حله على مراحل دون مؤقت إلزامي.',
    arabicSessionSize: 9,
    mathChallenge: 'جمع وطرح أكبر، القيمة المكانية، الأنماط، ومسائل لفظية من خطوتين بحسب الاستعداد.',
    mathExercises: '٦–٨ مسائل في الجولة، بينها مسألة لفظية تحتاج خطوتين.',
    mathSessionSize: 7,
    englishFocus: 'تبقى الإنجليزية في المستوى الأول: الحروف والأصوات والأرقام ٠–٢٠ ومفردات وعبارات قصيرة جدًا.',
    lessonLoad: '٥ أسئلة إنجليزية سهلة في الجولة؛ لا قواعد متقدمة ولا نصوص طويلة.',
    englishSessionSize: 5,
    sampleArabicQuestion: 'اقرأ فقرة قصيرة ثم أجب عن سؤال «لماذا؟» واستدل من النص.',
    arabicQuestions: [
      { prompt: 'زرعت مريم بذرتين وسقتهما كل يوم. بعد أيام ظهرت ورقة خضراء. ما الذي ساعد النبتة على النمو؟', options: ['الماء والعناية', 'اللعبة', 'الصندوق'], answer: 0 },
      { prompt: 'اختر الكلمة المكتوبة كتابة صحيحة.', options: ['مَدْرَسَةٌ', 'مَذْرَسَةٌ', 'مَدْرَسَه'], answer: 0 },
      { prompt: 'رتّب لتكوين جملة: «إلى المكتبة / بعد الدرس / ذهب / عمر».', options: ['ذهب عمر إلى المكتبة بعد الدرس', 'إلى عمر بعد المكتبة ذهب الدرس', 'بعد المكتبة ذهب الدرس عمر إلى'], answer: 0 },
      { prompt: 'أغلقت سلمى النافذة عندما اشتد المطر. لماذا أغلقتها؟', options: ['لتمنع دخول المطر', 'لتقرأ كتابًا', 'لتسقي الزهرة'], answer: 0 },
      { prompt: 'اختر جملة تنتهي بعلامة استفهام.', options: ['أين وضعت حقيبتي؟', 'وضعت حقيبتي هنا.', 'يا لها من حقيبة جميلة!'], answer: 0 },
      { prompt: 'ما جمع كلمة «كتاب»؟', options: ['كُتُب', 'كاتب', 'مكتبة'], answer: 0 },
      { prompt: 'أي كلمة تعني عكس «ثقيل»؟', options: ['خفيف', 'واسع', 'بعيد'], answer: 0 },
      { prompt: 'اقرأ: «حمل فهد مظلته وخرج، ثم بدأ المطر». ماذا حمل فهد؟', options: ['مظلته', 'كرة', 'كتابًا'], answer: 0 },
      { prompt: 'اختر الكلمة التي تبدأ بهمزة قطع.', options: ['أَسَد', 'بَيْت', 'قَلَم'], answer: 0 },
      { prompt: 'في قصة، نام الطفل بعد أن أنهى قراءة كتابه. ما الحدث الذي وقع أولًا؟', options: ['أنهى قراءة الكتاب', 'استيقظ صباحًا', 'ذهب إلى المدرسة'], answer: 0 },
      { prompt: 'أي كلمة تحتوي على مدّ بالواو؟', options: ['نُور', 'بَاب', 'فِيل'], answer: 0 },
      { prompt: 'اختر جملة مرتبة ترتيبًا صحيحًا.', options: ['عادَ الطفلُ إلى البيتِ', 'إلى عاد الطفل البيت', 'البيت عاد إلى الطفل'], answer: 0 },
    ],
    mathQuestions: [
      { prompt: 'احسب: ٢٧ + ١٥ = ؟', options: ['٤٢', '٣٢', '٤١'], answer: 0 },
      { prompt: 'احسب: ٥٤ − ٢٢ = ؟', options: ['٣٢', '٣١', '٣٤'], answer: 0 },
      { prompt: 'معك ١٢ تفاحة، أضفت ٨ ثم أعطيت ٥. كم بقي؟', options: ['١٥', '١٤', '٢٠'], answer: 0 },
      { prompt: 'في العدد ٦٣، ما قيمة الرقم ٦؟', options: ['٦ عشرات', '٦ آحاد', '٣ عشرات'], answer: 0 },
      { prompt: 'أي العددين أكبر؟', options: ['٣٨', '٢٩', 'متساويان'], answer: 0 },
      { prompt: 'أكمل النمط: ٣، ٦، ١٢، ٢٤، ...', options: ['٤٨', '٣٦', '٣٠'], answer: 0 },
      { prompt: 'احسب: ١٠٠ − ٣٠ = ؟', options: ['٧٠', '٨٠', '٦٠'], answer: 0 },
      { prompt: 'في الصف ١٨ طفلًا، منهم ٩ بنات. كم طفلًا ليسوا بنات؟', options: ['٩', '٨', '١٠'], answer: 0 },
      { prompt: 'احسب: ٣٨ + ٢٧ = ؟', options: ['٦٥', '٥٥', '٦٤'], answer: 0 },
      { prompt: 'احسب: ٦٢ − ٢٨ = ؟', options: ['٣٤', '٣٦', '٤٤'], answer: 0 },
    ],
    englishQuestions: [
      { prompt: 'Which letter starts the word “cat”?', options: ['C', 'M', 'S'], answer: 0 },
      { prompt: 'Match the number word “seven”.', options: ['5', '7', '9'], answer: 1 },
      { prompt: 'Which sentence matches the picture? 🐱', options: ['I see a cat.', 'I see a ball.', 'I see a sun.'], answer: 0 },
      { prompt: 'What number comes after 14?', options: ['13', '15', '17'], answer: 1 },
      { prompt: 'Which letter makes the first sound in “bag”?', options: ['B', 'M', 'T'], answer: 0 },
      { prompt: 'Choose the word for the color yellow.', options: ['yellow', 'dog', 'book'], answer: 0 },
      { prompt: 'Which word matches this picture? 🍎', options: ['apple', 'ball', 'sun'], answer: 0 },
      { prompt: 'Choose the small letter for G.', options: ['g', 'q', 'p'], answer: 0 },
    ],
  },
];
