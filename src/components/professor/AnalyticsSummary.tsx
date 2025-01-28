export function AnalyticsSummary() {
  const analytics = [
    { metric: "Average Response Time", value: "2.5 minutes" },
    { metric: "Most Active Course", value: "Introduction to Literature" },
    { metric: "Total Responses This Week", value: "450" },
  ]

  return (
    <ul className="space-y-4">
      {analytics.map((item, index) => (
        <li key={index} className="flex justify-between items-center">
          <span className="text-sm font-medium">{item.metric}</span>
          <span className="text-sm">{item.value}</span>
        </li>
      ))}
    </ul>
  )
}

