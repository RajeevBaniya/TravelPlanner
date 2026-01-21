import { Button } from "@/components/ui/button";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import React, { useEffect, useState } from "react";
import { IoIosSend } from "react-icons/io";

function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (trip?.userSelection?.location?.label) {
      GetPlacePhoto();
    }
  }, [trip]);

  const GetPlacePhoto = async () => {
    try {
      setIsLoading(true);
      const data = {
        textQuery: trip?.userSelection?.location?.label
      };
      const result = await GetPlaceDetails(data);
      
      if (result?.data?.places?.[0]?.photos?.[0]?.name) {
        const PhotoUrl = PHOTO_REF_URL.replace(
          "{NAME}", 
          result.data.places[0].photos[0].name
        );
        setPhotoUrl(PhotoUrl);
      }
    } catch {
      // Use fallback image
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="border p-4 rounded-lg shadow-sm">
          {isLoading ? (
            <div className="w-full h-[350px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Loading image...</p>
            </div>
          ) : (
            <img
              src={photoUrl || "/hotels.jpeg"}
              alt={trip?.userSelection?.location?.label || "Location"}
              className="w-full h-[350px] object-cover rounded-lg"
              onError={(e) => e.target.src = "/hotels.jpeg"}
            />
          )}
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between my-6 px-4 sm:px-10 md:px-16 max-w-8xl">
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-2xl">
              {trip?.userSelection?.location?.label || "Your Destination"}
            </h2>
            <div className="flex flex-wrap gap-3">
              <h2 className="p-2 px-4 bg-gray-200 rounded-full text-gray-700 font-medium text-sm sm:text-base">
                🗓️ {trip?.userSelection?.noOfDays || "0"} Day
              </h2>
              <h2 className="p-2 px-4 bg-gray-200 rounded-full text-gray-700 font-medium text-sm sm:text-base">
                💰 {trip?.userSelection?.budget || "Budget"} Budget
              </h2>
              <h2 className="p-2 px-4 bg-gray-200 rounded-full text-gray-700 font-medium text-sm sm:text-base">
                🥂 No. Of Traveler: {trip?.userSelection?.traveler || "1"}
              </h2>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex justify-end">
            <Button className="px-4 py-2 w-full sm:w-auto">
              <IoIosSend className="mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoSection;
