import React, { useState, useEffect } from 'react';
import { StudySession, SessionType, TaskCategory } from '../../types';
import { SESSION_DURATIONS } from '../../utils/constants';
import { useTimer } from '../../hooks/useTimer';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';

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
      <Card className="text-center mb-6">
        <div className="mb-4">
          <div 
            className="text-6xl font-mono font-bold mb-2"
            style={{ color: getTimerColor() }}
          >
            {timer.formattedTime}
          </div>
          <div className="text-lg text-secondary">
            {getStatusText()}
          </div>
          {activeSession && (
            <div className="text-sm text-secondary mt-1">
              {activeSession.title || `${activeSession.type} session`} • {activeSession.category}
            </div>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-3">
          {!activeSession ? (
            <Button 
              onClick={() => setIsStartModalOpen(true)}
              size="lg"
            >
              🎯 Start Session
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePauseResume}
                variant="secondary"
                size="lg"
              >
                {activeSession.isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </Button>
              <Button
                onClick={() => setIsEndModalOpen(true)}
                variant="danger"
                size="lg"
              >
                ⏹️ End Session
              </Button>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {activeSession && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${(timer.time / duration) * 100}%`,
                  backgroundColor: getTimerColor()
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary mt-1">
              <span>0:00</span>
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
      {isStartModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStartModalOpen(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Start Study Session</h3>
              
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

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Duration:</strong> {sessionType === SessionType.CUSTOM ? customDuration : SESSION_DURATIONS[sessionType]} minutes
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="secondary" 
                  onClick={() => setIsStartModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleStartSession}>
                  Start Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End Session Modal */}
      {isEndModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEndModalOpen(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">End Study Session</h3>
              
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

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm">
                    Great work! You've completed your study session. 
                    Your progress will be tracked and you'll earn XP for your effort.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="secondary" 
                  onClick={handleCancelSession}
                >
                  Skip Rating
                </Button>
                <Button onClick={handleEndSession}>
                  Complete Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTimer;
