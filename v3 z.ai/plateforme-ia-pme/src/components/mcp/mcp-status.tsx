'use client';

import { useState, useEffect } from 'react';
import {
  Server,
  Play,
  Square,
  RefreshCw,
  Link2,
  Users,
  Activity,
  Copy,
  Check,
  AlertCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MCPStats {
  totalConnections: number;
  activeConnections: number;
  totalRequests: number;
  requestsToday: number;
}

interface Connection {
  id: string;
  clientName?: string;
  clientType?: string;
  sessionId: string;
  status: string;
  totalRequests: number;
  lastActivity?: string;
  createdAt: string;
}

interface Request {
  id: string;
  endpoint: string;
  method: string;
  statusCode?: number;
  responseTime?: number;
  createdAt: string;
}

export function MCPSection() {
  const [stats, setStats] = useState<MCPStats | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [mcpUrl, setMcpUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, statsRes, connectionsRes, requestsRes] = await Promise.all([
        fetch('/api/mcp'),
        fetch('/api/mcp?action=stats'),
        fetch('/api/mcp?action=connections'),
        fetch('/api/mcp?action=requests'),
      ]);

      const statusData = await statusRes.json();
      const statsData = await statsRes.json();
      const connectionsData = await connectionsRes.json();
      const requestsData = await requestsRes.json();

      setMcpEnabled(statusData.enabled || false);
      setMcpUrl(statusData.url || '');
      setStats(statsData);
      setConnections(connectionsData.connections || []);
      setRequests(requestsData.requests || []);
    } catch (error) {
      console.error('Error fetching MCP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMCP = async (enabled: boolean) => {
    try {
      await fetch('/api/mcp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcpEnabled: enabled }),
      });
      setMcpEnabled(enabled);
    } catch (error) {
      console.error('Error toggling MCP:', error);
    }
  };

  const updateUrl = async () => {
    try {
      await fetch('/api/mcp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcpServerUrl: mcpUrl }),
      });
    } catch (error) {
      console.error('Error updating MCP URL:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revokeConnection = async (sessionId: string) => {
    if (!confirm('Révoquer cette connexion ?')) return;
    try {
      await fetch(`/api/mcp?sessionId=${sessionId}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error revoking connection:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Actif</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-600">Suspendu</Badge>;
      case 'revoked':
        return <Badge className="bg-red-600">Révoqué</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getClientTypeIcon = (type?: string) => {
    switch (type) {
      case 'phone':
        return 'Téléphone';
      case 'computer':
        return 'Ordinateur';
      case 'assistant':
        return 'Assistant IA';
      default:
        return 'Client';
    }
  };

  return (
    <div className="p-4 md:p-6 overflow-y-auto max-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Server className="w-7 h-7" />
              Serveur MCP
            </h2>
            <p className="text-slate-400">
              Model Context Protocol - Permet aux IA externes de dialoguer avec votre IA locale
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchData}
            className="border-slate-600 text-slate-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Status Card */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Statut</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        mcpEnabled ? "bg-green-500 animate-pulse" : "bg-red-500"
                      )}
                    />
                    <span className="text-lg font-semibold text-white">
                      {mcpEnabled ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <Server className={cn("w-8 h-8", mcpEnabled ? "text-green-500" : "text-slate-500")} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Connexions actives</p>
                  <p className="text-2xl font-bold text-white">{stats?.activeConnections || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Requêtes aujourd'hui</p>
                  <p className="text-2xl font-bold text-white">{stats?.requestsToday || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total requêtes</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalRequests || 0}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configuration */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Configuration</CardTitle>
              <CardDescription className="text-slate-400">
                Activez et configurez votre serveur MCP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-300">Activer le serveur MCP</Label>
                  <p className="text-sm text-slate-500">
                    Permet aux IA externes de se connecter
                  </p>
                </div>
                <Switch
                  checked={mcpEnabled}
                  onCheckedChange={toggleMCP}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">URL du serveur MCP</Label>
                <div className="flex gap-2">
                  <Input
                    value={mcpUrl}
                    onChange={(e) => setMcpUrl(e.target.value)}
                    placeholder="https://mcp.votre-entreprise.com"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button onClick={updateUrl} className="bg-blue-600 hover:bg-blue-700">
                    OK
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Cette URL sera diffusée dans le SEO et le LD-JSON pour que les IA puissent vous trouver
                </p>
              </div>

              {mcpEnabled && (
                <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Point de terminaison API</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-green-400 bg-slate-800 px-3 py-2 rounded">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/api/mcp
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/mcp`)}
                      className="text-slate-400"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Comment ça marche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-white font-medium">Activation</p>
                    <p className="text-sm text-slate-400">
                      Activez le serveur MCP pour permettre les connexions externes
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-white font-medium">Diffusion SEO</p>
                    <p className="text-sm text-slate-400">
                      L'URL est automatiquement ajoutée au LD-JSON de votre site
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-white font-medium">Connexion IA</p>
                    <p className="text-sm text-slate-400">
                      Les IA de vos clients (Siri, Alexa, assistants) peuvent dialoguer avec votre IA
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="text-white font-medium">Analyse</p>
                    <p className="text-sm text-slate-400">
                      Toutes les interactions sont analysées pour améliorer vos services
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connections Table */}
        <Card className="bg-slate-800/50 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Connexions actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Client</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Statut</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Requêtes</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Dernière activité</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Aucune connexion
                      </td>
                    </tr>
                  ) : (
                    connections.map((conn) => (
                      <tr key={conn.id} className="border-b border-slate-700/50">
                        <td className="py-3 px-4 text-white">{conn.clientName || 'Anonyme'}</td>
                        <td className="py-3 px-4 text-slate-300">{getClientTypeIcon(conn.clientType)}</td>
                        <td className="py-3 px-4">{getStatusBadge(conn.status)}</td>
                        <td className="py-3 px-4 text-slate-300">{conn.totalRequests}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {conn.lastActivity
                            ? new Date(conn.lastActivity).toLocaleString('fr-FR')
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {conn.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revokeConnection(conn.sessionId)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Révoquer
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="bg-slate-800/50 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Requêtes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Endpoint</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Méthode</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Statut</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Temps</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        Aucune requête
                      </td>
                    </tr>
                  ) : (
                    requests.slice(0, 10).map((req) => (
                      <tr key={req.id} className="border-b border-slate-700/50">
                        <td className="py-3 px-4 text-white font-mono text-sm">{req.endpoint}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {req.method}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={cn(
                              req.statusCode && req.statusCode < 400
                                ? "bg-green-600"
                                : "bg-red-600"
                            )}
                          >
                            {req.statusCode || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{req.responseTime}ms</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(req.createdAt).toLocaleString('fr-FR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
