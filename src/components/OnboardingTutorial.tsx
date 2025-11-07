import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, BookOpen, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { getStoredData, saveTutorialCompleted } from '@/lib/storage';

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    icon: <BookOpen className="w-16 h-16 text-primary" />,
    title: 'Welcome to Gradex!',
    description: 'Your intelligent CGPA calculator and academic companion. Track your grades, monitor progress, and get AI-powered guidance.',
  },
  {
    icon: <BarChart3 className="w-16 h-16 text-primary" />,
    title: 'Add Your Courses',
    description: 'Register your courses by entering course code, title, unit load, and score. Gradex uses the UNN 5.0 grading system (40 marks = pass).',
  },
  {
    icon: <MessageSquare className="w-16 h-16 text-primary" />,
    title: 'Meet CGPA Agent',
    description: 'Chat with your AI academic companion using text or voice. Get personalized advice, motivation, and study tips. Remember: 1 mark counts!',
  },
  {
    icon: <Settings className="w-16 h-16 text-primary" />,
    title: 'Customize Your Experience',
    description: 'Switch between themes, toggle voice assistant, and manage your profile in Settings. Start your journey to academic excellence!',
  },
];

export default function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const { tutorialCompleted } = getStoredData();
    if (!tutorialCompleted) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    saveTutorialCompleted(true);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="relative max-w-md w-full mx-4 p-8 animate-scale-in">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={handleSkip}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-glow-pulse">
            {slide.icon}
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">{slide.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{slide.description}</p>
          </div>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 w-full pt-4">
            {currentSlide > 0 && (
              <Button variant="outline" onClick={handlePrevious} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentSlide < slides.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>

          {currentSlide === 0 && (
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
              Skip Tutorial
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
