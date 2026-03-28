export type Train = {
    id: string;
    title: string;
    description: string;
  };
  
  export const trains: Train[] = [
    {
      id: 'array-train',
      title: 'Array Express',
      description: 'In-place array manipulation challenges',
    },
    {
      id: 'linked-train',
      title: 'Linked Line',
      description: 'Linked list challenges (coming soon)',
    },
    {
      id: 'tree-train',
      title: 'Tree Explorer',
      description: 'Tree & recursion challenges (coming soon)',
    },
  ];