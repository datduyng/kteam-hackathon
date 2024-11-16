

//Introduction quiz to determine experience level
let introPrompt = `Based on the user's provided topic and experience level, generate a short quiz to assess their familiarity with the topic. 
The quiz should help identify areas where the user needs further exposure and study.

Output the quiz in JSON format, as follows:
json
{
  "question": "How familiar are you with [Topic]?",
  "options": [
    { "option": "I have never encountered [Topic] before.", "value": 1 },
    { "option": "I have some basic knowledge of [Topic].", "value": 2 },
    { "option": "I understand the fundamentals of [Topic].", "value": 3 },
    { "option": "I can apply [Topic] in simple scenarios.", "value": 4 },
    { "option": "I am comfortable with [Topic] and can work with it in projects.", "value": 5 },
    { "option": "I consider myself advanced in [Topic] and can handle complex tasks.", "value": 6 }
  ]
}`


//Gathering topics for user to learn
let topicsPrompt = ```Generate a structured learning plan based on the following instructions:

1. **Analyze Quiz Data and Performance**:
   - Process the user's quiz data, including responses, scores, and areas of weakness.
   - Identify specific concepts or topics where the user showed gaps or less confidence, or should learn more.
2. **Generate Tailored Learning Resources**:
   - For each identified weak area, create a personalized list of topics, each with a short description of its importance or relevance.

3. **Generate Sub-topics with Materials**:
   - Break down each topic into sub-topics, and include study materials or resources for each sub-topic.
   - Ensure the resources address the user's weak areas and follow a logical progression, starting with prerequisites and foundational topics before advancing to more complex concepts.

4. **Organize Chronologically**:
   - Arrange topics, sub-topics, and materials in a clear chronological order.
   - Ensure all prerequisites are covered before dependent topics.
   - Verify that each topic builds logically on the previous one to create a coherent and structured learning path.

5. **Output Format**:
   - Provide the data as a JSON object designed for use in a Mermaid diagram.
   - Structure the JSON elements to ensure easy extraction and direct integration into a Mermaid diagram for learning visualization.

**Output Example**:
json
{
  "topics": [
    {
      "name": "Topic 1",
      "description": "Short description of Topic 1",
      "sub_topics": [
        {
          "name": "Sub-topic 1.1",
          "materials": ["Resource 1", "Resource 2"]
        },
        {
          "name": "Sub-topic 1.2",
          "materials": ["Resource 3"]
        }
      ]
    },
    {
      "name": "Topic 2",
      "description": "Short description of Topic 2",
      "sub_topics": [
        {
          "name": "Sub-topic 2.1",
          "materials": ["Resource 4"]
        }
      ]
    }
  ]
}```;


// pop quiz for each node 
let popQuizPrompt = ```Generate a quiz based on the current topic and its sub-topics, considering the user's previous quiz performance.
Ensure all key concepts are covered to reinforce understanding.

**Expected Input:**
- Previous quiz performances: {topic1: score, topic2: score, ...}
- Current node topic and sub-topics with associated study materials.

**Expected Output:**
The quiz should be formatted in JSON as follows:
json
{
  "question": "Question about the topic",
  "options": [
    { "option": "Option 1", "value": 1 },
    { "option": "Option 2", "value": 2 },
    { "option": "Option 3", "value": 3 },
    { "option": "Option 4", "value": 4 }
  ]
}```


let mermaid_system_prompt = `
You are tasked with generating Markdown code to create mind maps in Mermaid. 
You will take a list of topics and subtopics provided to you and return a well-structured Markdown block containing the Mermaid syntax to represent these topics visually.

### Instructions:
1. The mind map must have a clear hierarchical structure, with a root node and nested branches.
2. Indentation and formatting must follow Mermaid's syntax rules for mind maps.
3. Each node will consist of a topic name only.
4. Include the Mermaid \`click\` functionality for each node. After the Mermaid Markdown, list clickable node information in the format: \`click [node] [nodeClickHandler];\`.

### Example Input:
We will ignore the \`description\` fields in the JSON and only process the hierarchical structure of topics and subtopics.

\`\`\`json
{
  "root": "Learning Paths",
  "description": "A visual representation of various learning paths.",
  "subtopics": [
    {
      "name": "Programming",
      "description": "Topics related to learning programming languages.",
      "subtopics": [
        {
          "name": "Python",
          "description": "A versatile programming language great for beginners."
        },
        {
          "name": "JavaScript",
          "description": "A popular language for web development."
        }
      ]
    },
    {
      "name": "Design",
      "description": "Topics related to visual and user interface design.",
      "subtopics": [
        {
          "name": "UI/UX",
          "description": "User interface and experience design."
        },
        {
          "name": "Graphic Design",
          "description": "The art of visual communication."
        }
      ]
    }
  ]
}
\`\`\`

### Expected Output:
\`\`\`mermaid
mindmap
  root(Learning Paths)
    Programming
      Python
      JavaScript
    Design
      UI/UX
      Graphic Design
click Programming nodeClickHandler;
click Python nodeClickHandler;
click JavaScript nodeClickHandler;
click Design nodeClickHandler;
click UI/UX nodeClickHandler;
click Graphic Design nodeClickHandler;
\`\`\`

Now, based on the provided list of topics and subtopics, generate the Mermaid Markdown mind map.
`;
