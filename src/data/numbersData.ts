import { NumberItem } from '../types';

export const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(num: number): string {
  return num.toString().split('').map(d => ARABIC_DIGITS[parseInt(d, 10)] ?? d).join('');
}

const ONES_NAMES: { [key: number]: string } = {
  0: 'صِفْر',
  1: 'وَاحِد',
  2: 'اِثْنَان',
  3: 'ثَلَاثَة',
  4: 'أَرْبَعَة',
  5: 'خَمْسَة',
  6: 'سِتَّة',
  7: 'سَبْعَة',
  8: 'ثَمَانِيَة',
  9: 'تِسْعَة',
  10: 'عَشَرَة',
  11: 'أَحَدَ عَشَرَ',
  12: 'اِثْنَا عَشَرَ',
  13: 'ثَلَاثَةَ عَشَرَ',
  14: 'أَرْبَعَةَ عَشَرَ',
  15: 'خَمْسَةَ عَشَرَ',
  16: 'سِتَّةَ عَشَرَ',
  17: 'سَبْعَةَ عَشَرَ',
  18: 'ثَمَانِيَةَ عَشَرَ',
  19: 'تِسْعَةَ عَشَرَ',
  20: 'عِشْرُونَ',
};

const TENS_NAMES: { [key: number]: string } = {
  2: 'عِشْرُونَ',
  3: 'ثَلَاثُونَ',
  4: 'أَرْبَعُونَ',
  5: 'خَمْسُونَ',
  6: 'سِتُّونَ',
  7: 'سَبْعُونَ',
  8: 'ثَمَانُونَ',
  9: 'تِسْعُونَ',
  10: 'مِئَة',
};

export function getArabicNumberName(num: number): string {
  if (num in ONES_NAMES) {
    return ONES_NAMES[num];
  }
  if (num === 100) return 'مِئَة';

  const tens = Math.floor(num / 10);
  const ones = num % 10;

  if (ones === 0) {
    return TENS_NAMES[tens] || num.toString();
  }

  const onesWord = ONES_NAMES[ones];
  const tensWord = TENS_NAMES[tens];
  return `${onesWord} وَ${tensWord}`;
}

const VISUAL_ITEMS = [
  { emoji: '🍎', itemLabel: 'تفاحات لذيذة' },
  { emoji: '⭐', itemLabel: 'نجوم لامعة' },
  { emoji: '🐰', itemLabel: 'أرانب لطيفة' },
  { emoji: '🎈', itemLabel: 'بالونات ملونة' },
  { emoji: '🚗', itemLabel: 'سيارات صغيرة' },
  { emoji: '🐟', itemLabel: 'أسماك تسبح' },
  { emoji: '🍓', itemLabel: 'حبات فراولة' },
  { emoji: '🐥', itemLabel: 'كتاكيت صغيرة' },
  { emoji: '🌸', itemLabel: 'زهور جميلة' },
  { emoji: '🍊', itemLabel: 'برتقالات شهية' },
];

export function getNumberVisual(num: number) {
  const item = VISUAL_ITEMS[num % VISUAL_ITEMS.length];
  return item;
}

// Pre-generated curated numbers for levels 1 to 4
export const ALL_NUMBERS: NumberItem[] = Array.from({ length: 101 }, (_, i) => {
  let level: 1 | 2 | 3 | 4 = 1;
  if (i <= 10) level = 1;
  else if (i <= 20) level = 2;
  else if (i <= 50) level = 3;
  else level = 4;

  return {
    number: i,
    arabicNumeral: toArabicDigits(i),
    nameArabic: getArabicNumberName(i),
    counterVisual: getNumberVisual(i),
    level,
  };
});

export const NUMBERS_LEVEL_1 = ALL_NUMBERS.filter(n => n.level === 1); // 0-10
export const NUMBERS_LEVEL_2 = ALL_NUMBERS.filter(n => n.level === 2); // 11-20
export const NUMBERS_LEVEL_3 = ALL_NUMBERS.filter(n => n.level === 3); // 21-50
export const NUMBERS_LEVEL_4 = ALL_NUMBERS.filter(n => n.level === 4); // 51-100
