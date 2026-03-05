
import React from 'react';
import { LayoutDashboard, Users, Calendar, Wallet, LogOut, Shirt, Ticket, X, Settings } from 'lucide-react';
import { User, UserRole } from '../types';

import { Logo } from './Logo';

interface SidebarProps {
  currentUser: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentPage, onNavigate, onLogout, isOpen, onClose }) => {
  
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
    { id: 'students', label: currentUser.role === UserRole.RESPONSAVEL ? 'Meus Filhos' : 'Alunos & Responsáveis', icon: Users, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
    { id: 'groups', label: 'Grupos', icon: Shirt, roles: [UserRole.ADMIN, UserRole.PROFESSOR] },
    { id: 'plans', label: 'Planos', icon: Ticket, roles: [UserRole.ADMIN] },
    { id: 'schedule', label: 'Agenda', icon: Calendar, roles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESPONSAVEL] },
    { id: 'finance', label: 'Fluxo de Caixa', icon: Wallet, roles: [UserRole.ADMIN] },
    { id: 'analysis', label: 'Análise IA', icon: LayoutDashboard, roles: [UserRole.ADMIN] },
    { id: 'users', label: 'Usuários do Sistema', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white shadow-xl z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg shadow-lg">
                <Logo className="w-10 h-10 object-contain" />
            </div>
            <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight">Pitangueiras</h1>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Futebol Clube</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            if (!item.roles.includes(currentUser.role)) return null;
            
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              {currentUser.role === UserRole.ADMIN ? (
                <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center shadow-lg overflow-hidden">
                  <Logo alt="Admin" className="w-full h-full object-contain" />
                </div>
              ) : (
                <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-blue-500 bg-white" />
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {currentUser.role === UserRole.ADMIN ? 'Administrador' : 
                 currentUser.role === UserRole.RESPONSAVEL ? 'Responsável' : 'Professor'}
              </p>
            </div>
          </div>
          <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-xs transition-colors border border-gray-700"
          >
              <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>
    </>
  );
};
