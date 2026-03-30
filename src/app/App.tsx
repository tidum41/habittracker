import { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Settings, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Switch } from './components/ui/switch';
import { useTheme } from 'next-themes';

export default function App() {
  const [currentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('habit-selected-dates');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [habitTitle, setHabitTitle] = useState(() =>
    localStorage.getItem('habit-title') || 'type habit here'
  );
  const [view, setView] = useState<'home' | 'settings'>('home');
  const [direction, setDirection] = useState(1);
  const { resolvedTheme, setTheme } = useTheme();

  // Calculate streak
  const calculateStreak = () => {
    const sortedDates = Array.from(selectedDates).sort().reverse();
    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    // Check from today backwards
    let checkDate = new Date(today);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = formatDateKey(checkDate);
      if (selectedDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0 && streak === 0) {
        // If today is not marked, check from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = formatDateKey(checkDate);
        if (selectedDates.has(yesterdayStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return streak;
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const toggleDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateKey)) {
      newSelected.delete(dateKey);
    } else {
      newSelected.add(dateKey);
    }
    setSelectedDates(newSelected);
    localStorage.setItem('habit-selected-dates', JSON.stringify([...newSelected]));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    setDirection(dir === 'next' ? 1 : -1);
    const newMonth = new Date(currentMonth);
    if (dir === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -24 : 24, opacity: 0 }),
  };

  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                     'july', 'august', 'september', 'october', 'november', 'december'];
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const formatDateDisplay = (date: Date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' 
                 : day === 2 || day === 22 ? 'nd'
                 : day === 3 || day === 23 ? 'rd' : 'th';
    
    return `${dayName}, ${monthName} ${day}${suffix}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="w-[42px] h-[42px]" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateKey = formatDateKey(date);
      const isSelected = selectedDates.has(dateKey);
      const isToday = date.toDateString() === currentDate.toDateString();

      const cellClass = isToday && isSelected
        ? 'bg-[#b8b8b8] dark:bg-[#5c5c5e] text-[#eaeaea] dark:text-[#f2f2f7] border border-[#454545] dark:border-[#7a7a7c]'
        : isSelected
        ? 'bg-[#454545] dark:bg-[#3a3a3c] text-[#eaeaea] dark:text-[#f2f2f7]'
        : isToday
        ? 'bg-[#f5f5f5] dark:bg-[#48484a] border border-[#454545] dark:border-[#636366] text-[#454545] dark:text-[#f2f2f7]'
        : 'bg-[#f5f5f5] dark:bg-[#2c2c2e] text-[#454545] dark:text-[#f2f2f7] opacity-60';

      days.push(
        <button
          key={day}
          onClick={() => toggleDate(date)}
          className={`w-[42px] h-[42px] rounded-[5px] flex items-center justify-center transition-all hover:opacity-80 ${cellClass}`}
        >
          {isSelected ? (
            <Check className="w-[15px] h-[15px] text-[#eaeaea] dark:text-[#f2f2f7]" strokeWidth={1.5} />
          ) : (
            <span className="font-['Poppins'] text-[11.795px] leading-[17.693px] tracking-[-0.23px]">
              {day}
            </span>
          )}
        </button>
      );
    }

    return days;
  };

  const streak = calculateStreak();
  const daysInCurrentMonth = getDaysInMonth(currentMonth);
  const completedDaysThisMonth = Array.from(selectedDates).filter(dateStr => {
    const date = new Date(dateStr);
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  }).length;

  return (
    <div className="bg-[#eaeaea] dark:bg-[#1c1c1e] w-screen h-[100dvh] flex justify-center overflow-hidden">
      <div className="w-full max-w-[393px] h-[100dvh] bg-[#eaeaea] dark:bg-[#1c1c1e] relative">
        {/* Main Content */}
        <div className="absolute left-[31px] w-[331px]" style={{ top: 'calc(110px + env(safe-area-inset-top))' }}>
          {/* Title & Date */}
          <div style={{ transform: 'translateY(-16px)' }}>
            <input
              type="text"
              value={habitTitle}
              onFocus={() => { if (habitTitle === 'type habit here') setHabitTitle(''); }}
              onBlur={() => { if (habitTitle === '') setHabitTitle('type habit here'); }}
              onChange={(e) => {
                setHabitTitle(e.target.value);
                if (e.target.value) localStorage.setItem('habit-title', e.target.value);
                else localStorage.removeItem('habit-title');
              }}
              className="font-['Poppins'] font-medium text-[32px] leading-[26.539px] tracking-[-1px] text-[#454545] dark:text-[#f2f2f7] text-center bg-transparent border-none outline-none w-full mb-[8px]"
            />

            <p className="font-['Poppins'] text-[11.795px] leading-[17.693px] tracking-[-0.23px] text-[#717182] dark:text-[#aeaeb2] text-center mb-[32px]">
              {formatDateDisplay(currentDate)}
            </p>
          </div>

          {/* Month Navigation */}
          <div className="relative flex items-center justify-center mb-[20px]" style={{ transform: 'translateY(8px)' }}>
            <button
              onClick={() => navigateMonth('prev')}
              className="absolute left-0 w-[30px] h-[30px] rounded-[7.372px] flex items-center justify-center hover:bg-[#d8d8d8] dark:hover:bg-[#3a3a3c] transition-colors"
            >
              <ChevronLeft className="w-[18px] h-[18px] text-[#454545] dark:text-[#f2f2f7]" strokeWidth={1.5} />
            </button>

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.p
                key={currentMonth.getTime()}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="font-['Poppins'] text-[12px] leading-[17.693px] tracking-[-0.23px] text-[#454545] dark:text-[#f2f2f7] opacity-60"
              >
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </motion.p>
            </AnimatePresence>

            <button
              onClick={() => navigateMonth('next')}
              className="absolute right-0 w-[30px] h-[30px] rounded-[7.372px] flex items-center justify-center hover:bg-[#d8d8d8] dark:hover:bg-[#3a3a3c] transition-colors"
            >
              <ChevronRight className="w-[18px] h-[18px] text-[#454545] dark:text-[#f2f2f7]" strokeWidth={1.5} />
            </button>
          </div>

          {/* Calendar */}
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentMonth.getTime()}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-[18px]"
            >
              {/* Day Names */}
              <div className="grid grid-cols-7 gap-0" style={{ transform: 'translateY(6px)' }}>
                {dayNames.map(day => (
                  <div key={day} className="w-[42px] h-[30px] flex items-center justify-center">
                    <p className="font-['Poppins'] text-[9px] leading-[17.693px] tracking-[-0.23px] text-[#717182] dark:text-[#aeaeb2] opacity-60">
                      {day}
                    </p>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-[6px]">
                {renderCalendar()}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Streak */}
          <div className="absolute top-[517px] left-[-3px] w-[330px] px-[3px]">
            <p className="font-['Poppins'] text-[15px] leading-[22px] tracking-[-0.3px] text-[#454545] dark:text-[#f2f2f7] text-center mb-[8px]">
              {streak} day streak
            </p>

            {/* Progress Bar */}
            <div className="bg-[#c8c8c8] dark:bg-[#3a3a3c] h-[4px] rounded-full overflow-hidden mb-[6px]">
              <div
                className="bg-[#454545] dark:bg-[#e0e0e0] h-full transition-all duration-300"
                style={{ width: `${(completedDaysThisMonth / daysInCurrentMonth) * 100}%` }}
              />
            </div>

            <p className="font-['Poppins'] text-[11px] leading-[17.693px] tracking-[-0.23px] text-[#717182] dark:text-[#aeaeb2] opacity-60 text-center">
              {completedDaysThisMonth}/{daysInCurrentMonth} days
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute left-0 right-0 flex justify-center gap-[142px] z-20" style={{ bottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
          <button onClick={() => setView('home')} className="w-[23px] h-[23px] flex items-center justify-center text-[#454545] dark:text-[#f2f2f7] hover:opacity-70 transition-opacity">
            <Home className="w-full h-full" />
          </button>
          <button onClick={() => setView('settings')} className="w-[23px] h-[23px] flex items-center justify-center text-[#454545] dark:text-[#f2f2f7] hover:opacity-70 transition-opacity">
            <Settings className="w-full h-full" />
          </button>
        </div>

        {/* Settings Screen */}
        <AnimatePresence>
          {view === 'settings' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-0 z-10 bg-[#eaeaea] dark:bg-[#1c1c1e]"
            >
              {/* Back button */}
              <button
                onPointerDown={() => setView('home')}
                style={{ top: 'calc(50px + env(safe-area-inset-top))', touchAction: 'manipulation' }}
                className="absolute left-[24px] w-[44px] h-[44px] flex items-center justify-center text-[#454545] dark:text-[#f2f2f7] active:opacity-50 transition-opacity"
              >
                <ChevronLeft className="w-[20px] h-[20px]" strokeWidth={1.5} />
              </button>

              {/* Dark mode row */}
              <div
                style={{ top: 'calc(130px + env(safe-area-inset-top))' }}
                className="absolute left-[31px] right-[31px] flex items-center justify-between"
              >
                <p className="font-['Poppins'] text-[16px] text-[#454545] dark:text-[#f2f2f7]">dark mode</p>
                <Switch
                  checked={resolvedTheme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
