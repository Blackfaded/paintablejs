import React, {
  forwardRef,
  ReactNode,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { PaintableClass } from './PaintableClass';

interface Props {
  // required
  width: number;
  height: number;
  active: boolean;

  //optional
  scaleFactor?: number;
  useEraser?: boolean;
  thicknessEraser?: number;
  thickness?: number;
  color?: string;
  image?: string | null;

  onSave: (image: string) => void;
  onLongPress: () => void;
  children?: ReactNode;
}

export interface PaintableRef {
  undo: () => void;
  redo: () => void;
}

export const Paintable = forwardRef((props: Props, ref: Ref<PaintableRef>) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [paintable, setPaintable] = useState<PaintableClass | null>(null);
  const {
    width,
    height,
    active,

    scaleFactor,
    useEraser,
    thicknessEraser,
    thickness,
    color,
    image,

    onLongPress,
    onSave,
  } = props;

  useImperativeHandle(ref, () => {
    return {
      undo() {
        undo();
      },
      redo() {
        redo();
      },
    };
  });

  useEffect(() => {
    if (canvas.current) {
      const instance = new PaintableClass(canvas.current, {
        width,
        height,
        active,

        scaleFactor,
        useEraser,
        thicknessEraser,
        thickness,
        color,
        image,
      });
      setPaintable(instance);
    }
  }, [canvas]);

  useEffect(() => {
    if (paintable) {
      paintable.events.on('save', onSave);
      paintable.events.on('longPress', onLongPress);
    }
  }, [paintable]);

  useEffect(() => {
    if (paintable && thickness) {
      paintable.setThickness(thickness);
    }
  }, [thickness]);

  useEffect(() => {
    if (paintable && useEraser !== undefined) {
      paintable.setUseEraser(useEraser);
    }
  }, [useEraser]);

  useEffect(() => {
    if (paintable) {
      paintable.setActive(active);
    }
  }, [active]);

  useEffect(() => {
    if (paintable && color) {
      paintable.setColor(color);
    }
  }, [color]);

  const undo = () => {
    if (paintable) {
      paintable.undo();
    }
  };
  const redo = () => {
    if (paintable) {
      paintable.redo();
    }
  };

  return (
    <>
      <canvas ref={canvas}></canvas>

      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {props.children}
      </div>
    </>
  );
});
