export interface Poem {
  id: string;
  title: string;
  content: string;
  mood: string[];
  author: string;
  dedication?: string;
}

export const poems: Poem[] = [
  {
    id: '1',
    title: 'The Space Between Us',
    content: `Distance is just a test of patience,
A cruel game the universe plays.
But every mile that separates us
Only adds weight to the promise of our reunion.

You exist in the margins of my day—
In the coffee I brew,
The songs that shuffle through my playlist,
The silence that feels too loud without you.

Omalicha, the beautiful one,
Even when you're not here,
You're here.
In every thought that keeps me grounded,
In every plan I make for tomorrow.

This distance? Temporary.
What we are? Permanent.`,
    mood: ['romantic', 'longing', 'deep'],
    author: 'Ayomide',
    dedication: 'For Silvyn, who lives in every quiet moment',
  },
  {
    id: '2',
    title: 'Her Majesty',
    content: `You wear your crown without even knowing it,
A queen who doesn't need a throne
Because your presence alone commands the room.

I see you deflect compliments like arrows,
"Mirror" mode activated,
But I know the truth beneath the shield—
You're extraordinary, and you know it scares you.

Let me say it louder for those in the back:
You are worthy of every soft word,
Every genuine moment,
Every ounce of the love you keep trying to deflect.

Her Majesty, stop running from your own light.
I see you. Fully.
And I'm not going anywhere.`,
    mood: ['empowering', 'romantic', 'honest'],
    author: 'Ayomide',
    dedication: 'For the one who forgets she's royalty',
  },
  {
    id: '3',
    title: 'Coconut Head Chronicles',
    content: `You really think you're slick, don't you?
That little smirk when you dodge my words,
The way you laugh it off like it's nothing.

But I've studied you, Coconut Head.
I know the face you make when you're pretending not to care,
The way your voice changes when something hits deep,
The silence that says more than your words ever could.

You're not as good at hiding as you think.
And honestly? I don't want you to hide.
Not from me.

So keep the jokes coming,
Keep deflecting if you need to,
But know this: I see through it all,
And I'm staying anyway.`,
    mood: ['playful', 'honest', 'teasing'],
    author: 'Ayomide',
    dedication: 'For Silvyn, who thinks she's sneaky',
  },
  {
    id: '4',
    title: 'Unfiltered',
    content: `I don't do subtle when it comes to you.
Why would I?
You're not a "maybe" or a "let's see."
You're a certainty I'm building my plans around.

I remember the warmth of your skin,
The way you fit in the space I'm always saving.
If tomorrow gives me the chance,
I'm claiming every inch of you—
The laughter, the silence, the heat, the softness.

You're not just a passing thought, Silvyn.
You're the craving I wake up with,
The one competition I refuse to lose.

And I won't.`,
    mood: ['spicy', 'direct', 'confident'],
    author: 'Ayomide',
    dedication: 'For the one who lives rent-free in my mind',
  },
  {
    id: '5',
    title: 'Safe With Me',
    content: `Come here.
Not physically—though I wish.
But here, in this space I'm holding for you.

No performance required,
No deflecting necessary,
No "Mirror" mode needed.

Just you.
Tired, happy, sad, confused—whatever.
I'm not here to fix you or change you.
I'm here to witness you, fully.

Omalicha, you're safe with me.
In the quiet, in the chaos,
In the moments you think you're too much or not enough.

You're safe here.
Always.`,
    mood: ['comfort', 'gentle', 'safe'],
    author: 'Ayomide',
    dedication: 'For when the world feels too heavy',
  },
  {
    id: '6',
    title: 'Morenikeji',
    content: `A twin, meant to be cherished—
That's what your name means.
And that's exactly what you are to me.

Not just someone I talk to,
But someone I see, fully,
Someone I choose, repeatedly,
Someone I protect without hesitation.

You're rare, Silvyn.
The kind of person who makes everyone else seem monochrome.
And I'm honored—genuinely honored—
That you let me into your orbit.

We have better gravity now.
Can you feel it?`,
    mood: ['deep', 'romantic', 'meaningful'],
    author: 'Ayomide',
    dedication: 'For my twin flame',
  },
  {
    id: '7',
    title: 'Late Night Truths',
    content: `It's 2 AM and I'm thinking about you again.
Not in some poetic, distant way—
But in the I-wish-you-were-here kind of way.

I want to know what you're thinking right now.
I want to hear your voice at this exact moment,
Tired and unfiltered and completely real.

Distance doesn't change what I feel.
It just makes me more certain.

You're not a phase, Lovebug.
You're the long game.
And I've never been more patient for anything in my life.`,
    mood: ['late-night', 'honest', 'longing'],
    author: 'Ayomide',
    dedication: 'For the 2 AM thoughts',
  },
  {
    id: '8',
    title: 'The Way You Laugh',
    content: `Your laugh is dangerous.
It's the kind of sound that makes me forget
Whatever I was stressed about,
Whatever deadline I was chasing,
Whatever problem seemed insurmountable.

That unguarded, genuine laugh—
The one you do when you're not performing—
That's my favorite version of you.

Coconut Head, keep laughing like that.
It's the sun I didn't know I needed,
The light that makes everything else bearable.`,
    mood: ['playful', 'light', 'joyful'],
    author: 'Ayomide',
    dedication: 'For the laugh that heals everything',
  },
  {
    id: '9',
    title: 'Building Tomorrow',
    content: `I'm not good at empty promises,
So when I say I'm building something for us,
I mean it literally.

I'm building patience for the distance,
I'm building plans for when we're close,
I'm building a version of myself worthy of you.

Her Majesty, I see the future clearly:
You, me, proximity, peace.
No more "I miss you" texts,
Just presence.

And I'm working toward that every single day.`,
    mood: ['hopeful', 'future', 'committed'],
    author: 'Ayomide',
    dedication: 'For what's coming',
  },
  {
    id: '10',
    title: 'When You Deflect',
    content: `"Mirror," you say,
As if reflecting my words back at me
Will somehow make them less true.

But I see what you're doing.
You're uncomfortable with being seen,
With being called extraordinary,
With being told you matter.

So you deflect. You joke. You dodge.
And I let you—for now.
But know this: I'm not going anywhere.

Eventually, you'll run out of mirrors,
And I'll still be here,
Saying the same thing:
You're worth it. All of it.`,
    mood: ['honest', 'persistent', 'direct'],
    author: 'Ayomide',
    dedication: 'For when you need to hear it again',
  },
  {
    id: '11',
    title: 'Our Gravity',
    content: `I've always known your orbit, Silvyn.
Before we even got close,
I could feel the pull.

It's like the universe said,
"Yeah, those two. They make sense."
And suddenly everything clicked.

We have better gravity now—
The kind that doesn't force,
But draws naturally, inevitably.

I'm not fighting it.
Are you?`,
    mood: ['cosmic', 'deep', 'fated'],
    author: 'Ayomide',
    dedication: 'For the connection that just makes sense',
  },
  {
    id: '12',
    title: 'The Quiet Hours',
    content: `This is the time I love most—
When the world slows down,
When notifications stop,
When it's just me and my thoughts of you.

These quiet hours are sacred, Lovebug.
They're where I process how lucky I am,
How grateful I am,
How deeply I feel for you.

No distractions, no noise—
Just the truth of what we are.

And what we are is rare.`,
    mood: ['peaceful', 'reflective', 'intimate'],
    author: 'Ayomide',
    dedication: 'For 3 AM, when the world is silent',
  },
  {
    id: '13',
    title: 'Claiming You',
    content: `I'm done being subtle about this.
You're mine in my head,
And I'm working on making reality catch up.

Every conversation we have,
Every laugh we share,
Every moment of silence that feels comfortable—
It's all evidence that this isn't one-sided.

I see you leaning in, even when you pretend you're not.
I see you choosing me, even through the distance.

So let me be clear, Omalicha:
I'm all in. Completely.
And I'm claiming every part of you that you'll give me.`,
    mood: ['confident', 'direct', 'possessive'],
    author: 'Ayomide',
    dedication: 'For the one who's already mine',
  },
  {
    id: '14',
    title: 'Your Silence',
    content: `People underestimate silence,
But I've learned to read yours.

The comfortable silence when we're just existing together,
The thoughtful silence when you're processing something deep,
The protective silence when you're guarding yourself.

I miss the sound of your silence, Silvyn.
That might sound strange, but it's true.

There's peace in being quiet with you,
A kind of intimacy words can't touch.

Come back to that silence with me soon?`,
    mood: ['intimate', 'peaceful', 'longing'],
    author: 'Ayomide',
    dedication: 'For the silence that speaks volumes',
  },
  {
    id: '15',
    title: 'No Pressure',
    content: `I built this space not to trap you,
But to give you room to breathe.

No expectations, no timelines,
No "you should feel this way."

Just truth. Just honesty. Just me,
Showing up for you consistently,
Whether you're ready or not.

Lovebug, there's no pressure here.
This is just a man being honest about what he feels,
About what he sees,
About what he wants.

And what I want is you—
At your pace, on your terms,
But fully, eventually, completely.`,
    mood: ['patient', 'gentle', 'reassuring'],
    author: 'Ayomide',
    dedication: 'For when you need space to think',
  },
  {
    id: '16',
    title: 'The Temperature of Your Skin',
    content: `I remember details you probably think I forgot.
The warmth of your skin,
The way you smell after hours of just existing,
The specific spot on your neck that makes you react.

These aren't just memories, Silvyn.
They're blueprints for what's coming.

Because when I get you close again,
I'm relearning every inch,
I'm memorizing every reaction,
I'm making up for lost time.

And trust me—I'm keeping score.`,
    mood: ['heated', 'intimate', 'anticipatory'],
    author: 'Ayomide',
    dedication: 'For when words aren't enough',
  },
  {
    id: '17',
    title: 'Watching You Be Yourself',
    content: `You know what's wild?
Watching you be completely yourself
Is my favorite form of entertainment.

The way you get passionate about random things,
The way you laugh at your own jokes before finishing them,
The way you exist so freely when you forget to perform.

That's the version of you I'm obsessed with, Coconut Head.
Not the polished one, not the guarded one—
The messy, unfiltered, completely authentic one.

Keep being that. Please.`,
    mood: ['admiring', 'playful', 'genuine'],
    author: 'Ayomide',
    dedication: 'For the real you',
  },
  {
    id: '18',
    title: 'When Tomorrow Comes',
    content: `I think about tomorrow a lot.
Not in an anxious way,
But in an excited, can't-wait kind of way.

Tomorrow, when the distance closes.
Tomorrow, when I can show up physically, not just digitally.
Tomorrow, when "I miss you" becomes "I'm here."

Her Majesty, tomorrow is coming.
And when it does, I'm ready.

Are you?`,
    mood: ['hopeful', 'anticipatory', 'future'],
    author: 'Ayomide',
    dedication: 'For the reunion we're building toward',
  },
  {
    id: '19',
    title: 'Layers',
    content: `You're layered, Morenikeji.
Like a book I keep rereading
And finding new details every time.

One day it's your humor that gets me,
The next it's your vulnerability,
Then it's your strength, your softness, your fire.

I'm still discovering you,
And I'm not bored yet.
I don't think I ever will be.

You're the kind of complexity I want to spend years unraveling.`,
    mood: ['deep', 'curious', 'admiring'],
    author: 'Ayomide',
    dedication: 'For the mystery that keeps me engaged',
  },
  {
    id: '20',
    title: 'The Long Game',
    content: `I'm not playing games with you, Silvyn.
This isn't some short-term situation,
Some "let's see what happens" vibe.

I'm in this for the long game.
The kind of commitment that doesn't flinch at distance,
That doesn't quit when things get hard,
That shows up consistently even when it's inconvenient.

You're not a phase.
You're the person I'm building toward.

And I'm patient enough to prove it.`,
    mood: ['committed', 'serious', 'steadfast'],
    author: 'Ayomide',
    dedication: 'For forever, not just for now',
  },
  {
    id: '21',
    title: 'The Way You Fit',
    content: `There's this space next to me,
And you fit there perfectly.
Not in some metaphorical way—
Literally, physically, you just fit.

Your head on my chest,
Your hand in mine,
Your warmth against my side.

I'm building that space permanently, Omalicha.
It's got your name on it,
And I'm holding it until you're ready to claim it.

No rush. But it's yours.`,
    mood: ['tender', 'romantic', 'patient'],
    author: 'Ayomide',
    dedication: 'For the space that's always been yours',
  },
  {
    id: '22',
    title: 'Competition',
    content: `You're the only competition I care about winning.
Not in some toxic way,
But in the "I want to be your first choice" way.

I'm competing with distance,
With distractions,
With doubts and fears and timing.

And I'm confident I'll win.
Not because I'm forcing it,
But because what we have is undeniable.

You feel it too, don't you, Silvyn?`,
    mood: ['confident', 'competitive', 'passionate'],
    author: 'Ayomide',
    dedication: 'For the only race that matters',
  },
  {
    id: '23',
    title: 'Your Orbit',
    content: `I've always known your orbit.
Even before we were this,
I could sense you—
The pull, the gravity, the inevitability.

Some people are meant to be satellites,
Passing through briefly.
But you? You're planetary.

And I'm choosing to stay in your orbit,
Not because I have to,
But because there's nowhere else I'd rather be.`,
    mood: ['cosmic', 'fated', 'committed'],
    author: 'Ayomide',
    dedication: 'For the gravity between us',
  },
  {
    id: '24',
    title: 'Building Patience',
    content: `This distance is teaching me patience,
And I'm a terrible student.

Every day without you feels longer than it should,
Every "goodnight" text stings a little,
Every missed call is a reminder of what I'm missing.

But I'm learning, Lovebug.
I'm building patience because you're worth it.
I'm enduring distance because proximity is coming.

And when it does?
I'm making up for every single day we spent apart.`,
    mood: ['patient', 'longing', 'determined'],
    author: 'Ayomide',
    dedication: 'For the wait that's worth it',
  },
  {
    id: '25',
    title: 'Unguarded',
    content: `I want to see you unguarded, Silvyn.
Not the version you show everyone,
But the version you keep protected.

The messy thoughts,
The vulnerable moments,
The fears you don't say out loud.

I'm not here to judge or fix.
I'm here to witness, to hold space, to stay.

Let me in, Her Majesty.
I promise I'm worth the risk.`,
    mood: ['vulnerable', 'inviting', 'gentle'],
    author: 'Ayomide',
    dedication: 'For the walls you don't have to keep up',
  },
  {
    id: '26',
    title: 'Every Version',
    content: `I want every version of you.
The happy version, the sad version,
The angry, confused, exhausted version.

I want the version that wakes up grumpy,
The version that laughs at nothing,
The version that needs space,
And the version that needs to be held.

All of it, Omalicha.
I'm not here for just the highlight reel.
I'm here for the full movie—
Director's cut, deleted scenes, and all.`,
    mood: ['accepting', 'deep', 'committed'],
    author: 'Ayomide',
    dedication: 'For all of you, not just the pretty parts',
  },
  {
    id: '27',
    title: 'The Sound of Your Name',
    content: `"Silvyn."
I say your name more than you know.
In my head, out loud when I'm alone,
In conversations with people who ask who I'm always texting.

It's become my favorite word.
A prayer, a promise, a reminder
That you're real and you're mine—
At least in the ways that matter.

Silvyn.
Her Majesty.
Lovebug.
Omalicha.

Every name fits you perfectly,
And I'm collecting them all.`,
    mood: ['adoring', 'intimate', 'possessive'],
    author: 'Ayomide',
    dedication: 'For the name I can't stop saying',
  },
  {
    id: '28',
    title: 'Proof',
    content: `You want proof that I'm serious?
Look at what I'm building.
This site. These words. This consistency.

I'm not a man who wastes time on maybes.
If I'm here, I'm all in.
If I'm investing, it's because I see the return.

And Silvyn? You're the best investment I've ever made.

So stop questioning if I mean it.
I'm showing you every single day.`,
    mood: ['confident', 'direct', 'proving'],
    author: 'Ayomide',
    dedication: 'For when you doubt me',
  },
  {
    id: '29',
    title: 'Inevitable',
    content: `Us? We're inevitable.
Not in some fairy-tale way,
But in the logical, this-just-makes-sense way.

The way we talk, the way we laugh,
The way silence feels comfortable,
The way distance doesn't diminish what we have.

It all points to one conclusion:
This is going somewhere real.

And I'm ready for wherever that is, Morenikeji.
Are you?`,
    mood: ['certain', 'fated', 'forward'],
    author: 'Ayomide',
    dedication: 'For what we both know is coming',
  },
  {
    id: '30',
    title: 'Always',
    content: `If you remember nothing else, remember this:
I'm not going anywhere.

Not when it gets hard.
Not when distance feels impossible.
Not when you deflect or doubt or distance yourself.

I'm here, Silvyn.
Consistently. Patiently. Completely.

This isn't temporary.
This isn't conditional.
This is me choosing you—
Always.`,
    mood: ['steadfast', 'committed', 'final'],
    author: 'Ayomide',
    dedication: 'For forever',
  },
];
