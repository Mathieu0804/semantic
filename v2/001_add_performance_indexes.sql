-- =====================================================
-- Migration: Ajout index de performance
-- Date: Février 2025
-- Description: Ajoute les index manquants identifiés par QA
-- =====================================================

-- Index pour améliorer performance des requêtes analytics
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id_hash 
  ON visitor_sessions USING hash(session_id);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_company_started 
  ON visitor_sessions(company_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_session_created 
  ON page_views(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_events_session_created 
  ON visitor_events(session_id, created_at DESC);

-- Index pour améliorer recherche produits
CREATE INDEX IF NOT EXISTS idx_products_company_active 
  ON products(company_id, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_search 
  ON products USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));

-- Index pour conversations IA
CREATE INDEX IF NOT EXISTS idx_ai_conversations_company_updated 
  ON ai_conversations(company_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created 
  ON ai_messages(conversation_id, created_at ASC);

-- Index pour MCP
CREATE INDEX IF NOT EXISTS idx_mcp_conversations_company_session 
  ON mcp_conversations(company_id, session_id) 
  WHERE ended_at IS NULL;

-- Index pour suggestions
CREATE INDEX IF NOT EXISTS idx_suggestions_company_status_priority 
  ON improvement_suggestions(company_id, status, priority, impact_score DESC) 
  WHERE status = 'pending';

-- Statistiques à jour
ANALYZE visitor_sessions;
ANALYZE page_views;
ANALYZE products;
ANALYZE ai_conversations;

-- Log de la migration
DO $$
BEGIN
  RAISE NOTICE 'Migration index de performance terminée avec succès';
END $$;
