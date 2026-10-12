import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type AgentRole = 'topic_planner' | 'content_generator' | 'validator' | 'formatter';

/**
 * Four cooperating agent roles. These are sequential specialist passes implemented
 * in one service, not four separately deployed autonomous agents.
 */
async function runRole(role: AgentRole, instruction: string, input: unknown): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing. Add it to .env before generating content.');
  }
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: role === 'validator' ? 0.1 : 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: `You are the ${role} specialist in an educational content pipeline. ${instruction} Return valid JSON only.` },
      { role: 'user', content: JSON.stringify(input) }
    ]
  });
  return response.choices[0]?.message?.content || '{}';
}

export async function createQuizWithAgents(input: {
  topic: string; count: number; difficulty: 'easy' | 'medium' | 'hard';
}) {
  const plan = await runRole('topic_planner',
    'Plan a balanced quiz outline with learning objectives and subtopics. Return {"objectives":[],"subtopics":[]}.',
    input);
  const draft = await runRole('content_generator',
    'Generate exactly count multiple-choice questions. Return {"title":string,"questions":[{"question":string,"options":[string,string,string,string],"correctIndex":number,"explanation":string,"concept":string}]}. Avoid ambiguous questions.',
    { ...input, plan: JSON.parse(plan) });
  const validated = await runRole('validator',
    'Check the draft for exactly the requested number of questions, four distinct options per question, correctIndex 0-3, and useful explanations. Fix issues. Return the same quiz JSON shape.',
    { ...input, draft: JSON.parse(draft) });
  return JSON.parse(await runRole('formatter',
    'Normalize and format the validated quiz JSON. Ensure title and questions exist, trim whitespace, and return only {"title":string,"topic":string,"difficulty":string,"questions":[{"question":string,"options":string[],"correctIndex":number,"explanation":string,"concept":string}]}.',
    { ...input, quiz: JSON.parse(validated) }));
}

export async function createMindMapWithAgents(topic: string) {
  const plan = await runRole('topic_planner',
    'Plan a mind map with one central topic and 4-6 main branches, each with 2-4 concise child nodes. Return {"central":string,"branches":[{"label":string,"children":[string]}]}.',
    { topic });
  const draft = await runRole('content_generator',
    'Expand the plan into clear, concise educational nodes, avoid duplicate branches. Return {"central":string,"branches":[{"label":string,"children":[string]}]}.',
    { topic, plan: JSON.parse(plan) });
  const validated = await runRole('validator',
    'Validate hierarchy: central must be non-empty, 4-6 branches, each with 2-4 non-empty unique children. Repair if needed and return the same JSON shape.',
    { topic, draft: JSON.parse(draft) });
  return JSON.parse(await runRole('formatter',
    'Return only normalized JSON with fields central:string and branches:array of {label:string,children:string[]}.',
    { topic, mindMap: JSON.parse(validated) }));
}
