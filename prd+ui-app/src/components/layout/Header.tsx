import { Activity, Home, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { MQTTConnectionStatus } from "@/components/mqtt/MQTTConnectionStatus";
import { Separator } from "@/components/ui/separator";

export const Header: React.FC = () => {
  return (
    <header className="glass-effect border-b">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-lg">
                <Activity className="w-5 h-5 text-white dark:text-gray-900" />
              </div>
              <h1 className="text-xl font-bold text-gradient">MES 控制中心</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <nav className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <Link to="/" className="flex items-center gap-1 hover:text-gray-900">
                <Home className="w-4 h-4" /> 首页
              </Link>
              <Link to="/example" className="flex items-center gap-1 hover:text-gray-900">
                <Info className="w-4 h-4" /> 示例
              </Link>
            </nav>
          </div>
          <MQTTConnectionStatus clientIdPrefix="production-monitor" />
        </div>
      </div>
    </header>
  );
};
