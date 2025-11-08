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

    // Identity
    if (lowerInput.includes('your name') || lowerInput.includes('who are you') || lowerInput.includes('what are you') || lowerInput.includes('who created')) {
      return `I'm CGPA Agent, built by NoskyTech for UNN students. I help with grades, solve problems, and explain concepts clearly. What do you need help with?`;
    }

    // Greetings
    if (lowerInput.match(/^(hi|hello|hey|greetings)$/)) {
      return `Hi ${user?.name}! How can I help you today?`;
    }

    // Math - Derivatives
    if (lowerInput.includes('derivative') || lowerInput.includes('differentiate')) {
      return `Let me explain derivatives step by step. The derivative shows the rate of change. Basic rules: d/dx(x^n) equals n times x^(n-1). For example, d/dx(x^3) equals 3x^2. The derivative of sine x is cosine x. The derivative of e^x stays as e^x. Tell me your specific problem and I'll walk you through it.`;
    }

    // Math - Integrals
    if (lowerInput.includes('integral') || lowerInput.includes('integrate')) {
      return `Integration is the reverse of differentiation. Here are the key rules. The integral of x^n is x^(n+1) divided by (n+1), plus C. The integral of e^x is e^x plus C. The integral of 1/x is ln of absolute x, plus C. Share your specific problem.`;
    }

    // Math - Matrices
    if (lowerInput.includes('matrix') || lowerInput.includes('matrices')) {
      return `Matrices are rectangular arrays of numbers. To add matrices, add corresponding elements. To multiply, use row times column. The determinant of a 2×2 matrix with elements a, b, c, d is ad minus bc. What matrix operation do you need help with?`;
    }

    // Math - Probability/Statistics
    if (lowerInput.includes('probability') || lowerInput.includes('statistics')) {
      return `Let's break down statistics. The mean is the average of all numbers. The median is the middle value. Probability equals favorable outcomes divided by total outcomes. For combinations, use n factorial divided by r factorial times (n minus r) factorial. What's your specific question?`;
    }

    // General Math
    const mathKeywords = ['solve', 'calculate', 'equation', 'algebra', 'geometry', 'trigonometry', 'calculus'];
    if (mathKeywords.some(k => lowerInput.includes(k)) || /[\d+\-*/^()=]/.test(userInput)) {
      return `I can solve this with you. First, identify what you know and what you need to find. Second, choose the right formula. Third, solve step by step. Fourth, check your answer. Share the details of your problem.`;
    }

    // Programming
    if (lowerInput.includes('algorithm') || lowerInput.includes('programming') || lowerInput.includes('code') || lowerInput.includes('logic')) {
      return `Let me explain programming concepts clearly. Variables store data. Loops repeat actions using for or while. Conditionals make decisions using if and else. Functions are reusable blocks of code. Arrays store collections of data. What specific programming topic do you need explained?`;
    }

    // Physics
    if (lowerInput.includes('physics') || lowerInput.includes('force') || lowerInput.includes('motion') || lowerInput.includes('energy')) {
      return `Physics is about understanding how things work. Force equals mass times acceleration. Kinetic energy equals one half times mass times velocity squared. Potential energy equals mass times gravity times height. Work equals force times distance. What physics concept should I explain?`;
    }

    // Chemistry
    if (lowerInput.includes('chemistry') || lowerInput.includes('chemical') || lowerInput.includes('reaction') || lowerInput.includes('molecule')) {
      return `Chemistry studies matter and reactions. Atoms have protons, neutrons, and electrons. Chemical bonds can be ionic or covalent. To balance equations, make sure atoms are equal on both sides. The number of moles equals mass divided by molar mass. What chemistry topic do you need help with?`;
    }

    // Biology
    if (lowerInput.includes('biology') || lowerInput.includes('cell') || lowerInput.includes('genetics') || lowerInput.includes('ecology')) {
      return `Biology is the study of living things. Cells have organelles like nucleus, mitochondria, and ribosomes. DNA carries genetic information. Mitosis creates identical cells. Meiosis creates sex cells. Ecosystems have producers, consumers, and decomposers. What biological concept should I explain?`;
    }

    // Explanation requests
    if (lowerInput.includes('explain') || lowerInput.includes('what is') || lowerInput.includes('how does') || lowerInput.includes('tell me about')) {
      return `I can explain that clearly. Please tell me the specific topic you want to understand. I can help with math, science, programming, or study techniques.`;
    }

    // Problem solving
    if (lowerInput.includes('problem') || lowerInput.includes('stuck') || lowerInput.includes('difficult') || lowerInput.includes('hard')) {
      return `When stuck on a problem, try this. First, read carefully and highlight key information. Second, break it into smaller parts. Third, draw a diagram if possible. Fourth, try working backwards. Take a short break if needed. I'm here to help you.`;
    }

    // Study methods
    if (lowerInput.includes('notes') || lowerInput.includes('note-taking') || lowerInput.includes('study method')) {
      return `Good note-taking is essential. Use the Cornell Method: divide your page into notes, cues, and summary sections. Review your notes within 24 hours. Test yourself regularly using active recall. Teach the material to someone else. This helps you remember better.`;
    }

    // Time
    if (lowerInput.includes('time') || lowerInput.includes('what time') || lowerInput.includes('current time')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `The current time is ${timeStr}.`;
    }

    // UNN
    if (lowerInput.includes('unn') || lowerInput.includes('university of nigeria') || lowerInput.includes('nsukka')) {
      if (lowerInput.includes('grading') || lowerInput.includes('system')) {
        return 'UNN uses a 5-point grading system. A grade equals 70-100 which is 5 points. B equals 60-69 which is 4 points. C equals 50-59 which is 3 points. D equals 45-49 which is 2 points. E equals 40-44 which is 1 point. F equals 0-39 which is 0 points. You need at least 40 to pass.';
      }
      return `UNN was established in 1960 as Nigeria's first indigenous university. It's known for academic excellence and producing great leaders. I'm here to help you succeed as a UNN student.`;
    }

    // Study tips
    if (lowerInput.includes('study tip') || lowerInput.includes('how to study') || lowerInput.includes('study better')) {
      return `Here are proven study strategies. First, attend every lecture. Second, review notes within 24 hours. Third, practice past questions. Fourth, join a serious study group. Fifth, use the Pomodoro Technique: study for 25 minutes, then rest for 5 minutes. Sixth, complete all CAs and assignments. Consistency beats cramming.`;
    }

    // CGPA
    if (lowerInput.includes('my cgpa') || lowerInput.includes('current cgpa') || lowerInput.includes('what is my cgpa')) {
      if (cgpa === 0) {
        return `You haven't added any courses yet. Go to the Courses page to add your grades so I can track your progress.`;
      }
      let response = `Your CGPA is ${cgpa.toFixed(2)} out of 5.0. `;
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

    // Carryovers
    if (lowerInput.includes('carryover') || lowerInput.includes('carry over') || lowerInput.includes('failed course')) {
      if (carryovers.length === 0) {
        return `Great! You have no carry-over courses.`;
      }
      return `You have ${carryovers.length} carry-over course${carryovers.length > 1 ? 's' : ''}. Here's what to do. First, understand why you struggled before. Second, get past questions. Third, attend all classes this time. Fourth, complete every assignment. You can clear these courses.`;
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

    // Improvement
    if (lowerInput.includes('improve') || lowerInput.includes('better') || lowerInput.includes('tips') || lowerInput.includes('advice')) {
      return `Here's how to improve your grades. First, never skip CAs or assignments at UNN. They add crucial marks. Second, study 2 hours daily instead of cramming. Third, practice past questions repeatedly. Fourth, ask for help early when confused. Fifth, get enough sleep. Sixth, eat well and exercise. Excellence is built through daily habits.`;
    }

    // Thank you
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return `You're welcome! I'm here whenever you need help.`;
    }

    // Default
    return `I can help you with many things. I can solve math problems, explain science concepts, help with programming, track your CGPA, or provide study tips. What do you need help with?`;
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      // Split text into sentences for better pacing
      const sentences = text.split(/([.!?]+)/).filter(s => s.trim());
      let currentIndex = 0;

      const speakNextSentence = () => {
        if (currentIndex >= sentences.length) return;

        const sentence = sentences[currentIndex] + (sentences[currentIndex + 1] || '');
        currentIndex += 2;

        const utterance = new SpeechSynthesisUtterance(sentence.trim());
        utterance.rate = 0.85; // Slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Add pause between sentences
        utterance.onend = () => {
          setTimeout(() => {
            speakNextSentence();
          }, 400); // 400ms pause between sentences
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextSentence();
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
