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
  const currentCourses = getCurrentSemesterCourses();
  const { voiceEnabled } = getStoredData();
  const hasInitialized = useRef(false);

  // Initialize welcome message only once
  useEffect(() => {
    if (!hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;
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
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // CGPA Calculation
    if (lowerInput.includes('calculate') && lowerInput.includes('cgpa')) {
      const courseRegex = /(\w+\d+)\s*\((\d+)u,\s*(\d+)\)/g;
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
        return "Please provide the course details in the format: `CODE (X-units, Y-score)`. For example, `I got MTH101 (3u, 72), CHM101 (2u, 58)`. You can also include prior CGPA like `Prior CGPA: 2.85 across 60 units`.";
      }

      const result = getCGPADetails(courses, prior);
      const steps = result.steps.join('\n');
      const finalCGPA = result.cumulativeCGPADisplay;

      const tip = `Nice work! To keep improving, focus on targeted revision for any topics you found challenging.`;
      return `Here's the calculation breakdown:\n\n${steps}\n\n**Your new CGPA is ${finalCGPA}.**\n\n${tip}`;
    }

    // Identity
    if (lowerInput.includes('your name') || lowerInput.includes('who are you') || lowerInput.includes('what are you') || lowerInput.includes('who created')) {
      return `I'm CGPA Agent, built by NoskyTech for UNN students. I specialize in CGPA tracking and study tips to help you excel academically. What do you need help with?`;
    }

    // Greetings
    if (lowerInput.match(/^(hi|hello|hey|greetings)$/)) {
      return `Hi ${user?.name}! I'm here to help with your CGPA and study strategies. How can I assist you today?`;
    }

    // Study Plan
    if (lowerInput.includes('study plan') || lowerInput.includes('help me plan')) {
      return `Of course! A good plan is key. Here’s a high-level 10-day study plan you can adapt:
      - **Days 1–3:** Map syllabus for each course; make concise notes (1 page per lecture).
      - **Days 4–7:** Active recall + past questions (Pomodoro 25/5, 4 cycles × 2 sessions/day).
      - **Days 8–9:** Mixed practice under timed conditions; self-test.
      - **Day 10:** Light review, sleep early, quick formula/facts sheet.
      Remember to use techniques like spaced repetition and interleaving. Small daily wins compound!`;
    }

    // Refusal (Safety)
    if (lowerInput.includes('exam answers') || lowerInput.includes('exam leaks')) {
      return `I can’t help with that. Sharing or requesting exam answers violates academic integrity. However, I can help you succeed ethically. Would you like a targeted study plan, practice questions for specific topics, or help emailing your lecturer for clarifications?`;
    }

    // CGPA
    if (lowerInput.includes('my cgpa') || lowerInput.includes('current cgpa') || lowerInput.includes('what is my cgpa') || lowerInput.includes('cgpa')) {
      if (cgpa === 0) {
        return `You haven't added any courses yet. Go to the Courses page to add your grades so I can track your progress.`;
      }
      let response = `Your CGPA is ${cgpa.toFixed(2)} out of 5 point 0. `;
      if (cgpa >= 4.5) {
        response += `Excellent work! You're in first-class territory. Keep it up.`;
      } else if (cgpa >= 3.5) {
        response += `Good job. You're doing well. Keep working hard.`;
      } else if (cgpa >= 2.5) {
        response += `You're making progress. Focus on your CAs and assignments to boost your grades.`;
      } else {
        response += `Let's work on improving this together. Every mark counts.`;
      }
      return response;
    }

    // GPA
    if (lowerInput.includes('gpa') || lowerInput.includes('grade point')) {
      const currentGPA = getCurrentGPA();
      if (currentGPA === 0) {
        return `You haven't added any courses for this semester yet.`;
      }
      return `Your current semester GPA is ${currentGPA.toFixed(2)} out of 5 point 0.`;
    }

    // Carryovers
    if (lowerInput.includes('carryover') || lowerInput.includes('carry over') || lowerInput.includes('failed course')) {
      if (carryovers.length === 0) {
        return `Great! You have no carry-over courses.`;
      }
      return `You have ${carryovers.length} carry-over course${carryovers.length > 1 ? 's' : ''}. Here's what to do. First, understand why you struggled before. Second, get past questions. Third, attend all classes this time. Fourth, complete every assignment. You can clear these courses.`;
    }

    // UNN Grading System
    if (lowerInput.includes('unn') || lowerInput.includes('grading') || lowerInput.includes('system') || lowerInput.includes('grade scale')) {
      return 'UNN uses a 5-point grading system. A grade equals 70 to 100 which is 5 points. B equals 60 to 69 which is 4 points. C equals 50 to 59 which is 3 points. D equals 45 to 49 which is 2 points. E equals 40 to 44 which is 1 point. F equals 0 to 39 which is 0 points. You need at least 40 to pass.';
    }

    // Study tips
    if (lowerInput.includes('study tip') || lowerInput.includes('how to study') || lowerInput.includes('study better') || lowerInput.includes('improve') || lowerInput.includes('tips') || lowerInput.includes('advice')) {
      return `Here are proven study strategies. First, attend every lecture. Second, review notes within 24 hours. Third, practice past questions. Fourth, join a serious study group. Fifth, use the Pomodoro Technique: study for 25 minutes, then rest for 5 minutes. Sixth, complete all CAs and assignments. Consistency beats cramming.`;
    }

    // Time management
    if (lowerInput.includes('time management') || lowerInput.includes('manage time') || lowerInput.includes('organize')) {
      return `Good time management is key to success. Create a weekly timetable. Allocate specific hours for each course. Prioritize assignments by deadline. Break large tasks into smaller parts. Avoid distractions during study time. Review your progress weekly.`;
    }

    // Note-taking
    if (lowerInput.includes('notes') || lowerInput.includes('note-taking') || lowerInput.includes('study method')) {
      return `Good note-taking is essential. Use the Cornell Method: divide your page into notes, cues, and summary sections. Review your notes within 24 hours. Test yourself regularly using active recall. Teach the material to someone else. This helps you remember better.`;
    }

    // Exam preparation
    if (lowerInput.includes('exam') || lowerInput.includes('test') || lowerInput.includes('prepare')) {
      return `Here's how to prepare for exams. Start early, at least 2 weeks before. Get past questions and practice them. Study in short focused sessions. Form study groups. Teach concepts to others. Sleep well before exams. Arrive early on exam day.`;
    }

    // Motivation
    if (lowerInput.includes('motivate') || lowerInput.includes('encourage') || lowerInput.includes('inspiration')) {
      const motivations = [
        `Every mark counts. One assignment can change your grade from B to A. Give your best effort.`,
        `You have great potential. Keep working hard and stay focused on your goals.`,
        `Remember why you started university. Your dreams are achievable through consistent effort.`,
        `Hard work pays off. Stay dedicated to your studies.`,
        `You can do this. Every challenge makes you stronger.`,
      ];
      return motivations[Math.floor(Math.random() * motivations.length)];
    }

    // CAs and assignments
    if (lowerInput.includes('ca') || lowerInput.includes('assignment') || lowerInput.includes('continuous assessment')) {
      return `CAs and assignments are crucial at UNN. They can add 30 to 40 marks to your total. Never miss a CA. Submit all assignments on time. Do them yourself to understand the material. These marks can move you from a lower grade to a higher one.`;
    }

    // Thank you
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return `You're welcome! I'm here whenever you need help with your CGPA or study strategies.`;
    }

    // Default - Redirect to scope
    return `I specialize in CGPA tracking and study tips. I can help you with: checking your CGPA, understanding the UNN grading system, study strategies, exam preparation, time management, and motivation. What would you like to know?`;
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      // Replace decimal points in numbers with "point" for proper pronunciation
      const processedText = text.replace(/(\d+)\.(\d+)/g, (match, before, after) => {
        const afterDigits = after.split('').join(' ');
        return `${before} point ${afterDigits}`;
      });

      // Create single utterance for the entire message
      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.rate = 0.9; // Slightly slower for clarity
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

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className="flex flex-col gap-2 max-w-[80%]">
                <Card
                  className={`p-4 ${
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
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-end"
                    onClick={() => {
                      saveResponse(message.content);
                      toast({
                        title: 'Saved!',
                        description: 'Response saved for later reference',
                      });
                    }}
                  >
                    <Bookmark className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                )}
              </div>
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
