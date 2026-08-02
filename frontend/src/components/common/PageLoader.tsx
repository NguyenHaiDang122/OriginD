import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
      <span className="text-white/50 text-sm font-medium animate-pulse">Đang tải dữ liệu...</span>
    </div>
  );
}
