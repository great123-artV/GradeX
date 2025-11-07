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
        content: `Hello ${user?.name}! I'm your CGPA Agent, built by NoskyTech specifically to help UNN students achieve academic excellence. Your current CGPA is ${cgpa.toFixed(2)}. I'm here to guide you, motivate you, and help you succeed. How can I assist you today?`,
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

    // Identity queries - PRIORITY
    if (lowerInput.includes('your name') || lowerInput.includes('what is your name') || lowerInput.includes("what's your name")) {
      return `My name is CGPA Agent! I was created by NoskyTech specifically to help UNN students like you achieve academic excellence. I'm here to support you every step of the way!`;
    }

    if (lowerInput.includes('who are you') || lowerInput.includes('what are you') || lowerInput.includes('who created you')) {
      return `I'm CGPA Agent, your friendly academic companion built by NoskyTech! I was designed specifically for UNN students to help you track your progress, stay motivated, and achieve excellence. I learn from your academic patterns and adapt my advice to help you succeed. Remember, every mark counts!`;
    }

    // Greetings
    if (lowerInput.match(/^(hi|hello|hey|greetings)$/)) {
      return `Hello ${user?.name}! 😊 It's great to see you! How can I help you with your academic journey today?`;
    }

    // Time queries
    if (lowerInput.includes('time') || lowerInput.includes('what time') || lowerInput.includes('current time')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return `The current time is ${timeStr} on ${dateStr}. Stay on top of your study schedule, ${user?.name}!`;
    }

    // UNN-specific queries
    if (lowerInput.includes('unn') || lowerInput.includes('university of nigeria') || lowerInput.includes('nsukka')) {
      if (lowerInput.includes('about') || lowerInput.includes('what is')) {
        return 'The University of Nigeria, Nsukka (UNN) is a prestigious federal university established in 1960. It\'s the first indigenous university in Nigeria, known for academic excellence and innovation. As a UNN student, you\'re part of a proud legacy!';
      }
      if (lowerInput.includes('grading') || lowerInput.includes('system')) {
        return 'UNN uses the 5.0 grading system: A (70-100) = 5.0, B (60-69) = 4.0, C (50-59) = 3.0, D (45-49) = 2.0, E (40-44) = 1.0, F (0-39) = 0.0. A score of 40 is a pass, anything below is a fail. This is the standard I use to calculate your CGPA!';
      }
      return `UNN is a world-class institution, and you're privileged to study here! I was built specifically to help UNN students like you excel academically. What would you like to know about your academic progress?`;
    }

    // Education queries
    if (lowerInput.includes('study tip') || lowerInput.includes('how to study') || lowerInput.includes('study better')) {
      return `Here are proven study tips for UNN students: 1) Start assignments early - don't wait until the last minute. 2) Attend all lectures and take detailed notes. 3) Form study groups with serious peers. 4) Practice past questions regularly. 5) Take breaks to avoid burnout. 6) Stay consistent - small daily efforts lead to big results. Remember, ${user?.name}, every mark counts!`;
    }

    // Academic calendar
    if (lowerInput.includes('semester') && (lowerInput.includes('when') || lowerInput.includes('start') || lowerInput.includes('end'))) {
      return `For the most accurate and up-to-date UNN academic calendar information, please check the official UNN website or your department's notice board. Generally, UNN runs two semesters per academic year. Stay informed and plan your studies accordingly!`;
    }

    // Grading system queries
    if (lowerInput.includes('grading') || lowerInput.includes('grade scale') || lowerInput.includes('grading system')) {
      return 'We use the UNN 5.0 grading system: A (70-100) = 5.0, B (60-69) = 4.0, C (50-59) = 3.0, D (45-49) = 2.0, E (40-44) = 1.0, F (0-39) = 0.0. Remember, 40 is a pass, anything below is a fail.';
    }

    // CGPA queries
    if (lowerInput.includes('my cgpa') || lowerInput.includes('current cgpa') || lowerInput.includes('what is my cgpa')) {
      if (cgpa === 0) {
        return `Hey ${user?.name}, you haven't added any courses yet. Let's get started! Add your course grades so I can help you track your progress and reach your academic goals.`;
      }
      let response = `Your current CGPA is ${cgpa.toFixed(2)} out of 5.0. `;
      if (cgpa >= 4.5) {
        response += `Outstanding, ${user?.name}! 🌟 You're in the first-class zone! Keep up this excellent work - UNN will be proud of you!`;
      } else if (cgpa >= 3.5) {
        response += `Great work, ${user?.name}! You're performing well. Every mark counts towards your goals. Let's keep this momentum going!`;
      } else if (cgpa >= 2.5) {
        response += `You're making progress, ${user?.name}. Focus on your CAs and assignments - they can significantly boost your grades. I believe in you!`;
      } else {
        response += `Don't worry, ${user?.name}! Remember, 1 mark counts! Let's work together to improve your performance. I'm here to help you succeed.`;
      }
      return response;
    }

    // Carryover queries
    if (lowerInput.includes('carryover') || lowerInput.includes('carry over') || lowerInput.includes('failed course')) {
      if (carryovers.length === 0) {
        return 'Great news! You have no carry-over courses. Keep maintaining this excellent record!';
      }
      return `You have ${carryovers.length} carry-over course${carryovers.length > 1 ? 's' : ''}. Don't worry, you can retake ${carryovers.length > 1 ? 'them' : 'it'} and improve. Remember, 1 mark counts - every point matters!`;
    }

    // Course count
    if (lowerInput.includes('how many courses') || lowerInput.includes('course count') || lowerInput.includes('number of courses')) {
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
    if (lowerInput.includes('improve') || lowerInput.includes('better') || lowerInput.includes('tips') || lowerInput.includes('advice')) {
      return `Here are personalized tips for you, ${user?.name}: 1) Never miss assignments and CAs - at UNN, they can add crucial marks to your final grade. 2) Study consistently, not just before exams. Small daily sessions are more effective. 3) Form study groups with dedicated peers. 4) Attend consultation hours with lecturers when struggling. 5) Practice past questions - they often repeat patterns. 6) Stay healthy - eat well, sleep enough, and exercise. Remember, 1 mark counts! You've got this! 💪`;
    }

    // Thank you
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return `You're very welcome, ${user?.name}! 😊 I'm always here to help you succeed. Keep pushing towards your academic goals - you're doing great!`;
    }

    // Learning patterns (simulated personalization)
    if (carryovers.length > 0 && (lowerInput.includes('how') || lowerInput.includes('what'))) {
      return `I notice you have ${carryovers.length} carry-over course${carryovers.length > 1 ? 's' : ''}. Let's focus on clearing ${carryovers.length > 1 ? 'those' : 'that'} first. Dedicate extra time to ${carryovers.length > 1 ? 'these courses' : 'this course'}, attend all classes, and do every assignment. You can turn this around, ${user?.name}!`;
    }

    // Default responses
    const defaults = [
      `I'm not sure I understand that question, ${user?.name}. Try asking me about your CGPA, courses, UNN grading system, study tips, or time management!`,
      `Could you rephrase that? I can help with your grades, CGPA tracking, carry-overs, UNN information, or academic advice. I'm here for you!`,
      `I didn't quite get that, ${user?.name}. Ask me about your academic performance, study strategies, UNN policies, or course information!`,
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

  const toggleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Voice input is not supported in your browser. Please use Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after permission is granted
      
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: 'Listening...',
          description: 'Speak now',
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        
        // Auto-send the message after voice input
        setTimeout(() => {
          const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: transcript,
            timestamp: new Date(),
          };

          const assistantResponse: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: generateResponse(transcript),
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, userMessage, assistantResponse]);
          
          if (voiceEnabled) {
            speakMessage(assistantResponse.content);
          }

          setInput('');
        }, 500);
        
        toast({
          title: 'Heard you!',
          description: `"${transcript}"`,
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMsg = 'Voice input error. Please try again.';
        if (event.error === 'no-speech') {
          errorMsg = 'No speech detected. Please try again.';
        } else if (event.error === 'audio-capture') {
          errorMsg = 'Microphone not detected. Check your device.';
        } else if (event.error === 'not-allowed') {
          errorMsg = 'Microphone access denied. Enable it in browser settings.';
        }
        
        toast({
          title: 'Voice Error',
          description: errorMsg,
          variant: 'destructive',
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Microphone access error:', error);
      setIsListening(false);
      toast({
        title: 'Microphone Access Required',
        description: 'Please enable microphone access in your browser settings to use voice input.',
        variant: 'destructive',
      });
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
