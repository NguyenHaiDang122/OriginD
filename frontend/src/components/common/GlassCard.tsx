import React from "react";

export default function GlassCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel-strong p-5 sm:p-6">
      {(title || subtitle) && (
        <div className="mb-4">
          {title ? <div className="card-title">{title}</div> : null}
          {subtitle ? <div className="card-subtitle mt-1">{subtitle}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
}

