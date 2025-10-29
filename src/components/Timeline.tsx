import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TimelineProps {
  children: ReactNode;
  className?: string;
}

export const Timeline = ({ children, className }: TimelineProps) => (
  <div className={cn("relative space-y-6 pl-6", className)}>
    <div className="absolute left-0 top-2 h-[calc(100%-1rem)] w-0.5 bg-border" />
    {children}
  </div>
);

interface TimelineItemProps {
  date: string;
  title: string;
  time: string;
  description?: string;
}

export const TimelineItem = ({ date, title, time, description }: TimelineItemProps) => (
  <div className="relative">
    <div className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
    <div className="space-y-1">
      <div className="text-sm font-medium text-muted-foreground">{date}</div>
      <div className="font-semibold text-foreground">{title}</div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{time}</span>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  </div>
);
