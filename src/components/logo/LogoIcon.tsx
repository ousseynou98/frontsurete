// next
import Image from 'next/image';

// ==============================|| LOGO ICON ANAM ||============================== //

export default function LogoIcon() {
  return (
    <Image 
      src="/assets/images/auth/anam.png" 
      alt="Logo ANAM" 
      width={70} 
      height={70}
      style={{ objectFit: 'contain' }}
    />
  );
}
