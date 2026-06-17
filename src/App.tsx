import React, { useState, useMemo, Suspense } from 'react';
import { getSavedActivities, saveActivities, getSavedAchievements, saveAchievements } from './utils/storage';
import { checkAchievements } from './utils/achievements';
import { Activity } from './types';
import { DashboardView } from './components/DashboardView';
import { LogActivityView } from './components/LogActivityView';
import { InsightsView } from './components/InsightsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  Book, 
  LayoutDashboard, 
  PenTool, 
  Lightbulb, 
  History as HistoryIcon, 
  Sparkles, 
  Globe 
} from 'lucide-react';

// Lazy load larger subviews to keep the initial bundle small and fast
const LazyHistoryView = React.lazy(() => 
  import('./components/HistoryView').then(m => ({ default: m.HistoryView }))
);
(LazyHistoryView as unknown as { displayName: string }).displayName = 'LazyHistoryView';

const LazyAchievementsView = React.lazy(() => 
  import('./components/AchievementsView').then(m => ({ default: m.AchievementsView }))
);
(LazyAchievementsView as unknown as { displayName: string }).displayName = 'LazyAchievementsView';

type ActiveView = 'dashboard' | 'log-activity' | 'insights' | 'history' | 'achievements';

/**
 * Main application component that manages navigation state, activity logging,
 * achievement unlocking, and synchronization with storage.
 * @returns {React.ReactElement} The main app structure
 */
function App(): React.ReactElement {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Load activities and achievements from validated localStorage
  const [activities, setActivities] = useState<Activity[]>(() => getSavedActivities());
  const [achievements, setAchievements] = useState<Record<string, string | null>>(() => getSavedAchievements());

  // Handle adding a new activity
  const handleAddActivity = (newActivity: Activity): void => {
    setActivities(prev => {
      const updated = [...prev, newActivity];
      saveActivities(updated);

      // Re-evaluate achievements immediately based on updated activities
      setAchievements(currentAchievements => {
        const nextAchievements = checkAchievements(updated, currentAchievements);
        saveAchievements(nextAchievements);
        return nextAchievements;
      });

      return updated;
    });
  };

  // Handle deleting an activity
  const handleDeleteActivity = (id: string): void => {
    setActivities(prev => {
      const updated = prev.filter(act => act.id !== id);
      saveActivities(updated);

      // Re-evaluate achievements immediately based on remaining activities
      setAchievements(() => {
        // We reset achievements state and compute fresh so achievements can lock/unlock appropriately if entries are deleted
        const freshAchievements = checkAchievements(updated, {});
        saveAchievements(freshAchievements);
        return freshAchievements;
      });

      return updated;
    });
  };

  // Derive unlocked count
  const unlockedCount = useMemo((): number => {
    return Object.values(achievements).filter(Boolean).length;
  }, [achievements]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, badge: undefined },
    { id: 'log-activity', label: 'Log Activity', icon: <PenTool className="w-5 h-5" />, badge: undefined },
    { id: 'insights', label: 'Insights', icon: <Lightbulb className="w-5 h-5" />, badge: undefined },
    { id: 'history', label: 'History', icon: <HistoryIcon className="w-5 h-5" />, badge: undefined },
    { id: 'achievements', label: 'Achievements', icon: <Sparkles className="w-5 h-5" />, badge: unlockedCount > 0 ? unlockedCount : undefined },
  ] as const;

  return (
    <div className="min-h-screen bg-paper font-sans flex flex-col md:flex-row relative">
      
      {/* Accessibility Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-clay text-white px-4 py-2 rounded-md font-bold z-50 shadow"
      >
        Skip to main content
      </a>

      {/* DESKTOP SIDE NAVIGATION RAIL */}
      <nav 
        className="hidden md:flex md:w-64 bg-white border-r-2 border-moss/20 flex-col justify-between py-6 px-4 shrink-0 shadow-sm"
        aria-label="Desktop Main Navigation"
      >
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center text-paper shadow-sm">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif-journal font-bold text-ink leading-tight">
                Carbon Ledger
              </h1>
              <span className="text-[10px] tracking-wider text-graphite uppercase font-semibold">
                Field Journal
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <ul className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeView === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveView(tab.id as ActiveView)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-clay text-white shadow-sm font-bold' 
                        : 'text-graphite hover:text-ink hover:bg-moss/10'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span 
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono-journal font-bold ${
                          isActive ? 'bg-white text-clay' : 'bg-leaf text-white'
                        }`}
                      >
                        {tab.badge}/5
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer info in desktop bar */}
        <div className="px-2 pt-6 border-t border-moss/10 space-y-2">
          <div className="flex items-center space-x-2 text-graphite text-[10px] font-semibold tracking-wider uppercase">
            <Globe className="w-3.5 h-3.5" />
            <span>India Grid Active</span>
          </div>
          <p className="text-[10px] text-graphite/80 leading-relaxed italic">
            Approximate calculations for footprint awareness.
          </p>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-moss/20 px-2 py-1.5 z-40 shadow-lg flex justify-around"
        aria-label="Mobile Main Navigation"
      >
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as ActiveView)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-all relative w-1/5 ${
                isActive ? 'text-clay font-bold scale-105' : 'text-graphite'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon}
              <span className="text-[9px] mt-1 tracking-tight truncate w-full text-center">
                {tab.label}
              </span>
              {tab.badge !== undefined && (
                <span className="absolute top-0.5 right-2 w-4 h-4 rounded-full bg-leaf text-white text-[8px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main 
        id="main-content" 
        className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto max-w-full"
      >
        <div className="max-w-5xl mx-auto">
          {/* Active View Dispatcher */}
          {activeView === 'dashboard' && (
            <ErrorBoundary>
              <DashboardView 
                activities={activities} 
                onNavigateToLog={() => setActiveView('log-activity')}
                onNavigateToInsights={() => setActiveView('insights')}
              />
            </ErrorBoundary>
          )}

          {activeView === 'log-activity' && (
            <ErrorBoundary>
              <LogActivityView onAddActivity={handleAddActivity} />
            </ErrorBoundary>
          )}

          {activeView === 'insights' && (
            <ErrorBoundary>
              <InsightsView activities={activities} />
            </ErrorBoundary>
          )}

          {/* Lazy-loaded views inside Suspense boundary */}
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-12 space-y-3" role="status">
              <div className="w-8 h-8 border-4 border-clay border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-serif-journal italic text-graphite">Opening Field Ledger page...</span>
            </div>
          }>
            {activeView === 'history' && (
              <ErrorBoundary>
                <LazyHistoryView 
                  activities={activities} 
                  onDeleteActivity={handleDeleteActivity}
                />
              </ErrorBoundary>
            )}

            {activeView === 'achievements' && (
              <ErrorBoundary>
                <LazyAchievementsView unlockedState={achievements} />
              </ErrorBoundary>
            )}
          </Suspense>
        </div>
      </main>

    </div>
  );
}

export default App;
