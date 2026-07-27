import { useRoute } from "wouter";
import { useGetActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function ActivityPage() {
  const [match, params] = useRoute("/activities/:id");
  const id = params ? parseInt((params as any).id, 10) : null;

  if (!id) return <div className="container mx-auto py-20">Invalid activity ID</div>;

  const { data, isLoading } = useGetActivity(id);

  if (isLoading || !data) {
    return (
      <div className="container mx-auto py-20">
        <Skeleton className="h-64 w-full rounded-md mb-6" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const activity = data as any;

  return (
    <div className="container mx-auto py-12">
      <div className="mb-6">
        <Link href="/activities" className="text-sm text-primary hover:underline">← Back to activities</Link>
      </div>
      <Card className="overflow-hidden">
        <div className="h-72 w-full bg-muted relative">
          {activity.imageUrl ? (
            <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Calendar className="w-12 h-12 text-primary/20" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge>{activity.status}</Badge>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">{activity.title}</CardTitle>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-primary/70" />
              {format(new Date(activity.date), "MMMM d, yyyy")}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-primary/70" />
              {activity.location}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{activity.description}</p>
          {activity.link && (
            <a href={activity.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              View event link <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
