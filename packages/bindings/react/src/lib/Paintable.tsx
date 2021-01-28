import React, {
  forwardRef,
  ReactNode,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Paintable as PaintableCore } from 'paintablejs';

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
  smooth?: boolean;
  image?: string;

  onSave: (image: string) => void;
  onLongPress: () => void;
  children?: ReactNode;
}

export interface PaintableRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const Paintable = forwardRef((props: Props, ref: Ref<PaintableRef>) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [paintable, setPaintable] = useState<PaintableCore | null>(null);
  const {
    width,
    height,
    active,

    scaleFactor,
    useEraser,
    thicknessEraser,
    thickness,
    color,
    smooth,
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
      clear() {
        clear();
      },
    };
  });

  useEffect(() => {
    if (canvas.current) {
      const instance = new PaintableCore(canvas.current, {
        width,
        height,
        active,

        scaleFactor,
        useEraser,
        thicknessEraser,
        thickness,
        color,
        smooth,
        image,
        onLongPress,
        onSave,
      });
      setPaintable(instance);
    }
  }, [canvas]);

  useEffect(() => {
    paintable?.setThickness(thickness);
  }, [thickness]);

  useEffect(() => {
    paintable?.setUseEraser(useEraser);
  }, [useEraser]);

  useEffect(() => {
    paintable?.setScaleFactor(scaleFactor);
  }, [scaleFactor]);

  useEffect(() => {
    paintable?.setSmooth(smooth);
  }, [smooth]);

  useEffect(() => {
    paintable?.setActive(active);
  }, [active]);

  useEffect(() => {
    paintable?.setColor(color);
  }, [color]);

  const undo = () => {
    paintable?.undo();
  };
  const redo = () => {
    paintable?.redo();
  };

  const clear = () => {
    paintable?.clearCanvas();
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
