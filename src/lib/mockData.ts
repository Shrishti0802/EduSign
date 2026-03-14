export interface SignData {
  id: string;
  word: string;
  category: string;
  videoUrl: string;       // Used in the Dictionary
  quizVideoUrl?: string;  // Optional: used in the Quiz (falls back to videoUrl if not set)
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Since we don't have actual sign language videos right now, 
// we'll use placeholder generic videos/gifs for the mock data.
// In a real app, these would be specific ASL/ISL recordings.
export const mockDictionaryData: SignData[] = [
  {
    id: '1',
    word: 'Hello',
    category: 'Greetings',
    videoUrl: '/videos/Hello.mp4',
    quizVideoUrl: '/videos/hello(1).mp4',
    difficulty: 'Beginner'
  },
  {
    id: '2',
    word: 'Thank You',
    category: 'Greetings',
    videoUrl: '/videos/Thank You.mp4',
    quizVideoUrl: '/videos/thankyou(1).mp4',
    difficulty: 'Beginner'
  },
  {
    id: '3',
    word: 'Please',
    category: 'Greetings',
    videoUrl: '/videos/Please.mp4',
    quizVideoUrl: '/videos/Please(1).mp4',
    difficulty: 'Beginner'
  },
  {
    id: '4',
    word: 'Family',
    category: 'People',
    videoUrl: '/videos/Family.mp4',
    quizVideoUrl: '/videos/Family(1).mp4',
    difficulty: 'Intermediate'
  },
  {
    id: '5',
    word: 'Good Morning',
    category: 'Greetings',
    videoUrl: '/videos/Good Morning.mp4',
    quizVideoUrl: '/videos/goodmorning(1).mp4',
    difficulty: 'Beginner'
  },
  {
    id: '6',
    word: 'Music',
    category: 'Common Verbs',
    videoUrl: '/videos/music.mp4',
    quizVideoUrl: '/videos/music(1).mp4',
    difficulty: 'Beginner'
  },
  {
    id: '7',
    word: 'Numbers',
    category: 'Education',
    videoUrl: '/videos/Numbers.mp4',
    difficulty: 'Intermediate'
  }
];

export const getCategories = () => {
  const categories = new Set(mockDictionaryData.map(item => item.category));
  return ['All', ...Array.from(categories)];
};
