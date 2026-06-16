import React from 'react';

export const DynamicTableCell: React.FC<{ value: any; fieldType: string }> = ({ value, fieldType }) => {
    if (value === undefined || value === null || value === '') return <span className="text-slate-400 text-xs italic">N/A</span>;

    if (fieldType === 'url' || fieldType === 'link') {
        const href = typeof value === 'string' && (value.startsWith('http') || value.startsWith('www')) ? value : '';
        if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block max-w-[200px]" title={value}>View Link</a>;
    }
    if (fieldType === 'file') {
        const filename = typeof value === 'string' ? value.split('/').pop() || value : String(value);
        return <span className="text-indigo-600 text-xs truncate block max-w-[200px]" title={typeof value === 'string' ? value : ''}>{filename}</span>;
    }
    if (fieldType === 'checkbox') {
        return <span className={value ? 'text-emerald-600 font-medium' : 'text-slate-400'}>{value ? 'Yes' : 'No'}</span>;
    }

    const str = String(value);
    if (str.length > 120) return <span className="text-slate-700 text-xs" title={str}>{str.slice(0, 120)}&hellip;</span>;

    return <span className="text-slate-700">{str}</span>;
};

export const SubmissionDetailsRenderer: React.FC<{ data: Record<string, any>; fields: { field_id: string; label: string; field_type: string }[] }> = ({ data, fields }) => {
    const nonEmptyFields = fields.filter(f => {
        const v = data[f.field_id];
        return v !== undefined && v !== null && v !== '';
    });

    if (nonEmptyFields.length === 0) {
        return <p className="text-sm text-slate-400 italic">No submission data available</p>;
    }

    return (
        <div className="space-y-3">
            {nonEmptyFields.map((field) => {
                const value = data[field.field_id];
                return (
                    <div key={field.field_id}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{field.label}</p>
                        <div className="mt-0.5 text-sm text-slate-700">
                            <DynamicTableCell value={value} fieldType={field.field_type} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
