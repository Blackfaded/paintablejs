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
  image?: string | null;

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
        color: '#FF0000',
        smooth,
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
    console.log({ smooth });
    if (paintable && smooth !== undefined) {
      paintable.setSmooth(smooth);
    }
  }, [smooth]);

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

  const clear = () => {
    if (paintable) {
      paintable.clearCanvas();
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
