import React, { useState } from 'react';
import { User, Plus, Check, X, Sparkles } from 'lucide-react';
import { ChildProfile, AgeGroup } from '../../types';
import { storageService } from '../../services/storageService';
import { audioService } from '../../services/audioService';

interface ChildProfilePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChildId?: string;
  onSelectChild: (childId: string) => void;
}

const AVATAR_OPTIONS = ['🐰', '🦁', '🐻', '🐱', '🦒', '🐒', '🐼', '🦊', '🐨', '🐯'];

export const ChildProfilePickerModal: React.FC<ChildProfilePickerModalProps> = ({
  isOpen,
  onClose,
  activeChildId,
  onSelectChild,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<AgeGroup>('3-4');
  const [newAvatar, setNewAvatar] = useState('🐰');

  if (!isOpen) return null;

  const children = storageService.getChildren();

  const handleSelect = (id: string) => {
    audioService.playTap();
    onSelectChild(id);
    onClose();
  };

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    audioService.playTap();
    const created = storageService.addChild(newName.trim(), newAge, newAvatar);
    audioService.playStar();
    audioService.speakArabic(`أهلاً بك يا بطلنا الجديد ${created.name}! تم إنشاء ملفك بنجاح`);
    setIsAddingNew(false);
    setNewName('');
    onSelectChild(created.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border-2 border-amber-300 shadow-2xl space-y-6 animate-scale-up">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎈</span>
            <h3 className="text-xl font-black text-slate-900">
              {isAddingNew ? 'إضافة طفل جديد' : 'من يتعلم معنا اليوم؟'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAddingNew ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-1">
              {children.map((c) => {
                const isActive = c.id === activeChildId;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-right cursor-pointer ${
                      isActive
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl">
                        {c.avatar}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base">{[c.name, c.lastName].filter(Boolean).join(' ')}</h4>
                        <p className="text-xs text-slate-500">
                          {c.age
                            ? `العمر: ${c.age} ${c.age <= 10 ? 'سنوات' : 'سنة'}`
                            : `العمر: ${c.ageGroup} سنوات`}
                          {c.gradeLevel ? ` · ${c.gradeLevel}` : ` · المستوى ${c.currentLevelId}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-lg">
                        ⭐ {c.stars}
                      </span>
                      {isActive && <Check className="w-5 h-5 text-emerald-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                audioService.playTap();
                setIsAddingNew(true);
              }}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/50 text-amber-900 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طفل جديد</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateChild} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم الطفل أو لقبه المحبب:
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثلاً: ليلى، كريم، عمر..."
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الفئة العمرية:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewAge('3-4')}
                  className={`py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                    newAge === '3-4'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  3 - 4 سنوات
                </button>
                <button
                  type="button"
                  onClick={() => setNewAge('5-6')}
                  className={`py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                    newAge === '5-6'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  5 - 6 سنوات
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اختر شخصية كرتونية لطيفة:
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setNewAvatar(av)}
                    className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                      newAvatar === av
                        ? 'bg-amber-100 border-amber-500 scale-110 shadow-xs'
                        : 'bg-white border-slate-200 hover:scale-105'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                رجوع
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                حفظ وبدء التعلم
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
