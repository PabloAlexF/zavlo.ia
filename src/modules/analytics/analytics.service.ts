import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import { RedisService } from '../../config/redis.service';

interface SearchLog {
  userId: string;
  query: string;
  type: 'text' | 'image';
  sources: string[];
  responseTime: number;
  success: boolean;
  resultsCount: number;
  timestamp: Date;
  location?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private firebaseService: FirebaseService,
    private redisService: RedisService,
  ) {}

  async logSearch(searchData: SearchLog): Promise<void> {
    try {
      await this.firebaseService.getFirestore()
        .collection('search_logs')
        .add({
          ...searchData,
          timestamp: new Date(),
        });

      // Cache metrics for quick access
      const key = `metrics:${new Date().toISOString().split('T')[0]}`;
      await this.redisService.hIncrBy(key, 'total_searches', 1);
      await this.redisService.hIncrBy(key, `${searchData.type}_searches`, 1);
      await this.redisService.expire(key, 86400 * 7); // 7 days
    } catch (error) {
      console.error('Error logging search:', error);
    }
  }

  async getSearchMetrics(days: number = 7, userId?: string): Promise<any> {
    const metrics = {
      totalSearches: 0,
      textSearches: 0,
      imageSearches: 0,
      avgResponseTime: 0,
      successRate: 0,
      topSources: {},
      dailyStats: [],
    };

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      let query: any = this.firebaseService.getFirestore()
        .collection('search_logs')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate);

      if (userId) {
        query = query.where('userId', '==', userId);
      }

      const snapshot = await query.get();

      const logs = snapshot.docs.map(doc => doc.data() as SearchLog);

      metrics.totalSearches = logs.length;
      metrics.textSearches = logs.filter(log => log.type === 'text').length;
      metrics.imageSearches = logs.filter(log => log.type === 'image').length;
      
      if (logs.length > 0) {
        metrics.avgResponseTime = logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length;
        metrics.successRate = (logs.filter(log => log.success).length / logs.length) * 100;
      }

      const groupedByDay = new Map<string, { date: string; searches: number; text: number; image: number }>();
      for (let offset = days - 1; offset >= 0; offset -= 1) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - offset);
        const key = date.toISOString().slice(0, 10);
        groupedByDay.set(key, { date: key, searches: 0, text: 0, image: 0 });
      }

      logs.forEach((log) => {
        const rawTimestamp: any = log.timestamp;
        const date = rawTimestamp instanceof Date
          ? rawTimestamp
          : rawTimestamp?._seconds
          ? new Date(rawTimestamp._seconds * 1000)
          : new Date(rawTimestamp);

        if (Number.isNaN(date.getTime())) return;

        const key = date.toISOString().slice(0, 10);
        const bucket = groupedByDay.get(key);
        if (!bucket) return;

        bucket.searches += 1;
        if (log.type === 'text') bucket.text += 1;
        if (log.type === 'image') bucket.image += 1;
      });

      metrics.dailyStats = Array.from(groupedByDay.values());

      // Top sources
      logs.forEach(log => {
        log.sources.forEach(source => {
          metrics.topSources[source] = (metrics.topSources[source] || 0) + 1;
        });
      });

      return metrics;
    } catch (error) {
      console.error('Error getting metrics:', error);
      return metrics;
    }
  }

  async getUserSearchHistory(userId: string, limit: number = 20): Promise<SearchLog[]> {
    try {
      const snapshot = await this.firebaseService.getFirestore()
        .collection('search_logs')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data() as SearchLog;
        return {
          ...data,
          timestamp: data.timestamp instanceof Date
            ? data.timestamp
            : (data.timestamp as any)?._seconds
            ? new Date((data.timestamp as any)._seconds * 1000)
            : new Date(),
        };
      });
    } catch (error) {
      console.error('Error getting user history:', error);
      return [];
    }
  }
}