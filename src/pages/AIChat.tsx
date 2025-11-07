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
      return `My name is CGPA Agent! I was created by NoskyTech specifically to help UNN students like you achieve academic excellence. I can help with your grades, solve math problems, explain concepts, and support your learning journey!`;
    }

    if (lowerInput.includes('who are you') || lowerInput.includes('what are you') || lowerInput.includes('who created you')) {
      return `I'm CGPA Agent, your intelligent academic companion built by NoskyTech! I was designed for UNN students to help you track grades, solve math problems, explain concepts, and achieve excellence. I can handle everything from calculus to programming logic. What would you like to learn today, ${user?.name}?`;
    }

    // Greetings
    if (lowerInput.match(/^(hi|hello|hey|greetings)$/)) {
      return `Hello ${user?.name}! 😊 Great to see you! I can help with your CGPA, solve math problems, explain topics, or answer questions. What's on your mind?`;
    }

    // Math problem detection - expanded
    const mathKeywords = ['solve', 'calculate', 'equation', 'derivative', 'integral', 'algebra', 'geometry', 'trigonometry', 'calculus', 'statistics', 'probability', 'matrix', 'vector', 'differential', 'limit', 'sum', 'product', 'factorial', 'logarithm', 'exponential'];
    const hasMath = mathKeywords.some(keyword => lowerInput.includes(keyword)) || /[\d+\-*/^()=]/.test(userInput);
    
    if (hasMath) {
      // Check for specific math operations
      if (lowerInput.includes('derivative') || lowerInput.includes('differentiate')) {
        return `I can help with derivatives! For basic rules: d/dx(x^n) = nx^(n-1), d/dx(sin x) = cos x, d/dx(e^x) = e^x, d/dx(ln x) = 1/x. Chain rule: d/dx(f(g(x))) = f'(g(x))·g'(x). Product rule: d/dx(uv) = u'v + uv'. Share your specific problem and I'll guide you through it, ${user?.name}!`;
      }
      if (lowerInput.includes('integral') || lowerInput.includes('integrate')) {
        return `Integration is anti-differentiation! Basic rules: ∫x^n dx = x^(n+1)/(n+1) + C, ∫e^x dx = e^x + C, ∫(1/x) dx = ln|x| + C, ∫sin x dx = -cos x + C, ∫cos x dx = sin x + C. For definite integrals, apply limits after integration. What specific integral do you need help with?`;
      }
      if (lowerInput.includes('matrix') || lowerInput.includes('matrices')) {
        return `Matrices are powerful! Key operations: Addition (add corresponding elements), Multiplication (row×column), Transpose (flip rows/columns), Determinant (ad-bc for 2×2), Inverse (A^(-1) where AA^(-1) = I). Applications include solving linear equations, transformations, and engineering problems. Need help with a specific matrix operation?`;
      }
      if (lowerInput.includes('probability') || lowerInput.includes('statistics')) {
        return `Statistics and probability are essential! Key concepts: Mean (average), Median (middle value), Mode (most frequent), Standard deviation (spread), Probability = Favorable outcomes / Total outcomes. Combinations: nCr = n!/(r!(n-r)!), Permutations: nPr = n!/(n-r)!. What statistical problem are you working on?`;
      }
      return `I see a math problem! Break it down step by step: 1) Identify what's given and what's unknown. 2) Choose the right formula or method. 3) Solve systematically. 4) Check your answer. Share more details and I'll help you work through it, ${user?.name}!`;
    }

    // Programming and logic
    if (lowerInput.includes('algorithm') || lowerInput.includes('programming') || lowerInput.includes('code') || lowerInput.includes('logic')) {
      return `I can help with programming logic! Key concepts: Variables (store data), Loops (repeat actions - for/while), Conditionals (if/else decisions), Functions (reusable code blocks), Arrays (data collections), Recursion (function calling itself). Algorithm design: 1) Understand the problem, 2) Break into smaller steps, 3) Write pseudocode, 4) Test edge cases. What specific programming topic do you need help with?`;
    }

    // Physics concepts
    if (lowerInput.includes('physics') || lowerInput.includes('force') || lowerInput.includes('motion') || lowerInput.includes('energy')) {
      return `Physics is fascinating! Core principles: Newton's Laws (F=ma, action-reaction), Energy (KE=½mv², PE=mgh), Work (W=Fd), Power (P=W/t), Momentum (p=mv), Waves (v=fλ), Electricity (V=IR, P=VI). For problem-solving: 1) List knowns and unknowns, 2) Draw diagrams, 3) Choose equations, 4) Solve and check units. What physics concept can I explain?`;
    }

    // Chemistry concepts
    if (lowerInput.includes('chemistry') || lowerInput.includes('chemical') || lowerInput.includes('reaction') || lowerInput.includes('molecule')) {
      return `Chemistry is the study of matter! Key topics: Atomic structure (protons, neutrons, electrons), Periodic table trends, Chemical bonding (ionic, covalent), Stoichiometry (mole calculations: n=m/M), Redox reactions (oxidation-reduction), Acids/Bases (pH scale), Thermodynamics (ΔH, ΔG, ΔS). Balancing equations: Ensure equal atoms on both sides. What chemistry topic do you need help with?`;
    }

    // Biology concepts
    if (lowerInput.includes('biology') || lowerInput.includes('cell') || lowerInput.includes('genetics') || lowerInput.includes('ecology')) {
      return `Biology is the science of life! Major areas: Cell biology (organelles, mitosis/meiosis), Genetics (DNA, inheritance, Punnett squares), Evolution (natural selection, adaptation), Ecology (ecosystems, food chains), Physiology (body systems), Biochemistry (proteins, carbs, lipids). Study tip: Use diagrams and flashcards for memorization. What biological concept can I explain?`;
    }

    // General explanation requests
    if (lowerInput.includes('explain') || lowerInput.includes('what is') || lowerInput.includes('how does') || lowerInput.includes('tell me about')) {
      return `I'd love to explain that! To give you the best answer, please be specific about the topic. I can explain concepts in: Mathematics (calculus, algebra, statistics), Sciences (physics, chemistry, biology), Programming (algorithms, data structures), Engineering principles, and more. What specific topic do you want me to explain, ${user?.name}?`;
    }

    // Problem-solving strategies
    if (lowerInput.includes('problem') || lowerInput.includes('stuck') || lowerInput.includes('difficult') || lowerInput.includes('hard')) {
      return `Problem-solving strategies for academic success: 1) Read carefully and underline key info. 2) Break complex problems into smaller parts. 3) Draw diagrams or visualize the problem. 4) Work backwards from what you want to find. 5) Try similar examples. 6) Don't panic - take a break if needed. 7) Verify your solution. I'm here to help you through any tough problem, ${user?.name}!`;
    }

    // Note-taking and study methods
    if (lowerInput.includes('notes') || lowerInput.includes('note-taking') || lowerInput.includes('study method')) {
      return `Effective note-taking techniques: 1) Cornell Method (divide page: notes, cues, summary). 2) Mind mapping (visual connections). 3) Outline method (hierarchical structure). 4) SQ3R (Survey, Question, Read, Recite, Review). 5) Active recall - test yourself regularly. 6) Spaced repetition - review at intervals. 7) Teach others to solidify understanding. Your notes are your academic superpower, ${user?.name}!`;
    }

    // Time queries
    if (lowerInput.includes('time') || lowerInput.includes('what time') || lowerInput.includes('current time')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return `The current time is ${timeStr} on ${dateStr}. Make every moment count in your studies, ${user?.name}!`;
    }

    // UNN-specific queries
    if (lowerInput.includes('unn') || lowerInput.includes('university of nigeria') || lowerInput.includes('nsukka')) {
      if (lowerInput.includes('about') || lowerInput.includes('what is')) {
        return 'The University of Nigeria, Nsukka (UNN) was established in 1960 as Nigeria\'s first indigenous university. It\'s known for academic excellence, groundbreaking research, and producing distinguished alumni. UNN has multiple campuses and offers diverse programs. As a UNN student, you\'re part of a proud tradition of excellence!';
      }
      if (lowerInput.includes('grading') || lowerInput.includes('system')) {
        return 'UNN uses the 5.0 grading system: A (70-100) = 5.0, B (60-69) = 4.0, C (50-59) = 3.0, D (45-49) = 2.0, E (40-44) = 1.0, F (0-39) = 0.0. A score of 40 is a pass. This system rewards excellence and I use it to calculate your CGPA accurately!';
      }
      return `UNN is a world-class institution! I was built specifically to help UNN students like you excel academically. Whether you need help with grades, concepts, or problem-solving, I'm here for you. What can I help you with today?`;
    }

    // Study tips
    if (lowerInput.includes('study tip') || lowerInput.includes('how to study') || lowerInput.includes('study better')) {
      return `Proven study strategies for UNN success: 1) Attend every lecture - first-hand learning is irreplaceable. 2) Review notes within 24 hours. 3) Practice past questions extensively. 4) Join/form study groups with serious students. 5) Use the Pomodoro Technique (25min study, 5min break). 6) Prioritize CA and assignments - they boost your final grade significantly. 7) Sleep well before exams. Consistency beats cramming, ${user?.name}!`;
    }

    // CGPA queries
    if (lowerInput.includes('my cgpa') || lowerInput.includes('current cgpa') || lowerInput.includes('what is my cgpa')) {
      if (cgpa === 0) {
        return `Hey ${user?.name}, you haven't added any courses yet. Let's get started! Add your course grades so I can track your progress and provide personalized academic guidance.`;
      }
      let response = `Your current CGPA is ${cgpa.toFixed(2)} out of 5.0. `;
      if (cgpa >= 4.5) {
        response += `Outstanding, ${user?.name}! 🌟 First-class honors territory! Your hard work is paying off. Keep this momentum!`;
      } else if (cgpa >= 3.5) {
        response += `Great work, ${user?.name}! You're performing well. With consistent effort, even higher grades are within reach!`;
      } else if (cgpa >= 2.5) {
        response += `You're progressing, ${user?.name}. Focus on CAs and assignments - they can significantly boost your grades. I believe in you!`;
      } else {
        response += `Don't worry, ${user?.name}! Every mark counts! Let's work together to improve. I'm here to help with concepts, study strategies, and motivation!`;
      }
      return response;
    }

    // Carryover queries
    if (lowerInput.includes('carryover') || lowerInput.includes('carry over') || lowerInput.includes('failed course')) {
      if (carryovers.length === 0) {
        return 'Excellent! No carry-over courses. Keep this perfect record going, ${user?.name}!';
      }
      return `You have ${carryovers.length} carry-over course${carryovers.length > 1 ? 's' : ''}. Strategy: 1) Identify why you struggled initially. 2) Get all past questions. 3) Form a study group. 4) Attend all classes this time. 5) Complete every assignment. You can absolutely turn this around, ${user?.name}!`;
    }

    // Course count
    if (lowerInput.includes('how many courses') || lowerInput.includes('course count') || lowerInput.includes('number of courses')) {
      return `You have ${currentCourses.length} course${currentCourses.length !== 1 ? 's' : ''} this semester. Managing multiple courses requires good time management and prioritization. Need study strategies?`;
    }

    // Motivation
    if (lowerInput.includes('motivate') || lowerInput.includes('encourage') || lowerInput.includes('inspiration')) {
      const motivations = [
        'Every mark counts! The difference between a B and an A could be just one assignment. Give it your all!',
        'Your potential is unlimited, ${user?.name}. Academic excellence is a journey, not a destination. Keep growing!',
        'Remember why you started. Your dreams are valid and achievable. Stay focused and consistent!',
        'Success in academics is 10% inspiration, 90% perspiration. Your hard work will pay off!',
        'You\'re capable of more than you know. Every challenge is an opportunity to prove yourself. You\'ve got this!',
      ];
      return motivations[Math.floor(Math.random() * motivations.length)];
    }

    // Improvement tips
    if (lowerInput.includes('improve') || lowerInput.includes('better') || lowerInput.includes('tips') || lowerInput.includes('advice')) {
      return `Personalized success plan for you, ${user?.name}: 1) Never skip CAs/assignments at UNN - they add crucial marks. 2) Study 2 hours daily rather than cramming. 3) Practice past questions repeatedly. 4) Seek help early when confused. 5) Form accountability partnerships. 6) Maintain good health - sleep, nutrition, exercise. 7) Stay positive and persistent. Excellence is a habit! 💪`;
    }

    // Thank you
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return `You're very welcome, ${user?.name}! 😊 I'm always here to help - whether it's grades, concepts, or problem-solving. Keep striving for excellence!`;
    }

    // Learning patterns (simulated personalization)
    if (carryovers.length > 0 && (lowerInput.includes('how') || lowerInput.includes('help'))) {
      return `I notice you have carry-over courses. Let's focus on clearing those! Strategy: 1) Dedicate extra time to these subjects. 2) Understand concepts, don't just memorize. 3) Do all assignments and attend every class. 4) Use office hours to ask lecturers questions. You can definitely overcome this, ${user?.name}!`;
    }

    // Default - more helpful
    const defaults = [
      `I can help with many things, ${user?.name}! Try asking me to: solve math problems, explain concepts (physics, chemistry, biology), help with programming logic, provide study tips, or track your CGPA. What would you like to explore?`,
      `I'm your complete academic assistant! I can solve equations, explain topics, help with problem-solving, track grades, and motivate you. What specific help do you need today?`,
      `Not quite sure what you need? I can: calculate derivatives/integrals, explain scientific concepts, solve logic problems, provide study strategies, or discuss your academic progress. Just ask, ${user?.name}!`,
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
