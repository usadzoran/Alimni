import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronLeft, Play, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { ChildProfile } from '../../types';
import { audioService } from '../../services/audioService';

interface StoriesSongsHubProps {
  child: ChildProfile;
  onBackToHome: () => void;
}

type Story = { id: string; title: string; emoji: string; color: string; lines: string[]; question: string; options: string[]; answer: string };
type Song = { id: string; title: string; emoji: string; color: string; lyrics: string[]; action: string };

const STORIES: Story[] = [
  { id: 'kind-rabbit', title: 'الأرنب الصغير المتعاون', emoji: '🐰', color: 'from-pink-500 to-rose-500', lines: ['كان أرنب صغير يحب القفز واللعب.', 'وجد سلحفاة تحمل سلة ثقيلة، فساعدها بابتسامة.', 'شكرت السلحفاة صديقها، وتعلما أن التعاون يجعل العمل أسهل.'], question: 'ماذا فعل الأرنب؟', options: ['ساعد السلحفاة', 'نام تحت الشجرة', 'أخفى السلة'], answer: 'ساعد السلحفاة' },
  { id: 'star-trip', title: 'رحلة النجمة الصغيرة', emoji: '⭐', color: 'from-amber-500 to-orange-500', lines: ['نظرت نجمة صغيرة إلى الأرض من السماء.', 'رأت طفلاً يتعلم حرفاً جديداً، فأرسلت له ضوءاً لامعاً.', 'فرح الطفل وتذكر أن كل خطوة صغيرة تقوده إلى النجاح.'], question: 'ماذا أرسلت النجمة؟', options: ['ضوءاً لامعاً', 'هدية كبيرة', 'طائرة ورقية'], answer: 'ضوءاً لامعاً' },
  { id: 'cloud-rain', title: 'سحابة تحمل الخير', emoji: '☁️', color: 'from-sky-500 to-blue-600', lines: ['كانت سحابة بيضاء تعبر السماء بهدوء.', 'سمعت الزهور تقول: نحتاج إلى الماء.', 'أمطرت السحابة، فكبرت الزهور وشكرتها.'], question: 'ماذا احتاجت الزهور؟', options: ['الماء', 'الطعام', 'الكتب'], answer: 'الماء' },
];

const SONGS: Song[] = [
  { id: 'letters-song', title: 'أنشودة الحروف', emoji: '🔤', color: 'from-blue-500 to-indigo-600', lyrics: ['ألفٌ أرنبٌ يقفزُ مرحاً', 'باءٌ بابٌ نفتحُهُ فرحاً', 'حرفي وصوتي، ألعبُ وأتعلمُ', 'وبالعلمِ كلَّ يومٍ أتقدمُ'], action: 'غنِّ معنا: الحروف أصدقاء!' },
  { id: 'numbers-song', title: 'أنشودة الأرقام', emoji: '🔢', color: 'from-emerald-500 to-teal-600', lyrics: ['واحد، اثنان، هيا نعدُّ', 'ثلاثة، أربعة، نضحكُ ونشدُّ', 'خمسة نجومٍ فوقَ السماء', 'نتعلمُ الأرقامَ في كلِّ مساء'], action: 'صفق مع الإيقاع وعدّ معنا!' },
  { id: 'morning-song', title: 'أنشودة صباح النشاط', emoji: '🌞', color: 'from-yellow-500 to-orange-500', lyrics: ['صباح الخير يا أصدقاء', 'نبدأ يومنا بالضياء', 'نتعلم، نلعب، نبتسم', 'وبالخير دائماً نلتزم'], action: 'قل معنا: صباح الخير!' },
];

export const StoriesSongsHub: React.FC<StoriesSongsHubProps> = ({ child, onBackToHome }) => {
  const [activeSection, setActiveSection] = useState<'stories' | 'songs'>('stories');
  const [story, setStory] = useState<Story | null>(null);
  const [storyStep, setStoryStep] = useState(0);
  const [storyAnswer, setStoryAnswer] = useState<string | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [songLine, setSongLine] = useState(0);

  const speakStoryLine = (text: string) => {
    audioService.playTap();
    audioService.speakArabic(text, { rate: 0.78, pitch: 1.12 });
  };

  const openStory = (selected: Story) => {
    setStory(selected);
    setStoryStep(0);
    setStoryAnswer(null);
    setSong(null);
    speakStoryLine(selected.lines[0]);
  };

  const chooseStoryAnswer = (answer: string) => {
    if (!story || storyAnswer) return;
    setStoryAnswer(answer);
    if (answer === story.answer) {
      audioService.playCorrect();
      audioService.playStar();
      audioService.speakArabic(`أحسنت يا ${child.name}! إجابة صحيحة`);
    } else {
      audioService.playWrong();
      audioService.speakArabic('فكر في أحداث القصة وحاول مرة أخرى');
    }
  };

  const openSong = (selected: Song) => {
    setSong(selected);
    setSongLine(0);
    setStory(null);
    speakStoryLine(selected.lyrics[0]);
  };

  const playNextSongLine = () => {
    if (!song) return;
    const next = (songLine + 1) % song.lyrics.length;
    setSongLine(next);
    speakStoryLine(song.lyrics[next]);
  };

  if (story) {
    const line = story.lines[storyStep];
    return <div className="space-y-6 pb-12">
      <button onClick={() => setStory(null)} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-4 w-4" /> كل القصص</button>
      <section className={`rounded-[2rem] bg-gradient-to-br ${story.color} p-6 text-white shadow-lg md:p-10`}>
        <div className="flex flex-col items-center gap-4 text-center"><span className="text-7xl">{story.emoji}</span><p className="text-xs font-bold text-white/80">قصة تفاعلية قصيرة</p><h2 className="text-3xl font-black">{story.title}</h2></div>
      </section>
      <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm md:p-10">
        <div className="mb-6 flex justify-center gap-2">{story.lines.map((_, index) => <span key={index} className={`h-2 w-12 rounded-full ${index <= storyStep ? 'bg-rose-500' : 'bg-slate-200'}`} />)}</div>
        <p className="min-h-24 text-2xl font-black leading-relaxed text-slate-800">{line}</p>
        <button onClick={() => speakStoryLine(line)} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-5 py-3 text-sm font-black text-rose-700"><Volume2 className="h-5 w-5" /> استمع للقصة</button>
        {storyStep < story.lines.length - 1 ? <button onClick={() => { const next = storyStep + 1; setStoryStep(next); speakStoryLine(story.lines[next]); }} className="mx-auto mt-5 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">تابع القصة <ChevronLeft className="h-4 w-4" /></button> : <div className="mt-8 border-t border-slate-100 pt-6"><h3 className="text-xl font-black text-slate-900">سؤال القصة</h3><p className="mt-2 font-bold text-slate-600">{story.question}</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{story.options.map((option) => <button key={option} onClick={() => chooseStoryAnswer(option)} className={`rounded-2xl border-2 p-3 text-sm font-black transition ${storyAnswer === option ? option === story.answer ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-rose-300'}`}>{option}</button>)}</div>{storyAnswer && <p className={`mt-4 flex items-center justify-center gap-2 font-black ${storyAnswer === story.answer ? 'text-emerald-700' : 'text-rose-700'}`}>{storyAnswer === story.answer ? <CheckCircle2 className="h-5 w-5" /> : 'حاول مرة أخرى مع الاستماع للقصة'}</p>}</div>}
      </div>
    </div>;
  }

  if (song) {
    const lyric = song.lyrics[songLine];
    return <div className="space-y-6 pb-12">
      <button onClick={() => setSong(null)} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-4 w-4" /> كل الأناشيد</button>
      <section className={`rounded-[2rem] bg-gradient-to-br ${song.color} p-6 text-white shadow-lg md:p-10`}><div className="text-center"><span className="text-7xl">{song.emoji}</span><p className="mt-3 text-xs font-bold text-white/80">أنشودة تفاعلية</p><h2 className="mt-1 text-3xl font-black">{song.title}</h2></div></section>
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-sm md:p-10"><p className="text-3xl font-black leading-relaxed text-slate-800">{lyric}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={() => speakStoryLine(lyric)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700"><Volume2 className="h-5 w-5" /> استمع</button><button onClick={playNextSongLine} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white"><Play className="h-5 w-5" /> السطر التالي</button></div><p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-black text-amber-800">👏 {song.action}</p><div className="mt-6 flex justify-center gap-2">{song.lyrics.map((_, index) => <button aria-label={`السطر ${index + 1}`} key={index} onClick={() => { setSongLine(index); speakStoryLine(song.lyrics[index]); }} className={`h-3 w-3 rounded-full ${index === songLine ? 'bg-emerald-600' : 'bg-slate-200'}`} />)}</div></div>
    </div>;
  }

  return <div className="space-y-6 pb-12">
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 p-6 text-white shadow-lg md:p-10"><div className="absolute -left-8 -top-8 text-9xl opacity-15">📖</div><div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><Sparkles className="h-4 w-4" /> عالم الحكاية واللحن</div><h2 className="mt-4 text-3xl font-black md:text-5xl">نقرأ، نغني، ونتعلم!</h2><p className="mt-3 max-w-xl text-sm leading-7 text-orange-50 md:text-base">قصص قصيرة بصوت واضح وأناشيد مرحة تساعد الطفل على تنمية الخيال وتثبيت الحروف والأرقام.</p></div><div className="text-7xl">🎶</div></div></section>
    <div className="flex flex-wrap gap-2"><button onClick={() => setActiveSection('stories')} className={`rounded-2xl px-5 py-3 text-sm font-black ${activeSection === 'stories' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 shadow-sm'}`}>📖 القصص القصيرة</button><button onClick={() => setActiveSection('songs')} className={`rounded-2xl px-5 py-3 text-sm font-black ${activeSection === 'songs' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 shadow-sm'}`}>🎶 الأناشيد التفاعلية</button><button onClick={onBackToHome} className="mr-auto inline-flex items-center gap-1 rounded-2xl px-4 py-3 text-xs font-bold text-slate-500 hover:bg-white">العودة <ArrowLeft className="h-4 w-4" /></button></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(activeSection === 'stories' ? STORIES : SONGS).map((item) => <button key={item.id} onClick={() => activeSection === 'stories' ? openStory(item as Story) : openSong(item as Song)} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-right shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className={`bg-gradient-to-br ${item.color} p-6 text-center text-white`}><span className="text-6xl transition group-hover:scale-110 inline-block">{item.emoji}</span></div><div className="p-5"><h3 className="text-xl font-black text-slate-900">{item.title}</h3><p className="mt-2 text-sm text-slate-500">{activeSection === 'stories' ? 'اقرأ واستمع ثم أجب عن سؤال القصة' : 'استمع إلى كل سطر وردده مع الإيقاع'}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-rose-700">ابدأ الآن <ArrowLeft className="h-4 w-4" /></span></div></button>)}</div>
  </div>;
};
