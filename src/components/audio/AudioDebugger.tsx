
interface AudioDebuggerProps {
  src: string;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
}

const AudioDebugger: React.FC<AudioDebuggerProps> = ({
  src,
  isLoading,
  hasError,
  errorMessage,
  duration,
  currentTime,
  isPlaying,
}) => {
  // Debug current state
  console.log('🎵 AudioPlayer current state:', {
    isLoading,
    hasError,
    errorMessage,
    duration,
    currentTime,
    isPlaying
  });

  // Source debugging
  console.log('🎵 AudioPlayer component received src prop:', src);
  console.log('🎵 AudioPlayer src type:', typeof src);
  console.log('🎵 AudioPlayer src length:', src ? src.length : 'N/A');

  return null; // This component only handles debugging, no UI
};

export default AudioDebugger;
