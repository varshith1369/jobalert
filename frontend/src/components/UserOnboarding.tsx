import React, { useState } from 'react';
import { Sparkles, Check, GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { CATEGORY_LABELS, EDUCATION_LABELS, translations } from '../utils/index.js';
import { Location } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

interface UserOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  onApplyPreferences: (prefs: { education: string; categories: string[]; state: string }) => void;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({
  isOpen,
  onClose,
  locations,
  onApplyPreferences,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const [step, setStep] = useState<number>(1);
  const [selectedEducation, setSelectedEducation] = useState<string>('GRADUATE');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['CENTRAL_GOVT', 'BANKING']);
  const [selectedState, setSelectedState] = useState<string>('ALL');

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleFinish = () => {
    onApplyPreferences({
      education: selectedEducation,
      categories: selectedCategories,
      state: selectedState,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Progress bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                Quick Setup • Step {step} of 3
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {step === 1 && 'What is your highest qualification?'}
                {step === 2 && 'Which exam types are you targeting?'}
                {step === 3 && 'Which state recruitment are you targeting?'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 font-medium">
            Skip
          </button>
        </div>

        {/* Step 1: Education */}
        {step === 1 && (
          <div className="space-y-2 mb-6">
            <p className="text-xs text-slate-500 mb-3">
              We will match posts where your educational degree meets or exceeds the required eligibility.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(EDUCATION_LABELS).map(([code, meta]) => (
                <button
                  key={code}
                  onClick={() => setSelectedEducation(code)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                    selectedEducation === code
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'hi' ? meta.hi : meta.en}</span>
                  </span>
                  {selectedEducation === code && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Target Categories */}
        {step === 2 && (
          <div className="space-y-2 mb-6">
            <p className="text-xs text-slate-500 mb-3">
              Select one or multiple sectors to keep on your real-time radar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(CATEGORY_LABELS).map(([code, meta]) => {
                const isSelected = selectedCategories.includes(code);
                return (
                  <button
                    key={code}
                    onClick={() => toggleCategory(code)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>{language === 'hi' ? meta.hi : meta.en}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Preferred State */}
        {step === 3 && (
          <div className="space-y-3 mb-6">
            <p className="text-xs text-slate-500">
              Select your home or target state for State PSC, Police, and local clerk recruitments:
            </p>
            <div className="space-y-2">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All India (National + Any State)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.stateCode}>
                    {loc.stateName} {loc.isAllIndia ? '(All India)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="inline-flex items-center space-x-1.5 text-xs font-bold px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
            >
              <span>{t.completeSetup}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
