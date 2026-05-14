import React from 'react';

// Privremeni interfejs za podatke fakture, kasnije će se zameniti sa tipom iz baze
export interface Invoice {
    id: string;
    clientInitials: string;
    clientName: string;
    date: string;
    amount: string;
    status: 'Plaćeno' | 'Na čekanju' | 'Kasni' | 'Nacrt';
}

interface TableProps {
    invoices: Invoice[];
    /** Tekst ispod tabele (npr. „Prikazano 1 do 5 od 12 rezultata”). */
    footerSummary?: string;
}

function avatarClassFromInitials(initials: string): string {
    const colors = [
        "bg-blue-100 text-blue-600",
        "bg-purple-100 text-purple-600",
        "bg-pink-100 text-pink-600",
        "bg-indigo-100 text-indigo-600",
        "bg-emerald-100 text-emerald-600",
        "bg-amber-100 text-amber-700",
        "bg-cyan-100 text-cyan-700",
        "bg-violet-100 text-violet-700",
    ];
    let h = 0;
    for (let i = 0; i < initials.length; i++) h = initials.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
}

export default function Table({ invoices, footerSummary }: TableProps) {
    // Helper funkcija za boje statusa
    const getStatusStyles = (status: Invoice['status']) => {
        switch (status) {
            case 'Plaćeno':
                return 'bg-[#DCFCE7] text-[#16A34A]';
            case 'Na čekanju':
                return 'bg-[#FFEDD5] text-[#EA580C]';
            case 'Kasni':
                return 'bg-[#FEE2E2] text-[#DC2626]';
            case 'Nacrt':
                return 'bg-[#F1F5F9] text-[#64748B]';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Boja avatara na osnovu inicijala (stabilan hash)
    const getAvatarColor = (initials: string) => {
        return avatarClassFromInitials(initials);
    };

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {/* Telo tabele sa skrolom ukoliko je potrebno */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8FAFC] border-b border-gray-100">
                            <th className="py-4 px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">ID Fakture</th>
                            <th className="py-4 px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">Naziv klijenta</th>
                            <th className="py-4 px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">Datum</th>
                            <th className="py-4 px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">Iznos</th>
                            <th className="py-4 px-6 text-sm font-semibold text-[#64748B] whitespace-nowrap">Status</th>
                            <th className="py-4 px-6 text-sm font-semibold text-[#64748B] text-right whitespace-nowrap">Akcije</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 px-6 text-center text-sm text-[#64748B]">
                                    Još nema faktura. Kreirajte prvu fakturu da bi se pojavila ovde.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 px-6 text-sm font-bold text-[#0F172A] whitespace-nowrap">
                                    {invoice.id}
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(invoice.clientInitials)}`}>
                                            {invoice.clientInitials}
                                        </div>
                                        <span className="text-sm font-medium text-[#475569]">{invoice.clientName}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-[#64748B] whitespace-nowrap">
                                    {invoice.date}
                                </td>
                                <td className="py-4 px-6 text-sm font-bold text-[#0F172A] whitespace-nowrap">
                                    {invoice.amount}
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(invoice.status)}`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right whitespace-nowrap">
                                    <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginacija ispod tabele */}
            <div className="bg-[#F8FAFC] border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                <span className="text-sm text-[#64748B]">
                    {footerSummary ??
                        "Prikazano 1 do 5 od 12 rezultata"}
                </span>
                <div className="flex items-center gap-2">
                    <button type="button" className="px-3 py-1.5 text-sm font-medium text-[#94A3B8] bg-transparent border border-transparent rounded-lg hover:text-[#64748B] transition-colors disabled:opacity-50" disabled>
                        Prethodno
                    </button>
                    <button type="button" className="px-4 py-1.5 text-sm font-medium text-[#0F172A] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        Sledeće
                    </button>
                </div>
            </div>
        </div>
    );
}