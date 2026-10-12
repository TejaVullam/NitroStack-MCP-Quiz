import { Module } from '@nitrostack/core';
import { QuizMindMapTools } from './quiz-mindmap.tools.js';

@Module({ providers: [QuizMindMapTools] })
export class QuizMindMapModule {}
