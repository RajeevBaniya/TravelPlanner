import { Button } from "@/components/ui/button";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import React, { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { Link } from "react-router-dom";

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (place?.placeName) {
      GetPlacePhoto();
    }
  }, [place]);

  const GetPlacePhoto = async () => {
    try {
      setLoading(true);
      const data = {
        textQuery: place.placeName
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
      setLoading(false);
    }
  };

  return (
    <Link
      to={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place?.placeName)}
      target="_blank"
    >
      <div className="border rounded-xl p-3 mb-2 hover:scale-105 transition-all hover:shadow-md cursor-pointer">
        <div className="flex gap-3">
          {loading ? (
            <div className="w-[100px] h-[100px] bg-gray-200 rounded-xl animate-pulse" />
          ) : (
            <img
              src={photoUrl || "/placeholder11.png"}
              className="w-[100px] h-[100px] rounded-xl object-cover"
              onError={(e) => e.target.src = "/placeholder11.png"}
              alt={place.placeName}
            />
          )}
          <div className="flex flex-col justify-center">
            <div className="font-bold text-sm">{place.placeName}</div>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {place.placeDetails}
            </p>
            <h2 className="text-sm mt-1">🕙 {place.timeTravel}</h2>
            <p className="text-sm mt-1">🎫 {place.ticketPricing}</p>
            {/* <Button className='mt-2 bg-gray-800  size-4'><FaMapLocationDot /></Button> */}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PlaceCardItem;
