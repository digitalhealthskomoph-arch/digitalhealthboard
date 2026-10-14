import React from 'react';
import { 
  BedDouble, 
  FileText, 
  Pill, 
  DollarSign, 
  Users, 
  Box, 
  Server, 
  Building2, 
  Smartphone, 
  Bot,
  Activity,
  LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export default function CategoryIcon({ name, ...props }: CategoryIconProps) {
  switch (name) {
    case 'BedDouble':
      return <BedDouble {...props} />;
    case 'FileText':
      return <FileText {...props} />;
    case 'Pill':
      return <Pill {...props} />;
    case 'DollarSign':
      return <DollarSign {...props} />;
    case 'Users':
      return <Users {...props} />;
    case 'Box':
      return <Box {...props} />;
    case 'Server':
      return <Server {...props} />;
    case 'Building2':
      return <Building2 {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Bot':
      return <Bot {...props} />;
    default:
      return <Activity {...props} />;
  }
}
