// export const User = {
//   title: "User",
//   type: "object",
//   properties: {
//     id: {
//       type: "string",
//       description: "Unique identifier for the user"
//     },
//     full_name: {
//       type: "string",
//       description: "User's full name"
//     },
//     email: {
//       type: "string",
//       format: "email",
//       description: "User's email address"
//     },
//     profile_image: {
//       type: "string",
//       description: "URL to user's profile image"
//     },
//     is_admin: {
//       type: "boolean",
//       default: false,
//       description: "Whether the user has admin privileges"
//     },
//     is_educator: {
//       type: "boolean",
//       default: false,
//       description: "Whether the user is an educator"
//     },
//     enrolled_courses: {
//       type: "array",
//       description: "List of course IDs the user is enrolled in",
//       items: {
//         type: "string"
//       }
//     },
//     created_at: {
//       type: "string",
//       format: "date-time",
//       description: "Date and time the user was created"
//     },
//     updated_at: {
//       type: "string",
//       format: "date-time",
//       description: "Date and time the user was last updated"
//     }
//   },
//   required: ["id", "full_name", "email"]
// };
const mockUser = {
  id: "user_001",
  full_name: "Jeffery Ahodokpo",
  email: "jeffery@example.com",
  profile_image: "https://ui-avatars.com/api/?name=Jeffery+Ahodokpo",
  is_admin: true,
  is_educator: true,
  enrolled_courses: ["course_101", "course_202"],
  created_at: "2025-07-01T10:30:00Z",
  updated_at: "2025-07-14T15:45:00Z"
};

export const User = {

  me: async () => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockUser), 500);
    });
  },

  login: async () => {
    window.location.href = "/login"; // simulate redirect to login page
  },

  logout: async () => {
    console.log("User logged out");
  }
};
