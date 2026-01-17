import { useDrag } from 'react-dnd';
import type { Unit } from '../types';

interface UseUnitCardDragProps {
  unit: Unit;
  isInFormation: boolean;
  sourceRow?: number;
  sourceCol?: number;
}

interface UseUnitCardDragReturn {
  dragRef: (node: HTMLDivElement | null) => void;
  isDragging: boolean;
}

export function useUnitCardDrag({
  unit,
  isInFormation,
  sourceRow,
  sourceCol
}: UseUnitCardDragProps): UseUnitCardDragReturn {
  const [{ isDragging }, drag] = useDrag({
    type: 'unit',
    item: { unit, isInFormation, sourceRow, sourceCol },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const dragRef = (node: HTMLDivElement | null) => {
    if (node) {
      drag(node);
    }
  };

  return { dragRef, isDragging };
}