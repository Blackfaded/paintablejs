import React, {
  forwardRef,
  ReactNode,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import styles from './Paintable.module.scss';

interface MousePosition {
  x: number;
  y: number;
}

interface Props {
  name: string;
  image: string | null;
  active: boolean;
  useEraser?: boolean;
  scaleFactor?: number;
  children?: ReactNode;
  color: string;
  thickness?: number;
  onSave: (image: string) => void;
  onLongPress: () => void;
}

export interface PaintableRef {
  undo: () => void;
  redo: () => void;
  save: () => void;
}

export const Paintable = forwardRef((props: Props, ref: Ref<PaintableRef>) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [bounding, setBoundings] = useState<DOMRect | null>(null);
  const [undoList, setUndoList] = useState<string[]>([]);
  const [redoList, setRedoList] = useState<string[]>([]);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout>();
  const [isDrawing, setIsDrawing] = useState(false);

  const { active, image, onLongPress, onSave } = props;
  useImperativeHandle(ref, () => {
    return {
      undo() {
        undo();
      },
      redo() {
        redo();
      },
      save() {
        saveImage();
      },
    };
  });

  useEffect(() => {
    if (canvas.current) {
      setContext(canvas.current.getContext('2d'));
      setBoundings(canvas.current.getBoundingClientRect());
    }
  }, [canvas]);

  useEffect(() => {
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      if (image && image !== '') {
        restoreCanvas(image);
      }
    }
  }, [context, image]);

  useEffect(() => {
    if (context) {
      context.strokeStyle = props.color;
    }
  }, [context, props.color]);

  useEffect(() => {
    saveImage();
  }, [active]);

  useEffect(() => {
    if (context) {
      context.globalCompositeOperation = props.useEraser
        ? 'destination-out'
        : 'source-over';
      context.lineWidth = props.useEraser ? 40 : props.thickness!;
    }
  }, [context, props.useEraser, props.thickness]);

  const onDrawStart = (e: any, isTouch: boolean) => {
    const timerId = setTimeout(() => {
      onLongPress();
    }, 500);
    setLongPressTimer(timerId);

    if (context && props.active) {
      const mousePosition = getMousePosition(e, isTouch);

      if (canvas.current) {
        console.log('start');
        setUndoList([...undoList, canvas.current.toDataURL()]);
        setRedoList([]);
      }
      context.beginPath();
      context.moveTo(mousePosition.x, mousePosition.y);
      setIsDrawing(true);
    }
  };

  const onDrawMove = (e: any, isTouch: boolean) => {
    if (context && isDrawing && props.active) {
      const mousePosition = getMousePosition(e, isTouch);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(undefined);
      }

      context.lineTo(mousePosition.x, mousePosition.y);
      context.stroke();
    }
  };

  const onDrawEnd = () => {
    if (context && props.active) {
      setIsDrawing(false);
    }
  };

  const getMousePosition = (e: any, isTouch: boolean): MousePosition => {
    return {
      x:
        ((isTouch ? e.targetTouches[0].clientX : e.clientX) - bounding!.left) /
        (props.scaleFactor || 1),
      y:
        ((isTouch ? e.targetTouches[0].clientY : e.clientY) - bounding!.top) /
        (props.scaleFactor || 1),
    };
  };

  const undo = () => {
    if (context && canvas.current) {
      const undoCopy = [...undoList];
      const lastItem = undoCopy.pop();
      if (lastItem) {
        setUndoList(undoCopy);
        setRedoList([...redoList, canvas.current.toDataURL()]);
        restoreCanvas(lastItem);
      }
    }
  };

  const redo = () => {
    if (context && canvas.current) {
      const redoCopy = [...redoList];
      const lastItem = redoCopy.pop();
      if (lastItem) {
        setUndoList([...undoList, canvas.current.toDataURL()]);
        setRedoList(redoCopy);
        restoreCanvas(lastItem);
      }
    }
  };

  const saveImage = () => {
    if (canvas.current) {
      setUndoList([]);
      setRedoList([]);
      onSave(canvas.current.toDataURL());
    }
  };

  const restoreCanvas = (base64Image: string) => {
    if (context) {
      if (base64Image) {
        let image = new Image();
        image.onload = () => {
          context.clearRect(0, 0, 1024, 768);
          context.drawImage(image, 0, 0);
        };
        image.src = base64Image; // eslint-disable-line
      }
    }
  };

  return (
    <>
      <canvas
        className={`${styles['canvas']} ${
          props.active ? styles['active'] : ''
        }`}
        ref={canvas}
        width={1024}
        height={768}
        onMouseDown={(e) => onDrawStart(e, false)}
        onTouchStart={(e) => onDrawStart(e, true)}
        onMouseMove={(e) => onDrawMove(e, false)}
        onTouchMove={(e) => onDrawMove(e, true)}
        onMouseUp={(e) => onDrawEnd()}
        onTouchEnd={(e) => onDrawEnd()}
      ></canvas>

      <div className={styles['content']}>{props.children}</div>
    </>
  );
});

Paintable.defaultProps = {
  useEraser: false,
  thickness: 5,
};
