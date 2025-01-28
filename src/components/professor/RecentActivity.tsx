export function RecentActivity() {
  const activities = [
    { id: 1, description: 'New assignment created for "Introduction to Literature"', time: "2 hours ago" },
    { id: 2, description: '5 new responses submitted for "Advanced Poetry Analysis"', time: "4 hours ago" },
    { id: 3, description: 'Feedback provided for 10 students in "Modern American Novels"', time: "Yesterday" },
  ]

  return (
    <ul className="space-y-4">
      {activities.map((activity) => (
        <li key={activity.id} className="flex justify-between items-start">
          <span className="text-sm">{activity.description}</span>
          <span className="text-xs text-muted-foreground">{activity.time}</span>
        </li>
      ))}
    </ul>
  )
}

