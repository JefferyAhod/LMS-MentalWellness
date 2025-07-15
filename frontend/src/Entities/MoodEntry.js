export const MoodEntry = {
  "name": "MoodEntry",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "ID of the user"
    },
    "mood": {
      "type": "string",
      "enum": [
        "very_sad",
        "sad",
        "neutral",
        "happy",
        "very_happy"
      ],
      "description": "User's mood for the day"
    },
    "notes": {
      "type": "string",
      "description": "Optional notes about the mood"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Date of the mood entry"
    }
  },
  "required": [
    "user_id",
    "mood",
    "date"
  ]
}