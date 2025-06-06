// Simple synchronous comment classifier
export const classifyComment = (content) => {
  if (!content) return { is_toxic: false, classification: "non-toxic" };
  
  const lowerContent = content.toLowerCase();
  
  // Tamil slang toxic words - expanded list
  const tamilToxicWords = [
    'punda', 'otha', 'thevdiya', 'baadu', 'thevidiya', 'sunni', 
    'ennoda', 'naaye', 'loosu', 'venna', 'koothi', 'thayoli',
    'ommala', 'myir', 'kaai', 'molai', 'layam', 'akka', 'thangachi',
    'poolu', 'sappi', 'oombu', 'pundai', 'soothu', 'munda',
    'lavada', 'chunni', 'pavadai', 'thevudiya', 'puluthi', 'kena'
  ];
  
  // English toxic words - expanded list
  const englishToxicWords = [
    'hate', 'stupid', 'idiot', 'dumb', 'terrible', 'awful', 'worst',
    'bad', 'ugly', 'horrible', 'nasty', 'evil', 'fuck', 'shit', 'ass',
    'bitch', 'damn', 'crap', 'fool', 'moron', 'jerk', 'loser',
    'kill', 'die', 'death', 'murder', 'suicide', 'hell', 'cunt',
    'dick', 'cock', 'pussy', 'whore', 'slut', 'bastard', 'retard'
  ];
  
  // Check for toxic words
  const isToxic = tamilToxicWords.some(word => lowerContent.includes(word)) || 
                 englishToxicWords.some(word => lowerContent.includes(word));
  
  return {
    is_toxic: isToxic,
    classification: isToxic ? "toxic" : "non-toxic"
  };
};