import { useState } from "react";
import { useListActivities, ActivityStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Activities() {
  const [status, setStatus] = useState<ActivityStatus | "all">("all");
  
  // Fetch activities
  const queryParams = status === "all" ? {} : { status };
  const { data, isLoading } = useListActivities(queryParams);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Programs & Activities</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Discover our ongoing initiatives and upcoming events across the Rift Valley.
          </p>
        </div>
      </section>

      <section className="py-12 flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-10">
            <Tabs defaultValue="all" onValueChange={(v) => setStatus(v as ActivityStatus | "all")} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border-none shadow-md">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.data.map((activity) => (
                <Card key={activity.id} className="overflow-hidden flex flex-col border-border/50 shadow-sm hover-elevate transition-all">
                  <div className="h-48 w-full bg-muted relative">
                    {activity.imageUrl ? (
                      <img 
                        src={activity.imageUrl} 
                        alt={activity.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <Calendar className="w-12 h-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant={
                        activity.status === 'upcoming' ? 'default' : 
                        activity.status === 'ongoing' ? 'secondary' : 'outline'
                      } className={activity.status === 'upcoming' ? 'bg-primary' : activity.status === 'ongoing' ? 'bg-accent text-accent-foreground' : 'bg-background/80 backdrop-blur text-foreground'}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-1">{activity.title}</CardTitle>
                    <CardDescription className="flex flex-col gap-1.5 mt-2">
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 text-primary/70" />
                        {format(new Date(activity.date), "MMMM d, yyyy")}
                      </span>
                      <span className="flex items-center text-sm text-muted-foreground line-clamp-1">
                        <MapPin className="w-4 h-4 mr-2 text-primary/70 flex-shrink-0" />
                        {activity.location}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {activity.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted">
              <h3 className="text-xl font-semibold text-foreground mb-2">No activities found</h3>
              <p className="text-muted-foreground">There are no {status !== 'all' ? status : ''} activities to display right now.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
