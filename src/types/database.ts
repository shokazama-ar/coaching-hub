// Database types for coaching-hub (mirrors supabase/schema.sql)

export type PracticeCategoryKind = "up" | "workout" | "offense" | "defense" | "down";
export type ReactionType = "read" | "nice" | "idea" | "question";

export type Team = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  inserted_at: string;
  updated_at: string;
};

export type Role = {
  id: string;
  team_id: string;
  name: string;
  is_admin: boolean;
  inserted_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  team_id: string;
  display_name: string | null;
  role_id: string | null;
  inserted_at: string;
  updated_at: string;
};

export type Athlete = {
  id: string;
  team_id: string;
  nickname: string;
  grade_band: string | null;
  group_label: string | null;
  number: number | null;
  memo: string | null;
  is_active: boolean;
  inserted_at: string;
  updated_at: string;
};

export type Phase = {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  inserted_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  team_id: string;
  kind: PracticeCategoryKind;
  name: string;
  is_primary: boolean;
  parent_category_id: string | null;
  sort_order: number;
  inserted_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  team_id: string;
  phase_id: string | null;
  category_id: string;
  title: string;
  description: string | null;
  difficulty: number | null;
  tags: string[] | null;
  is_active: boolean;
  inserted_at: string;
  updated_at: string;
};

export type PracticeLog = {
  id: string;
  team_id: string;
  practice_date: string;
  phase_id: string | null;
  title: string | null;
  daily_reflection: string | null;
  created_by: string;
  inserted_at: string;
  updated_at: string;
};

export type PracticeLogSubject = {
  id: string;
  practice_log_id: string;
  subject_id: string;
  block_order: number;
  duration_minutes: number | null;
  memo: string | null;
  inserted_at: string;
  updated_at: string;
};

export type LogMedia = {
  id: string;
  team_id: string;
  practice_log_id: string;
  uploaded_by: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string | null;
  inserted_at: string;
  updated_at: string;
};

export type IndividualNote = {
  id: string;
  team_id: string;
  practice_log_id: string;
  athlete_id: string;
  author_id: string;
  content: string;
  positive_points: string | null;
  focus_points: string | null;
  inserted_at: string;
  updated_at: string;
};

export type Reaction = {
  id: string;
  team_id: string;
  practice_log_id: string;
  user_id: string;
  type: ReactionType;
  inserted_at: string;
};

// Category kind labels
export const CATEGORY_KIND_LABELS: Record<PracticeCategoryKind, string> = {
  up: "アップ",
  workout: "ワークアウト",
  offense: "オフェンス",
  defense: "ディフェンス",
  down: "ダウン",
};

export const CATEGORY_KINDS: PracticeCategoryKind[] = [
  "up",
  "workout",
  "offense",
  "defense",
  "down",
];

export const REACTION_LABELS: Record<ReactionType, string> = {
  read: "👀 既読",
  nice: "👍 ナイス",
  idea: "💡 アイデア",
  question: "❓ 質問",
};

export const REACTION_TYPES: ReactionType[] = ["read", "nice", "idea", "question"];
