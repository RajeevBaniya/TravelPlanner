import React from "react";
import HotelCardItem from "./HotelCardItem";

function Hotels({trip}) {
  const hotels = Array.isArray(trip?.tripData?.hotelOptions)
    ? trip.tripData.hotelOptions
    : [];

  return (
    <div className="mx-auto px-4">
      <h2 className="font-bold text-2xl mt-7 text-center">
        Hotel Recommendation
      </h2>

      {hotels.length === 0 ? (
        <div className="mt-4 text-center text-sm text-gray-500">
          No hotel recommendations found for this trip.
        </div>
      ) : (
        <div className="flex justify-center mt-6 space-x-3 overflow-x-auto py-2">
          {hotels.map((hotel, index) => (
            <HotelCardItem key={index} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
}


export default Hotels;
