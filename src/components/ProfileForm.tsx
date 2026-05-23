import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { UserProfile, Education } from '../types';
import { Check, ChevronRight, ChevronLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileFormProps {
  onComplete: () => void;
}

export function ProfileForm({ onComplete }: ProfileFormProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: profile?.gender || '',
    dob: profile?.dob || '',
    state: profile?.state || '',
    category: profile?.category || '',
    education: profile?.education || {
      qualification: '',
      stream: '',
      passingYear: '',
      percentage: '',
      institution: '',
    },
    skills: profile?.skills || [],
    preferredJobs: profile?.preferredJobs || [],
  });

  const updateEducation = (field: keyof Education, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: {
        ...(prev.education as Education),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Identity set successfully!');
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="max-w-md mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-[600px]">
      <div className="bg-gray-900 p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black uppercase tracking-tight font-display mb-1">Set Your Identity</h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Step {step} of 3</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-8 flex gap-2 relative z-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-700 ${
                i <= step ? 'bg-blue-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Biological Gender</label>
                <div className="grid grid-cols-1 gap-3">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData((p) => ({ ...p, gender: g }))}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-between px-6 ${
                        formData.gender === g
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100'
                          : 'border-gray-100 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {g}
                      {formData.gender === g && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Hometown State</label>
                <select
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-xs font-black uppercase tracking-tight"
                  value={formData.state}
                  onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                >
                  <option value="">Select Region</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Bihar">Bihar</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Delhi">National Capital</option>
                </select>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Current Education</label>
                <select
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-xs font-black uppercase tracking-tight"
                  value={formData.education?.qualification}
                  onChange={(e) => updateEducation('qualification', e.target.value)}
                >
                  <option value="">Status</option>
                  <option value="10th Pass">Metric (10th)</option>
                  <option value="12th Pass">Intermediate (12th)</option>
                  <option value="Graduate">Bachelor Degree</option>
                  <option value="Diploma">Polytechnic Diploma</option>
                  <option value="ITI">ITI Certified</option>
                  <option value="Post Graduate">Master Degree</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Primary Stream</label>
                <input
                  type="text"
                  placeholder="e.g. PCM, Humanities, Commerce"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-xs font-black uppercase placeholder:text-gray-300"
                  value={formData.education?.stream}
                  onChange={(e) => updateEducation('stream', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Batch</label>
                  <input
                    type="text"
                    placeholder="2025"
                    className="w-full px-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-xs font-black text-center"
                    value={formData.education?.passingYear}
                    onChange={(e) => updateEducation('passingYear', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Score</label>
                  <input
                    type="text"
                    placeholder="8.5 CGPA"
                    className="w-full px-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-xs font-black text-center"
                    value={formData.education?.percentage}
                    onChange={(e) => updateEducation('percentage', e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Target Opportunities</label>
                <div className="grid grid-cols-2 gap-2">
                  {['SSC', 'Railway', 'UPSC', 'Banking', 'Defense', 'Police', 'Teaching', 'Private'].map((ex) => {
                    const isSelected = formData.preferredJobs?.includes(ex);
                    return (
                      <button
                        key={ex}
                        onClick={() => {
                          const current = formData.preferredJobs || [];
                          const updated = isSelected 
                            ? current.filter(c => c !== ex)
                            : [...current, ex];
                          setFormData(p => ({ ...p, preferredJobs: updated }));
                        }}
                        className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          isSelected
                            ? 'bg-gray-900 border-gray-900 text-white shadow-xl'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {ex}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 mt-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.1em] leading-relaxed">
                  Identity verification helps our AI prioritize results for your profile.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-10 border-t border-gray-50 flex gap-4 bg-white">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="w-16 h-16 bg-gray-50 text-gray-900 rounded-3xl font-black flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={nextStep}
            className="flex-1 bg-blue-600 text-white h-16 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gray-900 text-white h-16 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-800 transition-all disabled:opacity-50 shadow-2xl"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            Finalize Profile
          </button>
        )}
      </div>
    </div>
  );
}
