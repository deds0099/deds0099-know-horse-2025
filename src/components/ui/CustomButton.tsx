
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends ButtonProps {
  glassEffect?: boolean;
  neuEffect?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  className,
  glassEffect = false,
  neuEffect = false,
  variant = 'default',
  ...props
}) => {
  return (
    <Button
      className={cn(
        'transition-all duration-300 transform hover:translate-y-[-1px] active:translate-y-[1px]',
        glassEffect && 'backdrop-blur-sm bg-white/30 border border-white/20 hover:bg-white/40',
        neuEffect && 'shadow-neu hover:shadow-none border-none bg-background',
        className
      )}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
};
