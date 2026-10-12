import { ToolDecorator as Tool, Widget, z, ExecutionContext } from '@nitrostack/core';
import { createMindMapWithAgents, createQuizWithAgents } from '../../agents/orchestrator.js';

export class QuizMindMapTools {
  @Tool({
    name: 'generate_quiz',
    title: 'Interactive Quiz',
    description: 'Generate a fresh multiple-choice quiz for any learning topic, with instant scoring and explanations.',
    inputSchema: z.object({
      topic: z.string().min(2).max(160).describe('Topic to quiz the learner on'),
      count: z.number().int().min(3).max(10).default(5).describe('Number of questions (3-10)'),
      difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
    }),
    invocation: { invoking: 'Building your quiz...', invoked: 'Quiz is ready' },
    examples: {
      request: { topic: 'Full Stack Development', count: 5, difficulty: 'medium' },
      response: {
        title: 'Full Stack Development Quiz', topic: 'Full Stack Development', difficulty: 'medium',
        questions: [{ question: 'Which HTTP method is commonly used to create a resource?', options: ['GET','POST','TRACE','HEAD'], correctIndex: 1, explanation: 'POST is commonly used to submit data that creates a resource.', concept: 'HTTP methods' }]
      }
    }
  })
  @Widget('interactive-quiz')
  async generateQuiz(input: { topic: string; count: number; difficulty: 'easy' | 'medium' | 'hard' }, _ctx: ExecutionContext) {
    const quiz = await createQuizWithAgents({
      topic: input.topic,
      count: input.count ?? 5,
      difficulty: input.difficulty ?? 'medium'
    });
    return { ...quiz, topic: input.topic, difficulty: input.difficulty ?? 'medium' };
  }

  @Tool({
    name: 'generate_mind_map',
    title: 'Interactive Mind Map',
    description: 'Create an interactive hierarchical mind map for any topic.',
    inputSchema: z.object({ topic: z.string().min(2).max(160).describe('Topic for the mind map') }),
    invocation: { invoking: 'Mapping the key concepts...', invoked: 'Mind map is ready' },
    examples: {
      request: { topic: 'Full Stack Development' },
      response: {
        central: 'Full Stack Development',
        branches: [
          { label: 'Frontend', children: ['HTML & CSS', 'JavaScript', 'React'] },
          { label: 'Backend', children: ['APIs', 'Authentication', 'Business logic'] },
          { label: 'Data', children: ['SQL', 'NoSQL', 'Data modeling'] },
          { label: 'Deployment', children: ['CI/CD', 'Containers', 'Cloud hosting'] }
        ]
      }
    }
  })
  @Widget('interactive-mind-map')
  async generateMindMap(input: { topic: string }, _ctx: ExecutionContext) {
    return await createMindMapWithAgents(input.topic);
  }
}
