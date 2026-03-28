"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
const Tabs = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div"> & {
    defaultValue?: string;
}>(({ className, children, defaultValue, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue);
    return (<div ref={ref} className={cn("", className)} {...props}>
      {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, {
                    value,
                    setValue,
                });
            }
            return child;
        })}
    </div>);
});
Tabs.displayName = "Tabs";
const TabsList = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div"> & {
    value?: string;
    setValue?: (v: string) => void;
}>(({ className, children, ...props }, ref) => (<div ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 dark:bg-gray-800", className)} {...props}>
    {children}
  </div>));
TabsList.displayName = "TabsList";
const TabsTrigger = React.forwardRef<React.ElementRef<"button">, React.ComponentPropsWithoutRef<"button"> & {
    value?: string;
}>(({ className, value: triggerValue, onClick, children, ...props }, ref) => {
    const parentValue = (props as any).value;
    const setParentValue = (props as any).setValue;
    const isActive = parentValue === triggerValue;
    return (<button ref={ref} onClick={(e) => {
            setParentValue?.(triggerValue);
            onClick?.(e);
        }} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all", isActive
            ? "bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-100"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100", className)} {...props}>
      {children}
    </button>);
});
TabsTrigger.displayName = "TabsTrigger";
const TabsContent = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div"> & {
    value?: string;
}>(({ className, value: contentValue, children, ...props }, ref) => {
    const parentValue = (props as any).value;
    if (parentValue !== contentValue)
        return null;
    return (<div ref={ref} className={cn("mt-2", className)} {...props}>
      {children}
    </div>);
});
TabsContent.displayName = "TabsContent";
export { Tabs, TabsList, TabsTrigger, TabsContent };
