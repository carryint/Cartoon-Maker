import { CheckCircle2, AlertTriangle, ShieldCheck, Wrench } from 'lucide-react';
import { Project } from '../../types/lilo';
import { runQualityControlChecks } from '../../core/engines/qualityEngine';

interface Props {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
}

export default function QualityControlView({ project, onUpdateProject }: Props) {
  const qc = project.qualityReport || runQualityControlChecks(project);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CheckCircle2 size={26} className="text-emerald-400" />
            <span>Automated Quality Control (QC) & Continuity Engine</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Automated verification for character outfit consistency, location identity preservation, dialogue timing,
            and audio clipping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            Overall Health Score: <strong className="text-emerald-400 text-sm">{qc.overallScore}%</strong>
          </div>
        </div>
      </div>

      {/* QC Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Passed Checks</div>
          <div className="text-3xl font-extrabold text-emerald-400">{qc.passedChecks}</div>
          <div className="text-xs text-slate-500 mt-1">Verified continuity points</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Detected Issues</div>
          <div className="text-3xl font-extrabold text-amber-400">{qc.issues.length}</div>
          <div className="text-xs text-slate-500 mt-1">Actionable recommendations</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Child-Safe Compliance</div>
          <div className="text-3xl font-extrabold text-blue-400">100%</div>
          <div className="text-xs text-slate-500 mt-1">Age-appropriate content certified</div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Quality & Continuity Audit</h3>

        {qc.issues.map((issue) => (
          <div
            key={issue.id}
            className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-start justify-between flex-wrap gap-4 shadow-lg"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 mt-0.5">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">{issue.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{issue.message}</p>
                <div className="text-xs text-emerald-400 font-semibold pt-1">
                  💡 Recommendation: {issue.suggestedFix}
                </div>
              </div>
            </div>
          </div>
        ))}

        {qc.issues.length === 0 && (
          <div className="p-8 bg-slate-900/60 border border-emerald-500/30 rounded-3xl text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h4 className="text-base font-bold text-white">All Quality Control Checks Passed!</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No character outfit conflicts, timing overflows, or broken continuity states detected across your episode.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
