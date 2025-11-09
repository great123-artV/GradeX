import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Trash2, AlertCircle, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Courses() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { getCurrentSemesterCourses, getCurrentGPA, getCarryovers, deleteCourse } = useCourses();
  const { toast } = useToast();

  const currentCourses = getCurrentSemesterCourses();
  const gpa = getCurrentGPA();
  const carryovers = getCarryovers();
  
  const [expectedCourses, setExpectedCourses] = useState<number>(
    user?.expectedCoursesThisSemester || 0
  );
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  const remainingCourses = Math.max(0, expectedCourses - currentCourses.length);

  const handleSaveExpectedCourses = () => {
    if (expectedCourses > 0) {
      updateProfile({ ...user!, expectedCoursesThisSemester: expectedCourses });
      setIsEditingTarget(false);
      toast({
        title: 'Target Set',
        description: `You've set a target of ${expectedCourses} courses this semester.`,
      });
    }
  };

  const handleDelete = (id: string, courseCode: string) => {
    deleteCourse(id);
    toast({
      title: 'Course Deleted',
      description: `${courseCode} has been removed from your records.`,
    });
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-success';
    if (grade === 'B') return 'text-primary';
    if (grade === 'C' || grade === 'D') return 'text-accent';
    if (grade === 'E') return 'text-muted-foreground';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
              <p className="text-sm text-muted-foreground">
                Level {user?.currentLevel} • Semester {user?.currentSemester}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-3xl font-bold text-primary">{gpa.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Semester GPA</div>
              </div>
              
              {expectedCourses > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {remainingCourses}
                    </div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isEditingTarget ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingTarget(true)}
                >
                  <Target className="w-4 h-4 mr-2" />
                  {expectedCourses > 0 ? 'Edit Target' : 'Set Target'}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={expectedCourses || ''}
                    onChange={(e) => setExpectedCourses(parseInt(e.target.value) || 0)}
                    className="w-20 h-9"
                    placeholder="0"
                  />
                  <Button size="sm" onClick={handleSaveExpectedCourses}>
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditingTarget(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <Button onClick={() => navigate('/add-course')}>Add Course</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Current Courses */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Current Semester</h2>
          <div className="space-y-3">
            {currentCourses.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No courses added yet</p>
                <Button onClick={() => navigate('/add-course')}>Add Your First Course</Button>
              </Card>
            ) : (
              currentCourses.map((course) => (
                <Card key={course.id} className="p-4 hover:shadow-elevated transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-primary">
                          {course.code}
                        </span>
                        <span className={`text-2xl font-bold ${getGradeColor(course.grade)}`}>
                          {course.grade}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground mb-2">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{course.units} Units</span>
                        <span>Score: {course.score}/100</span>
                        <span>{course.grade === 'F' ? 'Carryover' : 'Passed'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/edit-course/${course.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(course.id, course.code)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Carryovers */}
        {carryovers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">Carry-over Courses</h2>
            </div>
            <div className="space-y-3">
              {carryovers.map((course) => (
                <Card
                  key={course.id}
                  className="p-4 border-destructive/30 bg-destructive/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-destructive">
                          {course.code}
                        </span>
                        <span className="text-2xl font-bold text-destructive">{course.grade}</span>
                      </div>
                      <h3 className="font-medium text-foreground mb-2">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{course.units} Units</span>
                        <span>Score: {course.score}/100</span>
                        <span className="text-destructive">Needs Retake</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-sm">
          <span className="text-xs text-muted-foreground">Powered by</span>
          <span className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent">
            NoskyTech
          </span>
        </div>
      </footer>
    </div>
  );
}
