// src/data/workoutData.js
// ============================================
// برنامج التضخيم الكامل - 3 أسابيع دورة
// ============================================

export const COLORS = {
  bg: '#0b0b14',
  bgCard: '#13131f',
  bgCardLight: '#1a1a2e',
  primary: '#7c6bff',
  primaryLight: '#a78bfa',
  primaryDark: '#5b4de0',
  accent: '#ff6b9d',
  green: '#3ec97a',
  orange: '#f59e0b',
  red: '#e05252',
  blue: '#4a9eff',
  text: '#ffffff',
  textSub: '#9999bb',
  textMuted: '#555577',
  border: '#1e1e35',
  chestBack: '#e05252',
  arms: '#4a9eff',
  legsAbs: '#3ec97a',
};

// ============================================
// التمارين لكل نوع يوم
// ============================================
export const EXERCISES = {
  chest_back: [
    {
      id: 'cb1',
      name: 'Bench Press بالبار',
      nameAr: 'بنش برس',
      muscle: 'صدر',
      sets: 4,
      reps: '6-10',
      rest: 120,
      notes: 'ثبت الكتف للخلف، انزل ببطء وارفع بقوة. اهتم بـ Mind-Muscle Connection',
      tips: ['الكتف يلزق في المقعد', 'القبضة أعرض من الكتف', 'انزل لحد الصدر'],
      emoji: '🏋️',
    },
    {
      id: 'cb2',
      name: 'Incline Dumbbell Press',
      nameAr: 'بنش مائل دمبل',
      muscle: 'صدر علوي',
      sets: 3,
      reps: '8-12',
      rest: 90,
      notes: 'الميل 30-45 درجة، ركز على الجزء العلوي من الصدر',
      tips: ['الزاوية 30-45 درجة', 'لا تقفل الكوع', 'تحكم في النزول'],
      emoji: '💪',
    },
    {
      id: 'cb3',
      name: 'Chest Fly Machine',
      nameAr: 'فلاي صدر مكنة',
      muscle: 'صدر',
      sets: 3,
      reps: '10-15',
      rest: 60,
      notes: 'حركة busquets، لا تمد الذراع بالكامل، عصر الصدر في النهاية',
      tips: ['حافظ على إنحناءة بسيطة في الكوع', 'عصر الصدر في القمة'],
      emoji: '🦾',
    },
    {
      id: 'cb4',
      name: 'Lat Pulldown',
      nameAr: 'شد للأسفل',
      muscle: 'ظهر علوي',
      sets: 4,
      reps: '8-12',
      rest: 90,
      notes: 'اسحب بالكوع مش باليد، تخيل إن إيدك أجنحة',
      tips: ['اشحن الظهر قبل السحب', 'الكتف يرجع للخلف وتحت', 'متخدش وزن تعلاوه'],
      emoji: '⬇️',
    },
    {
      id: 'cb5',
      name: 'Barbell Bent Row',
      nameAr: 'سحب بار مائل',
      muscle: 'ظهر وسط',
      sets: 4,
      reps: '8-10',
      rest: 120,
      notes: 'ظهر مستقيم ومائل 45 درجة، اسحب للسرة، عصر الظهر',
      tips: ['الظهر مستقيم دايمًا', 'الذقن للأمام', 'اسحب للسرة مش للصدر'],
      emoji: '🔄',
    },
    {
      id: 'cb6',
      name: 'Seated Cable Row',
      nameAr: 'كابل رو قاعد',
      muscle: 'ظهر وسط',
      sets: 3,
      reps: '10-12',
      rest: 90,
      notes: 'اعصر عضلة الظهر في النهاية، لا تتأرجح',
      tips: ['الصدر ثابت', 'سحب للسرة', 'مدة الضغط ثانية'],
      emoji: '🎯',
    },
  ],

  arms: [
    {
      id: 'a1',
      name: 'Barbell Curl',
      nameAr: 'كيرل بالبار',
      muscle: 'بايسبس',
      sets: 4,
      reps: '8-12',
      rest: 90,
      notes: 'لا تستخدم الزخمة، ثبت الكوع، تحكم في النزول',
      tips: ['الكوع ثابت جنب الجسم', 'لا تتأرجح', 'نزول ببطء'],
      emoji: '💪',
    },
    {
      id: 'a2',
      name: 'Dumbbell Hammer Curl',
      nameAr: 'هامر كيرل',
      muscle: 'بايسبس + ساعد',
      sets: 3,
      reps: '10-12',
      rest: 60,
      notes: 'القبضة على الجانب، تمرين ممتاز للبايسبس الجانبي والساعد',
      tips: ['القبضة محايدة', 'ببطء في النزول'],
      emoji: '🔨',
    },
    {
      id: 'a3',
      name: 'Preacher Curl',
      nameAr: 'كيرل مسند',
      muscle: 'بايسبس',
      sets: 3,
      reps: '10-12',
      rest: 60,
      notes: 'على المسند، عزل كامل للبايسبس، تحكم في الحركة',
      tips: ['الذراع مسندة بالكامل', 'لا ترفع الكتف'],
      emoji: '🎯',
    },
    {
      id: 'a4',
      name: 'Triceps Pushdown',
      nameAr: 'ضغط ترايسبس',
      muscle: 'ترايسبس',
      sets: 4,
      reps: '10-15',
      rest: 60,
      notes: 'ثبت الكوع، حرك الساعد فقط، عصر الترايسبس في الأسفل',
      tips: ['الكوع ثابت وملاصق للجسم', 'عصر في الأسفل'],
      emoji: '⬇️',
    },
    {
      id: 'a5',
      name: 'Overhead Triceps Extension',
      nameAr: 'ترايسبس فوق الرأس',
      muscle: 'ترايسبس',
      sets: 3,
      reps: '10-12',
      rest: 90,
      notes: 'يمتد الرأس الطويل للترايسبس، تحكم في الحركة',
      tips: ['الكوع للأمام', 'لا تحرك الكتف'],
      emoji: '🔺',
    },
    {
      id: 'a6',
      name: 'Wrist Curl',
      nameAr: 'لف المعصم',
      muscle: 'ساعد',
      sets: 3,
      reps: '15-20',
      rest: 45,
      notes: 'للساعد، الذراع مسندة على الركبة، حركة المعصم فقط',
      tips: ['الذراع مسندة', 'حركة بطيئة'],
      emoji: '🌀',
    },
  ],

  legs_abs: [
    {
      id: 'la1',
      name: 'Squat',
      nameAr: 'سكوات',
      muscle: 'أرجل كاملة',
      sets: 4,
      reps: '6-10',
      rest: 180,
      notes: 'ملك التمارين! ظهر مستقيم، ركبة تتبع إصبع القدم، انزل حتى الفخذ موازي الأرض',
      tips: ['الكعب ثابت', 'الصدر للأعلى', 'الركبة تتبع إصبع القدم', 'لا تقرص الركبة للداخل'],
      emoji: '👑',
    },
    {
      id: 'la2',
      name: 'Leg Press',
      nameAr: 'ضغط رجل',
      muscle: 'أرجل',
      sets: 3,
      reps: '10-12',
      rest: 120,
      notes: 'لا تقفل الركبة، القدم في المنتصف للعضلة كاملة',
      tips: ['لا تقفل الركبة في القمة', 'الظهر ملاصق للمسند'],
      emoji: '🦵',
    },
    {
      id: 'la3',
      name: 'Leg Curl',
      nameAr: 'كيرل أرجل',
      muscle: 'خلفية الفخذ',
      sets: 3,
      reps: '10-15',
      rest: 90,
      notes: 'ركز على عضلة الخلفية (Hamstrings)، تحكم في النزول',
      tips: ['لا تستخدم الزخمة', 'نزول ببطء'],
      emoji: '🔄',
    },
    {
      id: 'la4',
      name: 'Calf Raise',
      nameAr: 'رفع ساق',
      muscle: 'ساق',
      sets: 4,
      reps: '15-20',
      rest: 60,
      notes: 'توقف لحظة في القمة، نزول كامل للتمدد',
      tips: ['وقوف كامل في القمة', 'نزول كامل في الأسفل'],
      emoji: '🦶',
    },
    {
      id: 'la5',
      name: 'Plank',
      nameAr: 'بلانك',
      muscle: 'بطن',
      sets: 3,
      reps: '30-60 ث',
      rest: 60,
      notes: 'الجسم في خط مستقيم، لا ترفع المؤخرة ولا تنزلها',
      tips: ['شد البطن', 'الجسم خط مستقيم', 'لا تحبس نفسك'],
      emoji: '🎯',
    },
    {
      id: 'la6',
      name: 'Cable Crunch',
      nameAr: 'كرانش كابل',
      muscle: 'بطن علوي',
      sets: 3,
      reps: '12-15',
      rest: 60,
      notes: 'انحنِ بالضهر مش بالورك، عصر البطن في الأسفل',
      tips: ['الحركة من الضهر', 'عصر البطن'],
      emoji: '💥',
    },
  ],
};

// ============================================
// دورة البرنامج 3 أسابيع
// ============================================
export const PROGRAM_CYCLE = [
  {
    week: 1,
    days: [
      { day: 1, type: 'chest_back', focus: 'بنش + ظهر',    color: COLORS.chestBack, emoji: '🏋️' },
      { day: 2, type: 'arms',       focus: 'دراع + ساعد',  color: COLORS.arms,      emoji: '💪' },
      { day: 3, type: 'legs_abs',   focus: 'رجل + بطن',    color: COLORS.legsAbs,   emoji: '🦵' },
      { day: 4, type: 'chest_back', focus: 'بنش + ظهر',    color: COLORS.chestBack, emoji: '🏋️' },
    ],
  },
  {
    week: 2,
    days: [
      { day: 1, type: 'arms',       focus: 'دراع + ساعد',  color: COLORS.arms,      emoji: '💪' },
      { day: 2, type: 'legs_abs',   focus: 'رجل + بطن',    color: COLORS.legsAbs,   emoji: '🦵' },
      { day: 3, type: 'chest_back', focus: 'بنش + ظهر',    color: COLORS.chestBack, emoji: '🏋️' },
      { day: 4, type: 'arms',       focus: 'دراع + ساعد',  color: COLORS.arms,      emoji: '💪' },
    ],
  },
  {
    week: 3,
    days: [
      { day: 1, type: 'legs_abs',   focus: 'رجل + بطن',    color: COLORS.legsAbs,   emoji: '🦵' },
      { day: 2, type: 'chest_back', focus: 'بنش + ظهر',    color: COLORS.chestBack, emoji: '🏋️' },
      { day: 3, type: 'arms',       focus: 'دراع + ساعد',  color: COLORS.arms,      emoji: '💪' },
      { day: 4, type: 'legs_abs',   focus: 'رجل + بطن',    color: COLORS.legsAbs,   emoji: '🦵' },
    ],
  },
];

// الحصول على تمرين اليوم الحالي
export const getTodayWorkout = (startDate) => {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const totalDays = PROGRAM_CYCLE.reduce((s, w) => s + w.days.length, 0); // 12
  const pos = diffDays % totalDays;

  let count = 0;
  for (let w = 0; w < PROGRAM_CYCLE.length; w++) {
    for (let d = 0; d < PROGRAM_CYCLE[w].days.length; d++) {
      if (count === pos) {
        return {
          ...PROGRAM_CYCLE[w].days[d],
          week: PROGRAM_CYCLE[w].week,
          exercises: EXERCISES[PROGRAM_CYCLE[w].days[d].type],
          cycleDay: pos + 1,
          totalDays,
        };
      }
      count++;
    }
  }
  return null;
};

export const getTypeColor = (type) => {
  switch (type) {
    case 'chest_back': return COLORS.chestBack;
    case 'arms':       return COLORS.arms;
    case 'legs_abs':   return COLORS.legsAbs;
    default:           return COLORS.primary;
  }
};
