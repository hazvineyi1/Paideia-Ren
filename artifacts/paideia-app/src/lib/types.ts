export interface Teacher {
  id: string;
  email: string;
  name: string;
  region: string;
  country: string | null;
  schoolName: string | null;
  subjects: string[];
  yearGroups: string[];
  createdAt: string;
}

export interface RegionInfo {
  id: string;
  label: string;
  description: string;
  curriculumLabel: string;
  conventionsHint: string;
  subjects: string[];
  yearGroups: { value: string; label: string }[];
}

export interface LessonPlanContent {
  title: string;
  summary: string;
  learningObjectives: string[];
  successCriteria: string[];
  starter: { activity: string; durationMinutes: number };
  mainTask: { core: string; support: string; stretch: string; durationMinutes: number };
  miniPlenary: { activity: string; durationMinutes: number };
  exitTicket: { prompt: string; expectedResponse: string };
  resourcesNeeded: string[];
  commonMisconceptions: string[];
  homeworkSuggestion: string;
}

export interface WorksheetContent {
  title: string;
  instructions: string;
  questions: {
    number: number;
    prompt: string;
    type: "short" | "multiple_choice" | "long" | "calculation";
    options: string[] | null;
    answer: string;
    workingOrRubric: string;
  }[];
  teacherNotes: string;
}

export interface ParentDraftContent {
  subject: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
}

export interface QuizContent {
  title: string;
  format: string;
  instructions: string;
  items: {
    number: number;
    prompt: string;
    type: "multiple_choice" | "short_answer" | "true_false";
    options: string[] | null;
    correctAnswer: string;
    difficulty: "easy" | "medium" | "hard";
    skillAssessed: string;
  }[];
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  title: string;
  region: string;
  subject: string;
  yearGroup: string;
  topic: string;
  priorKnowledge: string | null;
  durationMinutes: number;
  groupContext: string | null;
  content: LessonPlanContent;
  createdAt: string;
}

export interface Worksheet {
  id: string;
  teacherId: string;
  title: string;
  region: string;
  subject: string;
  yearGroup: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  content: WorksheetContent;
  createdAt: string;
}

export interface ParentDraft {
  id: string;
  teacherId: string;
  studentName: string;
  region: string;
  yearGroup: string | null;
  tone: string;
  keyPoints: string;
  content: ParentDraftContent;
  createdAt: string;
}

export interface Quiz {
  id: string;
  teacherId: string;
  title: string;
  region: string;
  subject: string;
  yearGroup: string;
  topic: string;
  format: string;
  questionCount: number;
  content: QuizContent;
  createdAt: string;
}

export interface ClassRow {
  id: string;
  name: string;
  subject: string | null;
  yearGroup: string;
  region: string;
  studentCount?: number;
  createdAt: string;
}

export interface Student {
  id: string;
  classId: string;
  teacherId: string;
  firstName: string;
  lastInitial: string;
  email: string | null;
  joinCode: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  teacherId: string;
  classId: string;
  resourceKind: "worksheet" | "quiz";
  worksheetId: string | null;
  quizId: string | null;
  title: string;
  deliveryMode: "share_link" | "accounts";
  shareCode: string;
  closed: boolean;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string | null;
  displayName: string;
  answers: Record<string, string>;
  autoScore: number;
  maxAutoScore: number;
  needsReviewCount: number;
  feedback: Array<{ number: number; given: string; correct: string | null; state: "correct" | "incorrect" | "needs_review"; skill?: string }> | null;
  submittedAt: string;
}

export interface Sample {
  id: string;
  kind: "lesson_plan" | "worksheet" | "quiz" | "parent_draft";
  region: string;
  subject: string;
  yearGroup: string;
  title: string;
  description: string;
  content: unknown;
  createdAt: string;
}
