export interface Lesson {
  id: string;
  title: string;
  description: string;
  example: string;
  exercise: string;
  solution: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}
