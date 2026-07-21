import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://guzelhaberler.net';

  // Base routes for both languages
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/tr`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ];

  try {
    const supabase = createPublicClient();
    
    // Fetch the latest 100 news articles
    const { data: news } = await supabase
      .from('news')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (news && news.length > 0) {
      news.forEach((item) => {
        // Add TR route for the news item
        entries.push({
          url: `${baseUrl}/tr/news/${item.id}`,
          lastModified: new Date(item.created_at),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
        
        // Add EN route for the news item
        entries.push({
          url: `${baseUrl}/en/news/${item.id}`,
          lastModified: new Date(item.created_at),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.error('Error generating sitemap for news:', error);
  }

  return entries;
}
