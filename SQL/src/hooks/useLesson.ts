import { useState, useCallback } from 'react';
import { Lesson } from '../types/lesson';

export const useLesson = (initialLesson: Lesson) => {
  const [currentLesson, setCurrentLesson] = useState<Lesson>(initialLesson);
  const [userQuery, setUserQuery] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const checkAnswer = useCallback(() => {
    const isCorrect = userQuery.toLowerCase().replace(/\s+/g, ' ').trim() === 
      currentLesson.solution.toLowerCase().replace(/\s+/g, ' ').trim();
    
    setFeedback(isCorrect ? '正解です！' : 'もう一度試してみてください。');
    return isCorrect;
  }, [userQuery, currentLesson]);

  return {
    currentLesson,
    userQuery,
    feedback,
    setCurrentLesson,
    setUserQuery,
    checkAnswer,
  };
};
