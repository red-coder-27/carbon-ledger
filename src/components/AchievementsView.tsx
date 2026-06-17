import React from 'react';
import { ACHIEVEMENTS_LIST, Badge } from '../utils/achievements';
import { BookOpen, Flame, Compass, ChevronDown, Recycle, Sparkles, Lock } from 'lucide-react';

/** Props for the AchievementsView component. */
interface AchievementsViewProps {
  /** Map of achievement IDs to unlock date string or null if locked */
  readonly unlockedState: Readonly<Record<string, string | null>>;
}

/**
 * Renders the collectible achievements, field badges, and milestones panel.
 * 
 * Inspects the unlocked status of each badge in ACHIEVEMENTS_LIST and displays
 * unlock timestamps formatted in Indian locale standards.
 *
 * @param {AchievementsViewProps} props - Component props containing unlocked achievements state
 * @returns {React.ReactElement} The achievements list view component
 */
function AchievementsView({ unlockedState }: AchievementsViewProps): React.ReactElement {
  // Map icon names to components
  const iconMap: Record<string, React.ReactNode> = {
    BookOpen: <BookOpen className="w-8 h-8" />,
    Flame: <Flame className="w-8 h-8" />,
    Compass: <Compass className="w-8 h-8" />,
    ChevronDown: <ChevronDown className="w-8 h-8" />,
    Recycle: <Recycle className="w-8 h-8" />
  };

  /**
   * Generates localized unlock status text.
   * 
   * @param {string} badgeId - The ID of the badge to inspect
   * @returns {string} The unlock date or 'Locked' status text
   */
  const getStatusText = (badgeId: string): string => {
    const unlockDate = unlockedState[badgeId];
    if (unlockDate) {
      const formatted = new Date(unlockDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      return `Earned on ${formatted}`;
    }
    return 'Locked';
  };

  return (
    <div className="max-w-3xl mx-auto font-sans space-y-6">
      
      {/* Title */}
      <div className="flex items-center space-x-3 mb-6">
        <Sparkles className="text-clay w-7 h-7" />
        <h2 className="text-3xl font-serif text-ink font-bold">Field Badges & Milestones</h2>
      </div>

      <p className="text-graphite leading-relaxed">
        Earn badges by committing to low-emission travel, segregating dry and wet waste, keeping your carbon output below the national baseline, and tracking daily metrics.
      </p>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {ACHIEVEMENTS_LIST.map((badge: Badge): React.ReactElement => {
          const isUnlocked = !!unlockedState[badge.id];
          const statusText = getStatusText(badge.id);

          return (
            <div
              key={badge.id}
              className={`bg-white border-2 rounded-xl p-5 shadow-sm transition-all duration-300 relative overflow-hidden flex items-center space-x-5 ${
                isUnlocked 
                  ? 'border-leaf/40 hover:border-leaf/60' 
                  : 'border-moss/10 opacity-75 grayscale-[30%]'
              }`}
            >
              {/* Colored left strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${isUnlocked ? 'bg-leaf' : 'bg-moss/30'}`} />

              {/* Badge Icon Display */}
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center border flex-shrink-0 transition-transform duration-500 ${
                  isUnlocked 
                    ? 'bg-leaf/10 border-leaf/30 text-leaf scale-105' 
                    : 'bg-paper border-moss/20 text-graphite'
                }`}
                aria-hidden="true"
              >
                {isUnlocked ? (
                  iconMap[badge.icon] || <Sparkles className="w-7 h-7" />
                ) : (
                  <Lock className="w-5 h-5 text-graphite/50" />
                )}
              </div>

              {/* Badge Details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-baseline justify-between">
                  <h3 className={`text-base font-bold font-serif ${isUnlocked ? 'text-ink' : 'text-graphite'}`}>
                    {badge.title}
                  </h3>
                  <span 
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      isUnlocked 
                        ? 'bg-leaf/5 text-leaf border-leaf/20' 
                        : 'bg-paper text-graphite/60 border-moss/10'
                    }`}
                  >
                    {isUnlocked ? 'Earned' : 'Locked'}
                  </span>
                </div>
                <p className="text-xs text-graphite leading-relaxed">{badge.description}</p>
                
                {/* Screen Reader status helper */}
                <div className="text-[11px] font-medium font-mono-journal text-graphite/80 pt-1">
                  {statusText}
                </div>
                
                {/* Visual date under text for sighted users */}
                <span className="sr-only">
                  Status: {badge.title} badge is {isUnlocked ? `unlocked, earned on ${statusText}` : 'locked'}.
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default AchievementsView;
