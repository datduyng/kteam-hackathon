import { ChatOpenAI } from "@langchain/openai";
import { createOpenAIFnRunnable } from "langchain/chains/openai_functions";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { zodToJsonSchema } from "./zod-to-json";
import { z } from "zod";
import { imageSearch } from "./services/search";
import { UpstashRedisCache } from "@langchain/community/caches/upstash_redis";

const cache = process.env.UPSTASH_REDIS_REST_URL! 
  ? new UpstashRedisCache({ // use this to save openai money. DOM local testing only
    config: {
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    },
  }) : true;

const model = new ChatOpenAI({
  modelName: "gpt-4-0125-preview",
  temperature: 0.2,
  openAIApiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
  // verbose: true,
  cache,
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
    ['user', 'Generate outlines based on user input: {input}']
  ]),
  enforceSingleFunctionUsage: false, // Default is true
  outputParser: new JsonOutputFunctionsParser(),
});

export const buildLessonPlan = async (query: string) => {
  console.info('Building outlines for', query);
  const outlineResponse = await outlineEngine.invoke({
    input: query
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