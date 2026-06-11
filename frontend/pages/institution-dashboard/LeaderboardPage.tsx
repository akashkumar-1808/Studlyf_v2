import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, QrCode, Search, Download, Award } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';



interface LeaderboardEntry {
    rank: number;
    team_name: string;
    project_title: string;
    total_score: number;
    college?: string;
    prize?: string;
}

interface LeaderboardPageProps {
    eventId?: string;
    refreshCounter?: number;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ eventId, refreshCounter }) => {
    const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [templates, setTemplates] = useState<{ template_id: string; name: string; description?: string }[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/institution/cert-templates`, {
                    headers: { ...authHeaders() }
                });
                if (res.ok) {
                    const data = await res.json();
                    const mapped = (Array.isArray(data) ? data : []).map((t: any) => ({
                        template_id: String(t.template_id || t.id || ''),
                        name: t.name || t.template_name || 'Certificate Template',
                        description: t.description || '',
                    })).filter(t => t.template_id);
                    setTemplates(mapped);
                }
            } catch (error) {
                console.error("Error fetching templates:", error);
            }
        };
        fetchTemplates();
    }, []);

    useEffect(() => {
        const fetchRankings = async () => {
            if (!eventId) return;
            try {
                // First, try to refresh/recalculate unified leaderboard standings
                try {
                    await fetch(`${API_BASE_URL}/api/v1/institution/leaderboard/${eventId}/refresh`, {
                        method: 'POST',
                        headers: { ...authHeaders() }
                    });
                } catch (e) {
                    console.warn("Leaderboard refresh error:", e);
                }

                // Primary: unified institution leaderboard (supports both standard and stage submissions)
                let res = await fetch(`${API_BASE_URL}/api/v1/institution/leaderboard/${eventId}`, {
                    headers: { ...authHeaders() }
                });

                let data = [];
                if (res.ok) {
                    data = await res.json();
                }

                // Fallback 1: hackathon submissions leaderboard
                if (!res.ok || !Array.isArray(data) || data.length === 0) {
                    const fallbackRes1 = await fetch(`${API_BASE_URL}/api/hackathons/events/${eventId}/leaderboard?include_all=true`, {
                        headers: { ...authHeaders() }
                    });
                    if (fallbackRes1.ok) {
                        res = fallbackRes1;
                        data = await fallbackRes1.json();
                    }
                }

                // Fallback 2: legacy judging leaderboard (submissions_col)
                if (!res.ok || !Array.isArray(data) || data.length === 0) {
                    const fallbackRes2 = await fetch(`${API_BASE_URL}/api/judging/leaderboard/${eventId}`, {
                        headers: { ...authHeaders() }
                    });
                    if (fallbackRes2.ok) {
                        res = fallbackRes2;
                        data = await fallbackRes2.json();
                    }
                }

                if (res.ok) {
                    const mapped = (Array.isArray(data) ? data : []).map((d: any) => ({
                        rank: d.rank,
                        team_name: d.teamName || d.team_name || d.student_name || '',
                        project_title: d.projectTitle || d.project_title || d.project_name || d.teamLead || d.student_name || '',
                        total_score: Number(d.totalScore ?? d.total_score ?? 0),
                        college: d.college || d.institution || d.institution_name,
                        criteria_scores: d.rubricScores || d.rubric_scores || d.criteria_scores || {}
                    }));
                    setRankings(mapped);
                } else {
                    setRankings([]);
                }
            } catch (error) {
                try { console.error("Integration Error:", error instanceof Error ? error.message : String(error)); } catch (_) {}
                setRankings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, [eventId, refreshCounter]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-[#fafafa] text-gray-400 italic">Synchronizing Live Standings...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#fafafa]">

            
            <main className="p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
                                <TrendingUp size={14} />
                                Live Results
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Hall of Fame</h1>
                            <p className="text-gray-500 mt-1">Dynamic rankings powered by institutional scoring.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-xl shadow-sm">
                                <select
                                    value={selectedTemplateId}
                                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                                    className="bg-transparent border-0 text-sm font-bold text-gray-700 outline-none cursor-pointer"
                                >
                                    <option value="">Select Certificate Template...</option>
                                    {templates.map((t) => (
                                        <option key={t.template_id} value={t.template_id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    onClick={async () => {
                                        if (!selectedTemplateId) {
                                            alert("Please select a certificate template first.");
                                            return;
                                        }
                                        if (window.confirm("Issue certificates to the Top 3 winners using the selected template?")) {
                                            try {
                                                const res = await fetch(`${API_BASE_URL}/api/v1/institution/events/${eventId}/certificates/issue-ranked`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                                                    body: JSON.stringify({
                                                        template_id: selectedTemplateId,
                                                        limit: 3,
                                                        send_email: true
                                                    })
                                                });
                                                if (res.ok) {
                                                    alert("Winner certificates issued successfully!");
                                                } else {
                                                    const errData = await res.json().catch(() => ({}));
                                                    alert(`Failed to issue certificates: ${errData.detail || errData.message || 'Unknown error'}`);
                                                }
                                            } catch (error) {
                                                alert("Error: Failed to reach the certificate service.");
                                            }
                                        }
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#6C3BFF] text-white rounded-lg font-bold shadow-lg shadow-purple-950/20 hover:scale-[1.02] transition-all"
                                >
                                    <Award size={18} />
                                    Issue Winner Certificates
                                </button>
                            </div>
                            <button 
                                onClick={() => window.open(`${API_BASE_URL}/api/v1/institution/leaderboard/${eventId}/export-pdf`, '_blank')}
                                className="flex items-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-xl font-bold shadow-sm hover:scale-[1.02] transition-all"
                            >
                                <Download size={18} />
                                Export as PDF
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 shadow-sm hover:border-blue-400 transition-all">
                                <QrCode size={18} />
                                Verify Results
                            </button>
                        </div>
                    </div>
                    {/* Overall Standings Table */}
                    <div className="bg-white rounded-[3rem] border border-gray-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Overall Standings</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input type="text" placeholder="Search team..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all w-48" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-slate-50/30">
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rank</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Team & Project</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Score Breakdown</th>
                                        <th className="px-10 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Final Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankings.length === 0 ? (
                                        <tr><td className="p-24 text-center text-gray-400 font-medium">Synchronizing live data...</td></tr>
                                    ) : (
                                        rankings.map((r: any) => (
                                            <React.Fragment key={r.rank}>
                                                <tr 
                                                    onClick={() => setExpandedTeam(expandedTeam === r.team_name ? null : r.team_name)}
                                                    className={`border-b border-gray-50 last:border-0 hover:bg-slate-50/80 transition-all cursor-pointer group ${expandedTeam === r.team_name ? 'bg-slate-50' : ''}`}
                                                >
                                                    <td className="px-10 py-8 w-16">
                                                        <span className="text-2xl font-black text-slate-300 group-hover:text-blue-500 transition-colors">#{r.rank}</span>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="font-black text-gray-900 text-lg tracking-tight">{r.team_name}</div>
                                                        <div className="text-xs font-medium text-gray-400 mt-1">{r.project_title || 'Unlisted Project'}</div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex gap-2">
                                                            {r.criteria_scores ? Object.entries(r.criteria_scores).slice(0, 3).map(([key, val]: any) => (
                                                                <div key={key} className="px-3 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{key}</div>
                                                                    <div className="text-xs font-black text-blue-600">{val}</div>
                                                                </div>
                                                            )) : (
                                                                <span className="text-xs text-slate-300 italic font-medium">Click for details</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{r.total_score}</div>
                                                        <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Verified</div>
                                                    </td>
                                                </tr>
                                                <AnimatePresence>
                                                    {expandedTeam === r.team_name && (
                                                        <tr>
                                                            <td colSpan={4} className="bg-white border-b border-gray-100">
                                                                <motion.div 
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="p-10 bg-slate-50/50 grid grid-cols-1 md:grid-cols-4 gap-8">
                                                                        {r.criteria_scores ? Object.entries(r.criteria_scores).map(([key, val]: any) => (
                                                                            <div key={key} className="space-y-3">
                                                                                <div className="flex justify-between items-center">
                                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key}</label>
                                                                                    <span className="text-sm font-black text-blue-600">{val}</span>
                                                                                </div>
                                                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                                                                    <motion.div 
                                                                                        initial={{ width: 0 }}
                                                                                        animate={{ width: `${(val/25)*100}%` }}
                                                                                        className="h-full bg-blue-500 rounded-full"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )) : (
                                                                            <div className="col-span-4 text-center py-6 text-slate-400 italic">No dimension scores found for this entry.</div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>


        </div>
    );
};

export default LeaderboardPage;

