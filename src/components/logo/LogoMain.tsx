// next
import Image from 'next/image';

// ==============================|| LOGO ANAM ||============================== //

export default function LogoMain({ reverse }: { reverse?: boolean }) {
  return (
    <Image 
      src="/assets/images/auth/anam.png" 
      alt="Logo ANAM" 
      width={100} 
      height={100}
      style={{ objectFit: 'contain' }}
    />
  );
}
