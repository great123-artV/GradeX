import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Sparkles, Bookmark, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SavedResponses, saveResponse } from '@/components/SavedResponses';
import { StudyTimer } from '@/components/StudyTimer';
import { supabase } from '@/integrations/supabase/client';

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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  const cgpa = getCGPA();
  const carryovers = getCarryovers();
  const currentGPA = getCurrentGPA();

  const userContext = {
    name: user?.name || 'Student',
    cgpa,
    carryoversCount: carryovers.length,
    currentGPA,
    level: user?.level,
    semester: user?.semester,
  };

  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus();

    if (!hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;
      const welcomeContent = cgpa > 0 
        ? `Hello ${userContext.name}!\n\nI'm Gradex Smart Assistant, powered by Noskytech. I can see your current CGPA is ${cgpa.toFixed(2)}${carryovers.length > 0 ? ` with ${carryovers.length} carryover(s)` : ''}.\n\nHow can I help you with your academic performance today?`
        : `Hello ${userContext.name}!\n\nI'm Gradex Smart Assistant, powered by Noskytech. I help students understand and improve their academic performance using the 5.0 grading system.\n\nYou can ask me about GPA calculations, study tips, or course planning. What would you like help with?`;
      
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    
    // Immediate feedback with blinking cursor
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      // 1.5s artificial delay for "thinking"
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gradex-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          userContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      // Start reading stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
              }
            } catch {}
          }
        }
        
        if (done) break;
      }

      // Typewriter effect
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex < fullContent.length) {
          const displayedContent = fullContent.slice(0, currentIndex + 1);
          setMessages(prev => prev.map(m => 
            m.id === assistantId ? { ...m, content: displayedContent } : m
          ));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsLoading(false);
        }
      }, 20); // Adjust speed as needed (20ms per char)

    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get AI response',
        variant: 'destructive',
      });
      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { ...m, content: "I'm having trouble connecting right now. Please try again in a moment." } : m
      ));
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
                  <h1 className="text-xl font-bold text-foreground">Gradex Smart Assistant</h1>
                  <p className="text-xs text-muted-foreground">Powered by Noskytech</p>
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
          {messages.map((message) => {
            const isLastAssistant = message.role === 'assistant' && message.id === messages[messages.length - 1]?.id;
            const showTypingBar = isLoading && isLastAssistant;
            
            return (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <Card className={`p-4 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                      {showTypingBar && (
                        <span className="inline-block w-[2px] h-4 ml-0.5 bg-primary align-middle animate-pulse" style={{ animationDuration: '0.5s' }}>|</span>
                      )}
                    </p>
                    {!showTypingBar && (
                      <p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    )}
                  </Card>
                  {message.role === 'assistant' && message.content.length > 0 && !isLoading && (
                    <Button variant="ghost" size="sm" className="self-end" onClick={() => { saveResponse(message.content); toast({ title: 'Saved!', description: 'Response saved.' }); }}>
                      <Bookmark className="w-4 h-4 mr-1" /> Save
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about CGPA, study tips, academic guidance..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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