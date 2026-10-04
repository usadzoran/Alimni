import React, { useState } from 'react';
import { Shield, Lock, X } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { audioService } from '../../services/audioService';

interface ParentLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ParentLockModal: React.FC<ParentLockModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const settings = storageService.getSettings();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings.parentPin || '1234';
    if (pin === correctPin) {
      audioService.playCorrect();
      setError('');
      setPin('');
      onSuccess();
    } else {
      audioService.playWrong();
      setError('رمز الأمان غير صحيح. الرمز الافتراضي هو 1234');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border-2 border-slate-300 shadow-2xl text-center space-y-5 animate-scale-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-800 font-black text-sm">
            <Shield className="w-5 h-5 text-amber-500" />
            <span>بوابة ولي الأمر</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-3xl">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">أدخل رمز الدخول</h3>
          <p className="text-xs text-slate-500 mt-1">
            هذه المنطقة مخصصة لأولياء الأمور والإدارة لمتابعة تقدم الأطفال. (الرمز الافتراضي: 1234)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="• • • •"
            autoFocus
            className="w-full text-center text-3xl font-black tracking-widest py-3 px-4 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:outline-none bg-slate-50"
          />

          {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              دخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
