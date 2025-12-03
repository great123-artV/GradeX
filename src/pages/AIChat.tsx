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
import { calculateCGPA } from '@/lib/grading';
import { generateResponse, generateWelcomeMessage } from '@/lib/gradexAI';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCGPA, getCarryovers, getCurrentGPA } = useCourses();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const hasInitialized = useRef(false);

  const cgpa = getCGPA();
  const carryovers = getCarryovers();
  const currentGPA = getCurrentGPA();
  const { voiceEnabled } = getStoredData();

  const userContext = {
    name: user?.name || 'Student',
    cgpa,
    carryoversCount: carryovers.length,
    currentGPA,
  };

  // Initialize welcome message only once
  useEffect(() => {
    if (!hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;
      const welcomeMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: generateWelcomeMessage(userContext),
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

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      window.speechSynthesis.cancel();
      
      // Process text for natural speech
      const processedText = text
        .replace(/\*\*/g, '')
        .replace(/#{1,3}\s*/g, '')
        .replace(/•/g, '')
        .replace(/\|/g, '')
        .replace(/---+/g, '')
        .replace(/(\d+)\.(\d+)/g, (_, before, after) => {
          const afterDigits = after.split('').join(' ');
          return `${before} point ${afterDigits}`;
        });
      
      // Split into sentences for natural pauses
      const sentences = processedText.split(/\n\n+/).filter(s => s.trim());
      
      // Get available voices and prefer female voice
      const getPreferredVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const femaleVoices = voices.filter(v => 
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('victoria') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('moira') ||
          v.name.toLowerCase().includes('tessa') ||
          v.name.toLowerCase().includes('fiona') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Microsoft Zira')
        );
        return femaleVoices[0] || voices.find(v => v.lang.startsWith('en')) || voices[0];
      };
      
      const speakSentences = (index: number) => {
        if (index >= sentences.length) return;
        
        const utterance = new SpeechSynthesisUtterance(sentences[index]);
        utterance.rate = 0.95;
        utterance.pitch = 0.98;
        utterance.volume = 1.0;
        
        const voice = getPreferredVoice();
        if (voice) utterance.voice = voice;
        
        utterance.onend = () => {
          setTimeout(() => speakSentences(index + 1), 350);
        };
        
        window.speechSynthesis.speak(utterance);
      };
      
      // Ensure voices are loaded before speaking
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => speakSentences(0);
      } else {
        speakSentences(0);
      }
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

    const response = generateResponse(input, userContext, calculateCGPA);

    const assistantResponse: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
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
          const response = generateResponse(transcript, userContext, calculateCGPA);
          const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: transcript, timestamp: new Date() };
          const assistantResponse: Message = { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date() };
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
                  <h1 className="text-xl font-bold text-foreground">Liona</h1>
                  <p className="text-xs text-muted-foreground">Academic Assistant by Noskytech</p>
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
              <div className="flex flex-col gap-2 max-w-[85%]">
                <Card className={`p-4 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
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
              placeholder="Ask about CGPA, study tips, UNN policies..."
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
      <footer className="py-3 text-center border-t border-border bg-card/50">
        <p className="text-xs">
          <span className="text-muted-foreground">Powered by </span>
          <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">NoskyTech</span>
        </p>
      </footer>
    </div>
  );
}
