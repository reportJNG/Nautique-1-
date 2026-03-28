import * as React from "react";
import { cn } from "@/lib/utils";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return (<input type={type} className={cn("flex h-10 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500", className)} ref={ref} {...props}/>);
});
Input.displayName = "Input";
export { Input };
