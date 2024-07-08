import React, { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Bitmap {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  x: number;
  y: number;
}

const RDPComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    socketRef.current = io('http://localhost:4000', {
      transports: ['websocket'],
    });

    socketRef.current.on('bitmap', (bitmap: Bitmap) => {
      const imgData = ctx.createImageData(bitmap.width, bitmap.height);
      imgData.data.set(bitmap.data);
      ctx.putImageData(imgData, bitmap.x, bitmap.y);
    });

    const handleMouse = (event: MouseEvent | WheelEvent) => {
      if (!socketRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if ('deltaY' in event) {
        socketRef.current.emit('mouse', { x, y, button: event.button, wheel: event.deltaY });
      } else {
        socketRef.current.emit('mouse', { x, y, button: event.button, wheel: 0 });
      }
    };

    const handleKeyboard = (event: KeyboardEvent) => {
      if (!socketRef.current) return;
      socketRef.current.emit('keyboard', { code: event.keyCode, down: event.type === 'keydown' });
    };

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mousedown', handleMouse);
    canvas.addEventListener('mouseup', handleMouse);
    canvas.addEventListener('wheel', handleMouse);
    window.addEventListener('keydown', handleKeyboard);
    window.addEventListener('keyup', handleKeyboard);

    return () => {
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mousedown', handleMouse);
      canvas.removeEventListener('mouseup', handleMouse);
      canvas.removeEventListener('wheel', handleMouse);
      window.removeEventListener('keydown', handleKeyboard);
      window.removeEventListener('keyup', handleKeyboard);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return <canvas ref={canvasRef} width="1024" height="768" style={{ border: '1px solid black' }} />;
};

export default RDPComponent;
