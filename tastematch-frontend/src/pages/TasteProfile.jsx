import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFire, FaHeart, FaLeaf, FaMoneyBillWave, 
  FaSpinner, FaStar, FaCheck
} from 'react-icons/fa';
import { ENABLE_DEMO_FALLBACK, apiFetch } from '../config/api';
import {
  clearPersistedTasteProfile,
  getCurrentUser,
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
};

// --- SKEUMORPHIC INTERACTIVE ROTARY KNOB COMPONENT ---
const RotaryKnob = ({ value, onChange, min = 0, max = 100, label, getSublabel }) => {
  const knobRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  // Convert value to degrees (-135deg to +135deg for a 270deg sweep)
  const percent = (value - min) / (max - min);
  const degrees = -135 + percent * 270;

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = value;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaY = startY.current - e.clientY; // drag up to increase
    const range = max - min;
    const sensitivity = 0.6; // adjustment speed
    let newValue = startValue.current + (deltaY * sensitivity);
    newValue = Math.max(min, Math.min(max, newValue));
    // Round to nearest 10 for spice level
    newValue = Math.round(newValue / 10) * 10;
    onChange(newValue);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Support mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const step = 10;
    let newValue = value + direction * step;
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
  };

  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-900/60 border border-white/5 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05),2px_2px_8px_rgba(0,0,0,0.4)]">
      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-3">{label}</span>
      
      {/* Outer Dial Marks */}
      <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-slate-950 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8)] border border-slate-800">
        
        {/* Tick Marks */}
        {[...Array(11)].map((_, idx) => {
          const tickVal = idx * 10;
          const tickPercent = idx / 10;
          const tickDeg = -135 + tickPercent * 270;
          const isActive = tickVal <= value;
          return (
            <div 
              key={idx}
              className="absolute w-1 h-3 origin-bottom"
              style={{
                transform: `rotate(${tickDeg}deg) translateY(-38px)`,
                bottom: '50%'
              }}
            >
              <div className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-orange-500 shadow-[0_0_5px_#f97316,0_0_10px_#f97316]' 
                  : 'bg-slate-800'
              }`} />
            </div>
          );
        })}

        {/* The Physical Rotating Knob */}
        <div 
          ref={knobRef}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          className="w-16 h-16 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center relative select-none"
          style={{
            background: 'radial-gradient(circle, #475569 0%, #1e293b 70%, #0f172a 100%)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,255,255,0.15)',
            transform: `rotate(${degrees}deg)`,
            transition: isDragging.current ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          {/* Brushed Metal Grooves */}
          <div className="absolute inset-1 rounded-full border border-white/5 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.3)_100%)]" />
          
          {/* Finger Indent / Indicator Dot */}
          <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316] absolute top-2" />
        </div>
      </div>

      {/* Dynamic Digital Nixie Readout */}
      <div className="mt-4 px-3 py-1 rounded border border-orange-950 bg-black/80 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.9)] flex items-center justify-center min-w-[70px]">
        <span className="font-mono text-xs font-bold text-orange-500 shadow-[0_0_8px_#f97316] tracking-widest">
          {value}%
        </span>
      </div>
      <span className="text-[10px] font-bold text-orange-400 mt-1 uppercase tracking-wider">
        {getSublabel(value)}
      </span>
    </div>
  );
};

// --- SKEUMORPHIC VERTICAL STUDIO FADER COMPONENT ---
const VerticalFader = ({ value, onChange, min = 1, max = 5, label, getSublabel }) => {
  const trackRef = useRef(null);
  const isDragging = useRef(false);

  // Convert value to percentage height displacement
  const percent = (value - min) / (max - min);
  // Track goes from top (0%) to bottom (100%), let's reverse so higher is at the top
  const handleBottomPercent = percent * 100;

  const handleMouseDown = (e) => {
    isDragging.current = true;
    handleDrag(e);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    handleDrag(e);
  };

  const handleDrag = (e) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const trackHeight = rect.height;
    // Calculate vertical position relative to track
    const relativeY = Math.max(0, Math.min(trackHeight, e.clientY - rect.top));
    // Reverse so bottom is min, top is max
    const dragPercent = 1 - (relativeY / trackHeight);
    let newValue = min + dragPercent * (max - min);
    newValue = Math.round(newValue);
    onChange(newValue);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-900/60 border border-white/5 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05),2px_2px_8px_rgba(0,0,0,0.4)] h-72">
      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-3">{label}</span>
      
      <div className="flex-grow flex items-center gap-4">
        {/* DB-like Scale Labels */}
        <div className="flex flex-col justify-between h-40 text-[9px] font-mono text-slate-500 select-none text-right">
          <span>+5 dB</span>
          <span>+3 dB</span>
          <span> 0 dB</span>
          <span>-3 dB</span>
          <span>-∞ dB</span>
        </div>

        {/* Outer Inset Fader Slot */}
        <div 
          ref={trackRef}
          onMouseDown={handleMouseDown}
          className="w-8 h-40 rounded-lg bg-slate-950 border border-slate-800 shadow-[inset_3px_3px_8px_rgba(0,0,0,0.9)] relative cursor-ns-resize flex justify-center"
        >
          {/* Vertical Slot Line */}
          <div className="absolute w-1 h-full bg-slate-900 border-x border-slate-800" />
          
          {/* Fader Scale Ticks on Track */}
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-3 h-[1px] bg-slate-800" 
              style={{ top: `${i * 25}%` }}
            />
          ))}

          {/* Draggable Physical Fader Cap */}
          <div 
            className="absolute w-10 h-6 rounded-md cursor-grab active:cursor-grabbing flex flex-col justify-between p-[2px]"
            style={{
              bottom: `calc(${handleBottomPercent}% - 12px)`, // center the 24px fader cap
              background: 'linear-gradient(180deg, #94a3b8 0%, #475569 40%, #1e293b 100%)',
              boxShadow: '0px 4px 8px rgba(0,0,0,0.7), inset 1px 1px 2px rgba(255,255,255,0.3)',
              left: '-4px',
              transition: isDragging.current ? 'none' : 'bottom 0.15s ease-out'
            }}
          >
            <div className="w-full h-[2px] bg-slate-300 opacity-80" />
            {/* Center Metallic Stripe */}
            <div className="w-full h-1.5 bg-yellow-400 shadow-[0_0_4px_#facc15]" />
            <div className="w-full h-[2px] bg-slate-950 opacity-80" />
          </div>
        </div>
      </div>

      {/* Value Indicator LED */}
      <div className="mt-4 px-3 py-1 rounded border border-yellow-950 bg-black/80 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.9)] flex items-center justify-center min-w-[70px]">
        <span className="font-mono text-xs font-bold text-yellow-400 shadow-[0_0_8px_#facc15] tracking-widest">
          LVL_0{value}
        </span>
      </div>
      <span className="text-[10px] font-bold text-yellow-400 mt-1 uppercase tracking-wider">
        {getSublabel(value)}
      </span>
    </div>
  );
};

// --- SKEUMORPHIC BAND SELECTOR DIAL (CUISINE SELECTOR) ---
const CuisineSelectorDial = ({ value, onChange, options, label }) => {
  // Map option index to snapped rotation angles
  const selectedIdx = options.indexOf(value);
  const angleStep = 40; // 40 degrees between selections
  const baseAngle = -80; // center is 0, so -80 to +80 sweep for 5 options
  const targetAngle = baseAngle + selectedIdx * angleStep;

  return (
    <div className="flex flex-col items-center p-6 rounded-3xl bg-slate-900/60 border border-white/5 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05),4px_4px_12px_rgba(0,0,0,0.4)] md:col-span-2">
      <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-6">{label}</span>
      
      <div className="relative w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 py-4">
        
        {/* Large Snap Rotary Pointer Dial */}
        <div className="relative w-28 h-28 rounded-full bg-slate-950 border-2 border-slate-800 shadow-[inset_3px_3px_8px_rgba(0,0,0,0.9)] flex items-center justify-center">
          
          {/* Outer Ring Indicators */}
          {options.map((opt, idx) => {
            const optAngle = baseAngle + idx * angleStep;
            const isSelected = opt === value;
            return (
              <div 
                key={opt}
                className="absolute w-1 h-4 origin-bottom"
                style={{
                  transform: `rotate(${optAngle}deg) translateY(-48px)`,
                  bottom: '50%'
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isSelected 
                    ? 'bg-yellow-400 shadow-[0_0_6px_#facc15,0_0_12px_#facc15]' 
                    : 'bg-slate-800'
                }`} />
              </div>
            );
          })}

          {/* Heavy Rotary Pointer Knob */}
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center relative shadow-[2px_4px_10px_rgba(0,0,0,0.6)] border border-slate-800"
            style={{
              background: 'radial-gradient(circle, #64748b 0%, #334155 60%, #0f172a 100%)',
              transform: `rotate(${targetAngle}deg)`,
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' // satisfying snap animation
            }}
          >
            {/* Indent line showing where it points */}
            <div className="absolute top-1 w-1 h-7 bg-yellow-400 shadow-[0_0_5px_#facc15] rounded-full" />
            {/* Center screw */}
            <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-700 shadow-inner flex items-center justify-center">
              <div className="w-3 h-[2px] bg-slate-700" />
            </div>
          </div>
        </div>

        {/* Clickable Radio Band Options Grid */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5 w-full md:w-auto">
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border font-mono text-left transition-all text-xs active:scale-95 ${
                  isSelected
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.08)] font-bold'
                    : 'bg-slate-950/50 border-white/5 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className={`h-2.5 w-2.5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? 'bg-yellow-400 border-transparent shadow-[0_0_6px_#facc15]' : 'bg-slate-900 border-slate-700'
                }`}>
                  {isSelected && <div className="h-1 w-1 rounded-full bg-slate-950" />}
                </div>
                <span>{opt.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

// --- SKEUMORPHIC HEAVY ROCKER SWITCH (DIETARY SELECTOR) ---
const RockerSwitch = ({ value, onChange, options, label }) => {
  return (
    <div className="flex flex-col items-center p-6 rounded-3xl bg-slate-900/60 border border-white/5 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05),4px_4px_12px_rgba(0,0,0,0.4)]">
      <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-6">{label}</span>
      
      {/* Grid of heavy tactile rocker switches */}
      <div className="grid grid-cols-2 gap-4 w-full h-full justify-items-center">
        {options.map((opt) => {
          const isSelected = opt === value;
          return (
            <div key={opt} className="flex flex-col items-center gap-2">
              {/* Physical Rocker Housing */}
              <div 
                onClick={() => onChange(opt)}
                className="w-12 h-16 rounded-lg bg-slate-950 border border-slate-800 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.9)] flex items-center justify-center cursor-pointer p-1"
              >
                {/* The Switch Actuator */}
                <div 
                  className="w-full h-full rounded-md flex flex-col justify-between items-center py-1 transition-all duration-200"
                  style={{
                    // Gradient shifting to simulate mechanical tilting
                    background: isSelected 
                      ? 'linear-gradient(180deg, #1e293b 0%, #334155 30%, #475569 100%)' // Tilted ON (pressed bottom)
                      : 'linear-gradient(180deg, #475569 0%, #334155 70%, #1e293b 100%)', // Tilted OFF (pressed top)
                    boxShadow: isSelected
                      ? 'inset 0 3px 5px rgba(0,0,0,0.7), 0 1px 1px rgba(255,255,255,0.1)'
                      : 'inset 0 -3px 5px rgba(0,0,0,0.7), 0 3px 5px rgba(0,0,0,0.5)',
                    transform: isSelected ? 'translateY(1px)' : 'translateY(-1px)'
                  }}
                >
                  {/* Status Lines on Switch */}
                  <div className={`w-3 h-[2px] rounded-full transition-opacity ${isSelected ? 'bg-slate-700 opacity-20' : 'bg-slate-300 opacity-60'}`} />
                  
                  {/* Small LED embedded in switch */}
                  <div className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    isSelected 
                      ? 'bg-green-400 shadow-[0_0_6px_#4ade80,0_0_12px_#4ade80]' 
                      : 'bg-slate-900 border border-slate-800'
                  }`} />
                  
                  <div className={`w-3 h-[2px] rounded-full transition-opacity ${isSelected ? 'bg-slate-300 opacity-60' : 'bg-slate-700 opacity-20'}`} />
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">{opt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- SKEUMORPHIC MECHANICAL PUSH BUTTONS (BUDGET SELECTOR) ---
const PushButtonSelector = ({ value, onChange, options, label }) => {
  return (
    <div className="flex flex-col p-6 rounded-3xl bg-slate-900/60 border border-white/5 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05),4px_4px_12px_rgba(0,0,0,0.4)] md:col-span-3">
      <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-4 text-center">{label}</span>
      
      {/* Row of push buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-2">
        {options.map((opt) => {
          const isSelected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className="relative rounded-2xl p-0.5 focus:outline-none transition-all"
              style={{
                // Recessed frame housing
                background: '#090d16',
                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.8), 1px 1px 2px rgba(255,255,255,0.05)'
              }}
            >
              {/* Button Cap */}
              <div 
                className="rounded-[14px] py-4 px-2 font-mono text-xs font-black tracking-wider flex flex-col items-center justify-center gap-2 transition-all select-none duration-100"
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)' // Pressed State
                    : 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)', // Raised State
                  boxShadow: isSelected
                    ? 'inset 2px 2px 5px rgba(0,0,0,0.9)'
                    : '2px 2px 6px rgba(0,0,0,0.6), inset 1px 1px 1px rgba(255,255,255,0.2)',
                  transform: isSelected ? 'scale(0.96) translate(1px, 1px)' : 'scale(1)',
                  color: isSelected ? '#34d399' : '#94a3b8',
                  textShadow: isSelected ? '0 0 6px rgba(52,211,153,0.4)' : 'none'
                }}
              >
                {/* Tiny LED lens above text */}
                <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  isSelected 
                    ? 'bg-emerald-400 shadow-[0_0_5px_#34d399,0_0_10px_#34d399]' 
                    : 'bg-slate-900 border border-slate-950'
                }`} />
                
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN TASTE PROFILE CONSOLE COMPONENT ---
const TasteProfile = () => {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
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

        if (isCancelled) return;

        if (response.status === 404) {
          clearPersistedTasteProfile();
          setFormData(INITIAL_FORM_DATA);
          return;
        }

        if (response.status === 401 || response.status === 403) {
          clearPersistedTasteProfile();
          toast.error('Please sign in again');
          navigate('/register');
          return;
        }

        if (!response.ok) {
          toast.error('We could not load your saved taste profile. You can still update it below.');
          return;
        }

        const profile = normalizeTasteProfile(await response.json());
        setFormData(profile);
        persistTasteProfile(profile);
      } catch (error) {
        console.error('Profile load error:', error);
        if (!isCancelled) {
          toast.error('We could not load your saved taste profile. You can still update it below.');
        }
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
    } catch (error) {
      console.error('Profile save error:', error);
      if (!ENABLE_DEMO_FALLBACK) {
        toast.error('Could not save your taste profile. Please try again.');
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
      {/* Background ambient glow */}
      <div className="absolute right-[5%] top-[10%] h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[10%] left-[5%] h-80 w-80 rounded-full bg-accent/5 blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 w-full max-w-4xl px-4 md:px-6"
      >
        
        {/* PHYSICAL SYNTHESIZER CONSOLE HOUSING */}
        <div 
          className="rounded-[36px] overflow-hidden border-2 border-slate-800 p-2 relative"
          style={{
            // Synth Wood Side Panels + Metallic plate container
            background: 'linear-gradient(90deg, #5c3b1e 0%, #3d2512 2%, #1e293b 3%, #0f172a 97%, #3d2512 98%, #5c3b1e 100%)',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), inset 1px 1px 3px rgba(255,255,255,0.1)'
          }}
        >
          {/* Inner Console Plate */}
          <div className="rounded-[30px] bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-950 p-6 md:p-8 relative">
            
            {/* Corner Screws */}
            {[
              'top-4 left-4', 'top-4 right-4', 
              'bottom-4 left-4', 'bottom-4 right-4'
            ].map((screwPos) => (
              <div 
                key={screwPos}
                className={`absolute w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-slate-700 to-slate-400 border border-slate-900 flex items-center justify-center opacity-75 pointer-events-none shadow-md ${screwPos}`}
              >
                {/* Screw Slot */}
                <div className="w-2 h-[1px] bg-slate-800 origin-center rotate-[45deg]" />
              </div>
            ))}

            {/* Console Header */}
            <div className="text-center mb-8 border-b-2 border-slate-950 pb-6 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-yellow-950 bg-yellow-500/5 text-yellow-500 mb-3 font-mono text-xs uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                Flavor Synthesis Module // model-X5
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase text-shadow">
                Hi, {userName}
              </h1>
              <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto">
                Tune the mechanical flavor synthesis dials, faders, and toggle switches to calibrate your culinary preferences and generate custom menus.
              </p>
            </div>

            {profileLoading ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center gap-4 p-8 text-center bg-slate-950/40 rounded-3xl border border-white/5">
                <FaSpinner className="animate-spin text-4xl text-yellow-500 shadow-glow" />
                <p className="max-w-md text-xs font-mono text-slate-400 uppercase tracking-widest">
                  Calibrating Dial Resistors & Loading Saved Profiles...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* GRID OF SKEUMORPHIC CONTROLLERS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* CUISINE ROTARY SELECTOR (Occupies 2 columns on medium+ screens) */}
                  <CuisineSelectorDial 
                    label="CUISINE BAND SELECTOR"
                    value={formData.cuisine}
                    onChange={(val) => updateField('cuisine', val)}
                    options={cuisines}
                  />

                  {/* DIETARY PREFERENCE ROCKER SWITCHES */}
                  <RockerSwitch 
                    label="DIETARY TOGGLE GATES"
                    value={formData.dietType}
                    onChange={(val) => updateField('dietType', val)}
                    options={dietTypes}
                  />

                  {/* SPICE TOLERANCE ROTARY KNOB */}
                  <RotaryKnob 
                    label="SPICE LEVEL CALIBRATION"
                    value={formData.spiceLevel}
                    onChange={(val) => updateField('spiceLevel', val)}
                    min={0}
                    max={100}
                    getSublabel={getSpiceLabel}
                  />

                  {/* RATING IMPORTANCE SLIDER FADER */}
                  <VerticalFader 
                    label="QUALITY THRESHOLD fader"
                    value={formData.ratingImportance}
                    onChange={(val) => updateField('ratingImportance', val)}
                    min={1}
                    max={5}
                    getSublabel={getRatingLabel}
                  />

                  {/* BUDGET PUSH BUTTONS (Occupies 3 columns in large screen layout) */}
                  <PushButtonSelector 
                    label="BUDGET THRESHOLD SELECTORS"
                    value={formData.budgetRange}
                    onChange={(val) => updateField('budgetRange', val)}
                    options={budgets}
                  />

                </div>

                {/* HEAVY TRIGGER BUTTON */}
                <div className="pt-6 border-t-2 border-slate-950 flex justify-center">
                  <div 
                    className="p-1 rounded-[20px] bg-[#090d16] border border-white/5 w-full shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05)]"
                  >
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full btn-gold py-4 text-sm uppercase tracking-widest font-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #dfb743 0%, #f4e39b 50%, #b68e22 100%)',
                        boxShadow: '0 4px 15px rgba(223,183,67,0.3)'
                      }}
                    >
                      {loading ? (
                        <FaSpinner className="text-xl animate-spin text-slate-900" />
                      ) : (
                        <>
                          <FaCheck className="text-slate-900" /> Commit Calibration & Synthesize Menus
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default TasteProfile;
