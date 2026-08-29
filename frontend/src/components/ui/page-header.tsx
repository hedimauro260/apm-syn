import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8', className)}>
            <div className="flex flex-col gap-1.5">
                {subtitle && <p className="text-xs text-foreground-muted">{subtitle}</p>}
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}