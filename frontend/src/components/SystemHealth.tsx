import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Activity, Database, Clock, HardDrive, Users, Car, RefreshCw, Wifi, Server, Cpu } from 'lucide-react';

interface HealthMetrics {
  server: {
    status: string;
    uptime: number;
    uptimeFormatted: string;
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  database: {
    status: string;
    latencyMs: number;
    host: string;
    name: string;
  };
  api: {
    avgLatencyMs: number;
    maxLatencyMs: number;
    p95LatencyMs: number;
    totalSamples: number;
  };
  memory: {
    totalMB: number;
    freeMB: number;
    usedPercent: number;
    heapUsedMB: number;
    heapTotalMB: number;
  };
  collections: {
    vehicles: number;
    users: number;
  };
}

const SystemHealth = () => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/health/metrics');
      setMetrics(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-20 text-foreground/50">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span className="font-body font-medium">Loading system metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-center text-red-600 font-bold">
        {error}
      </div>
    );
  }

  if (!metrics) return null;

  const getLatencyColor = (ms: number) => {
    if (ms < 50) return 'text-green-600';
    if (ms < 150) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getLatencyBarWidth = (ms: number) => {
    return Math.min(100, (ms / 200) * 100);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Connected' || status === 'Healthy') return 'bg-green-400 border-green-600';
    if (status === 'Connecting') return 'bg-yellow-400 border-yellow-600';
    return 'bg-red-400 border-red-600';
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Refresh Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={20} strokeWidth={2.5} className="text-accent" />
          <h2 className="font-heading font-bold text-xl text-foreground">System Health Monitor</h2>
        </div>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-1.5 text-sm font-bold text-foreground border-2 border-foreground bg-white rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_#1E293B] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E293B] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B]"
        >
          <RefreshCw size={14} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Top Row: Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Server Status */}
        <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-accent rounded-full border-2 border-foreground flex items-center justify-center">
              <Server size={16} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="font-heading font-bold text-sm uppercase tracking-wider text-foreground/60">Server</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-3 h-3 rounded-full border-2 ${getStatusColor(metrics.server.status)}`}></span>
            <span className="font-heading font-extrabold text-lg text-foreground">{metrics.server.status}</span>
          </div>
          <div className="text-xs font-body text-foreground/50 space-y-0.5">
            <p>Uptime: <span className="font-bold text-foreground">{metrics.server.uptimeFormatted}</span></p>
            <p>Node: <span className="font-bold text-foreground">{metrics.server.nodeVersion}</span></p>
            <p>Platform: <span className="font-bold text-foreground">{metrics.server.platform} ({metrics.server.arch})</span></p>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-secondary rounded-full border-2 border-foreground flex items-center justify-center">
              <Database size={16} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="font-heading font-bold text-sm uppercase tracking-wider text-foreground/60">Database</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-3 h-3 rounded-full border-2 ${getStatusColor(metrics.database.status)}`}></span>
            <span className="font-heading font-extrabold text-lg text-foreground">{metrics.database.status}</span>
          </div>
          <div className="text-xs font-body text-foreground/50 space-y-0.5">
            <p>Ping: <span className={`font-bold ${getLatencyColor(metrics.database.latencyMs)}`}>{metrics.database.latencyMs}ms</span></p>
            <p>Host: <span className="font-bold text-foreground truncate">{metrics.database.host}</span></p>
            <p>DB: <span className="font-bold text-foreground">{metrics.database.name}</span></p>
          </div>
        </div>

        {/* WebSocket Status */}
        <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-tertiary rounded-full border-2 border-foreground flex items-center justify-center">
              <Wifi size={16} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="font-heading font-bold text-sm uppercase tracking-wider text-foreground/60">Real-Time</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full border-2 bg-green-400 border-green-600 animate-pulse"></span>
            <span className="font-heading font-extrabold text-lg text-foreground">Socket.IO Active</span>
          </div>
          <div className="text-xs font-body text-foreground/50 space-y-0.5">
            <p>Protocol: <span className="font-bold text-foreground">WebSocket (ws://)</span></p>
            <p>Events: <span className="font-bold text-foreground">inventory_updated, inventory_deleted</span></p>
            <p>Mode: <span className="font-bold text-foreground">Bidirectional</span></p>
          </div>
        </div>
      </div>

      {/* API Latency */}
      <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} strokeWidth={2.5} className="text-accent" />
          <span className="font-heading font-bold text-sm uppercase tracking-wider text-foreground/60">API Latency ({metrics.api.totalSamples} samples)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Avg */}
          <div>
            <p className="text-xs font-bold text-foreground/40 mb-1 uppercase">Avg Response</p>
            <p className={`text-3xl font-heading font-extrabold ${getLatencyColor(metrics.api.avgLatencyMs)}`}>
              {metrics.api.avgLatencyMs}<span className="text-sm font-bold ml-1">ms</span>
            </p>
            <div className="w-full bg-border rounded-full h-2 mt-2 border border-foreground/10">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${getLatencyBarWidth(metrics.api.avgLatencyMs)}%` }}
              />
            </div>
          </div>
          {/* P95 */}
          <div>
            <p className="text-xs font-bold text-foreground/40 mb-1 uppercase">P95 Response</p>
            <p className={`text-3xl font-heading font-extrabold ${getLatencyColor(metrics.api.p95LatencyMs)}`}>
              {metrics.api.p95LatencyMs}<span className="text-sm font-bold ml-1">ms</span>
            </p>
            <div className="w-full bg-border rounded-full h-2 mt-2 border border-foreground/10">
              <div
                className="bg-secondary h-2 rounded-full transition-all duration-500"
                style={{ width: `${getLatencyBarWidth(metrics.api.p95LatencyMs)}%` }}
              />
            </div>
          </div>
          {/* Max */}
          <div>
            <p className="text-xs font-bold text-foreground/40 mb-1 uppercase">Max Response</p>
            <p className={`text-3xl font-heading font-extrabold ${getLatencyColor(metrics.api.maxLatencyMs)}`}>
              {metrics.api.maxLatencyMs}<span className="text-sm font-bold ml-1">ms</span>
            </p>
            <div className="w-full bg-border rounded-full h-2 mt-2 border border-foreground/10">
              <div
                className="bg-tertiary h-2 rounded-full transition-all duration-500"
                style={{ width: `${getLatencyBarWidth(metrics.api.maxLatencyMs)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Memory & Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Memory */}
        <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={18} strokeWidth={2.5} className="text-secondary" />
            <span className="font-heading font-bold text-sm uppercase tracking-wider text-foreground/60">Memory Usage</span>
          </div>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-foreground/50">System RAM</span>
              <span className="text-sm font-heading font-bold text-foreground">{metrics.memory.usedPercent}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-3 border border-foreground/10">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${metrics.memory.usedPercent > 85 ? 'bg-red-500' : metrics.memory.usedPercent > 60 ? 'bg-tertiary' : 'bg-green-500'}`}
                style={{ width: `${metrics.memory.usedPercent}%` }}
              />
            </div>
            <p className="text-xs text-foreground/40 mt-1 font-body">
              {metrics.memory.totalMB - metrics.memory.freeMB}MB / {metrics.memory.totalMB}MB
            </p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-foreground/50">Node.js Heap</span>
              <span className="text-sm font-heading font-bold text-foreground">
                {Math.round((metrics.memory.heapUsedMB / metrics.memory.heapTotalMB) * 100)}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-3 border border-foreground/10">
              <div
                className="bg-accent h-3 rounded-full transition-all duration-500"
                style={{ width: `${(metrics.memory.heapUsedMB / metrics.memory.heapTotalMB) * 100}%` }}
              />
            </div>
            <p className="text-xs text-foreground/40 mt-1 font-body">
              {metrics.memory.heapUsedMB}MB / {metrics.memory.heapTotalMB}MB
            </p>
          </div>
        </div>

        {/* Collections */}
        <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop p-5">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={18} strokeWidth={2.5} className="text-tertiary" />
            <span className="font-heading font-bold text-sm uppercase tracking-wider text-foreground/60">Database Collections</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background border-2 border-foreground rounded-xl">
              <div className="flex items-center gap-2">
                <Car size={18} strokeWidth={2.5} className="text-accent" />
                <span className="font-body font-bold text-sm">Vehicles</span>
              </div>
              <span className="font-heading font-extrabold text-2xl text-accent">{metrics.collections.vehicles}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background border-2 border-foreground rounded-xl">
              <div className="flex items-center gap-2">
                <Users size={18} strokeWidth={2.5} className="text-secondary" />
                <span className="font-body font-bold text-sm">Users</span>
              </div>
              <span className="font-heading font-extrabold text-2xl text-secondary">{metrics.collections.users}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
