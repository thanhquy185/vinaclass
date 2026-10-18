interface HeaderProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function Header({ left, right }: HeaderProps) {
  return (
    <header className="flex justify-between p-3 px-5">
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
