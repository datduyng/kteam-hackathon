import { ChatOpenAI } from "@langchain/openai";
import { createOpenAIFnRunnable } from "langchain/chains/openai_functions";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { zodToJsonSchema } from "./zod-to-json";
import { z } from "zod";
import { imageSearch } from "./services/search";
import { UpstashRedisCache } from "@langchain/community/caches/upstash_redis";
import { ChatAnthropic } from "@langchain/anthropic";

const cache = process.env.UPSTASH_REDIS_REST_URL!
  ? new UpstashRedisCache({ // use this to save openai money. DOM local testing only
    config: {
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    },
  }) : true;

const openaiModel = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.2,
  openAIApiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
  // verbose: true,
  cache,
});

const claudeModel = new ChatAnthropic({
  model: "claude-3-5-sonnet-20240620",
  temperature: 0,
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxTokens: undefined,
  maxRetries: 2,
  cache,
});

const model = openaiModel;

const mindmapSchema = z.object({
  mindmapLessonPlan: z.string({
    description: "The mindmap lesson plan to use for the user"
  })
});

const firstQuizSchema = z.object({
  questions: z.object({
    question: z.string(),
    answers: z.string({
      description: "Full slide content to use for the slide. This will be used for the speaker notes, transcript, or full slide content"
    }).array(),
  }).array(),
});

const slideOutlineSchema = z.object({
  slide_outlines: z.object({
    title: z.string(),
    image_search_query: z.string({
      description: "The query to use for searching for an image to use for the slide"
    }),
    content: z.string({
      description: "Slide content to use for the slide. Use markdown for formatting, keep it short and concise"
    }),
    full_slide_content: z.string({
      description: "Full slide content to use for the slide. This will be used for the speaker notes, transcript, or full slide content"
    }),
  }).array(),
});


const mindMapEngine = createOpenAIFnRunnable({
  functions: [
    {
      name: "set_mindmap_lesson_plan",
      description: "Set the mindmap lesson plan for a user",
      parameters: zodToJsonSchema(mindmapSchema),
    }
  ],
  llm: model,
  prompt: ChatPromptTemplate.fromMessages([
    ['assistant', `You are tasked with generating Markdown code to create mind maps in Mermaid. 
You will take a list of topics and subtopics provided to you and return a well-structured Markdown block containing the Mermaid syntax to represent these topics visually.

### Instructions:
1. The mind map must have a clear hierarchical structure, with a root node and nested branches.
2. Indentation and formatting must follow Mermaid's syntax rules for mind maps.
3. Each node will consist of a topic name only.
4. Don't include \`\`\`

Example output mindmap:
mindmap
  root(Learning Paths)
    Programming
      Python
      JavaScript
    Design
      UI/UX
      Graphic Design
`],
    ['user', `Generate a mindmap given user quized answer below:
{input}.

Generate mindmap below:`]
  ]),
  enforceSingleFunctionUsage: false, // Default is true
  outputParser: new JsonOutputFunctionsParser(),
});

const firstQuizEngine = createOpenAIFnRunnable({

  functions: [
    {
      name: "set_first_quiz",
      description: "Set the first quiz for a presentation",
      parameters: zodToJsonSchema(firstQuizSchema),
    }
  ],
  llm: model,
  prompt: ChatPromptTemplate.fromMessages([
    ['assistant', `You are a quiz generator engine. Generate a quiz based on the current topic and its sub-topics, considering the user's previous quiz performance.
Ensure all key concepts are covered to reinforce understanding.
- You should have 3-4 questions
- Each question should have 4 multiple choice or single choice answers
`],
    ['user', 'Generate list of quiz to learn more about the user {input}.\n\nGenerate quiz questions below:']
  ]),
  enforceSingleFunctionUsage: false, // Default is true
  outputParser: new JsonOutputFunctionsParser(),
});

const outlineEngine = createOpenAIFnRunnable({
  functions: [
    {
      name: "set_slide_outlines",
      description: "Set the slide outlines for a presentation",
      parameters: zodToJsonSchema(slideOutlineSchema),
    }
  ],
  llm: model,
  prompt: ChatPromptTemplate.fromMessages([
    ['assistant', `You are a professional presentation designer. You have been asked 
to create a presentation outlines on the topic given by following user input. The outlines must follow below rules
- Each slide should have a title and a brief description
- The presentation should have 4-7 slides
- The presentation should be engaging and informative
- The presentation should be visually appealing`],
    ['user', 'Generate outlines based on user input along with some context about input: {input}.\n\nGenerate outlines below:']
  ]),
  enforceSingleFunctionUsage: false, // Default is true
  outputParser: new JsonOutputFunctionsParser(),
});

export const buildMindMap = async (input: {
  resolvedQa: string;
  existingMindMap?: string;
}) => {
  const mindMapResposne = await model.invoke(`
You are tasked with generating Markdown code to create mind maps in Mermaid. 
You will take a list of topics and subtopics provided to you and return a well-structured Markdown block containing the Mermaid syntax to represent these topics visually.

### Instructions:
1. The mind map must have a clear hierarchical structure, with a root node and nested branches.
2. Indentation and formatting must follow Mermaid's syntax rules for mind maps.
3. Each node will consist of a topic name only.
4. Don't include \`\`\`
5. Try to have more than 12 topics in the mindmap
6. Make it clear and avoid having too detailed topics
7. Don't add spaces at the end of the lines i.e "mindmap\n" instead of "mindmap \n"

Example output mindmap:
mindmap
  root(Learning Paths)
    Programming
      Python
      JavaScript
    Design
      UI/UX
      Graphic Design

${input.existingMindMap
      ? `Below is user previous generated mindmap(from a personalized quiz. You are expected to generate a mindmap based on this input. The new mindmap should keep the existing mindmap structure and add new topics based on the user input): \n${input.existingMindMap}`
      : null
    }

Below is user input(from a personalized quiz. You are expected to generate a mindmap based on this input):
${input.resolvedQa}

Provide the mindmap lesson plan for the user based on the input below:    
`)


  return mindMapResposne.content;
}

export const buildFirstQuiz = async (input: {
  query: string,
}) => {
  const firstQuizResponse = await firstQuizEngine.invoke({
    input: input.query,
  })

  if (firstQuizResponse.cause === "error") {
    throw new Error(firstQuizResponse.message);

  }

  const quizQuestions: z.infer<typeof firstQuizSchema>['questions'] = (firstQuizResponse as any).questions || [];

  if (quizQuestions.length) {
    return quizQuestions;
  }

  return [{
    question: "What is your background on this topic?",
    answers: [
      "A. I have no background on this topic",
      "B. I have some background on this topic",
      "C. I have a lot of background on this topic",
      "D. I am an expert on this topic"
    ],
  }];
}
export const buildLessonPlan = async (input: {
  query: string,
  answers: any[],
}) => {
  console.info('Building outlines for', input);
  const outlineResponse = await outlineEngine.invoke({
    input: `${input.query}
${input.answers ? Object.entries(input?.answers).map(([key, value]) => `${key} ${value}`).join('\n') : null}`,
  });
  console.info('outlineResponse');

  if (outlineResponse.cause === "error") {
    throw new Error(outlineResponse.message);
  }

  const outlines: z.infer<typeof slideOutlineSchema>['slide_outlines'] = (outlineResponse as any).slide_outlines || [];

  if (outlines?.length) {
    console.info('searching for images for', outlines.map(outline => outline.image_search_query));
    const imageSearchPromises = outlines.map(outline =>
      imageSearch(outline.image_search_query).then(images => ({
        ...outline,
        images,
      })).catch(e => {
        console.error("Failed to fetch image search results for outline", e, outline)
        return {
          ...outline,
          images: [],
        };
      })
    );

    const outlinesWithImages = await Promise.all(imageSearchPromises);

    const uniqueImages = new Set();
    const updatedOutlinesWithImages = outlinesWithImages.map(outline => {
      let mainImage = outline.images.find(image => !uniqueImages.has(image.contentUrl));
      if (!mainImage) {
        // If all images are duplicates, just use the first one as a fallback
        mainImage = outline.images?.[0];
      } else {
        uniqueImages.add(mainImage.contentUrl);
      }
      return {
        ...outline,
        mainImage,
        id: Math.random().toString(),
      };
    });

    return updatedOutlinesWithImages;
  } else {
    throw new Error("No outlines found");
  }
}

export const getRecommendedQuestions = async (query: string) => {
  const octoAIModel = process.env.OCTOAI_API_KEY ? new ChatOpenAI({
    configuration: {
      baseURL: "https://text.octoai.run/v1",
      apiKey: process.env.OCTOAI_API_KEY,
    },
    cache,
    temperature: 0.4,
    modelName: 'nous-hermes-2-mixtral-8x7b-dpo',
  }) : openaiModel;
  const response = await octoAIModel.invoke(`You are given a query from user. Your goal is to give list of question that I can ask more about the user to understand their need better. Only ask questions that are relevant to the user input and will provide more context for the user input.
- Your questions should be open-ended and specific
- Your questions should be respectful and professional
- Your questions should be clear and concise
- Your questions should be relevant to the user input
- Provide bullet points of questions that you can ask the user based on the input. You can either provide 1-2 questions or more based on the input.
- You must use bullet points to list the questions. Each question should be on a new line


Example:
input: I want to learn about public speaking
output:
- What is your goal with public speaking?
- What is your experience with public speaking?

Please provide 1-2 questions that you can ask the user based on the input: ${query}`);
  const responseText = response.text?.trim();

  if (!responseText) {
    return [];
  }

  const questions = responseText.split('\n').map(question => question.trim()).filter(Boolean);

  return questions;
}


export const getBookRecommendation = async (input: {
  query: string,
  answers: any[],
}) => {
  const setBookRecommendationSchema = z.object({
    bookRecommendations: z.string({
      description: "The book recommendations to use for the user"
    }).array(),
    keyPointsOfBooks: z.string({
      description: "Key points of listed books. Each key points should be a single sentence and concise. This should be personalized and relevant to the user's interests"
    }).array(),
    userLearningGuide: z.string({
      description: "Provide the user learning guide for his/her interest based on the input"
    }),
  });
  const bookRecommendEngine = createOpenAIFnRunnable({
    functions: [
      {
        name: "set_book_recommendations_with_key_points",
        description: "Set the book recommendations for a user",
        parameters: zodToJsonSchema(setBookRecommendationSchema),
      }
    ],
    llm: model,
    prompt: ChatPromptTemplate.fromMessages([
      ['assistant', `You are an intelligent book recommendation engine. Your task is to suggest books based on user preferences and inputs. Consider the following while making recommendations:
  - The genre and themes the user is interested in
  - The user's reading history and preferences, if available
  - Current trends and popular books in the requested genres
  - The books should be engaging and thought-provoking
  - Provide 2 key points of all the books recommended. Each key point should be a single sentence and concise.
  - Make sure each key point is personalized and relevant to the user's interests
  - Key point should be summarize learning of all recommended books and not just a summary of the book. Nothing should be specific about the book's author or title.
  - Provide the user learning guide for his/her interest based on the input
  - Provide 2-4 books based on the user's interest
  - Provide a brief description of why each book is recommended`],
      ['user', 'Based on my interest in {input}\n\nProvide recommendations below in json function']
    ]),
    enforceSingleFunctionUsage: false, // Default is true
    outputParser: new JsonOutputFunctionsParser(),
  });

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      console.info(`Retrying book recommendation engine, attempt ${attempt + 1}`);
      const retryResponse = await bookRecommendEngine.invoke({
        input: `${input.query}\n${Object.entries(input.answers).map(([key, value]) => `${key}: ${value}`).join('\n')}`,
      });

      if (retryResponse.cause !== "error") {
        const bookRecommendations = (retryResponse as any).bookRecommendations || [];
        const keyPointsOfBooks = (retryResponse as any).keyPointsOfBooks || [];
        const userLearningGuide = (retryResponse as any).userLearningGuide || [];
        if (bookRecommendations.length) {
          const bookImages: any = {};
          const imageSearchPromises = bookRecommendations.map((book: any) =>
            imageSearch(`${book} book`).then(images => {
              bookImages[book] = images?.[0];
            }).catch(e => {
              console.error("Failed to fetch image search results for outline", e, book)
            })
          );

          await Promise.all(imageSearchPromises);

          console.info('Book recommendations received on retry', bookRecommendations);
          return {
            bookRecommendations,
            keyPointsOfBooks,
            bookImages,
            userLearningGuide,
          };
        }
      } else {
        console.error(`Retry attempt ${attempt + 1} failed with message: ${retryResponse.message}`);
      }
    }
    throw new Error("Failed to obtain book recommendations after 2 retries.");
  } catch (error) {
    console.error("Failed to run book recommendation engine", error);
    throw error;
  }
};