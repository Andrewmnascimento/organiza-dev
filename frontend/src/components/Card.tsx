import { useDraggable } from "@dnd-kit/react";
import type { CardProps } from "../types/board.types";

export const Card = ({ id }: CardProps) => {
  const { ref, draggable} = useDraggable({ id });
  return (
    <div ref={ref} {...draggable}>
      
    </div>
  );
};
