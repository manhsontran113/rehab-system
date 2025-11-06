import { useRef, useEffect } from 'react';
import type { Landmark } from '../types';

interface VideoCaptureProps {
  isActive: boolean;
  onFrame: (frameData: string) => void;
  landmarks?: Landmark[];
  feedback?: string;
  repCount?: number;
  targetReps?: number;
  remainingTime?: number;
  analysisData?: {
    hold_time_remaining?: number;
    rep_count?: number;
  };
  currentExercise?: {
    target_reps: number;
  };
}

export const VideoCapture = ({
  isActive,
  onFrame,
  landmarks,
  feedback,
  repCount,
  targetReps,
  remainingTime,
  analysisData,
  currentExercise,
}: VideoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // ← Canvas riêng cho skeleton
  const streamRef = useRef<MediaStream | null>(null);
  const frameIdRef = useRef<number>();
  

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera.');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  // Capture and send frames
  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // ← Tắt alpha channel
    if (!ctx) return;

    let lastFrameTime = 0;
    const frameInterval = 40; // 25 FPS = 40ms

    const captureFrame = (timestamp: number) => {
      if (timestamp - lastFrameTime < frameInterval) {
        frameIdRef.current = requestAnimationFrame(captureFrame);
        return;
      }
      lastFrameTime = timestamp;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas size to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Send frame for processing
        const frameData = canvas.toDataURL('image/jpeg', 0.8);
        onFrame(frameData);
      }

      frameIdRef.current = requestAnimationFrame(captureFrame);
    };

    frameIdRef.current = requestAnimationFrame(captureFrame);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [isActive, onFrame]);

  // Draw skeleton on separate canvas (NO FLICKER)
  // Draw skeleton on separate canvas (NO FLICKER)
useEffect(() => {
  if (!landmarks || !overlayCanvasRef.current || !canvasRef.current) return;

  const overlayCanvas = overlayCanvasRef.current;
  const mainCanvas = canvasRef.current;
  const ctx = overlayCanvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Match overlay size to main canvas
  if (overlayCanvas.width !== mainCanvas.width || overlayCanvas.height !== mainCanvas.height) {
    overlayCanvas.width = mainCanvas.width;
    overlayCanvas.height = mainCanvas.height;
  }

  const { width, height } = overlayCanvas;

  // Clear overlay
  ctx.clearRect(0, 0, width, height);

  // Draw connections
  const connections = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
    [11, 23], [12, 24], [23, 24], // Torso
    [23, 25], [25, 27], [27, 29], [29, 31], // Left leg
    [24, 26], [26, 28], [28, 30], [30, 32], // Right leg
  ];

  // Draw lines
  ctx.strokeStyle = '#14b8a6'; // teal-500
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(20, 184, 166, 0.5)';
  ctx.shadowBlur = 8;

  connections.forEach(([start, end]) => {
    const startLm = landmarks[start];
    const endLm = landmarks[end];
    
    if (startLm && endLm && startLm.visibility > 0.5 && endLm.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo(startLm.x * width, startLm.y * height);
      ctx.lineTo(endLm.x * width, endLm.y * height);
      ctx.stroke();
    }
  });

  // Draw joints
  landmarks.forEach((lm) => {
    if (lm.visibility > 0.5) {
      ctx.fillStyle = '#f59e0b'; // amber-500
      ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 6, 0, 2 * Math.PI);
      ctx.fill();
    }
  });

  // Reset shadow
  ctx.shadowBlur = 0;
}, [landmarks]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Video element - rendered but invisible */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute opacity-0 pointer-events-none"
        style={{ width: '1px', height: '1px' }}
      />
      
      {/* Main canvas (video frames) */}
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg shadow-2xl border-4 border-teal-600"
        style={{ display: 'block' }}
      />

      {/* Overlay canvas (skeleton only) */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ borderRadius: '0.5rem' }}
      />

      {/* Feedback overlay */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-black bg-opacity-70 text-white px-6 py-4 rounded-lg">
          <p className="text-2xl font-bold">{feedback || 'Sẵn sàng...'}</p>
        </div>
      </div>
    </div>
  );
};