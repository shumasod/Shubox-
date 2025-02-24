import { Lesson } from '../../types/lesson';

export const basicLesson: Lesson = {
  id: 'basic-select',
  title: 'SELECT文の基本',
  description: 'データベースからデータを取得する基本的なSELECT文を学びましょう。',
  example: 'SELECT column_name FROM table_name;',
  exercise: 'テーブル users から name カラムを取得してください。',
  solution: 'SELECT name FROM users;',
  difficulty: 'basic'
};
