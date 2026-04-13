export const ErrorMessageBox = ({ message }: { message: string }) => (
  <section className="p-8">
    <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {message}
    </p>
  </section>
);
