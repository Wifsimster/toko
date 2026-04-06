import type { StepContent } from "./types";

export const step1Content: StepContent = {
    stepNumber: 1,
    title: "Why does my child behave this way?",
    intro:
        "Your child forgot his backpack for the third time this week. She has a meltdown because the pasta isn't the 'right kind.' He takes twenty minutes to put his shoes on while you're already running late. You might be thinking: 'He's doing it on purpose,' 'She's just lazy,' or 'He's pushing my buttons.' These thoughts are perfectly normal — but they rest on a misunderstanding. This first module, inspired by Dr. Russell Barkley's approach, invites you to shift how you see your child's behavior. Not to make excuses for it, but to understand it better — and therefore help more effectively.",

    understand: {
        heading: "Understanding",
        body:
            "ADHD is not a problem of willpower, character, or upbringing. It's a neurodevelopmental condition that affects the brain's executive functions: the ability to plan, to put the brakes on an impulse, to manage emotions, to hold instructions in working memory, and to find motivation for tasks that aren't stimulating.\n\n" +
            "Think of it like an orchestra conductor who keeps losing focus: the musicians (your child's skills) are all there, but no one is coordinating them at the right moment. Your child knows he should pack his bag. She knows not to scream at the dinner table. But between knowing and doing, there's a neurological gap that willpower alone can't bridge.\n\n" +
            "When a parent interprets these struggles as defiance or laziness, a vicious cycle takes hold: the more we punish, the more the child feels misunderstood, the more they react, and the more helpless the parent feels. Barkley calls this the 'coercive trap.' The parent raises their voice, the child resists, the parent gives in or explodes, and the pattern repeats.\n\n" +
            "Recognizing that your child's brain works differently doesn't mean accepting everything. It means adjusting your expectations and strategies to work with their brain, not against it. A nearsighted child isn't punished for not seeing the board — they're given glasses. The steps in this program are the glasses for your parenting.",
        callout: {
            type: "tip",
            text: "Quick mental exercise: next time you catch yourself thinking 'he's doing it on purpose,' reframe it as 'he can't do it yet.' That single word change shifts your entire approach.",
        },
    },

    technique: {
        heading: "The Technique",
        body:
            "The key technique for this step is parental cognitive reframing. It's about learning to distinguish between 'won't do it' and 'can't do it yet.'\n\n" +
            "In practice, keep a small notebook (or use the app's notes feature) and for one week, record each difficult situation in two columns:\n\n" +
            "— Column 1: 'What I thought in the moment' (e.g., 'He's provoking me')\n" +
            "— Column 2: 'Which executive function was involved?' (e.g., working memory, inhibition, emotional regulation)\n\n" +
            "You don't need to be a neuropsychologist. The main categories are straightforward:\n" +
            "• Working memory: forgetting instructions, losing belongings.\n" +
            "• Inhibition: acting before thinking, interrupting, touching everything.\n" +
            "• Emotional regulation: disproportionate explosions of anger or sadness.\n" +
            "• Flexibility: struggling with changes of plan or transitions.\n" +
            "• Planning: not knowing where to start, overwhelmed by the steps involved.\n\n" +
            "By identifying the executive function in difficulty, you move from judgment ('he's impossible') to analysis ('he's struggling to control his impulse'). And it's from that analysis that the strategies in later steps become possible.",
        callout: {
            type: "warning",
            text: "This program is inspired by Dr. Barkley's work but does not replace professional care. If your child has not yet been assessed, please consult a specialized healthcare professional.",
        },
    },

    scenarios: [
        {
            title: "The forgotten backpack",
            body:
                "Monday morning, Theo, 8, arrives at school without his backpack — it's still sitting by the front door. His mother, exasperated, says: 'You never pay attention!' Theo hangs his head. That evening, same thing with his homework folder. His mother assumes he just doesn't care.\n\n" +
                "In reality, Theo has a fragile working memory. He intended to grab his backpack, but between putting on his shoes and stopping to pet the cat, the information simply dropped out. It's not indifference — it's a deficit in holding information in real time.\n\n" +
                "An adjusted approach: place the backpack in front of the door (adapt the environment) and check together before leaving (external support for working memory).",
        },
        {
            title: "The dinner meltdown",
            body:
                "Wednesday evening, Ines, 6, shoves her plate away screaming 'This is disgusting!' Her father raises his voice: 'We don't talk like that!' Ines bursts into tears and leaves the table. Her father thinks she's just being difficult.\n\n" +
                "Ines has just come from a school day where she had to contain her impulses for six straight hours. Her emotional regulation capacity is completely drained. The plate was just the trigger, not the cause. It's like a dam bursting after a day of rain.\n\n" +
                "An adjusted approach: plan a ten-minute quiet wind-down after school, offer a limited choice for dinner, and acknowledge the emotion ('You look exhausted') before addressing the behavior.",
        },
        {
            title: "The impossible homework",
            body:
                "Saturday afternoon, Lucas, 10, has a math assignment. After two minutes, he gets up, fiddles with his pen, stares out the window. His father snaps: 'Focus! It's not that hard!' Lucas explodes: 'I'm stupid anyway!'\n\n" +
                "Lucas actually has two overlapping challenges: a planning deficit (he doesn't know which step to start with) and a motivation deficit (the task isn't stimulating enough, so his brain isn't producing enough dopamine to engage). This isn't laziness.\n\n" +
                "An adjusted approach: break the assignment into micro-steps ('Just do the first problem'), use a five-minute timer followed by a break, and praise the effort rather than the result.",
        },
    ],

    keyTakeaways: [
        "ADHD is a neurological condition affecting executive functions — not a lack of willpower or parenting.",
        "The coercive trap (punish → resistance → escalation) takes hold when we confuse 'won't' with 'can't yet.'",
        "Identifying the struggling executive function (memory, inhibition, emotion, flexibility, planning) lets you move from judgment to strategy.",
        "Adapting the environment and providing external support for what the brain can't yet do alone is the key.",
        "Understanding is not excusing — it's the first step toward helping effectively.",
    ],

    practiceExercise:
        "This week, pick three difficult situations with your child. For each one, note in the app: (1) what happened, (2) what you spontaneously thought, (3) which executive function was likely involved. At the end of the week, reread your notes. Do you see a recurring pattern? Share your discovery with your co-parent or a trusted person.",
};
