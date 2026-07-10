import { useAuth } from "@/hooks/use-auth";
import { useGetPublicStats, useListAnnouncements } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Users, Target, Calendar } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetPublicStats();
  const { data: announcementsData, isLoading: announcementsLoading } = useListAnnouncements({ published: true, limit: 3 });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="/images/hero.png" 
            alt="Kenyan youth leadership group" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
              Empowering the Next Generation of <span className="text-accent">Rift Valley Leaders</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto lg:mx-0">
              A purposeful, community-driven network where ambitious youth connect, grow, and lead meaningful change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!user && (
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <Link href="/register">Join the Network</Link>
                </Button>
              )}
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="py-4">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                {statsLoading ? <Skeleton className="h-9 w-24 mx-auto" /> : stats?.totalMembers || 0}
              </h3>
              <p className="text-muted-foreground mt-1 font-medium">Active Members</p>
            </div>
            <div className="py-4">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                {statsLoading ? <Skeleton className="h-9 w-24 mx-auto" /> : stats?.totalPrograms || 0}
              </h3>
              <p className="text-muted-foreground mt-1 font-medium">Programs Initiated</p>
            </div>
            <div className="py-4">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                {statsLoading ? <Skeleton className="h-9 w-24 mx-auto" /> : stats?.yearsOfOperation || 0}
              </h3>
              <p className="text-muted-foreground mt-1 font-medium">Years of Impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Intro Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">A Community of Action</h2>
            <p className="text-lg text-muted-foreground">
              We believe in the power of youth to transform communities. The Rift Youth Leadership Network provides training, resources, and a platform for young people to realize their potential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src="/images/activity-1.png" alt="Community service" className="w-full h-auto" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Core Mission</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 bg-accent/20 w-8 h-8 rounded-full flex items-center justify-center text-accent-foreground font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Empowerment</h4>
                    <p className="text-muted-foreground">Equipping youth with leadership skills and resources to succeed.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 bg-accent/20 w-8 h-8 rounded-full flex items-center justify-center text-accent-foreground font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Connection</h4>
                    <p className="text-muted-foreground">Fostering a supportive network of like-minded young professionals.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 bg-accent/20 w-8 h-8 rounded-full flex items-center justify-center text-accent-foreground font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Service</h4>
                    <p className="text-muted-foreground">Driving positive change through grassroots community initiatives.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Latest Updates</h2>
              <p className="text-muted-foreground">News and announcements from the network.</p>
            </div>
          </div>

          {announcementsLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="h-full">
                  <CardHeader>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : announcementsData?.data && announcementsData.data.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {announcementsData.data.map((announcement) => (
                <Card key={announcement.id} className="h-full flex flex-col hover-elevate transition-all border-border/50 shadow-sm">
                  <CardHeader>
                    <CardDescription>
                      {announcement.publishedAt ? format(new Date(announcement.publishedAt), 'MMMM d, yyyy') : ''}
                    </CardDescription>
                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">No recent announcements.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to make an impact?</h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Join hundreds of other youth leaders in the Rift Valley who are shaping the future of our communities.
          </p>
          { !user && (
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link href="/register">Become a Member Today <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          ) }
        </div>
      </section>
    </div>
  );
}
