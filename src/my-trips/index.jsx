import { db } from "@/service/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserTripCardItem from "./components/UserTripCardItem";

function MyTrips() {
  const navigate = useNavigate();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetUserTrips();
  }, []);

  const GetUserTrips = async() => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user){
        navigate('/');
        return;
    }
    
    const q = query(collection(db, 'AITrips'), where('userEmail', '==', user?.email));
    const querySnapshot = await getDocs(q);
    
    const tripsArray = [];
    
    querySnapshot.forEach((doc) => {
      tripsArray.push(doc.data());
    });
    
    setUserTrips(tripsArray);
    setLoading(false);
  };

  // Add this function to handle trip deletion
  const handleTripDelete = (tripId) => {
    setUserTrips(userTrips.filter(trip => trip.id !== tripId));
  };

  return(
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">My Trips</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1,2,3].map((item) => (
            <div key={item} className="bg-gray-200 rounded-xl h-[200px] sm:h-[240px] md:h-[280px] animate-pulse"></div>
          ))}
        </div>
      ) : userTrips.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {userTrips.map((trip, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <UserTripCardItem trip={trip} onDelete={handleTripDelete} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 md:py-16">
          <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">✈️</div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-500 mb-4 sm:mb-6 px-4">Start planning your next adventure today!</p>
        </div>
      )}
    </div>
  )
}

export default MyTrips;
