import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../lib/db/src/schema";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const { membersTable, announcementsTable, activitiesTable, galleryTable, contactMessagesTable, leadershipTable } = schema;

async function main() {
  // Admin user
  const adminHash = await bcrypt.hash("Admin@RYLN2024", 10);
  await db.insert(membersTable).values({
    fullName: "Admin RYLN",
    email: "admin@ryln.org",
    phone: "+254700000001",
    nationalId: "ADMIN001",
    gender: "male",
    dateOfBirth: "1990-01-01",
    occupation: "Administrator",
    address: "Nakuru, Kenya",
    passwordHash: adminHash,
    role: "admin",
    status: "active",
  }).onConflictDoNothing();

  // Active members
  const memberHash = await bcrypt.hash("Member@1234", 10);
  const members = [
    { fullName: "James Kipchoge", email: "james.k@email.com", phone: "+254712345678", nationalId: "KE123456", gender: "male" as const, dateOfBirth: "1999-03-15", occupation: "Student", address: "Eldoret, Kenya" },
    { fullName: "Grace Wanjiku", email: "grace.w@email.com", phone: "+254723456789", nationalId: "KE234567", gender: "female" as const, dateOfBirth: "2001-07-22", occupation: "Teacher", address: "Nakuru, Kenya" },
    { fullName: "Daniel Rotich", email: "daniel.r@email.com", phone: "+254734567890", nationalId: "KE345678", gender: "male" as const, dateOfBirth: "2000-11-08", occupation: "Engineer", address: "Kericho, Kenya" },
    { fullName: "Mercy Chebet", email: "mercy.c@email.com", phone: "+254745678901", nationalId: "KE456789", gender: "female" as const, dateOfBirth: "1998-05-30", occupation: "Nurse", address: "Bomet, Kenya" },
    { fullName: "Peter Koech", email: "peter.k@email.com", phone: "+254756789012", nationalId: "KE567890", gender: "male" as const, dateOfBirth: "2002-02-14", occupation: "Student", address: "Kisumu, Kenya" },
  ];
  for (const m of members) {
    await db.insert(membersTable).values({ ...m, passwordHash: memberHash, role: "member", status: "active" }).onConflictDoNothing();
  }

  // Pending
  await db.insert(membersTable).values({ fullName: "Brian Mutai", email: "brian.m@email.com", phone: "+254778901234", nationalId: "KE789012", gender: "male", dateOfBirth: "2004-01-20", occupation: "Student", address: "Narok, Kenya", passwordHash: memberHash, role: "member", status: "pending" }).onConflictDoNothing();

  // Announcements
  await db.insert(announcementsTable).values([
    { title: "Annual Leadership Summit 2024", content: "We are thrilled to announce our Annual Leadership Summit scheduled for August 2024 in Nakuru. This three-day event will bring together youth leaders from across the Rift Valley region for learning, networking, and inspiration. Registration is now open.", published: true, publishedAt: new Date(Date.now() - 3 * 86400000) },
    { title: "New Mentorship Program Launch", content: "RYLN is launching a comprehensive mentorship program connecting experienced professionals with young leaders. Applications open July 1st. This program provides guidance, skills development, and career support for our members.", published: true, publishedAt: new Date(Date.now() - 7 * 86400000) },
    { title: "Community Clean-Up Drive Success", content: "Our recent community clean-up drive in Nakuru was a great success with over 150 volunteers. Together we cleaned 5 km of roads and planted 200 trees. Thank you to all members who participated!", published: true, publishedAt: new Date(Date.now() - 14 * 86400000) },
    { title: "Draft: Upcoming Training Workshop", content: "Leadership skills workshop coming soon — details to be confirmed.", published: false },
  ]);

  // Activities
  await db.insert(activitiesTable).values([
    { title: "Annual Leadership Summit 2024", description: "A three-day summit bringing together young leaders from across Rift Valley featuring keynote speakers, workshops on leadership, entrepreneurship, and community development.", date: "2024-08-15", location: "Nakuru Civic Centre, Kenya", status: "upcoming" },
    { title: "Youth Entrepreneurship Workshop", description: "Hands-on workshop teaching business fundamentals, pitch skills, and entrepreneurship to youth aged 18-30. Participants will present business ideas to a panel of investors.", date: "2024-07-20", location: "Eldoret Business Hub, Kenya", status: "upcoming" },
    { title: "Community Tree Planting Drive", description: "Join us as we plant 500 trees across Nakuru County in collaboration with local schools and the Kenya Forest Service. Help restore our environment.", date: "2024-07-05", location: "Various Locations, Nakuru", status: "ongoing" },
    { title: "Leadership Skills Training", description: "Intensive two-day training covering communication, conflict resolution, project management, and public speaking. Facilitated by certified trainers with 200+ attendees.", date: "2024-06-10", location: "Kericho Youth Centre", status: "completed" },
    { title: "Community Health Camp", description: "Free health screening and education camp in partnership with local hospitals. Services included HIV testing, blood pressure checks, and family planning education. Over 500 community members served.", date: "2024-05-18", location: "Bomet Town, Kenya", status: "completed" },
  ]);

  // Gallery
  await db.insert(galleryTable).values([
    { title: "Leadership Summit 2023", imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800", category: "events" },
    { title: "Community Service Day", imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800", category: "community_service" },
    { title: "Monthly Team Meeting", imageUrl: "https://images.unsplash.com/photo-1530099486328-e021101a494a?w=800", category: "meetings" },
    { title: "Leadership Training Session", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800", category: "trainings" },
    { title: "Youth Workshop", imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800", category: "workshops" },
    { title: "Annual Gala 2023", imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800", category: "events" },
    { title: "Tree Planting Activity", imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800", category: "community_service" },
    { title: "Board Meeting", imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800", category: "meetings" },
  ]);

  // Leadership
  await db.insert(leadershipTable).values([
    { name: "Hon. Samuel Kiprono", position: "Chairperson", bio: "A seasoned community leader with 15 years in youth development across Rift Valley. Samuel holds a Masters in Public Policy from the University of Nairobi and has served on multiple national youth advisory boards.", sortOrder: 1 },
    { name: "Dr. Beatrice Jelimo", position: "Vice Chairperson", bio: "A physician and advocate for youth health and wellness. Dr. Jelimo has led numerous community health initiatives and mentored hundreds of young professionals across Kenya.", sortOrder: 2 },
    { name: "Eng. Kevin Ruto", position: "Secretary General", bio: "A civil engineer passionate about using technology for community development. Kevin manages RYLN operations and has led infrastructure projects benefiting thousands of families.", sortOrder: 3 },
    { name: "Ms. Faith Chepkoech", position: "Treasurer", bio: "A certified accountant with expertise in nonprofit financial management. Faith ensures transparency and accountability in all RYLN financial matters with a decade of experience.", sortOrder: 4 },
  ]);

  // Contact messages
  await db.insert(contactMessagesTable).values([
    { fullName: "John Mwangi", email: "john.m@email.com", subject: "Membership Inquiry", message: "Hello, I am interested in joining RYLN. Could you please send me more information about the membership process and benefits?", read: false },
    { fullName: "Sarah Kamau", email: "sarah.k@email.com", subject: "Partnership Proposal", message: "Our organization is interested in partnering with RYLN on youth empowerment programs. Please contact us to discuss further.", read: true },
    { fullName: "Michael Otieno", email: "michael.o@email.com", subject: "Event Sponsorship", message: "We would like to sponsor your upcoming leadership summit. Please share your sponsorship packages and requirements.", read: false },
  ]);

  console.log("Seed complete!");
  await pool.end();
}

main().catch(console.error);
