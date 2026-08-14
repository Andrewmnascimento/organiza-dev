import { useDroppable } from "@dnd-kit/react";
import type { ColumnProps } from "../types/board.types";

export const Column = ({ id }: ColumnProps) => {
  const { ref } = useDroppable({ id });
  
  return (
    <div ref={ref}>
      
    </div>
  );
};
