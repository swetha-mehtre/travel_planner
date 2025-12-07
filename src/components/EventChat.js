import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { modifyEvent } from '../api/modifyEvent';

const EventChat = ({ event, onClose, onEventUpdate, isActivity = true, currentItinerary }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content: `I can help you modify this ${isActivity ? 'activity' : 'meal'}. What would you like to change about "${event.name}"?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');

    try {
      // Construct context for the AI
      const context = {
        type: isActivity ? 'activity' : 'meal',
        currentDetails: {
          name: event.name,
          time: event.time,
          description: event.description,
          cost: event.cost,
          ...(isActivity ? { coordinates: event.coordinates, transport: event.transport, distance: event.distance } : { type: event.type })
        }
      };

      const result = await modifyEvent(message, context, currentItinerary);

      // Add AI response and optional follow-up
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: result.message },
        ...(result.updatedEvent ? [{
          role: 'assistant',
          content: "I've updated the event with your changes. Is there anything else you'd like to modify?"
        }] : [])
      ]);

      if (result.updatedEvent) {
        onEventUpdate(result.updatedEvent);
      }
    } catch (error) {
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error while processing your request. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Modify {isActivity ? 'Activity' : 'Meal'}: {event.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <span className="flex space-x-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400" />
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your changes for this event..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventChat;