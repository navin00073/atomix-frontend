import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useHospital();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.patientId?.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `techshield-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-cyan-400" />
            Hospital Compliance & Tamper-Evident Audit Trail
          </h2>
          <p className="text-xs text-slate-400">
            Immutable log of all identification verifications, prescription signatures, robotic dispatches, and vending events
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 font-mono-tech"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit (JSON)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search Action, Details, Actor, or Patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="IDENTIFICATION">Identification</option>
            <option value="CONSULTATION">Consultation</option>
            <option value="DISPENSARY">Dispensary</option>
            <option value="ROBOTICS">Robotics</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono-tech uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Category & Severity</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Patient ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-tech">
              {(filteredLogs || []).map((log, index) => (
                <tr key={`${log.id}-${index}`} className="hover:bg-slate-850/50 transition">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {log.category}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          log.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    <div>{log.actor}</div>
                    <div className="text-[10px] text-slate-500">{log.role}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-cyan-300">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-md font-sans text-xs">
                    {log.details}
                  </td>
                  <td className="px-4 py-3 text-cyan-400">
                    {log.patientId || '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
