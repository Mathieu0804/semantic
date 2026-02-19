import { useState } from "react"

const NODES = {
  // ── ENTRÉES (canaux entrants) ──────────────────────────────────────────
  whatsapp: { id: "whatsapp", label: "WhatsApp", icon: "💬", group: "canal", color: "#25D366", x: 60, y: 180, desc: "Propriétaire ou client envoie un message. L'IA interprète et agit. Ex: 'pain épuisé, update stock' ou 'vous ouvrez dimanche ?'" },
  email_in: { id: "email_in", label: "Email entrant", icon: "📧", group: "canal", color: "#EA4335", x: 60, y: 280, desc: "Emails clients analysés automatiquement. Classification : info / devis / commande / réclamation. Réponse auto pour les cas simples." },
  voice: { id: "voice", label: "Appel → Voix", icon: "🎙️", group: "canal", color: "#FF6B35", x: 60, y: 380, desc: "Appel entrant → Twilio capte → Speech-to-Text → IA agit → Text-to-Speech répond. Le propriétaire peut gérer son entreprise en parlant." },
  web_ui: { id: "web_ui", label: "Interface Web", icon: "💻", group: "canal", color: "#6366F1", x: 60, y: 480, desc: "Le dashboard conversationnel. Pas de formulaires. L'utilisateur parle, l'IA agit via le client IA local (port 8001)." },
  ia_externe: { id: "ia_externe", label: "IA Externes\nChatGPT · Claude\nGemini", icon: "🤖", group: "canal", color: "#8B5CF6", x: 60, y: 580, desc: "ChatGPT, Claude, Gemini interrogent le serveur MCP pour répondre à leurs utilisateurs sur votre entreprise. Vous contrôlez les réponses." },
  agent_a2a: { id: "agent_a2a", label: "Agents A2A\nCommandes auto", icon: "⚡", group: "canal", color: "#F59E0B", x: 60, y: 680, desc: "Agents IA de fournisseurs ou clients B2B. Passent des commandes ou réservations automatiques sans humain. Vous validez en 1 clic." },

  // ── CLIENT IA LOCAL (intermédiaire) ────────────────────────────────────
  ai_local: { id: "ai_local", label: "Client IA Local\n(port 8001)", icon: "🧠", group: "ai", color: "#EC4899", x: 320, y: 420, desc: "Le cerveau local. Traduit le langage naturel en appels MCP. Connaît tous les outils disponibles. Utilise Gemini (API) ou Ollama (100% local)." },

  // ── SERVEUR MCP CENTRAL ────────────────────────────────────────────────
  mcp: { id: "mcp", label: "Serveur MCP\n(port 8000)", icon: "⚙️", group: "mcp", color: "#10B981", x: 580, y: 420, desc: "Le chef d'orchestre. 20+ outils MCP. Chaque outil = 1 capacité métier. Protocole universel lu par toutes les IA." },

  // ── OUTILS MCP (capacités) ─────────────────────────────────────────────
  tool_produit: { id: "tool_produit", label: "Catalogue\nProduits/Services", icon: "📦", group: "tool", color: "#3B82F6", x: 820, y: 200, desc: "Ajouter, modifier, supprimer, lister produits et services. Chaque modification déclenche la régénération SEO automatique." },
  tool_agenda: { id: "tool_agenda", label: "Agenda &\nRéservations", icon: "📅", group: "tool", color: "#3B82F6", x: 820, y: 310, desc: "Créer/voir/modifier des réservations. Calcule le taux de remplissage et génère des signaux de rareté pour les réseaux sociaux." },
  tool_rarete: { id: "tool_rarete", label: "Rareté Sociale\n'2 places restantes'", icon: "🔥", group: "tool", color: "#EF4444", x: 820, y: 420, desc: "Génère automatiquement des messages de rareté quand les créneaux se remplissent. Publie sur Instagram, Facebook, LinkedIn." },
  tool_seo: { id: "tool_seo", label: "SEO Auto\n+ JSON-LD", icon: "🌐", group: "tool", color: "#3B82F6", x: 820, y: 530, desc: "Lit TOUTE la BDD et régénère automatiquement les pages web avec JSON-LD riche, méta-tags, sitemap. Déclenché à chaque changement." },
  tool_social: { id: "tool_social", label: "Réseaux Sociaux\nFB·IG·LI·TW·YT", icon: "📱", group: "tool", color: "#3B82F6", x: 820, y: 640, desc: "Génère et publie sur Facebook, Instagram, LinkedIn, Twitter, YouTube. Dans votre ton. Rédaction IA + publication API." },
  tool_stock: { id: "tool_stock", label: "Stock &\nFournisseurs", icon: "🏭", group: "tool", color: "#3B82F6", x: 820, y: 750, desc: "Surveille les stocks. Si bas → commande auto chez le fournisseur (via MCP A2A, email ou WhatsApp). Alerte si pas de fournisseur configuré." },
  tool_email: { id: "tool_email", label: "Email Auto\nDevis · Réponses", icon: "✉️", group: "tool", color: "#3B82F6", x: 820, y: 850, desc: "Analyse les emails entrants, classe et répond automatiquement aux questions simples. Escalade vers humain pour devis/réclamations." },
  tool_voix: { id: "tool_voix", label: "Identité & Voix\nde marque", icon: "🎙️", group: "tool", color: "#3B82F6", x: 820, y: 100, desc: "Contrôle comment TOUTES les IA parlent de vous. Ton, valeurs, mots interdits, style. Les réponses des chatbots reflètent votre personnalité." },

  // ── BASE DE DONNÉES ────────────────────────────────────────────────────
  db: { id: "db", label: "Base de données\nSQLite / PostgreSQL", icon: "🗄️", group: "db", color: "#6B7280", x: 1050, y: 420, desc: "La mémoire de tout. Entreprise, Produits, Services, Clients, Réservations, FAQ, Posts, Transactions A2A, Logs IA. Source de vérité unique." },

  // ── SORTIES ────────────────────────────────────────────────────────────
  site_web: { id: "site_web", label: "Site Web\n+ JSON-LD", icon: "🌍", group: "output", color: "#14B8A6", x: 1280, y: 200, desc: "Pages HTML régénérées automatiquement. JSON-LD Schema.org complet. Balise MCP Discovery. Toujours à jour depuis la BDD." },
  reseaux: { id: "reseaux", label: "Réseaux Sociaux\n(publication)", icon: "📲", group: "output", color: "#14B8A6", x: 1280, y: 380, desc: "Posts publiés automatiquement. Messages de rareté. Réponses aux commentaires (futur). Planning éditorial IA." },
  fournisseurs: { id: "fournisseurs", label: "Fournisseurs\n(commande A2A)", icon: "🚚", group: "output", color: "#14B8A6", x: 1280, y: 560, desc: "Commandes automatiques quand stock bas. Via MCP si fournisseur connecté, sinon email ou WhatsApp." },
}

const EDGES = [
  // Canaux → AI local
  { from: "whatsapp", to: "ai_local" },
  { from: "email_in", to: "ai_local" },
  { from: "voice", to: "ai_local" },
  { from: "web_ui", to: "ai_local" },
  // IA externes → MCP directement
  { from: "ia_externe", to: "mcp", dashed: true, color: "#8B5CF6" },
  { from: "agent_a2a", to: "mcp", dashed: true, color: "#F59E0B" },
  // AI local → MCP
  { from: "ai_local", to: "mcp", thick: true, color: "#EC4899" },
  // MCP → Tools
  { from: "mcp", to: "tool_voix" },
  { from: "mcp", to: "tool_produit" },
  { from: "mcp", to: "tool_agenda" },
  { from: "mcp", to: "tool_rarete" },
  { from: "mcp", to: "tool_seo" },
  { from: "mcp", to: "tool_social" },
  { from: "mcp", to: "tool_stock" },
  { from: "mcp", to: "tool_email" },
  // Tools → DB
  { from: "tool_produit", to: "db" },
  { from: "tool_agenda", to: "db" },
  { from: "tool_stock", to: "db" },
  { from: "tool_email", to: "db" },
  { from: "tool_rarete", to: "db", dashed: true },
  { from: "tool_seo", to: "db", dashed: true },
  // DB → outputs (lecture)
  { from: "db", to: "site_web", color: "#14B8A6" },
  // Tools → outputs directs
  { from: "tool_social", to: "reseaux", color: "#14B8A6" },
  { from: "tool_rarete", to: "reseaux", color: "#EF4444" },
  { from: "tool_stock", to: "fournisseurs", color: "#14B8A6" },
  { from: "tool_seo", to: "site_web", color: "#14B8A6" },
]

const GROUPS = {
  canal: { label: "Canaux d'entrée", color: "#1E1E30" },
  ai: { label: "IA Locale", color: "#2D1B2D" },
  mcp: { label: "Serveur MCP", color: "#1B2D1E" },
  tool: { label: "Outils MCP", color: "#1B1B2D" },
  db: { label: "Base de données", color: "#2D2D1B" },
  output: { label: "Sorties", color: "#1B2D2D" },
}

export default function EcosystemMap() {
  const [selected, setSelected] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const [filter, setFilter] = useState("all")
  const [showGuide, setShowGuide] = useState(false)

  const nodes = Object.values(NODES)
  const w = 1400, h = 980

  const getNode = (id) => NODES[id]

  const visibleNodes = filter === "all" ? nodes : nodes.filter(n => n.group === filter || n.group === "mcp" || n.group === "db")

  const selectedNode = selected ? NODES[selected] : null

  return (
    <div style={{ background: "#080810", minHeight: "100vh", fontFamily: "'IBM Plex Mono', monospace", color: "#E8E6F0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "rgba(8,8,16,0.98)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#10B981,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🗺️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>PME Brain — Carte de l'Écosystème Complet</div>
            <div style={{ fontSize: 10, color: "#4B5563" }}>Cliquez sur un nœud pour voir le détail · Filtrez par couche</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["all","Tout"],["canal","Canaux"],["tool","Outils MCP"],["output","Sorties"]].map(([f,l]) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid", fontSize: 11, cursor: "pointer", background: filter===f ? "#10B981" : "transparent", borderColor: filter===f ? "#10B981" : "#374151", color: filter===f ? "#fff" : "#9CA3AF", fontFamily: "inherit" }}>{l}</button>
          ))}
          <button onClick={() => setShowGuide(!showGuide)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #6366F1", fontSize: 11, cursor: "pointer", background: showGuide ? "#6366F1" : "transparent", color: showGuide ? "#fff" : "#818CF8", fontFamily: "inherit" }}>📖 Créer un outil</button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        {/* SVG Map */}
        <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
          <svg width={w} height={h} style={{ display: "block" }}>
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
              </pattern>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.3)"/>
              </marker>
              {["#EC4899","#8B5CF6","#F59E0B","#14B8A6","#EF4444","#10B981"].map(c => (
                <marker key={c} id={`arrow-${c.replace("#","")}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill={c}/>
                </marker>
              ))}
            </defs>
            <rect width={w} height={h} fill="url(#grid)"/>

            {/* Zone labels */}
            {[
              { x: 20, y: 120, label: "CANAUX D'ENTRÉE", color: "#374151" },
              { x: 270, y: 340, label: "IA LOCALE", color: "#4B2D4B" },
              { x: 520, y: 340, label: "SERVEUR MCP", color: "#1B3D2A" },
              { x: 760, y: 60, label: "OUTILS MCP (capacités)", color: "#1B1B3D" },
              { x: 1020, y: 340, label: "BASE DE DONNÉES", color: "#3D3D1B" },
              { x: 1230, y: 120, label: "SORTIES", color: "#1B3D3D" },
            ].map((z, i) => (
              <g key={i}>
                <text x={z.x} y={z.y} fill={z.color} fontSize={10} fontFamily="IBM Plex Mono" letterSpacing={2} fontWeight={600}>{z.label}</text>
              </g>
            ))}

            {/* Edges */}
            {EDGES.map((e, i) => {
              const from = NODES[e.from]
              const to = NODES[e.to]
              if (!from || !to) return null
              const x1 = from.x + 80, y1 = from.y + 25
              const x2 = to.x, y2 = to.y + 25
              const mx = (x1 + x2) / 2
              const color = e.color || "rgba(255,255,255,0.15)"
              const isHovered = hoveredEdge === i
              const arrowId = e.color ? `arrow-${e.color.replace("#","")}` : "arrow"
              return (
                <path
                  key={i}
                  d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={isHovered ? "#fff" : color}
                  strokeWidth={e.thick ? 3 : isHovered ? 2 : 1.5}
                  strokeDasharray={e.dashed ? "6,4" : "none"}
                  markerEnd={`url(#${arrowId})`}
                  opacity={filter !== "all" && e.from !== filter && e.to !== filter ? 0.1 : 1}
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={() => setHoveredEdge(i)}
                  onMouseLeave={() => setHoveredEdge(null)}
                />
              )
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const isSelected = selected === node.id
              const isFiltered = filter !== "all" && node.group !== filter && node.group !== "mcp" && node.group !== "db"
              return (
                <g key={node.id} onClick={() => setSelected(isSelected ? null : node.id)} style={{ cursor: "pointer" }} opacity={isFiltered ? 0.2 : 1}>
                  {/* Glow */}
                  {isSelected && (
                    <ellipse cx={node.x + 80} cy={node.y + 25} rx={90} ry={35} fill={node.color} opacity={0.15}/>
                  )}
                  {/* Box */}
                  <rect
                    x={node.x} y={node.y}
                    width={160} height={50}
                    rx={10}
                    fill={isSelected ? node.color + "22" : "#13131F"}
                    stroke={isSelected ? node.color : "rgba(255,255,255,0.1)"}
                    strokeWidth={isSelected ? 2 : 1}
                    style={{ transition: "all 0.2s", filter: isSelected ? `drop-shadow(0 0 10px ${node.color})` : "none" }}
                  />
                  {/* Icon */}
                  <text x={node.x + 12} y={node.y + 30} fontSize={18}>{node.icon}</text>
                  {/* Label */}
                  {node.label.split("\n").map((line, i) => (
                    <text key={i} x={node.x + 40} y={node.y + 20 + i * 15} fontSize={10} fill={isSelected ? node.color : "#D1D5DB"} fontFamily="IBM Plex Mono" fontWeight={isSelected ? 700 : 400}>{line}</text>
                  ))}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Panneau latéral */}
        <div style={{ width: 320, background: "#0D0D1A", borderLeft: "1px solid rgba(255,255,255,0.07)", padding: 20, overflowY: "auto", flexShrink: 0 }}>
          {showGuide ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, color: "#818CF8" }}>📖 Créer un Outil MCP</div>
              {[
                { n: "1. Identifier le besoin", d: "1 besoin métier = 1 outil. Ex: 'gérer les réservations' → 3 outils séparés." },
                { n: "2. Définir les paramètres", d: "Obligatoires (sans défaut) / Optionnels (avec défaut). L'outil demande les infos manquantes." },
                { n: "3. Écrire la docstring", d: "Les IA lisent cette description pour choisir l'outil. 'Quand appeler:' est crucial." },
                { n: "4. Retourner {success, message, data}", d: "Toujours ce format. L'IA locale lit 'message' pour synthétiser la réponse." },
                { n: "5. Ajouter au MCP_TOOLS_CATALOG", d: "Dans local_ai_client.py. 5 lignes. Immédiatement utilisable en langage naturel." },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: "2px solid #6366F1" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#818CF8", marginBottom: 4 }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.6 }}>{s.d}</div>
                </div>
              ))}
              <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, padding: 14, marginTop: 8 }}>
                <div style={{ fontSize: 10, color: "#818CF8", marginBottom: 6, fontWeight: 700 }}>TEMPLATE</div>
                <pre style={{ fontSize: 9, color: "#9CA3AF", lineHeight: 1.6, overflow: "auto" }}>{`@mcp.tool()
async def mon_outil(
  param: str,
  optionnel: str = ""
) -> Dict:
  """
  Description.
  Quand appeler: "..."
  """
  if not param:
    return {
      "success": False,
      "question_immediate": "?"
    }
  # logique...
  return {
    "success": True,
    "message": "✓ Fait"
  }`}</pre>
              </div>
            </div>
          ) : selectedNode ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: selectedNode.color + "22", border: `2px solid ${selectedNode.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{selectedNode.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedNode.color }}>{selectedNode.label.replace("\n", " ")}</div>
                  <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>{GROUPS[selectedNode.group]?.label}</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.7, marginBottom: 16 }}>{selectedNode.desc}</p>

              {/* Connexions */}
              <div style={{ fontSize: 11, color: "#4B5563", marginBottom: 8, fontWeight: 600 }}>CONNEXIONS</div>
              {EDGES.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((e, i) => {
                const other = NODES[e.from === selectedNode.id ? e.to : e.from]
                const isOut = e.from === selectedNode.id
                if (!other) return null
                return (
                  <div key={i} onClick={() => setSelected(other.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 4, cursor: "pointer" }}>
                    <span style={{ fontSize: 12 }}>{isOut ? "→" : "←"}</span>
                    <span style={{ fontSize: 11 }}>{other.icon}</span>
                    <span style={{ fontSize: 11, color: "#D1D5DB" }}>{other.label.split("\n")[0]}</span>
                  </div>
                )
              })}

              {/* Variables .env si applicable */}
              {["whatsapp","email_in","voice","tool_social","tool_stock"].includes(selectedNode.id) && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: "#4B5563", marginBottom: 8, fontWeight: 600 }}>VARIABLES .ENV REQUISES</div>
                  <div style={{ background: "#0A0A14", borderRadius: 8, padding: 12, fontSize: 10, color: "#6B7280", fontFamily: "monospace" }}>
                    {selectedNode.id === "whatsapp" && "TWILIO_ACCOUNT_SID\nTWILIO_AUTH_TOKEN\nTWILIO_WHATSAPP_FROM\nOWNER_PHONE"}
                    {selectedNode.id === "email_in" && "COMPANY_EMAIL\nSENDGRID_API_KEY\n# ou SMTP_HOST, SMTP_USER\nEMAIL_AUTO_REPLY_TYPES"}
                    {selectedNode.id === "voice" && "TWILIO_ACCOUNT_SID\nOPENAI_API_KEY (Whisper)\nELEVENLABS_API_KEY (TTS)"}
                    {selectedNode.id === "tool_social" && "META_PAGE_ACCESS_TOKEN\nMETA_PAGE_ID\nINSTAGRAM_ACCOUNT_ID\nLINKEDIN_ACCESS_TOKEN\nTWITTER_BEARER_TOKEN"}
                    {selectedNode.id === "tool_stock" && "# Configurer dans BDD:\n# Fournisseur.mcp_url\n# Fournisseur.email\n# Produit.stock_minimum"}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "#10B981" }}>🗺️ Carte de l'Écosystème</div>
              <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>Cliquez sur n'importe quel nœud pour voir son rôle, ses connexions et sa configuration.</p>

              <div style={{ fontSize: 11, color: "#4B5563", marginBottom: 10, fontWeight: 600 }}>LÉGENDE</div>
              {[
                { color: "#6366F1", label: "Canaux d'entrée — Tous les points de contact" },
                { color: "#EC4899", label: "IA Locale — Interprète le langage naturel" },
                { color: "#10B981", label: "Serveur MCP — Chef d'orchestre central" },
                { color: "#3B82F6", label: "Outils MCP — Les capacités métier" },
                { color: "#6B7280", label: "Base de données — Source de vérité" },
                { color: "#14B8A6", label: "Sorties — Web, Réseaux, Fournisseurs" },
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, flexShrink: 0 }}/>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{l.label}</span>
                </div>
              ))}

              <div style={{ marginTop: 20, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>⚡ Principe clé</div>
                <p style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.7, margin: 0 }}>
                  Tout passe par le <strong style={{color:"#10B981"}}>Serveur MCP central</strong>. Les canaux changent (WhatsApp, email, voix), les outils évoluent, la DB s'enrichit — mais le protocole MCP reste stable. Un seul endroit à maintenir.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
