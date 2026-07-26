'use client';

  import React, { useState } from 'react';
  import { BriefSection as BriefSectionType } from '@/lib/briefParser';

  type BriefSectionProps = {
    section: BriefSectionType;
    isFirst?: boolean;
  };

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    teal: 'bg-teal-50 border-teal-200 text-teal-900',
  };

  const iconBgClasses = {
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    indigo: 'bg-indigo-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
    teal: 'bg-teal-100',
  };

  export default function BriefSection({ section, isFirst }: BriefSectionProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = async () => {
      await navigator.clipboard.writeText(section.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    };

    const colorClass = colorClasses[section.color as keyof typeof colorClasses] || colorClasses.blue;
    const iconBgClass = iconBgClasses[section.color as keyof typeof iconBgClasses] || iconBgClasses.blue;

    return (
      <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all ${isFirst ? '' : 'mt-4'}`}>
        <div
          className={`px-5 py-4 border-b cursor-pointer select-none ${colorClass}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${iconBgClass} rounded-xl flex items-center justify-center text-xl`}>
                {section.icon}
              </div>
              <h3 className="font-display font-semibold text-lg tracking-tight">
                {section.title}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="text-xs px-3 py-1.5 rounded-lg hover:bg-white/60 transition-colors font-medium"
                title="Copy section"
              >
                {copySuccess ? '✓ Copied' : '📋 Copy'}
              </button>
              <span className="text-base">
                {isCollapsed ? '▼' : '▲'}
              </span>
            </div>
          </div>
        </div>

        {!isCollapsed && (
          <div className="bg-white px-5 py-5">
            <div className="prose prose-sm max-w-none">
              {formatContent(section.content)}
            </div>
          </div>
        )}
      </div>
    );
  }

  function formatContent(content: string): React.ReactNode {
    const lines = content.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: 'bullet' | 'number' | null = null;

    const flushList = () => {
      if (currentList.length > 0) {
        if (listType === 'bullet') {
          elements.push(
            <ul key={elements.length} className="space-y-2 my-3">
              {currentList.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          );
        } else if (listType === 'number') {
          elements.push(
            <ol key={elements.length} className="space-y-2 my-3 list-decimal list-inside">
              {currentList.map((item, i) => (
                <li key={i} className="text-slate-700 leading-relaxed">{item}</li>
              ))}
            </ol>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.match(/^[•\-\*]\s+/)) {
        const content = trimmed.replace(/^[•\-\*]\s+/, '');
        if (listType !== 'bullet') {
          flushList();
          listType = 'bullet';
        }
        currentList.push(content);
      }
      else if (trimmed.match(/^\d+[\.)]\s+/)) {
        const content = trimmed.replace(/^\d+[\.)]\s+/, '');
        if (listType !== 'number') {
          flushList();
          listType = 'number';
        }
        currentList.push(content);
      }
      else if (trimmed.match(/^(Option|Choice)\s+\d+:/i)) {
        flushList();
        elements.push(
          <div key={elements.length} className="font-semibold text-slate-900 mt-4 mb-2">
            {trimmed}
          </div>
        );
      }
      else if (trimmed.match(/^(P0|P1|P2|Pros?:|Cons?:)/i)) {
        flushList();
        const match = trimmed.match(/^(P0|P1|P2)/i);
        if (match) {
          const priority = match[1].toUpperCase();
          const priorityColors = {
            'P0': 'bg-red-100 text-red-700 border-red-200',
            'P1': 'bg-orange-100 text-orange-700 border-orange-200',
            'P2': 'bg-blue-100 text-blue-700 border-blue-200',
          };
          const colorClass = priorityColors[priority as keyof typeof priorityColors];

          elements.push(
            <div key={elements.length} className="flex items-start gap-3 my-3">
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${colorClass}`}>
                {priority}
              </span>
              <span className="flex-1 text-slate-700 leading-relaxed">{trimmed}</span>
            </div>
          );
        } else {
          elements.push(
            <p key={elements.length} className="text-slate-700 leading-relaxed my-2 font-medium">
              {trimmed}
            </p>
          );
        }
      }
      else {
        flushList();
        elements.push(
          <p key={elements.length} className="text-slate-700 leading-relaxed my-2">
            {trimmed}
          </p>
        );
      }
    });

    flushList();

    return <>{elements}</>;
  }
