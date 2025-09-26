import React from 'react';
import { MqttProvider, useMqtt } from './components/MqttProvider';
import { KPICards } from './components/KPICards';
import { EquipmentGrid } from './components/EquipmentGrid';
import { AlertsPanel } from './components/AlertsPanel';
import { ScheduleView } from './components/ScheduleView';
import { ControlPanel } from './components/ControlPanel';
import { MessageFeed } from './components/MessageFeed';

const DashboardContent: React.FC = () => {
  const { isConnected, messages } = useMqtt();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              FY-Fab 生产监控仪表板
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? '已连接' : '未连接'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-4">关键绩效指标</h2>
          <KPICards />
        </section>

        {/* Equipment Grid and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">设备状态</h2>
            <EquipmentGrid />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">警报</h2>
            <AlertsPanel />
          </div>
        </div>

        {/* Schedule and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScheduleView />
          </div>
          <div>
            <ControlPanel />
          </div>
        </div>

        {/* Message Feed */}
        <section>
          <h2 className="text-lg font-semibold mb-4">实时消息</h2>
          <MessageFeed messages={messages} />
        </section>
      </main>
    </div>
  );
};

function App() {
  return (
    <MqttProvider>
      <DashboardContent />
    </MqttProvider>
  );
}

export default App;