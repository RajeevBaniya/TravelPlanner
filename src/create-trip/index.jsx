import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SelectBudgetOptions,
  SelectTravelesList,
  AI_PROMPT,
} from "@/constants/options";
import { chatSession } from "@/service/AIModal";
import React, { useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import axios from "axios";

import { AiOutlineLoading3Quarters, AiOutlineCheck } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { useNavigate } from "react-router-dom";

const accordionSections = [
  {
    key: "location",
    label: "Destination",
    desc: "Where would you like to go?",
  },
  {
    key: "noOfDays",
    label: "Trip Duration",
    desc: "How long are you planning to be on your trip?",
  },
  {
    key: "budget",
    label: "Budget",
    desc: "What is your budget?",
  },
  {
    key: "traveler",
    label: "Travelers",
    desc: "With whom do you plan to travel?",
  },
];

function CreateTrip() {
  const [place, setPlace] = useState();
  const [formData, setFormData] = useState({});
  const [openDailog, setOpenDailog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => toast("Sign-in failed. Please try again."),
  });

  const parseTripData = (rawTripData) => {
    if (!rawTripData) {
      throw new Error("Empty AI response");
    }

    if (typeof rawTripData === "object") {
      return rawTripData;
    }

    const normalized = rawTripData
      .toString()
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .trim();

    const firstBraceIndex = normalized.indexOf("{");
    const lastBraceIndex = normalized.lastIndexOf("}");

    if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
      throw new Error("Unable to locate JSON object in AI response");
    }

    const jsonSubstring = normalized.slice(firstBraceIndex, lastBraceIndex + 1);

    return JSON.parse(jsonSubstring);
  };

  const validateTripData = (tripData) => {
    if (!tripData || typeof tripData !== "object") {
      return { valid: false, error: "Invalid trip data structure" };
    }

    if (!Array.isArray(tripData.hotelOptions) || tripData.hotelOptions.length === 0) {
      return { valid: false, error: "No hotel options found in response" };
    }

    if (!tripData.itinerary || typeof tripData.itinerary !== "object") {
      return { valid: false, error: "No itinerary found in response" };
    }

    const dayKeys = Object.keys(tripData.itinerary);
    if (dayKeys.length === 0) {
      return { valid: false, error: "Itinerary is empty" };
    }

    for (const dayKey of dayKeys) {
      const dayData = tripData.itinerary[dayKey];
      if (!dayData || !Array.isArray(dayData.plan) || dayData.plan.length === 0) {
        return { valid: false, error: `Day ${dayKey} has no places to visit` };
      }
    }

    return { valid: true };
  };

  const OnGenerateTrip = async () => {
    const user = localStorage.getItem("user");

    if (!user) {
      setOpenDailog(true);
      return;
    }

    if (
      !formData?.noOfDays ||
      !formData?.location ||
      !formData?.budget ||
      !formData?.traveler
    ) {
      toast("Please fill all the details");
      return;
    }

    setLoading(true);
    const FINAL_PROMPT = AI_PROMPT.replace(
      "{location}",
      formData?.location?.label
    )
      .replace("{totalDays}", formData?.noOfDays)
      .replace("{traveler}", formData?.traveler)
      .replace("{budget}", formData?.budget)
      .replace("{totalDays}", formData?.noOfDays);

    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const rawTripData = result?.response?.text();

      const parsedTripData = parseTripData(rawTripData);
      const validation = validateTripData(parsedTripData);

      if (!validation.valid) {
        setLoading(false);
        toast.error(`Unable to generate trip: ${validation.error}. Please try again.`);
        return;
      }

      setLoading(false);
      SaveAiTrip(parsedTripData);
    } catch (error) {
      setLoading(false);
      const errorMessage = error.message || "Unknown error occurred";
      toast.error(`Failed to generate trip: ${errorMessage}. Please try again.`);
    }
  };

  const SaveAiTrip = async (tripData) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const docId = Date.now().toString();

      await setDoc(
        doc(db, "AITrips", docId),
        {
          userSelection: formData,
          tripData,
          userEmail: user?.email,
          id: docId,
        }
      );
      setLoading(false);
      navigate('/view-trip/' + docId);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to save trip. Please try again.");
    }
  };

  const GetUserProfile = (tokenInfo) => {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo?.access_token}`,
            Accept: "Application/json",
          },
        }
      )
      .then((resp) => {
        localStorage.setItem("user", JSON.stringify(resp.data));
        setOpenDailog(false);
        OnGenerateTrip();
      })
      .catch(() => {
        toast("Unable to fetch your profile. Please try again.");
      });
  };

  const isStepComplete = (index) => {
    switch(index) {
      case 0:
        return !!formData.location;
      case 1:
        return !!formData.noOfDays;
      case 2:
        return !!formData.budget;
      case 3:
        return !!formData.traveler;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch(step) {
      case 0:
        return (
          <div className="w-full">
            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
              selectProps={{
                place,
                onChange: (v) => {
                  setPlace(v);
                  handleInputChange("location", v);
                },
                styles: {
                  control: (provided) => ({
                    ...provided,
                    minHeight: '48px',
                    fontSize: '1.1rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                  }),
                },
                placeholder: "Search for a destination...",
              }}
            />
          </div>
        );
      case 1:
        return (
          <Input
            placeholder="Ex. 3"
            type="number"
            min="1"
            max="6"
            onChange={(e) => {
              // Ensure value is between 1 and 6
              const value = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 6);
              handleInputChange("noOfDays", value.toString());
              e.target.value = value;
            }}
            className="h-12 text-lg rounded-xl border-gray-300 focus:ring-2 focus:ring-orange-400"
            value={formData?.noOfDays || ''}
          />
        );
      case 2:
        return (
          <div className="grid grid-cols-3 gap-3">
            {SelectBudgetOptions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange("budget", item.title)}
                className={`group p-3 border-2 cursor-pointer rounded-xl transition-all duration-200 flex flex-col items-center
                  ${formData?.budget === item.title ? "border-orange-500 shadow-lg scale-105" : "border-gray-200"}
                `}
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className="font-semibold text-sm">{item.title}</span>
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-2 gap-3">
            {SelectTravelesList.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange("traveler", item.people)}
                className={`group p-3 border-2 cursor-pointer rounded-xl transition-all duration-200 flex flex-col items-center
                  ${formData?.traveler === item.people ? "border-orange-500 shadow-lg scale-105" : "border-gray-200"}
                `}
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className="font-semibold text-sm">{item.title}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Inspirational Image - Fixed */}
      <div className="lg:hidden w-full bg-orange-50 py-6 px-4 border-b border-gray-100">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">Plan Your Dream Journey</h1>
      </div>

      <div className="hidden lg:flex w-5/12 bg-orange-50 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full pt-4 px-6 sm:px-12 pb-12 text-gray-900">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-blue-500 text-transparent bg-clip-text">Plan Your Dream Journey</h1>
          <img 
            src="/Blue Colorful Bold Geometric Ireland Photo Album Instagram Post.gif" 
            alt="Travel" 
            className="mt-4 rounded-xl shadow-2xl w-full max-w-lg object-cover" 
          />
        </div>
      </div>

      {/* Right Side - Scrollable Form */}
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)] lg:h-screen">
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm">
              <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 lg:hidden">Create Your Trip</h2>
                <h2 className="hidden lg:block text-2xl font-bold text-gray-900 mb-6">Create Your Trip</h2>
                
                {/* Vertical Timeline */}
                <div className="relative">
                  {accordionSections.map((section, index) => (
                    <div key={section.key} className="mb-6">
                      <div className="flex items-start">
                        {/* Timeline Line */}
                        <div className="relative flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
                            ${isStepComplete(index) ? 'bg-green-500' : activeStep === index ? 'bg-blue-500' : 'bg-gray-200'}`}>
                            {isStepComplete(index) ? (
                              <AiOutlineCheck className="text-white w-4 h-4" />
                            ) : (
                              <span className="text-white">{index + 1}</span>
                            )}
                          </div>
                          {index < accordionSections.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 absolute top-6" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="ml-4 flex-1">
                          <div className="mb-2">
                            <h3 className="text-base font-semibold text-gray-900">{section.label}</h3>
                            <p className="text-sm text-gray-500">{section.desc}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
                            {renderStepContent(index)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generate Button - Outside sections */}
                <div className="flex justify-center mt-8">
                  <Button
                    disabled={loading}
                    onClick={OnGenerateTrip}
                    className="mb-10 inline-flex items-center justify-center px-8 py-3 rounded-full border-2 border-[#F47E3E] text-[#F47E3E] bg-transparent hover:bg-[#F47E3E] hover:text-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : (
                      "Generate Trip"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Sign-In Dialog */}
      <Dialog open={openDailog} onOpenChange={setOpenDailog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <img
              src="/logo.png"
              alt="Travel AI Logo"
              className="h-auto w-auto max-h-[24px] sm:max-h-[26px] md:max-h-[30px] lg:max-h-[40px] mx-auto"
            />
            <DialogTitle className="font-bold text-base mt-3 text-center">Sign in with Google</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-center">
              Sign in to the app securely with Google authentication.
            </DialogDescription>
            <Button
              onClick={login}
              className="w-full mt-4 flex gap-2 items-center justify-center bg-black text-white hover:bg-gray-800 rounded-lg text-sm py-2"
            >
              <FcGoogle className="w-4 h-4" />
              Sign in with Google
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
