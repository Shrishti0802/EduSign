export interface SignData {
  id: string;
  word: string;
  category: string;
  videoUrl: string;
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
    difficulty: 'Beginner'
  },
  {
    id: '2',
    word: 'Thank You',
    category: 'Greetings',
    videoUrl: '/videos/Thank You.mp4',
    difficulty: 'Beginner'
  },
  {
    id: '3',
    word: 'Please',
    category: 'Greetings',
    videoUrl: '/videos/Please.mp4',
    difficulty: 'Beginner'
  },
  {
    id: '4',
    word: 'Friend',
    category: 'People',
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/17/85352-590001928_tiny.mp4',
    difficulty: 'Intermediate'
  },
  {
    id: '5',
    word: 'Family',
    category: 'People',
    videoUrl: 'https://cdn.pixabay.com/video/2020/05/17/39328-423455928_tiny.mp4',
    difficulty: 'Beginner'
  },
  {
    id: '6',
    word: 'Water',
    category: 'Food & Drink',
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/17/85352-590001928_tiny.mp4',
    difficulty: 'Beginner'
  },
  {
    id: '7',
    word: 'Help',
    category: 'Common Verbs',
    videoUrl: 'https://cdn.pixabay.com/video/2020/05/17/39328-423455928_tiny.mp4',
    difficulty: 'Intermediate'
  },
  {
    id: '8',
    word: 'Learn',
    category: 'Education',
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/17/85352-590001928_tiny.mp4',
    difficulty: 'Intermediate'
  }
];

export const getCategories = () => {
  const categories = new Set(mockDictionaryData.map(item => item.category));
  return ['All', ...Array.from(categories)];
};
