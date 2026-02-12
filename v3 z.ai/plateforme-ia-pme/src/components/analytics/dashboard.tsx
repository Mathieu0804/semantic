'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  MessageSquare,
  Package,
  Eye,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Lightbulb,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Overview {
  totalProducts: number;
  totalServices: number;
  totalDialogues: number;
  totalVisitors: number;
  totalPatterns: number;
}

interface ChartData {
  dialoguesByDay: Array<{ date: string; count: number }>;
  deviceStats: Array<{ deviceType: string; count: number }>;
  topPages: Array<{ entryPage: string; count: number }>;
}

interface TopItems {
  products: Array<{ id: string; name: string; viewCount: number }>;
  services: Array<{ id: string; name: string; viewCount: number }>;
}

interface Pattern {
  id: string;
  type: string;
  description?: string;
  confidence?: number;
  frequency: number;
  status: string;
  createdAt: string;
}

interface Dialogue {
  id: string;
  type: string;
  userMessage?: string;
  aiResponse?: string;
  createdAt: string;
}

export function AnalyticsSection() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [topItems, setTopItems] = useState<TopItems | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, patternsRes, dialoguesRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/analytics?action=patterns'),
        fetch('/api/analytics?action=dialogues&limit=10'),
      ]);

      const overviewData = await overviewRes.json();
      const patternsData = await patternsRes.json();
      const dialoguesData = await dialoguesRes.json();

      setOverview(overviewData.overview);
      setChartData(overviewData.chartData);
      setTopItems(overviewData.topItems);
      setPatterns(patternsData.patterns || []);
      setDialogues(dialoguesData.dialogues || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzePatterns = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/analytics', { method: 'POST' });
      const data = await response.json();
      alert(`Analyse terminée: ${data.patternsCreated || 0} nouveaux patterns détectés`);
      fetchData();
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      alert('Erreur lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const getPatternTypeLabel = (type: string) => {
    switch (type) {
      case 'product_interest':
        return 'Intérêt produit';
      case 'service_demand':
        return 'Demande service';
      case 'navigation':
        return 'Navigation';
      case 'conversion':
        return 'Conversion';
      default:
        return type;
    }
  };

  const getPatternTypeColor = (type: string) => {
    switch (type) {
      case 'product_interest':
        return 'bg-blue-600';
      case 'service_demand':
        return 'bg-purple-600';
      case 'navigation':
        return 'bg-green-600';
      case 'conversion':
        return 'bg-yellow-600';
      default:
        return 'bg-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">Chargement des analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 overflow-y-auto max-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7" />
              Analytics & Patterns
            </h2>
            <p className="text-slate-400">
              Analysez le comportement des visiteurs et améliorez votre site
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchData}
              className="border-slate-600 text-slate-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button
              onClick={analyzePatterns}
              disabled={analyzing}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {analyzing ? 'Analyse...' : 'Analyser patterns'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Produits</p>
                  <p className="text-2xl font-bold text-white">{overview?.totalProducts || 0}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Services</p>
                  <p className="text-2xl font-bold text-white">{overview?.totalServices || 0}</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Dialogues</p>
                  <p className="text-2xl font-bold text-white">{overview?.totalDialogues || 0}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Visiteurs</p>
                  <p className="text-2xl font-bold text-white">{overview?.totalVisitors || 0}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Patterns</p>
                  <p className="text-2xl font-bold text-white">{overview?.totalPatterns || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Dialogues Chart */}
          <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Activité des dialogues</CardTitle>
              <CardDescription className="text-slate-400">
                Nombre de conversations par jour (30 derniers jours)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-1">
                {chartData?.dialoguesByDay && chartData.dialoguesByDay.length > 0 ? (
                  chartData.dialoguesByDay.slice(0, 30).map((day, i) => {
                    const maxCount = Math.max(...chartData.dialoguesByDay.map(d => d.count), 1);
                    const height = (day.count / maxCount) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${day.date}: ${day.count} dialogues`}
                      />
                    );
                  })
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400">
                    Aucune donnée
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Device Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Appareils</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData?.deviceStats && chartData.deviceStats.length > 0 ? (
                  chartData.deviceStats.map((device, i) => {
                    const total = chartData.deviceStats.reduce((acc, d) => acc + d.count, 0);
                    const percentage = Math.round((device.count / total) * 100);
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300 capitalize">{device.deviceType || 'Autre'}</span>
                          <span className="text-slate-400">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-center">Aucune donnée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Top Products/Services */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Les plus consultés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Produits</p>
                  {topItems?.products && topItems.products.length > 0 ? (
                    topItems.products.slice(0, 5).map((product, i) => (
                      <div key={product.id} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-sm">{i + 1}.</span>
                          <span className="text-white">{product.name}</span>
                        </div>
                        <Badge variant="secondary">{product.viewCount} vues</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">Aucun produit</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Services</p>
                  {topItems?.services && topItems.services.length > 0 ? (
                    topItems.services.slice(0, 5).map((service, i) => (
                      <div key={service.id} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-sm">{i + 1}.</span>
                          <span className="text-white">{service.name}</span>
                        </div>
                        <Badge variant="secondary">{service.viewCount} vues</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">Aucun service</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patterns Detected */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Patterns détectés
              </CardTitle>
              <CardDescription className="text-slate-400">
                Insights générés par l'IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.length > 0 ? (
                  patterns.slice(0, 5).map((pattern) => (
                    <div
                      key={pattern.id}
                      className="p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getPatternTypeColor(pattern.type)}>
                          {getPatternTypeLabel(pattern.type)}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {pattern.frequency}x
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">
                        {pattern.description || 'Pattern détecté'}
                      </p>
                      {pattern.confidence && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${pattern.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">
                            {Math.round(pattern.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">
                      Aucun pattern détecté. Cliquez sur "Analyser patterns" pour commencer.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Dialogues */}
        <Card className="bg-slate-800/50 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Dialogues récents</CardTitle>
            <CardDescription className="text-slate-400">
              Dernières interactions avec l'IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dialogues.length > 0 ? (
                dialogues.map((dialogue) => (
                  <div
                    key={dialogue.id}
                    className="p-4 rounded-lg bg-slate-700/30 border border-slate-700"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          dialogue.type === 'user'
                            ? "border-blue-500 text-blue-400"
                            : dialogue.type === 'mcp'
                            ? "border-purple-500 text-purple-400"
                            : "border-green-500 text-green-400"
                        )}
                      >
                        {dialogue.type === 'user' ? 'Utilisateur' : dialogue.type === 'mcp' ? 'MCP' : 'IA-to-IA'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(dialogue.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    {dialogue.userMessage && (
                      <p className="text-sm text-slate-300 mb-2">
                        <span className="text-slate-500">Utilisateur:</span> {dialogue.userMessage.substring(0, 200)}
                        {dialogue.userMessage.length > 200 && '...'}
                      </p>
                    )}
                    {dialogue.aiResponse && (
                      <p className="text-sm text-slate-400">
                        <span className="text-slate-500">IA:</span> {dialogue.aiResponse.substring(0, 200)}
                        {dialogue.aiResponse.length > 200 && '...'}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Aucun dialogue enregistré
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
