export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      vt_categories: {
        Row: { id: string; name: string; slug: string; sort_order: number }
        Insert: { id?: string; name: string; slug: string; sort_order?: number }
        Update: { id?: string; name?: string; slug?: string; sort_order?: number }
        Relationships: []
      }
      vt_channels: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      vt_comments: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          parent_id: string | null
          status: string
          video_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          parent_id?: string | null
          status?: string
          video_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          status?: string
          video_id?: string
        }
        Relationships: []
      }
      vt_drill_attempts: {
        Row: {
          completed_at: string
          drill_set_id: string | null
          duration_seconds: number
          errors: number
          id: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string
          drill_set_id?: string | null
          duration_seconds?: number
          errors?: number
          id?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string
          drill_set_id?: string | null
          duration_seconds?: number
          errors?: number
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vt_drill_sets: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          mode: string
          orientation: string
          pgn: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          mode?: string
          orientation?: string
          pgn: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          mode?: string
          orientation?: string
          pgn?: string
          title?: string
        }
        Relationships: []
      }
      vt_lesson_chapters: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          pgn: string
          position: number
          start_fen: string | null
          title: string | null
          video_timestamp: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          pgn: string
          position?: number
          start_fen?: string | null
          title?: string | null
          video_timestamp?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          pgn?: string
          position?: number
          start_fen?: string | null
          title?: string | null
          video_timestamp?: number | null
        }
        Relationships: []
      }
      vt_lessons: {
        Row: {
          category_id: string | null
          channel_id: string | null
          created_at: string
          description: string | null
          difficulty: string
          id: string
          slug: string
          status: string
          title: string
          updated_at: string
          video_id: string | null
        }
        Insert: {
          category_id?: string | null
          channel_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
          video_id?: string | null
        }
        Update: {
          category_id?: string | null
          channel_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          video_id?: string | null
        }
        Relationships: []
      }
      vt_pgn_games: {
        Row: {
          black: string | null
          created_at: string
          date_played: string | null
          eco: string | null
          event: string | null
          id: string
          pgn: string
          result: string | null
          site: string | null
          source: string | null
          title: string | null
          white: string | null
        }
        Insert: {
          black?: string | null
          created_at?: string
          date_played?: string | null
          eco?: string | null
          event?: string | null
          id?: string
          pgn: string
          result?: string | null
          site?: string | null
          source?: string | null
          title?: string | null
          white?: string | null
        }
        Update: {
          black?: string | null
          created_at?: string
          date_played?: string | null
          eco?: string | null
          event?: string | null
          id?: string
          pgn?: string
          result?: string | null
          site?: string | null
          source?: string | null
          title?: string | null
          white?: string | null
        }
        Relationships: []
      }
      vt_playlist_items: {
        Row: { playlist_id: string; position: number; video_id: string }
        Insert: { playlist_id: string; position?: number; video_id: string }
        Update: { playlist_id?: string; position?: number; video_id?: string }
        Relationships: []
      }
      vt_playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          visibility?: string
        }
        Relationships: []
      }
      vt_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      vt_srs_cards: {
        Row: {
          created_at: string
          drill_set_id: string | null
          expected_move: string
          fen: string
          id: string
          lesson_id: string | null
          variation_path: string | null
        }
        Insert: {
          created_at?: string
          drill_set_id?: string | null
          expected_move: string
          fen: string
          id?: string
          lesson_id?: string | null
          variation_path?: string | null
        }
        Update: {
          created_at?: string
          drill_set_id?: string | null
          expected_move?: string
          fen?: string
          id?: string
          lesson_id?: string | null
          variation_path?: string | null
        }
        Relationships: []
      }
      vt_srs_reviews: {
        Row: {
          card_id: string
          due_at: string
          ease_factor: number
          interval_days: number
          last_reviewed_at: string | null
          repetitions: number
          user_id: string
        }
        Insert: {
          card_id: string
          due_at?: string
          ease_factor?: number
          interval_days?: number
          last_reviewed_at?: string | null
          repetitions?: number
          user_id: string
        }
        Update: {
          card_id?: string
          due_at?: string
          ease_factor?: number
          interval_days?: number
          last_reviewed_at?: string | null
          repetitions?: number
          user_id?: string
        }
        Relationships: []
      }
      vt_subscriptions: {
        Row: { channel_id: string; created_at: string; subscriber_id: string }
        Insert: { channel_id: string; created_at?: string; subscriber_id: string }
        Update: { channel_id?: string; created_at?: string; subscriber_id?: string }
        Relationships: []
      }
      vt_video_likes: {
        Row: { created_at: string; user_id: string; video_id: string }
        Insert: { created_at?: string; user_id: string; video_id: string }
        Update: { created_at?: string; user_id?: string; video_id?: string }
        Relationships: []
      }
      vt_videos: {
        Row: {
          category_id: string | null
          channel_id: string | null
          created_at: string
          description: string | null
          duration: number | null
          id: string
          playback_url: string | null
          provider: string
          published_at: string | null
          search_tsv: unknown
          source_id: string | null
          source_url: string | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          category_id?: string | null
          channel_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          playback_url?: string | null
          provider?: string
          published_at?: string | null
          search_tsv?: unknown
          source_id?: string | null
          source_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          category_id?: string | null
          channel_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          playback_url?: string | null
          provider?: string
          published_at?: string | null
          search_tsv?: unknown
          source_id?: string | null
          source_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      vt_watch_history: {
        Row: { progress_seconds: number; user_id: string; video_id: string; watched_at: string }
        Insert: { progress_seconds?: number; user_id: string; video_id: string; watched_at?: string }
        Update: { progress_seconds?: number; user_id?: string; video_id?: string; watched_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      vt_increment_video_views: { Args: { p_video_id: string }; Returns: undefined }
      vt_is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']
