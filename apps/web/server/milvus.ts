/*
https://ts.llamaindex.ai/modules/vector_stores/qdrant
https://ts.llamaindex.ai/api/classes/MilvusVectorStore
*/

import fs from "node:fs/promises";
import {
  Document,
  VectorStoreIndex,
  MilvusVectorStore,
  serviceContextFromDefaults,
  OpenAIEmbedding,
  SentenceSplitter,
} from "llamaindex";
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const openaiEmbedModel = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({
  embedModel: openaiEmbedModel,
});
const defaultMilvusAddress = "localhost:19530";
const milvusClient = new MilvusClient(defaultMilvusAddress);

export const runMilvusExample = async (query: string) => {
  const testingCollection = 'testing'
  // drop collection if exists
  try {
    await milvusClient.dropCollection({ collection_name: testingCollection });
  } catch (e) {
    console.error('Error on dropping collection', e);
  }

  const milvusStore = new MilvusVectorStore({
    params: {
      configOrAddress: defaultMilvusAddress,
    },
    collection: testingCollection,
  });
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  const chunkSize = 100;
  const documents = new SentenceSplitter({ chunkSize })
    .splitText(essay)
    .map((text, index) => new Document({ text, id_: `${path}_${index}_${chunkSize}` }));

  console.info(`Indexing document with ${documents.length} chunks`)
  const index = await VectorStoreIndex.fromDocuments(documents, {
    vectorStore: milvusStore,
    serviceContext,
  });
  const similaritySearchTask = index.asRetriever({ similarityTopK: 2 }).retrieve({ query });


  const queryEngine = index.asQueryEngine();

  console.info("Querying document")
  const response = await queryEngine.query({
    query,
  });

  // Output response
  return {
    response,
    // similarity: await similaritySearchTask,
  };
}