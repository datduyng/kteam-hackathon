import { buildLessonPlan } from '@/server/build-lesson-plan'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  response: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {

    if (req.method === "POST") {
      console.log('body', req.body)
      const response = await buildLessonPlan(req.body)
      return res.status(200).json({
        response,
      })
    } else {
      console.log('req.query', req.query)
      const response = await buildLessonPlan({
        query: req.query.query as string,
        answers: [],
      })
      return res.status(200).json({
        response,
      })
    }

  } catch (error: any) {
    console.error('error', error)
    return res.status(500).json({
      response: error
    })
  }
}
