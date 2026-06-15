import { CURRICULUM_DATA, ModuleData } from '../data/curriculumData';
import { AI_AUTOMATION_DATA } from '../data/aiAutomationData';
import { GFG_CURRICULUM_DATA } from '../data/gfgCurriculumData';

/**
 * Returns the correct detailed curriculum data for a given course ID.
 * Falls back to Generative AI data if the course is not specifically handled.
 */
export const getDetailedCurriculum = (courseId: string): ModuleData[] => {
  const resolvedId = courseId.toLowerCase();
  
  if (resolvedId === 'ai-automation-mastery' || resolvedId.includes('ai-automation')) {
    return AI_AUTOMATION_DATA;
  }
  
  if (resolvedId === 'ai-foundations' || resolvedId.includes('fundamentals')) {
    return GFG_CURRICULUM_DATA.map(chapter => ({
      title: chapter.title,
      topics: chapter.topics.map(topic => ({
        type: topic.type === 'practice_quiz' ? 'practice_quiz' : topic.type === 'graded_quiz' ? 'graded_quiz' : 'text',
        title: topic.title,
        content: topic.content,
        practice: topic.practice?.map(q => ({
          question: q.question,
          options: q.options,
          answer: q.correct,
          explanation: q.explanation
        })),
        graded: topic.graded?.map(q => ({
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation
        }))
      }))
    }));
  }
  
  // Default to Generative AI
  return CURRICULUM_DATA;
};
