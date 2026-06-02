export interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
}
