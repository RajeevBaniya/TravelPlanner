import React, { useEffect, useState } from 'react';
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { db } from '@/service/firebaseConfig';
import { deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';

function UserTripCardItem({trip, onDelete}) {
  const [photoUrl, setPhotoUrl] = useState();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    trip && GetPlacePhoto();
  }, [trip]);
  
  const GetPlacePhoto = async() => {
    try {
      setLoading(true);
      const data = {
        textQuery: trip?.userSelection?.location?.label
      };
      const result = await GetPlaceDetails(data);
      
      if (result?.data?.places?.[0]?.photos?.[3]?.name) {
        const PhotoUrl = PHOTO_REF_URL.replace(
          "{NAME}", 
          result.data.places[0].photos[3].name
        );
        setPhotoUrl(PhotoUrl);
      }
    } catch {
      // Use fallback image
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      await deleteDoc(doc(db, "AITrips", trip.id));
      toast.success("Trip deleted successfully");
      if (onDelete) onDelete(trip.id);
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  return (
    <div className="block h-full relative">
      {/* Delete button - positioned absolutely in the top-right corner */}
      <button 
        onClick={handleDelete}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors z-10"
        aria-label="Delete trip"
      >
        <FaTrash size={14} />
      </button>
      
      <div className="h-full flex flex-col">
        <div className="relative">
          {loading ? (
            <div className="bg-gray-200 h-36 sm:h-40 md:h-48 w-full animate-pulse"></div>
          ) : (
            <img 
              src={photoUrl ? photoUrl : '/placeholder11.png'} 
              className='h-36 sm:h-40 md:h-48 w-full object-cover' 
              onError={(e) => e.target.src = '/placeholder11.png'}
              alt={trip?.userSelection?.location?.label || "Trip destination"}
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3 md:p-4">
            <h2 className='font-bold text-base sm:text-lg text-white truncate'>{trip?.userSelection?.location?.label}</h2>
          </div>
        </div>
        <div className="p-3 sm:p-4 flex-grow">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
            <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
              🗓️ {trip?.userSelection?.noOfDays} Days
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
              💰 {trip?.userSelection?.budget}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
            {trip?.tripData?.summary || "Explore this amazing destination with a personalized itinerary."}
          </p>
        </div>
        <div className="p-3 sm:p-4 pt-0 mt-auto">
          <Link to={'/view-trip/'+trip?.id}>
            <button className="w-full py-1.5 sm:py-2 text-xs sm:text-sm text-orange-500 font-medium border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserTripCardItem;
