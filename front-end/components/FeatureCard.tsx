'use client';

import React from 'react';

interface FeatureCardProps {
  children: React.ReactNode;
}

export default function FeatureCard({ children }: FeatureCardProps) {
  return (
    <div className="feature-card-container noselect">
      <div className="feature-canvas">
        {Array.from({ length: 25 }, (_, i) => (
          <div key={i} className={`feature-tracker ftr-${i + 1}`} />
        ))}
        <div className="feature-card">
          {children}
        </div>
      </div>
    </div>
  );
}
