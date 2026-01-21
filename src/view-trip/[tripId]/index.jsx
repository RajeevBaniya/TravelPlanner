import { db } from '@/service/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';
import InfoSection from '../components/InfoSection';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';
import Footer from '../components/Footer';

function Viewtrip() {

    const {tripId}=useParams();
    const [trip,setTrip]=useState([]);
    useEffect(()=>{
        tripId&&GetTripData();
    },[tripId])

    // Used to get Trip Information from Firebase

    const normalizeTripData = (rawTrip) => {
        if (!rawTrip || typeof rawTrip !== "object") {
            return rawTrip;
        }

        const rawTripData = rawTrip.tripData;

        if (!rawTripData) {
            return rawTrip;
        }

        if (typeof rawTripData === "object") {
            return rawTrip;
        }

        try {
            const normalized = rawTripData
                .toString()
                .replace(/```json/gi, "")
                .replace(/```/gi, "")
                .trim();
            
            const firstBraceIndex = normalized.indexOf("{");
            const lastBraceIndex = normalized.lastIndexOf("}");

            if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
                return rawTrip;
            }

            const jsonSubstring = normalized.slice(firstBraceIndex, lastBraceIndex + 1);
            const parsedTripData = JSON.parse(jsonSubstring);

            return { ...rawTrip, tripData: parsedTripData };
        } catch {
            return rawTrip;
        }
    };

    const GetTripData=async()=>{
        const docRef=doc(db, 'AITrips', tripId)
        const docSnap=await getDoc(docRef);

        if(docSnap.exists()){
            setTrip(normalizeTripData(docSnap.data()));
        }
        else{
            toast('No trip Found!')
        }
    }
  return (
    <div>
        {/* Information Sections */}
        <InfoSection trip={trip} />

        {/* Recommended Hotels */}
        <Hotels trip={trip} />

        {/* Daily Plan */}
        <PlacesToVisit trip={trip} />
        
        {/* Footer */}
        <Footer trip={trip}/>
    </div>
  )
}

export default Viewtrip