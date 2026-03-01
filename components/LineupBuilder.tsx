import React, { useState, useEffect } from 'react';
import { Student, Group, Activity } from '../types';
import { X, Printer, User, AlertTriangle, ChevronDown } from 'lucide-react';

interface LineupBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (lineup: any) => void;
    initialLineup?: any;
    students: Student[];
    group?: Group;
    activity?: Activity;
}

const FORMATIONS = {
    '4-4-2': {
        name: '4-4-2',
        positions: [
            { id: 'GK', name: 'Goleiro', x: 50, y: 85 },
            { id: 'LB', name: 'Lat. Esq', x: 15, y: 65 },
            { id: 'CB1', name: 'Zagueiro', x: 38, y: 70 },
            { id: 'CB2', name: 'Zagueiro', x: 62, y: 70 },
            { id: 'RB', name: 'Lat. Dir', x: 85, y: 65 },
            { id: 'LM', name: 'Meia Esq', x: 15, y: 40 },
            { id: 'CM1', name: 'Volante', x: 38, y: 45 },
            { id: 'CM2', name: 'Meia', x: 62, y: 45 },
            { id: 'RM', name: 'Meia Dir', x: 85, y: 40 },
            { id: 'ST1', name: 'Atacante', x: 35, y: 15 },
            { id: 'ST2', name: 'Atacante', x: 65, y: 15 },
        ]
    },
    '4-3-3': {
        name: '4-3-3',
        positions: [
            { id: 'GK', name: 'Goleiro', x: 50, y: 85 },
            { id: 'LB', name: 'Lat. Esq', x: 15, y: 65 },
            { id: 'CB1', name: 'Zagueiro', x: 38, y: 70 },
            { id: 'CB2', name: 'Zagueiro', x: 62, y: 70 },
            { id: 'RB', name: 'Lat. Dir', x: 85, y: 65 },
            { id: 'CM1', name: 'Volante', x: 50, y: 50 },
            { id: 'CM2', name: 'Meia', x: 30, y: 40 },
            { id: 'CM3', name: 'Meia', x: 70, y: 40 },
            { id: 'LW', name: 'Ponta Esq', x: 15, y: 20 },
            { id: 'ST', name: 'Atacante', x: 50, y: 15 },
            { id: 'RW', name: 'Ponta Dir', x: 85, y: 20 },
        ]
    },
    '3-5-2': {
        name: '3-5-2',
        positions: [
            { id: 'GK', name: 'Goleiro', x: 50, y: 85 },
            { id: 'CB1', name: 'Zagueiro', x: 25, y: 70 },
            { id: 'CB2', name: 'Zagueiro', x: 50, y: 75 },
            { id: 'CB3', name: 'Zagueiro', x: 75, y: 70 },
            { id: 'LM', name: 'Ala Esq', x: 10, y: 45 },
            { id: 'CM1', name: 'Volante', x: 35, y: 50 },
            { id: 'CM2', name: 'Meia', x: 50, y: 35 },
            { id: 'CM3', name: 'Volante', x: 65, y: 50 },
            { id: 'RM', name: 'Ala Dir', x: 90, y: 45 },
            { id: 'ST1', name: 'Atacante', x: 35, y: 15 },
            { id: 'ST2', name: 'Atacante', x: 65, y: 15 },
        ]
    },
    '7-Society': {
        name: 'Society (3-2-1)',
        positions: [
            { id: 'GK', name: 'Goleiro', x: 50, y: 85 },
            { id: 'LB', name: 'Ala Esq', x: 20, y: 60 },
            { id: 'CB', name: 'Fixo', x: 50, y: 70 },
            { id: 'RB', name: 'Ala Dir', x: 80, y: 60 },
            { id: 'CM1', name: 'Meia', x: 35, y: 40 },
            { id: 'CM2', name: 'Meia', x: 65, y: 40 },
            { id: 'ST', name: 'Pivô', x: 50, y: 20 },
        ]
    }
};

export const LineupBuilder: React.FC<LineupBuilderProps> = ({ isOpen, onClose, onSave, initialLineup, students, group, activity }) => {
    const [formation, setFormation] = useState(initialLineup?.formation || '4-4-2');
    const [starters, setStarters] = useState<{ [key: string]: string }>(initialLineup?.starters || {});
    const [reserves, setReserves] = useState<string[]>(initialLineup?.reserves || []);
    const [selectedPos, setSelectedPos] = useState<string | null>(null);
    const [showPlayerSelect, setShowPlayerSelect] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    // Filter students by group if group is provided
    const eligibleStudents = group 
        ? students.filter(s => (s.groupIds || []).includes(group.id) && s.active)
        : students.filter(s => s.active);

    const handlePositionClick = (posId: string) => {
        setSelectedPos(posId);
        setSearchTerm('');
        setShowPlayerSelect(true);
    };

    const handlePlayerSelect = (studentId: string) => {
        if (!selectedPos) return;

        // Remove from reserves if present
        if (reserves.includes(studentId)) {
            setReserves(reserves.filter(id => id !== studentId));
        }

        // Remove from other starter positions if present
        const newStarters = { ...starters };
        Object.keys(newStarters).forEach(key => {
            if (newStarters[key] === studentId) delete newStarters[key];
        });

        newStarters[selectedPos] = studentId;
        setStarters(newStarters);
        setShowPlayerSelect(false);
        setSelectedPos(null);
    };

    const handleReserveAdd = (studentId: string) => {
        // Remove from starters if present
        const newStarters = { ...starters };
        Object.keys(newStarters).forEach(key => {
            if (newStarters[key] === studentId) delete newStarters[key];
        });
        setStarters(newStarters);

        if (!reserves.includes(studentId)) {
            setReserves([...reserves, studentId]);
        }
    };

    const handleRemoveStarter = (posId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newStarters = { ...starters };
        delete newStarters[posId];
        setStarters(newStarters);
    };

    const handleRemoveReserve = (studentId: string) => {
        setReserves(reserves.filter(id => id !== studentId));
    };

    const handleSave = () => {
        onSave({ formation, starters, reserves });
        onClose();
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
    };

    if (!isOpen) return null;

    const currentFormation = FORMATIONS[formation as keyof typeof FORMATIONS] || FORMATIONS['4-4-2'];
    const assignedStudentIds = [...Object.values(starters), ...reserves];
    const availableStudents = eligibleStudents
        .filter(s => !assignedStudentIds.includes(s.id))
        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0 print:static print:block">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] print:shadow-none print:max-h-none print:w-full print:max-w-none print:h-auto print:block">
                
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Escalação do Time</h2>
                        <p className="text-gray-500">{group?.name || 'Sem categoria definida'}</p>
                    </div>
                    <div className="flex gap-3">
                        <select 
                            value={formation} 
                            onChange={(e) => {
                                setFormation(e.target.value);
                                setStarters({}); // Reset starters on formation change
                            }}
                            className="border rounded-lg p-2 bg-gray-50 font-medium"
                        >
                            {Object.keys(FORMATIONS).map(f => (
                                <option key={f} value={f}>{FORMATIONS[f as keyof typeof FORMATIONS].name}</option>
                            ))}
                        </select>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                            <Printer className="w-4 h-4" /> Imprimir
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors">
                            Salvar
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Print Header (Visible only on print) */}
                <div className="hidden print:block p-8 text-center border-b-2 border-black mb-4">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Pitangueiras F.C.</h1>
                    <p className="text-xl font-bold uppercase">{group?.name || 'Escalação Oficial'}</p>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden print:overflow-visible print:flex-row print:gap-8 print:items-start">
                    
                    {/* Field Area */}
                    <div className="flex-1 bg-green-600 relative p-8 flex items-center justify-center min-h-[600px] print:min-h-[800px] print:w-[70%] print:p-0 print:bg-transparent print:border-2 print:border-black print:rounded-xl print:m-4">
                        {/* Field Markings */}
                        <div className="absolute inset-4 border-4 border-white/50 rounded-lg pointer-events-none print:border-black/20 print:inset-2">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b-4 border-x-4 border-white/50 rounded-b-lg print:border-black"></div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-4 border-x-4 border-white/50 rounded-t-lg print:border-black"></div>
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/50 -translate-y-1/2 print:bg-black"></div>
                            <div className="absolute top-1/2 left-1/2 w-32 h-32 border-4 border-white/50 rounded-full -translate-x-1/2 -translate-y-1/2 print:border-black"></div>
                        </div>

                        {/* Players */}
                        <div className="relative w-full h-full max-w-2xl aspect-[2/3] print:w-full print:h-full print:max-w-none">
                            {currentFormation.positions.map((pos) => {
                                const studentId = starters[pos.id];
                                const student = students.find(s => s.id === studentId);
                                
                                return (
                                    <div 
                                        key={pos.id}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-all hover:scale-110 print:scale-100"
                                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                        onClick={() => handlePositionClick(pos.id)}
                                    >
                                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 ${student ? 'border-white bg-white' : 'border-white/50 bg-white/20 hover:bg-white/40'} flex items-center justify-center shadow-lg overflow-hidden relative print:border-black print:w-20 print:h-20 print:shadow-none`}>
                                            {student ? (
                                                <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-8 h-8 text-white/70" />
                                            )}
                                            {student && (
                                                <button 
                                                    onClick={(e) => handleRemoveStarter(pos.id, e)}
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                                                >
                                                    <X className="w-6 h-6 text-white" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="mt-1 flex flex-col items-center">
                                            <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-0.5 print:bg-black print:text-white print:text-xs print:px-3 print:py-1 print:mb-1">
                                                {pos.name}
                                            </span>
                                            {student && (
                                                <span className="bg-white text-gray-900 text-xs px-2 py-1 rounded shadow font-bold whitespace-nowrap max-w-[120px] truncate print:border print:border-black print:text-sm print:bg-white print:shadow-none">
                                                    {student.name.split(' ')[0]}
                                                </span>
                                            )}
                                            {student && !(student.positions || []).some(p => pos.name.toLowerCase().includes(p.toLowerCase())) && (
                                                <span className="text-[10px] text-yellow-300 font-bold drop-shadow-md print:text-black flex items-center gap-0.5">
                                                    <AlertTriangle className="w-3 h-3" /> Adaptado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar / Bench */}
                    <div className="w-full lg:w-80 bg-gray-50 border-l flex flex-col print:w-[30%] print:border-l-2 print:border-black print:bg-transparent print:h-[800px] print:m-4">
                        <div className="p-4 border-b bg-white print:bg-transparent print:border-black">
                            <h3 className="font-bold text-gray-900 print:text-xl print:uppercase print:text-center">Banco de Reservas</h3>
                            <p className="text-xs text-gray-500 print:hidden">{reserves.length} jogadores relacionados</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 print:space-y-4 print:overflow-visible">
                            {reserves.map(id => {
                                const s = students.find(st => st.id === id);
                                if (!s) return null;
                                return (
                                    <div key={id} className="bg-white p-2 rounded-lg border shadow-sm flex items-center justify-between group print:border-black print:shadow-none print:bg-transparent">
                                        <div className="flex items-center gap-3">
                                            <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover border print:w-12 print:h-12 print:border-black" />
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 print:text-base">{s.name}</p>
                                                <p className="text-xs text-gray-500 print:text-black/60">{(s.positions || []).join(', ')}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveReserve(id)} className="text-gray-400 hover:text-red-500 print:hidden">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                            {reserves.length === 0 && (
                                <p className="text-center text-gray-400 text-sm py-8">Nenhum jogador no banco.</p>
                            )}
                        </div>

                        <div className="p-4 border-t bg-white print:hidden">
                            <button 
                                onClick={() => { setSelectedPos(null); setShowPlayerSelect(true); }}
                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <PlusIcon /> Adicionar ao Banco
                            </button>
                        </div>
                    </div>
                </div>

                {/* Print Footer */}
                <div className="hidden print:flex justify-between items-end p-8 border-t-2 border-black mt-auto">
                    <div>
                        <p className="text-sm font-bold uppercase text-gray-500">Adversário</p>
                        <p className="text-3xl font-black uppercase">{activity?.opponent || 'A definir'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold uppercase text-gray-500">Data do Jogo</p>
                        <p className="text-3xl font-black uppercase">{formatDate(activity?.date)}</p>
                    </div>
                </div>
            </div>

            {/* Player Selection Modal */}
            {showPlayerSelect && (
                <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-gray-900">
                                {selectedPos ? `Selecionar ${currentFormation.positions.find(p => p.id === selectedPos)?.name}` : 'Adicionar ao Banco'}
                            </h3>
                            <button onClick={() => setShowPlayerSelect(false)} className="p-1 hover:bg-gray-200 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2 border-b">
                            <input 
                                type="text" 
                                placeholder="Buscar jogador..." 
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {availableStudents.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Nenhum jogador disponível.</p>
                            ) : (
                                <div className="space-y-1">
                                    {availableStudents.map(student => {
                                        const isRecommended = selectedPos && (student.positions || []).some(p => 
                                            currentFormation.positions.find(pos => pos.id === selectedPos)?.name.toLowerCase().includes(p.toLowerCase())
                                        );

                                        return (
                                            <button 
                                                key={student.id}
                                                onClick={() => selectedPos ? handlePlayerSelect(student.id) : handleReserveAdd(student.id)}
                                                className={`w-full p-2 rounded-lg flex items-center gap-3 hover:bg-blue-50 transition-colors text-left ${isRecommended ? 'bg-green-50 border border-green-100' : ''}`}
                                            >
                                                <img src={student.photoUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover border" />
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-gray-900">{student.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-gray-500">{(student.positions || []).join(', ')}</p>
                                                        {isRecommended && (
                                                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-bold">Recomendado</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
