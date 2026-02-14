-- Migration initiale pour SQLite

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "password" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "company_identities" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL DEFAULT 'Mon Entreprise',
  "description" TEXT,
  "slogan" TEXT,
  "logo" TEXT,
  "primaryColor" TEXT DEFAULT '#3B82F6',
  "secondaryColor" TEXT DEFAULT '#1E40AF',
  "accentColor" TEXT DEFAULT '#10B981',
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "postalCode" TEXT,
  "country" TEXT DEFAULT 'France',
  "website" TEXT,
  "facebook" TEXT,
  "twitter" TEXT,
  "linkedin" TEXT,
  "instagram" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "keywords" TEXT,
  "ldJson" TEXT,
  "businessType" TEXT DEFAULT 'LocalBusiness',
  "aiPersonality" TEXT,
  "aiTone" TEXT DEFAULT 'professionnel',
  "aiExpertise" TEXT,
  "mcpServerUrl" TEXT,
  "mcpEnabled" BOOLEAN DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "sites" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "domain" TEXT UNIQUE,
  "description" TEXT,
  "htmlContent" TEXT,
  "cssContent" TEXT,
  "jsContent" TEXT,
  "theme" TEXT DEFAULT 'modern',
  "language" TEXT DEFAULT 'fr',
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "ldJson" TEXT,
  "status" TEXT DEFAULT 'draft',
  "publishedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "pages" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "siteId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT,
  "content" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "ldJson" TEXT,
  "order" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'draft',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "products" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "siteId" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "shortDescription" TEXT,
  "reference" TEXT UNIQUE,
  "sku" TEXT,
  "price" REAL,
  "currency" TEXT DEFAULT 'EUR',
  "discountPrice" REAL,
  "taxRate" REAL DEFAULT 20.0,
  "images" TEXT,
  "mainImage" TEXT,
  "category" TEXT,
  "subcategory" TEXT,
  "tags" TEXT,
  "stock" INTEGER,
  "stockStatus" TEXT DEFAULT 'in_stock',
  "minOrder" INTEGER DEFAULT 1,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "ldJson" TEXT,
  "status" TEXT DEFAULT 'active',
  "featured" BOOLEAN DEFAULT 0,
  "viewCount" INTEGER DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "services" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "siteId" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "shortDescription" TEXT,
  "reference" TEXT,
  "basePrice" REAL,
  "currency" TEXT DEFAULT 'EUR',
  "pricingType" TEXT DEFAULT 'fixed',
  "duration" TEXT,
  "images" TEXT,
  "mainImage" TEXT,
  "category" TEXT,
  "tags" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "ldJson" TEXT,
  "status" TEXT DEFAULT 'active',
  "featured" BOOLEAN DEFAULT 0,
  "viewCount" INTEGER DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "slug" TEXT NOT NULL UNIQUE,
  "parentId" TEXT,
  "image" TEXT,
  "order" INTEGER DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "dialogues" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT NOT NULL,
  "type" TEXT DEFAULT 'user',
  "source" TEXT,
  "visitorId" TEXT,
  "userMessage" TEXT,
  "aiResponse" TEXT,
  "context" TEXT,
  "intent" TEXT,
  "sentiment" TEXT,
  "responseTime" INTEGER,
  "tokensUsed" INTEGER,
  "rating" INTEGER,
  "feedback" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "visitor_analytics" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "siteId" TEXT,
  "userId" TEXT,
  "visitorId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "sessionDuration" INTEGER,
  "deviceType" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "screenWidth" INTEGER,
  "country" TEXT,
  "city" TEXT,
  "ip" TEXT,
  "pagesVisited" TEXT,
  "entryPage" TEXT,
  "exitPage" TEXT,
  "productsViewed" TEXT,
  "searchQueries" TEXT,
  "conversions" TEXT,
  "conversionValue" REAL,
  "referrer" TEXT,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "patterns" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "type" TEXT NOT NULL,
  "category" TEXT,
  "pattern" TEXT,
  "insights" TEXT,
  "confidence" REAL,
  "frequency" INTEGER DEFAULT 1,
  "periodStart" DATETIME,
  "periodEnd" DATETIME,
  "suggestions" TEXT,
  "status" TEXT DEFAULT 'active',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "mcp_connections" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientName" TEXT,
  "clientType" TEXT,
  "clientIp" TEXT,
  "sessionId" TEXT NOT NULL UNIQUE,
  "token" TEXT NOT NULL UNIQUE,
  "permissions" TEXT,
  "rateLimit" INTEGER DEFAULT 100,
  "status" TEXT DEFAULT 'active',
  "lastActivity" DATETIME,
  "totalRequests" INTEGER DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "mcp_requests" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "connectionId" TEXT,
  "endpoint" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "payload" TEXT,
  "response" TEXT,
  "statusCode" INTEGER,
  "responseTime" INTEGER,
  "context" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "system_configs" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT,
  "description" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "scheduled_tasks" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "frequency" TEXT NOT NULL,
  "lastRun" DATETIME,
  "nextRun" DATETIME,
  "config" TEXT,
  "status" TEXT DEFAULT 'active',
  "lastResult" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS "pages_siteId_idx" ON "pages"("siteId");
CREATE INDEX IF NOT EXISTS "products_siteId_idx" ON "products"("siteId");
CREATE INDEX IF NOT EXISTS "products_status_idx" ON "products"("status");
CREATE INDEX IF NOT EXISTS "services_siteId_idx" ON "services"("siteId");
CREATE INDEX IF NOT EXISTS "dialogues_sessionId_idx" ON "dialogues"("sessionId");
CREATE INDEX IF NOT EXISTS "dialogues_visitorId_idx" ON "dialogues"("visitorId");
CREATE INDEX IF NOT EXISTS "visitor_analytics_visitorId_idx" ON "visitor_analytics"("visitorId");
CREATE INDEX IF NOT EXISTS "visitor_analytics_sessionId_idx" ON "visitor_analytics"("sessionId");
CREATE INDEX IF NOT EXISTS "mcp_connections_token_idx" ON "mcp_connections"("token");
CREATE INDEX IF NOT EXISTS "mcp_connections_status_idx" ON "mcp_connections"("status");
CREATE INDEX IF NOT EXISTS "mcp_requests_connectionId_idx" ON "mcp_requests"("connectionId");

-- Page unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "pages_siteId_slug_idx" ON "pages"("siteId", "slug");