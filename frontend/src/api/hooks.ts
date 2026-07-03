import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, post } from './client'
import type {
  ContextDto,
  DailyChallengeDto,
  ItemKind,
  LessonDto,
  MeResponse,
  NextItemDto,
  ProblemDto,
  QuizCheckResponse,
  QuizDto,
  QuizResultResponse,
  RunResponse,
  SubmissionSummary,
  TrackDetail,
  TrackSummary,
} from './types'

/** The item after this one in its track — powers "Next up" after completion. */
export const fetchNext = (kind: ItemKind, slug: string) =>
  get<NextItemDto>(`/api/next?kind=${kind}&slug=${encodeURIComponent(slug)}`)

export const useItemContext = (kind: ItemKind, slug: string) =>
  useQuery({
    queryKey: ['context', kind, slug],
    queryFn: () => get<ContextDto>(`/api/context?kind=${kind}&slug=${encodeURIComponent(slug)}`),
  })

export const checkQuizAnswer = (slug: string, questionId: number, answer: number) =>
  post<QuizCheckResponse>(`/api/quizzes/${slug}/check`, { questionId, answer })

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: () => get<MeResponse>('/api/me') })

export const useTracks = () =>
  useQuery({ queryKey: ['tracks'], queryFn: () => get<TrackSummary[]>('/api/tracks') })

export const useTrack = (slug: string) =>
  useQuery({ queryKey: ['track', slug], queryFn: () => get<TrackDetail>(`/api/tracks/${slug}`) })

export const useLesson = (slug: string) =>
  useQuery({ queryKey: ['lesson', slug], queryFn: () => get<LessonDto>(`/api/lessons/${slug}`) })

export const useProblem = (slug: string) =>
  useQuery({ queryKey: ['problem', slug], queryFn: () => get<ProblemDto>(`/api/problems/${slug}`) })

export const useQuiz = (slug: string) =>
  useQuery({ queryKey: ['quiz', slug], queryFn: () => get<QuizDto>(`/api/quizzes/${slug}`) })

export const useDaily = () =>
  useQuery({ queryKey: ['daily'], queryFn: () => get<DailyChallengeDto>('/api/daily') })

export const useSubmissions = () =>
  useQuery({
    queryKey: ['submissions'],
    queryFn: () => get<SubmissionSummary[]>('/api/me/submissions'),
  })

/** Invalidate everything progress-related after any XP-earning action. */
function useInvalidateProgress() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['me'] })
    void queryClient.invalidateQueries({ queryKey: ['tracks'] })
    void queryClient.invalidateQueries({ queryKey: ['track'] })
    void queryClient.invalidateQueries({ queryKey: ['daily'] })
    void queryClient.invalidateQueries({ queryKey: ['submissions'] })
  }
}

export function useRunCode(slug: string) {
  return useMutation({
    mutationFn: (code: string) => post<RunResponse>(`/api/problems/${slug}/run`, { code }),
  })
}

export function useSubmitCode(slug: string) {
  const invalidate = useInvalidateProgress()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => post<RunResponse>(`/api/problems/${slug}/submit`, { code }),
    onSuccess: (result) => {
      invalidate()
      if (result.firstAccept) {
        void queryClient.invalidateQueries({ queryKey: ['problem', slug] })
      }
    },
  })
}

export function useCompleteLesson(slug: string) {
  const invalidate = useInvalidateProgress()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => post<{ done: boolean; xpAwarded: number }>(`/api/lessons/${slug}/complete`),
    onSuccess: () => {
      invalidate()
      void queryClient.invalidateQueries({ queryKey: ['lesson', slug] })
    },
  })
}

export function useSubmitQuiz(slug: string) {
  const invalidate = useInvalidateProgress()
  return useMutation({
    mutationFn: (payload: { questionIds: number[]; answers: number[] }) =>
      post<QuizResultResponse>(`/api/quizzes/${slug}/submit`, payload),
    onSuccess: invalidate,
  })
}
