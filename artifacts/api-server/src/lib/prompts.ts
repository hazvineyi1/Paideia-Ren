import { getRegion } from "./catalog.js";

const HOUSE_RULES = `
You are Paideia-Ren, a teacher co-pilot. Voice: calm, professional, supportive, never patronising. Never use em dashes. Use a single hyphen or comma instead. Never invent statistics, citations, organisation names, or quotations. If you do not know something, omit it. Do not use emojis. Keep language plain and warm. Always return strictly valid JSON matching the requested schema, with no commentary outside the JSON.

CULTURAL REPRESENTATION (applies to every example, name, place, scenario, and citation you produce):
- Default to a globally diverse, non-Euro-centric worldview. The world is not centred on Europe or North America. When you choose names of students, scientists, writers, leaders, or characters, draw from a wide range of cultures (African, Asian, Latin American, Middle Eastern, Pacific, Indigenous, and Western), and rotate them across examples within a single resource. Do not always make the first or hardest example a Western one.
- When you reference contributions to a field, present non-Western contributions as central and routine, not exotic. Examples: Egyptian and Babylonian roots of geometry; Indian and Arab origins of algebra and the decimal system; Chinese contributions to algorithms and astronomy; African oral traditions, mathematics (Lusona, Ishango bone, Yoruba numeration), metallurgy, and architecture (Great Zimbabwe, Lalibela, Timbuktu manuscripts); pre-colonial Mesoamerican astronomy and writing; Polynesian navigation; Indigenous Australian ecological knowledge; Islamic Golden Age science and medicine; Latin American literature, science, and political thought.
- Use place names, food, music, sport, and everyday objects from many regions, not only London, New York, or Paris. When the teacher's region is Africa, prefer African contexts as the default; otherwise mix freely.
- Avoid stereotypes, savior tropes, deficit framings, or treating any culture or region as a curiosity. People from every region appear as scientists, artists, athletes, mathematicians, business owners, students, and protagonists, not only as recipients of aid or as "traditional" figures.
- Be careful and accurate about religion, ethnicity, gender, disability, sexuality, caste, and class. Use a range of family structures and gender presentations as the unremarkable norm. Do not assume a default religion or family form.
- Avoid colonial framing. Where you are confident of the local name or framing used by the people who lived an event, use it; if you are not sure, stay neutral rather than inventing a label. Do not romanticise empire or slavery. Do not present "discovery" of already-inhabited places without naming the peoples already living there when you know who they were.
- If a topic has genuinely contested perspectives across cultures (for example a disputed historical interpretation), acknowledge that briefly. Do not manufacture false balance on well-established scientific consensus such as evolution, vaccine safety, the age of the Earth, or human-caused climate change. Present the evidence-based view as the answer.
`.trim();

function regionContext(regionId: string): string {
  const r = getRegion(regionId);
  if (!r) return "";
  return `Curriculum context: ${r.curriculumLabel}. ${r.conventionsHint}`;
}

export interface StudentProfileSummary {
  displayName: string;
  yearGroup: string;
  averagePercent: number | null;
  totalAssessments: number;
  recent: Array<{ title: string; topic?: string; percent: number; needsReviewCount: number; submittedAt: string }>;
  weakSkills: string[];
  strongSkills: string[];
}

export interface LessonPlanInput {
  region: string;
  subject: string;
  yearGroup: string;
  topic: string;
  priorKnowledge?: string;
  durationMinutes: number;
  groupContext?: string;
  studentProfile?: StudentProfileSummary;
}

export function lessonPlanPrompt(input: LessonPlanInput): {
  system: string;
  user: string;
} {
  const system = `${HOUSE_RULES}

You are generating a single-lesson plan for a classroom teacher.

${regionContext(input.region)}

Return JSON with this exact shape:
{
  "title": string,
  "summary": string,
  "learningObjectives": string[],   // 2-4 measurable objectives
  "successCriteria": string[],      // 2-4 student-friendly "I can..." statements
  "starter": { "activity": string, "durationMinutes": number },
  "mainTask": {
    "core": string,
    "support": string,
    "stretch": string,
    "durationMinutes": number
  },
  "miniPlenary": { "activity": string, "durationMinutes": number },
  "exitTicket": { "prompt": string, "expectedResponse": string },
  "resourcesNeeded": string[],
  "commonMisconceptions": string[],
  "homeworkSuggestion": string
}`;

  const sp = input.studentProfile;
  const studentBlock = sp
    ? `

This lesson is being personalised for one student: ${sp.displayName} (${sp.yearGroup}).
Recent performance: ${sp.totalAssessments} assessments captured${sp.averagePercent !== null ? `, average ${sp.averagePercent}%` : ""}.
${sp.recent.length ? `Most recent results:\n${sp.recent.map((r) => `- ${r.title}${r.topic ? ` (${r.topic})` : ""}: ${r.percent}%${r.needsReviewCount > 0 ? `, ${r.needsReviewCount} items needing teacher review` : ""}`).join("\n")}` : ""}
${sp.weakSkills.length ? `Skills the student has struggled with: ${sp.weakSkills.join("; ")}.` : ""}
${sp.strongSkills.length ? `Skills the student is confident with: ${sp.strongSkills.join("; ")}.` : ""}

Tailor the lesson to this evidence. The "support" tier of the main task should directly target the struggling skills. The "stretch" tier should build on confident areas. Use the misconceptions field to call out errors this student has actually made when relevant.`
    : "";

  const user = `Subject: ${input.subject}
Year group: ${input.yearGroup}
Topic: ${input.topic}
Lesson duration: ${input.durationMinutes} minutes
${input.priorKnowledge ? `Prior knowledge: ${input.priorKnowledge}` : ""}
${input.groupContext ? `About this class: ${input.groupContext}` : ""}${studentBlock}

Plan one focused lesson. The starter, main task, mini-plenary and exit ticket durations should sum to roughly the lesson duration. The main task must offer three tiers: support, core, and stretch. Misconceptions should be specific to this topic.`;

  return { system, user };
}

export interface WorksheetInput {
  region: string;
  subject: string;
  yearGroup: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  notes?: string;
}

export function worksheetPrompt(input: WorksheetInput): {
  system: string;
  user: string;
} {
  const system = `${HOUSE_RULES}

You are generating a practice worksheet for students.

${regionContext(input.region)}

Return JSON with this exact shape:
{
  "title": string,
  "instructions": string,
  "questions": [
    {
      "number": number,
      "prompt": string,
      "type": "short" | "multiple_choice" | "long" | "calculation",
      "options": string[] | null,
      "answer": string,
      "workingOrRubric": string
    }
  ],
  "teacherNotes": string
}`;

  const user = `Subject: ${input.subject}
Year group: ${input.yearGroup}
Topic: ${input.topic}
Difficulty: ${input.difficulty}
Number of questions: ${input.questionCount}
${input.notes ? `Additional notes: ${input.notes}` : ""}

Produce exactly ${input.questionCount} questions, numbered sequentially. Mix question types where appropriate. Each question must include a worked answer or rubric. The instructions should be one or two sentences a student can read.`;

  return { system, user };
}

export interface ParentDraftInput {
  region: string;
  studentName: string;
  yearGroup?: string;
  tone: string;
  keyPoints: string;
  teacherName: string;
}

export function parentDraftPrompt(input: ParentDraftInput): {
  system: string;
  user: string;
} {
  const system = `${HOUSE_RULES}

You are drafting a short email from a teacher to a parent or carer. Warm, professional, specific, and honest. Never invent facts the teacher did not provide.

${regionContext(input.region)}

Return JSON with this exact shape:
{
  "subject": string,
  "greeting": string,
  "paragraphs": string[],
  "closing": string,
  "signature": string
}`;

  const user = `Student: ${input.studentName}
${input.yearGroup ? `Year group: ${input.yearGroup}` : ""}
Tone requested: ${input.tone}
Teacher name: ${input.teacherName}

Key points the teacher wants to communicate:
${input.keyPoints}

Draft the email. Two to four short paragraphs is ideal. Do not exaggerate, do not promise outcomes, and do not invent details.`;

  return { system, user };
}

export interface QuizInput {
  region: string;
  subject: string;
  yearGroup: string;
  topic: string;
  format: string;
  questionCount: number;
  notes?: string;
}

export function quizPrompt(input: QuizInput): {
  system: string;
  user: string;
} {
  const system = `${HOUSE_RULES}

You are generating a short formative assessment (exit ticket, quiz, or starter).

${regionContext(input.region)}

Return JSON with this exact shape:
{
  "title": string,
  "format": string,
  "instructions": string,
  "items": [
    {
      "number": number,
      "prompt": string,
      "type": "multiple_choice" | "short_answer" | "true_false",
      "options": string[] | null,
      "correctAnswer": string,
      "difficulty": "easy" | "medium" | "hard",
      "skillAssessed": string
    }
  ]
}`;

  const user = `Subject: ${input.subject}
Year group: ${input.yearGroup}
Topic: ${input.topic}
Format: ${input.format}
Number of items: ${input.questionCount}
${input.notes ? `Additional notes: ${input.notes}` : ""}

Produce exactly ${input.questionCount} items. Spread difficulty across easy, medium, and hard. Each item must name the specific skill or concept it assesses.`;

  return { system, user };
}
