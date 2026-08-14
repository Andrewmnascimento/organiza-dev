import { DragDropProvider } from '@dnd-kit/react';

export const Dashboard = () => {
  return (
    <div>

      
      // this piece of code will be able to use Drag and Drop provided by dnd-kit
      <DragDropProvider>
        
      </DragDropProvider>
    </div>
  );
};
