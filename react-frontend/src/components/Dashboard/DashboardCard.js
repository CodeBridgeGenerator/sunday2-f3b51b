import * as React from 'react';

export const DashboardCard = ({ title, children }) => {
    return (
        <div className="flex flex-col flex-1 shrink px-8 py-6 bg-white rounded-lg border border-solid shadow-sm basis-0 border-zinc-200 min-w-[340px] max-md:px-5 max-md:max-w-full">
            <div className="gap-2.5 self-stretch w-full text-base font-semibold whitespace-nowrap max-md:max-w-full">{title}</div>
            {children}
        </div>
    );
};
