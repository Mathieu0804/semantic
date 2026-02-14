'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Loader2, MoreHorizontal, Ban, RefreshCw, Smartphone, Monitor, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Connection {
  id: string;
  clientName?: string;
  clientType?: string;
  clientIp?: string;
  sessionId: string;
  status: string;
  totalRequests: number;
  lastActivity?: string;
  createdAt: string;
}

interface ConnectionListProps {
  refreshTrigger?: number;
}

export function ConnectionList({ refreshTrigger }: ConnectionListProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, [refreshTrigger]);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/mcp?type=connections');
      const data = await response.json();
      setConnections(data.connections || []);
    } catch {
      console.error('Failed to fetch connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (connectionId: string, status: string) => {
    try {
      await fetch('/api/mcp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, status })
      });
      toast.success(`Connexion ${status === 'suspended' ? 'suspendue' : 'reactivee'}`);
      fetchConnections();
    } catch {
      toast.error('Erreur lors de la mise a jour');
    }
  };

  const handleRevoke = async (connectionId: string) => {
    try {
      await fetch(`/api/mcp?id=${connectionId}`, { method: 'DELETE' });
      toast.success('Connexion revoquee');
      fetchConnections();
    } catch {
      toast.error('Erreur lors de la revocation');
    }
  };

  const getClientIcon = (type?: string) => {
    switch (type) {
      case 'phone':
        return <Smartphone className="h-4 w-4" />;
      case 'computer':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: 'Actif', className: 'bg-green-500/10 text-green-500' },
      suspended: { label: 'Suspendu', className: 'bg-yellow-500/10 text-yellow-500' },
      revoked: { label: 'Revoque', className: 'bg-red-500/10 text-red-500' }
    };
    const variant = variants[status] || variants.active;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexions actives</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune connexion active
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Requetes</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Derniere activite</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((conn) => (
                  <TableRow key={conn.id}>
                    <TableCell className="font-medium">
                      {conn.clientName || 'Anonyme'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getClientIcon(conn.clientType)}
                        <span className="capitalize">{conn.clientType || 'assistant'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {conn.clientIp || '-'}
                    </TableCell>
                    <TableCell>{conn.totalRequests}</TableCell>
                    <TableCell>{getStatusBadge(conn.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {conn.lastActivity ? formatDate(conn.lastActivity) : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {conn.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(conn.id, 'suspended')}>
                              <Ban className="h-4 w-4 mr-2" />
                              Suspendre
                            </DropdownMenuItem>
                          )}
                          {conn.status === 'suspended' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(conn.id, 'active')}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reactiver
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleRevoke(conn.id)}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Revoquer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
