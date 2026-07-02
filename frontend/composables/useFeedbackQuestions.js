import { computed } from 'vue'

export function useFeedbackQuestions(agentType, direction) {
   const managerQuestions = [
        {
            id: 1,
            text: "Does agent show improvement on his performance this month?",
            choices: [
            { label: "Yes, with significant improvement", score: 5 },
            { label: "With minimal improvement", score: 3 },
            { label: "No improvement", score: 1 }
            ]
        },
        {
            id: 2,
            text: "Rate the level of effort shown by agent this month",
            choices: [
            { label: "Exeptional", score: 5 },
            { label: "Average", score: 3 },
            { label: "Poor", score: 1 }
            ]
        },
        {
            id: 3,
            text: "Did the agent show full knowledge and familiarity of the market policies and rules. Do research to keep updated of the market trends.",
            choices: [
            { label: "Yes very resourceful and knowledgeable", score: 5 },
            { label: "Shown a moderate interest", score: 3 },
            { label: "Have not shown much interest", score: 1 }
            ]
        },
        {
            id: 4,
            text: "Able to close a sale to new customers",
            choices: [
            { label: "Yes, with significant number", score: 5 },
            { label: "Yes, but minimal", score: 3 },
            { label: "No new client", score: 1 }
            ]
        },
        {
            id: 5,
            text: "Rate agent's effort to continuously look for new customers not just relying on system tagging",
            choices: [
            { label: "Do everything to get leads", score: 5 },
            { label: "Show effort but needs improvement", score: 3 },
            { label: "not exerting effort to look", score: 1 }
            ]
        },
        {
            id: 6,
            text: "Have repeat customers order and able to retain customers and convince to reorder. Handles customer very well, develops customer loyalty",
            choices: [
            { label: "Yes, with significant number of loyal customers", score: 5 },
            { label: "Yes, but only few numbers", score: 3 },
            { label: "No, not able to retain customers", score: 1 }
            ]
        },
        {
            id: 7,
            text: "Follow company rules, sales policies and manager's instructions",
            choices: [
            { label: "Yes, no violations committed", score: 5 },
            { label: "Yes, but have minor violations", score: 3 },
            { label: "Not following policies and instructions", score: 1 }
            ]
        },
        {
            id: 8,
            text: "Rate Agent's ability to solve and identify problem and to work with minimum supervision",
            choices: [
            { label: "reliable and dependable", score: 5 },
            { label: "still need a minimal supervision", score: 3 },
            { label: "can't solve and identify problems alone", score: 1 }
            ]
        },
        {
            id: 9,
            text: "Understands and knowledgeable about job functions, processes and systems used at work",
            choices: [
            { label: "Yes, very knowledgeable", score: 5 },
            { label: "Limited knowledge needs to improve", score: 3 },
            { label: "Not displaying understanding", score: 1 }
            ]
        },
        {
            id: 10,
            text: "Rate the agent's negotiation skills this month:",
            choices: [
            { label: "has high convincing skills", score: 5 },
            { label: "can convince but needs improvements", score: 3 },
            { label: "not showing skills", score: 1 }
            ]
        },
        {
            id: 11,
            text: "Does agent display strong-will and not easily discourage if results seem not possible to achieve at the end of the month?",
            choices: [
            { label: "Yes, never gives up regardless of situation", score: 5 },
            { label: "Yes, but fall back at times", score: 3 },
            { label: "No, pessimistic and gives up easily", score: 1 }
            ]
        },
        {
            id: 12,
            text: "Prompt in submitting reports and meeting deadlines",
            choices: [
            { label: "Yes, always on time", score: 5 },
            { label: "Submitting reports but beyond deadline", score: 3 },
            { label: "No, not submitting reports at all", score: 1 }
            ]
        },
        {
            id: 13,
            text: "Show and treat managers and other people with respect",
            choices: [
            { label: "Yes, always", score: 5 },
            { label: "Sometimes", score: 3 },
            { label: "No, not showing respect", score: 1 }
            ]
        },
        {
            id: 14,
            text: "Agent is organise and systematic and very keen to details.  Make sure of the correctness of information and reports",
            choices: [
            { label: "Yes, always !", score: 5 },
            { label: "Yes, but with minimal errors", score: 3 },
            { label: "No, prone to error", score: 1 }
            ]
        },
        {
            id: 15,
            text: "Listen and accepts constructive criticism and feedback without unfavorable responses",
            choices: [
            { label: "Yes, make use of the feedback to improve", score: 5 },
            { label: "Yes, but sometimes show unfavorable remarks", score: 3 },
            { label: "No, doesn't accept criticism gracefully", score: 1 }
            ]
        },
        {
            id: 16,
            text: "Knows how to update managers of their absences, tardiness and any concern relating to work",
            choices: [
            { label: "Always updating", score: 5 },
            { label: "Not at all times updating or communicating", score: 3 },
            { label: "No, not sending updates nor communicate", score: 1 }
            ]
        },
        {
            id: 17,
            text: "Rate agent's response on client inquiries, immediate head messages and calls on different works platforms. ",
            choices: [
            { label: "Very fast in responding", score: 5 },
            { label: "Takes time to response", score: 3 },
            { label: "Not always available", score: 1 }
            ]
        },
   
 
    ];

    const smManagerQuestions = [
        {
            id: 1,
            text: "Able to engage his/her team to hit target for the month.",
            choices: [
            { label: "Yes, able to hit target", score: 5 },
            { label: "Yes but not all agents hit their idnividual target", score: 3 },
            { label: "No agents hit target", score: 1 }
            ]
        },
        {
            id: 2,
            text: "Team performance has improved compared to last month results.",
            choices: [
            { label: "Yes has shown great improvements", score: 5 },
            { label: "Same as just last month", score: 3 },
            { label: "No, result is better last month", score: 1 }
            ]
        },
        {
            id: 3,
            text: "Not easily affected and disturb by stress and pressure. Always find ways and knows how to solve issues and problems with less supervision.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all", score: 1 }
            ]
        },
        {
            id: 4,
            text: "Show eagerness and enthusiasm at work. Attract and motivates his team to work hard and aim higher.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 5,
            text: "Is he updated on new market rule and policies.  Can identify potential risks and opportunities of the market to achieve team's target.",
            choices: [
            { label: "Yes always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, not aware of market situation", score: 1 }
            ]
        },
        {
            id: 6,
            text: "Is he/she fair in implementing policies and treat the team fairly, without biases?",
            choices: [
            { label: "Yes, always observe", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, has favoritism", score: 1 }
            ]
        },
        {
            id: 7,
            text: "Does he/she response immediately on all your queries, messages and emails?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, not responding and late in replies", score: 1 }
            ]
        },
        {
            id: 8,
            text: "Display very good time management. Very organize and systematic and has focus on work.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 9,
            text: "Does he/she listen to your suggestions, feedback and criticism without any unfavorable response?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times.", score: 3 },
            { label: "No, cannot accept suggestions and feedbacks", score: 1 }
            ]
        },
        {
            id: 10,
            text: "Knows how to update managers of there absences, tardiness and any concern relating to work",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 11,
            text: "Follow company rules, sales policies and manager's instructions",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 12,
            text: "Show and treat managers and other people with respect.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 13,
            text: "Review team's performance and address and give feedback regularly to improve team's performance   Coach and train and offer support to people to improve their performance.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 14,
            text: "Honest and acts with integrity.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 15,
            text: "Does he/she submit reports on time and meeting deadlines, attend meetings as requested?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 16,
            text: "Participate and support department planning and projects. Provide suggestions and ideas that will help the department achieve goals.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        
 
    ];


    const agentQuestions = [
        {
            id: 1,
            text: "Are you happy with your immediate head way of managing the team?",
            choices: [
            { label: "Yes very much satisfied", score: 5 },
            { label: "Yes, but still needs improvement", score: 3 },
            { label: "No, lack of leadership skills", score: 1 }
            ]
        },
        {
            id: 2,
            text: "Is your manager fair in implementing policies and treat the team fairly, without biases?",
            choices: [
            { label: "Yes always observe!", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, has favoritism", score: 1 }
            ]
        },
        {
            id: 3,
            text: "Does he regularly conduct trainings, coaching and meeting to team?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not all times", score: 3 },
            { label: "No, hardly any", score: 1 }
            ]
        },
        {
            id: 4,
            text: "Does he/she response immediately on all your queries, messages and emails?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, not response at all", score: 1 }
            ]
        },
        {
            id: 5,
            text: "Does he/she listen to your suggestions, feedback and criticism without any unfavorable response?",
            choices: [
            { label: "Yes always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, cannot accept suggestions and feedbacks", score: 1 }
            ]
        },
        {
            id: 6,
            text: "Rate you manager decision-making skills and analyzing situations.",
            choices: [
            { label: "always finds best solutions to problems", score: 5 },
            { label: "can find solutions but needs improvement", score: 3 },
            { label: "cannot decide and no idea of the situation", score: 1 }
            ]
        },
        {
            id: 7,
            text: "Manager is a role model and can motivate you. ",
            choices: [
            { label: "Yes always motivates us", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, not a good role model", score: 1 }
            ]
        },
        {
            id: 8,
            text: "Manager is honest and acts with integrity.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but at all times", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 9,
            text: ".Is he updated on new market rule and policies.  Can identify potential risks and opportunities of the market to achieve team's target.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times.", score: 3 },
            { label: "No, not aware of market situation", score: 1 }
            ]
        },
        {
            id: 10,
            text: "Understand his people needs and situation. Show compassions and empathy when necessary.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, but not at all times", score: 3 },
            { label: "No, he doesn't understand our needs", score: 1 }
            ]
        },
        {
            id: 11,
            text: "Review your performance and address and give feedback regularly to improve your performance",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, doesn't care at all", score: 1 }
            ]
        },
        {
            id: 12,
            text: "Communicates and gives instructions and ideas clearly. ",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, not clear in giving instructions", score: 1 }
            ]
        },
        {
            id: 13,
            text: "Knows how to appreciate and compliments your effort and contributions to their team success. ",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, doesn't know how to appreciate", score: 1 }
            ]
        },
        {
            id: 14,
            text: "Always give support and assistance ",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes but not at all times", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 15,
            text: "Does he/she submit reports on time and meeting deadlines, attend meetings as requested?",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },
        {
            id: 16,
            text: "Participate and support department planning and projects. Provide suggestions and ideas that will help the department achieve goals.",
            choices: [
            { label: "Yes, always!", score: 5 },
            { label: "Yes, sometimes.", score: 3 },
            { label: "No, not at all.", score: 1 }
            ]
        },

    ]


  // Decide which set to return
  const questions = computed(() => {
    
    if (agentType === 0 && direction == 'lm_by_agent') return agentQuestions
    if (agentType === 1 && direction == 'agent_by_lm') return  managerQuestions
    if (agentType === 1 && direction == 'um_by_lm')  return  agentQuestions
    if(agentType === 2 && direction == 'lm_by_um') return  smManagerQuestions
    
    return []
  })

  return { questions }
}
