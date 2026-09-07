export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      academic_levels: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          name_ar: string;
          name_en: string;
          program_id: string;
          sort_order: number;
          status: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          name_ar: string;
          name_en: string;
          program_id: string;
          sort_order?: number;
          status?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          name_ar?: string;
          name_en?: string;
          program_id?: string;
          sort_order?: number;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academic_levels_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      answer_evidence: {
        Row: {
          answer_id: string;
          created_at: string;
          id: string;
          rank: number;
          source_segment_id: string;
          usage_type: string;
        };
        Insert: {
          answer_id: string;
          created_at?: string;
          id?: string;
          rank: number;
          source_segment_id: string;
          usage_type: string;
        };
        Update: {
          answer_id?: string;
          created_at?: string;
          id?: string;
          rank?: number;
          source_segment_id?: string;
          usage_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answer_evidence_answer_id_fkey";
            columns: ["answer_id"];
            isOneToOne: false;
            referencedRelation: "chat_answers";
            referencedColumns: ["id"];
          },
        ];
      };
      artifact_evidence: {
        Row: {
          artifact_id: string;
          created_at: string;
          id: string;
          source_segment_id: string;
          usage_type: string;
        };
        Insert: {
          artifact_id: string;
          created_at?: string;
          id?: string;
          source_segment_id: string;
          usage_type: string;
        };
        Update: {
          artifact_id?: string;
          created_at?: string;
          id?: string;
          source_segment_id?: string;
          usage_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artifact_evidence_artifact_id_fkey";
            columns: ["artifact_id"];
            isOneToOne: false;
            referencedRelation: "studio_artifacts";
            referencedColumns: ["id"];
          },
        ];
      };
      artifact_validation_results: {
        Row: {
          artifact_id: string;
          created_at: string;
          id: string;
          issues_json: Json;
          result: string;
          validator_version: string;
        };
        Insert: {
          artifact_id: string;
          created_at?: string;
          id?: string;
          issues_json?: Json;
          result: string;
          validator_version: string;
        };
        Update: {
          artifact_id?: string;
          created_at?: string;
          id?: string;
          issues_json?: Json;
          result?: string;
          validator_version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artifact_validation_results_artifact_id_fkey";
            columns: ["artifact_id"];
            isOneToOne: false;
            referencedRelation: "studio_artifacts";
            referencedColumns: ["id"];
          },
        ];
      };
      batch_leader_assignments: {
        Row: {
          accepted_at: string | null;
          campaign_id: string;
          created_at: string;
          expires_at: string;
          id: string;
          invited_by: string;
          reason: string | null;
          revoked_at: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          campaign_id: string;
          created_at?: string;
          expires_at: string;
          id?: string;
          invited_by: string;
          reason?: string | null;
          revoked_at?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          campaign_id?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          reason?: string | null;
          revoked_at?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "batch_leader_assignments_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "collection_campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "batch_leader_assignments_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "batch_leader_assignments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      campaign_curriculum_units: {
        Row: {
          campaign_id: string;
          cohort_id: string;
          created_at: string;
          curriculum_unit_id: string;
          id: string;
        };
        Insert: {
          campaign_id: string;
          cohort_id: string;
          created_at?: string;
          curriculum_unit_id: string;
          id?: string;
        };
        Update: {
          campaign_id?: string;
          cohort_id?: string;
          created_at?: string;
          curriculum_unit_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_curriculum_units_campaign_fk";
            columns: ["campaign_id", "cohort_id"];
            isOneToOne: false;
            referencedRelation: "collection_campaigns";
            referencedColumns: ["id", "cohort_id"];
          },
          {
            foreignKeyName: "campaign_curriculum_units_unit_fk";
            columns: ["curriculum_unit_id", "cohort_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_units";
            referencedColumns: ["id", "cohort_id"];
          },
        ];
      };
      chat_answers: {
        Row: {
          assistant_message_id: string;
          conflict_detected: boolean;
          created_at: string;
          evidence_status: string;
          finalized_at: string | null;
          id: string;
          model_version: string;
          policy_version: string;
          validation_status: string;
        };
        Insert: {
          assistant_message_id: string;
          conflict_detected?: boolean;
          created_at?: string;
          evidence_status: string;
          finalized_at?: string | null;
          id?: string;
          model_version: string;
          policy_version: string;
          validation_status?: string;
        };
        Update: {
          assistant_message_id?: string;
          conflict_detected?: boolean;
          created_at?: string;
          evidence_status?: string;
          finalized_at?: string | null;
          id?: string;
          model_version?: string;
          policy_version?: string;
          validation_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_answers_assistant_message_id_fkey";
            columns: ["assistant_message_id"];
            isOneToOne: true;
            referencedRelation: "chat_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          retained_until: string | null;
          role: string;
          session_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          retained_until?: string | null;
          role: string;
          session_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          retained_until?: string | null;
          role?: string;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          closed_at: string | null;
          cohort_id: string;
          created_at: string;
          curriculum_unit_id: string;
          id: string;
          language_mode: string;
          retention_mode: string;
          user_id: string;
        };
        Insert: {
          closed_at?: string | null;
          cohort_id: string;
          created_at?: string;
          curriculum_unit_id: string;
          id?: string;
          language_mode: string;
          retention_mode: string;
          user_id: string;
        };
        Update: {
          closed_at?: string | null;
          cohort_id?: string;
          created_at?: string;
          curriculum_unit_id?: string;
          id?: string;
          language_mode?: string;
          retention_mode?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_sessions_cohort_id_fkey";
            columns: ["cohort_id"];
            isOneToOne: false;
            referencedRelation: "cohorts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_sessions_unit_scope_fk";
            columns: ["curriculum_unit_id", "cohort_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_units";
            referencedColumns: ["id", "cohort_id"];
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      cohort_memberships: {
        Row: {
          cohort_id: string;
          created_at: string;
          ends_at: string | null;
          grant_reason: string | null;
          granted_by: string | null;
          id: string;
          starts_at: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          cohort_id: string;
          created_at?: string;
          ends_at?: string | null;
          grant_reason?: string | null;
          granted_by?: string | null;
          id?: string;
          starts_at?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          cohort_id?: string;
          created_at?: string;
          ends_at?: string | null;
          grant_reason?: string | null;
          granted_by?: string | null;
          id?: string;
          starts_at?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cohort_memberships_cohort_id_fkey";
            columns: ["cohort_id"];
            isOneToOne: false;
            referencedRelation: "cohorts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cohort_memberships_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cohort_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      cohort_releases: {
        Row: {
          changed_at: string;
          changed_by: string;
          cohort_id: string;
          created_at: string;
          id: string;
          reason: string;
          release_status: string;
        };
        Insert: {
          changed_at?: string;
          changed_by: string;
          cohort_id: string;
          created_at?: string;
          id?: string;
          reason: string;
          release_status?: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string;
          cohort_id?: string;
          created_at?: string;
          id?: string;
          reason?: string;
          release_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cohort_releases_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cohort_releases_cohort_id_fkey";
            columns: ["cohort_id"];
            isOneToOne: true;
            referencedRelation: "cohorts";
            referencedColumns: ["id"];
          },
        ];
      };
      cohorts: {
        Row: {
          code: string;
          created_at: string;
          curriculum_edition: string;
          ends_at: string | null;
          id: string;
          name: string;
          starts_at: string | null;
          status: string;
          term_id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          curriculum_edition: string;
          ends_at?: string | null;
          id?: string;
          name: string;
          starts_at?: string | null;
          status?: string;
          term_id: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          curriculum_edition?: string;
          ends_at?: string | null;
          id?: string;
          name?: string;
          starts_at?: string | null;
          status?: string;
          term_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cohorts_term_id_fkey";
            columns: ["term_id"];
            isOneToOne: false;
            referencedRelation: "terms";
            referencedColumns: ["id"];
          },
        ];
      };
      collection_campaigns: {
        Row: {
          closes_at: string | null;
          cohort_id: string;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          opens_at: string | null;
          status: string;
        };
        Insert: {
          closes_at?: string | null;
          cohort_id: string;
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          opens_at?: string | null;
          status?: string;
        };
        Update: {
          closes_at?: string | null;
          cohort_id?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          opens_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_campaigns_cohort_id_fkey";
            columns: ["cohort_id"];
            isOneToOne: false;
            referencedRelation: "cohorts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_campaigns_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      curriculum_unit_publication_events: {
        Row: {
          changed_at: string;
          changed_by: string;
          correlation_id: string;
          created_at: string;
          curriculum_unit_id: string;
          id: string;
          new_status: string;
          prior_status: string;
          reason: string;
        };
        Insert: {
          changed_at?: string;
          changed_by: string;
          correlation_id: string;
          created_at?: string;
          curriculum_unit_id: string;
          id?: string;
          new_status: string;
          prior_status: string;
          reason: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string;
          correlation_id?: string;
          created_at?: string;
          curriculum_unit_id?: string;
          id?: string;
          new_status?: string;
          prior_status?: string;
          reason?: string;
        };
        Relationships: [
          {
            foreignKeyName: "curriculum_unit_publication_events_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "curriculum_unit_publication_events_curriculum_unit_id_fkey";
            columns: ["curriculum_unit_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_units";
            referencedColumns: ["id"];
          },
        ];
      };
      curriculum_units: {
        Row: {
          code: string;
          cohort_id: string;
          created_at: string;
          id: string;
          parent_unit_id: string | null;
          publication_status: string;
          published_at: string | null;
          published_by: string | null;
          sort_order: number;
          title_ar: string;
          title_en: string;
          unit_type: Database["public"]["Enums"]["curriculum_unit_type"];
        };
        Insert: {
          code: string;
          cohort_id: string;
          created_at?: string;
          id?: string;
          parent_unit_id?: string | null;
          publication_status?: string;
          published_at?: string | null;
          published_by?: string | null;
          sort_order?: number;
          title_ar: string;
          title_en: string;
          unit_type: Database["public"]["Enums"]["curriculum_unit_type"];
        };
        Update: {
          code?: string;
          cohort_id?: string;
          created_at?: string;
          id?: string;
          parent_unit_id?: string | null;
          publication_status?: string;
          published_at?: string | null;
          published_by?: string | null;
          sort_order?: number;
          title_ar?: string;
          title_en?: string;
          unit_type?: Database["public"]["Enums"]["curriculum_unit_type"];
        };
        Relationships: [
          {
            foreignKeyName: "curriculum_units_cohort_id_fkey";
            columns: ["cohort_id"];
            isOneToOne: false;
            referencedRelation: "cohorts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "curriculum_units_parent_same_cohort_fk";
            columns: ["parent_unit_id", "cohort_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_units";
            referencedColumns: ["id", "cohort_id"];
          },
          {
            foreignKeyName: "curriculum_units_published_by_fkey";
            columns: ["published_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      education_stages: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          name_ar: string;
          name_en: string;
          sort_order: number;
          status: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          name_ar: string;
          name_en: string;
          sort_order?: number;
          status?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          name_ar?: string;
          name_en?: string;
          sort_order?: number;
          status?: string;
        };
        Relationships: [];
      };
      feedback_reports: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          entity_id: string;
          entity_type: string;
          id: string;
          reporter_id: string;
          status: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          reporter_id: string;
          status?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          reporter_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      institutions: {
        Row: {
          code: string;
          created_at: string;
          education_stage_id: string;
          id: string;
          name_ar: string;
          name_en: string;
          status: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          education_stage_id: string;
          id?: string;
          name_ar: string;
          name_en: string;
          status?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          education_stage_id?: string;
          id?: string;
          name_ar?: string;
          name_en?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "institutions_education_stage_id_fkey";
            columns: ["education_stage_id"];
            isOneToOne: false;
            referencedRelation: "education_stages";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_status: string;
          chat_retention_mode: string;
          created_at: string;
          display_name: string;
          preferred_language: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_status?: string;
          chat_retention_mode?: string;
          created_at?: string;
          display_name?: string;
          preferred_language?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_status?: string;
          chat_retention_mode?: string;
          created_at?: string;
          display_name?: string;
          preferred_language?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          code: string;
          created_at: string;
          default_unit_type: Database["public"]["Enums"]["curriculum_unit_type"];
          id: string;
          institution_id: string;
          name_ar: string;
          name_en: string;
          program_type: string;
          status: string;
          unit_label_plural_ar: string;
          unit_label_plural_en: string;
          unit_label_singular_ar: string;
          unit_label_singular_en: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          default_unit_type: Database["public"]["Enums"]["curriculum_unit_type"];
          id?: string;
          institution_id: string;
          name_ar: string;
          name_en: string;
          program_type: string;
          status?: string;
          unit_label_plural_ar: string;
          unit_label_plural_en: string;
          unit_label_singular_ar: string;
          unit_label_singular_en: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          default_unit_type?: Database["public"]["Enums"]["curriculum_unit_type"];
          id?: string;
          institution_id?: string;
          name_ar?: string;
          name_en?: string;
          program_type?: string;
          status?: string;
          unit_label_plural_ar?: string;
          unit_label_plural_en?: string;
          unit_label_singular_ar?: string;
          unit_label_singular_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programs_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_attempts: {
        Row: {
          artifact_id: string;
          client_idempotency_key: string;
          created_at: string;
          id: string;
          mode: string;
          result_json: Json | null;
          score: number | null;
          started_at: string;
          submitted_at: string | null;
          user_id: string;
        };
        Insert: {
          artifact_id: string;
          client_idempotency_key: string;
          created_at?: string;
          id?: string;
          mode: string;
          result_json?: Json | null;
          score?: number | null;
          started_at?: string;
          submitted_at?: string | null;
          user_id: string;
        };
        Update: {
          artifact_id?: string;
          client_idempotency_key?: string;
          created_at?: string;
          id?: string;
          mode?: string;
          result_json?: Json | null;
          score?: number | null;
          started_at?: string;
          submitted_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_artifact_id_fkey";
            columns: ["artifact_id"];
            isOneToOne: false;
            referencedRelation: "studio_artifacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      quiz_responses: {
        Row: {
          answered_at: string;
          attempt_id: string;
          correct: boolean | null;
          created_at: string;
          id: string;
          item_key: string;
          selected_option: string | null;
        };
        Insert: {
          answered_at?: string;
          attempt_id: string;
          correct?: boolean | null;
          created_at?: string;
          id?: string;
          item_key: string;
          selected_option?: string | null;
        };
        Update: {
          answered_at?: string;
          attempt_id?: string;
          correct?: boolean | null;
          created_at?: string;
          id?: string;
          item_key?: string;
          selected_option?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_responses_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: false;
            referencedRelation: "quiz_attempts";
            referencedColumns: ["id"];
          },
        ];
      };
      requested_material_items: {
        Row: {
          campaign_id: string;
          created_at: string;
          curriculum_unit_id: string;
          expected_type: string;
          id: string;
          required: boolean;
          status: string;
          title: string;
        };
        Insert: {
          campaign_id: string;
          created_at?: string;
          curriculum_unit_id: string;
          expected_type: string;
          id?: string;
          required?: boolean;
          status?: string;
          title: string;
        };
        Update: {
          campaign_id?: string;
          created_at?: string;
          curriculum_unit_id?: string;
          expected_type?: string;
          id?: string;
          required?: boolean;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "requested_material_items_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "collection_campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requested_material_items_curriculum_unit_id_fkey";
            columns: ["curriculum_unit_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_units";
            referencedColumns: ["id"];
          },
        ];
      };
      source_assets: {
        Row: {
          canonical_title: string;
          cohort_id: string;
          contributor_label: string | null;
          created_at: string;
          curriculum_unit_id: string;
          id: string;
          source_kind: string;
        };
        Insert: {
          canonical_title: string;
          cohort_id: string;
          contributor_label?: string | null;
          created_at?: string;
          curriculum_unit_id: string;
          id?: string;
          source_kind: string;
        };
        Update: {
          canonical_title?: string;
          cohort_id?: string;
          contributor_label?: string | null;
          created_at?: string;
          curriculum_unit_id?: string;
          id?: string;
          source_kind?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_assets_cohort_id_fkey";
            columns: ["cohort_id"];
            isOneToOne: false;
            referencedRelation: "cohorts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "source_assets_unit_scope_fk";
            columns: ["curriculum_unit_id", "cohort_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_units";
            referencedColumns: ["id", "cohort_id"];
          },
        ];
      };
      source_submissions: {
        Row: {
          campaign_id: string;
          client_idempotency_key: string;
          cohort_id: string;
          created_at: string;
          curriculum_unit_id: string;
          declared_format: string;
          declared_rights: string;
          id: string;
          requested_material_item_id: string | null;
          source_name: string;
          status: string;
          submitted_by: string;
        };
        Insert: {
          campaign_id: string;
          client_idempotency_key: string;
          cohort_id: string;
          created_at?: string;
          curriculum_unit_id: string;
          declared_format: string;
          declared_rights: string;
          id?: string;
          requested_material_item_id?: string | null;
          source_name: string;
          status?: string;
          submitted_by: string;
        };
        Update: {
          campaign_id?: string;
          client_idempotency_key?: string;
          cohort_id?: string;
          created_at?: string;
          curriculum_unit_id?: string;
          declared_format?: string;
          declared_rights?: string;
          id?: string;
          requested_material_item_id?: string | null;
          source_name?: string;
          status?: string;
          submitted_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_submissions_campaign_fk";
            columns: ["campaign_id", "cohort_id"];
            isOneToOne: false;
            referencedRelation: "collection_campaigns";
            referencedColumns: ["id", "cohort_id"];
          },
          {
            foreignKeyName: "source_submissions_requested_material_item_id_fkey";
            columns: ["requested_material_item_id"];
            isOneToOne: false;
            referencedRelation: "requested_material_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "source_submissions_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "source_submissions_unit_fk";
            columns: ["curriculum_unit_id", "cohort_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_units";
            referencedColumns: ["id", "cohort_id"];
          },
        ];
      };
      source_versions: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          activation_status: string;
          byte_size: number;
          checksum: string;
          created_at: string;
          curriculum_edition: string;
          duration_ms: number | null;
          id: string;
          language_profile: string;
          mime_type: string;
          page_count: number | null;
          processing_status: string;
          rights_status: string;
          rights_valid_from: string | null;
          rights_valid_until: string | null;
          source_asset_id: string;
          submission_id: string;
          version_number: number;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          activation_status?: string;
          byte_size: number;
          checksum: string;
          created_at?: string;
          curriculum_edition: string;
          duration_ms?: number | null;
          id?: string;
          language_profile: string;
          mime_type: string;
          page_count?: number | null;
          processing_status?: string;
          rights_status?: string;
          rights_valid_from?: string | null;
          rights_valid_until?: string | null;
          source_asset_id: string;
          submission_id: string;
          version_number: number;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          activation_status?: string;
          byte_size?: number;
          checksum?: string;
          created_at?: string;
          curriculum_edition?: string;
          duration_ms?: number | null;
          id?: string;
          language_profile?: string;
          mime_type?: string;
          page_count?: number | null;
          processing_status?: string;
          rights_status?: string;
          rights_valid_from?: string | null;
          rights_valid_until?: string | null;
          source_asset_id?: string;
          submission_id?: string;
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "source_versions_accepted_by_fkey";
            columns: ["accepted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "source_versions_source_asset_id_fkey";
            columns: ["source_asset_id"];
            isOneToOne: false;
            referencedRelation: "source_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "source_versions_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: true;
            referencedRelation: "source_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      studio_artifacts: {
        Row: {
          artifact_hash: string;
          artifact_type: string;
          content_json: Json;
          created_at: string;
          id: string;
          invalidated_at: string | null;
          model_version: string;
          policy_version: string;
          published_at: string | null;
          studio_request_id: string;
          validation_status: string;
        };
        Insert: {
          artifact_hash: string;
          artifact_type: string;
          content_json: Json;
          created_at?: string;
          id?: string;
          invalidated_at?: string | null;
          model_version: string;
          policy_version: string;
          published_at?: string | null;
          studio_request_id: string;
          validation_status?: string;
        };
        Update: {
          artifact_hash?: string;
          artifact_type?: string;
          content_json?: Json;
          created_at?: string;
          id?: string;
          invalidated_at?: string | null;
          model_version?: string;
          policy_version?: string;
          published_at?: string | null;
          studio_request_id?: string;
          validation_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "studio_artifacts_studio_request_id_fkey";
            columns: ["studio_request_id"];
            isOneToOne: false;
            referencedRelation: "studio_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      studio_requests: {
        Row: {
          artifact_type: string;
          cohort_id: string;
          created_at: string;
          curriculum_unit_id: string;
          id: string;
          idempotency_key: string;
          language: string;
          parameters_json: Json;
          source_scope_hash: string;
          state: string;
          user_id: string;
        };
        Insert: {
          artifact_type: string;
          cohort_id: string;
          created_at?: string;
          curriculum_unit_id: string;
          id?: string;
          idempotency_key: string;
          language: string;
          parameters_json?: Json;
          source_scope_hash: string;
          state?: string;
          user_id: string;
        };
        Update: {
          artifact_type?: string;
          cohort_id?: string;
          created_at?: string;
          curriculum_unit_id?: string;
          id?: string;
          idempotency_key?: string;
          language?: string;
          parameters_json?: Json;
          source_scope_hash?: string;
          state?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "studio_requests_cohort_id_fkey";
            columns: ["cohort_id"];
            isOneToOne: false;
            referencedRelation: "cohorts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "studio_requests_unit_scope_fk";
            columns: ["curriculum_unit_id", "cohort_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_units";
            referencedColumns: ["id", "cohort_id"];
          },
          {
            foreignKeyName: "studio_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      terms: {
        Row: {
          academic_level_id: string;
          code: string;
          created_at: string;
          id: string;
          name_ar: string;
          name_en: string;
          sort_order: number;
          status: string;
        };
        Insert: {
          academic_level_id: string;
          code: string;
          created_at?: string;
          id?: string;
          name_ar: string;
          name_en: string;
          sort_order?: number;
          status?: string;
        };
        Update: {
          academic_level_id?: string;
          code?: string;
          created_at?: string;
          id?: string;
          name_ar?: string;
          name_en?: string;
          sort_order?: number;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "terms_academic_level_id_fkey";
            columns: ["academic_level_id"];
            isOneToOne: false;
            referencedRelation: "academic_levels";
            referencedColumns: ["id"];
          },
        ];
      };
      terms_acceptances: {
        Row: {
          accepted_at: string;
          created_at: string;
          educational_boundary_version: string;
          id: string;
          privacy_version: string;
          terms_version: string;
          terms_version_id: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string;
          created_at?: string;
          educational_boundary_version: string;
          id?: string;
          privacy_version: string;
          terms_version: string;
          terms_version_id: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string;
          created_at?: string;
          educational_boundary_version?: string;
          id?: string;
          privacy_version?: string;
          terms_version?: string;
          terms_version_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "terms_acceptances_terms_version_id_fkey";
            columns: ["terms_version_id"];
            isOneToOne: false;
            referencedRelation: "terms_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "terms_acceptances_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      terms_versions: {
        Row: {
          created_at: string;
          created_by: string | null;
          educational_boundary_version: string;
          effective_at: string | null;
          id: string;
          privacy_version: string;
          status: string;
          terms_version: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          educational_boundary_version: string;
          effective_at?: string | null;
          id?: string;
          privacy_version: string;
          status?: string;
          terms_version: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          educational_boundary_version?: string;
          effective_at?: string | null;
          id?: string;
          privacy_version?: string;
          status?: string;
          terms_version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "terms_versions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          grant_reason: string;
          granted_at: string;
          granted_by: string | null;
          id: string;
          revoke_reason: string | null;
          revoked_at: string | null;
          role: Database["public"]["Enums"]["user_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          grant_reason: string;
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          revoke_reason?: string | null;
          revoked_at?: string | null;
          role: Database["public"]["Enums"]["user_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          grant_reason?: string;
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          revoke_reason?: string | null;
          revoked_at?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      available_curriculum_units: {
        Args: { admin_preview?: boolean };
        Returns: {
          availability_state: string;
          code: string;
          cohort_id: string;
          id: string;
          parent_unit_id: string;
          publication_status: string;
          reason_codes: string[];
          sort_order: number;
          title_ar: string;
          title_en: string;
          unit_type: Database["public"]["Enums"]["curriculum_unit_type"];
        }[];
      };
      can_access_unit: {
        Args: { target_curriculum_unit_id: string };
        Returns: boolean;
      };
      has_active_membership: {
        Args: { target_cohort_id: string };
        Returns: boolean;
      };
      has_campaign_assignment: {
        Args: { target_campaign_id: string };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      curriculum_unit_type: "MODULE" | "SUBJECT";
      user_role: "STUDENT" | "BATCH_LEADER" | "ADMIN";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      curriculum_unit_type: ["MODULE", "SUBJECT"],
      user_role: ["STUDENT", "BATCH_LEADER", "ADMIN"],
    },
  },
} as const;
