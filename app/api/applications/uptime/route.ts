import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface RequestBody {
    timespan?: number;
    page?: number;
  }
  

const getTimeRange = (timespan: number) => {
  const now = new Date();
  switch (timespan) {
    case 1:
      return { 
        start: new Date(now.getTime() - 30 * 60 * 1000),
        interval: 'minute' 
      };
    case 2:
      return { 
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        interval: '3hour' 
      };
    case 3:
      return { 
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        interval: 'day' 
      };
    default:
      return { 
        start: new Date(now.getTime() - 30 * 60 * 1000),
        interval: 'minute' 
      };
  }
};

const generateIntervals = (timespan: number) => {
  const now = new Date();
  now.setSeconds(0, 0);
  
  switch (timespan) {
    case 1:
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setMinutes(d.getMinutes() - i);
        d.setSeconds(0, 0);
        return d;
      });
      
    case 2:
      return Array.from({ length: 56 }, (_, i) => {
        const d = new Date(now);
        d.setHours(d.getHours() - (i * 3));
        d.setMinutes(0, 0, 0);
        return d;
      });

    case 3:
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        return d;
      });

    default:
      return [];
  }
};

const getIntervalKey = (date: Date, timespan: number) => {
  const d = new Date(date);
  switch (timespan) {
    case 1:
      d.setSeconds(0, 0);
      return d.toISOString();
    case 2:
      d.setHours(Math.floor(d.getHours() / 3) * 3);
      d.setMinutes(0, 0, 0);
      return d.toISOString();
    case 3:
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    default:
      return d.toISOString();
  }
};

export async function POST(request: NextRequest) {
    try {
      const { timespan = 1, page = 1 }: RequestBody = await request.json();
      const itemsPerPage = 5;
      const skip = (page - 1) * itemsPerPage;
  
      // Get paginated and sorted applications
      const [applications, totalCount] = await Promise.all([
        prisma.application.findMany({
          skip,
          take: itemsPerPage,
          orderBy: { name: 'asc' }
        }),
        prisma.application.count()
      ]);
  
      const applicationIds = applications.map(app => app.id);
      
      // Get time range and intervals
      const { start } = getTimeRange(timespan);
      const intervals = generateIntervals(timespan);
  
      // Get uptime history for the filtered applications
      const uptimeHistory = await prisma.uptime_history.findMany({
        where: {
          applicationId: { in: applicationIds },
          createdAt: { gte: start }
        },
        orderBy: { createdAt: "desc" }
      });
  
      // Process data for each application
      const result = applications.map(app => {
        const appChecks = uptimeHistory.filter(check => check.applicationId === app.id);
        const checksMap = new Map<string, { failed: number; total: number }>();
  
        for (const check of appChecks) {
          const intervalKey = getIntervalKey(check.createdAt, timespan);
          const current = checksMap.get(intervalKey) || { failed: 0, total: 0 };
          current.total++;
          if (!check.online) current.failed++;
          checksMap.set(intervalKey, current);
        }
  
        const uptimeSummary = intervals.map(interval => {
          const intervalKey = getIntervalKey(interval, timespan);
          const stats = checksMap.get(intervalKey);
          
          return {
            timestamp: intervalKey,
            missing: !stats,
            online: stats ? (stats.failed / stats.total) <= 0.5 : null
          };
        });
  
        return {
          appName: app.name,
          appId: app.id,
          uptimeSummary
        };
      });
  
      return NextResponse.json({
        data: result,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / itemsPerPage),
          totalItems: totalCount
        }
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }