// Gradex AI - Academic Assistant for UNN Students
// Built and developed by NoskyTech

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface UserContext {
  name: string;
  cgpa: number;
  carryoversCount: number;
  currentGPA: number;
}

// Emotional detection keywords
const emotionKeywords = {
  sad: ['sad', 'depressed', 'disappointed', 'down', 'unhappy', 'failed', 'failing', 'lower than expected', 'bad result'],
  frustrated: ['frustrated', 'angry', 'annoyed', 'stressed', 'tired', 'fed up', 'hate', 'difficult'],
  confused: ['confused', 'don\'t understand', 'help me', 'lost', 'unclear', 'what does', 'how do i', 'explain'],
  happy: ['happy', 'excited', 'great', 'amazing', 'passed', 'good result', 'improved', 'better'],
};

function detectEmotion(input: string): 'sad' | 'frustrated' | 'confused' | 'happy' | null {
  const lowerInput = input.toLowerCase();
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      return emotion as 'sad' | 'frustrated' | 'confused' | 'happy';
    }
  }
  return null;
}

export function generateWelcomeMessage(user: UserContext): string {
  const templates = [
    `Hello ${user.name}! 👋 I'm Gradex AI, your friendly academic companion built by NoskyTech.\n\nYour current CGPA is ${user.cgpa.toFixed(2)}. I'm here to help you:\n\n• Track and calculate your GPA/CGPA\n• Understand UNN grading policies\n• Get personalized study tips\n• Navigate academic challenges\n\nWhat would you like to explore today?`,
    
    `Welcome back, ${user.name}! 🎓\n\nI'm Gradex AI, developed by NoskyTech to support UNN students like you.\n\nQuick snapshot:\n• Your CGPA: ${user.cgpa.toFixed(2)}\n${user.carryoversCount > 0 ? `• Carryovers: ${user.carryoversCount} course(s) to clear\n` : '• No carryovers! Great job!\n'}\nHow can I assist you today? Feel free to ask about CGPA calculations, study strategies, or any academic concerns.`,
    
    `Hi ${user.name}! Great to see you! 🌟\n\nI'm Gradex AI — your dedicated academic assistant created by NoskyTech for UNN students.\n\nLet's check in:\n• Current CGPA: ${user.cgpa.toFixed(2)}\n\nI can help with GPA/CGPA calculations, study planning, understanding grades, and more. Don't hesitate to ask anything — I'm here for you!`,
  ];
  return getRandomItem(templates);
}

export function generateGreeting(user: UserContext): string {
  const greetings = [
    `Hello ${user.name}! 😊 I'm delighted to help you today.\n\nHere are some things I can assist with:\n• Calculate your GPA or CGPA\n• Explain UNN grading policies\n• Create a personalized study plan\n• Guide you on who to meet for academic issues\n\nWhat's on your mind?`,
    
    `Hi there, ${user.name}! 👋 Welcome!\n\nAs your academic companion, I'm ready to support you with:\n• Understanding your grades and CGPA\n• Planning your study sessions\n• Navigating UNN academic procedures\n\nFeel free to ask me anything about your academics!`,
    
    `Hey ${user.name}! Great to have you here! 🎓\n\nI'm Gradex AI, built by NoskyTech to make your academic journey smoother.\n\nQuick options:\n1. Check your CGPA status\n2. Get study tips\n3. Understand grading policies\n4. Ask about academic procedures\n\nWhat would you like to explore?`,
  ];
  return getRandomItem(greetings);
}

export function generateCGPAResponse(cgpa: number, name: string): string {
  if (cgpa === 0) {
    return `Hey ${name}, it looks like you haven't added any courses yet! 📚\n\nOnce you add your courses with their scores, I'll be able to:\n• Calculate your exact CGPA\n• Show you where you stand academically\n• Give personalized improvement tips\n\nWould you like me to explain how the UNN grading system works while you set up your courses?`;
  }

  const responses = {
    firstClass: [
      `Incredible work, ${name}! 🌟🎉\n\nYour CGPA is ${cgpa.toFixed(2)} — that's First Class honors territory!\n\n**What this means:**\n• You're among the top performers at UNN\n• You've maintained exceptional consistency\n• Graduate school and scholarship opportunities await\n\n**Tips to maintain this:**\n• Don't get complacent — keep your study habits\n• Consider mentoring other students\n• Start thinking about research opportunities\n\nYou're doing amazing! Keep it up! 💪`,
      
      `Outstanding, ${name}! 🏆\n\nWith a CGPA of ${cgpa.toFixed(2)}, you're in First Class category!\n\nThis achievement reflects:\n• Excellent understanding of your courses\n• Strong time management skills\n• Dedication to your studies\n\nRemember: Consistency is key. Don't let up now — you're building something great for your future!`,
    ],
    secondClassUpper: [
      `Great job, ${name}! 👏\n\nYour CGPA is ${cgpa.toFixed(2)} — a solid Second Class Upper!\n\n**What this means:**\n• You're performing above average\n• Most employers and grad schools value this highly\n• You have room to push into First Class if you want\n\n**To improve further:**\n• Identify courses where you scored below 60\n• Focus extra effort on your weaker subjects\n• Consider forming study groups\n\nYou're on a strong path! Want me to suggest a strategy to push higher?`,
      
      `Well done, ${name}! 🎯\n\nA CGPA of ${cgpa.toFixed(2)} puts you in Second Class Upper — that's commendable!\n\nThis shows:\n• Good academic discipline\n• Solid understanding across subjects\n• Potential for even greater heights\n\nWould you like tips on how to push into First Class territory?`,
    ],
    secondClassLower: [
      `You're making progress, ${name}! 📈\n\nYour CGPA is ${cgpa.toFixed(2)} — Second Class Lower division.\n\n**The good news:**\n• You're passing and moving forward\n• There's clear room for improvement\n• Many successful people started here\n\n**Here's how to improve:**\n1. Review courses where you scored below 50\n2. Attend all tutorials and lectures\n3. Practice with past questions regularly\n4. Form study groups with serious students\n\nEvery semester is a fresh opportunity. Would you like me to help create a targeted improvement plan?`,
      
      `Hey ${name}, let's talk about your ${cgpa.toFixed(2)} CGPA. 📊\n\nYou're in Second Class Lower, and that's okay — it's a starting point, not a destination.\n\n**Action steps:**\n• Identify your 3 weakest courses\n• Dedicate extra study time to them\n• Use active recall and past questions\n• Don't skip classes or tutorials\n\nRemember: Improvement is a gradual process. Shall I help you build a study strategy?`,
    ],
    pass: [
      `${name}, let's work on this together. 💪\n\nYour CGPA is ${cgpa.toFixed(2)}. I know this might not be where you want to be, but here's the truth: **it's not the end.**\n\n**Understanding your situation:**\n• A CGPA below 2.5 means you need focused improvement\n• This doesn't define your worth or potential\n• Many students have recovered from similar positions\n\n**Practical steps:**\n1. Clear any carryover courses first\n2. Focus on understanding, not just passing\n3. Attend all classes and tutorials\n4. Study consistently, not just before exams\n5. Seek help from lecturers during office hours\n\nI believe in you. Would you like to talk about specific courses or create a recovery plan?`,
      
      `I see your CGPA is ${cgpa.toFixed(2)}, ${name}. Let's address this honestly but supportively. 🤝\n\nThis is a challenging position, but it's recoverable. Here's what matters:\n\n**Immediate priorities:**\n• Clear carryovers — they're dragging your CGPA\n• Understand why you struggled (study habits? attendance? understanding?)\n• Create a realistic study schedule\n\n**Remember:**\n• Your CGPA doesn't define your intelligence\n• Many successful professionals had rocky academic starts\n• The key is to learn from setbacks\n\nI'm here to help. What specific challenges are you facing?`,
    ],
  };

  if (cgpa >= 4.5) return getRandomItem(responses.firstClass);
  if (cgpa >= 3.5) return getRandomItem(responses.secondClassUpper);
  if (cgpa >= 2.5) return getRandomItem(responses.secondClassLower);
  return getRandomItem(responses.pass);
}

export function generateGPAResponse(gpa: number, name: string): string {
  if (gpa === 0) {
    return `${name}, it seems you haven't added any courses for this semester yet. 📝\n\nOnce you add your courses, I'll calculate your semester GPA and show you how it affects your overall CGPA.\n\nWould you like me to explain the difference between GPA and CGPA?`;
  }

  return `${name}, your GPA for this semester is ${gpa.toFixed(2)}! 📊\n\n**What this means:**\n• GPA is your performance for this semester only\n• It combines with previous semesters to form your CGPA\n${gpa >= 4.0 ? '• Excellent semester! This will boost your CGPA 🎉' : gpa >= 3.0 ? '• Solid performance! Keep building on this.' : '• There\'s room for improvement next semester.'}\n\nWould you like tips on how to maintain or improve this?`;
}

export function generateCarryoverResponse(count: number, name: string): string {
  if (count === 0) {
    return `Great news, ${name}! 🎉\n\nYou have **no carryover courses**! This is fantastic because:\n\n• Your CGPA isn't being weighed down\n• You can focus on current courses\n• You're on track for smooth progression\n\nKeep up this excellent work! Would you like some tips on maintaining this streak?`;
  }

  const responses = [
    `${name}, you have ${count} carryover course${count > 1 ? 's' : ''}. Let's tackle this together. 💪\n\n**Why carryovers matter:**\n• They affect your CGPA significantly\n• Clearing them should be a priority\n• The longer you wait, the harder it gets\n\n**Strategy to clear them:**\n1. Register for them next semester\n2. Get past questions and study materials early\n3. Attend all classes — don't repeat past mistakes\n4. Study in groups if possible\n5. Meet the lecturer for clarification\n\n**Who to meet:**\n• Course Adviser — for registration guidance\n• Department Secretary — for paperwork\n\nYou can clear these! Need specific study tips for any course?`,
    
    `I see you have ${count} carryover${count > 1 ? 's' : ''}, ${name}. Here's how we handle this: 📋\n\n**First, don't panic.** Carryovers are common and clearable.\n\n**Action plan:**\n• Prioritize them in course registration\n• Start studying early — not last minute\n• Understand why you failed (attendance? understanding? exam prep?)\n• Address the root cause\n\n**Resources to use:**\n• Past questions (very important!)\n• Tutorial sessions\n• Study groups\n• Office hours with lecturers\n\nWould you like me to help create a study plan for clearing these?`,
  ];
  return getRandomItem(responses);
}

export function generateEmotionalResponse(emotion: string, name: string): string {
  const responses = {
    sad: [
      `${name}, I can sense you're feeling down, and that's completely okay. 💙\n\nAcademic struggles can be really tough, but I want you to know:\n\n• Your grades don't define your worth\n• Setbacks are temporary — they're not your story\n• Many successful people faced similar challenges\n\n**Here's what might help:**\n1. Take a short break to clear your mind\n2. Talk to someone you trust\n3. Then, let's create a realistic plan together\n\nRemember: You reached out for help — that takes courage. What's troubling you most right now?`,
      
      `I hear you, ${name}. It's okay to feel disappointed. 🤗\n\nBut let me remind you:\n• One bad result doesn't erase your potential\n• Every semester is a fresh start\n• You're not alone in this\n\nLet's focus on what we can control:\n• Understanding what went wrong\n• Building better study habits\n• Taking it one step at a time\n\nI'm here for you. Want to talk about what happened?`,
    ],
    frustrated: [
      `I understand the frustration, ${name}. University can be incredibly stressful. 😤➡️😌\n\n**First, take a breath.** Your feelings are valid.\n\n**Let's break this down:**\n• What specifically is frustrating you?\n• Is it a particular course? The system? Time management?\n\nOnce we identify the problem, we can find solutions together.\n\n**Quick stress relievers:**\n• Step away for 10 minutes\n• Do some light exercise\n• Talk to a friend\n\nI'm here to help you work through this. What's the main issue?`,
      
      `${name}, academic stress is real and your frustration is understandable. 🌟\n\nLet's channel that energy productively:\n\n**Immediate steps:**\n1. Write down what's bothering you\n2. Identify what you can control\n3. Focus on one problem at a time\n\n**Remember:**\n• You've overcome challenges before\n• Help is available — you're using it right now!\n• This feeling will pass\n\nTell me more about what's going on. Let's find solutions together.`,
    ],
    confused: [
      `No worries, ${name}! Let me help clarify things for you. 🔍\n\nConfusion is just the first step to understanding. Here's what we can do:\n\n1. **Tell me exactly what's unclear**\n2. **I'll break it down step by step**\n3. **Ask follow-up questions until it clicks**\n\nThere are no silly questions here. What would you like me to explain?\n\n**Common topics I can clarify:**\n• How GPA/CGPA is calculated\n• UNN grading system\n• Course registration process\n• Who to meet for various issues`,
      
      `Let's clear up this confusion together, ${name}! 💡\n\nI'll explain things in simple terms:\n\n**Just tell me:**\n• What topic is confusing?\n• What do you already understand?\n• What specific part is unclear?\n\nI'll break it down until it makes sense. No rush — we'll go at your pace!`,
    ],
    happy: [
      `That's wonderful, ${name}! 🎉🎊\n\nYour positive energy is contagious! It's great to celebrate wins, big or small.\n\n**Keep this momentum going by:**\n• Documenting what worked for you\n• Maintaining your good habits\n• Helping a classmate who might be struggling\n\nSuccess breeds success! What achievement are you celebrating?`,
      
      `Love the energy, ${name}! 🌟\n\nCelebrating achievements is important — it motivates you to keep going!\n\n**While you're feeling great:**\n• Set your next goal\n• Thank anyone who helped you\n• Remember this feeling when tough times come\n\nCongratulations! What's the good news?`,
    ],
  };

  return getRandomItem(responses[emotion as keyof typeof responses] || responses.confused);
}

export function generateAcademicGuidance(input: string, name: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('lost result') || lowerInput.includes('missing result')) {
    return `${name}, here's how to handle missing results: 📋\n\n**Step-by-step guide:**\n\n1. **First, visit your Course Adviser**\n   • They have access to departmental records\n   • Bring your course registration form as evidence\n\n2. **If unresolved, go to the Departmental Office**\n   • Meet the department secretary\n   • File a formal complaint if needed\n\n3. **Then try Exams and Records**\n   • Located near Senate Building\n   • They handle result compilation\n\n4. **As a last resort**\n   • Meet the HOD with documentation\n   • Write a formal letter explaining the issue\n\n**Documents to bring:**\n• Registration printout\n• ID card\n• Any exam evidence\n\nWould you like more details on any of these steps?`;
  }

  if (lowerInput.includes('wrong grade') || lowerInput.includes('incorrect grade') || lowerInput.includes('grade error')) {
    return `${name}, here's how to address grade errors: 📝\n\n**Correction process:**\n\n1. **Meet the course lecturer first**\n   • Politely explain the discrepancy\n   • Bring your marked script if possible\n\n2. **If lecturer agrees there's an error:**\n   • They'll write a grade correction letter\n   • Submit to HOD for approval\n\n3. **Then to Exams and Records**\n   • With the approved correction letter\n   • They update the official records\n\n**Important tips:**\n• Be respectful and patient\n• Keep copies of all documents\n• Follow up regularly\n\nThis process can take 2-4 weeks. Start as early as possible!`;
  }

  if (lowerInput.includes('portal') || lowerInput.includes('login') || lowerInput.includes('ict')) {
    return `${name}, for portal and ICT issues: 💻\n\n**Where to go:**\n• UNN ICT Centre (beside CT Building)\n\n**Common issues they handle:**\n• Password reset\n• Portal login problems\n• Course registration errors\n• Payment verification\n\n**What to bring:**\n• Your UNN ID card\n• Admission letter (for freshers)\n• Payment receipt (if payment-related)\n\n**Tips:**\n• Go early — queues can be long\n• Be specific about your problem\n• Note down any reference numbers they give\n\nIs there a specific portal issue you're facing?`;
  }

  if (lowerInput.includes('deadline') || lowerInput.includes('missed') || lowerInput.includes('late')) {
    return `${name}, missed deadlines can be stressful, but there might be options: ⏰\n\n**Immediate steps:**\n\n1. **Contact the relevant authority ASAP**\n   • For course registration: Course Adviser\n   • For assignments: Course lecturer\n   • For payments: Bursary Department\n\n2. **Prepare your explanation**\n   • Be honest about why you missed it\n   • Have supporting documents if applicable\n\n3. **Request for consideration**\n   • Ask about late submission policies\n   • Some departments allow appeals\n\n**Key contacts:**\n• Course Adviser — most registration issues\n• HOD — for serious cases\n• Dean's Office — for faculty-wide deadlines\n\nWhat specific deadline did you miss?`;
  }

  // Default academic navigation
  return `${name}, for academic issues, here's your navigation guide: 🗺️\n\n**Who handles what:**\n\n📚 **Course Adviser**\n• Course registration guidance\n• Academic advice\n• First point of contact for most issues\n\n👔 **Head of Department (HOD)**\n• Serious academic matters\n• Appeals and special requests\n• Department-level decisions\n\n📋 **Departmental Secretary**\n• Paperwork and documentation\n• Verification letters\n• Administrative processes\n\n🏛️ **Faculty Office**\n• Cross-departmental issues\n• Faculty-wide policies\n\n📊 **Exams and Records**\n• Result issues\n• Transcript requests\n• Grade corrections\n\nWhat specific issue do you need help with?`;
}

export function generateStudyTips(name: string): string {
  const tips = [
    `${name}, here's a powerful study strategy to boost your grades: 📚💪\n\n**The Active Recall Method:**\n\n1. **Don't just read — test yourself**\n   • After reading a topic, close the book\n   • Write down everything you remember\n   • Check what you missed\n\n2. **Use past questions religiously**\n   • They show you exam patterns\n   • Practice under timed conditions\n   • Review your mistakes thoroughly\n\n3. **Spaced repetition**\n   • Review notes: Day 1, Day 3, Day 7, Day 14\n   • This builds long-term memory\n\n4. **Teach someone else**\n   • If you can explain it, you understand it\n   • Form study groups\n\n**Daily routine suggestion:**\n• Morning: New material (2 hours)\n• Afternoon: Practice questions (1.5 hours)\n• Evening: Review and self-test (1 hour)\n\nWould you like a specific study plan for exam preparation?`,

    `Here are study strategies that actually work, ${name}: 🎯\n\n**The Pomodoro Technique:**\n• Study for 25 minutes\n• Take a 5-minute break\n• After 4 sessions, take a 15-30 minute break\n\n**Environment matters:**\n• Find a quiet, dedicated study space\n• Remove phone distractions\n• Good lighting and ventilation\n\n**For difficult courses:**\n1. Break topics into smaller chunks\n2. Start with what you find easiest\n3. Gradually tackle harder parts\n4. Ask lecturers during office hours\n\n**Memory techniques:**\n• Create mnemonics for lists\n• Draw diagrams and flowcharts\n• Summarize in your own words\n\n**Exam preparation:**\n• Start 2-3 weeks early\n• Focus on past question patterns\n• Don't cram the night before\n\nNeed tips for a specific course?`,

    `${name}, let me share some proven study wisdom: 🌟\n\n**The 3-Phase Study System:**\n\n**Phase 1: Understanding (40% of time)**\n• Read and understand concepts\n• Watch explanatory videos if needed\n• Ask questions until clear\n\n**Phase 2: Practice (40% of time)**\n• Solve problems and past questions\n• Apply what you learned\n• Identify weak areas\n\n**Phase 3: Review (20% of time)**\n• Revisit difficult topics\n• Create summary notes\n• Test yourself\n\n**Time management:**\n• Use a planner or calendar\n• Set specific study goals daily\n• Balance study with rest\n\n**Health matters too:**\n• Get 7-8 hours of sleep\n• Exercise regularly\n• Eat well during exam periods\n\nWant me to help create a personalized study schedule?`,
  ];

  return getRandomItem(tips);
}

export function generateGradingExplanation(): string {
  return `Here's everything you need to know about UNN's grading system: 📊\n\n**The 5-Point Scale:**\n\n| Score | Grade | Points |\n|-------|-------|--------|\n| 70-100 | A | 5.0 |\n| 60-69 | B | 4.0 |\n| 50-59 | C | 3.0 |\n| 45-49 | D | 2.0 |\n| 40-44 | E | 1.0 |\n| 0-39 | F | 0.0 |\n\n**Degree Classification:**\n• First Class: 4.50 - 5.00\n• Second Class Upper: 3.50 - 4.49\n• Second Class Lower: 2.50 - 3.49\n• Third Class: 1.50 - 2.49\n• Pass: 1.00 - 1.49\n\n**Important terms:**\n• **GPA**: Grade Point Average for one semester\n• **CGPA**: Cumulative GPA across all semesters\n• **Carryover**: Course scored below 40 (must retake)\n\n**Formula:**\nGPA = Total Grade Points ÷ Total Credit Units\n\nWould you like me to calculate your GPA/CGPA?`;
}

export function generateDefaultResponse(name: string): string {
  const responses = [
    `${name}, I'm here to help with your academics! 🎓\n\nHere are some things I can assist with:\n\n• **\"What's my CGPA?\"** — Check your current standing\n• **\"Study tips\"** — Get effective study strategies\n• **\"Calculate CGPA\"** — Detailed GPA/CGPA calculation\n• **\"Carryovers\"** — Check and plan for carryover courses\n• **\"UNN grading\"** — Understand the grading system\n• **\"Who should I meet?\"** — Navigate UNN offices\n\nOr just tell me what's on your mind — I'm listening!`,

    `I'm Gradex AI, your academic companion built by NoskyTech! 💡\n\nNot sure I caught that, ${name}. Let me suggest some options:\n\n1. Ask about your CGPA or GPA\n2. Request study tips and strategies\n3. Understand UNN grading policies\n4. Get guidance on academic procedures\n5. Calculate grades step-by-step\n\nWhat would you like to explore?`,

    `Hey ${name}! Let me make sure I help you properly. 😊\n\nCould you tell me more about what you need? I specialize in:\n\n📚 **Academic calculations** — GPA, CGPA, grade predictions\n📋 **UNN policies** — Grading, carryovers, procedures\n🎯 **Study strategies** — Tips to improve performance\n🗺️ **Navigation** — Who to meet for different issues\n\nFeel free to ask in any way you're comfortable with!`,
  ];

  return getRandomItem(responses);
}

export function generateRefusalResponse(name: string): string {
  return `${name}, I understand the pressure of exams, but I can't provide exam answers or leaks. 🚫\n\nHere's why and what I CAN do instead:\n\n**Why I can't help with that:**\n• It's academic dishonesty\n• It undermines your real learning\n• It could get you expelled\n\n**What I CAN help with:**\n• Create a targeted study plan for your exams\n• Explain difficult topics clearly\n• Show you how to use past questions effectively\n• Provide memory techniques\n• Help you prioritize what to study\n\n**Better approach:**\n• Focus on understanding, not memorizing\n• Practice with past questions (these are legitimate!)\n• Form study groups with classmates\n\nWould you like me to help you prepare properly instead?`;
}

export function generateResponse(
  userInput: string,
  context: UserContext,
  calculateCGPAFn: (courses: Array<{ code: string; units: number; score: number }>, prior: { cgpa: number; units: number }) => any
): string {
  const lowerInput = userInput.toLowerCase();
  const { name, cgpa, carryoversCount, currentGPA } = context;

  // Check for emotional state first
  const emotion = detectEmotion(lowerInput);
  if (emotion && (lowerInput.length > 15 || ['sad', 'frustrated'].includes(emotion))) {
    return generateEmotionalResponse(emotion, name);
  }

  // Greetings
  if (lowerInput.match(/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))[\s!.]*$/i)) {
    return generateGreeting(context);
  }

  // CGPA queries
  if (lowerInput.includes('my cgpa') || lowerInput.includes('what is my cgpa') || lowerInput.includes('cgpa status')) {
    return generateCGPAResponse(cgpa, name);
  }

  // GPA queries
  if ((lowerInput.includes('gpa') && !lowerInput.includes('cgpa')) || lowerInput.includes('semester gpa')) {
    return generateGPAResponse(currentGPA, name);
  }

  // Carryover queries
  if (lowerInput.includes('carryover') || lowerInput.includes('carry over') || lowerInput.includes('failed course')) {
    return generateCarryoverResponse(carryoversCount, name);
  }

  // Academic navigation
  if (lowerInput.includes('who to meet') || lowerInput.includes('lost result') || lowerInput.includes('missing result') ||
      lowerInput.includes('deadline') || lowerInput.includes('portal') || lowerInput.includes('ict') ||
      lowerInput.includes('wrong grade') || lowerInput.includes('grade error')) {
    return generateAcademicGuidance(lowerInput, name);
  }

  // Grading system
  if (lowerInput.includes('grading') || lowerInput.includes('grade system') || lowerInput.includes('how does grading')) {
    return generateGradingExplanation();
  }

  // Study tips
  if (lowerInput.includes('study') || lowerInput.includes('help me plan') || lowerInput.includes('tips') || 
      lowerInput.includes('how to improve') || lowerInput.includes('boost') || lowerInput.includes('prepare')) {
    return generateStudyTips(name);
  }

  // CGPA Calculation
  if (lowerInput.includes('calculate') && (lowerInput.includes('cgpa') || lowerInput.includes('gpa'))) {
    const courseRegex = /(\w+\d+)\s*\((\d+)\s*u(?:nits?)?,\s*(\d+)\)/g;
    const priorRegex = /prior cgpa:\s*(\d+\.?\d*)\s*across\s*(\d+)\s*units/gi;

    const courses: Array<{ code: string; units: number; score: number }> = [];
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
      return `${name}, I'd love to calculate your CGPA! 🧮\n\n**Please provide courses in this format:**\n\`CODE (X units, Y score)\`\n\n**Example:**\n"Calculate my CGPA: MTH101 (3 units, 65) CHM101 (4 units, 72) PHY101 (3 units, 58)"\n\n**To include previous CGPA:**\n"Prior CGPA: 2.85 across 60 units"\n\nGive it a try!`;
    }

    const result = calculateCGPAFn(courses, prior);
    const steps = result.steps.join('\n');
    const finalCGPA = result.cumulativeCGPADisplay;

    let interpretation = '';
    let emoji = '';
    if (finalCGPA >= 4.5) {
      interpretation = `This puts you in **First Class** — outstanding academic performance! 🏆`;
      emoji = '🌟';
    } else if (finalCGPA >= 3.5) {
      interpretation = `You're in **Second Class Upper** — strong academic standing! 👏`;
      emoji = '🎯';
    } else if (finalCGPA >= 2.5) {
      interpretation = `You're in **Second Class Lower** — steady progress, room to grow! 📈`;
      emoji = '💪';
    } else {
      interpretation = `This is a **Pass** grade. Let's work on improvement strategies. 📚`;
      emoji = '🔄';
    }

    // Find lowest course for tip
    const lowestCourse = courses.reduce((low, c) => c.score < low.score ? c : low, courses[0]);
    const tip = `💡 **Tip:** Focus extra attention on ${lowestCourse.code} (scored ${lowestCourse.score}). Consider study groups, past questions, and office hours with the lecturer.`;

    return `${name}, let me break down your CGPA calculation step by step: ${emoji}\n\n**Detailed Calculation:**\n${steps}\n\n---\n**Your New CGPA: ${finalCGPA}**\n\n${interpretation}\n\n${tip}\n\nWould you like study tips or have questions about improving?`;
  }

  // Refusal (Safety)
  if (lowerInput.includes('exam answers') || lowerInput.includes('exam leaks') || lowerInput.includes('expo') ||
      lowerInput.includes('cheat')) {
    return generateRefusalResponse(name);
  }

  // Identity
  if (lowerInput.includes('who made you') || lowerInput.includes('who built you') || lowerInput.includes('who created you') ||
      lowerInput.includes('noskytech') || lowerInput.includes('your creator')) {
    return `I'm Gradex AI, proudly built and developed by **NoskyTech**! 🚀\n\nMy purpose is to help UNN students like you, ${name}, navigate your academic journey.\n\n**What I can do:**\n• Calculate and explain GPA/CGPA\n• Provide study strategies\n• Guide you on UNN procedures\n• Offer emotional support when needed\n\nI'm your reliable academic companion. How can I help you today?`;
  }

  // Thank you
  if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
    const thankResponses = [
      `You're welcome, ${name}! 😊 I'm always here to help. Is there anything else you'd like to know?`,
      `Glad I could help, ${name}! 🌟 Don't hesitate to ask if you have more questions.`,
      `Anytime, ${name}! That's what I'm here for. 💪 Good luck with your studies!`,
    ];
    return getRandomItem(thankResponses);
  }

  // Default
  return generateDefaultResponse(name);
}
