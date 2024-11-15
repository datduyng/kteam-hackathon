
export type SearchImageResponse = {
  totalEstimatedMatches: number;
  nextOffset: number;
  currentOffset: number;
  value: Array<{
    name: string;
    datePublished: string;
    contentUrl: string;
    encodingFormat: string;
    width: number;
    height: number;
  }>;
}

export type WebSearchResponse = {
  orginic_results: Array<{
    link: string;
    name: string;
    snippet: string;
  }>;
}

export const imageSearch = async (query: string) => {
  return fetch('https://openai-gateway.vercel.app/api/websearch/image?query=' + query, {
    headers: {
      'x-api-key': process.env.GATEWAY_SERVER_SECRET_KEY || '',
    }
  })
    .then(res => res.json())
    .then((data: SearchImageResponse) => {
      if ((data as any)?.error) {
        console.error('Failed to fetch image search', data);
        return [];
      }

      return data.value || [];
    })
    .catch((e: any) => {
      console.error('Failed to fetch image search results', e);
      return [];
    });
}

export const webSearch = async (query: string) => {
  return fetch('https://openai-gateway.vercel.app/api/websearch?query=' + query, {
    headers: {
      'x-api-key': process.env.GATEWAY_SERVER_SECRET_KEY || '',
    }
  })
    .then(res => res.json())
    .then((data: WebSearchResponse) => {
      if ((data as any)?.error) {
        console.error('Failed to fetch web search', data);
        return [];
      }

      return data.orginic_results || [];
    })
    .catch((e: any) => {
      console.error('Failed to fetch image search results', e);
      return [];
    });
}