import { buildMindMap } from '@/server/build-lesson-plan'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  response: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const q = req.query.resolvedQa as string;

    if (req.method === "POST") {
      const response = await buildMindMap({
        resolvedQa: req.body.resolvedQa,
        existingMindMap: req.body.existingMindMap,
      })
      return res.status(200).json({
        response,
      })
    }
    const response = await buildMindMap({
      resolvedQa: q,
    })
    return res.status(200).json({
      response,
    })
  } catch (error: any) {
    console.error('error', error)
    return res.status(500).json({
      response: error
    })
  }
}
