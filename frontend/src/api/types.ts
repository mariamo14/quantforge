export interface UserDto {
  id: number
  email: string
  displayName: string
}

export interface AuthResponse {
  token: string
  user: UserDto
}

export interface TrackSummary {
  slug: string
  title: string
  icon: string
  accent: string
  description: string
  total: number
  done: number
}

export type ItemKind = 'lesson' | 'problem' | 'quiz'

export interface ItemDto {
  kind: ItemKind
  slug: string
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null
  minutes: number | null
  questionCount: number | null
  xp: number | null
  done: boolean
  locked: boolean
}

export interface NextItemDto {
  kind: ItemKind | null
  slug: string | null
  title: string | null
  trackSlug: string
  trackTitle: string
  endOfTrack: boolean
}

export interface ModuleDto {
  slug: string
  title: string
  description: string
  items: ItemDto[]
}

export interface TrackDetail {
  slug: string
  title: string
  icon: string
  accent: string
  description: string
  modules: ModuleDto[]
}

export interface LessonDto {
  slug: string
  title: string
  minutes: number
  markdown: string
  done: boolean
}

export interface SampleTestDto {
  input: string
  expectedOutput: string
}

export interface ProblemDto {
  slug: string
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  xp: number
  timeLimitMs: number
  statementMd: string
  starterCode: string
  sampleTests: SampleTestDto[]
  solved: boolean
  editorialMd: string | null
  lastSubmittedCode: string | null
}

export type Verdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT'
  | 'JUDGE_ERROR'

export interface TestResult {
  index: number
  sample: boolean
  verdict: Verdict
  timeMs: number
  expected: string | null
  actual: string | null
  stderr: string | null
}

export interface RunResponse {
  verdict: Verdict
  compilerOutput: string
  tests: TestResult[]
  maxTimeMs: number
  passed: number
  total: number
  xpAwarded: number
  firstAccept: boolean
}

export interface QuizQuestionDto {
  id: number
  promptMd: string
  choices: string[]
}

export interface QuizDto {
  slug: string
  title: string
  description: string
  xpPerCorrect: number
  bestScore: number | null
  questions: QuizQuestionDto[]
}

export interface QuizQuestionResult {
  questionId: number
  correctIndex: number
  correct: boolean
  explanationMd: string
}

export interface QuizResultResponse {
  score: number
  total: number
  xpAwarded: number
  passed: boolean
  results: QuizQuestionResult[]
}

export interface TrackProgress {
  slug: string
  title: string
  icon: string
  accent: string
  done: number
  total: number
}

export interface MeResponse {
  user: UserDto
  xp: number
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
  streakDays: number
  solvedProblems: number
  completedLessons: number
  passedQuizzes: number
  tracks: TrackProgress[]
}

export interface SubmissionSummary {
  id: number
  problemSlug: string
  problemTitle: string
  verdict: Verdict
  passedCount: number
  totalCount: number
  maxTimeMs: number
  createdAt: string
}

export interface DailyChallengeDto {
  slug: string
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  xp: number
  solved: boolean
}
