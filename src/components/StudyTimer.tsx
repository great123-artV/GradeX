import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function StudyTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<number>();
  const { toast } = useToast();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (!isBreak) {
      setSessionsCompleted((prev) => prev + 1);
      toast({
        title: '🎉 Study Session Complete!',
        description: 'Great work! Time for a break.',
      });
      
      // Play completion sound
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Study session complete! Time for a break.');
        window.speechSynthesis.speak(utterance);
      }
      
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      toast({
        title: '✨ Break Over!',
        description: 'Ready for another productive session?',
      });
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Break time over! Ready to study?');
        window.speechSynthesis.speak(utterance);
      }
      
      setIsBreak(false);
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
  };

  const applySettings = (work: number, breakTime: number) => {
    setWorkDuration(work);
    setBreakDuration(breakTime);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(work * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Timer className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Study Timer</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Timer Display */}
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className={`text-5xl font-bold ${isBreak ? 'text-green-500' : 'text-primary'}`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-muted-foreground">
                {isBreak ? '☕ Break Time' : '📚 Study Time'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant={isRunning ? 'default' : 'outline'}
                  size="icon"
                  onClick={toggleTimer}
                >
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button variant="outline" size="icon" onClick={resetTimer}>
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{sessionsCompleted}</p>
              <p className="text-sm text-muted-foreground">Sessions Completed Today</p>
            </div>
          </Card>

          {/* Settings */}
          <TimerSettings onApply={applySettings} defaultWork={workDuration} defaultBreak={breakDuration} />

          {/* Tips */}
          <Card className="p-4 bg-muted">
            <h3 className="font-semibold mb-2 text-sm">Pomodoro Technique Tips:</h3>
            <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
              <li>Eliminate distractions during study time</li>
              <li>Use breaks to stretch and rest eyes</li>
              <li>After 4 sessions, take a longer 15-30 min break</li>
              <li>Focus on one task per session</li>
            </ul>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TimerSettings({ onApply, defaultWork, defaultBreak }: { 
  onApply: (work: number, breakTime: number) => void;
  defaultWork: number;
  defaultBreak: number;
}) {
  const [work, setWork] = useState(defaultWork);
  const [breakTime, setBreakTime] = useState(defaultBreak);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4" />
        <h3 className="font-semibold text-sm">Timer Settings</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="work-duration" className="text-xs">Study Duration (minutes)</Label>
          <Input
            id="work-duration"
            type="number"
            min="1"
            max="60"
            value={work}
            onChange={(e) => setWork(parseInt(e.target.value) || 25)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="break-duration" className="text-xs">Break Duration (minutes)</Label>
          <Input
            id="break-duration"
            type="number"
            min="1"
            max="30"
            value={breakTime}
            onChange={(e) => setBreakTime(parseInt(e.target.value) || 5)}
          />
        </div>
        <Button size="sm" className="w-full" onClick={() => onApply(work, breakTime)}>
          Apply Settings
        </Button>
      </div>
    </Card>
  );
}
