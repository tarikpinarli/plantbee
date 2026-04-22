type Props = {
  status: string;
  styles?: string;
};

export const StatusTag = ({ status, styles }: Props) => {
  return (
    <span
      className={`${styles} px-3 py-1 text-sm font-bold rounded-full uppercase tracking-wider`}
    >
      {status}
    </span>
  );
};
