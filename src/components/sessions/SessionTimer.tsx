import React, { useState, useEffect } from 'react';
import { StudySession, SessionType, TaskCategory } from '../../types';
import { SESSION_DURATIONS } from '../../utils/constants';
import { useTimer } from '../../hooks/useTimer';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';

interface SessionTimerProps {
  activeSession?: StudySession;
  onStartSession: (sessionData: any) => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onEndSession: (focusScore?: number, notes?: string) => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  activeSession,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onEndSession
}) => {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.POMODORO);
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.STUDY);
  const [title, setTitle] = useState('');
  const [customDuration, setCustomDuration] = useState(60);
  const [focusScore, setFocusScore] = useState<number>(8);
  const [notes, setNotes] = useState('');

  const duration = sessionType === SessionType.CUSTOM 
    ? customDuration * 60 
    : SESSION_DURATIONS[sessionType] * 60;

  const timer = useTimer({
    initialTime: duration,
    countDown: true,
    onComplete: () => {
      // Auto-open end session modal when timer completes
      setIsEndModalOpen(true);
    }
  });

  // Sync timer with active session
  useEffect(() => {
    if (activeSession && !activeSession.endTime) {
      if (activeSession.isPaused) {
        timer.pause();
      } else if (activeSession.isActive) {
        if (!timer.isActive) {
          timer.start();
        } else if (timer.isPaused) {
          timer.resume();
        }
      }
    } else if (!activeSession) {
      timer.reset();
    }
  }, [activeSession, timer]);

  const handleStartSession = () => {
    const sessionData = {
      title: title.trim() || undefined,
      category,
      type: sessionType,
      duration: sessionType === SessionType.CUSTOM ? customDuration : undefined
    };

    onStartSession(sessionData);
    timer.start();
    setIsStartModalOpen(false);
    setTitle('');
  };

  const handlePauseResume = () => {
    if (activeSession?.isPaused) {
      onResumeSession();
      timer.resume();
    } else {
      onPauseSession();
      timer.pause();
    }
  };

  const handleEndSession = () => {
    onEndSession(focusScore, notes.trim() || undefined);
    timer.reset();
    setIsEndModalOpen(false);
    setFocusScore(8);
    setNotes('');
  };

  const handleCancelSession = () => {
    onEndSession(); // End without focus score/notes
    timer.reset();
    setIsEndModalOpen(false);
  };

  const sessionTypeOptions = Object.values(SessionType).map(type => ({
    value: type,
    label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  const categoryOptions = Object.values(TaskCategory).map(cat => ({
    value: cat,
    label: cat
  }));

  const getTimerColor = () => {
    if (!activeSession) return 'var(--color-primary)';
    if (activeSession.isPaused) return 'var(--color-warning)';
    return 'var(--color-primary)';
  };

  const getStatusText = () => {
    if (!activeSession) return 'Ready to start';
    if (activeSession.isPaused) return 'Paused';
    if (activeSession.isActive) return 'In Progress';
    return 'Session ended';
  };

  return (
    <div className="w-full">
      {/* Timer Display */}
      <Card variant="glass" className="text-center mb-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 animate-float" />
        </div>
        
        <div className="relative z-10 mb-6">
          <div 
            className="text-7xl md:text-8xl font-mono font-bold mb-4 animate-pulse"
            style={{ 
              color: getTimerColor(),
              textShadow: activeSession && !activeSession.isPaused ? `0 0 30px ${getTimerColor()}40` : 'none'
            }}
          >
            {timer.formattedTime}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-lg text-secondary mb-2">
            <Icon 
              name={activeSession ? (activeSession.isPaused ? 'pause' : 'play') : 'timer'} 
              size={20} 
              color={getTimerColor()}
            />
            <span>{getStatusText()}</span>
          </div>
          
          {activeSession && (
            <div className="text-sm text-secondary mt-2 flex items-center justify-center gap-2">
              <Icon name="book" size={16} />
              <span>{activeSession.title || `${activeSession.type} session`}</span>
              <span>•</span>
              <span>{activeSession.category}</span>
            </div>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-4 mb-6">
          {!activeSession ? (
            <Button 
              onClick={() => setIsStartModalOpen(true)}
              size="lg"
              variant="gradient"
              icon="play"
              className="px-8 py-4 text-lg font-semibold animate-bounce"
            >
              Start Session
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePauseResume}
                variant="secondary"
                size="lg"
                icon={activeSession.isPaused ? 'play' : 'pause'}
                className="hover:scale-105 transition-transform"
              >
                {activeSession.isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                onClick={() => setIsEndModalOpen(true)}
                variant="danger"
                size="lg"
                icon="stop"
                className="hover:scale-105 transition-transform"
              >
                End Session
              </Button>
            </>
          )}
        </div>

        {/* Enhanced Progress Bar */}
        {activeSession && (
          <div className="mt-6">
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{
                  width: `${(timer.time / duration) * 100}%`,
                  background: `linear-gradient(90deg, ${getTimerColor()}, ${getTimerColor()}dd)`
                }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
              
              {/* Progress indicator */}
              <div 
                className="absolute top-0 w-1 h-full bg-white rounded-full shadow-lg transition-all duration-1000"
                style={{ left: `${(timer.time / duration) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-secondary mt-2">
              <span>0:00</span>
              <span className="font-medium">{Math.round(((duration - timer.time) / duration) * 100)}% remaining</span>
              <span>{Math.floor(duration / 60)}:00</span>
            </div>
          </div>
        )}
      </Card>

      {/* Session Quick Stats */}
      {activeSession && (
        <Card padding="sm" className="mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">
                {Math.floor((Date.now() - activeSession.startTime.getTime()) / (1000 * 60))}m
              </div>
              <div className="text-xs text-secondary">Elapsed</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {activeSession.type}
              </div>
              <div className="text-xs text-secondary">Type</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {activeSession.category}
              </div>
              <div className="text-xs text-secondary">Category</div>
            </div>
          </div>
        </Card>
      )}

      {/* Start Session Modal */}
      <Modal 
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="Start Study Session"
        variant="glass"
        size="md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
                <Input
                  label="Session Title (Optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Math homework, Reading chapter 5..."
                />

                <Select
                  label="Session Type"
                  options={sessionTypeOptions}
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as SessionType)}
                />

                {sessionType === SessionType.CUSTOM && (
                  <Input
                    label="Duration (minutes)"
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(parseInt(e.target.value) || 60)}
                    min="1"
                    max="300"
                  />
                )}

                <Select
                  label="Category"
                  options={categoryOptions}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                />

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="clock" size={16} className="text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Session Duration</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {sessionType === SessionType.CUSTOM ? customDuration : SESSION_DURATIONS[sessionType]} minutes
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setIsStartModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="gradient"
              onClick={handleStartSession}
              icon="play"
            >
              Start Session
            </Button>
          </div>
        </div>
      </Modal>

      {/* End Session Modal */}
      <Modal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        title="End Study Session"
        variant="glass"
        size="md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    How was your focus? (1-10)
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setFocusScore(score)}
                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                          focusScore === score
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-secondary mt-1">
                    1 = Very distracted, 10 = Perfect focus
                  </p>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-1">
                    Session Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you accomplish? Any insights or reflections?"
                    className="input textarea"
                    rows={3}
                  />
                </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="trophy" size={16} className="text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Great Work!</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                You've completed your study session. Your progress will be tracked and you'll earn XP for your effort.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={handleCancelSession}
            >
              Skip Rating
            </Button>
            <Button 
              variant="gradient"
              onClick={handleEndSession}
              icon="check"
            >
              Complete Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SessionTimer;
