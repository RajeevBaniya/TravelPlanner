import React from 'react'
import PlaceCardItem from './PlaceCardItem';

function PlacesToVisit({trip}) {
  const itinerary = trip?.tripData?.itinerary && typeof trip.tripData.itinerary === "object"
    ? trip.tripData.itinerary
    : {};

  const days = Object.entries(itinerary);

  return (
    <div>
        <h2 className='font-bold text-2xl mt-7 mb-8 text-center'>Places To Visit</h2>

        <div className='mx-auto px-4'>
            {days.length === 0 ? (
              <div className="mt-2 text-center text-sm text-gray-500">
                No itinerary found for this trip.
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {days
                      .sort(([dayA], [dayB]) => {
                          const numA = parseInt(dayA.replace('day', ''));
                          const numB = parseInt(dayB.replace('day', ''));
                          return numA - numB;
                      })
                      .map(([day, dayData], index) => (
                          <div key={index} className="border rounded-lg mt-5 p-4 shadow-sm">
                              <h2 className='font-bold text-lg mb-4 text-center bg-gray-100 py-2 rounded-lg'>{day}</h2>
                              <div className='flex flex-col gap-4'>
                                  {(dayData?.plan || []).map((place, placeIndex) => (
                                      <div key={placeIndex} className='flex flex-col'>
                                          <h2 className='font-medium text-sm text-orange-500 mb-1 text-center'>{place.timeTravel}</h2>
                                          <PlaceCardItem place={place} />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))
                  }
              </div>
            )}
        </div>
    </div>
  )
}

export default PlacesToVisit