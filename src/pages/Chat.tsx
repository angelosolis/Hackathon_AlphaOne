import React, { useState, useRef } from "react";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How are you?", sender: "other", type: "text" },
    { id: 2, text: "I'm good, thanks! How about you?", sender: "current", type: "text" },
    { id: 3, text: "Check out these listings!", sender: "other", type: "listings" },
    { id: 4, text: "Voice message 2", sender: "current", type: "voice", duration: "0:30" },
  ]);
  const [input, setInput] = useState("");
  const [showListings, setShowListings] = useState(false); // State to toggle popup
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const listings = [
    {
      id: 1,
      image: "https://via.placeholder.com/300x200",
      location: "New York, NY",
      price: "$1,200,000",
      agent: "John Doe",
      rating: 4.5,
    },
    {
      id: 2,
      image: "https://via.placeholder.com/300x200",
      location: "Los Angeles, CA",
      price: "$950,000",
      agent: "Jane Smith",
      rating: 4.0,
    },
    {
      id: 3,
      image: "https://via.placeholder.com/300x200",
      location: "Chicago, IL",
      price: "$750,000",
      agent: "Michael Brown",
      rating: 4.8,
    },
  ];

  const handleSend = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { id: messages.length + 1, text: input, sender: "current", type: "text" }]);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; // Reset height after sending
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to calculate new height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust height based on content
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#222222] mb-4">Chat</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md h-[400px] overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "current" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            {message.sender === "other" && (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                <span className="text-sm font-bold text-gray-600">O</span>
              </div>
            )}
            <div>
              {message.type === "text" ? (
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === "current"
                      ? "bg-[#EA384C] text-white"
                      : "bg-gray-200 text-[#222222]"
                  }`}
                >
                  {message.text}
                </div>
              ) : message.type === "listings" ? (
                <div>
                  <div
                    className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 text-[#222222] hover:bg-gray-300"
                  >
                    {message.text}
                  </div>
                  <button
                    onClick={() => setShowListings(true)}
                    className="mt-2 px-4 py-2 bg-[#EA384C] text-white rounded-lg hover:bg-[#c32f3e] w-full"
                  >
                    Check Listings
                  </button>
                </div>
              ) : (
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg flex items-center gap-2 ${
                    message.sender === "current"
                      ? "bg-[#EA384C] text-white"
                      : "bg-gray-200 text-[#222222]"
                  }`}
                >
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5L6 9H4a1 1 0 00-1 1v4a1 1 0 001 1h2l5 4V5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.07 4.93a10.97 10.97 0 010 14.14m-2.83-2.83a7.97 7.97 0 000-8.48"
                      />
                    </svg>
                  </button>
                  <div className="flex-grow bg-gray-300 h-1 rounded-full relative">
                    <div
                      className={`absolute top-0 left-0 h-1 ${
                        message.sender === "current" ? "bg-white" : "bg-[#EA384C]"
                      }`}
                      style={{ width: "50%" }} // Simulated progress
                    ></div>
                  </div>
                  <span className="text-sm">{message.duration}</span>
                </div>
              )}
            </div>
            {message.sender === "current" && (
              <div className="w-10 h-10 bg-[#EA384C] rounded-full flex items-center justify-center ml-2">
                <span className="text-sm font-bold text-white">C</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center">
        <button className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-2 hover:bg-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 1v11m0 0a4 4 0 004-4V5a4 4 0 00-8 0v3a4 4 0 004 4zm0 0v4m0 4h4m-4 0H8"
            />
          </svg>
        </button>
        <textarea
          ref={textareaRef}
          className="flex-grow border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
          rows={1}
          value={input}
          onChange={handleInput}
          placeholder="Type your message..."
          style={{ overflow: "hidden" }}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-[#EA384C] text-white rounded-lg hover:bg-[#c32f3e] focus:outline-none"
        >
          Send
        </button>
      </div>

      {/* Popup for Listings */}
      {showListings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <h2 className="text-xl font-bold mb-4">Available Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden"
                >
                  <img
                    src={listing.image}
                    alt={listing.location}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-bold text-lg">{listing.location}</p>
                    <p className="text-gray-600">{listing.price}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-700 text-sm">{listing.agent}</span>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, index) => (
                          <svg
                            key={index}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-4 h-4 ${
                              index < Math.floor(listing.rating) ? "fill-current" : "stroke-current"
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowListings(false)}
              className="mt-4 px-4 py-2 bg-[#EA384C] text-white rounded-lg hover:bg-[#c32f3e]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;