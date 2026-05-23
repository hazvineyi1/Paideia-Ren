import { db, samplesTable } from "@workspace/db";

interface SampleSeed {
  kind: "lesson_plan" | "worksheet" | "quiz" | "parent_draft";
  region: string;
  subject: string;
  yearGroup: string;
  title: string;
  description: string;
  content: unknown;
}

const SAMPLES: SampleSeed[] = [
  {
    kind: "lesson_plan",
    region: "africa",
    subject: "Mathematics",
    yearGroup: "JSS2",
    title: "Ratio and proportion in a Lagos market",
    description:
      "Year 8 / JSS2 maths lesson using Yoruba market arithmetic to build ratio reasoning across support, core, and stretch tiers.",
    content: {
      title: "Ratio and proportion in a Lagos market",
      summary:
        "Students use real market scenarios from Balogun and Mile 12 markets to model ratio and direct proportion. They build confidence with simplifying ratios before reasoning about scale.",
      learningObjectives: [
        "Simplify a ratio to its lowest terms.",
        "Solve direct proportion problems involving two quantities.",
        "Use ratio to compare prices and quantities in a familiar context.",
      ],
      successCriteria: [
        "I can write a ratio in its simplest form.",
        "I can find an unknown quantity using a unit value.",
        "I can explain my reasoning in plain words.",
      ],
      starter: {
        activity:
          "Show three photos: a tray of 12 tomatoes for 1500 NGN, a basket of 30 oranges for 2400 NGN, and a bundle of 5 plantains for 1750 NGN. Ask: which is the best value per item? Students discuss in pairs and report one sentence.",
        durationMinutes: 8,
      },
      mainTask: {
        support:
          "Work through a structured worksheet: simplify 12:18, 25:75, and 40:100, then find the cost of 1 mango when 6 mangoes cost 900 NGN.",
        core: "Adaeze buys rice and beans in the ratio 3:2 by mass for a family of seven. If she uses 6 kg of rice, how many kg of beans does she need? Then scale the recipe for 21 people. Explain each step.",
        stretch:
          "A trader mixes groundnuts and bambara nuts in the ratio 5:3 and sells the mix at 1200 NGN per kg. Groundnuts cost the trader 900 NGN per kg and bambara nuts 1400 NGN per kg. What profit does she make per kilogram of mix, and what assumption are you making?",
        durationMinutes: 30,
      },
      miniPlenary: {
        activity:
          "Cold call three students to share one mistake they almost made and how they caught it. Write the most useful mistake on the board.",
        durationMinutes: 5,
      },
      exitTicket: {
        prompt:
          "Kwame mixes paint in the ratio 2 parts blue to 5 parts white. He uses 800 ml of white paint. How much blue paint does he use?",
        expectedResponse: "320 ml of blue paint, because 800 divided by 5 is 160, and 160 times 2 is 320.",
      },
      resourcesNeeded: [
        "Printed worksheet for the support tier",
        "Whiteboard and markers",
        "Optional: real packaged goods with prices",
      ],
      commonMisconceptions: [
        "Treating a ratio like a fraction of one part instead of parts of a whole.",
        "Adding the parts of the ratio to the total instead of using them to scale.",
        "Forgetting to find the unit value before scaling up.",
      ],
      homeworkSuggestion:
        "Visit a local shop or market with a parent or carer. Record three prices and the quantities, then write each as a ratio in simplest form and as a unit price.",
    },
  },
  {
    kind: "lesson_plan",
    region: "africa",
    subject: "History",
    yearGroup: "SSS1",
    title: "Great Zimbabwe and the gold trade",
    description:
      "Senior secondary history lesson positioning Great Zimbabwe as a sophisticated centre of the medieval Indian Ocean trade network.",
    content: {
      title: "Great Zimbabwe and the gold trade",
      summary:
        "Students examine archaeological and oral evidence to explain how Great Zimbabwe rose as a centre of power between roughly 1100 and 1450 CE, and how its gold linked southern Africa to Kilwa, Arabia, India, and China.",
      learningObjectives: [
        "Describe the social and economic organisation of Great Zimbabwe.",
        "Explain at least two reasons for its rise and two for its decline.",
        "Evaluate one piece of evidence and explain its limitations.",
      ],
      successCriteria: [
        "I can name three features of life at Great Zimbabwe.",
        "I can connect Great Zimbabwe to the wider Indian Ocean world.",
        "I can judge whether a source is strong or weak and say why.",
      ],
      starter: {
        activity:
          "Show a photograph of the Great Enclosure walls. Ask students to write three observations and one question before any context is given.",
        durationMinutes: 7,
      },
      mainTask: {
        support:
          "Read a one-page summary about Great Zimbabwe and complete a graphic organiser with: location, time period, people, economy, and trade partners.",
        core: "In pairs, examine three sources: a Portuguese account from the 1500s, a Shona oral tradition recorded in the 1900s, and an archaeological report on Chinese porcelain found at the site. For each, note what it tells us, what it leaves out, and how confident we can be.",
        stretch:
          "Write a short paragraph arguing whether Great Zimbabwe declined mainly because of environmental pressure, shifting trade routes to Mutapa, or internal political change. Use at least two sources to support your view and acknowledge a counter-argument.",
        durationMinutes: 35,
      },
      miniPlenary: {
        activity:
          "Quick whip-around: each student says one word they would use to describe Great Zimbabwe society. Push back gently on any word that suggests it was 'primitive' or 'mysterious'.",
        durationMinutes: 5,
      },
      exitTicket: {
        prompt:
          "Name one trading partner of Great Zimbabwe outside Africa and one product that travelled in each direction.",
        expectedResponse:
          "Acceptable answers include: gold and ivory travelled out via Sofala and Kilwa; Chinese porcelain, Persian glass beads, and Indian cotton cloth travelled in.",
      },
      resourcesNeeded: [
        "Source pack (three short extracts)",
        "Map of the medieval Indian Ocean trade network",
        "Graphic organiser worksheet",
      ],
      commonMisconceptions: [
        "Believing Great Zimbabwe could not have been built by local people, a colonial-era falsehood that has been thoroughly disproved.",
        "Treating oral tradition as automatically less reliable than written sources.",
        "Assuming Africa was disconnected from the wider world before European contact.",
      ],
      homeworkSuggestion:
        "Research one other African stone-walled city or town from the same period (for example Khami, Mapungubwe, or Thulamela) and write five sentences comparing it to Great Zimbabwe.",
    },
  },
  {
    kind: "lesson_plan",
    region: "asia",
    subject: "Science",
    yearGroup: "S2",
    title: "Why does dal cook faster in a pressure cooker?",
    description:
      "Lower secondary science lesson on boiling points, pressure, and everyday kitchen chemistry across South Asian households.",
    content: {
      title: "Why does dal cook faster in a pressure cooker?",
      summary:
        "Students investigate how increasing pressure raises the boiling point of water, using the familiar example of a pressure cooker preparing dal, rice, or biryani.",
      learningObjectives: [
        "Describe what happens to particles as water boils.",
        "Explain how higher pressure raises the boiling point of a liquid.",
        "Apply this idea to everyday cooking at sea level and at altitude.",
      ],
      successCriteria: [
        "I can label a particle diagram for solid, liquid, and gas.",
        "I can explain in one sentence why a pressure cooker cooks food faster.",
        "I can predict whether water will boil faster or slower in Kathmandu than in Chennai.",
      ],
      starter: {
        activity:
          "Play a 30-second clip of a whistling pressure cooker. Ask: what is making the whistle, and what is happening inside?",
        durationMinutes: 5,
      },
      mainTask: {
        support:
          "Complete a labelled diagram showing water particles in a sealed pot. Match three statements to either 'pressure goes up' or 'temperature goes up'.",
        core: "Read a short passage about Priya cooking arhar dal at home in Mumbai and Tenzin cooking the same dal in Lhasa. Predict where the dal will cook faster and why, using particle ideas. Then sketch a temperature against time graph for both pots.",
        stretch:
          "Design a fair test that could compare cooking times of dal at three altitudes using only a stopwatch, a pressure cooker, and a kitchen thermometer. List your variables and one safety risk.",
        durationMinutes: 30,
      },
      miniPlenary: {
        activity:
          "Mini whiteboard check: 'True or false, water always boils at 100 degrees Celsius.' Discuss the false answers.",
        durationMinutes: 5,
      },
      exitTicket: {
        prompt:
          "In your own words, why does a pressure cooker cook food faster than an open pot?",
        expectedResponse:
          "The sealed lid traps steam, which raises the pressure inside. Higher pressure raises the boiling point of water above 100 degrees Celsius, so the food cooks at a higher temperature.",
      },
      resourcesNeeded: [
        "Short video clip of a pressure cooker",
        "Particle diagram handout",
        "Reading passage and graph axes",
      ],
      commonMisconceptions: [
        "Thinking water can never be hotter than 100 degrees Celsius.",
        "Confusing temperature with the amount of heat energy.",
        "Believing the whistle is the food cooking rather than steam escaping.",
      ],
      homeworkSuggestion:
        "Ask a family member how long they cook dal or rice in a pressure cooker and how they know when it is done. Write three sentences linking their answer to today's lesson.",
    },
  },
  {
    kind: "lesson_plan",
    region: "us",
    subject: "English Language Arts",
    yearGroup: "8",
    title: "Voice and code-switching in Jacqueline Woodson and Sandra Cisneros",
    description:
      "Grade 8 ELA lesson comparing how two writers from different cultural traditions use code-switching to build voice.",
    content: {
      title: "Voice and code-switching in Jacqueline Woodson and Sandra Cisneros",
      summary:
        "Students read short excerpts from Brown Girl Dreaming and The House on Mango Street to analyse how each author uses rhythm, language choice, and code-switching to create a distinct narrative voice.",
      learningObjectives: [
        "Identify specific word choices that shape a narrator's voice.",
        "Explain how code-switching can carry meaning and identity.",
        "Compare two authors' techniques in one short paragraph.",
      ],
      successCriteria: [
        "I can quote a line and explain its effect on the reader.",
        "I can use the term 'code-switching' accurately.",
        "I can write a comparison paragraph that names both authors and uses evidence.",
      ],
      starter: {
        activity:
          "Display two short lines, one from each text. Ask students to guess which narrator is younger and why, based only on the language.",
        durationMinutes: 7,
      },
      mainTask: {
        support:
          "Annotate a short paragraph from each text using a guided sheet that asks: which words sound spoken aloud, which words come from another language, and which words surprise you?",
        core: "In pairs, choose one excerpt from each author. Highlight three examples of voice (rhythm, repetition, code-switching, sensory detail) and explain in the margin what each example does for the reader.",
        stretch:
          "Write a one-paragraph response to this prompt: 'Both Woodson and Cisneros use language to claim space for their narrators. Which author makes that claim more boldly, and how?' Use two pieces of evidence.",
        durationMinutes: 30,
      },
      miniPlenary: {
        activity:
          "Volunteer reads their favourite line aloud and says one thing they noticed. Class adds one new observation each.",
        durationMinutes: 5,
      },
      exitTicket: {
        prompt:
          "Define code-switching in your own words and give one example from today's reading.",
        expectedResponse:
          "Code-switching is moving between languages or styles of speech depending on the setting or audience. Example: Cisneros writes 'esperaba' alongside English narration, which shows the narrator moving between her two worlds.",
      },
      resourcesNeeded: [
        "Excerpt handouts from both texts",
        "Annotation guide",
        "Highlighters",
      ],
      commonMisconceptions: [
        "Treating non-English words as 'errors' rather than deliberate craft.",
        "Assuming a young narrator's voice means simple ideas.",
        "Confusing voice with point of view.",
      ],
      homeworkSuggestion:
        "Find one short text (a song lyric, a social media post, or a paragraph from any book) that uses code-switching. Bring it in with one sentence explaining the effect.",
    },
  },
  {
    kind: "worksheet",
    region: "africa",
    subject: "Mathematics",
    yearGroup: "P6",
    title: "Percentages with mobile money",
    description:
      "Primary 6 percentage practice grounded in M-Pesa, MoMo, and EcoCash style transactions familiar to learners across East and Southern Africa.",
    content: {
      title: "Percentages with mobile money",
      instructions:
        "Work out each problem in your exercise book. Show one line of working for each answer.",
      questions: [
        {
          number: 1,
          prompt:
            "Achieng sends 2000 KES to her cousin. The agent charges a 1.5% fee. How much fee does she pay?",
          type: "calculation",
          options: null,
          answer: "30 KES",
          workingOrRubric: "1.5% of 2000 = 0.015 x 2000 = 30 KES",
        },
        {
          number: 2,
          prompt:
            "Tendai pays 240 ZAR for school shoes after a 20% discount. What was the original price?",
          type: "calculation",
          options: null,
          answer: "300 ZAR",
          workingOrRubric:
            "Paid 80% of the original price. Original = 240 / 0.8 = 300 ZAR.",
        },
        {
          number: 3,
          prompt: "Which is bigger?",
          type: "multiple_choice",
          options: ["25% of 80", "20% of 100", "They are equal", "Cannot tell"],
          answer: "They are equal",
          workingOrRubric: "25% of 80 = 20. 20% of 100 = 20. Equal.",
        },
        {
          number: 4,
          prompt:
            "Kofi saves 15% of his 3500 GHS weekly allowance. How much does he save in 4 weeks?",
          type: "calculation",
          options: null,
          answer: "2100 GHS",
          workingOrRubric: "Per week: 0.15 x 3500 = 525. Over 4 weeks: 525 x 4 = 2100 GHS.",
        },
        {
          number: 5,
          prompt: "True or false: increasing a number by 50% and then decreasing by 50% gives you back the original number.",
          type: "multiple_choice",
          options: ["True", "False"],
          answer: "False",
          workingOrRubric:
            "Example: 100 increased by 50% is 150. 150 decreased by 50% is 75. Not the original.",
        },
        {
          number: 6,
          prompt:
            "A trader buys a bag of maize meal for 280 ZMW and sells it for 350 ZMW. What is the percentage profit?",
          type: "calculation",
          options: null,
          answer: "25%",
          workingOrRubric: "Profit = 70 ZMW. 70 / 280 = 0.25 = 25%.",
        },
        {
          number: 7,
          prompt:
            "Explain in one sentence why a 10% increase followed by a 10% decrease does not return you to the starting amount.",
          type: "short",
          options: null,
          answer:
            "Because the 10% decrease is taken from a larger number than the 10% increase was added to.",
          workingOrRubric:
            "Accept any answer that recognises the second percentage is calculated from a different base.",
        },
        {
          number: 8,
          prompt:
            "Amina's school report shows she scored 36 out of 50 in maths. What is her percentage?",
          type: "calculation",
          options: null,
          answer: "72%",
          workingOrRubric: "36 / 50 = 0.72 = 72%.",
        },
      ],
      teacherNotes:
        "Questions 1, 2, 4, and 6 model real transactions, so encourage students to estimate before calculating. Question 5 and 7 surface a common misconception. Extend by asking pupils to invent their own mobile money problem and swap with a partner.",
    },
  },
  {
    kind: "worksheet",
    region: "asia",
    subject: "Mathematics",
    yearGroup: "S1",
    title: "Algebra with rangoli patterns",
    description:
      "Secondary 1 algebra practice that builds expressions from growing rangoli and kolam patterns.",
    content: {
      title: "Algebra with rangoli patterns",
      instructions:
        "For each pattern, find a rule that links the pattern number n to the number of dots. Write your rule as an algebraic expression.",
      questions: [
        {
          number: 1,
          prompt:
            "A rangoli has 4 dots in pattern 1, 7 in pattern 2, 10 in pattern 3. How many dots are in pattern n?",
          type: "calculation",
          options: null,
          answer: "3n + 1",
          workingOrRubric: "Differences are 3. Start by checking n=1 gives 4: 3(1)+1=4.",
        },
        {
          number: 2,
          prompt:
            "A kolam grid has n^2 dots arranged in a square. How many dots are on the border only?",
          type: "calculation",
          options: null,
          answer: "4n - 4",
          workingOrRubric:
            "Four sides of n dots minus the four corners counted twice. Check n=3: 4(3)-4 = 8.",
        },
        {
          number: 3,
          prompt:
            "Which expression is equivalent to 2(n + 3) - 4?",
          type: "multiple_choice",
          options: ["2n + 2", "2n + 6", "2n - 1", "n + 2"],
          answer: "2n + 2",
          workingOrRubric: "Expand: 2n + 6 - 4 = 2n + 2.",
        },
        {
          number: 4,
          prompt:
            "Simplify: 5x + 3 - 2x + 7.",
          type: "calculation",
          options: null,
          answer: "3x + 10",
          workingOrRubric: "Collect like terms: (5x - 2x) + (3 + 7) = 3x + 10.",
        },
        {
          number: 5,
          prompt:
            "Rina says her rangoli pattern follows the rule 2n - 1, so pattern 5 has 9 dots. Is she correct?",
          type: "short",
          options: null,
          answer: "Yes, because 2(5) - 1 = 9.",
          workingOrRubric: "Award full marks for a yes/no with a substitution shown.",
        },
        {
          number: 6,
          prompt:
            "Write a rule for a pattern that has 6 dots in pattern 1 and grows by 4 each time.",
          type: "short",
          options: null,
          answer: "4n + 2",
          workingOrRubric: "Check: n=1 gives 4+2=6. Differences of 4 confirm the 4n.",
        },
        {
          number: 7,
          prompt: "Solve for x: 3x + 5 = 20.",
          type: "calculation",
          options: null,
          answer: "x = 5",
          workingOrRubric: "Subtract 5: 3x = 15. Divide by 3: x = 5.",
        },
        {
          number: 8,
          prompt:
            "If a kolam grows by adding one more row of n+1 dots each time, write an expression for the total dots after k rows starting from a single dot.",
          type: "long",
          options: null,
          answer: "1 + 2 + 3 + ... + (k+1) = (k+1)(k+2)/2",
          workingOrRubric:
            "Accept any equivalent triangular number expression with reasoning shown.",
        },
      ],
      teacherNotes:
        "Bring printed rangoli or kolam images to anchor the pattern questions. Question 8 is a stretch that connects to triangular numbers. Pair it with a short discussion about the long history of pattern mathematics in South Asian textile and floor art.",
    },
  },
  {
    kind: "worksheet",
    region: "africa",
    subject: "English",
    yearGroup: "JSS3",
    title: "Reading comprehension: Wangari Maathai's Green Belt Movement",
    description:
      "JSS3 / Year 9 comprehension based on a non-fiction passage about Wangari Maathai and the Green Belt Movement.",
    content: {
      title: "Reading comprehension: Wangari Maathai's Green Belt Movement",
      instructions:
        "Read the passage carefully, then answer the questions in full sentences.",
      questions: [
        {
          number: 1,
          prompt:
            "According to the passage, in which year did Wangari Maathai found the Green Belt Movement?",
          type: "short",
          options: null,
          answer: "1977",
          workingOrRubric: "Accept any answer that references the year given in the passage.",
        },
        {
          number: 2,
          prompt:
            "Name two problems the Green Belt Movement tried to address.",
          type: "short",
          options: null,
          answer:
            "Deforestation and the burden on women who had to walk far for firewood and water.",
          workingOrRubric:
            "Award one mark per problem. Other reasonable problems mentioned in the passage are acceptable.",
        },
        {
          number: 3,
          prompt: "Which word best describes Maathai as shown in the passage?",
          type: "multiple_choice",
          options: ["Reluctant", "Persistent", "Cautious", "Distant"],
          answer: "Persistent",
          workingOrRubric:
            "The passage describes repeated setbacks and continued action, which fits persistent.",
        },
        {
          number: 4,
          prompt:
            "Explain in your own words why planting trees was both an environmental and a political act.",
          type: "long",
          options: null,
          answer:
            "Trees restored soil and water cycles, which was environmental. The act also organised rural women, asserted community rights, and challenged a government that took land for itself, which was political.",
          workingOrRubric:
            "Look for two ideas: environmental restoration and political organising or land rights.",
        },
        {
          number: 5,
          prompt:
            "Find a word in the passage that means almost the same as 'determination'.",
          type: "short",
          options: null,
          answer:
            "Accept words such as 'resolve', 'persistence', or 'tenacity' if they appear in the passage.",
          workingOrRubric:
            "Award the mark only for a synonym that actually appears in the passage.",
        },
        {
          number: 6,
          prompt:
            "What lesson from Maathai's story would you apply in your own community? Give one specific action.",
          type: "long",
          options: null,
          answer: "Open answer.",
          workingOrRubric:
            "Award full marks for any specific, realistic action linked to one of Maathai's ideas (planting, organising, advocating).",
        },
      ],
      teacherNotes:
        "Provide a short non-fiction passage about Wangari Maathai (around 350 words) before students start. Encourage them to underline evidence as they read. After question 6, invite three students to share their action ideas aloud.",
    },
  },
  {
    kind: "quiz",
    region: "africa",
    subject: "Geography",
    yearGroup: "SSS2",
    title: "Africa physical geography quick check",
    description:
      "Ten-question formative quiz checking knowledge of African rivers, mountains, climate zones, and population centres.",
    content: {
      title: "Africa physical geography quick check",
      format: "Multiple choice and short answer",
      instructions:
        "Answer all ten questions. Each question is worth one mark.",
      items: [
        {
          number: 1,
          prompt: "Which river is the longest in Africa?",
          type: "multiple_choice",
          options: ["Congo", "Nile", "Niger", "Zambezi"],
          correctAnswer: "Nile",
          difficulty: "easy",
          skillAssessed: "Recall of African rivers",
        },
        {
          number: 2,
          prompt:
            "Which mountain range stretches across Morocco, Algeria, and Tunisia?",
          type: "multiple_choice",
          options: ["Drakensberg", "Atlas", "Ethiopian Highlands", "Rwenzori"],
          correctAnswer: "Atlas",
          difficulty: "easy",
          skillAssessed: "Location of African mountain ranges",
        },
        {
          number: 3,
          prompt: "Lake Victoria is shared by which three countries?",
          type: "short_answer",
          options: null,
          correctAnswer: "Kenya, Uganda, Tanzania",
          difficulty: "medium",
          skillAssessed: "Political and physical geography of East Africa",
        },
        {
          number: 4,
          prompt:
            "True or false: the Sahel runs east to west across Africa, south of the Sahara.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "True",
          difficulty: "easy",
          skillAssessed: "Climate zones of Africa",
        },
        {
          number: 5,
          prompt:
            "Which African country has the largest population, as of recent UN estimates?",
          type: "multiple_choice",
          options: ["Egypt", "Ethiopia", "Nigeria", "Democratic Republic of the Congo"],
          correctAnswer: "Nigeria",
          difficulty: "medium",
          skillAssessed: "Population geography of Africa",
        },
        {
          number: 6,
          prompt: "Name the largest desert in southern Africa.",
          type: "short_answer",
          options: null,
          correctAnswer: "Kalahari",
          difficulty: "medium",
          skillAssessed: "Recall of African deserts",
        },
        {
          number: 7,
          prompt:
            "Which mountain in Tanzania is the highest free-standing peak in the world?",
          type: "multiple_choice",
          options: ["Mount Kenya", "Mount Kilimanjaro", "Mount Meru", "Mount Stanley"],
          correctAnswer: "Mount Kilimanjaro",
          difficulty: "easy",
          skillAssessed: "Recall of African peaks",
        },
        {
          number: 8,
          prompt:
            "Explain in one sentence why the Rift Valley is significant in physical geography.",
          type: "short_answer",
          options: null,
          correctAnswer:
            "It is a long tectonic boundary where the African plate is splitting, creating lakes, volcanoes, and important fossil sites.",
          difficulty: "hard",
          skillAssessed: "Plate tectonics applied to Africa",
        },
        {
          number: 9,
          prompt:
            "Which African country is entirely landlocked and lies in southern Africa?",
          type: "multiple_choice",
          options: ["Zambia", "Mozambique", "Namibia", "Angola"],
          correctAnswer: "Zambia",
          difficulty: "medium",
          skillAssessed: "Political geography of southern Africa",
        },
        {
          number: 10,
          prompt:
            "True or false: most of Africa lies within the tropics.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "True",
          difficulty: "easy",
          skillAssessed: "Global position of Africa",
        },
      ],
    },
  },
  {
    kind: "quiz",
    region: "asia",
    subject: "History",
    yearGroup: "S3",
    title: "Silk Roads and the medieval connected world",
    description:
      "A quick check covering trade, religion, and technology exchange across the Silk Roads from roughly 200 BCE to 1450 CE.",
    content: {
      title: "Silk Roads and the medieval connected world",
      format: "Mixed format",
      instructions: "Answer all ten questions.",
      items: [
        {
          number: 1,
          prompt:
            "The Silk Roads are best described as a single road from China to Rome.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "False",
          difficulty: "easy",
          skillAssessed: "Understanding networks vs single routes",
        },
        {
          number: 2,
          prompt:
            "Which dynasty stabilised the eastern Silk Roads from around 200 BCE?",
          type: "multiple_choice",
          options: ["Tang", "Han", "Ming", "Qing"],
          correctAnswer: "Han",
          difficulty: "medium",
          skillAssessed: "Chinese dynasties and trade",
        },
        {
          number: 3,
          prompt:
            "Which religion spread from India to East Asia along these routes?",
          type: "multiple_choice",
          options: ["Christianity", "Islam", "Buddhism", "Sikhism"],
          correctAnswer: "Buddhism",
          difficulty: "easy",
          skillAssessed: "Religious diffusion",
        },
        {
          number: 4,
          prompt:
            "Name one Central Asian city that became wealthy as a Silk Roads hub.",
          type: "short_answer",
          options: null,
          correctAnswer: "Samarkand, Bukhara, Merv, or Kashgar all acceptable.",
          difficulty: "medium",
          skillAssessed: "Geography of Central Asia",
        },
        {
          number: 5,
          prompt:
            "Which technology travelled from China westward during this period?",
          type: "multiple_choice",
          options: ["The wheel", "Paper-making", "Bronze casting", "Domesticated horse"],
          correctAnswer: "Paper-making",
          difficulty: "medium",
          skillAssessed: "Technology diffusion",
        },
        {
          number: 6,
          prompt:
            "True or false: the Indian Ocean monsoon system allowed predictable sea trade between East Africa, Arabia, India, and Southeast Asia.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "True",
          difficulty: "medium",
          skillAssessed: "Maritime Silk Roads",
        },
        {
          number: 7,
          prompt:
            "Which 14th-century traveller from Tangier journeyed across much of the Afro-Eurasian world?",
          type: "short_answer",
          options: null,
          correctAnswer: "Ibn Battuta",
          difficulty: "medium",
          skillAssessed: "Recall of historical travellers",
        },
        {
          number: 8,
          prompt:
            "Which empire of the 13th century briefly secured a vast section of the overland Silk Roads, encouraging long-distance trade?",
          type: "multiple_choice",
          options: ["Ottoman", "Mongol", "Mughal", "Safavid"],
          correctAnswer: "Mongol",
          difficulty: "medium",
          skillAssessed: "Eurasian empires",
        },
        {
          number: 9,
          prompt:
            "Give one example of a disease that spread along these networks in the 14th century.",
          type: "short_answer",
          options: null,
          correctAnswer: "The plague (Black Death)",
          difficulty: "hard",
          skillAssessed: "Unintended consequences of exchange",
        },
        {
          number: 10,
          prompt:
            "In one sentence, explain why historians call this period a 'connected world' rather than a 'European world'.",
          type: "short_answer",
          options: null,
          correctAnswer:
            "Because trade, religion, and technology moved between many centres in Asia, Africa, and Europe, with the wealthiest hubs often in Asia and the Islamic world, not Europe.",
          difficulty: "hard",
          skillAssessed: "Historiography and Eurocentrism",
        },
      ],
    },
  },
  {
    kind: "quiz",
    region: "africa",
    subject: "Integrated Science",
    yearGroup: "JSS1",
    title: "Water cycle and rainfall in West Africa",
    description:
      "A short formative check tied to rainfall patterns and water use in West Africa.",
    content: {
      title: "Water cycle and rainfall in West Africa",
      format: "Mixed format",
      instructions: "Answer all eight questions.",
      items: [
        {
          number: 1,
          prompt: "Which process turns liquid water into water vapour?",
          type: "multiple_choice",
          options: ["Condensation", "Evaporation", "Precipitation", "Infiltration"],
          correctAnswer: "Evaporation",
          difficulty: "easy",
          skillAssessed: "Water cycle vocabulary",
        },
        {
          number: 2,
          prompt:
            "Southern and coastal Ghana has two rainy periods in a typical year. Roughly when does the main (longer) rainy period fall?",
          type: "multiple_choice",
          options: [
            "December to February",
            "March to mid-July",
            "August to September",
            "October to November",
          ],
          correctAnswer: "March to mid-July",
          difficulty: "medium",
          skillAssessed: "Local bimodal rainfall pattern",
        },
        {
          number: 3,
          prompt:
            "True or false: the Harmattan wind brings moist air from the ocean.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "False",
          difficulty: "medium",
          skillAssessed: "Regional wind patterns",
        },
        {
          number: 4,
          prompt: "Name one major river in West Africa.",
          type: "short_answer",
          options: null,
          correctAnswer: "Niger, Senegal, Volta, or Gambia are all acceptable.",
          difficulty: "easy",
          skillAssessed: "Recall of West African rivers",
        },
        {
          number: 5,
          prompt:
            "Why do farmers in the Sahel watch the weather closely before planting millet?",
          type: "short_answer",
          options: null,
          correctAnswer:
            "Because the rainy season is short and unreliable, so planting too early or too late can ruin the crop.",
          difficulty: "medium",
          skillAssessed: "Application of climate to agriculture",
        },
        {
          number: 6,
          prompt:
            "Which step of the water cycle is happening when clouds form?",
          type: "multiple_choice",
          options: ["Evaporation", "Condensation", "Run-off", "Infiltration"],
          correctAnswer: "Condensation",
          difficulty: "easy",
          skillAssessed: "Water cycle stages",
        },
        {
          number: 7,
          prompt:
            "True or false: cutting down trees in a watershed can reduce the amount of water reaching a river later in the year.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "True",
          difficulty: "hard",
          skillAssessed: "Human impact on the water cycle",
        },
        {
          number: 8,
          prompt:
            "Give one way your household saves or reuses water.",
          type: "short_answer",
          options: null,
          correctAnswer: "Open answer.",
          difficulty: "easy",
          skillAssessed: "Personal application",
        },
      ],
    },
  },
  {
    kind: "parent_draft",
    region: "africa",
    subject: "Mathematics",
    yearGroup: "P5",
    title: "Positive update: Thandi's progress in fractions",
    description:
      "A warm, specific update to a parent about a primary 5 student's improvement in fractions over three weeks.",
    content: {
      subject: "Good news about Thandi's maths this term",
      greeting: "Dear Mr and Mrs Dlamini,",
      paragraphs: [
        "I wanted to share some good news about Thandi's progress. Over the last three weeks she has worked steadily on fractions, and her last short check showed a clear improvement, particularly on adding fractions with different denominators.",
        "In class she has started to explain her thinking aloud when she gets stuck, which is a strong habit to build. She also helped a classmate who was struggling with equivalent fractions last Tuesday, which was kind and showed she really understands the idea.",
        "At home, ten minutes of practice on word problems once or twice a week would help her keep this going. There is no need to buy anything special, a few questions from her exercise book are enough. I will keep an eye on her in class and let you know if anything changes.",
      ],
      closing: "Thank you for your support at home.",
      signature: "Mrs Okeke, P5 class teacher",
    },
  },
  {
    kind: "parent_draft",
    region: "asia",
    subject: "Science",
    yearGroup: "P4",
    title: "Gentle check-in: Aarav's homework completion",
    description:
      "A respectful note to a parent raising a homework concern early, focused on next steps rather than blame.",
    content: {
      subject: "A quick note about Aarav's science homework",
      greeting: "Dear Mrs Patel,",
      paragraphs: [
        "I am writing to share a small concern early, while it is easy to turn around. Aarav has missed his last two science homework tasks. He is engaged and curious in class, so I do not think the work is too hard for him.",
        "It may simply be that the routine at home has shifted, or that he is unsure where to start. Could we agree on a short plan? If he could attempt one question and bring whatever he has done to class, even if it is incomplete, I can give him quick feedback the next day.",
        "If there is anything happening that I should know about, I am happy to talk on the phone or in person at pick up. Please do let me know what would work best.",
      ],
      closing: "Thank you for your help.",
      signature: "Mr Subramanian, P4 science teacher",
    },
  },
];

async function main() {
  console.log(`Seeding ${SAMPLES.length} sample resources...`);
  const rows = SAMPLES.map((s) => ({
    kind: s.kind,
    region: s.region,
    subject: s.subject,
    yearGroup: s.yearGroup,
    title: s.title,
    description: s.description,
    content: s.content,
  }));
  const inserted = await db
    .insert(samplesTable)
    .values(rows)
    .returning({ id: samplesTable.id, title: samplesTable.title });
  for (const row of inserted) {
    console.log(`  + ${row.title}`);
  }
  console.log(`Done. Inserted ${inserted.length} samples.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
