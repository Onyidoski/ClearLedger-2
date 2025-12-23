// client/utils/csvGenerator.ts

interface Transaction {
    hash: string;
    timeStamp: number;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
    gasUsed: string;
    isError: string;
}

export const generateCSV = (transactions: Transaction[], address: string) => {
    if (!transactions || transactions.length === 0) return;

    // 1. Define CSV Headers
    const headers = [
        "Date",
        "Time",
        "Type", // Incoming / Outgoing
        "Amount (ETH)",
        "Gas Price (Gwei)",
        "Gas Cost (ETH)",
        "From",
        "To",
        "Tx Hash",
        "Status"
    ];

    // 2. Format Data Rows
    const rows = transactions.map(tx => {
        const dateObj = new Date(tx.timeStamp);
        const date = dateObj.toLocaleDateString();
        const time = dateObj.toLocaleTimeString();
        
        const isOutgoing = tx.from.toLowerCase() === address.toLowerCase();
        const type = isOutgoing ? "OUT" : "IN";
        
        const amount = (Number(tx.value) / 1e18).toFixed(6);
        const gasPriceGwei = (Number(tx.gasPrice) / 1e9).toFixed(2);
        const gasCostETH = (Number(tx.gasUsed) * Number(tx.gasPrice) / 1e18).toFixed(6);
        
        const status = tx.isError === "0" ? "Success" : "Failed";

        return [
            date,
            time,
            type,
            amount,
            gasPriceGwei,
            gasCostETH,
            tx.from,
            tx.to,
            tx.hash,
            status
        ].join(","); // Join columns with comma
    });

    // 3. Combine Headers and Rows
    const csvContent = [
        headers.join(","), // Header row
        ...rows            // Data rows
    ].join("\n");          // Join rows with newline

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ClearLedger_Report_${address.substring(0, 6)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};