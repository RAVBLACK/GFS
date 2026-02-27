import { Loader2 } from "lucide-react";

const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
    <p className="text-muted-foreground font-semibold">{message}</p>
  </div>
);

export default LoadingScreen;
