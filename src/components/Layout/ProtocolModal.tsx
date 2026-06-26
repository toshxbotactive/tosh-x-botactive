import { Shield, AlertTriangle, Lock, Eye, Brain, HeartHandshake, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

const PROTOCOL_RULES = [
  {
    icon: AlertTriangle,
    title: 'Risk Capital Only',
    description: 'Never trade with money you cannot afford to lose.',
  },
  {
    icon: Lock,
    title: 'No Revenge Trading',
    description: 'Accept manual or automated losses gracefully; let the system\'s cooling loops work without manual interference.',
  },
  {
    icon: Shield,
    title: 'Lock in Profits',
    description: 'Once your daily take-profit target is achieved, forcefully close out your session.',
  },
  {
    icon: Brain,
    title: 'Trust the Math Engine',
    description: 'Avoid repeatedly starting and pausing live bots mid-cycle; let the underlying indicators execute their full sequences.',
  },
  {
    icon: Eye,
    title: 'Active Session Oversight',
    description: 'Do not leave automated execution windows completely unmonitored during high-impact macro market events.',
  },
  {
    icon: HeartHandshake,
    title: 'Psychology First',
    description: 'If emotional fatigue, greed, or panic sets in, terminate execution instantly and step away from the terminal.',
  },
];

export function ProtocolModal() {
  const { showProtocolModal, toggleProtocolModal } = useAppStore();

  if (!showProtocolModal) return null;

  return (
    <div className="modal-overlay" onClick={toggleProtocolModal}>
      <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700/50">
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleProtocolModal}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
              <Shield className="w-8 h-8 text-warning" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">TOSH Systemic Discipline Protocol</h2>
              <p className="text-sm text-gray-400">Read and accept these trading rules</p>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="p-6 space-y-3">
          {PROTOCOL_RULES.map((rule, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-surface-light/50 border border-gray-800/30 hover:border-primary-500/20 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-warning/10 border border-warning/30">
                <rule.icon className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-warning">{index + 1}.</span>
                  <h3 className="text-sm font-semibold text-gray-200">{rule.title}</h3>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50">
          <button
            onClick={toggleProtocolModal}
            className="w-full btn-gold py-3 text-sm font-semibold"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
}
