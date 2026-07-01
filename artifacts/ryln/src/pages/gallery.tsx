import { useState } from "react";
import { useListGallery, GalleryImageCategory } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Gallery() {
  const [category, setCategory] = useState<GalleryImageCategory | "all">("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const queryParams = category === "all" ? {} : { category };
  const { data, isLoading } = useListGallery(queryParams);

  const categories = [
    { value: "all", label: "All Photos" },
    { value: "events", label: "Events" },
    { value: "community_service", label: "Community Service" },
    { value: "meetings", label: "Meetings" },
    { value: "trainings", label: "Trainings" },
    { value: "workshops", label: "Workshops" },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Photo Gallery</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Glimpses of our community in action across the Rift Valley.
          </p>
        </div>
      </section>

      <section className="py-12 flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-10 overflow-x-auto pb-2">
            <Tabs defaultValue="all" onValueChange={(v) => setCategory(v as GalleryImageCategory | "all")} className="w-full max-w-3xl">
              <TabsList className="flex w-max mx-auto h-auto p-1 flex-wrap justify-center gap-1 bg-muted/50">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.value} 
                    value={cat.value}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="break-inside-avoid">
                  <Skeleton className={`w-full rounded-xl ${i % 2 === 0 ? 'h-64' : 'h-96'}`} />
                </div>
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {data.data.map((image) => (
                <div 
                  key={image.id} 
                  className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden shadow-sm hover-elevate transition-all"
                  onClick={() => setSelectedImage(image.imageUrl)}
                >
                  <img 
                    src={image.imageUrl} 
                    alt={image.title} 
                    className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white font-medium text-lg">{image.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted">
              <h3 className="text-xl font-semibold text-foreground mb-2">No photos found</h3>
              <p className="text-muted-foreground">There are no photos in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-1 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Gallery preview" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
