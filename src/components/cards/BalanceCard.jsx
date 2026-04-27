export default function BalanceCard({ title, amount, color, icon }) {
    return (
        <div className={`bg-[#111827] p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
            <div className="flex items-center justify-start gap-2 mb-2 sm:mb-3">
                <span className="text-sm sm:text-2xl">{icon}</span>
                <span className="text-sm sm:text-lg text-gray-500">{title}</span>
            </div>
            <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${color} truncate`}>
                ৳{amount.toLocaleString()}
            </p>
        </div>
    );
}
