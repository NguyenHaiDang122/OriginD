import React from "react";

export default function PageSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-4">
        <h2 className="text-white/95 text-2xl font-bold tracking-tight">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-white/60 text-sm">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

