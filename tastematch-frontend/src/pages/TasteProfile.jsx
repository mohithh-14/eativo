import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FaFire, FaHeart, FaLeaf, FaMoneyBillWave, 
  FaSpinner, FaStar, FaCheck
} from 'react-icons/fa';
import { ENABLE_DEMO_FALLBACK, apiFetch } from '../config/api';
import {
  clearPersistedTasteProfile,
  getCurrentUser,
  getStoredTasteProfile,
  normalizeTasteProfile,
  persistTasteProfile,
  subscribeToAuthChanges,
} from '../config/auth';

const INITIAL_FORM_DATA = {
  cuisine: 'Hyderabadi',
  spiceLevel: 80,
  dietType: 'Non-Veg',
  budgetRange: 'Rs 900',
  ratingImportance: 4,
  address: '123 Gourmet Blvd, Foodie City',
};

const TasteProfile = () => {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [formData, setFormData] = useState(() => {
    const cached = getStoredTasteProfile(getCurrentUser()?.id) || getStoredTasteProfile();
    return cached || INITIAL_FORM_DATA;
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  const cuisines = ['Hyderabadi', 'South Indian', 'Mughlai', 'Multi-Cuisine', 'Indian'];
  const dietTypes = ['Veg', 'Non-Veg', 'Eggetarian', 'Vegan'];
  const budgets = ['Rs 700', 'Rs 900', 'Rs 1000', 'Rs 1200+'];

  const currentUserId = currentUser?.id || '';
  const userName = currentUser?.name || 'Foodie';

  useEffect(() => subscribeToAuthChanges((session) => setCurrentUser(session?.user || null)), []);

  useEffect(() => {
    let isCancelled = false;

    const loadExistingProfile = async () => {
      if (!currentUserId) {
        setProfileLoading(false);
        toast.error('Please register first');
        navigate('/register');
        return;
      }

      setProfileLoading(true);

      try {
        const response = await apiFetch('/api/profile/me');
        let loadedProfile = {};
        if (response.ok) {
          loadedProfile = await response.json();
        }

        // Fetch address from database
        let dbAddress = '';
        try {
          const addrResp = await apiFetch('/api/address/me');
          if (addrResp.ok) {
            const addrList = await addrResp.json();
            if (addrList.length > 0) {
              dbAddress = addrList[0].street;
            }
          }
        } catch (addrErr) {
          console.error('Error loading address:', addrErr);
        }

        if (isCancelled) return;

        const profile = normalizeTasteProfile({
          ...loadedProfile,
          address: dbAddress || loadedProfile.address
        });
        setFormData(profile);
        persistTasteProfile(profile);
      } catch (error) {
        console.error('Profile load error:', error);
      } finally {
        if (!isCancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadExistingProfile();

    return () => {
      isCancelled = true;
    };
  }, [currentUserId, navigate]);

  const updateField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSliderChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: Number(value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const profilePayload = normalizeTasteProfile(formData);

    try {
      const response = await apiFetch('/api/profile/me', {
        method: 'POST',
        body: JSON.stringify(profilePayload),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearPersistedTasteProfile();
          toast.error('Please sign in again');
          navigate('/register');
          return;
        }

        let message = 'Failed to save profile';
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch (parseError) {
          message = 'Failed to save profile';
        }
        throw new Error(message);
      }

      // Save address to database
      try {
        await apiFetch('/api/address/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ street: formData.address }),
        });
      } catch (addrErr) {
        console.error('Error saving address to backend:', addrErr);
      }
    } catch (error) {
      console.error('Profile save error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error('Could not save your taste profile. Please try again.');
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }

    persistTasteProfile(profilePayload);
    toast.success('Taste profile saved');
    navigate('/recommendations');
  };

  const getSpiceLabel = (value) => {
    if (value < 40) return 'Mild';
    if (value < 70) return 'Medium';
    if (value < 90) return 'Hot';
    return 'Extra Hot';
  };

  const getRatingLabel = (value) => {
    if (value <= 2) return 'Flexible';
    if (value <= 4) return 'Important';
    return 'Essential';
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 pb-16 pt-24 text-white">
      
      {/* 1. LIQUID GLASS FLOATING BACKGROUND BLOBS */}
      <style>{`
        @keyframes floatBlob1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.2); }
          66% { transform: translate(-30px, 20px) scale(0.8); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatBlob2 {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-50px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1.1); }
        }
        .liquid-blob-1 {
          animation: floatBlob1 12s infinite ease-in-out;
        }
        .liquid-blob-2 {
          animation: floatBlob2 16s infinite ease-in-out;
        }
      `}</style>
      
      {/* Coral Red Blob */}
      <div className="liquid-blob-1 absolute right-[8%] top-[12%] h-[350px] w-[350px] rounded-full bg-[#ff5a5f]/15 blur-3xl" />
      {/* Gold Yellow Blob */}
      <div className="liquid-blob-2 absolute bottom-[10%] left-[6%] h-[380px] w-[380px] rounded-full bg-[#dfb743]/10 blur-3xl" />
      {/* Cyan Blue Blob */}
      <div className="liquid-blob-1 absolute top-[40%] left-[30%] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 w-full max-w-3xl px-4 md:px-6"
      >
        {/* 2. MAIN REFRACTIVE LIQUID GLASS CARD PANEL */}
        <div 
          className="rounded-[32px] border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_1px_1px_3px_rgba(255,255,255,0.3)] p-6 md:p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(30px) saturate(180%)',
          }}
        >
          
          {/* Header */}
          <div className="text-center mb-8 border-b border-white/10 pb-6">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 uppercase">
              Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{userName}</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto font-medium">
              Calibrate your taste profile below. We will instantly reshape your recommendations using a glossy liquid interface.
            </p>
          </div>

          {profileLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 py-8 text-center">
              <FaSpinner className="animate-spin text-4xl text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Loading your flavor preferences...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* LIQUID CONTROLLERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. FAVORITE CUISINE (Liquid Glass Capsules) */}
                <div className="md:col-span-2 flex flex-col">
                  <label className="text-xs font-bold tracking-wider uppercase text-slate-300 mb-3.5 flex items-center gap-2">
                    <FaHeart className="text-primary" /> Favorite Cuisine
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {cuisines.map((c) => {
                      const isSelected = formData.cuisine === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateField('cuisine', c)}
                          className={`text-xs px-5 py-3 rounded-full border font-bold tracking-wide transition-all active:scale-95 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-primary to-primary-light border-primary/20 text-white shadow-[0_8px_20px_rgba(255,90,95,0.35)]'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                          style={{
                            backdropFilter: 'blur(8px)',
                            boxShadow: isSelected ? '0 8px 20px rgba(255,90,95,0.35), inset 1px 1px 2px rgba(255,255,255,0.3)' : 'inset 1px 1px 1px rgba(255,255,255,0.1)'
                          }}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. DIETARY PREFERENCE (Liquid Glass Capsules) */}
                <div className="md:col-span-2 flex flex-col">
                  <label className="text-xs font-bold tracking-wider uppercase text-slate-300 mb-3.5 flex items-center gap-2">
                    <FaLeaf className="text-green-400" /> Dietary Preference
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {dietTypes.map((d) => {
                      const isSelected = formData.dietType === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => updateField('dietType', d)}
                          className={`text-xs px-5 py-3 rounded-full border font-bold tracking-wide transition-all active:scale-95 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-green-500 to-emerald-400 border-green-500/20 text-white shadow-[0_8px_20px_rgba(34,197,94,0.35)]'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                          style={{
                            backdropFilter: 'blur(8px)',
                            boxShadow: isSelected ? '0 8px 20px rgba(34,197,94,0.35), inset 1px 1px 2px rgba(255,255,255,0.3)' : 'inset 1px 1px 1px rgba(255,255,255,0.1)'
                          }}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. SPICE TOLERANCE (Neon Liquid Tube Slider) */}
                <div className="flex flex-col p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold tracking-wider uppercase text-slate-300 flex items-center gap-2">
                      <FaFire className="text-orange-500 animate-pulse" /> Spice Tolerance
                    </label>
                    <span className="text-xs font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                      {formData.spiceLevel}% ({getSpiceLabel(formData.spiceLevel)})
                    </span>
                  </div>
                  
                  {/* Slider Container */}
                  <div className="relative flex items-center py-2">
                    {/* Custom Glowing Liquid Track behind input */}
                    <div className="absolute inset-x-0 h-2.5 rounded-full bg-slate-900 border border-white/5 shadow-inner overflow-hidden">
                      {/* Active liquid fill */}
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_8px_#f97316]"
                        style={{ width: `${formData.spiceLevel}%` }}
                      />
                    </div>
                    
                    {/* Reflective Glass Slide Input */}
                    <input 
                      type="range" 
                      name="spiceLevel" 
                      min="0" 
                      max="100" 
                      step="10" 
                      value={formData.spiceLevel} 
                      onChange={handleSliderChange} 
                      className="w-full h-2.5 cursor-pointer appearance-none bg-transparent relative z-10 outline-none
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/50
                        [&::-webkit-slider-thumb]:shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.8)]
                        [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                  </div>
                </div>

                {/* 4. RATING IMPORTANCE (Neon Liquid Tube Slider) */}
                <div className="flex flex-col p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold tracking-wider uppercase text-slate-300 flex items-center gap-2">
                      <FaStar className="text-yellow-400" /> Rating Importance
                    </label>
                    <span className="text-xs font-mono font-black text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
                      {getRatingLabel(formData.ratingImportance)}
                    </span>
                  </div>
                  
                  {/* Slider Container */}
                  <div className="relative flex items-center py-2">
                    {/* Track */}
                    <div className="absolute inset-x-0 h-2.5 rounded-full bg-slate-900 border border-white/5 shadow-inner overflow-hidden">
                      {/* Active fill */}
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 shadow-[0_0_8px_#facc15]"
                        style={{ width: `${((formData.ratingImportance - 1) / 4) * 100}%` }}
                      />
                    </div>
                    
                    {/* Input */}
                    <input 
                      type="range" 
                      name="ratingImportance" 
                      min="1" 
                      max="5" 
                      value={formData.ratingImportance} 
                      onChange={handleSliderChange} 
                      className="w-full h-2.5 cursor-pointer appearance-none bg-transparent relative z-10 outline-none
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/50
                        [&::-webkit-slider-thumb]:shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.8)]
                        [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                  </div>
                </div>

                {/* 5. BUDGET RANGE (Bubble Buttons) */}
                <div className="md:col-span-2 flex flex-col p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <label className="text-xs font-bold tracking-wider uppercase text-slate-300 mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-400" /> Budget Range
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {budgets.map((budget) => {
                      const isSelected = formData.budgetRange === budget;
                      return (
                        <button
                          key={budget}
                          type="button"
                          onClick={() => updateField('budgetRange', budget)}
                          className={`rounded-2xl border px-3 py-4 font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-500/20 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)]'
                              : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                          style={{
                            boxShadow: isSelected ? '0 8px 20px rgba(16,185,129,0.3), inset 1px 1px 2px rgba(255,255,255,0.2)' : 'inset 1px 1px 2px rgba(0,0,0,0.4)'
                          }}
                        >
                          {budget}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. DEFAULT DELIVERY ADDRESS (Liquid Glass Input) */}
                <div className="md:col-span-2 flex flex-col p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <label className="text-xs font-bold tracking-wider uppercase text-slate-300 mb-3 flex items-center gap-2">
                    <span className="text-accent">📍</span> Default Delivery Address
                  </label>
                  <p className="text-[10px] text-slate-400 mb-3 font-medium">
                    This address will be automatically applied to all your orders across the site and in the AI assistant.
                  </p>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Enter your street, house/apartment number, and city..."
                    className="w-full text-xs px-4 py-3.5 rounded-xl border border-white/10 bg-slate-950/40 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all focus:ring-1 focus:ring-primary/20 shadow-inner"
                    required
                  />
                </div>

              </div>

              {/* HEAVY GLOSSY LIQUID GLASS SUBMIT TRIGGER */}
              <div className="pt-4 flex justify-center">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:brightness-105 active:scale-[0.98] text-white py-4 rounded-full text-sm font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 shadow-[0_8px_32px_rgba(255,90,95,0.3)] cursor-pointer"
                >
                  {loading ? (
                    <FaSpinner className="text-xl animate-spin" />
                  ) : (
                    <>
                      <FaCheck /> Confirm Calibration & Reshape Recommendations
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default TasteProfile;
