import React, { useRef, useState } from 'react';
import { Paintable, PaintableRef } from 'paintablejs/react';
import styles from './App.module.css';

function App() {
  const paintableRef = useRef<PaintableRef>(null);
  const [color, setColor] = useState('blue');
  const [active, setActive] = useState(false);
  const [thickness, setThickness] = useState(5);
  const [useEraser, setUseEraser] = useState(false);
  return (
    <div>
      <div>
        <button onClick={() => paintableRef.current?.undo()}>Undo</button>
        <button onClick={() => paintableRef.current?.redo()}>Redo</button>
        <button
          onClick={() => {
            setUseEraser(false);
            setActive(!active);
          }}
        >
          {active ? 'save' : 'edit'}
        </button>
        <button onClick={() => setUseEraser(!useEraser)}>
          {useEraser ? 'use pencil' : 'use eraser'}
        </button>
        <input type="color" onChange={(e) => setColor(e.target.value)} />
        <input
          type="range"
          defaultValue={5}
          onChange={(e) => setThickness(Number(e.target.value))}
          min={1}
          max={30}
          step={1}
        />
      </div>

      <Paintable
        width={1024}
        height={768}
        active={active}
        color={color}
        thickness={thickness}
        useEraser={useEraser}
        ref={paintableRef}
        image={localStorage.getItem('/')}
        onSave={(image: string) => localStorage.setItem('/', image)}
        onLongPress={() => console.log('long')}
      >
        <div className={styles['canvas-inner']}>Test</div>
      </Paintable>
    </div>
  );
}

export default App;
