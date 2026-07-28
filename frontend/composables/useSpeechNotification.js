// ~/composables/useSpeechNotification.js
export const useSpeechNotification = () => {
  const getVoice = (voiceName = "Microsoft Mark - English (United States)") => {
    const voices = speechSynthesis.getVoices();
    return voices.find(v => v.name === voiceName) || voices[0];
    
  };

  const config = useRuntimeConfig();
  const baseURL = config.app.baseURL; // your /sbtph_sales_leaderboard/
  const applausePath = `${baseURL}applause-8.mp3`; // assuming file is in public/

  const playNotification = (agent) => {
    const { dbname, shipok_count, target, shipok, team_shipok, team_target, team_name } = agent;
   
    // 🎯 Regular motivational messages
    const regularMessages = [
      `Well done on closing a deal! You now have ${shipok_count} ShipOK today. Keep up the momentum. ${dbname}!`,
      `Nice work! You already reached ${shipok_count} ShipOK so far. Your consistency is paying off. great job. ${dbname}!`
    ];

    // 🏆 Agent reached target message
    const agentTargetMessage = `Incredible job ${dbname}! You’ve reached your monthly target of ${target} ShipOK. Keep shining!`;

    // 👥 Team reached target message
    const teamTargetMessage = `Congratulations to the entire ${team_name} team! Monthly goal achieved. Teamwork makes the dream work!`;

    // Determine which messages to play
    let messagesToPlay = [];

    if (shipok >= target) {
      messagesToPlay.push(agentTargetMessage);
    } else {
      const randomIndex = Math.floor(Math.random() * regularMessages.length);
      messagesToPlay.push(regularMessages[randomIndex]);
    }

    if (team_shipok >= team_target) {
     
      messagesToPlay.push(teamTargetMessage);
    }

    // 🎧 Create looping applause sound
    const applause = new Audio(applausePath);
    applause.loop = true;
    applause.volume = 0.7;

    // Wait a tiny bit to allow alert/popups to close
    setTimeout(() => {
      applause.play().catch(() => {
        console.warn("Applause sound blocked by browser autoplay policy.");
      });
    }, 200); // 200ms delay

    // 🗣️ Speak messages one by one
    const speakNext = (index = 0) => {
      if (index >= messagesToPlay.length) {
        applause.pause();
        applause.currentTime = 0;
        return;
      }

      const utterance = new SpeechSynthesisUtterance(messagesToPlay[index]);
      utterance.rate = 1;
      utterance.pitch = 1;
      const voice = getVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = () => speakNext(index + 1);
      utterance.onerror = () => {
        applause.pause();
        applause.currentTime = 0;
      };

      speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => getVoice();
  }

  return { playNotification };
};
