export const SelectTravelesList = [
    {
      id: 1,
      title: 'Just Me',
      desc: 'A sole traveles in exploration',
      icon: '✈️',
      people: '1'
    },
    {
      id: 2,
      title: 'A Couple',
      desc: 'Two traveles in tandem',
      icon: '👫',
      people: '2 People'
    },
    {
      id: 3,
      title: 'Family',
      desc: 'A group of fun loving adventurers',
      icon: '🏠',
      people: '4 to 7 People'
    },
    {
      id: 4,
      title: 'Friends',
      desc: 'A bunch of thrill-seekes',
      icon: '⛵',
      people: '5 to 10 People'
    },
]
  
export const SelectBudgetOptions = [
    {
      id: 1,
      title: 'Cheap',
      desc: 'Stay conscious of costs',
      icon: '💵',
    },
    {
      id: 2,
      title: 'Moderate',
      desc: 'Keep cost on the average side',
      icon: '💰',
    },
    {
      id: 3,
      title: 'Luxury',
      desc: 'Dont worry about cost',
      icon: '💸',
    },
]
  
export const AI_PROMPT = `Generate a travel plan for Location: {location}, for {totalDays} Days, for {traveler}, with a {budget} budget.

Return ONLY valid JSON (no markdown, no code fences, no extra text) with this EXACT structure:

{
  "hotelOptions": [
    {
      "hotelName": "string",
      "hotelAddress": "string",
      "price": {
        "min": number,
        "max": number
      },
      "hotelImageUrl": "string",
      "geoCoordinates": {
        "latitude": number,
        "longitude": number
      },
      "rating": number,
      "description": "string"
    }
  ],
  "itinerary": {
    "day1": {
      "plan": [
        {
          "placeName": "string",
          "placeDetails": "string",
          "placeImageUrl": "string",
          "geoCoordinates": {
            "latitude": number,
            "longitude": number
          },
          "ticketPricing": "string",
          "rating": number,
          "timeTravel": "string"
        }
      ]
    }
  }
}

Requirements:
- Provide at least 4 hotels in hotelOptions array
- Create day1, day2, day3... up to day{totalDays} in itinerary object
- Each day must have a "plan" array with at least 3 places
- All fields are required
- Budget guide: Cheap ($10-$50/night), Moderate ($51-$150/night), Luxury ($151+/night)
- Return ONLY the JSON object, nothing else`;