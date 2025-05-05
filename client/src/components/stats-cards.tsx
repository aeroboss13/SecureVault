import { 
  Clock, 
  Lock, 
  Calendar, 
  Eye,
} from "lucide-react";

interface Stats {
  activeShares: number;
  sharedToday: number;
  expiringShares: number;
  viewedShares: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Active Passwords",
      value: stats.activeShares,
      icon: <Lock className="h-6 w-6 text-primary-700" />,
      bgColor: "bg-primary-100",
    },
    {
      title: "Shared Today",
      value: stats.sharedToday,
      icon: <Calendar className="h-6 w-6 text-secondary-700" />,
      bgColor: "bg-secondary-100",
    },
    {
      title: "Expiring Soon",
      value: stats.expiringShares,
      icon: <Clock className="h-6 w-6 text-red-600" />,
      bgColor: "bg-red-100",
    },
    {
      title: "Viewed",
      value: stats.viewedShares,
      icon: <Eye className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
    },
  ];
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${card.bgColor} rounded-md p-3`}>
                {card.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    {card.title}
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-neutral-900">{card.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
