import { useListLeadership } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function About() {
  const { data: leadershipData, isLoading } = useListLeadership();

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <section className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">About RYLN</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Discover our history, our vision for the future, and the team driving our mission forward.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Our History</h2>
              <div className="space-y-4 text-muted-foreground text-lg">
                <p>
                  The Rift Youth Leadership Network (RYLN) was founded on the belief that young people are not just leaders of tomorrow—they are the leaders of today. Established in the heart of the Rift Valley, we recognized a critical gap in structured opportunities for youth to develop leadership skills and engage meaningfully with their communities.
                </p>
                <p>
                  What started as a small gathering of ambitious individuals has blossomed into a robust network, connecting hundreds of young professionals, students, and community organizers across the region.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-2xl p-6 flex flex-col justify-center items-center text-center h-48">
                <h3 className="text-4xl font-bold text-primary mb-2">Vision</h3>
                <p className="text-sm text-muted-foreground">A transformed society driven by capable, ethical youth leadership.</p>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center h-48 translate-y-8">
                <h3 className="text-4xl font-bold text-accent-foreground mb-2">Mission</h3>
                <p className="text-sm text-muted-foreground">To empower, connect, and mobilize youth through targeted programs and community service.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Objectives</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We focus our energy on tangible outcomes that benefit both our members and the wider community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Capacity Building",
                desc: "Equip youth with practical leadership, professional, and life skills."
              },
              {
                title: "Networking",
                desc: "Create platforms for youth to interact, share ideas, and collaborate on projects."
              },
              {
                title: "Community Impact",
                desc: "Organize service initiatives that address local challenges in the Rift Valley."
              },
              {
                title: "Mentorship",
                desc: "Connect emerging leaders with experienced professionals for guidance."
              },
              {
                title: "Advocacy",
                desc: "Provide a unified voice for youth on matters affecting their communities."
              },
              {
                title: "Innovation",
                desc: "Support youth-led solutions and entrepreneurial initiatives."
              }
            ].map((obj, i) => (
              <Card key={i} className="border-none shadow-sm hover-elevate">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{obj.title}</h3>
                  <p className="text-muted-foreground">{obj.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Leadership Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the dedicated individuals who guide the network's strategy and operations.
            </p>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-32 h-32 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : leadershipData?.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {leadershipData.map(leader => (
                <div key={leader.id} className="flex flex-col items-center text-center">
                  <Avatar className="w-32 h-32 mb-6 border-4 border-muted">
                    <AvatarImage src={leader.photoUrl || undefined} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {leader.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-foreground">{leader.name}</h3>
                  <p className="text-primary font-medium mb-3">{leader.position}</p>
                  <p className="text-sm text-muted-foreground">{leader.bio}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Leadership team information coming soon.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
