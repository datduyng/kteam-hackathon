import { runMilvusExample } from '@/server/milvus'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  response: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    console.log('req.query', req.query)
    const response = await runMilvusExample(req.query.query as string)
    return res.status(200).json({
      response,
    })

  } catch (error: any) {
    return res.status(500).json({
      response: error
    })
  }
}
