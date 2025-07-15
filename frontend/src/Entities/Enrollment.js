export const Enrollment = {
  "name": "Enrollment",
  "type": "object",
  "properties": {
    "course_id": {
      "type": "string",
      "description": "ID of the enrolled course"
    },
    "student_id": {
      "type": "string",
      "description": "ID of the student"
    },
    "progress": {
      "type": "number",
      "default": 0,
      "description": "Course progress percentage"
    },
    "completed_lectures": {
      "type": "array",
      "description": "List of completed lecture IDs",
      "items": {
        "type": "string"
      }
    },
    "is_completed": {
      "type": "boolean",
      "default": false,
      "description": "Whether the course is completed"
    },
    "completion_date": {
      "type": "string",
      "format": "date-time",
      "description": "Date when course was completed"
    },
    "certificate_url": {
      "type": "string",
      "description": "URL to generated certificate"
    }
  },
  "required": [
    "course_id",
    "student_id"
  ]
}