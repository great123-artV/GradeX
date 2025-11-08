import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStoredData, saveTheme, saveVoiceEnabled, saveTutorialCompleted } from '@/lib/storage';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    about: user?.about || '',
    currentLevel: user?.currentLevel || '100',
    currentSemester: user?.currentSemester || '1',
  });

  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(
    getStoredData().theme
  );
  const [voiceEnabled, setVoiceEnabledState] = useState(getStoredData().voiceEnabled);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleSaveProfile = () => {
    updateProfile(formData);
    toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    saveTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabledState(enabled);
    saveVoiceEnabled(enabled);
    toast({
      title: enabled ? 'Voice Enabled' : 'Voice Disabled',
      description: enabled
        ? 'AI responses will now be spoken aloud'
        : 'AI responses will be text-only',
    });
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'See you next time!' });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Current Level</Label>
                <Select
                  value={formData.currentLevel}
                  onValueChange={(value) => setFormData({ ...formData, currentLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="semester">Current Semester</Label>
                <Select
                  value={formData.currentSemester}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currentSemester: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Semester</SelectItem>
                    <SelectItem value="2">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('system')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Voice Assistant</Label>
                <p className="text-sm text-muted-foreground">
                  Enable text-to-speech for AI responses
                </p>
              </div>
              <Switch checked={voiceEnabled} onCheckedChange={handleVoiceToggle} />
            </div>
          </div>
        </Card>

        {/* Tutorial */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Tutorial</h2>
          <Button
            variant="outline"
            onClick={() => {
              saveTutorialCompleted(false);
              window.location.reload();
            }}
            className="w-full"
          >
            Show Tutorial Again
          </Button>
        </Card>

        {/* Privacy Policy */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Privacy Policy</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Data Storage:</strong> All your data (grades, courses, profile) is stored locally on your device. We do not collect or transmit your personal information to any servers.
            </p>
            <p>
              <strong className="text-foreground">AI Chat:</strong> The AI assistant processes your questions locally. No chat history is stored permanently or sent to external servers.
            </p>
            <p>
              <strong className="text-foreground">Your Privacy:</strong> Your academic records and personal information remain completely private and under your control. You can delete all data by clearing your browser storage.
            </p>
            <p>
              <strong className="text-foreground">No Third Parties:</strong> We do not share your data with any third parties. This app is designed by NoskyTech specifically for UNN students with privacy in mind.
            </p>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6">
          <Button variant="destructive" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Card>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground">Powered by NoskyTech</p>
      </footer>
    </div>
  );
}
