import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { QuizMindMapModule } from './modules/quiz-mindmap/quiz-mindmap.module.js';

@McpApp({
  module: AppModule,
  server: { name: 'quiz-mindmap-mcp', version: '1.0.0' }
})
@Module({
  imports: [ConfigModule.forRoot(), QuizMindMapModule]
})
export class AppModule {}
