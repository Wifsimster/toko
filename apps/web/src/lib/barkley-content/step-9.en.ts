import type { StepContent } from "./types";

export const step9Content: StepContent = {
    stepNumber: 9,
    title: "Managing future problems",
    intro:
        "You now have a complete toolbox: positive attention, effective commands, reward systems, time-out, managing outings. But parenting isn't a problem you solve once and for all. Your child grows, changes, and new challenges will appear: lying, sibling conflicts, school transitions, complicated friendships. This chapter teaches you a systematic analysis method — ABC analysis — to decode any new behavior and respond using the tools you've already mastered. The goal is to become your own expert.",

    understand: {
        heading: "ABC analysis: decoding behavior",
        body: "ABC analysis (Antecedent — Behavior — Consequence) is a foundational tool in behavioral psychology. For any problematic behavior, ask yourself three questions. Antecedent: what happened just before? What was the context — the time, the child's emotional state, the request you made? Behavior: what exactly happened? Describe the observable facts, not your interpretation. \"He screamed and threw his notebook\" rather than \"he had a meltdown.\" Consequence: what happened next? How did you react? Did the behavior allow the child to get something (attention, task avoidance, a desired object)? This analysis reveals the function of the behavior. A child who lies to avoid punishment has a different need than a child who lies to get attention. The response will therefore be different. By identifying the hidden \"why\" behind the behavior, you choose the most appropriate tool from your toolbox.",
        callout: {
            type: "tip",
            text: "Keep a mini ABC journal for one week on a specific behavior. Three columns: Before / Behavior / After. Patterns usually emerge by the third or fourth episode.",
        },
    },

    technique: {
        heading: "Anticipate rather than react",
        body: "Most meltdowns don't come out of nowhere. They follow predictable patterns: fatigue, hunger, transitions, frustration with a difficult task. Once you've identified the pattern through ABC analysis, you can intervene upstream. Modify the antecedent: if homework consistently triggers a crisis at 6 PM when your child is exhausted, try moving it to right after their afternoon snack. Reinforce the alternative behavior: if your child lies to avoid punishment, make sure telling the truth costs less than lying. \"Thank you for telling me the truth — that took courage. The consequence will be lighter.\" Prepare the child for transitions: changes are hard for children with ADHD. Five minutes before a fun activity ends, give a warning: \"Five more minutes, then we turn off the tablet.\" Then two minutes. Then one minute. Each new challenge is an opportunity to combine your existing tools in a new way. You don't need a brand-new method for every problem — you need to apply the right method at the right time.",
        callout: {
            type: "example",
            text: "ABC analysis of a lie: Antecedent → you ask \"who spilled the glass?\" in a harsh tone. Behavior → the child says \"it wasn't me.\" Consequence → you get angrier. Solution: change the antecedent by using a neutral tone and making honesty feel safe.",
        },
    },

    scenarios: [
        {
            title: "The child starts lying",
            body: "Mael, age 7, systematically denies any wrongdoing. Your ABC analysis reveals a pattern: when you discover something he did wrong and ask about it in an accusatory tone, Mael lies. When he tells the truth, the punishment is the same as when he lies. He has zero incentive to be honest. You change your approach: you adopt a neutral tone when asking the question, and you clearly differentiate consequences. \"You spilled the juice. Thank you for telling me. Grab the sponge and clean it up, please.\" Versus: \"You lied about the juice. You clean it up AND you lose 5 minutes of screen time.\" Within a few weeks, Mael lies much less — because telling the truth has become less costly.",
        },
        {
            title: "New school year transition",
            body: "September is approaching, and Jade, age 8, is increasingly anxious: eye blinking, trouble falling asleep, growing defiance. You anticipate by applying familiar tools. You reinstall school routines a week before classes start (earlier bedtime, gradual wake-ups). You visit the school together to reduce the unknown. You set up a special back-to-school reward chart with simple goals: pack the backpack the night before, get up without yelling. You maintain intense positive attention: \"You did an amazing job getting your things ready — I'm really proud of you.\" Anticipation transforms a potential crisis period into a manageable transition.",
        },
        {
            title: "Sibling conflicts intensifying",
            body: "For the past few weeks, fights between Theo (age 9) and his little sister Lena (age 6) have been escalating systematically. Your ABC analysis shows that conflicts always happen when both children share a space without a structured activity, and that Theo gets attention (even negative attention) when he bothers Lena. You reorganize: stretches of separate play alternate with supervised joint activities. You massively reinforce cooperative play: \"You've been playing together for 10 minutes without fighting — that's awesome! You each earn a token.\" The conflicts don't disappear, but their frequency drops significantly.",
        },
    ],

    keyTakeaways: [
        "ABC analysis (Antecedent–Behavior–Consequence) is your investigation tool for any new problem.",
        "Most behaviors serve a function: getting something or avoiding something. Identify the function before choosing your tool.",
        "Anticipating beats reacting: modify the antecedent when possible rather than managing the crisis after it erupts.",
        "You don't need new methods — you need to apply the right methods at the right time.",
    ],

    practiceExercise:
        "Choose one recurring behavior that's currently giving you trouble. For the next 5 days, keep a mini ABC journal every time it happens: note what came before (antecedent), the exact behavior (observable facts), and what followed (your reaction and the outcome). At the end of the week, reread your notes and look for the pattern. Identify one modifiable antecedent or one consequence to adjust, then test that change during the following week.",
};
