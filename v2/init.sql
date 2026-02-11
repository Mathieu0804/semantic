-- =====================================================
-- PME AI Platform - Schéma Base de Données PostgreSQL
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour recherche full-text

-- =====================================================
-- TABLE: Utilisateurs / Entreprises
-- =====================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    industry VARCHAR(100),
    size VARCHAR(50), -- 'micro', 'small', 'medium'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user', -- 'admin', 'user', 'viewer'
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: Identité Entreprise & Configuration
-- =====================================================

CREATE TABLE company_identity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    mission TEXT,
    vision TEXT,
    values TEXT[], -- Array de valeurs
    target_audience TEXT,
    unique_selling_points TEXT[],
    brand_voice VARCHAR(100), -- 'professional', 'friendly', 'technical', etc.
    brand_tone VARCHAR(100), -- 'formal', 'casual', 'enthusiastic', etc.
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7),
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: Sites Web Créés
-- =====================================================

CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template VARCHAR(100),
    domain VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    html_content TEXT,
    css_content TEXT,
    js_content TEXT,
    metadata JSONB, -- Stockage flexible pour meta tags, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- =====================================================
-- TABLE: Produits & Services
-- =====================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category VARCHAR(100),
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'EUR',
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    images TEXT[], -- Array d'URLs
    metadata JSONB, -- Champs personnalisés
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: SEO & LD-JSON
-- =====================================================

CREATE TABLE seo_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    page_type VARCHAR(50), -- 'homepage', 'product', 'service', 'about', etc.
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT[],
    og_image TEXT,
    ld_json JSONB, -- Schema.org structured data
    canonical_url TEXT,
    robots VARCHAR(100), -- 'index,follow', 'noindex', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, website_id, page_type)
);

-- =====================================================
-- TABLE: Dialogues IA avec Utilisateurs
-- =====================================================

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    conversation_type VARCHAR(50), -- 'site_creation', 'identity', 'support', etc.
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB, -- Pour stocker contexte, tokens utilisés, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: Dialogues IA-to-IA (MCP Server)
-- =====================================================

CREATE TABLE mcp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    external_ai_id VARCHAR(255), -- Identifiant de l'IA externe
    external_ai_name VARCHAR(100),
    conversation_topic VARCHAR(255),
    session_id VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    total_messages INTEGER DEFAULT 0
);

CREATE TABLE mcp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES mcp_conversations(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL, -- 'incoming', 'outgoing'
    content TEXT NOT NULL,
    intent VARCHAR(100), -- 'inquiry', 'purchase', 'support', etc.
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: Analytics Visiteurs
-- =====================================================

CREATE TABLE visitor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    visitor_id VARCHAR(255), -- Cookie ou fingerprint
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    landing_page TEXT,
    exit_page TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    page_views INTEGER DEFAULT 0,
    duration_seconds INTEGER
);

CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    page_url TEXT NOT NULL,
    page_title VARCHAR(255),
    time_on_page INTEGER, -- secondes
    scroll_depth INTEGER, -- pourcentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visitor_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'click', 'form_submit', 'download', etc.
    event_category VARCHAR(100),
    event_value TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: Patterns Comportementaux
-- =====================================================

CREATE TABLE behavior_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    pattern_type VARCHAR(100), -- 'navigation', 'conversion', 'engagement', etc.
    pattern_name VARCHAR(255),
    description TEXT,
    frequency INTEGER DEFAULT 1,
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_observed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- Détails du pattern
);

CREATE TABLE improvement_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    source VARCHAR(50), -- 'analytics', 'ai_analysis', 'mcp_interactions', etc.
    category VARCHAR(100), -- 'seo', 'content', 'ux', 'product', etc.
    suggestion_text TEXT NOT NULL,
    priority VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'applied', 'dismissed'
    impact_score DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_at TIMESTAMP,
    metadata JSONB
);

-- =====================================================
-- TABLE: Configuration IA Locale
-- =====================================================

CREATE TABLE ai_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    model_name VARCHAR(100),
    system_prompt TEXT,
    temperature DECIMAL(2, 1) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    personality_traits TEXT[],
    knowledge_base TEXT, -- Instructions spécifiques à l'entreprise
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: Uploads & Médias
-- =====================================================

CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER, -- bytes
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEX pour Performance
-- =====================================================

-- Index pour recherche rapide
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_mcp_messages_conversation ON mcp_messages(conversation_id);

CREATE INDEX idx_visitor_sessions_company ON visitor_sessions(company_id);
CREATE INDEX idx_visitor_sessions_session ON visitor_sessions(session_id);

CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_events_session ON visitor_events(session_id);

CREATE INDEX idx_patterns_company ON behavior_patterns(company_id);
CREATE INDEX idx_suggestions_company ON improvement_suggestions(company_id);

-- Index pour analytics temporelles
CREATE INDEX idx_sessions_created ON visitor_sessions(created_at);
CREATE INDEX idx_page_views_created ON page_views(created_at);

-- =====================================================
-- FONCTIONS & TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_identity_updated_at BEFORE UPDATE ON company_identity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_updated_at BEFORE UPDATE ON seo_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES INITIALES (Optionnel)
-- =====================================================

-- Insérer un utilisateur admin par défaut (mot de passe: admin123 - À CHANGER!)
-- INSERT INTO companies (name, domain) VALUES ('Demo Company', 'demo.local');
-- INSERT INTO users (company_id, email, password_hash, role) 
-- VALUES (
--     (SELECT id FROM companies WHERE domain = 'demo.local'),
--     'admin@demo.local',
--     '$2a$10$...' -- Hash bcrypt de 'admin123'
--     'admin'
-- );

-- =====================================================
-- FIN DU SCHÉMA
-- =====================================================
