import React, { useState } from 'react';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { MainContent } from '../MainContent/MainContent';
import { RightPanel } from '../RightPanel/RightPanel';
import { ProcessCard } from '../ProcessCard/ProcessCard';
import { KanbanBoard } from '../KanbanBoard/KanbanBoard';
import ClientesPage from '../Clients/ClientesPage';
import { mockProcesses } from '../../data/mockProcesses';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [currentModule, setCurrentModule] = useState('processos');
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);

  const handleModuleChange = (module: string) => {
    setCurrentModule(module);
  };

  const renderContent = () => {
    switch (currentModule) {
      case 'processos':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockProcesses.map((process) => (
              <ProcessCard
                key={process.id}
                process={process}
                onView={(id) => console.log('Visualizar processo:', id)}
                onEdit={(id) => console.log('Editar processo:', id)}
                onShare={(id) => console.log('Compartilhar processo:', id)}
              />
            ))}
          </div>
        );
      case 'kanban':
        return <KanbanBoard mode="local" />;
      case 'clientes':
        return <ClientesPage />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-soehne font-bold text-gray-900 mb-4">
              Módulo em Desenvolvimento
            </h2>
            <p className="text-gray-600 font-inter">
              Este módulo está sendo implementado e estará disponível em breve.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-lexiom-background flex">
      {/* Sidebar */}
      <Sidebar
        currentModule={currentModule}
        onModuleChange={handleModuleChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          currentModule={currentModule}
          onModuleChange={handleModuleChange}
        />

        {/* Content */}
        <div className="flex-1 flex">
          <MainContent
            title={
              currentModule === 'processos' ? 'Processos Jurídicos' :
              currentModule === 'documentos' ? 'Documentos' :
              currentModule === 'clientes' ? 'Clientes' :
              currentModule === 'agenda' ? 'Agenda' :
              currentModule === 'kanban' ? 'Quadro Kanban' :
              'Painel Principal'
            }
          >
            {children || renderContent()}
          </MainContent>

          {/* Right Panel */}
          {isRightPanelVisible && (
            <RightPanel
              isVisible={isRightPanelVisible}
              onClose={() => setIsRightPanelVisible(false)}
            />
          )}
        </div>
      </div>

      {/* Toggle Right Panel Button */}
      {!isRightPanelVisible && (
        <button
          onClick={() => setIsRightPanelVisible(true)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-lexiom-primary text-white p-3 rounded-l-lg shadow-lg hover:bg-lexiom-primary/90 transition-colors z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};
