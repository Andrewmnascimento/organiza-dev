export interface CardProps {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
}

export interface ColumnProps {
  id: string;
  name: string;
  order: number;
  boardId: string;
  cards: CardProps[];
}

export interface BoardProps {
  id: string;
  name: string;
}
