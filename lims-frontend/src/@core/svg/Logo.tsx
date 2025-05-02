// components/Logo.tsx
import React from "react";

// Extend the LogoProps to accept img element props like className, style, etc.
interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({
  alt = "Logo",
  width = 120,
  className,
  ...props
}) => {
  // Access the environment variable
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

  return (
    <div>
      <img
        src={logoUrl}
        alt={alt}
        width={width}
        className={className}
        {...props} // Spread any additional props passed to the component (e.g., onClick, etc.)
      />
    </div>
  );
};

export default Logo;
