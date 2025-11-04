import React from 'react';
import { FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function JobsTable({
  jobs = [],
  onRowClick = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  const COLORS = {
    neutralText: '#333333',
    neutralTextLight: '#666666',
    neutralTextMuted: '#999999',
    neutralBg: '#f5f5f7',
    neutralBorder: '#e5e5e7',
    dark: '#1a1a1a',

    overdueBg: '#fef2f2',
    overdueText: '#dc2626',
    dueSoonBg: '#fffbeb',
    dueSoonText: '#f59e0b',
    normalBg: '#f0f9ff',
    normalText: '#0369a1',
    normalBorder: '#e0e7ff',
    noneBg: '#f5f5f7',
    noneText: '#999999',
    noneBorder: '#e5e5e7',

    interestedBg: '#f3e5f5',
    interestedText: '#7b1fa2',
    notInterestedBg: '#f5f5f5',
    notInterestedText: '#666666',

    primaryBlue: '#0066CC',
  };

  const statusMap = {
    interested: { label: 'Interested', bg: COLORS.interestedBg, text: COLORS.interestedText },
    applied: { label: 'Applied', bg: '#eff6ff', text: '#1d4ed8' },
    interviewing: { label: 'Interviewing', bg: '#fff7ed', text: '#c2410c' },
    offer: { label: 'Offer', bg: '#ecfdf5', text: '#166534' },
    rejected: { label: 'Rejected', bg: '#fff1f2', text: '#b91c1c' },
    'not-interested': {
      label: 'Not interested',
      bg: COLORS.notInterestedBg,
      text: COLORS.notInterestedText,
    },
  };

  const truncate = (s = '', n = 60) => (s && s.length > n ? `${s.slice(0, n - 3)}...` : s);

  const formatDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const computeDateMeta = (isoDate) => {
    if (!isoDate) return { label: null, state: 'normal', level: 'normal' };
    const due = new Date(isoDate);
    if (Number.isNaN(due.getTime())) return { label: isoDate, state: 'normal', level: 'normal' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueZero = new Date(due);
    dueZero.setHours(0, 0, 0, 0);

    const days = Math.ceil((dueZero - today) / (1000 * 60 * 60 * 24));

    if (days < 0)
      return {
        label: `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`,
        state: 'overdue',
        level: 'overdue',
      };
    if (days === 0) return { label: 'Due today', state: 'due-soon', level: 'due-soon' };
    if (days === 1) return { label: 'Due tomorrow', state: 'due-soon', level: 'due-soon' };
    if (days <= 3) return { label: `Due in ${days} days`, state: 'due-soon', level: 'due-soon' };
    if (days <= 7) return { label: `Due in ${days} days`, state: 'normal', level: 'normal' };
    return { label: formatDate(isoDate), state: 'normal', level: 'normal' };
  };

  const getNextAction = (job) => {
    if (job?.nextActionText || job?.nextActionDate || job?.nextActionStatus) {
      const rawText =
        job.nextActionText ||
        (job.todos || []).find((t) => !t.completed)?.text ||
        'No pending tasks';
      const text = truncate(rawText, 60);
      let dateLabel = null;
      let dateState = job.nextActionStatus || 'normal';
      let alertLevel = job.nextActionStatus || 'normal';
      if (job.nextActionDate) {
        const d = computeDateMeta(job.nextActionDate);
        dateLabel = d.label;
        dateState = job.nextActionStatus || d.state;
        alertLevel = job.nextActionStatus || d.level;
      }
      return { text, dateLabel, dateState, alertLevel };
    }
    const nextTodo = (job.todos || []).find((t) => !t.completed) || null;
    if (!nextTodo)
      return { text: 'No pending tasks', dateLabel: null, dateState: 'normal', alertLevel: 'none' };
    const meta = nextTodo.dueDate
      ? computeDateMeta(nextTodo.dueDate)
      : { label: null, state: 'normal', level: 'normal' };
    return {
      text: truncate(nextTodo.text || 'Task', 60),
      dateLabel: meta.label,
      dateState: meta.state,
      alertLevel: meta.level,
    };
  };

  const getAlertDisplay = (job) => {
    if (Number.isFinite(job?.alertCount) || job?.alertLevel) {
      const count = Number.isFinite(job?.alertCount) ? job.alertCount : 0;
      const level = job?.alertLevel || 'none';
      const tooltip =
        job?.alertTooltip ||
        (level === 'none'
          ? 'No pending tasks'
          : level === 'overdue'
            ? 'Overdue tasks'
            : level === 'due-soon'
              ? 'Due soon'
              : 'Active tasks');
      return { count, level, tooltip };
    }

    const todos = job?.todos || [];
    const now = new Date();
    const overdue = todos.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now,
    ).length;
    const dueSoon = todos.filter((t) => {
      if (t.completed || !t.dueDate) return false;
      const todayZero = new Date();
      todayZero.setHours(0, 0, 0, 0);
      const dueZero = new Date(t.dueDate);
      dueZero.setHours(0, 0, 0, 0);
      const diff = Math.ceil((dueZero - todayZero) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 3;
    }).length;
    const active = todos.filter((t) => !t.completed).length;

    if (overdue > 0) return { count: overdue, level: 'overdue', tooltip: `Overdue tasks` };
    if (dueSoon > 0) return { count: dueSoon, level: 'due-soon', tooltip: `Due soon` };
    if (active > 0) return { count: active, level: 'normal', tooltip: `Active tasks` };
    return { count: 0, level: 'none', tooltip: 'No pending tasks' };
  };

  const alertStyleFor = (level) => {
    switch (level) {
      case 'overdue':
        return {
          background: COLORS.overdueBg,
          color: COLORS.overdueText,
          border: `2px solid ${COLORS.overdueText}`,
        };
      case 'due-soon':
        return {
          background: COLORS.dueSoonBg,
          color: COLORS.dueSoonText,
          border: `2px solid ${COLORS.dueSoonText}`,
        };
      case 'normal':
        return {
          background: COLORS.normalBg,
          color: COLORS.normalText,
          border: `2px solid ${COLORS.normalBorder}`,
        };
      default:
        return {
          background: COLORS.noneBg,
          color: COLORS.noneText,
          border: `2px solid ${COLORS.noneBorder}`,
        };
    }
  };

  const localStyles = `
    .job-action-btn {
      background: none;
      border: none;
      color: ${COLORS.neutralText};
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .job-action-btn:hover {
      background: ${COLORS.neutralBg};
      color: ${COLORS.dark};
    }
    .job-action-btn.delete.disabled {
      background: none;
      border: none;
      color: ${COLORS.neutralTextLight};
      cursor: not-allowed;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.5;
    }
    .job-action-btn.delete.enabled {
      cursor: pointer;
      color: ${COLORS.neutralText};
      opacity: 1;
    }
    .job-action-btn.delete.enabled:hover {
      background: #fef2f2 !important;
      color: #dc2626 !important;
    }
    .jobs-table td { vertical-align: top; }
  `;

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
      <style>{localStyles}</style>

      <table
        className="w-full min-w-[880px] table-auto jobs-table"
        style={{ borderCollapse: 'collapse', background: '#ffffff', borderRadius: 8 }}
      >
        <thead style={{ background: COLORS.dark, color: '#ffffff' }}>
          <tr>
            <th className="px-5 py-3 text-left text-sm font-medium" style={{ width: '22%' }}>
              Position
            </th>
            <th className="px-5 py-3 text-left text-sm font-medium" style={{ width: '18%' }}>
              Company
            </th>
            <th className="px-5 py-3 text-left text-sm font-medium" style={{ width: '12%' }}>
              Status
            </th>
            <th className="px-5 py-3 text-left text-sm font-medium" style={{ width: '12%' }}>
              Close Date
            </th>
            <th className="px-5 py-3 text-left text-sm font-medium" style={{ width: '19%' }}>
              Next Action
            </th>
            <th className="px-5 py-3 text-center text-sm font-medium" style={{ width: '9%' }}>
              Alerts
            </th>
            <th className="px-5 py-3 text-center text-sm font-medium" style={{ width: '8%' }}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="text-center py-12 text-sm"
                style={{ color: COLORS.neutralText }}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-12 h-12 opacity-30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M3 7h18M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>No job opportunities yet.</div>
                  <div style={{ color: COLORS.neutralTextMuted, fontSize: 12 }}>
                    Click "Add Job" to track a new opportunity.
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            jobs.map((job, idx) => {
              const isExample = !!job.isExample;
              const statusKey = (job.status || 'interested').toLowerCase();
              const status = statusMap[statusKey] || statusMap.interested;

              const next = getNextAction(job);
              const alert = getAlertDisplay(job);
              const alertInline = alertStyleFor(alert.level);

              return (
                <tr
                  key={`${job.title || 'job'}-${idx}`}
                  className={`${isExample ? 'bg-gray-50' : ''}`}
                  style={{
                    borderBottom: `1px solid ${COLORS.neutralBorder}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => onRowClick(idx)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.neutralBg)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isExample ? '#fafbfc' : '#ffffff')
                  }
                >
                  {/* Position */}
                  <td className="px-5 py-4" style={{ verticalAlign: 'top' }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: COLORS.dark,
                        wordBreak: 'break-word',
                      }}
                    >
                      {job.title}
                    </div>
                    {job.location && (
                      <div
                        style={{
                          fontSize: 11,
                          color: COLORS.neutralTextLight,
                          marginTop: 6,
                          display: 'flex',
                          gap: 6,
                          alignItems: 'center',
                        }}
                      >
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M12 21s-6.5-4.35-8-7a8 8 0 1116 0c-1.5 2.65-8 7-8 7z"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="10" r="2.5" strokeWidth="1.3" />
                        </svg>
                        <span style={{ wordBreak: 'break-word' }}>{job.location}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4" style={{ verticalAlign: 'top' }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: COLORS.neutralText,
                        wordBreak: 'break-word',
                      }}
                    >
                      {job.company}
                    </div>
                    {isExample && (
                      <div style={{ fontSize: 11, color: COLORS.neutralTextMuted, marginTop: 6 }}>
                        Example
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4" style={{ verticalAlign: 'top' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        background: status.bg,
                        color: status.text,
                        textTransform: 'capitalize',
                      }}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="px-5 py-4" style={{ verticalAlign: 'top' }}>
                    {job.closeDate ? (
                      <div style={{ fontSize: 14, fontWeight: 400, color: COLORS.neutralText }}>
                        {formatDate(job.closeDate)}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: 14,
                          color: COLORS.neutralTextLight,
                          fontStyle: 'italic',
                        }}
                      >
                        No date set
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4" style={{ verticalAlign: 'top' }}>
                    <div style={{ fontSize: 14, lineHeight: 1.3, color: COLORS.neutralText }}>
                      <div style={{ fontWeight: 400, wordBreak: 'break-word' }}>
                        {next.text || 'No pending tasks'}
                      </div>

                      {next.dateLabel && (
                        <div
                          style={{
                            marginTop: 6,
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            fontSize: 12,
                            color:
                              next.dateState === 'overdue'
                                ? COLORS.overdueText
                                : next.dateState === 'due-soon'
                                  ? COLORS.dueSoonText
                                  : COLORS.neutralTextMuted,
                            fontWeight:
                              next.dateState === 'overdue' || next.dateState === 'due-soon'
                                ? 600
                                : 400,
                          }}
                        >
                          <FiCalendar
                            style={{
                              width: 14,
                              height: 14,
                              color:
                                next.dateState === 'overdue'
                                  ? COLORS.overdueText
                                  : next.dateState === 'due-soon'
                                    ? COLORS.dueSoonText
                                    : COLORS.neutralTextMuted,
                            }}
                          />
                          <span>{next.dateLabel}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-center" style={{ verticalAlign: 'top' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        fontSize: 12,
                        fontWeight: 600,
                        border: alertInline.border,
                        background: alertInline.background,
                        color: alertInline.color,
                      }}
                      title={alert.tooltip}
                      aria-label={alert.tooltip}
                    >
                      {alert.count}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-center" style={{ verticalAlign: 'top' }}>
                    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(idx);
                        }}
                        title="Edit"
                        className="job-action-btn"
                        aria-label={`Edit ${job.title}`}
                      >
                        <FiEdit2 style={{ width: 16, height: 16 }} />
                      </button>

                      {isExample ? (
                        <button
                          onClick={(e) => e.stopPropagation()}
                          title="Cannot delete example job"
                          className="job-action-btn delete disabled"
                          aria-disabled="true"
                        >
                          <FiTrash2 style={{ width: 16, height: 16 }} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(idx);
                          }}
                          title="Delete"
                          className="job-action-btn delete enabled"
                          aria-label={`Delete ${job.title}`}
                        >
                          <FiTrash2 style={{ width: 16, height: 16 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
