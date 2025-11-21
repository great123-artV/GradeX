import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Mic, MicOff, Sparkles, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStoredData } from '@/lib/storage';
import { SavedResponses, saveResponse } from '@/components/SavedResponses';
import { StudyTimer } from '@/components/StudyTimer';
import { Course } from '@/lib/grading';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Helper function to get a random item from an array
const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export default function AIChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCGPA, getCGPADetails, getCarryovers, getCurrentSemesterCourses, getCurrentGPA } = useCourses();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const cgpa = getCGPA();
  const carryovers = getCarryovers();
  const { voiceEnabled } = getStoredData();
  const hasInitialized = useRef(false);

  // Initialize welcome message only once
  useEffect(() => {
    if (!hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;
      const welcomeTemplates = [
        `Hello ${user?.name}! I'm Cipher, your academic assistant. Your current CGPA is ${cgpa.toFixed(2)}. How can I help you navigate your studies today?`,
        `Welcome back, ${user?.name}! Your CGPA is currently ${cgpa.toFixed(2)}. What academic goals can we tackle together?`,
        `Hi ${user?.name}! It's Cipher. With a CGPA of ${cgpa.toFixed(2)}, you're on your way. Let's figure out what's next.`
      ];
      const welcomeMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getRandomItem(welcomeTemplates),
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
      if (voiceEnabled) {
        speakMessage(welcomeMsg.content);
      }
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Intent Handlers ---

  const handleGreeting = () => {
    const greetings = [
      `Hi ${user?.name}! How can I assist with your academics today?`,
      `Hello there! Ready to strategize for success?`,
      `Welcome! What's on your mind regarding your studies?`
    ];
    return getRandomItem(greetings);
  };

  const handleCgpaQuery = () => {
    if (cgpa === 0) {
      return `It looks like you haven't added any courses yet. Once you do, I can track your CGPA progress right here.`;
    }
    const responses = {
      firstClass: `Your CGPA is ${cgpa.toFixed(2)}. That's first-class territory—excellent work!`,
      secondClassUpper: `You're at ${cgpa.toFixed(2)}, which is a strong Second Class Upper. Keep up the great work!`,
      secondClassLower: `Your CGPA is currently ${cgpa.toFixed(2)}. You're making steady progress; let's keep pushing.`,
      pass: `With a CGPA of ${cgpa.toFixed(2)}, there's room for improvement. Every small effort counts.`
    };
    if (cgpa >= 4.5) return responses.firstClass;
    if (cgpa >= 3.5) return responses.secondClassUpper;
    if (cgpa >= 2.5) return responses.secondClassLower;
    return responses.pass;
  };

  const handleGpaQuery = () => {
    const currentGPA = getCurrentGPA();
    if (currentGPA === 0) {
      return `No courses have been added for this semester yet, so I can't calculate your GPA.`;
    }
    return `Your GPA for the current semester is ${currentGPA.toFixed(2)}.`;
  };

  const handleCarryoverQuery = () => {
    if (carryovers.length === 0) {
      return `Great news! You have no carry-over courses. Keep up the excellent work.`;
    }
    return `You have ${carryovers.length} carry-over course${carryovers.length > 1 ? 's' : ''}. The key is to understand past challenges, get relevant materials, and stay consistent. You can clear them.`;
  };

  const handleAcademicNavigation = (input: string) => {
    if (input.includes('lost result') || input.includes('missing result')) {
      return `For a missing result, your first point of contact should be your Course Adviser. They can check departmental records. If they can't help, the Faculty Office is your next stop.`;
    }
    if (input.includes('deadline')) {
      return `If you've missed a deadline, it's best to speak directly with the lecturer in charge. If that doesn't resolve it, your Course Adviser can provide guidance on the next steps.`;
    }
    return `For academic issues, your Course Adviser is usually the best person to ask first. If it's a serious issue, you might need to speak with your Head of Department (HOD).`;
  };

  const handleEmotionalIntelligence = () => {
    const responses = [
      `I understand that this can be disheartening. Remember that your CGPA doesn't define you. Let's focus on small, consistent steps to improve next semester.`,
      `It's completely normal to feel frustrated. The key is to turn that feeling into fuel. What's one course you think you can improve in?`,
      `I hear you. Setbacks are temporary. Let's identify the courses pulling your CGPA down and make a plan to tackle them.`
    ];
    return getRandomItem(responses);
  };

  const getDynamicTip = (courses: Omit<Course, 'id' | 'grade' | 'title' | 'semester' | 'level'>[]) => {
    const lowestCourse = courses.reduce((lowest, course) => course.score < lowest.score ? course : lowest, courses[0]);
    const tips = [
      `For ${lowestCourse.code}, try using active recall and practice quizzes to strengthen your weak areas.`,
      `To boost your grade in ${lowestCourse.code}, focus on reviewing past questions and attending all tutorials.`,
      `A little extra focus on ${lowestCourse.code} could make a big difference. Try summarizing each lecture in your own words.`
    ];
    return `💡 Tip: ${getRandomItem(tips)}`;
  };

  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Intent Detection
    if (lowerInput.match(/^(hi|hello|hey|greetings)$/)) return handleGreeting();
    if (lowerInput.includes('my cgpa') || lowerInput.includes('what is my cgpa')) return handleCgpaQuery();
    if (lowerInput.includes('gpa')) return handleGpaQuery();
    if (lowerInput.includes('carryover')) return handleCarryoverQuery();
    if (lowerInput.includes('who to meet') || lowerInput.includes('lost result') || lowerInput.includes('deadline')) {
      return handleAcademicNavigation(lowerInput);
    }
    if (lowerInput.includes('frustrated') || lowerInput.includes('sad') || lowerInput.includes('disappointed') || lowerInput.includes('lower than i expected')) {
      return handleEmotionalIntelligence();
    }

    // CGPA Calculation
    if (lowerInput.includes('calculate') && lowerInput.includes('cgpa')) {
      const courseRegex = /(\w+\d+)\s*\((\d+)\s*u(?:nits?)?,\s*(\d+)\)/g;
      const priorRegex = /prior cgpa:\s*(\d+\.\d+)\s*across\s*(\d+)\s*units/g;

      const courses: Omit<Course, 'id' | 'grade' | 'title' | 'semester' | 'level'>[] = [];
      let match;
      while ((match = courseRegex.exec(lowerInput)) !== null) {
        courses.push({
          code: match[1].toUpperCase(),
          units: parseInt(match[2], 10),
          score: parseInt(match[3], 10),
        });
      }

      const priorMatch = priorRegex.exec(lowerInput);
      const prior = priorMatch
        ? { cgpa: parseFloat(priorMatch[1]), units: parseInt(priorMatch[2], 10) }
        : { cgpa: 0, units: 0 };

      if (courses.length === 0) {
        return "Please provide course details in the format: `CODE (X units, Y score)`. You can also include prior CGPA like `Prior CGPA: 2.85 across 60 units`.";
      }

      const result = getCGPADetails(courses, prior);
      const steps = result.steps.join('\n');
      const finalCGPA = result.cumulativeCGPADisplay;

      const tip = getDynamicTip(courses);
      let interpretation = '';
      if (finalCGPA >= 4.5) {
        interpretation = `This is an outstanding result that puts you in the First Class honors category. Keep up the excellent work!`;
      } else if (finalCGPA >= 3.5) {
        interpretation = `You're in the Second Class Upper division, which is a strong academic standing. Well done!`;
      } else if (finalCGPA >= 2.5) {
        interpretation = `This places you in the Second Class Lower division. You're making steady progress.`;
      } else {
        interpretation = `This is a Pass. Let's focus on strategies to boost this in the coming semester.`;
      }
      return `Alright, let’s break this down carefully.\n\n${steps}\n\n**New CGPA: ${finalCGPA}.**\n\n${interpretation}\n\n${tip}`;
    }

    // Study Plan
    if (lowerInput.includes('study plan') || lowerInput.includes('help me plan')) {
      return `Great, let’s map this out so you can maximize each day:\n\n- **Days 1–3:** Create concise notes for each course. Identify weak areas first.\n- **Days 4–7:** Active recall + past questions. Use 25/5 Pomodoro cycles.\n- **Days 8–9:** Mixed practice under timed conditions. Review errors carefully.\n- **Day 10:** Light review, sleep early, glance through formulas and definitions.\n\nRemember: “Small daily wins compound.” Even mastering one topic per day brings massive results.`;
    }

    // Refusal (Safety)
    if (lowerInput.includes('exam answers') || lowerInput.includes('exam leaks')) {
      return `I’m here to help you learn, not break rules. I cannot provide exam answers.\n\nHere’s what you can do:\n\n- Create a targeted study plan\n- I can generate practice questions for the exact topics\n- Ask your lecturer for clarifications on tricky areas\n\nWhich of these would you like to start with?`;
    }

    // Default
    return `I can help with CGPA calculations, study plans, and UNN grading info. What do you need?`;
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      window.speechSynthesis.cancel();
      const processedText = text.replace(/(\d+)\.(\d+)/g, (match, before, after) => {
        const afterDigits = after.split('').join(' ');
        return `${before} point ${afterDigits}`;
      });
      const utterance = new SpeechSynthesisUtterance(processedText);
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
      await navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast({ title: 'Listening...', description: 'Speak now' });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        
        setTimeout(() => {
          const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: transcript, timestamp: new Date() };
          const assistantResponse: Message = { id: crypto.randomUUID(), role: 'assistant', content: generateResponse(transcript), timestamp: new Date() };
          setMessages((prev) => [...prev, userMessage, assistantResponse]);
          if (voiceEnabled) speakMessage(assistantResponse.content);
          setInput('');
        }, 500);
        
        toast({ title: 'Heard you!', description: `"${transcript}"` });
      };

      recognition.onerror = (event: any) => {
        let errorMsg = 'Voice input error. Please try again.';
        if (event.error === 'no-speech') errorMsg = 'No speech detected.';
        else if (event.error === 'audio-capture') errorMsg = 'Microphone not detected.';
        else if (event.error === 'not-allowed') errorMsg = 'Microphone access denied.';
        toast({ title: 'Voice Error', description: errorMsg, variant: 'destructive' });
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      toast({
        title: 'Microphone Access Required',
        description: 'Please enable microphone access in your browser settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
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
            <div className="flex items-center gap-2">
              <StudyTimer />
              <SavedResponses />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className="flex flex-col gap-2 max-w-[80%]">
                <Card className={`p-4 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </Card>
                {message.role === 'assistant' && (
                  <Button variant="ghost" size="sm" className="self-end" onClick={() => { saveResponse(message.content); toast({ title: 'Saved!', description: 'Response saved.' }); }}>
                    <Bookmark className="w-4 h-4 mr-1" /> Save
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
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
            <Button variant={isListening ? 'default' : 'outline'} size="icon" onClick={toggleVoiceInput} className={isListening ? 'animate-glow-pulse' : ''}>
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      <footer className="py-3 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">Powered by NoskyTech</p>
      </footer>
    </div>
  );
}
