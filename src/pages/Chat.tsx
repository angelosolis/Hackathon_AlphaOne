import React, { useState, useRef, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Home, Mic, MicOff, Send, Loader2 } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Property {
  PropertyID: string;
  Title: string;
  Description: string;
  Price: number;
  Address: string;
  City: string;
  State: string;
  PropertyType: string;
  Bedrooms: number;
  Bathrooms: number;
  SquareFootage: number;
  imageUrls: string[];
  Status: string;
  CreationDate?: string;
  LastUpdated?: string;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  type: "text" | "voice";
  propertyId?: string;
  audioUrl?: string;
}

interface AppointmentDetails {
  requestedDate: string | null;
  requestedTime: string | null;
  notes?: string;
}

const Chat: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const propertyDetails = location.state?.propertyDetails as Property | undefined;
  const subject = location.state?.subject || searchParams.get("subject");
  const propertyId = searchParams.get("propertyId");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showPropertyInfo, setShowPropertyInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { userId, token } = useAuth();

  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails>({
    requestedDate: null,
    requestedTime: null,
    notes: ''
  });
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  // Add new state variable for permission dialog
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const fetchInitialAiMessage = async (details: Property, initialSubject?: string | null) => {
    console.log("Fetching initial AI message for property:", details.PropertyID);
    setIsInitialLoading(true);
    try {
      let systemMessage = `You are an AI real estate assistant named AlphaOne initiating a chat with a potential buyer about a specific property they just clicked on. 
        
Property Details:
- Property ID: ${details.PropertyID}
- Title: "${details.Title}"
- Address: ${details.Address}, ${details.City}${details.State ? `, ${details.State}` : ''}
- Property Type: ${details.PropertyType}
- Price: ₱${details.Price?.toLocaleString()}
- Bedrooms: ${details.Bedrooms}
- Bathrooms: ${details.Bathrooms}
- Square Footage: ${details.SquareFootage} sq ft
- Status: ${details.Status}
- Listed: ${details.CreationDate ? new Date(details.CreationDate).toLocaleDateString() : 'Recently'}
${details.Description ? `- Description: ${details.Description}` : ''}

Your task: Generate a single, welcoming introductory message (max 2-3 sentences). 
- Acknowledge you are an AI assistant powered by GPT-4o.
- Mention the specific property title and location briefly.
${initialSubject === 'viewing' 
? `- The user wants to schedule a viewing. Focus the greeting on helping them with that, asking for preferred times.` 
: `- Briefly highlight a key feature (like bedrooms/bathrooms/price) and ask how you can help with this specific property.`
}
- Maintain a helpful and enthusiastic tone.
`;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemMessage },
          ],
          temperature: 0.7,
          max_tokens: 150
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY}`
          }
        }
      );

      const aiText = response.data.choices[0].message.content;
      console.log("Initial AI message received:", aiText);
      
      const initialAiMessage: Message = {
        id: 1,
        text: aiText,
        sender: "ai",
        type: "text",
        propertyId: details.PropertyID,
      };
      
      setMessages([initialAiMessage]);

    } catch (error) {
      console.error("Failed to fetch initial AI message:", error);
      toast({
        title: "Initialization Error",
        description: "Could not connect to the AI assistant. Using default greeting.",
        variant: "destructive"
      });
      generateStaticInitialMessages(details, initialSubject);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const generateStaticInitialMessages = (details: Property, initialSubject?: string | null) => {
    const staticMessages: Message[] = [];
    staticMessages.push({
      id: 1,
      text: `Hello! I'm your AI assistant powered by GPT-4o. I can help you with information about the property you're interested in.`,
      sender: "ai", type: "text"
    });

    let propertyMsg = `You're looking at **${details.Title}** located at ${details.Address}, ${details.City}${details.State ? `, ${details.State}` : ''}.`;
    if (initialSubject === "viewing") {
      propertyMsg += " I'd be happy to help you schedule a viewing for this property. When would you like to visit?";
    } else {
      propertyMsg += ` This is a beautiful ${details.PropertyType} with ${details.Bedrooms} bedrooms and ${details.Bathrooms} bathrooms, priced at ₱${details.Price?.toLocaleString()}. How can I help you with this property today?`;
    }
    staticMessages.push({
      id: 2, text: propertyMsg, sender: "ai", type: "text", propertyId: details.PropertyID
    });
    setMessages(staticMessages);
  };

  useEffect(() => {
    setIsInitialLoading(true);

    if (propertyDetails) {
      fetchInitialAiMessage(propertyDetails, subject);
    } else if (propertyId) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your AI real estate assistant powered by GPT-4o. It seems you're interested in a specific property. How can I help you with it?",
          sender: "ai", type: "text", propertyId
        }
      ]);
      setIsInitialLoading(false);
    } else {
      setMessages([
        {
          id: 1, 
          text: "Hello! I'm your AI real estate assistant powered by GPT-4o. How can I help you find your perfect property today?", 
          sender: "ai", type: "text"
        }
      ]);
      setIsInitialLoading(false);
    }
  }, [propertyDetails?.PropertyID, subject]);

  const getOpenAIResponse = async (userMessage: string) => {
    try {
      setIsLoading(true);
      
      const messageHistory = messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));

      let systemMessage = "You are an AI real estate assistant named AlphaOne helping a potential buyer.";
      
      if (propertyDetails) {
        systemMessage = `You are an AI real estate assistant named AlphaOne helping a potential buyer with a specific property. 
        
Property Details:
- Property ID: ${propertyDetails.PropertyID}
- Title: "${propertyDetails.Title}"
- Address: ${propertyDetails.Address}, ${propertyDetails.City}${propertyDetails.State ? `, ${propertyDetails.State}` : ''}
- Property Type: ${propertyDetails.PropertyType}
- Price: ₱${propertyDetails.Price?.toLocaleString()}
- Bedrooms: ${propertyDetails.Bedrooms}
- Bathrooms: ${propertyDetails.Bathrooms}
- Square Footage: ${propertyDetails.SquareFootage} sq ft
- Status: ${propertyDetails.Status}
- Listed: ${propertyDetails.CreationDate ? new Date(propertyDetails.CreationDate).toLocaleDateString() : 'Recently'}
${propertyDetails.Description ? `- Description: ${propertyDetails.Description}` : ''}

Your tasks:
1. Always reference the specific property in your answers
2. Provide accurate information based on the property details above
3. Be conversational, helpful, and enthusiastic about the property
4. If asked about details not provided, acknowledge the limitation but offer to find out
5. **Scheduling Viewings:** When the user clearly expresses intent to schedule a viewing and provides preference for date and/or time, **first confirm the requested details** (e.g., "Okay, so you're interested in a viewing for [Property Title] on [Date] around [Time]?"). If they agree or seem positive, **respond ONLY with**: "Great! I have noted your request for [Date] at [Time]. Please click the 'Confirm Request' button below to submit it, and an agent will contact you to finalize the details."
6. Keep responses concise but informative, around 2-3 sentences when possible
7. Do NOT ask for contact information like phone or email.

Always identify yourself as the AI assistant for AlphaOne Real Estate.`;
      } else {
        systemMessage = `You are an AI real estate assistant named AlphaOne helping a potential buyer find properties. Be helpful, conversational, and ask qualifying questions to understand what type of property they're looking for if not specified. Focus on understanding their needs in terms of location, price range, number of bedrooms/bathrooms, property type, and any special requirements.`;
      }
      
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemMessage },
              ...messageHistory,
              { role: "user", content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 500
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY}`
            }
          }
        );
        
        return response.data.choices[0].message.content;
      } catch (apiError) {
        console.error("OpenAI API error:", apiError);
        return generateSimulatedResponse(userMessage);
      }
    } catch (error) {
      console.error("Error in AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Using simulated response instead.",
        variant: "destructive"
      });
      return generateSimulatedResponse(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimulatedResponse = (userMessage: string) => {
    const userInput = userMessage.toLowerCase();
    
    if (propertyDetails) {
      if (userInput.includes("price") || userInput.includes("cost") || userInput.includes("how much")) {
        return `This ${propertyDetails.PropertyType} is priced at ₱${propertyDetails.Price?.toLocaleString()}. It's competitively priced for the ${propertyDetails.City} area, especially considering its ${propertyDetails.Bedrooms} bedrooms and ${propertyDetails.Bathrooms} bathrooms.`;
      } else if (userInput.includes("location") || userInput.includes("address") || userInput.includes("where")) {
        return `${propertyDetails.Title} is located at ${propertyDetails.Address}, ${propertyDetails.City}${propertyDetails.State ? `, ${propertyDetails.State}` : ''}. It's in a great neighborhood with access to amenities such as schools, shopping centers, and public transportation.`;
      } else if (userInput.includes("viewing") || userInput.includes("visit") || userInput.includes("see") || userInput.includes("tour") || userInput.includes("when can i")) {
        return `I'd be happy to help you schedule a viewing of ${propertyDetails.Title}. When would be a convenient time for you? Our agents are typically available from Monday to Saturday, 9AM to 6PM.`;
      } else if (userInput.includes("bedroom") || userInput.includes("bed") || userInput.includes("sleep")) {
        return `This property has ${propertyDetails.Bedrooms} bedroom${propertyDetails.Bedrooms !== 1 ? 's' : ''}, which provides ample space for comfortable living. The bedrooms are well-sized with good natural lighting.`;
      } else if (userInput.includes("bathroom") || userInput.includes("bath") || userInput.includes("shower")) {
        return `This property features ${propertyDetails.Bathrooms} bathroom${propertyDetails.Bathrooms !== 1 ? 's' : ''}. They're modern and well-appointed with quality fixtures.`;
      } else if (userInput.includes("size") || userInput.includes("square") || userInput.includes("footage") || userInput.includes("how big")) {
        return `The property offers ${propertyDetails.SquareFootage} square feet of living space, providing a spacious and comfortable environment for residents.`;
      } else if (userInput.includes("status") || userInput.includes("available") || userInput.includes("still on market")) {
        return `The current status of this property is "${propertyDetails.Status}". ${propertyDetails.Status === 'Active' ? 'This means it is currently available for purchase.' : propertyDetails.Status === 'Pending' ? 'This means it is currently under contract, but the sale has not been finalized yet.' : propertyDetails.Status === 'Sold' ? 'This means the property has been sold and is no longer available.' : 'Please contact an agent for more details about its availability.'}`;
      } else if (userInput.includes("hello") || userInput.includes("hi") || userInput.includes("hey") || userInput.includes("greetings")) {
        return `Hello! Thank you for your interest in ${propertyDetails.Title}. How can I assist you with this property today?`;
      } else if (userInput.includes("thank") || userInput.includes("thanks")) {
        return `You're welcome! I'm happy to help with any other questions you have about ${propertyDetails.Title}. Is there anything else you'd like to know?`;
      } else {
        return `Thank you for your interest in ${propertyDetails.Title}. This ${propertyDetails.PropertyType} has ${propertyDetails.Bedrooms} bedrooms, ${propertyDetails.Bathrooms} bathrooms, and ${propertyDetails.SquareFootage} sq. ft. of living space. The current status is ${propertyDetails.Status}. How else can I help you with this property? You can ask about price, location, features, or scheduling a viewing.`;
      }
    } else {
      if (userInput.includes("hello") || userInput.includes("hi") || userInput.includes("hey") || userInput.includes("greetings")) {
        return "Hello! I'm your AI real estate assistant. How can I help you find your perfect property today?";
      } else if (userInput.includes("thank") || userInput.includes("thanks")) {
        return "You're welcome! Is there anything else I can help you with in your property search?";
      } else {
        return "I'd be happy to help you with your real estate needs. Could you please provide more details about what you're looking for in a property? For example, what area are you interested in, how many bedrooms do you need, or what's your budget range?";
      }
    }
  };

  // Add function to detect Android and check/request permissions
  const checkAndRequestMicrophonePermission = async () => {
    // Check if on Android by examining the user agent
    const isAndroid = /android/i.test(navigator.userAgent);
    
    // On Android, show a custom permission dialog first
    if (isAndroid) {
      try {
        // First check if permissions are already granted
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permissionStatus.state === 'granted') {
          // Permission already granted, proceed with recording
          await startRecordingProcess();
        } else if (permissionStatus.state === 'prompt') {
          // Show our custom dialog before browser prompt
          setShowPermissionDialog(true);
        } else {
          // Permission denied, show instructions
          toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access in your browser settings to use voice input.",
            variant: "destructive"
          });
        }
      } catch (error) {
        // If permissions API isn't available, just try to start recording
        console.log("Could not check permissions, attempting to request directly");
        setShowPermissionDialog(true);
      }
    } else {
      // Not on Android, proceed normally
      await startRecordingProcess();
    }
  };

  // Function to handle user confirming they want to allow mic access
  const handlePermissionConfirm = async () => {
    setShowPermissionDialog(false);
    await startRecordingProcess();
  };
  
  // Rename existing startRecording to startRecordingProcess
  const startRecordingProcess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.wav');
          formData.append('model', 'whisper-1');
          
          const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            formData,
            {
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          if (response.data && response.data.text) {
            setInput(response.data.text);
            handleSend(response.data.text);
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
          toast({
            title: "Transcription Failed",
            description: "Could not convert speech to text. Please try typing instead.",
            variant: "destructive"
          });
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive"
      });
    }
  };
  
  // Update the startRecording function to use our new permission checker
  const startRecording = async () => {
    await checkAndRequestMicrophonePermission();
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
      
      toast({
        title: "Recording Stopped",
        description: "Converting your speech to text...",
        variant: "default"
      });
    }
  };

  const parseDateTimeFromText = (text: string): Partial<AppointmentDetails> => {
    let date = null;
    let time = null;

    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})|(tomorrow)|(next\s+\w+)/i);
    if (dateMatch && dateMatch[0]) {
      if (dateMatch[0].toLowerCase() === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        date = tomorrow.toISOString().split('T')[0];
      } else {
        try {
          date = new Date(dateMatch[0]).toISOString().split('T')[0];
        } catch { date = dateMatch[0]; }
      }
    }

    const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)|(\d{1,2}\s*(?:AM|PM))/i);
    if (timeMatch && timeMatch[0]) {
      let rawTime = timeMatch[0].toUpperCase();
      let hour: number | string = parseInt(rawTime.split(':')[0]);
      let minute: number | string = 0;
      if (rawTime.includes(':')) {
        minute = parseInt(rawTime.split(':')[1].replace(/[^0-9]/g, ''));
      }

      if (rawTime.includes('PM') && hour !== 12) {
        hour += 12;
      } else if (rawTime.includes('AM') && hour === 12) {
        hour = 0;
      }

      hour = hour.toString().padStart(2, '0');
      minute = minute.toString().padStart(2, '0');
      time = `${hour}:${minute}`;
    } else if (text.match(/morning/i)) {
        time = "10:00";
    } else if (text.match(/afternoon/i)) {
        time = "14:00";
    } else if (text.match(/evening/i)) {
        time = "18:00";
    }

    console.log("Parsed Date:", date, "Parsed Time:", time);
    return { requestedDate: date, requestedTime: time };
  };

  const handleSend = async (voiceText?: string) => {
    const messageText = voiceText || input;
    if (messageText.trim() === "") return;
    
    setShowConfirmButton(false);

    const userMessage: Message = { 
      id: messages.length + 1, 
      text: messageText, 
      sender: "user", 
      type: voiceText ? "voice" : "text" 
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    
    const aiResponseText = await getOpenAIResponse(messageText);
    
    const aiMessage: Message = { 
      id: messages.length + 2,
      text: aiResponseText, 
      sender: "ai", 
      type: "text",
      propertyId: propertyDetails?.PropertyID 
    };
    
    setMessages(prevMessages => [...prevMessages, aiMessage]);
    
    if (aiResponseText.includes("Please click the 'Confirm Request' button")) {
      console.log("Detected scheduling intent trigger phrase.");
      const parsedDetails = parseDateTimeFromText(messageText);
      const parsedDetailsFromAI = parseDateTimeFromText(aiResponseText);
      
      const finalDetails: AppointmentDetails = {
          requestedDate: parsedDetails.requestedDate || parsedDetailsFromAI.requestedDate,
          requestedTime: parsedDetails.requestedTime || parsedDetailsFromAI.requestedTime,
          notes: `User confirmed interest via chat. AI proposed: ${aiResponseText}`
      }

      console.log("Setting appointment details:", finalDetails);
      setAppointmentDetails(finalDetails);
      setShowConfirmButton(true);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirmAppointmentRequest = async () => {
    if (!propertyDetails || !userId) {
        toast({ title: "Error", description: "Cannot request appointment. Missing property or user details.", variant: "destructive" });
        return;
    }
    if (!appointmentDetails.requestedDate || !appointmentDetails.requestedTime) {
        toast({ title: "Information Missing", description: "Please ensure date and time are mentioned in your request before confirming.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    setShowConfirmButton(false);

    try {
        const payload = {
            propertyId: propertyDetails.PropertyID,
            requestedDate: appointmentDetails.requestedDate,
            requestedTime: appointmentDetails.requestedTime,
            notes: appointmentDetails.notes
        };
        console.log("Sending appointment request:", payload);

        const response = await axios.post('/api/appointments', payload, {
           headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
           }
        });

        console.log("Appointment request response:", response.data);
        toast({ title: "Success", description: "Viewing request sent! An agent will contact you shortly." });
        
        const confirmationMessage: Message = {
            id: messages.length + 1,
            text: "Your viewing request has been submitted to an agent.",
            sender: "ai",
            type: "text",
            propertyId: propertyDetails.PropertyID
        };
        setMessages(prev => [...prev, confirmationMessage]);

    } catch (error: any) {
        console.error("Error sending appointment request:", error);
        const errorMessage = error.response?.data?.message || "Could not send appointment request. Please try again later.";
        toast({ title: "Request Failed", description: errorMessage, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const renderPropertyCard = () => {
    if (!propertyDetails) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        {propertyDetails.imageUrls && propertyDetails.imageUrls.length > 0 && (
          <img 
            src={propertyDetails.imageUrls[0]} 
            alt={propertyDetails.Title}
            className="w-full h-48 object-cover" 
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
            }}
          />
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{propertyDetails.Title}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{propertyDetails.Address}, {propertyDetails.City}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold flex items-center">
              <span className="font-bold mr-1">₱</span>
              {propertyDetails.Price?.toLocaleString()}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              propertyDetails.Status === 'Active' ? 'bg-green-100 text-green-800' :
              propertyDetails.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              propertyDetails.Status === 'Sold' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {propertyDetails.Status}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {propertyDetails.Bedrooms} beds
            </span>
            <span className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {propertyDetails.Bathrooms} baths
            </span>
            <span className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              {propertyDetails.PropertyType}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      {/* Add the permission dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Microphone Access Required</h3>
            <p className="mb-6">
              To use voice input, AlphaOne needs access to your microphone. When prompted by your browser, please tap "Allow".
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPermissionDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePermissionConfirm}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#222222]">AI Property Assistant</h1>
          {propertyDetails && (
            <Button 
              variant="outline" 
              onClick={() => setShowPropertyInfo(!showPropertyInfo)}
              className="text-sm"
            >
              {showPropertyInfo ? "Hide Property Info" : "Show Property Info"}
            </Button>
          )}
        </div>
        
        {showPropertyInfo && propertyDetails && renderPropertyCard()}
        
        <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col">
          <div className="p-4 overflow-y-auto flex-1">
            {isInitialLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Connecting to AI Assistant...</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
            } mb-4`}
          >
                  {message.sender === "ai" && (
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-2">
                      <span className="text-sm font-bold text-white">AI</span>
              </div>
            )}
                  <div className="max-w-[75%]">
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.sender === "user"
                          ? "bg-primary text-white"
                      : "bg-gray-200 text-[#222222]"
                  }`}
                >
                      <div>{message.text}</div>
                      {message.propertyId && message.sender === "ai" && (
                        <div className="text-xs mt-1 opacity-70">
                          Re: Property #{message.propertyId}
                        </div>
                      )}
                </div>
                    {message.audioUrl && (
                      <audio controls src={message.audioUrl} className="mt-2 w-full" />
                    )}
                  </div>
                  {message.sender === "user" && (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center ml-2">
                      <span className="text-sm font-bold text-gray-600">You</span>
                    </div>
                  )}
                 </div>
              ))
            )}
            {isLoading && !isInitialLoading && (
               <div className="flex justify-start mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-2">
                  <span className="text-sm font-bold text-white">AI</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-gray-200 text-[#222222]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {showConfirmButton && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <Button 
                    onClick={handleConfirmAppointmentRequest}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                   >
                    {isLoading ? 'Sending Request...' : 'Confirm Viewing Request'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                      Clicking confirm will send your request for {appointmentDetails.requestedDate} around {appointmentDetails.requestedTime} to an agent.
                  </p>
      </div>
          )}

          <div className={`p-4 border-t border-gray-200 flex items-center ${isInitialLoading ? 'opacity-50' : ''} ${showConfirmButton ? 'border-b-0' : ''}`}>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`mr-2 p-2 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              size="icon"
              variant="ghost"
              type="button"
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              disabled={isInitialLoading}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
        <textarea
          ref={textareaRef}
              className="flex-grow border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          rows={1}
          value={input}
          onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={isInitialLoading ? "Connecting to AI..." : isRecording ? "Recording..." : "Type your message or use voice input..."}
          style={{ overflow: "hidden" }}
              disabled={isRecording || isInitialLoading}
            />
            <Button
              onClick={() => handleSend()}
              className="ml-2 bg-primary hover:bg-primary/90 text-white"
              disabled={isLoading || isInitialLoading || input.trim() === ""}
              aria-label="Send message"
            >
              {isLoading && !isInitialLoading ? (
                <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;