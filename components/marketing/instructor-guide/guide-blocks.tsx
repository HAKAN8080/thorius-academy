import type { GuideBlock } from "@/lib/content/instructor-guide";
import { cn } from "@/lib/utils";

function GuideParagraph({ text }: { text: string }) {
  return (
    <p className="text-base leading-relaxed text-primary-700 md:text-[1.05rem]">
      {text}
    </p>
  );
}

function GuideList({
  items,
  ordered,
}: {
  items: string[];
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "space-y-2 pl-1 text-primary-700",
        ordered ? "list-decimal pl-6" : "list-disc pl-6"
      )}
    >
      {items.map((item) => (
        <li key={item} className="leading-relaxed marker:text-accent-600">
          {item}
        </li>
      ))}
    </Tag>
  );
}

function GuideCallout({
  text,
  label,
}: {
  text: string;
  label?: string;
}) {
  return (
    <div className="rounded-xl border border-accent-500/25 bg-gradient-to-br from-accent-50 to-primary-50 px-5 py-4">
      {label ? (
        <p className="mb-2 text-sm font-semibold text-accent-700">{label}</p>
      ) : null}
      <p className="text-primary-800 leading-relaxed">{text}</p>
    </div>
  );
}

function GuideHighlight({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-primary-200 bg-primary-900 px-5 py-4 text-base font-semibold leading-relaxed text-white shadow-md">
      {text}
    </p>
  );
}

function GuideTableBlock({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-primary-100 shadow-sm">
      <table className="w-full min-w-[320px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-primary-900 text-white">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 font-semibold first:rounded-tl-xl last:rounded-tr-xl"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.join("-")}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-primary-50/80"}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className="border-t border-primary-100 px-4 py-3 text-primary-800"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "p":
            return <GuideParagraph key={index} text={block.text} />;
          case "h3":
            return (
              <h3
                key={index}
                id={block.id}
                className="pt-2 text-xl font-bold text-primary-900"
              >
                {block.text}
              </h3>
            );
          case "h4":
            return (
              <h4
                key={index}
                id={block.id}
                className="pt-1 text-lg font-semibold text-primary-900"
              >
                {block.text}
              </h4>
            );
          case "ul":
            return <GuideList key={index} items={block.items} />;
          case "ol":
            return <GuideList key={index} items={block.items} ordered />;
          case "callout":
            return (
              <GuideCallout key={index} text={block.text} label={block.label} />
            );
          case "highlight":
            return <GuideHighlight key={index} text={block.text} />;
          case "table":
            return (
              <GuideTableBlock
                key={index}
                headers={block.table.headers}
                rows={block.table.rows}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
