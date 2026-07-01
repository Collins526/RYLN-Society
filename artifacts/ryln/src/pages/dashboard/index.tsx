import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, Megaphone, Calendar, Image as ImageIcon, Mail } from "lucide-react";

export default function DashboardOverview() {
  const { data: stats, isLoading } = useGetDashboardStats();

  const statCards = [
    {
      title: "Total Members",
      value: stats?.totalMembers || 0,
      icon: Users,
      description: `${stats?.activeMembers || 0} active, ${stats?.pendingMembers || 0} pending`
    },
    {
      title: "New This Month",
      value: stats?.newRegistrationsThisMonth || 0,
      icon: UserPlus,
      description: "Recent member registrations"
    },
    {
      title: "Announcements",
      value: stats?.totalAnnouncements || 0,
      icon: Megaphone,
      description: `${stats?.publishedAnnouncements || 0} published currently`
    },
    {
      title: "Activities",
      value: stats?.totalActivities || 0,
      icon: Calendar,
      description: `${stats?.upcomingActivities || 0} upcoming activities`
    },
    {
      title: "Gallery Images",
      value: stats?.totalGalleryImages || 0,
      icon: ImageIcon,
      description: "Across all categories"
    },
    {
      title: "Unread Messages",
      value: stats?.unreadMessages || 0,
      icon: Mail,
      description: "From the contact form"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back to the RYLN administration panel.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card, i) => (
              <Card key={i} className="shadow-sm hover-elevate transition-all border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <a href="/dashboard/members" className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg hover:bg-primary/5 transition-colors border border-border/50">
              <Users className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Manage Members</span>
            </a>
            <a href="/dashboard/announcements" className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg hover:bg-primary/5 transition-colors border border-border/50">
              <Megaphone className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Post Announcement</span>
            </a>
            <a href="/dashboard/activities" className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg hover:bg-primary/5 transition-colors border border-border/50">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Add Activity</span>
            </a>
            <a href="/dashboard/messages" className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg hover:bg-primary/5 transition-colors border border-border/50">
              <Mail className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">View Messages</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
