// export const Course = {
//   title: "Course",
//   type: "object",
//   properties: {
//     title: {
//       type: "string",
//       description: "Course title"
//     },
//     description: {
//       type: "string",
//       description: "Course description"
//     },
//     thumbnail: {
//       type: "string",
//       description: "Course thumbnail URL"
//     },
//     price: {
//       type: "number",
//       description: "Course price (0 for free)"
//     },
//     instructor_id: {
//       type: "string",
//       description: "ID of the instructor"
//     },
//     instructor_name: {
//       type: "string",
//       description: "Name of the instructor"
//     },
//     category: {
//       type: "string",
//       enum: [
//         "programming",
//         "design",
//         "business",
//         "marketing",
//         "data-science",
//         "photography",
//         "music",
//         "language",
//         "health",
//         "other"
//       ],
//       description: "Course category"
//     },
//     level: {
//       type: "string",
//       enum: [
//         "beginner",
//         "intermediate",
//         "advanced"
//       ],
//       description: "Course difficulty level"
//     },
//     duration: {
//       type: "number",
//       description: "Total course duration in minutes"
//     },
//     chapters: {
//       type: "array",
//       description: "Course chapters",
//       items: {
//         type: "object",
//         properties: {
//           title: {
//             type: "string"
//           },
//           lectures: {
//             type: "array",
//             items: {
//               type: "object",
//               properties: {
//                 title: {
//                   type: "string"
//                 },
//                 video_url: {
//                   type: "string"
//                 },
//                 duration: {
//                   type: "number"
//                 },
//                 is_preview_free: {
//                   type: "boolean"
//                 }
//               }
//             }
//           }
//         }
//       }
//     },
//     is_published: {
//       type: "boolean",
//       default: false,
//       description: "Whether the course is published"
//     },
//     total_enrollments: {
//       type: "number",
//       default: 0,
//       description: "Total number of enrollments"
//     },
//     average_rating: {
//       type: "number",
//       default: 0,
//       description: "Average course rating"
//     },
//     is_featured: {
//       type: "boolean",
//       default: false,
//       description: "Whether the course is featured"
//     }
//   },
//   required: [
//     "title",
//     "description",
//     "instructor_id",
//     "instructor_name"
//   ]
// };

const mockCourses = [
  {
    id: "course_101",
    title: "Mastering React in 30 Days",
    description: "Learn how to build modern web apps using React, Hooks, and the latest features.",
    thumbnail: "https://source.unsplash.com/featured/?react,javascript",
    price: 0,
    instructor_id: "user_001",
    instructor_name: "Jeffery Ahodokpo",
    category: "programming",
    level: "intermediate",
    duration: 540, // 9 hours
    chapters: [
      {
        title: "Introduction to React",
        lectures: [
          {
            title: "What is React?",
            video_url: "https://example.com/lectures/react-intro.mp4",
            duration: 10,
            is_preview_free: true
          },
          {
            title: "Setting up the Environment",
            video_url: "https://example.com/lectures/setup.mp4",
            duration: 15,
            is_preview_free: true
          }
        ]
      },
      {
        title: "React Hooks",
        lectures: [
          {
            title: "useState & useEffect",
            video_url: "https://example.com/lectures/hooks.mp4",
            duration: 30,
            is_preview_free: false
          }
        ]
      }
    ],
    is_published: true,
    total_enrollments: 200,
    average_rating: 4.8,
    is_featured: true
  },
  {
    id: "course_202",
    title: "Digital Marketing Fundamentals",
    description: "Explore the core concepts of digital marketing including SEO, SEM, and social media.",
    thumbnail: "https://source.unsplash.com/featured/?marketing,seo",
    price: 49.99,
    instructor_id: "user_001",
    instructor_name: "Jeffery Ahodokpo",
    category: "marketing",
    level: "beginner",
    duration: 360, // 6 hours
    chapters: [
      {
        title: "Getting Started with Digital Marketing",
        lectures: [
          {
            title: "Digital Marketing Basics",
            video_url: "https://example.com/lectures/marketing-basics.mp4",
            duration: 20,
            is_preview_free: true
          }
        ]
      }
    ],
    is_published: true,
    total_enrollments: 140,
    average_rating: 4.6,
    is_featured: false
  },
  {
    id: "course_303",
    title: "Graphic Design with Figma",
    description: "Learn how to design stunning UI/UX interfaces using Figma from scratch.",
    thumbnail: "https://source.unsplash.com/featured/?figma,design",
    price: 0,
    instructor_id: "user_002",
    instructor_name: "Ama Serwaa",
    category: "design",
    level: "beginner",
    duration: 480, // 8 hours
    chapters: [
      {
        title: "Figma Setup",
        lectures: [
          {
            title: "Creating Your First Design",
            video_url: "https://example.com/lectures/figma-intro.mp4",
            duration: 25,
            is_preview_free: true
          }
        ]
      }
    ],
    is_published: true,
    total_enrollments: 95,
    average_rating: 4.3,
    is_featured: true
  }
];


export const Course = {
  filter: async (query, sortKey) => {
    // Filter
    let results = mockCourses.filter(course => {
      return Object.entries(query).every(([key, value]) => course[key] === value);
    });

    // Sort (simple case)
    if (sortKey === "-created_date") {
      results = results.reverse(); // Mocking latest first
    }

    return results;
  },

  list: async () => mockCourses
};
