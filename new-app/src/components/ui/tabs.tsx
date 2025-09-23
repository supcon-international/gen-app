import * as React from "react"
import { cn } from "@/lib/utils"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  activeValue?: string
  onValueChange?: (value: string) => void
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, activeValue, onValueChange, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={activeValue === value}
      data-state={activeValue === value ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        activeValue === value
          ? "bg-background text-foreground shadow"
          : "text-muted-foreground",
        className
      )}
      onClick={() => onValueChange?.(value)}
      {...props}
    />
  )
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  activeValue?: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, activeValue, ...props }, ref) => (
    <div
      ref={ref}
      role="tabpanel"
      data-state={activeValue === value ? "active" : "inactive"}
      hidden={activeValue !== value}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
)
TabsContent.displayName = "TabsContent"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [activeValue, setActiveValue] = React.useState(value || defaultValue || "")

    React.useEffect(() => {
      if (value !== undefined) {
        setActiveValue(value)
      }
    }, [value])

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setActiveValue(newValue)
      }
      onValueChange?.(newValue)
    }

    const childrenWithProps = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === TabsList) {
          return React.cloneElement(child, {
            ...child.props,
            children: React.Children.map(child.props.children, (trigger) => {
              if (React.isValidElement(trigger) && trigger.type === TabsTrigger) {
                return React.cloneElement(trigger, {
                  ...trigger.props,
                  activeValue,
                  onValueChange: handleValueChange,
                })
              }
              return trigger
            }),
          })
        }
        if (child.type === TabsContent) {
          return React.cloneElement(child, {
            ...child.props,
            activeValue,
          })
        }
      }
      return child
    })

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {childrenWithProps}
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

export { Tabs, TabsList, TabsTrigger, TabsContent }