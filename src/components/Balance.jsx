import BalanceCard from "./cards/BalanceCard";

export default function Balance({ data, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[#111827] p-3 sm:p-5 rounded-xl sm:rounded-2xl animate-pulse h-24 sm:h-28"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <BalanceCard
                title="Balance"
                amount={data.balance}
                color="text-emerald-400"
                icon="💰"
            />
            <BalanceCard
                title="Income"
                amount={data.income}
                color="text-green-500"
                icon="📈"
            />
            <BalanceCard
                title="Expense"
                amount={data.expense}
                color="text-red-400"
                icon="📉"
            />
            <BalanceCard
                title="Investment"
                amount={data.investment}
                color="text-purple-400"
                icon="🏦"
            />
        </div>
    );
}
