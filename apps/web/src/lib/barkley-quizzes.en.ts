import type { QuizQuestion } from "./barkley-quizzes";

export const BARKLEY_QUIZZES_EN: Record<number, QuizQuestion[]> = {
  1: [
    {
      id: "1-1",
      question:
        "What is the main factor that influences the behavior of a child with ADHD?",
      options: [
        "A lack of willpower on the child's part",
        "A deficit in executive functions (inhibition, attention, self-regulation)",
        "Poor parenting by the parents",
        "Excess sugar in the diet",
      ],
      correctIndex: 1,
      explanation:
        "ADHD is linked to a neurological deficit in executive functions, not to a lack of willpower or to parenting.",
    },
    {
      id: "1-2",
      question:
        "Why is it important to understand the causes of behavior before acting?",
      options: [
        "To find someone to blame",
        "To adapt your educational responses to how the child actually functions",
        "To excuse all behaviors",
        "To avoid setting limits",
      ],
      correctIndex: 1,
      explanation:
        "Understanding how the child functions makes it possible to adapt educational strategies in a realistic and effective way.",
    },
    {
      id: "1-3",
      question:
        "According to the Barkley program, ADHD mainly affects:",
      options: [
        "The child's intelligence",
        "The ability to manage time, emotions, and impulses",
        "The ability to love one's parents",
        "Athletic performance only",
      ],
      correctIndex: 1,
      explanation:
        "ADHD affects the management of time, emotions, and impulses — not intelligence or affection.",
    },
    {
      id: "1-4",
      question:
        "Your child forgets his school bag at school again. Which of these reactions is the most consistent with the Barkley program?",
      options: [
        "\"You do it on purpose to make me angry.\"",
        "\"His brain struggles with working memory: I'll set up a visual reminder.\"",
        "\"If he doesn't have his things tomorrow, he won't go to school.\"",
        "\"It's my fault, I didn't remind him enough.\"",
      ],
      correctIndex: 1,
      explanation:
        "Recurring forgetfulness reflects a working memory deficit, not defiance. We compensate with external supports (visual reminders, lists, routines).",
    },
    {
      id: "1-5",
      question:
        "ADHD has a strong component that is:",
      options: [
        "Educational: it depends mainly on parenting style",
        "Genetic and neurobiological",
        "Dietary: it disappears with a suitable diet",
        "Psychological: it comes from a hidden trauma",
      ],
      correctIndex: 1,
      explanation:
        "ADHD is a neurodevelopmental disorder with a heritability of about 75-80%. The environment modulates its expression but is not its cause.",
    },
    {
      id: "1-6",
      question:
        "Among these attributions, which is a trap to absolutely avoid?",
      options: [
        "\"He has a different way of functioning that I need to understand.\"",
        "\"He is lazy and lacks willpower.\"",
        "\"Some situations require more effort from him than from others.\"",
        "\"He needs a predictable structure.\"",
      ],
      correctIndex: 1,
      explanation:
        "Attributing symptoms to laziness or a lack of willpower is the central trap. It fuels guilt, conflict, and ineffective punitive responses.",
    },
    {
      id: "1-7",
      question:
        "Does the Barkley program replace medical follow-up?",
      options: [
        "Yes, it is sufficient on its own",
        "No, it combines with medical follow-up (pediatrician, psychiatrist) and sometimes medication",
        "Yes, if the child is under 10",
        "No, but it can replace any other psychological support",
      ],
      correctIndex: 1,
      explanation:
        "Barkley is a psycho-educational parent program. It works alongside medical follow-up and is not a substitute for it.",
    },
  ],
  2: [
    {
      id: "2-1",
      question: "What is \"special time\" with your child?",
      options: [
        "A time to correct his mistakes",
        "20 daily minutes of positive attention without directives or criticism",
        "Time spent doing homework together",
        "A reward given on weekends",
      ],
      correctIndex: 1,
      explanation:
        "Special time is a dedicated moment of positive attention (15-20 min/day) where the parent follows the child's play without directing or criticizing.",
    },
    {
      id: "2-2",
      question:
        "During special time, what should you avoid doing?",
      options: [
        "Describing what the child is doing",
        "Giving orders or asking questions",
        "Being enthusiastic and positive",
        "Sitting next to the child",
      ],
      correctIndex: 1,
      explanation:
        "During special time, we avoid orders, questions, and criticism. We describe, we praise, and we follow the child's play.",
    },
    {
      id: "2-3",
      question:
        "Why is positive attention particularly important for a child with ADHD?",
      options: [
        "Because he often receives more negative remarks than other children",
        "Because he only understands compliments",
        "Because it replaces medication",
        "Because children with ADHD are more sensitive to gifts",
      ],
      correctIndex: 0,
      explanation:
        "Children with ADHD receive on average many more negative remarks. Positive attention rebalances the relationship.",
    },
    {
      id: "2-4",
      question:
        "Your child had a major meltdown this morning. In the evening, what do you do about special time?",
      options: [
        "You cancel it to show him that his behavior has consequences",
        "You keep it: special time is never taken away as punishment",
        "You cut it in half",
        "You replace it with a discussion about the morning's meltdown",
      ],
      correctIndex: 1,
      explanation:
        "Essential rule: special time is unconditional. Taking it away as punishment destroys the foundation of trust the relationship needs to build.",
    },
    {
      id: "2-5",
      question:
        "How often should special time ideally be organized?",
      options: [
        "Once a week is enough",
        "Every day or almost, for a short duration (15-20 min)",
        "Only when the child behaves well",
        "Once a month, during a special outing",
      ],
      correctIndex: 1,
      explanation:
        "Regularity matters more than duration: a short daily moment is more effective than an occasional outing.",
    },
  ],
  3: [
    {
      id: "3-1",
      question: "What is an effective command according to Barkley?",
      options: [
        "A command shouted loudly to grab attention",
        "A short, direct command given nearby with eye contact",
        "A suggestion phrased as a question",
        "A command repeated 3 times to be sure",
      ],
      correctIndex: 1,
      explanation:
        "An effective command is short, positively phrased, given from close by with eye contact. We avoid questions (\"Would you mind...?\").",
    },
    {
      id: "3-2",
      question:
        "Which phrasing is an effective command?",
      options: [
        "\"Could you tidy up your room please?\"",
        "\"Put your toys in the box now.\"",
        "\"Why is your room still a mess?\"",
        "\"It would be nice if you tidied up a bit.\"",
      ],
      correctIndex: 1,
      explanation:
        "An effective command is a clear and direct instruction, not a question or a reproach.",
    },
    {
      id: "3-3",
      question:
        "After giving an effective command, what do you do?",
      options: [
        "You repeat immediately if the child doesn't move",
        "You wait 5 to 10 seconds in silence to allow time to respond",
        "You move on to another simpler command",
        "You explain at length why it is important",
      ],
      correctIndex: 1,
      explanation:
        "After a command, wait silently for 5-10 seconds. Children with ADHD need more time to process information.",
    },
    {
      id: "3-4",
      question:
        "Your child needs to get ready for school. Which instruction is the most effective?",
      options: [
        "\"Hurry up, we're going to be late as usual!\"",
        "\"Put on your shoes now.\" (then, once done: \"Get your coat.\")",
        "\"Get dressed, get your bag, put on your shoes and coat, and come.\"",
        "\"Could you get moving a bit?\"",
      ],
      correctIndex: 1,
      explanation:
        "One command at a time. Chained instructions overload the working memory of a child with ADHD — he often only remembers the first or the last.",
    },
    {
      id: "3-5",
      question:
        "Your child starts tidying up then stops after 30 seconds. What do you do?",
      options: [
        "You praise him warmly and then calmly repeat the remaining command",
        "You raise your voice to get him going again",
        "You tidy up for him to finish faster",
        "You punish him for not finishing",
      ],
      correctIndex: 0,
      explanation:
        "Reinforce the start of the effort, then calmly redirect. ADHD makes persistence difficult — praising the start increases the likelihood of continuation.",
    },
    {
      id: "3-6",
      question:
        "After an effective command, what is the parent's role?",
      options: [
        "Go do something else and hope it gets done",
        "Stay nearby and monitor the execution of the command",
        "Count out loud to 10",
        "Leave the room to avoid giving in",
      ],
      correctIndex: 1,
      explanation:
        "Follow-through is essential: the parent stays present, checks the execution, and praises as soon as the child complies.",
    },
    {
      id: "3-7",
      question:
        "Among these phrasings, which is an ineffective command?",
      options: [
        "\"Put your shoes away in the entryway.\"",
        "\"Put on your shoes, please, sweetheart?\"",
        "\"Put on your pajamas now.\"",
        "\"Come to the table.\"",
      ],
      correctIndex: 1,
      explanation:
        "Phrasing a command as a question (\"please\") gives the child the implicit choice to refuse. You can stay polite without questioning: \"Put on your shoes.\"",
    },
  ],
  4: [
    {
      id: "4-1",
      question:
        "When your child interrupts you during an activity (phone, conversation), the first thing to do is:",
      options: [
        "Ignore him completely",
        "Give him an activity to do and praise him when he doesn't interrupt",
        "Scold him immediately",
        "Stop your activity to take care of him",
      ],
      correctIndex: 1,
      explanation:
        "Prepare the child by giving him something to do, then positively reinforce each moment when he doesn't interrupt.",
    },
    {
      id: "4-2",
      question:
        "Why do children with ADHD interrupt so often?",
      options: [
        "Out of disrespect",
        "Because their inhibition deficit makes waiting difficult",
        "Because they want to provoke",
        "Because they get bored easily and want gifts",
      ],
      correctIndex: 1,
      explanation:
        "The impulsivity linked to ADHD makes waiting very difficult — it is not disrespect or defiance.",
    },
    {
      id: "4-3",
      question:
        "What is the key principle for teaching the child not to interrupt?",
      options: [
        "Systematically punish each interruption",
        "Gradually increase the duration during which he must wait",
        "Demand 30 minutes of silence from the start",
        "Never talk to him during your activities",
      ],
      correctIndex: 1,
      explanation:
        "Start with short periods (2-3 minutes) and gradually increase, praising the child at each success.",
    },
    {
      id: "4-4",
      question:
        "You need to make an important phone call. The best preparation is:",
      options: [
        "Hope he leaves you alone this time",
        "Warn the child before the call, give him an activity, and announce the reward if he doesn't disturb you",
        "Go to another room and lock the door",
        "Tell him sternly \"Don't come bother me\"",
      ],
      correctIndex: 1,
      explanation:
        "The 3-step preparation — warn, occupy, reward — is the key. The child knows what to expect and has a concrete reason to cooperate.",
    },
    {
      id: "4-5",
      question:
        "During your activity, when should you praise the child?",
      options: [
        "Only at the end if everything went well",
        "Regularly, every few minutes while he plays without interrupting",
        "Only the next day",
        "Never, he must learn to manage on his own",
      ],
      correctIndex: 1,
      explanation:
        "Reinforce during the behavior, not just at the end. Frequent feedback during the activity consolidates learning.",
    },
  ],
  5: [
    {
      id: "5-1",
      question: "What is a token system?",
      options: [
        "A disguised punishment",
        "A reward system where the child earns points for good behavior",
        "An educational board game",
        "A method reserved for teachers",
      ],
      correctIndex: 1,
      explanation:
        "The token system rewards positive behaviors with points that can be exchanged for privileges or rewards.",
    },
    {
      id: "5-2",
      question:
        "How many target behaviors should be chosen at the start?",
      options: [
        "As many as possible to cover everything",
        "2 to 3 simple and observable behaviors",
        "Only one to avoid overloading",
        "10 behaviors to be thorough",
      ],
      correctIndex: 1,
      explanation:
        "Start with 2-3 simple, observable, and achievable behaviors. Too many targets demotivates the child.",
    },
    {
      id: "5-3",
      question:
        "When should the token be given to the child?",
      options: [
        "At the end of the day",
        "Immediately after the desired behavior",
        "On the weekend, summarizing the week",
        "Whenever the parent thinks of it",
      ],
      correctIndex: 1,
      explanation:
        "Immediacy is crucial: the token must follow the behavior as quickly as possible so the child makes the connection.",
    },
    {
      id: "5-4",
      question: "Can already-earned tokens be taken away?",
      options: [
        "Yes, for each bad behavior",
        "No, earned tokens should never be taken away",
        "Yes, but only on weekends",
        "Yes, if the child doesn't obey within 5 seconds",
      ],
      correctIndex: 1,
      explanation:
        "Fundamental Barkley principle: you never take away an earned token. The system must remain motivating and positive.",
    },
    {
      id: "5-5",
      question:
        "For a 4-year-old child, what type of tokens is most suitable?",
      options: [
        "Points written on a board",
        "Concrete, visual objects (plastic tokens, stickers, stars to stick)",
        "A digital count in an app",
        "Virtual money converted at the end of the month",
      ],
      correctIndex: 1,
      explanation:
        "Young children need concrete, visual supports. Before age 8-9, abstract points are too far removed from the behavior.",
    },
    {
      id: "5-6",
      question:
        "Among these rewards, which is BEST suited to the token system?",
      options: [
        "An expensive gift bought once a month",
        "A mix of small daily privileges (screen time, dessert choice) and occasional larger rewards",
        "Only candy",
        "Pocket money in cash",
      ],
      correctIndex: 1,
      explanation:
        "A good menu of rewards combines small, frequent gratifications (immediacy) with larger, rarer ones (long-term motivation).",
    },
    {
      id: "5-7",
      question:
        "After 2 weeks, your child easily earns all his tokens. What do you do?",
      options: [
        "You stop the system because it works",
        "You gradually increase the requirements or add a new target behavior",
        "You abruptly double the cost of all rewards",
        "You take away tokens to compensate",
      ],
      correctIndex: 1,
      explanation:
        "If the child is doing well, adjust gradually: add a behavior or slightly raise the bar. No abrupt changes or punitive removal.",
    },
  ],
  6: [
    {
      id: "6-1",
      question: "What is privilege removal?",
      options: [
        "Banning all activities for a week",
        "Removing a specific, time-limited privilege as a consequence of a specific behavior",
        "Taking toys out of the room",
        "Depriving the child of meals",
      ],
      correctIndex: 1,
      explanation:
        "Privilege removal is a proportionate consequence, limited in time, tied to a specific behavior.",
    },
    {
      id: "6-2",
      question:
        "What is the recommended duration of privilege removal?",
      options: [
        "The whole week",
        "Short and proportionate (a few hours to a day at most)",
        "As long as needed for the child to understand",
        "Until the child apologizes",
      ],
      correctIndex: 1,
      explanation:
        "Consequences must be short and proportionate. A duration that is too long loses its educational effect.",
    },
    {
      id: "6-3",
      question:
        "Before applying a privilege removal, you must:",
      options: [
        "Wait for the child to reoffend several times",
        "Have clearly warned the child about the rule and the consequence",
        "Ask the child's agreement",
        "Make sure the child is in a good mood",
      ],
      correctIndex: 1,
      explanation:
        "The child must know the rule and the consequence in advance. The removal should never be a surprise.",
    },
    {
      id: "6-4",
      question:
        "Your child forgot to put away his bike two evenings in a row, when it was his announced responsibility. Which consequence is most appropriate?",
      options: [
        "Confiscate the bike for a whole week",
        "No bike the next day and a calm reminder of the rule",
        "Remove all screens until further notice",
        "Deprive him of dessert for 3 days",
      ],
      correctIndex: 1,
      explanation:
        "The consequence must be proportionate, linked to the behavior (logical), and short. Suspending the bike for one day is sufficient and educational.",
    },
    {
      id: "6-5",
      question:
        "Why should both parents apply the same consequences?",
      options: [
        "So the child can't play one parent against the other",
        "Because the law requires it",
        "To punish the child twice",
        "Because one parent alone can't handle it",
      ],
      correctIndex: 0,
      explanation:
        "Consistency between parents is fundamental: differing rules make the system unpredictable and lead to triangulation.",
    },
  ],
  7: [
    {
      id: "7-1",
      question: "What is time-out?",
      options: [
        "Sending the child to his room for the rest of the day",
        "A short withdrawal to a calm, boring place to regain calm",
        "A physical punishment",
        "Ignoring the child for several hours",
      ],
      correctIndex: 1,
      explanation:
        "Time-out is a short withdrawal (1-2 min per year of age) in a calm and boring place, to allow the child to calm down.",
    },
    {
      id: "7-2",
      question: "What is the recommended duration of time-out?",
      options: [
        "30 minutes minimum",
        "1 to 2 minutes per year of the child's age",
        "As long as the child is screaming",
        "Always exactly 10 minutes",
      ],
      correctIndex: 1,
      explanation:
        "The rule is 1-2 minutes per year of age. A time-out that is too long loses its educational effectiveness.",
    },
    {
      id: "7-3",
      question: "What do you do at the end of the time-out?",
      options: [
        "You ask the child to apologize at length",
        "You calmly resume the initial instruction without revisiting the meltdown",
        "You explain for 10 minutes why his behavior was bad",
        "You take away dessert on top",
      ],
      correctIndex: 1,
      explanation:
        "After time-out, calmly resume where you left off. No lectures or additional punishment.",
    },
    {
      id: "7-4",
      question:
        "Which is an INAPPROPRIATE time-out location?",
      options: [
        "A chair in a quiet corner of the living room",
        "A closet or a locked room in the dark",
        "A stair step away from the toys",
        "A rug in the hallway, in the parent's view",
      ],
      correctIndex: 1,
      explanation:
        "Time-out is NEVER in a locked, dark, or scary space. The location must be boring but safe and reassuring, within the parent's view.",
    },
    {
      id: "7-5",
      question:
        "Your child gets up from time-out before the end. What do you do?",
      options: [
        "You calmly bring him back, without speaking, and the timer restarts",
        "You give up and move on to something else",
        "You slap him to teach him",
        "You double the duration each time he leaves",
      ],
      correctIndex: 0,
      explanation:
        "Bring him back calmly, without speaking or making eye contact, and restart the timer. No physical punishment, no verbal escalation.",
    },
    {
      id: "7-6",
      question:
        "For which child profile is time-out suitable?",
      options: [
        "Any child of any age",
        "Roughly ages 2 to 10-12, depending on maturity",
        "Only teenagers",
        "From the first months of life",
      ],
      correctIndex: 1,
      explanation:
        "Time-out applies to children roughly 2 to 10-12 years old. Before 2, the child cannot understand; after, other strategies are more suitable.",
    },
    {
      id: "7-7",
      question:
        "When does the time-out timer start?",
      options: [
        "As soon as you announce the consequence",
        "When the child is seated and calm in the designated spot",
        "At the end of the meal",
        "When the parent decides it's over",
      ],
      correctIndex: 1,
      explanation:
        "The countdown only starts when the child is calm and seated in the correct place. If he screams or struggles, wait silently for calm.",
    },
  ],
  8: [
    {
      id: "8-1",
      question:
        "Before an outing (store, restaurant), the key strategy is:",
      options: [
        "Hope everything goes well this time",
        "Set 2-3 clear rules with the child BEFORE leaving and plan a reward",
        "Threaten the child with never going out again if he misbehaves",
        "Avoid going out with the child",
      ],
      correctIndex: 1,
      explanation:
        "Preparation is the key: define the rules and consequences BEFORE the outing, and plan a reward if successful.",
    },
    {
      id: "8-2",
      question:
        "During the outing, how do you maintain good behavior?",
      options: [
        "By constantly reminding of possible punishments",
        "By giving frequent positive feedback while the child is behaving well",
        "By ignoring the child so he is autonomous",
        "By buying him whatever he wants to avoid meltdowns",
      ],
      correctIndex: 1,
      explanation:
        "Frequent encouragement during the outing reinforces good behavior and prevents meltdowns.",
    },
    {
      id: "8-3",
      question:
        "If the child has a meltdown in public, the best response is:",
      options: [
        "Yell louder than him to regain control",
        "Calmly apply the planned consequence, even if people are watching",
        "Give in to avoid embarrassment",
        "Punish him twice as severely at home",
      ],
      correctIndex: 1,
      explanation:
        "Stay consistent and apply the planned consequence, calmly. Giving in in public teaches that meltdowns work.",
    },
    {
      id: "8-4",
      question:
        "Before entering a supermarket, which phrasing of the rules is most effective?",
      options: [
        "\"Be good or else.\"",
        "\"The rules: you stay next to me, you don't touch anything without asking, you speak quietly. If you follow them, you'll get X on the way out.\"",
        "\"We're making it quick, don't annoy me.\"",
        "\"You know the rules, no need to repeat them.\"",
      ],
      correctIndex: 1,
      explanation:
        "Rules must be concrete, few in number (2-3), and paired with a clear reward. Repeating them at each outing helps memorization.",
    },
    {
      id: "8-5",
      question:
        "At the grandparents' house, the rules should:",
      options: [
        "Be relaxed because it's a special occasion",
        "Remain broadly the same, with an explicit adjustment if necessary",
        "Be ignored during the visit",
        "Be stricter than usual",
      ],
      correctIndex: 1,
      explanation:
        "Generalization requires consistency. You can adapt marginally, but make the adjustments explicit with the child in advance.",
    },
    {
      id: "8-6",
      question:
        "Your child has to wait 20 minutes in the car. What do you plan?",
      options: [
        "Nothing, he must learn to be patient",
        "A concrete activity (book, game, music) prepared in advance",
        "Give him your phone with no limit",
        "Have him get out of the car",
      ],
      correctIndex: 1,
      explanation:
        "Empty waiting is very difficult for a child with ADHD. Always anticipate boredom with a concrete, time-limited activity.",
    },
    {
      id: "8-7",
      question:
        "What is the difference between a reward and bribery?",
      options: [
        "None, it's the same thing",
        "A reward is announced BEFORE the behavior; bribery is promised during the meltdown to make the behavior stop",
        "A reward is always material",
        "Bribery is more effective in the long term",
      ],
      correctIndex: 1,
      explanation:
        "Crucial distinction: reward = announced in advance for an expected behavior. Bribery = promised during/after a meltdown to stop it — it reinforces the meltdown.",
    },
  ],
  9: [
    {
      id: "9-1",
      question:
        "To handle a new behavior problem, the first step is:",
      options: [
        "Punish immediately",
        "Clearly define the problem behavior and analyze its context (when, where, why)",
        "Ask the child why he does it",
        "Ignore it and hope it passes",
      ],
      correctIndex: 1,
      explanation:
        "Start by observing and precisely defining the behavior: in what context it appears, what triggers it, what maintains it.",
    },
    {
      id: "9-2",
      question:
        "What approach should be used when facing a new behavioral challenge?",
      options: [
        "Invent a new punishment each time",
        "Apply the same principles learned (positive attention, effective commands, tokens, consequences)",
        "Look for a new program",
        "Check the internet for each situation",
      ],
      correctIndex: 1,
      explanation:
        "The Barkley program principles apply to all behaviors: reuse the tools you've already mastered.",
    },
    {
      id: "9-3",
      question:
        "Why is it important to anticipate future problems?",
      options: [
        "To worry in advance",
        "To have an action plan ready rather than reacting in an emergency",
        "To prevent the child from growing up",
        "To control everything in the child's life",
      ],
      correctIndex: 1,
      explanation:
        "Anticipating allows you to respond with a clear plan rather than under stress, resulting in more consistent and effective responses.",
    },
    {
      id: "9-4",
      question:
        "Your child starts lying regularly. What is the best first step?",
      options: [
        "Punish him very harshly as soon as you spot the first lie",
        "Observe when, in what contexts, and why he lies (fear of punishment, attention, avoidance)",
        "Never trust him again",
        "Promise him a gift if he stops",
      ],
      correctIndex: 1,
      explanation:
        "Analyze the context (Antecedent-Behavior-Consequence) before acting. Lying often has a function — frequently avoiding an overly harsh punishment.",
    },
    {
      id: "9-5",
      question:
        "When facing a new problem, the Barkley analysis framework is:",
      options: [
        "Antecedents → Behavior → Consequences",
        "Punishment → Reward → Guilt",
        "Discussion → Threats → Isolation",
        "Ignore → Wait → Hope",
      ],
      correctIndex: 0,
      explanation:
        "ABC analysis (Antecedents, Behavior, Consequences) is the functional analysis framework common to all behaviors.",
    },
  ],
  10: [
    {
      id: "10-1",
      question:
        "At the end of the program, what is the main goal of the review?",
      options: [
        "Assess whether the child is cured of ADHD",
        "Identify the strategies that work best for your family and plan their maintenance",
        "Compare your child to others",
        "Decide to stop all strategies",
      ],
      correctIndex: 1,
      explanation:
        "The review is used to identify what works, consolidate gains, and plan long-term maintenance. ADHD is not \"cured.\"",
    },
    {
      id: "10-2",
      question:
        "How do you maintain the gains of the program over time?",
      options: [
        "Stop the strategies once the child is doing better",
        "Keep applying the principles daily and adapt to the child's development",
        "Never change methods again",
        "Restart the program from scratch every year",
      ],
      correctIndex: 1,
      explanation:
        "Strategies must remain active and adapt as the child grows. Consistency is key.",
    },
    {
      id: "10-3",
      question:
        "If difficulties reappear after a period of improvement, you should:",
      options: [
        "Conclude that the program did not work",
        "Go back to basics: strengthen positive attention, revisit the rules and consequences",
        "Give up and try something completely different",
        "Punish more severely to catch up",
      ],
      correctIndex: 1,
      explanation:
        "Relapses are normal. Go back to the program's fundamentals: it's a sign that the strategies need to be reactivated, not abandoned.",
    },
    {
      id: "10-4",
      question:
        "What is the best way to celebrate your child's progress?",
      options: [
        "List his remaining flaws so he stays humble",
        "Explicitly acknowledge the concrete efforts and progress with him (\"You did X, I am proud of you\")",
        "Say nothing, it would go to his head",
        "Give him a big material gift each month",
      ],
      correctIndex: 1,
      explanation:
        "Progress must be verbalized explicitly. The child with ADHD needs concrete positive feedback to build self-esteem.",
    },
    {
      id: "10-5",
      question:
        "How long after the program can \"booster sessions\" be considered?",
      options: [
        "Never, the program is definitively finished",
        "Periodically (every 3-6 months) or during important transitions (moving, new school)",
        "Only if the child becomes difficult again",
        "Only in adolescence",
      ],
      correctIndex: 1,
      explanation:
        "Regular booster sessions, or during transitions, maintain the gains. ADHD evolves with age and changing contexts.",
    },
  ],
};
