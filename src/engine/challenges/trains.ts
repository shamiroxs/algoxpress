export type Train = {
    id: string;
    title: string;
    description: string;
    comingSoon?: boolean;
  };
  
  export const trains: Train[] = [
    {
      id: 'array-train',
      title: 'Array Express',
      description: 'In-place array manipulation challenges',
    },
    {
      id: 'linked-train',
      title: 'Linked Express',
      description: 'Linked list challenges',
      comingSoon: true,
    },
    {
      id: 'tree-train',
      title: 'Tree Express',
      description: 'Tree & recursion challenges',
      comingSoon: true,
    },
  ];