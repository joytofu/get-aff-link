'use client';

import ReactMarkdown from "react-markdown";
import content from "./content.md";

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-dark-light rounded-2xl shadow-xl overflow-hidden border border-gray-800 transition-all duration-300 hover:shadow-primary/20">
        <div className="p-8 sm:p-10">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl sm:text-4xl font-bold text-heading mb-6 border-b border-gray-700 pb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl sm:text-3xl font-bold text-heading mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl sm:text-2xl font-semibold text-heading mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>,
              a: ({ children, href }) => <a href={href} className="text-secondary hover:text-primary transition-colors duration-200 underline underline-offset-2">{children}</a>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-4 text-gray-300 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 text-gray-300 space-y-2">{children}</ol>,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-gray-400 my-6">{children}</blockquote>
            }}
          >{content}</ReactMarkdown>
        </div>
        <div className="bg-primary/10 px-8 py-6 border-t border-gray-800">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} GETAFF.LINK. All rights reserved.</p>
        </div>
      </article>
    </div>
  );
}
