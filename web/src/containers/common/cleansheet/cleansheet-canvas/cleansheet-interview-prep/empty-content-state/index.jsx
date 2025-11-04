import React from 'react';

export default function PlaceholderPanel({ icon, title, subtitle }) {
  return (
    <div
      className="col-span-2 text-center p-10"
      style={{ color: 'var(--color-neutral-text-light)' }}
    >
      <div className="flex flex-col items-center justify-center">
        <div style={{ fontSize: 48, opacity: 0.25, marginBottom: 16 }}>{icon}</div>
        <p style={{ fontFamily: 'var(--font-family-ui)', fontSize: 15 }}>{title}</p>
        {subtitle && <p style={{ fontSize: 13, marginTop: 8 }}>{subtitle}</p>}
      </div>
    </div>
  );
}
