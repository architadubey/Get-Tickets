import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [globalBookedSeats, setGlobalBookedSeats] = useState({});

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      const data = await res.json();
      setBookings(data);
      
      const seatsMap = {};
      data.forEach(b => {
        const showKey = `${b.movieId}_${b.showTime}`;
        seatsMap[showKey] = [...(seatsMap[showKey] || []), ...b.seats];
      });
      setGlobalBookedSeats(seatsMap);
    } catch (err) {
      console.error('Error fetching bookings', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const addBooking = async (booking) => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      const newBooking = await res.json();
      
      const showKey = `${booking.movieId}_${booking.showTime}`;
      setGlobalBookedSeats(prev => ({
        ...prev,
        [showKey]: [...(prev[showKey] || []), ...booking.seats]
      }));

      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      console.error('Error adding booking', err);
      throw err;
    }
  };

  const getBookings = (userEmail) => {
    return bookings.filter(b => b.userEmail === userEmail);
  };

  const cancelBooking = (bookingId) => {
    // Left as stub since deleting bookings isn't fully implemented backend-wise or requested,
    // but we can update state locally.
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  return (
    <BookingContext.Provider value={{ bookings, globalBookedSeats, addBooking, getBookings, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
};
