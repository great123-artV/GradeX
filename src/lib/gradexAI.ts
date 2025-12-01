// Gradex AI - Academic Assistant for UNN Students
// Built and developed by NoskyTech
// Natural conversational tone without emojis or symbols

interface UserContext {
  name: string;
  cgpa: number;
  carryoversCount: number;
  currentGPA: number;
}

type Mood = 'sad' | 'angry' | 'confused' | 'happy' | 'tired' | 'stressed' | 'excited' | 'neutral';

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
  if (lower.includes('happy') || lower.includes('great') || lower.includes('awesome') || lower.includes('passed') || lower.includes('good') || lower.includes('thanks') || lower.includes('thank you')) {
    return 'happy';
  }
  if (lower.includes('excited') || lower.includes('can\'t wait') || lower.includes('finally') || lower.includes('amazing')) {
    return 'excited';
  }
  
  return 'neutral';
}

function hasSlang(message: string): boolean {
  const slangWords = ['wetin', 'abeg', 'sha', 'omo', 'guy', 'bro', 'na', 'dey', 'wahala', 'how far', 'bros', 'gist', 'jare', 'sef', 'shey', 'comot', 'chop', 'e be like', 'nor worry', 'make i'];
  const lower = message.toLowerCase();
  return slangWords.some(word => lower.includes(word));
}

function getMoodResponse(mood: Mood, hasUserSlang: boolean, name: string): string {
  if (hasUserSlang) {
    const slangResponses = [
      `I hear you ${name} and I understand where you are coming from\n\nLet me help you sort this out`,
      `Bros I feel you on this one\n\nNo wahala let me break it down for you`,
      `I understand the matter well\n\nLet me guide you through it one step at a time`,
      `No stress at all ${name}\n\nI go explain am well well for you`,
    ];
    return slangResponses[Math.floor(Math.random() * slangResponses.length)];
  }

  switch (mood) {
    case 'sad':
      return `I can sense things are not easy right now ${name} and I want you to know that it is okay to feel this way\n\nYour feelings are valid and I am here to help you through this one step at a time`;
    case 'angry':
      return `I understand your frustration ${name} and I hear you completely\n\nLet us take a breath together and work through this calmly\n\nI am on your side`;
    case 'confused':
      return `No worries at all ${name}\n\nI will break this down slowly and clearly so it becomes easier for you to understand`;
    case 'stressed':
      return `I can tell you have a lot on your plate right now ${name}\n\nTake a deep breath\n\nLet us handle this slowly and figure out the best path forward together`;
    case 'happy':
      return `That is wonderful to hear ${name}\n\nI am genuinely glad things are going well for you`;
    case 'excited':
      return `I can feel the excitement ${name} and I love it\n\nI am here to help you make the most of this moment`;
    default:
      return '';
  }
}

function generateCGPAExplanation(userContext: UserContext): string {
  const { cgpa, carryoversCount, currentGPA, name } = userContext;
  
  if (cgpa === 0) {
    return `I notice you have not added any courses yet ${name}\n\nOnce you add your courses with their grades I can help you calculate your CGPA and give you personalized advice on how to improve\n\nLet me quickly explain how the UNN grading system works\n\nIt is based on a five point scale where A gives you five points and B gives you four points and C gives you three points and D gives you two points and E gives you one point and F gives you zero points\n\nTo calculate your CGPA you multiply each course unit by the grade point you scored then add everything together and divide by the total number of units\n\nFor example if you have a three unit course where you scored B that is three multiplied by four which gives you twelve grade points\n\nWould you like me to walk you through adding your first course`;
  }

  let response = `Looking at your academic record ${name} your current CGPA is ${cgpa.toFixed(2)} on the five point scale`;
  
  if (currentGPA > 0 && currentGPA !== cgpa) {
    response += `\n\nYour GPA for this current semester is ${currentGPA.toFixed(2)} which shows your performance for just this semester`;
  }
  
  if (carryoversCount > 0) {
    response += `\n\nI also see you have ${carryoversCount} carryover course${carryoversCount > 1 ? 's' : ''} which means you scored below forty marks in ${carryoversCount > 1 ? 'those courses' : 'that course'}\n\nI would strongly advise you to prioritize clearing ${carryoversCount > 1 ? 'these carryovers' : 'this carryover'} as soon as possible because they can affect your graduation timeline and overall CGPA`;
  }
  
  if (cgpa >= 4.5) {
    response += `\n\nYou are doing excellently well and you are firmly on track for a first class degree\n\nThis is the result of consistent hard work and dedication\n\nKeep maintaining your study habits and stay focused\n\nMany doors will open for you with this kind of performance including scholarships and graduate opportunities`;
  } else if (cgpa >= 3.5) {
    response += `\n\nYou are performing well and you are in the second class upper range which is a solid achievement\n\nWith a bit more focused effort especially on courses where you scored C or below you could push into first class territory\n\nWould you like me to suggest some strategies to help you make that jump`;
  } else if (cgpa >= 2.5) {
    response += `\n\nYou are in the second class lower range which is decent but there is definitely room for improvement\n\nThe good news is that with the right approach you can move up to second class upper\n\nI can suggest some practical strategies to help boost your grades if you are interested`;
  } else if (cgpa >= 1.5) {
    response += `\n\nYour CGPA is currently in the third class range\n\nI understand this might feel discouraging but I want you to know that there is always room for improvement\n\nMany students have turned things around from similar positions\n\nWould you like me to suggest some practical steps to help you raise your grades starting from next semester`;
  } else {
    response += `\n\nI can see your CGPA is quite low right now ${name} and I want you to know that this does not define you as a person or determine your future\n\nMany successful people had rocky academic starts\n\nThe important thing now is to understand what went wrong and create a solid plan to improve\n\nLet me help you figure out the best way forward`;
  }
  
  return response;
}

function generateStudyTips(name: string): string {
  const tips = [
    `One thing that really helps ${name} is creating a consistent study schedule\n\nTry to study at the same time every day so your brain gets conditioned to focus during those hours\n\nIt does not have to be many hours\n\nEven two to three hours of focused study daily can make a massive difference over the course of a semester\n\nThe key is consistency not intensity`,
    
    `Active recall is one of the most effective study techniques backed by research ${name}\n\nInstead of just reading your notes passively try closing your book after each section and recalling what you just read\n\nThis forces your brain to actively retrieve the information which strengthens your memory significantly\n\nYou can also test yourself with questions or explain concepts out loud as if teaching someone else`,
    
    `Breaking your study sessions into focused chunks works really well ${name}\n\nStudy for about forty five minutes to an hour then take a short break of ten to fifteen minutes\n\nDuring the break step away from your desk stretch or take a short walk\n\nThis helps maintain your concentration and prevents the mental fatigue that comes from marathon study sessions`,
    
    `Past questions are your best friend when preparing for UNN exams ${name}\n\nMost lecturers tend to repeat questions or follow similar patterns year after year\n\nStudying past questions helps you understand what to expect and how to structure your answers\n\nTry to get at least five years worth of past questions for each course and practice answering them under timed conditions`,
    
    `Group study can be incredibly helpful but you need to be strategic about it ${name}\n\nFind serious minded course mates who are genuinely focused on learning not just socializing\n\nExplaining concepts to others is one of the best ways to reinforce your own understanding\n\nBut make sure the group stays focused and does not turn into a chat session`,
    
    `Understanding your learning style can make a big difference ${name}\n\nSome people learn best by reading while others learn by listening or by doing\n\nExperiment with different approaches\n\nTry reading notes then listening to audio explanations then teaching someone else\n\nFigure out what works best for you and lean into that`,
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

function generateUNNGuidance(query: string, name: string): string {
  const lower = query.toLowerCase();
  
  if (lower.includes('lost') && (lower.includes('result') || lower.includes('score'))) {
    return `For missing or lost results ${name} here is exactly what you should do step by step\n\nFirst meet your course adviser and explain the situation\n\nYour course adviser has access to departmental records and can help verify if the results were properly recorded\n\nMake sure you bring your course registration form as evidence that you registered for the course\n\nIf the issue is not resolved at that level visit your departmental office and meet the department secretary\n\nThey can check the physical records and may direct you to the Exams and Records unit if necessary\n\nThe Exams and Records office is located near the Senate Building\n\nAlways keep copies of all your course registration documents safe as they serve as proof\n\nThis process can take some time so start early and follow up regularly`;
  }
  
  if (lower.includes('wrong') && lower.includes('grade')) {
    return `For wrong or incorrect grades ${name} you need to follow this process carefully\n\nFirst approach the lecturer who taught the course and explain the situation calmly and respectfully\n\nBring any evidence you have such as your marked script or continuous assessment scores\n\nIf the lecturer agrees there is an error they will write a grade correction letter\n\nThat letter needs to go to the Head of Department for approval\n\nOnce approved you take it to Exams and Records and they will update the official records\n\nIf the lecturer does not agree or cannot resolve it you can escalate to the exam officer in your department and then to the HOD if necessary\n\nAlways remain polite and patient throughout this process\n\nKeep copies of all documents and follow up regularly\n\nThese things can take two to four weeks so start as early as possible`;
  }
  
  if (lower.includes('portal') || lower.includes('login') || lower.includes('password')) {
    return `For portal issues ${name} including login problems password resets or any technical difficulties you need to visit the ICT Centre\n\nIt is located beside the CT building on campus\n\nThey handle all student portal related matters\n\nMake sure you go with your student ID card and any relevant documents like your admission letter if you are a fresher or payment receipts if the issue is payment related\n\nI recommend going early in the morning because the queues can get very long especially during registration periods\n\nBe specific about your problem when you get there and note down any reference numbers they give you for follow up`;
  }
  
  if (lower.includes('carryover') || lower.includes('carry over')) {
    return `Carryover courses ${name} are courses where you scored below forty marks\n\nYou will need to re register for these courses in a future semester and retake the exams\n\nIt is very important to prioritize clearing carryovers because having too many can affect your eligibility for graduation and will keep dragging your CGPA down\n\nMy advice is to focus on your carryovers early in the semester\n\nAttend all the classes even if you feel you already know the material\n\nGet past questions specifically for that course and understand why you failed the first time\n\nIf you are struggling with the course content consider getting extra tutorials or finding a study partner who is strong in that subject\n\nClearing carryovers early gives you peace of mind and lets you focus on new courses`;
  }
  
  if (lower.includes('probation') || lower.includes('withdrawal')) {
    return `Academic probation ${name} happens when your CGPA falls below a certain threshold which is usually around one point zero\n\nIf you are placed on probation you are given a warning and a chance to improve your grades within a specified period\n\nWithdrawal is more serious and can happen after repeated poor performance or failure to meet the conditions of probation\n\nIf you find yourself in this situation I strongly advise you to meet with your course adviser and Head of Department immediately\n\nThey can guide you on the specific requirements you need to meet and may help you find a way forward\n\nSome departments have appeals processes for special circumstances\n\nDo not be afraid to seek help\n\nMany students have recovered from probation with the right support and determination`;
  }
  
  if (lower.includes('registration') || lower.includes('register')) {
    return `Course registration ${name} is done through the student portal\n\nMake sure you register for the correct courses according to your level and department handbook\n\nPay close attention to the registration deadline because late registration can cause serious problems including missing exams\n\nBefore registering check with your course adviser if you are unsure about which courses to take especially if you have carryovers or special circumstances\n\nIf you face any issues during registration visit your departmental office or the ICT centre for assistance\n\nAlways print and keep multiple copies of your course registration form after registering\n\nThis printout serves as your proof of registration and you may need it throughout the semester`;
  }

  if (lower.includes('hod') || lower.includes('head of department')) {
    return `The Head of Department ${name} handles serious academic matters and department level decisions\n\nYou would typically meet the HOD for appeals and special requests or when lower level channels have not resolved your issue\n\nBefore going to the HOD make sure you have exhausted other options first such as your course adviser or the relevant lecturer\n\nWhen meeting the HOD be respectful and prepared with all relevant documents\n\nExplain your situation clearly and concisely\n\nThe HOD is usually very busy so make the most of your time with them`;
  }

  if (lower.includes('exam') && (lower.includes('record') || lower.includes('transcript'))) {
    return `The Exams and Records office ${name} is located near the Senate Building\n\nThey handle result issues transcript requests and grade corrections\n\nFor transcripts you will need to pay a fee and fill out a request form\n\nProcessing usually takes several weeks so apply early especially if you need it for graduate school applications or job requirements\n\nFor result issues bring all your documentation including registration forms and any correspondence about the matter`;
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
  } else if (lower.includes('who') || lower.includes('where') || lower.includes('office') || lower.includes('meet') || lower.includes('help') || lower.includes('how to')) {
    const guidance = generateUNNGuidance(message, userContext.name);
    if (guidance) {
      response += guidance;
    } else {
      response += `I am here to help you with any UNN related questions ${userContext.name}\n\nYou can ask me about your grades and how to calculate your CGPA\n\nYou can ask about how to handle academic issues like missing results or wrong grades or carryovers\n\nI can give you study tips and practical advice\n\nI can also guide you on exactly who to meet for different problems you might be facing\n\nWhat would you like to know more about`;
    }
  } else if (lower.includes('thank')) {
    const thankResponses = [
      `You are most welcome ${userContext.name} and I am always here whenever you need help\n\nFeel free to come back and ask me anything anytime\n\nYour academic success matters to me`,
      `It is my pleasure to help you ${userContext.name}\n\nIf you have any more questions or need guidance in the future just reach out\n\nI am here for you`,
      `Anytime at all ${userContext.name}\n\nRemember I am here to support you throughout your entire academic journey\n\nDo not hesitate to ask if something comes up`,
    ];
    response += thankResponses[Math.floor(Math.random() * thankResponses.length)];
  } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('good evening')) {
    response += `Hello ${userContext.name}\n\nIt is good to hear from you\n\nHow can I assist you today\n\nI can help you with calculating your CGPA\n\nI can explain UNN policies and procedures\n\nI can give you practical study tips\n\nI can guide you on who to meet for any academic issue you might be facing\n\nJust let me know what is on your mind`;
  } else if (lower.includes('who made you') || lower.includes('who created you') || lower.includes('noskytech') || lower.includes('who are you') || lower.includes('what are you')) {
    response += `I am Gradex AI and I was created by NoskyTech to serve as your academic companion here at the University of Nigeria Nsukka\n\nMy purpose is to help UNN students like yourself track your academic progress calculate your grades and provide guidance whenever you need it\n\nI am designed to be calm mature and supportive\n\nI am here to help you navigate your academic journey from course registration to graduation\n\nThink of me as a friendly senior who has been through it all and wants to see you succeed`;
  } else {
    const guidance = generateUNNGuidance(message, userContext.name);
    if (guidance) {
      response += guidance;
    } else {
      const generalResponses = [
        `I hear you ${userContext.name}\n\nCould you tell me a bit more about what you need help with\n\nI can assist with CGPA calculations or study advice or guidance on UNN procedures or just general academic support\n\nWhatever is on your mind I am here to help`,
        `I am here to help you with anything academic related ${userContext.name}\n\nWhether it is understanding your grades or figuring out who to meet for an issue or getting study tips I have got you covered\n\nJust share what is on your mind and let us work through it together`,
        `Feel free to share what is going on ${userContext.name}\n\nI can help with calculating your CGPA or explaining UNN rules or giving you practical advice on how to improve academically\n\nI am listening and ready to support you`,
      ];
      response += generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
  }
  
  if (mood === 'sad' || mood === 'stressed' || mood === 'confused') {
    response += `\n\nAre you feeling better now or would you like me to explain anything further\n\nI am here for as long as you need`;
  }
  
  return response;
}

export function generateWelcomeMessage(userContext: UserContext): string {
  const { name, cgpa, carryoversCount } = userContext;
  
  let welcome = `Hello ${name}\n\nWelcome to Gradex AI\n\nI am your academic companion created by NoskyTech to help UNN students like yourself navigate your academic journey`;
  
  if (cgpa > 0) {
    welcome += `\n\nI can see your current CGPA is ${cgpa.toFixed(2)}`;
    if (carryoversCount > 0) {
      welcome += ` and you have ${carryoversCount} carryover course${carryoversCount > 1 ? 's' : ''} that we should work on clearing`;
    } else {
      welcome += ` and you have no carryovers which is great`;
    }
  }
  
  welcome += `\n\nI am here to help you with anything related to your academics\n\nYou can ask me about calculating your CGPA or understanding UNN policies or getting study tips or knowing exactly who to meet for any issue you are facing\n\nI speak in a natural conversational way because I want you to feel like you are talking to a supportive senior not a machine\n\nHow can I assist you today`;
  
  return welcome;
}
