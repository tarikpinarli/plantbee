type Props = {
  message: string;
};

export const Toast = ({ message }: Props) => {
  return (
    <div className="absolute right-4 top-4 font-semibold bg-[#3a753a] text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
};
