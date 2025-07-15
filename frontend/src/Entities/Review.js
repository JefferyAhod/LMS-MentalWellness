export const Review = {
  "name": "Review",
  "type": "object",
  "properties": {
    "course_id": {
      "type": "string",
      "description": "ID of the reviewed course"
    },
    "student_id": {
      "type": "string",
      "description": "ID of the student who left the review"
    },
    "student_name": {
      "type": "string",
      "description": "Name of the student"
    },
    "rating": {
      "type": "number",
      "minimum": 1,
      "maximum": 5,
      "description": "Rating from 1 to 5"
    },
    "comment": {
      "type": "string",
      "description": "Written review comment"
    }
  },
  "required": [
    "course_id",
    "student_id",
    "rating"
  ]
}