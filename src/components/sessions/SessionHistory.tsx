import React, { useState, useMemo } from 'react';
import { StudySession, TaskCategory, SessionType } from '../../types';
import { formatDate, formatDuration, getCategoryColor } from '../../utils/helpers';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface SessionHistoryProps {
  sessions: StudySession[];
  compact?: boolean;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ 
  sessions,
  compact = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [filterType, setFilterType] = useState<SessionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'focus'>('date');

  // Only show completed sessions
  const completedSessions = sessions.filter(session => session.endTime);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    return completedSessions
      .filter(session => {
        // Search filter
        if (searchTerm && session.title && 
            !session.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }

        // Category filter
        if (filterCategory !== 'all' && session.category !== filterCategory) {
          return false;
        }

        // Type filter
        if (filterType !== 'all' && session.type !== filterType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'duration':
            return b.duration - a.duration;
          
          case 'focus':
            const focusA = a.focusScore || 0;
            const focusB = b.focusScore || 0;
            return focusB - focusA;
          
          case 'date':
          default:
            return b.startTime.getTime() - a.startTime.getTime();
        }
      });
  }, [completedSessions, searchTerm, filterCategory, filterType, sortBy]);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...Object.values(TaskCategory).map(category => ({
      value: category,
      label: category
    }))
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.values(SessionType).map(type => ({
      value: type,
      label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }))
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'duration', label: 'Duration' },
    { value: 'focus', label: 'Focus Score' }
  ];

  const sessionStats = useMemo(() => {
    const totalSessions = completedSessions.length;
    const totalTime = completedSessions.reduce((acc, s) => acc + s.duration, 0);
    const avgFocus = totalSessions > 0
      ? completedSessions
          .filter(s => s.focusScore)
          .reduce((acc, s) => acc + (s.focusScore || 0), 0) / 
        completedSessions.filter(s => s.focusScore).length
      : 0;

    const thisWeek = completedSessions.filter(s => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return s.startTime >= weekAgo;
    });

    return {
      totalSessions,
      totalTime,
      avgFocus,
      thisWeek: thisWeek.length,
      thisWeekTime: thisWeek.reduce((acc, s) => acc + s.duration, 0)
    };
  }, [completedSessions]);

  const getFocusEmoji = (score?: number) => {
    if (!score) return '❓';
    if (score >= 9) return '🔥';
    if (score >= 7) return '😊';
    if (score >= 5) return '😐';
    if (score >= 3) return '😔';
    return '😵';
  };

  const getFocusBadgeVariant = (score?: number) => {
    if (!score) return 'secondary' as const;
    if (score >= 8) return 'success' as const;
    if (score >= 6) return 'primary' as const;
    if (score >= 4) return 'warning' as const;
    return 'error' as const;
  };

  return (
    <div className="w-full">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold">{sessionStats.totalSessions}</div>
          <div className="text-sm text-secondary">Total Sessions</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold">{formatDuration(sessionStats.totalTime)}</div>
          <div className="text-sm text-secondary">Total Time</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold">
            {sessionStats.avgFocus > 0 ? sessionStats.avgFocus.toFixed(1) : '—'}
          </div>
          <div className="text-sm text-secondary">Avg Focus</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold">{sessionStats.thisWeek}</div>
          <div className="text-sm text-secondary">This Week</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select
          options={categoryOptions}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
        />
        
        <Select
          options={typeOptions}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as SessionType | 'all')}
        />
        
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'duration' | 'focus')}
        />
      </div>

      {/* Session List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-secondary mb-2">
              {completedSessions.length === 0 ? 'No sessions yet' : 'No sessions match your filters'}
            </h3>
            <p className="text-secondary">
              {completedSessions.length === 0 
                ? 'Complete your first study session to see it here!' 
                : 'Try adjusting your search or filters.'
              }
            </p>
          </div>
        ) : (
          filteredSessions.map(session => (
            <Card key={session.id} className="hover:shadow-md transition-shadow" padding={compact ? 'sm' : 'md'}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Title or Type */}
                    <h4 className="font-medium">
                      {session.title || `${session.type.replace('_', ' ')} Session`}
                    </h4>
                    
                    {/* Focus Score */}
                    {session.focusScore && (
                      <Badge variant={getFocusBadgeVariant(session.focusScore)} size="sm">
                        {getFocusEmoji(session.focusScore)} {session.focusScore}/10
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {/* Category */}
                    <Badge 
                      variant="secondary"
                      size="sm"
                      className="text-white"
                      style={{ backgroundColor: getCategoryColor(session.category) }}
                    >
                      {session.category}
                    </Badge>

                    {/* Type */}
                    <span className="text-secondary">
                      {session.type.replace('_', ' ')}
                    </span>

                    {/* Duration */}
                    <span className="text-secondary">
                      ⏱️ {formatDuration(session.duration)}
                    </span>

                    {/* Date */}
                    <span className="text-secondary">
                      📅 {formatDate(session.startTime)}
                    </span>

                    {/* XP Earned */}
                    <span className="text-blue-600 font-medium">
                      +{session.xpEarned} XP
                    </span>
                  </div>

                  {/* Notes */}
                  {session.notes && !compact && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                      <strong>Notes:</strong> {session.notes}
                    </div>
                  )}
                </div>

                {/* Session Duration Visualization */}
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {formatDuration(session.duration)}
                  </div>
                  <div className="text-xs text-secondary">
                    {formatDate(session.startTime, 'HH:mm')} - {formatDate(session.endTime!, 'HH:mm')}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
