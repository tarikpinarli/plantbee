type PageHeaderProps = {
  title: string;
  content: string;
};

export const PageHeader = ({ title, content }: PageHeaderProps) => (
  <header className="mb-8">
    <h1 className="flex flex-col text-2xl font-bold mb-2 text-green-800">
      {title}
    </h1>
    <p className="text-slate-600 dark:text-slate-500 text-md">{content}</p>
  </header>
);
