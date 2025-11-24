'use client';

import { demoSamples } from '@/lib/demo-samples';
import { DemoSample } from '@/types';
import { BookOpen, X } from 'lucide-react';
import { useState } from 'react';

interface DemoSamplesPanelProps {
  onSelectSample: (sample: DemoSample) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoSamplesPanel({
  onSelectSample,
  isOpen,
  onClose
}: DemoSamplesPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | DemoSample['category']>('all');

  const categories = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'school', label: 'School', icon: '🏫' },
    { id: 'society', label: 'Society', icon: '🏘️' },
    { id: 'office', label: 'Office', icon: '💼' },
    { id: 'friends', label: 'Friends', icon: '👥' }
  ];

  const filteredSamples = selectedCategory === 'all'
    ? demoSamples
    : demoSamples.filter(s => s.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Demo Event Samples
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredSamples.map(sample => (
              <div
                key={sample.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                onClick={() => {
                  onSelectSample(sample);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {sample.title}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {sample.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {sample.text.substring(0, 150)}...
                </p>
                <button className="mt-3 text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                  Use this sample →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

