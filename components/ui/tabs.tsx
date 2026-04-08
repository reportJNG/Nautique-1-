"use client";
import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
    value?: string;
    setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error("Tabs components must be used inside <Tabs>");
    }
    return context;
}

type TabsProps = React.ComponentPropsWithoutRef<"div"> & {
    defaultValue?: string;
};

const Tabs = React.forwardRef<React.ElementRef<"div">, TabsProps>(({ className, children, defaultValue, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue);

    return (
        <TabsContext.Provider value={{ value, setValue }}>
            <div ref={ref} className={className} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
});
Tabs.displayName = "Tabs";

type TabsListProps = React.ComponentPropsWithoutRef<"div">;

const TabsList = React.forwardRef<React.ElementRef<"div">, TabsListProps>(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 dark:bg-gray-800", className)} {...props}>
        {children}
    </div>
));
TabsList.displayName = "TabsList";

type TabsTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
    value: string;
};

const TabsTrigger = React.forwardRef<React.ElementRef<"button">, TabsTriggerProps>(({ className, value: triggerValue, onClick, children, type = "button", ...props }, ref) => {
    const { value, setValue } = useTabsContext();
    const isActive = value === triggerValue;

    return (
        <button
            ref={ref}
            type={type}
            onClick={(event) => {
                setValue(triggerValue);
                onClick?.(event);
            }}
            className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all", isActive
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-100"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100", className)}
            {...props}
        >
            {children}
        </button>
    );
});
TabsTrigger.displayName = "TabsTrigger";

type TabsContentProps = React.ComponentPropsWithoutRef<"div"> & {
    value: string;
};

const TabsContent = React.forwardRef<React.ElementRef<"div">, TabsContentProps>(({ className, value: contentValue, children, ...props }, ref) => {
    const { value } = useTabsContext();

    if (value !== contentValue) {
        return null;
    }

    return (
        <div ref={ref} className={cn("mt-2", className)} {...props}>
            {children}
        </div>
    );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
