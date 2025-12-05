import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Sparkles, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const cgpa = getCGPA();
  const carryovers = getCarryovers();
  const currentGPA = getCurrentGPA();

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
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setInput('');
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
                  <h1 className="text-xl font-bold text-foreground">Gradex Smart Assistant</h1>
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
              placeholder="Ask about CGPA, study tips, academic guidance..."
              className="flex-1"
            />
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
