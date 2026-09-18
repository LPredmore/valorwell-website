import React from "react";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Info,
  ShieldCheck,
} from "lucide-react";

type ResourceDocumentProps = {
  content: RenderableTreeNode | RenderableTreeNode[];
};

type ResourceTagProps = {
  children?: React.ReactNode;
  title?: string;
};

function PanelTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#3B5147]">
        {icon}
      </span>
      <h3 className="m-0 text-base font-bold tracking-[-0.01em] text-[#111814]">{title}</h3>
    </div>
  );
}

function ResourceAnswer({
  children,
  title = "The direct answer",
}: ResourceTagProps) {
  return (
    <section className="not-prose my-8 rounded-2xl border border-[#3B5147]/20 bg-[#EEF2EE] px-5 py-5 md:px-6 md:py-6">
      <PanelTitle
        title={title}
        icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
      />
      <div className="resource-semantic-content text-[1.05rem] leading-7 text-[#111814]/80">
        {children}
      </div>
    </section>
  );
}

function ResourceTakeaways({
  children,
  title = "Key takeaways",
}: ResourceTagProps) {
  return (
    <section className="not-prose my-8 rounded-2xl border border-[#D7A92E]/35 bg-[#FBF7E9] px-5 py-5 md:px-6 md:py-6">
      <PanelTitle
        title={title}
        icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
      />
      <div className="resource-semantic-content text-[1.02rem] leading-7 text-[#111814]/78">
        {children}
      </div>
    </section>
  );
}

function ResourceSteps({
  children,
  title = "What to do",
}: ResourceTagProps) {
  return (
    <section className="not-prose my-8 rounded-2xl border border-[#3B5147]/16 bg-white px-5 py-5 shadow-[0_12px_40px_-34px_rgba(17,24,20,0.65)] md:px-6 md:py-6">
      <PanelTitle
        title={title}
        icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
      />
      <div className="resource-semantic-content resource-semantic-steps text-[1.02rem] leading-7 text-[#111814]/78">
        {children}
      </div>
    </section>
  );
}

function ResourceVerify({
  children,
  title = "Verify before you act",
  program,
}: ResourceTagProps & { program?: string }) {
  return (
    <aside className="not-prose my-8 border-l-4 border-[#D7A92E] bg-[#F8F5EC] px-5 py-4 md:px-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#3B5147]" aria-hidden="true" />
        <div>
          <p className="m-0 text-sm font-bold uppercase tracking-[0.08em] text-[#3B5147]">
            {title}
          </p>
          {program && (
            <p className="mt-1 text-sm font-semibold text-[#111814]/58">{program}</p>
          )}
          <div className="resource-semantic-content mt-3 text-base leading-7 text-[#111814]/74">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

function ResourceCallout({
  children,
  title = "Note",
  tone = "note",
}: ResourceTagProps & { tone?: "note" | "warning" }) {
  const warning = tone === "warning";

  return (
    <aside
      className={
        warning
          ? "not-prose my-8 rounded-xl border border-[#B24A3A]/24 bg-[#FBF0ED] px-5 py-4"
          : "not-prose my-8 rounded-xl border border-[#3B5147]/15 bg-[#F4F1E8] px-5 py-4"
      }
    >
      <div className="flex items-start gap-3">
        {warning ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B24A3A]" aria-hidden="true" />
        ) : (
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#3B5147]" aria-hidden="true" />
        )}
        <div>
          <p className="m-0 font-bold text-[#111814]">{title}</p>
          <div className="resource-semantic-content mt-2 text-base leading-7 text-[#111814]/74">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

function ResourceDefinition({
  children,
  term,
}: ResourceTagProps & { term?: string }) {
  return (
    <aside className="not-prose my-7 rounded-xl border border-[#3B5147]/15 bg-[#F7F5EF] px-5 py-4">
      {term && (
        <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-[#3B5147]">
          {term}
        </p>
      )}
      <div className="resource-semantic-content mt-2 text-base leading-7 text-[#111814]/74">
        {children}
      </div>
    </aside>
  );
}

function ResourceTable({ children }: { children?: React.ReactNode }) {
  return (
    <div className="not-prose my-8 overflow-x-auto rounded-xl border border-[#3B5147]/15">
      <table className="w-full min-w-[640px] border-collapse bg-white text-left text-sm leading-6">
        {children}
      </table>
    </div>
  );
}

const components = {
  ResourceAnswer,
  ResourceTakeaways,
  ResourceSteps,
  ResourceVerify,
  ResourceCallout,
  ResourceDefinition,
  ResourceTable,
};

export function ResourceDocument({ content }: ResourceDocumentProps) {
  return (
    <div className="resource-prose prose prose-lg max-w-none prose-headings:text-[#111814] prose-p:text-[#111814]/78 prose-li:text-[#111814]/78 prose-strong:text-[#111814] prose-a:font-semibold prose-a:text-[#3B5147] prose-a:decoration-[#3B5147]/30 prose-a:underline-offset-4 prose-blockquote:border-l-[#D7A92E] prose-blockquote:text-[#111814]/72 prose-hr:border-[#3B5147]/12">
      {Markdoc.renderers.react(content, React, { components })}
    </div>
  );
}
