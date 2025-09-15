"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva("btn-material material-ripple [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "btn-material-filled",
      destructive: "btn-material-filled bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "btn-material-outlined",
      secondary: "btn-material-filled bg-secondary text-secondary-foreground hover:bg-secondary/90",
      ghost: "btn-material-text",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
    },
    size: {
      default: "h-10 px-6 py-2 text-sm",
      sm: "h-8 px-4 text-xs",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10 p-0",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
