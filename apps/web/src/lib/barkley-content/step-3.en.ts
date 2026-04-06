import type { StepContent } from "./types";

export const step3Content: StepContent = {
    stepNumber: 3,
    title: "Effective commands",
    intro:
        "'Clean your room!' 'Hurry up!' 'How many times do I have to tell you?' Every parent knows these phrases. But for an ADHD child, they're like fog: too vague, too long, too distant. This third module, inspired by Dr. Barkley's approach, teaches you to give instructions that your child's brain can actually process. It's not a question of authority — it's a question of adapted communication.",

    understand: {
        heading: "Understanding",
        body:
            "An ADHD child's working memory works like a tiny sticky note: it can hold one or two pieces of information at a time, not five. When you say 'Go upstairs, brush your teeth, put your pajamas on, and pick out a book,' their brain might register 'go upstairs' and 'book' — but everything in between is lost.\n\n" +
            "Physical distance and eye contact also play a crucial role. An instruction shouted from the kitchen to a child playing in their room has very little chance of being processed. The ADHD brain needs a strong input signal — the parent's proximity, eye contact, a gentle touch — to activate attention.\n\n" +
            "Finally, how you phrase things matters enormously. 'Could you tidy up your toys?' is a question, not a command. The child can legitimately answer 'no.' 'Stop yelling' is a negative command: it says what not to do, but not what to do instead. The brain has to first decode the 'don't,' then imagine the alternative — that's two cognitive steps instead of one.\n\n" +
            "The good news is that giving effective commands is a learnable skill. And when instructions are clear, short, and direct, cooperation increases dramatically — not because the child obeys better, but because they finally understand what's expected of them.",
        callout: {
            type: "tip",
            text: "Simple rule: if your command has more than ten words or more than one action, it's probably too long. Test it by counting on your fingers.",
        },
    },

    technique: {
        heading: "The Technique",
        body:
            "Here are the five principles of an effective command, adapted to how the ADHD brain works:\n\n" +
            "1. Get close. Go physically to your child. Get down to their eye level if possible. Place a hand on their shoulder if it helps them connect. Wait until you have eye contact before speaking.\n\n" +
            "2. Be brief and direct. One instruction at a time. 'Put your shoes on.' Full stop. Not 'Put your shoes on and grab your coat and don't forget your snack.' Every added instruction dilutes the first one.\n\n" +
            "3. Phrase it positively. Say what you want to see, not what you don't want to see. Instead of 'Stop running,' say 'Walk.' Instead of 'Don't shout,' say 'Use a quiet voice.' The brain processes a positive command faster.\n\n" +
            "4. Don't ask a question. 'Can you set the table?' leaves the door open to refusal. 'Set the table, please' is clear while still being respectful. The 'please' is politeness, not an option.\n\n" +
            "5. Wait in silence. After giving the command, count silently to five or ten. Don't repeat. Don't add explanations. The ADHD brain needs processing time. If you fill that silence with words, you reset the clock to zero.\n\n" +
            "A common mistake is repeating the command at increasing volume. This only triggers anxiety or resistance. A single well-delivered instruction followed by silence is more effective than ten frustrated repetitions.\n\n" +
            "If nothing happens after ten seconds of silence, calmly restate it once while making sure you have eye contact: 'Leo, look at me. Put your shoes on now.' Later steps in the program will give you tools for handling non-compliance — for now, focus on making the command itself crystal clear.",
        callout: {
            type: "example",
            text: "Before: 'Come on, how many times have I told you to pick that up, you always leave everything lying around!' After: walk over, hand on shoulder, eye contact. 'Put the game back in the box.' Silence. Five seconds. The child starts tidying up.",
        },
    },

    scenarios: [
        {
            title: "The morning marathon",
            body:
                "Every morning, Sacha's mother rattles off: 'Get up, get dressed, eat breakfast, brush your teeth!' Sacha, 7, sits in front of his cereal bowl in his pajamas, staring into space. His mother repeats it three times, then yells. They arrive late to school.\n\n" +
                "With the new approach: his mother goes to Sacha's room, sits on the bed, and places a hand on his back. 'Sacha, look at me. Get dressed.' She lays out the day's outfit to eliminate decision overload. She waits ten seconds in silence. Sacha starts pulling on his pants. Once he's dressed, she comes back: 'Now come eat breakfast.' One command at a time, in sequence.\n\n" +
                "The morning takes the same amount of time, but without the yelling. After a few weeks, Sacha starts anticipating the next step on his own.",
        },
        {
            title: "The homework battle",
            body:
                "Every evening, Aicha's father says: 'You have homework — go do it in your room.' Aicha, 9, sits in front of her notebook, and thirty minutes later he finds her doodling in the margins. He erupts: 'You haven't done anything!'\n\n" +
                "With the new approach: her father sits down next to Aicha. He opens the notebook with her. 'Read the first question out loud.' When that's done: 'Write the answer to the first problem.' He stays nearby, quiet, available. He doesn't do the homework for her — he breaks the task into micro-steps and gives one instruction at a time.\n\n" +
                "Aicha finishes in twenty minutes instead of sixty. Her father discovers she wasn't being lazy — she was overwhelmed by the size of the task.",
        },
        {
            title: "Bedtime",
            body:
                "Every evening, Emile's mother calls out from the living room: 'Time for bed!' Emile, 6, keeps on playing as if he heard nothing. She repeats. He negotiates. She raises her voice. He cries. Bedtime takes an hour.\n\n" +
                "With the new approach: his mother gives a five-minute warning ('Five more minutes, then it's bedtime'). When the moment arrives, she goes to Emile, gets down to his level. 'Emile, look at me. It's time to put your pajamas on.' She waits. Emile sighs but gets up. Next: 'Go brush your teeth.' Then: 'Pick a book for your story.' Three steps, three separate commands, given up close.\n\n" +
                "Bedtime goes from sixty minutes to twenty-five. Emile knows exactly what's expected and in what order.",
        },
    ],

    keyTakeaways: [
        "Get physically close and make eye contact before speaking — a command shouted from across the room rarely gets processed by the ADHD brain.",
        "One instruction at a time, ten words maximum — your child's working memory can't store a list.",
        "Phrase commands positively (say what to do) and directly (make a statement, not a question).",
        "After giving the command, wait 5 to 10 seconds in silence — the brain needs processing time.",
        "Don't repeat on a loop: one clear command followed by silence is more effective than ten frustrated reminders.",
    ],

    practiceExercise:
        "Choose three recurring moments in the day (morning, homework, bedtime). For each one, rewrite your usual instructions using the five principles: get close, be brief, phrase positively, make a statement, wait in silence. Note in the app what the command was 'before' and 'after.' Practice for one week and observe: does the number of repetitions decrease? Does the tension level drop? Record your observations each evening.",
};
