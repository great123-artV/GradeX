import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Mic, MicOff, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStoredData } from '@/lib/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCGPA, getCarryovers, getCurrentSemesterCourses } = useCourses();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const cgpa = getCGPA();
  const carryovers = getCarryovers();
  const currentCourses = getCurrentSemesterCourses();
  const { voiceEnabled } = getStoredData();

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Hello ${user?.name}! I'm your CGPA Agent, created by NoskyTech to help you achieve academic excellence. Your current CGPA is ${cgpa.toFixed(2)}. How can I assist you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
      if (voiceEnabled) {
        speakMessage(welcomeMsg.content);
      }
    }

    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Grading system queries
    if (lowerInput.includes('grading') || lowerInput.includes('grade scale')) {
      return 'We use the UNN 5.0 grading system: A (70-100) = 5.0, B (60-69) = 4.0, C (50-59) = 3.0, D (45-49) = 2.0, E (40-44) = 1.0, F (0-39) = 0.0. Remember, 40 is a pass, anything below is a fail.';
    }

    // CGPA queries
    if (lowerInput.includes('my cgpa') || lowerInput.includes('current cgpa')) {
      if (cgpa === 0) {
        return 'You haven\'t added any courses yet. Start by adding your course grades to calculate your CGPA!';
      }
      let response = `Your current CGPA is ${cgpa.toFixed(2)} out of 5.0. `;
      if (cgpa >= 4.5) {
        response += 'Outstanding! You\'re in the first-class zone. Keep up this excellent work!';
      } else if (cgpa >= 3.5) {
        response += 'Great work! You\'re performing well. Every mark counts towards your goals.';
      } else if (cgpa >= 2.5) {
        response += 'You\'re making progress. Focus on your CAs and assignments to boost your grades.';
      } else {
        response += 'Remember, 1 mark counts! Let\'s work together to improve your performance.';
      }
      return response;
    }

    // Carryover queries
    if (lowerInput.includes('carryover') || lowerInput.includes('carry over') || lowerInput.includes('fail')) {
      if (carryovers.length === 0) {
        return 'Great news! You have no carry-over courses. Keep maintaining this excellent record!';
      }
      return `You have ${carryovers.length} carry-over course${carryovers.length > 1 ? 's' : ''}. Don't worry, you can retake ${carryovers.length > 1 ? 'them' : 'it'} and improve. Remember, 1 mark counts - every point matters!`;
    }

    // Course count
    if (lowerInput.includes('how many courses') || lowerInput.includes('course count')) {
      return `You currently have ${currentCourses.length} course${currentCourses.length !== 1 ? 's' : ''} registered for this semester.`;
    }

    // Motivation
    if (lowerInput.includes('motivate') || lowerInput.includes('encourage') || lowerInput.includes('inspiration')) {
      const motivations = [
        'Remember, 1 mark counts! Every single point can make the difference between grades.',
        'Your academic journey is unique. Focus on your CAs and assignments - they can significantly boost your grades.',
        'Excellence is not an accident, it\'s a choice. You\'re already making that choice by using Gradex!',
        'Small consistent efforts lead to remarkable results. Keep pushing!',
        'Every great achievement starts with a decision to try. You\'ve got this!',
      ];
      return motivations[Math.floor(Math.random() * motivations.length)];
    }

    // Improvement tips
    if (lowerInput.includes('improve') || lowerInput.includes('better') || lowerInput.includes('tips')) {
      return 'Here are some tips to improve your CGPA: 1) Never miss assignments and CAs - they can add crucial marks. 2) Study consistently, not just before exams. 3) Form study groups with dedicated peers. 4) Seek help early when struggling with a course. 5) Remember, 1 mark counts!';
    }

    // About the agent
    if (lowerInput.includes('who are you') || lowerInput.includes('what are you')) {
      return 'I\'m CGPA Agent, created by NoskyTech to help students like you achieve academic excellence. I\'m here to track your progress, offer guidance, and remind you that every mark counts!';
    }

    // Default responses
    const defaults = [
      'That\'s an interesting question! As your CGPA Agent, I\'m here to help with your academic journey. Ask me about your CGPA, courses, or tips to improve!',
      'I\'m here to support your academic success! Feel free to ask about your grades, course performance, or study strategies.',
      'Great question! Remember, I can help you track your CGPA, understand your performance, and suggest ways to improve. What would you like to know?',
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const assistantResponse: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: generateResponse(input),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantResponse]);
    
    if (voiceEnabled) {
      speakMessage(assistantResponse.content);
    }

    setInput('');
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Voice input is not supported in your browser',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-ai flex items-center justify-center shadow-glow animate-glow-pulse">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CGPA Agent</h1>
                <p className="text-xs text-muted-foreground">Your AI Academic Companion</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about your academics..."
              className="flex-1"
            />
            <Button
              variant={isListening ? 'default' : 'outline'}
              size="icon"
              onClick={toggleVoiceInput}
              className={isListening ? 'animate-glow-pulse' : ''}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">Powered by NoskyTech</p>
      </footer>
    </div>
  );
}
