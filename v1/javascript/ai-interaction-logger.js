/**
 * MODULE : AI INTERACTION LOGGER
 * ===============================
 * 
 * RÔLE : Enregistrer et analyser les interactions IA avec la marque
 * 
 * RESPONSABILITÉS :
 * 1. Logger tous les accès à l'ADN de marque
 * 2. Enregistrer les recommandations faites par les IA
 * 3. Tracker les conversions (vues → achats)
 * 4. Générer des analytics pour mesurer l'efficacité
 * 5. Identifier les patterns d'utilisation
 * 
 * UTILITÉ BUSINESS :
 * - Mesurer le ROI du marketing sémantique
 * - Identifier les produits les plus recommandés
 * - Détecter les IA performantes vs inefficaces
 * - Optimiser les messages en fonction des résultats
 * - Détecter les comportements anormaux (scraping, spam)
 */

const fs = require('fs').promises;
const path = require('path');

class AIInteractionLogger {
    constructor() {
        this.logsPath = path.join(__dirname, '../data/logs/');
        this.currentLogFile = null;
        this.logBuffer = []; // Buffer en mémoire pour performance
        this.bufferSize = 100; // Flush après 100 entrées
        this.flushInterval = 60000; // ou toutes les 60 secondes
    }

    /**
     * MÉTHODE : initialize()
     * ----------------------
     * RÔLE : Initialiser le système de logging
     * 
     * ÉTAPES :
     * 1. Créer le répertoire de logs
     * 2. Initialiser le fichier de log du jour
     * 3. Démarrer le timer de flush automatique
     */
    async initialize() {
        try {
            await fs.mkdir(this.logsPath, { recursive: true });
            this.currentLogFile = this.getLogFileName();
            
            // Démarrer le flush automatique
            this.startAutoFlush();
            
            console.log('✅ AIInteractionLogger initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation AIInteractionLogger:', error);
        }
    }

    /**
     * MÉTHODE : logAccess()
     * ---------------------
     * RÔLE : Enregistrer un accès à l'ADN de marque
     * 
     * PARAMÈTRES : {
     *   type: 'dna_access' | 'product_access' | 'instructions_access',
     *   userAgent: string,
     *   ip: string,
     *   timestamp: Date
     * }
     * 
     * UTILISATION : Appelé à chaque fois qu'une IA récupère l'ADN
     * 
     * MÉTRIQUES MESURÉES :
     * - Nombre d'accès par jour/heure
     * - Identification des IA (via User-Agent)
     * - Fréquence d'actualisation
     */
    async logAccess(data) {
        const logEntry = {
            type: 'access',
            timestamp: data.timestamp || new Date(),
            accessType: data.type,
            userAgent: data.userAgent,
            ip: this.anonymizeIP(data.ip), // RGPD : anonymiser les IP
            metadata: {
                version: data.version || 'latest'
            }
        };

        this.addToBuffer(logEntry);
    }

    /**
     * MÉTHODE : logInteraction()
     * --------------------------
     * RÔLE : Enregistrer une interaction IA (recommandation, recherche, etc.)
     * 
     * PARAMÈTRES : {
     *   agentId: string,
     *   actionType: 'recommendation' | 'search' | 'purchase' | 'comparison',
     *   productId: string (optionnel),
     *   metadata: object (contexte supplémentaire)
     * }
     * 
     * UTILISATION : Appelé par l'IA après avoir utilisé l'ADN pour agir
     * 
     * MÉTRIQUES MESURÉES :
     * - Produits les plus recommandés
     * - Taux de conversion par IA
     * - Patterns de recommandation
     * - Efficacité des pitchs IA
     */
    async logInteraction(data) {
        const logEntry = {
            type: 'interaction',
            timestamp: data.timestamp || new Date(),
            agentId: data.agentId,
            actionType: data.actionType,
            productId: data.productId,
            metadata: data.metadata || {},
            sessionId: data.sessionId // Pour suivre le parcours complet
        };

        this.addToBuffer(logEntry);

        // Pour les achats, logger immédiatement (critique)
        if (data.actionType === 'purchase') {
            await this.flush();
        }
    }

    /**
     * MÉTHODE : logUpdate()
     * ---------------------
     * RÔLE : Enregistrer une modification de l'ADN de marque
     * 
     * PARAMÈTRES : {
     *   type: 'dna_update',
     *   admin: string (ID de l'admin),
     *   changes: array (diff des modifications),
     *   timestamp: Date
     * }
     * 
     * UTILISATION : Audit trail pour traçabilité
     */
    async logUpdate(data) {
        const logEntry = {
            type: 'update',
            timestamp: data.timestamp || new Date(),
            admin: data.admin,
            changes: data.changes,
            reason: data.reason || 'Non spécifié'
        };

        this.addToBuffer(logEntry);
        
        // Flush immédiatement pour les updates (audit critique)
        await this.flush();
    }

    /**
     * MÉTHODE : getAnalytics()
     * ------------------------
     * RÔLE : Générer des analytics à partir des logs
     * 
     * PARAMÈTRES : {
     *   startDate: Date,
     *   endDate: Date,
     *   metric: string (optionnel pour filtrer)
     * }
     * 
     * RETOUR : {
     *   totalInteractions: number,
     *   conversionRate: number,
     *   topProducts: array,
     *   agentPerformance: object,
     *   trends: object
     * }
     */
    async getAnalytics(params = {}) {
        const { startDate, endDate } = params;
        
        // Charger les logs de la période
        const logs = await this.loadLogsForPeriod(startDate, endDate);
        
        // Calculer les métriques
        const analytics = {
            period: {
                start: startDate,
                end: endDate
            },
            totalAccess: this.countByType(logs, 'access'),
            totalInteractions: this.countByType(logs, 'interaction'),
            conversionRate: this.calculateConversionRate(logs),
            topProducts: this.getTopProducts(logs, 10),
            agentPerformance: this.analyzeAgentPerformance(logs),
            actionBreakdown: this.getActionBreakdown(logs),
            trends: this.analyzeTrends(logs)
        };

        return analytics;
    }

    /**
     * MÉTHODES PRIVÉES - GESTION DU BUFFER
     */

    addToBuffer(logEntry) {
        this.logBuffer.push(logEntry);
        
        // Flush si buffer plein
        if (this.logBuffer.length >= this.bufferSize) {
            this.flush();
        }
    }

    async flush() {
        if (this.logBuffer.length === 0) return;

        try {
            const logFile = path.join(this.logsPath, this.currentLogFile);
            const logLines = this.logBuffer.map(entry => 
                JSON.stringify(entry)
            ).join('\n') + '\n';

            await fs.appendFile(logFile, logLines, 'utf-8');
            
            // Vider le buffer
            this.logBuffer = [];
        } catch (error) {
            console.error('Erreur lors du flush des logs:', error);
        }
    }

    startAutoFlush() {
        setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    /**
     * MÉTHODES PRIVÉES - ANALYTICS
     */

    async loadLogsForPeriod(startDate, endDate) {
        const start = new Date(startDate || Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = new Date(endDate || Date.now());
        
        const logs = [];
        
        // Générer la liste des fichiers de log à charger
        const logFiles = this.getLogFilesBetween(start, end);
        
        for (const file of logFiles) {
            try {
                const filePath = path.join(this.logsPath, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const lines = content.split('\n').filter(line => line.trim());
                
                lines.forEach(line => {
                    try {
                        const entry = JSON.parse(line);
                        const entryDate = new Date(entry.timestamp);
                        
                        if (entryDate >= start && entryDate <= end) {
                            logs.push(entry);
                        }
                    } catch (e) {
                        // Ligne invalide, ignorer
                    }
                });
            } catch (error) {
                // Fichier n'existe pas ou erreur, continuer
            }
        }
        
        return logs;
    }

    countByType(logs, type) {
        return logs.filter(log => log.type === type).length;
    }

    calculateConversionRate(logs) {
        const recommendations = logs.filter(log => 
            log.type === 'interaction' && log.actionType === 'recommendation'
        ).length;
        
        const purchases = logs.filter(log => 
            log.type === 'interaction' && log.actionType === 'purchase'
        ).length;
        
        return recommendations > 0 ? (purchases / recommendations) * 100 : 0;
    }

    getTopProducts(logs, limit = 10) {
        const productCounts = {};
        
        logs.filter(log => 
            log.type === 'interaction' && log.productId
        ).forEach(log => {
            productCounts[log.productId] = (productCounts[log.productId] || 0) + 1;
        });
        
        return Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([productId, count]) => ({ productId, count }));
    }

    analyzeAgentPerformance(logs) {
        const agentStats = {};
        
        logs.filter(log => 
            log.type === 'interaction' && log.agentId
        ).forEach(log => {
            if (!agentStats[log.agentId]) {
                agentStats[log.agentId] = {
                    totalInteractions: 0,
                    recommendations: 0,
                    purchases: 0,
                    searches: 0
                };
            }
            
            agentStats[log.agentId].totalInteractions++;
            
            if (log.actionType === 'recommendation') {
                agentStats[log.agentId].recommendations++;
            } else if (log.actionType === 'purchase') {
                agentStats[log.agentId].purchases++;
            } else if (log.actionType === 'search') {
                agentStats[log.agentId].searches++;
            }
        });
        
        // Calculer le taux de conversion par agent
        Object.keys(agentStats).forEach(agentId => {
            const stats = agentStats[agentId];
            stats.conversionRate = stats.recommendations > 0 
                ? (stats.purchases / stats.recommendations) * 100 
                : 0;
        });
        
        return agentStats;
    }

    getActionBreakdown(logs) {
        const actions = {};
        
        logs.filter(log => 
            log.type === 'interaction'
        ).forEach(log => {
            actions[log.actionType] = (actions[log.actionType] || 0) + 1;
        });
        
        return actions;
    }

    analyzeTrends(logs) {
        // Analyser les tendances par jour
        const dailyStats = {};
        
        logs.forEach(log => {
            const date = new Date(log.timestamp).toISOString().split('T')[0];
            
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    access: 0,
                    interactions: 0,
                    purchases: 0
                };
            }
            
            if (log.type === 'access') {
                dailyStats[date].access++;
            } else if (log.type === 'interaction') {
                dailyStats[date].interactions++;
                if (log.actionType === 'purchase') {
                    dailyStats[date].purchases++;
                }
            }
        });
        
        return dailyStats;
    }

    /**
     * MÉTHODES UTILITAIRES
     */

    getLogFileName() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}.log`;
    }

    getLogFilesBetween(start, end) {
        const files = [];
        const current = new Date(start);
        
        while (current <= end) {
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            files.push(`${year}-${month}-${day}.log`);
            
            current.setDate(current.getDate() + 1);
        }
        
        return files;
    }

    anonymizeIP(ip) {
        // RGPD : Anonymiser les IP en masquant le dernier octet
        if (!ip) return 'unknown';
        const parts = ip.split('.');
        if (parts.length === 4) {
            parts[3] = '0';
            return parts.join('.');
        }
        return ip;
    }
}

module.exports = AIInteractionLogger;
