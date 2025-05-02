export interface OptionMenuItemType {
  text: string; // Nama atau label untuk item menu
  icon?: string | React.ReactNode; // Ikon (className string atau ReactNode)
  href?: string; // Tautan untuk navigasi (opsional)
  linkProps?: object; // Properti tambahan untuk tautan (opsional)
  menuItemProps?: {
    className?: string; // Kelas CSS tambahan
    onClick?: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void; // Fungsi klik
  };
  divider?: boolean; // Apakah item ini divider/pemisah
  dividerProps?: object; // Properti tambahan untuk divider (opsional)
}
