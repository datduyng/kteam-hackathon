import { buildFirstQuiz } from '@/server/build-lesson-plan'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  response: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    let q = req.query.q as string;
    if (req.method === 'POST') {
      q = req.body.q as string;
    }

    const response = await buildFirstQuiz({
      query: q,
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
