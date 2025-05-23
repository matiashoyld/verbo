// Mock for lucide-react icons
const mockIcon = ({ className, size, ...props }) => 
  React.createElement('svg', { className, width: size, height: size, ...props });

export const Check = mockIcon;
export const Search = mockIcon;
export const Sliders = mockIcon;
export const ArrowRight = mockIcon;
export const Brain = mockIcon;
export const Clock = mockIcon;
export const Database = mockIcon;
export const Loader2 = mockIcon;
export const Maximize2 = mockIcon;
export const MessageSquare = mockIcon;
export const MinusCircle = mockIcon;
export const Play = mockIcon;
export const Sparkles = mockIcon;
export const XCircle = mockIcon;

// Default export
export default {
  Check,
  Search,
  Sliders,
  ArrowRight,
  Brain,
  Clock,
  Database,
  Loader2,
  Maximize2,
  MessageSquare,
  MinusCircle,
  Play,
  Sparkles,
  XCircle,
};