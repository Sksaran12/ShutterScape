import type { ActivityRecord, GalleryRecord, MemberRecord } from "./content-types";

/**
 * Verified content extracted from "Club Details.pdf" (19-page official club deck).
 *
 * Every photograph below is an original asset extracted from that PDF and stored
 * under /public/assets. No stock photography, invented dates, fake photographers,
 * camera metadata or membership statistics are included. Where the PDF does not
 * record an exact date, the gallery item has no eventDate and activities use a
 * descriptive dateLabel instead.
 */
export const seedGallery: GalleryRecord[] = [
  {
    id: "g-wpd-2026-1",
    title: "World Photography Day Exhibition 2026",
    caption:
      "Students view prints displayed along the campus corridor at the World Photography Day exhibition.",
    imageUrl: "/assets/photos/world-photography-day-2026-1.jpg",
    altText:
      "Students looking at photographs displayed along a campus corridor",
    category: "Events & Workshops",
    eventDate: "2026-08-19T00:00:00.000Z",
    published: true,
  },
  {
    id: "g-wpd-2026-2",
    title: "World Photography Day Exhibition 2026",
    caption:
      "Visitors look at student photographs on display during the World Photography Day exhibition.",
    imageUrl: "/assets/photos/world-photography-day-2026-2.jpg",
    altText: "Students viewing photographs on an exhibition wall",
    category: "Events & Workshops",
    eventDate: "2026-08-19T00:00:00.000Z",
    published: true,
  },
  {
    id: "g-wpd-2026-3",
    title: "World Photography Day Exhibition 2026",
    caption:
      "Students and a faculty member examine prints during the World Photography Day exhibition.",
    imageUrl: "/assets/photos/world-photography-day-2026-3.jpg",
    altText:
      "Students and a faculty member looking at photographs on display",
    category: "Events & Workshops",
    eventDate: "2026-08-19T00:00:00.000Z",
    published: true,
  },
  {
    id: "g-wpd-2026-4",
    title: "World Photography Day Exhibition 2026",
    caption:
      "ShutterScape members and faculty in front of the World Photography Day exhibition display.",
    imageUrl: "/assets/photos/world-photography-day-2026-4.jpg",
    altText:
      "Group photograph of ShutterScape members and faculty at an exhibition display",
    category: "Events & Workshops",
    eventDate: "2026-08-19T00:00:00.000Z",
    published: true,
  },
  {
    id: "g-wpd-2026-5",
    title: "World Photography Day Exhibition 2026",
    caption:
      "A member hangs a photograph on the World Photography Day exhibition display.",
    imageUrl: "/assets/photos/world-photography-day-2026-5.jpg",
    altText: "A person hanging a photograph on a display",
    category: "Events & Workshops",
    eventDate: "2026-08-19T00:00:00.000Z",
    published: true,
  },
  {
    id: "g-euphuism-2026",
    title: "Euphuism 2026 — Artsy Lens",
    caption:
      "ShutterScape members at the Euphuism 2026 Artsy Lens photography event.",
    imageUrl: "/assets/photos/euphuism-2026.jpg",
    altText:
      "Group photograph of ShutterScape members at the Euphuism 2026 Artsy Lens event",
    category: "Events & Workshops",
    published: true,
  },
  {
    id: "g-exhibition-banner",
    title: "Exhibition Banner",
    caption:
      "A member photographs the World Photography Day exhibition banner as visitors pass by.",
    imageUrl: "/assets/photos/exhibition-display-banner.jpg",
    altText:
      "A member photographing a World Photography Day ShutterScape exhibition banner",
    category: "Events & Workshops",
    published: true,
  },
  {
    id: "g-exhibition-wall",
    title: "ShutterScape Exhibition Wall",
    caption: "Student prints arranged around the ShutterScape exhibition wall.",
    imageUrl: "/assets/photos/exhibition-display-wall.jpg",
    altText:
      "Photographs arranged around a ShutterScape exhibition sign on a wall",
    category: "Events & Workshops",
    published: true,
  },
  {
    id: "g-exhibition-group",
    title: "Exhibition Viewing",
    caption:
      "Students and faculty gathered in front of the ShutterScape exhibition wall.",
    imageUrl: "/assets/photos/exhibition-display-group.jpg",
    altText:
      "Students and faculty standing in front of a wall of displayed photographs",
    category: "Events & Workshops",
    published: true,
  },
  {
    id: "g-exhibition-viewers",
    title: "Viewing the Prints",
    caption: "Visitors look at photographs on the exhibition wall.",
    imageUrl: "/assets/photos/exhibition-viewers.jpg",
    altText: "Visitors looking at photographs on an exhibition wall",
    category: "Events & Workshops",
    published: true,
  },
  {
    id: "g-workshop-classroom",
    title: "Photography Session",
    caption: "A photography session in a GCU classroom.",
    imageUrl: "/assets/photos/workshop-classroom.jpg",
    altText:
      "Speaker addressing students during a photography session in a classroom",
    category: "Events & Workshops",
    published: true,
  },
  {
    id: "g-workshop-speaker",
    title: "Session Speaker",
    caption: "A speaker leads a photography session at GCU.",
    imageUrl: "/assets/photos/workshop-speaker.jpg",
    altText: "Speaker in a red shirt presenting beside a whiteboard",
    category: "Events & Workshops",
    published: true,
  },
  {
    id: "g-photowalk-group",
    title: "Photowalk at Barduar Tea Garden",
    caption:
      "ShutterScape members on a photowalk at Barduar Tea Garden No. 3, Assam.",
    imageUrl: "/assets/photos/photowalk-group.jpg",
    altText:
      "Group of ShutterScape members with cameras at a tea garden",
    category: "Photowalks",
    published: true,
  },
  {
    id: "g-photographing-plants",
    title: "Photographing on Location",
    caption:
      "A member photographs plants on a club photowalk near Guwahati.",
    imageUrl: "/assets/photos/member-photographing-plants.jpg",
    altText:
      "Member leaning in to photograph plants with a smartphone",
    category: "Photowalks",
    published: true,
  },
  {
    id: "g-campus-building",
    title: "GCU Campus",
    caption: "The Girijananda Choudhury University campus.",
    imageUrl: "/assets/photos/campus-building.jpg",
    altText:
      "Girijananda Choudhury University building under a blue sky",
    category: "Campus Life",
    published: true,
  },
  {
    id: "g-camera-flatlay",
    title: "Cameras and Photography Books",
    caption:
      "Cameras, film and photography books arranged on a table.",
    imageUrl: "/assets/photos/camera-flatlay.jpg",
    altText:
      "Film rolls, cameras and photography books arranged on a table",
    category: "Behind the Lens",
    published: true,
  },
  {
    id: "g-camera-flatlay-2",
    title: "Gear Table",
    caption: "Cameras, lenses and film arranged on a wooden table.",
    imageUrl: "/assets/photos/camera-flatlay-2.jpg",
    altText: "Camera, lenses and film arranged on a wooden table",
    category: "Behind the Lens",
    published: true,
  },
  {
    id: "g-print-wall",
    title: "Print Selection",
    caption: "Prints pinned up together for review.",
    imageUrl: "/assets/photos/photo-collage.jpg",
    altText: "A wall of photographs pinned together",
    category: "Behind the Lens",
    published: true,
  },
];

export const seedActivities: ActivityRecord[] = [
  {
    id: "a-wpd-2026",
    title: "World Photography Day Exhibition 2026",
    description:
      "<p>ShutterScape marked World Photography Day 2026 with an exhibition of student photographs at GCU. Members displayed prints, and students and faculty viewed the work.</p>",
    coverImageUrl: "/assets/photos/world-photography-day-2026-2.jpg",
    activityDate: "2026-08-19T00:00:00.000Z",
    dateLabel: "World Photography Day 2026",
    published: true,
  },
  {
    id: "a-euphuism-2026",
    title: "Euphuism 2026 — Artsy Lens",
    description:
      "<p>ShutterScape took part in Euphuism 2026 with the Artsy Lens photography event.</p>",
    coverImageUrl: "/assets/photos/euphuism-2026.jpg",
    dateLabel: "Euphuism 2026",
    published: true,
  },
  {
    id: "a-first-challenge",
    title: "The First ShutterScape Challenge",
    description:
      "<p>A 30-minute colour challenge: teams were assigned a colour and explored the campus to capture objects, details and moments featuring it. The best photographs from each group were selected and showcased.</p>",
    dateLabel: "30-minute colour challenge",
    published: true,
  },
];

export const seedMembers: MemberRecord[] = [
  {
    id: "m-sangeeta-das",
    fullName: "Dr. Sangeeta Das",
    role: "Coordinator",
    memberCategory: "faculty",
    department:
      "Assistant Professor, Department of Mechanical Engineering",
    portraitUrl: "/assets/team/dr-sangeeta-das.jpg",
    altText: "Portrait of Dr. Sangeeta Das",
    displayOrder: 1,
    published: true,
  },
  {
    id: "m-barsha-chhetri",
    fullName: "Dr. Barsha Chhetri",
    role: "Co-Coordinator",
    memberCategory: "faculty",
    department:
      "Assistant Professor & Head (i/c), Department of Education",
    portraitUrl: "/assets/team/dr-barsha-chhetri.png",
    altText: "Portrait of Dr. Barsha Chhetri",
    displayOrder: 2,
    published: true,
  },
  {
    id: "m-uttama-purkayastha",
    fullName: "Uttama Purkayastha",
    role: "President",
    memberCategory: "leadership",
    portraitUrl: "/assets/team/uttama-purkayastha.jpg",
    altText: "Portrait of Uttama Purkayastha",
    displayOrder: 1,
    published: true,
  },
  {
    id: "m-ikhyt-de-neog",
    fullName: "Ikhyt De Neog",
    role: "Vice-President",
    memberCategory: "leadership",
    portraitUrl: "/assets/team/ikhyt-de-neog.jpg",
    altText: "Portrait of Ikhyt De Neog",
    displayOrder: 2,
    published: true,
  },
  {
    id: "m-richita-sarma",
    fullName: "Richita Sarma",
    role: "Secretary",
    memberCategory: "leadership",
    portraitUrl: "/assets/team/richita-sarma.jpg",
    altText: "Portrait of Richita Sarma",
    displayOrder: 3,
    published: true,
  },
  {
    id: "m-mubina-ahmed",
    fullName: "Mubina Ahmed",
    role: "Core Member",
    memberCategory: "core",
    portraitUrl: "/assets/team/mubina-ahmed.jpg",
    altText: "Portrait of Mubina Ahmed",
    displayOrder: 1,
    published: true,
  },
  {
    id: "m-pratyush-choudhury",
    fullName: "Pratyush Bikash Choudhury",
    role: "Core Member",
    memberCategory: "core",
    portraitUrl: "/assets/team/pratyush-bikash-choudhury.jpg",
    altText: "Portrait of Pratyush Bikash Choudhury",
    displayOrder: 2,
    published: true,
  },
  {
    id: "m-hiya-das",
    fullName: "Hiya Das",
    role: "Core Member",
    memberCategory: "core",
    portraitUrl: "/assets/team/hiya-das.png",
    altText: "Portrait of Hiya Das",
    displayOrder: 3,
    published: true,
  },
  {
    id: "m-sohaib-hussain",
    fullName: "Sohaib Hussain",
    role: "Core Member",
    memberCategory: "core",
    portraitUrl: "/assets/team/sohaib-hussain.jpg",
    altText: "Portrait of Sohaib Hussain",
    displayOrder: 4,
    published: true,
  },
  {
    id: "m-mahadananda-dutta",
    fullName: "Mahadananda Dutta",
    role: "Core Member",
    memberCategory: "core",
    portraitUrl: "/assets/team/mahadananda-dutta.jpg",
    altText: "Portrait of Mahadananda Dutta",
    displayOrder: 5,
    published: true,
  },
  {
    id: "m-manash-pratim-sarma",
    fullName: "Manash Pratim Sarma",
    role: "Core Member",
    memberCategory: "core",
    portraitUrl: "/assets/team/manash-pratim-sarma.jpg",
    altText: "Portrait of Manash Pratim Sarma",
    displayOrder: 6,
    published: true,
  },
  {
    id: "m-gargi-medhi",
    fullName: "Gargi Medhi",
    role: "Alumni",
    memberCategory: "alumni",
    portraitUrl: "/assets/team/gargi-medhi.jpg",
    altText: "Portrait of Gargi Medhi",
    displayOrder: 1,
    published: true,
  },
  {
    id: "m-dheemaan-deka",
    fullName: "Dheemaan Deka",
    role: "Founding Alumni",
    memberCategory: "alumni",
    portraitUrl: "/assets/team/dheemaan-deka.jpg",
    altText: "Portrait of Dheemaan Deka",
    displayOrder: 2,
    published: true,
  },
  {
    id: "m-imran-farhat",
    fullName: "Imran Farhat",
    role: "Alumni",
    memberCategory: "alumni",
    portraitUrl: "/assets/team/imran-farhat.jpg",
    altText: "Portrait of Imran Farhat",
    displayOrder: 3,
    published: true,
  },
  {
    id: "m-subhrajyoti-goswami",
    fullName: "Subhrajyoti Goswami",
    role: "Founding Alumni",
    memberCategory: "alumni",
    portraitUrl: "/assets/team/subhrajyoti-goswami.jpg",
    altText: "Portrait of Subhrajyoti Goswami",
    displayOrder: 4,
    published: true,
  },
];

export const FOUNDING_ALUMNI_NAMES = [
  "Dheemaan Deka",
  "Subhrajyoti Goswami",
] as const;
