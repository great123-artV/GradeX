// Academic Assistant Liona - AI for UNN Students
// Built and developed by Noskytech

interface UserContext {
  name: string;
  cgpa: number;
  carryoversCount: number;
  currentGPA: number;
}

type Mood = 'sad' | 'angry' | 'confused' | 'happy' | 'tired' | 'stressed' | 'excited' | 'playful' | 'neutral';

function detectMood(message: string): Mood {
  const lower = message.toLowerCase();
  
  if (lower.includes('confused') || lower.includes('don\'t understand') || lower.includes('help me') || lower.includes('what is') || lower.includes('how do') || lower.includes('explain') || lower.includes('lost') || lower.includes('unclear')) {
    return 'confused';
  }
  if (lower.includes('sad') || lower.includes('failed') || lower.includes('disappointed') || lower.includes('depressed') || lower.includes('down') || lower.includes('bad') || lower.includes('unhappy')) {
    return 'sad';
  }
  if (lower.includes('angry') || lower.includes('frustrated') || lower.includes('annoyed') || lower.includes('hate') || lower.includes('stupid') || lower.includes('unfair') || lower.includes('fed up')) {
    return 'angry';
  }
  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('stressed') || lower.includes('overwhelmed') || lower.includes('too much') || lower.includes('pressure')) {
    return 'stressed';
  }
  if (lower.includes('happy') || lower.includes('great') || lower.includes('awesome') || lower.includes('passed') || lower.includes('good news')) {
    return 'happy';
  }
  if (lower.includes('excited') || lower.includes('can\'t wait') || lower.includes('finally') || lower.includes('amazing') || lower.includes('yes')) {
    return 'excited';
  }
  if (hasSlang(message)) {
    return 'playful';
  }
  
  return 'neutral';
}

function hasSlang(message: string): boolean {
  const slangWords = ['wetin', 'abeg', 'sha', 'omo', 'guy', 'bro', 'na', 'dey', 'wahala', 'how far', 'bros', 'gist', 'jare', 'sef', 'shey', 'comot', 'chop', 'e be like', 'nor worry', 'make i', 'my gee', 'sharp', 'no wahala', 'e choke', 'normal level', 'na so', 'you sabi'];
  const lower = message.toLowerCase();
  return slangWords.some(word => lower.includes(word));
}

function getMoodResponse(mood: Mood, hasUserSlang: boolean, name: string): string {
  if (hasUserSlang || mood === 'playful') {
    const slangResponses = [
      `I hear you my gee\n\nLet me sort this out for you sharp sharp`,
      `No wahala ${name}\n\nI got you on this one`,
      `I understand well well\n\nLet me break it down`,
      `Na so\n\nI go help you handle am`,
    ];
    return slangResponses[Math.floor(Math.random() * slangResponses.length)];
  }

  switch (mood) {
    case 'sad':
      return `I can sense things are not easy right now ${name}\n\nIt is okay to feel this way\n\nI am here to help`;
    case 'angry':
      return `I understand your frustration ${name}\n\nLet us work through this calmly\n\nI am on your side`;
    case 'confused':
      return `No worries ${name}\n\nLet me break this down simply for you`;
    case 'stressed':
      return `Take a deep breath ${name}\n\nLet us handle this slowly together`;
    case 'happy':
      return `That is great to hear ${name}\n\nI am glad things are going well`;
    case 'excited':
      return `I can feel the energy ${name}\n\nLet us make the most of it`;
    default:
      return '';
  }
}

function generateCGPAExplanation(userContext: UserContext): string {
  const { cgpa, carryoversCount, currentGPA, name } = userContext;
  
  if (cgpa === 0) {
    return `You have not added any courses yet ${name}\n\nOnce you add them I can calculate your CGPA\n\nQuick breakdown of UNN grading\n\nA gives you 5 points\nB gives you 4\nC gives you 3\nD gives you 2\nE gives you 1\nF gives you 0\n\nTo get your CGPA multiply each course unit by your grade point then add everything and divide by total units`;
  }

  let response = `Your current CGPA is ${cgpa.toFixed(2)} ${name}`;
  
  if (currentGPA > 0 && currentGPA !== cgpa) {
    response += `\n\nThis semester GPA is ${currentGPA.toFixed(2)}`;
  }
  
  if (carryoversCount > 0) {
    response += `\n\nYou have ${carryoversCount} carryover${carryoversCount > 1 ? 's' : ''}\n\nPrioritize clearing ${carryoversCount > 1 ? 'them' : 'it'} as soon as possible`;
  }
  
  if (cgpa >= 4.5) {
    response += `\n\nYou are doing excellently\n\nFirst class is within reach\n\nKeep up the great work`;
  } else if (cgpa >= 3.5) {
    response += `\n\nSolid performance\n\nYou are in second class upper range\n\nWith a bit more effort you could push higher`;
  } else if (cgpa >= 2.5) {
    response += `\n\nYou are in second class lower range\n\nThere is room for improvement\n\nWant some tips on how to boost your grades`;
  } else if (cgpa >= 1.5) {
    response += `\n\nYour CGPA is in third class range\n\nDo not be discouraged\n\nMany students have turned things around from here`;
  } else {
    response += `\n\nI can see your CGPA is low right now\n\nThis does not define you\n\nLet us work on a plan to improve`;
  }
  
  return response;
}

function generateStudyTips(name: string): string {
  const tips = [
    `Consistency beats intensity ${name}\n\nTwo to three hours of focused study daily is better than cramming\n\nTry studying at the same time every day`,
    
    `Active recall works wonders\n\nClose your notes after each section and try to recall what you read\n\nThis strengthens memory better than passive reading`,
    
    `Study in focused chunks ${name}\n\nForty five minutes on then fifteen minutes break\n\nYour brain stays sharper this way`,
    
    `Past questions are your best friend\n\nMost lecturers repeat patterns\n\nGet at least five years worth and practice under timed conditions`,
    
    `Group study can help if the group is serious\n\nExplaining concepts to others reinforces your own understanding\n\nJust make sure it stays focused`,
    
    `Find what works for you ${name}\n\nSome people learn by reading others by listening\n\nExperiment and lean into your strengths`,
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

function generateUNNGuidance(query: string, name: string): string {
  const lower = query.toLowerCase();
  
  if (lower.includes('lost') && (lower.includes('result') || lower.includes('score'))) {
    return `For missing results ${name}\n\nFirst meet your course adviser with your registration form\n\nIf not resolved go to your departmental office\n\nThen Exams and Records near Senate Building if needed\n\nAlways keep copies of your registration documents`;
  }
  
  if (lower.includes('wrong') && lower.includes('grade')) {
    return `For wrong grades ${name}\n\nStart with the lecturer calmly with your evidence\n\nIf they agree they write a correction letter\n\nThat goes to HOD then Exams and Records\n\nStay polite and follow up regularly`;
  }
  
  if (lower.includes('portal') || lower.includes('login') || lower.includes('password')) {
    return `For portal issues ${name}\n\nVisit ICT Centre beside CT building\n\nGo early to avoid long queues\n\nBring your student ID and relevant documents`;
  }
  
  if (lower.includes('carryover') || lower.includes('carry over')) {
    return `Carryovers are courses below 40 marks ${name}\n\nYou need to re register and retake them\n\nPrioritize clearing them early\n\nAttend classes even if you know the material\n\nGet past questions and understand why you failed before`;
  }
  
  if (lower.includes('probation') || lower.includes('withdrawal')) {
    return `Probation happens when CGPA falls too low usually around 1.0\n\nYou get a chance to improve\n\nWithdrawal is more serious after repeated poor performance\n\nMeet your course adviser and HOD immediately if you are in this situation\n\nSome departments have appeals processes`;
  }
  
  if (lower.includes('registration') || lower.includes('register')) {
    return `Course registration is done on the student portal ${name}\n\nCheck your department handbook for correct courses\n\nWatch the deadline carefully\n\nConsult your course adviser if unsure especially with carryovers\n\nAlways print and keep your registration form`;
  }

  if (lower.includes('hod') || lower.includes('head of department')) {
    return `The HOD handles serious academic matters ${name}\n\nGo to them after exhausting other options like course adviser or lecturer\n\nBe respectful and prepared with all documents\n\nExplain your situation clearly and concisely`;
  }

  if (lower.includes('exam') && (lower.includes('record') || lower.includes('transcript'))) {
    return `Exams and Records is near Senate Building ${name}\n\nThey handle transcripts result issues and grade corrections\n\nTranscripts take several weeks so apply early\n\nBring all your documentation`;
  }
  
  return '';
}

export function generateResponse(message: string, userContext: UserContext, calculateCGPA: Function): string {
  const lower = message.toLowerCase();
  const mood = detectMood(message);
  const userHasSlang = hasSlang(message);
  const moodResponse = getMoodResponse(mood, userHasSlang, userContext.name);
  
  let response = moodResponse ? moodResponse + '\n\n' : '';
  
  if (lower.includes('cgpa') || lower.includes('gpa') || lower.includes('grade') || lower.includes('calculate') || lower.includes('result')) {
    response += generateCGPAExplanation(userContext);
  } else if (lower.includes('study') || lower.includes('read') || lower.includes('exam') || lower.includes('prepare') || lower.includes('revision') || lower.includes('tips')) {
    response += generateStudyTips(userContext.name);
  } else if (lower.includes('who') || lower.includes('where') || lower.includes('office') || lower.includes('meet') || lower.includes('how to')) {
    const guidance = generateUNNGuidance(message, userContext.name);
    if (guidance) {
      response += guidance;
    } else {
      response += `I can help you with grades CGPA calculations UNN procedures and study tips ${userContext.name}\n\nWhat do you need`;
    }
  } else if (lower.includes('thank')) {
    const thankResponses = [
      `You are welcome ${userContext.name}\n\nI am always here when you need me`,
      `Anytime ${userContext.name}\n\nFeel free to reach out again`,
      `It is my pleasure\n\nYour success matters to me ${userContext.name}`,
    ];
    response += thankResponses[Math.floor(Math.random() * thankResponses.length)];
  } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('good evening')) {
    response += `Hello ${userContext.name}\n\nGood to hear from you\n\nHow can I help today\n\nI can assist with CGPA calculations UNN procedures or study tips`;
  } else if (lower.includes('who made you') || lower.includes('who created you') || lower.includes('noskytech') || lower.includes('who are you') || lower.includes('what are you') || lower.includes('who built you')) {
    response += `I am Liona your Academic Assistant built by Noskytech for UNN students\n\nNoskytech is a Nigerian tech company created by Emmanuel Chinonso Ani also known as Nosky\n\nThey focus on software development app development AI systems hardware engineering power electronics and embedded systems\n\nTheir vision is to build world class tech solutions from Nigeria and empower students with tools they have never experienced before`;
  } else {
    const guidance = generateUNNGuidance(message, userContext.name);
    if (guidance) {
      response += guidance;
    } else {
      const generalResponses = [
        `Tell me more about what you need help with ${userContext.name}\n\nI am here for grades study advice or UNN guidance`,
        `I am listening ${userContext.name}\n\nShare what is on your mind and let us work through it`,
        `How can I assist you ${userContext.name}\n\nWhether it is CGPA UNN rules or study tips I got you`,
      ];
      response += generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
  }
  
  if (mood === 'sad' || mood === 'stressed' || mood === 'confused') {
    response += `\n\nAre you feeling better or do you want me to explain further`;
  }
  
  return response;
}

export function generateWelcomeMessage(userContext: UserContext): string {
  const { name, cgpa, carryoversCount } = userContext;
  
  let welcome = `Hello ${name}\n\nI am Liona your Academic Assistant\n\nBuilt by Noskytech to help UNN students like you`;
  
  if (cgpa > 0) {
    welcome += `\n\nYour current CGPA is ${cgpa.toFixed(2)}`;
    if (carryoversCount > 0) {
      welcome += ` with ${carryoversCount} carryover${carryoversCount > 1 ? 's' : ''} to clear`;
    }
  }
  
  welcome += `\n\nI can help with CGPA calculations UNN procedures study tips and guidance on who to meet for any issue\n\nHow can I assist you today`;
  
  return welcome;
}
