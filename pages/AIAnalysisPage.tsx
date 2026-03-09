import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Student, Activity, Transaction, TransactionType, PaymentStatus } from '../types';
import { Brain, Loader2, AlertTriangle, TrendingDown, TrendingUp, Users, DollarSign, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AIAnalysisPageProps {
  students: Student[];
  activities: Activity[];
  transactions: Transaction[];
}

interface AnalysisResult {
  churnAnalysis: {
    summary: string;
    riskFactors: string[];
    atRiskStudents: { name: string; reason: string; probability: string }[];
  };
  squadUtilization: {
    summary: string;
    underutilized: { name: string; games: number; trainings: number }[];
    overutilized: { name: string; games: number; trainings: number }[];
    correlationChurn: string;
  };
  financialHealth: {
    summary: string;
    feeFatigue: { groupName: string; averageExtraCost: number; riskLevel: string }[];
    abusiveFeesDetected: boolean;
  };
  recommendations: string[];
}

export const AIAnalysisPage: React.FC<AIAnalysisPageProps> = ({ students, activities, transactions }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Pre-process data to reduce token usage and focus on relevant metrics
      const activeStudents = students.filter(s => s.active);
      const inactiveStudents = students.filter(s => !s.active);
      
      const games = activities.filter(a => a.type === 'GAME');
      const trainings = activities.filter(a => a.type === 'TRAINING');

      const studentStats = students.map(s => {
        const myGames = games.filter(g => g.participants?.includes(s.id) || g.attendance?.includes(s.id));
        const myTrainings = trainings.filter(t => t.participants?.includes(s.id) || t.attendance?.includes(s.id));
        const myTx = transactions.filter(t => t.studentId === s.id && t.type === TransactionType.INCOME);
        const totalPaid = myTx.filter(t => t.status === PaymentStatus.PAID).reduce((acc, t) => acc + t.amount, 0);
        const extraFees = myTx.filter(t => t.category !== 'Mensalidade').length;
        
        return {
          id: s.id,
          name: s.name,
          age: s.birthDate, // AI can calc age
          status: s.active ? 'Active' : 'Inactive',
          gamesCount: myGames.length,
          trainingsCount: myTrainings.length,
          totalInvested: totalPaid,
          extraFeesCount: extraFees,
          groups: s.groupIds
        };
      });

      const summaryData = {
        totalStudents: students.length,
        inactiveCount: inactiveStudents.length,
        totalGames: games.length,
        studentStats: studentStats
      };

      // 2. Call Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Atue como um Analista de Dados Esportivos Sênior para uma academia de futebol.
        Analise os dados JSON abaixo e forneça insights estratégicos focados em retenção de alunos e saúde financeira.

        DADOS:
        ${JSON.stringify(summaryData)}

        OBJETIVOS DA ANÁLISE:
        1. **Análise de Convocação (Squad Utilization):** Identifique atletas que são muito convocados vs atletas esquecidos. Existe correlação entre "poucos jogos" e "cancelamento de matrícula" (Status: Inactive)?
        2. **Fadiga Financeira (Abuso de Taxas):** Identifique se alunos com muitas taxas extras (extraFeesCount alto) estão saindo ou inadimplentes.
        3. **Risco de Churn:** Com base nos padrões dos alunos inativos, quais alunos ATIVOS estão em risco de sair? (Ex: baixa frequência em jogos, mas paga mensalidade).
        4. **Recomendações:** Ações práticas para a diretoria.

        FORMATO DE RESPOSTA (JSON Obrigatório):
        {
          "churnAnalysis": {
            "summary": "Resumo textual sobre os cancelamentos.",
            "riskFactors": ["Fator 1", "Fator 2"],
            "atRiskStudents": [{ "name": "Nome", "reason": "Motivo", "probability": "Alta/Média" }]
          },
          "squadUtilization": {
            "summary": "Resumo sobre rodagem do elenco.",
            "underutilized": [{ "name": "Nome", "games": 0, "trainings": 0 }],
            "overutilized": [{ "name": "Nome", "games": 0, "trainings": 0 }],
            "correlationChurn": "Explicação se a falta de jogos causa saída."
          },
          "financialHealth": {
            "summary": "Resumo financeiro focado em taxas.",
            "feeFatigue": [{ "groupName": "Geral ou Nome do Grupo", "averageExtraCost": 0, "riskLevel": "Alto/Baixo" }],
            "abusiveFeesDetected": boolean
          },
          "recommendations": ["Ação 1", "Ação 2", "Ação 3"]
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const responseText = result.text;
      if (!responseText) throw new Error("No response from AI");
      const parsedAnalysis = JSON.parse(responseText);
      
      setAnalysis(parsedAnalysis);
      setLastUpdate(new Date());

    } catch (error) {
      console.error("Erro na análise IA:", error);
      alert("Não foi possível gerar a análise no momento. Verifique sua chave de API ou tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Inteligência Esportiva
          </h2>
          <p className="text-gray-500 text-sm">Análise preditiva de evasão e gestão de elenco baseada em dados.</p>
        </div>
        <button 
          onClick={generateAnalysis} 
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
          {isAnalyzing ? 'Analisando Dados...' : 'Gerar Nova Análise'}
        </button>
      </div>

      {!analysis && !isAnalyzing && (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <Brain className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-600">Nenhuma análise gerada</h3>
          <p className="text-gray-400 max-w-md mx-auto mt-2">Clique no botão acima para que a IA processe o histórico de jogos, financeiro e frequência dos atletas para gerar insights.</p>
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CHURN RISK CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
            <div className="flex items-center gap-3 mb-6 border-b border-red-50 pb-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600"><TrendingDown className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Risco de Evasão (Churn)</h3>
                <p className="text-xs text-gray-500">Alunos com probabilidade de sair</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50/50 p-4 rounded-xl text-sm text-gray-700 italic border-l-4 border-red-400">
                "{analysis.churnAnalysis.summary}"
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Principais Fatores de Risco</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.churnAnalysis.riskFactors.map((factor, idx) => (
                    <span key={idx} className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-bold">{factor}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Alunos em Alerta</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {analysis.churnAnalysis.atRiskStudents.map((student, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all">
                      <div>
                        <p className="font-bold text-gray-800">{student.name}</p>
                        <p className="text-xs text-red-500">{student.reason}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${student.probability === 'Alta' ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'}`}>
                        Risco {student.probability}
                      </span>
                    </div>
                  ))}
                  {analysis.churnAnalysis.atRiskStudents.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum aluno em risco crítico detectado.</p>}
                </div>
              </div>
            </div>
          </div>

          {/* SQUAD UTILIZATION CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
            <div className="flex items-center gap-3 mb-6 border-b border-blue-50 pb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Users className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Gestão de Elenco</h3>
                <p className="text-xs text-gray-500">Análise de convocações e oportunidades</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-gray-700 italic border-l-4 border-blue-400">
                "{analysis.squadUtilization.summary}"
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Pouco Utilizados</h4>
                  <div className="space-y-2">
                    {analysis.squadUtilization.underutilized.slice(0, 5).map((s, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{s.name}</span>
                        <span className="text-gray-500 text-xs">{s.games} jogos</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Mais Ativos</h4>
                  <div className="space-y-2">
                    {analysis.squadUtilization.overutilized.slice(0, 5).map((s, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{s.name}</span>
                        <span className="text-gray-500 text-xs">{s.games} jogos</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-xs text-yellow-800 font-bold">Correlação com Cancelamentos:</p>
                <p className="text-xs text-yellow-700 mt-1">{analysis.squadUtilization.correlationChurn}</p>
              </div>
            </div>
          </div>

          {/* FINANCIAL HEALTH CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
            <div className="flex items-center gap-3 mb-6 border-b border-green-50 pb-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600"><DollarSign className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Saúde Financeira & Taxas</h3>
                <p className="text-xs text-gray-500">Impacto de custos extras na retenção</p>
              </div>
            </div>
            
            <div className="space-y-4">
               <div className={`p-4 rounded-xl text-sm italic border-l-4 ${analysis.financialHealth.abusiveFeesDetected ? 'bg-red-50 text-red-700 border-red-400' : 'bg-green-50 text-green-700 border-green-400'}`}>
                "{analysis.financialHealth.summary}"
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Análise de Custo Extra (Uniforme, Torneios)</h4>
                <div className="space-y-2">
                  {analysis.financialHealth.feeFatigue.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                      <span className="font-bold text-gray-700">{item.groupName}</span>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Custo Médio Extra</p>
                        <p className="font-black text-gray-800">R$ {item.averageExtraCost.toFixed(2)}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${item.riskLevel === 'Alto' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        Risco {item.riskLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDATIONS CARD */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-6 border-b border-white/20 pb-4">
              <div className="p-3 bg-white/20 rounded-xl text-white"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-white">Recomendações da IA</h3>
                <p className="text-xs text-purple-200">Plano de ação sugerido</p>
              </div>
            </div>

            <ul className="space-y-4">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <div className="mt-1 min-w-[20px] h-5 bg-white text-purple-600 rounded-full flex items-center justify-center text-xs font-black">{idx + 1}</div>
                  <p className="text-sm font-medium leading-relaxed">{rec}</p>
                </li>
              ))}
            </ul>
            
            {lastUpdate && (
              <p className="text-[10px] text-purple-300 mt-6 text-right opacity-70">
                Última análise gerada em: {lastUpdate.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
