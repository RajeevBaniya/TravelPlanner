import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function HotelCardItem({ hotel }) {
  const [photoUrl, setPhotoUrl] = useState();
  const [loading, setLoading] = useState(true);

  // Convert  currency to USD (approximate conversion rates)
  const convertToUSD = (amount, country) => {
    const rates = {
      'india': 0.012, // 1 INR = 0.012 USD
      'uk': 1.27,    // 1 GBP = 1.27 USD
      'japan': 0.0067, // 1 JPY = 0.0067 USD
      'europe': 1.09,  // 1 EUR = 1.09 USD
    };

   
    if (!country || country.toLowerCase().includes('usa')) {
      return amount;
    }

    let rate = 1;
    for (const [key, value] of Object.entries(rates)) {
      if (country.toLowerCase().includes(key)) {
        rate = value;
        break;
      }
    }

    return Math.round(amount * rate);
  };

  useEffect(() => {
    if (hotel?.hotelName) {
      GetPlacePhoto();
    }
  }, [hotel]);

  const GetPlacePhoto = async () => {
    try {
      setLoading(true);
      const data = {
        textQuery: hotel?.hotelName,
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
      to={
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(hotel?.hotelName + "," + hotel?.hotelAddress)
      }
      target="_blank"
    >
      <div className="hover:scale-90 transition-all cursor-pointer flex-shrink-0 w-72 sm:w-80 md:w-96">
        {loading ? (
          <div className="rounded-xl h-[250px] w-full bg-gray-200 animate-pulse" />
        ) : (
          <img
            src={photoUrl || "/hotels.jpeg"}
            className="rounded-xl h-[250px] w-full object-cover"
            onError={(e) => e.target.src = "/hotels.jpeg"}
            alt={hotel?.hotelName}
          />
        )}
        <div className="my-3 text-center flex flex-col gap-2">
          <h2 className="font-medium">{hotel?.hotelName}</h2>
          <h2 className="text-xs text-gray-500">📍 {hotel?.hotelAddress}</h2>
          <h2 className="text-sm">
            💰 ${convertToUSD(hotel?.price?.min, hotel?.country)} - ${convertToUSD(hotel?.price?.max, hotel?.country)} per night
          </h2>
          <h2 className="text-sm">⭐{hotel?.rating}</h2>
        </div>
      </div>
    </Link>
  );
}

export default HotelCardItem;
