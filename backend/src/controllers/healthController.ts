// backend/src/controllers/healthController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import os from 'os';

const startTime = Date.now();

// Track API latency samples
const latencySamples: number[] = [];
const MAX_SAMPLES = 100;

export const trackLatency = (latencyMs: number) => {
  latencySamples.push(latencyMs);
  if (latencySamples.length > MAX_SAMPLES) {
    latencySamples.shift();
  }
};

/**
 * GET /api/health/metrics
 * Returns system health metrics for the admin dashboard
 */
export const getHealthMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    const uptimeMs = now - startTime;

    // ── Database health ──
    const dbState = mongoose.connection.readyState;
    const dbStateMap: Record<number, string> = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    // Measure a real DB round-trip
    const dbPingStart = Date.now();
    await mongoose.connection.db?.admin().ping();
    const dbLatency = Date.now() - dbPingStart;

    // ── Compute API latency stats ──
    const avgLatency = latencySamples.length > 0
      ? Math.round(latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length)
      : 0;
    const maxLatency = latencySamples.length > 0
      ? Math.max(...latencySamples)
      : 0;
    const p95Latency = latencySamples.length > 0
      ? latencySamples.sort((a, b) => a - b)[Math.floor(latencySamples.length * 0.95)]
      : 0;

    // ── System metrics ──
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

    // ── Get collection stats ──
    const vehicleCount = await mongoose.connection.db?.collection('vehicles').countDocuments() || 0;
    const userCount = await mongoose.connection.db?.collection('users').countDocuments() || 0;

    res.status(200).json({
      success: true,
      data: {
        server: {
          status: 'Healthy',
          uptime: uptimeMs,
          uptimeFormatted: formatUptime(uptimeMs),
          nodeVersion: process.version,
          platform: os.platform(),
          arch: os.arch(),
        },
        database: {
          status: dbStateMap[dbState] || 'Unknown',
          latencyMs: dbLatency,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
        },
        api: {
          avgLatencyMs: avgLatency,
          maxLatencyMs: maxLatency,
          p95LatencyMs: p95Latency,
          totalSamples: latencySamples.length,
        },
        memory: {
          totalMB: Math.round(totalMem / 1024 / 1024),
          freeMB: Math.round(freeMem / 1024 / 1024),
          usedPercent: usedMemPercent,
          heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        collections: {
          vehicles: vehicleCount,
          users: userCount,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch health metrics',
    });
  }
};

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}
