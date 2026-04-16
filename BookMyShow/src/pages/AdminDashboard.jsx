import React, { useState, useEffect, useMemo } from 'react';
import moviesData from '../data/movies.json';
import eventsData from '../data/events.json';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';

// ── Blank templates ──
const blankMovie = {
  title: '', genre: '', language: 'English', rating: '8.0',
  poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300&h=450',
  description: '', duration: '2h 15m', certificate: 'UA', trending: false,
};

const blankEvent = {
  title: '', category: 'Comedy Shows', icon: '😂', date: '', time: '07:00 PM',
  venue: '', city: '', price: '', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=280&fit=crop',
  description: '', tag: 'NEW',
};

// ── Sidebar tabs ──
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'movies',    label: 'Movies',    icon: '🎬' },
  { id: 'events',    label: 'Events',    icon: '🎭' },
  { id: 'bookings',  label: 'Bookings',  icon: '🎟️' },
  { id: 'users',     label: 'Users',     icon: '👤' },
];

const eventCategoryIcons = {
  'Comedy Shows': '😂', 'Parks': '🎡', 'Theater': '🎭', 'Kids': '🧒',
  'Music Shows': '🎵', 'Workshop': '🎨', 'Training': '💻', 'Adventure': '🏕️',
};

// ── Sample seed users ──
const sampleUsers = [
  { id: 'user_1001', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '9876543210', city: 'Mumbai', interests: ['Movies', 'Sports'], password: '****', createdAt: '2026-03-10T08:00:00.000Z' },
  { id: 'user_1002', name: 'Priya Patel', email: 'priya.patel@outlook.com', phone: '9123456789', city: 'Delhi', interests: ['Movies', 'Events'], password: '****', createdAt: '2026-03-12T14:30:00.000Z' },
  { id: 'user_1003', name: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', phone: '9988776655', city: 'Bangalore', interests: ['Movies', 'Sports', 'Events'], password: '****', createdAt: '2026-03-15T10:15:00.000Z' },
  { id: 'user_1004', name: 'Sneha Reddy', email: 'sneha.reddy@yahoo.com', phone: '9871234567', city: 'Hyderabad', interests: ['Movies', 'Events'], password: '****', createdAt: '2026-03-18T11:45:00.000Z' },
  { id: 'user_1005', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '9765432890', city: 'Mumbai', interests: ['Movies'], password: '****', createdAt: '2026-03-22T09:00:00.000Z' },
  { id: 'user_1006', name: 'Ananya Gupta', email: 'ananya.gupta@gmail.com', phone: '9654321987', city: 'Pune', interests: ['Movies', 'Events', 'Sports'], password: '****', createdAt: '2026-03-25T16:20:00.000Z' },
  { id: 'user_1007', name: 'Amit Kumar', email: 'amit.kumar@hotmail.com', phone: '9543210876', city: 'Chennai', interests: ['Movies', 'Sports'], password: '****', createdAt: '2026-03-28T07:30:00.000Z' },
  { id: 'user_1008', name: 'Neha Verma', email: 'neha.verma@gmail.com', phone: '9432109765', city: 'Kolkata', interests: ['Movies', 'Events'], password: '****', createdAt: '2026-04-01T13:10:00.000Z' },
  { id: 'user_1009', name: 'Rohan Joshi', email: 'rohan.joshi@gmail.com', phone: '9321098654', city: 'Mumbai', interests: ['Movies'], password: '****', createdAt: '2026-04-05T18:40:00.000Z' },
  { id: 'user_1010', name: 'Kavita Nair', email: 'kavita.nair@outlook.com', phone: '9210987543', city: 'Bangalore', interests: ['Events', 'Movies'], password: '****', createdAt: '2026-04-08T20:55:00.000Z' },
  { id: 'user_1011', name: 'Dev Kapoor', email: 'dev.kapoor@gmail.com', phone: '9109876432', city: 'Delhi', interests: ['Movies', 'Sports'], password: '****', createdAt: '2026-04-10T12:05:00.000Z' },
  { id: 'user_1012', name: 'Meera Iyer', email: 'meera.iyer@gmail.com', phone: '9098765321', city: 'Chennai', interests: ['Movies', 'Events'], password: '****', createdAt: '2026-04-12T15:30:00.000Z' },
];

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
};

// ════════════════════════════════════════════
//  ADMIN DASHBOARD
// ════════════════════════════════════════════
const AdminDashboard = () => {
  const { bookings } = useBooking();
  const { showToast } = useToast();

  // ── Active tab ──
  const [activeTab, setActiveTab] = useState('dashboard');

  // ── Seed sample users on first load ──
  useEffect(() => {
    const existingUsers = localStorage.getItem('gettickets_users');
    if (!existingUsers || JSON.parse(existingUsers).length === 0) {
      localStorage.setItem('gettickets_users', JSON.stringify(sampleUsers));
    }
  }, []);

  // ── Movies state ──
  const [movies, setMovies] = useState([]);
  const [movieSearch, setMovieSearch] = useState('');
  const [movieModal, setMovieModal] = useState(null); // null | 'add' | movie object (edit)
  const [movieForm, setMovieForm] = useState(blankMovie);

  // ── Events state ──
  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState('');
  const [eventModal, setEventModal] = useState(null);
  const [eventForm, setEventForm] = useState(blankEvent);

  // ── Booking search ──
  const [bookingSearch, setBookingSearch] = useState('');

  // ── Users ──
  const [users, setUsers] = useState([]);

  // ── Fetch Initial Data ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, eRes, uRes] = await Promise.all([
          fetch('http://localhost:5000/api/movies'),
          fetch('http://localhost:5000/api/events'),
          fetch('http://localhost:5000/api/users')
        ]);
        const mData = await mRes.json();
        const eData = await eRes.json();
        const uData = await uRes.json();
        setMovies(mData);
        setEvents(eData);
        setUsers(uData);
      } catch (err) {
        console.error('Error fetching data for admin dashboard', err);
      }
    };
    fetchData();
  }, [activeTab]); // Refetch if tab changes just in case

  // ═══════════════════
  //  MOVIE CRUD
  // ═══════════════════
  const openAddMovie = () => { setMovieForm(blankMovie); setMovieModal('add'); };
  const openEditMovie = (m) => {
    setMovieForm({ ...m, genre: Array.isArray(m.genre) ? m.genre.join(', ') : m.genre, rating: String(m.rating) });
    setMovieModal(m);
  };
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    const genreArr = movieForm.genre.split(',').map(g => g.trim()).filter(Boolean);
    const payload = { ...movieForm, genre: genreArr, rating: parseFloat(movieForm.rating) || 0 };
    
    try {
      if (movieModal === 'add') {
        payload.trending = false;
        payload.votes = '0';
        payload.releaseDate = new Date().toISOString().slice(0, 10);
        payload.director = 'TBA';
        payload.cast = [];
        payload.shows = [{ time: '07:00 PM', theater: 'GetTickets Gold', price: 280 }];
        payload.backdrop = movieForm.poster;
        
        const res = await fetch('http://localhost:5000/api/movies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const savedMovie = await res.json();
        setMovies([savedMovie, ...movies]);
        showToast({ type: 'success', title: 'Movie Added', subtitle: `${movieForm.title} is now live!` });
      } else {
        const res = await fetch(`http://localhost:5000/api/movies/${movieModal.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const updatedMovie = await res.json();
        setMovies(movies.map(m => m.id === movieModal.id ? updatedMovie : m));
        showToast({ type: 'success', title: 'Movie Updated', subtitle: `${movieForm.title} has been updated.` });
      }
      setMovieModal(null);
    } catch (err) {
      showToast({ type: 'error', title: 'Error', subtitle: 'Failed to save movie.' });
    }
  };
  
  const handleDeleteMovie = async (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      try {
        await fetch(`http://localhost:5000/api/movies/${id}`, { method: 'DELETE' });
        setMovies(movies.filter(m => m.id !== id));
        showToast({ type: 'success', title: 'Movie Deleted', subtitle: `${title} removed from catalog.` });
      } catch (err) {
        showToast({ type: 'error', title: 'Error', subtitle: 'Failed to delete movie.' });
      }
    }
  };
  
  const toggleTrending = async (id) => {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;
    try {
      const res = await fetch(`http://localhost:5000/api/movies/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trending: !movie.trending }) });
      const updatedMovie = await res.json();
      setMovies(movies.map(m => m.id === id ? updatedMovie : m));
    } catch (err) {
      console.error(err);
    }
  };

  // ═══════════════════
  //  EVENT CRUD
  // ═══════════════════
  const openAddEvent = () => { setEventForm(blankEvent); setEventModal('add'); };
  const openEditEvent = (ev) => {
    setEventForm({ ...ev, price: String(ev.price) });
    setEventModal(ev);
  };
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const payload = { ...eventForm, price: Number(eventForm.price) || 0, icon: eventCategoryIcons[eventForm.category] || '🎉' };
    
    try {
      if (eventModal === 'add') {
        const res = await fetch('http://localhost:5000/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const savedEvent = await res.json();
        setEvents([savedEvent, ...events]);
        showToast({ type: 'success', title: 'Event Added', subtitle: `${eventForm.title} is now live!` });
      } else {
        const res = await fetch(`http://localhost:5000/api/events/${eventModal.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const updatedEvent = await res.json();
        setEvents(events.map(ev => ev.id === eventModal.id ? updatedEvent : ev));
        showToast({ type: 'success', title: 'Event Updated', subtitle: `${eventForm.title} has been updated.` });
      }
      setEventModal(null);
    } catch (err) {
      showToast({ type: 'error', title: 'Error', subtitle: 'Failed to save event.' });
    }
  };
  
  const handleDeleteEvent = async (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      try {
        await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
        setEvents(events.filter(ev => ev.id !== id));
        showToast({ type: 'success', title: 'Event Deleted', subtitle: `${title} removed from listings.` });
      } catch (err) {
        showToast({ type: 'error', title: 'Error', subtitle: 'Failed to delete event.' });
      }
    }
  };

  // ═══════════════════
  //  COMPUTED DATA
  // ═══════════════════
  const totalRevenue = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(movieSearch.toLowerCase()));
  const filteredEvents = events.filter(ev => ev.title.toLowerCase().includes(eventSearch.toLowerCase()));
  const filteredBookings = bookings.filter(b => 
    (b.movieTitle || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (b.userEmail || '').toLowerCase().includes(bookingSearch.toLowerCase())
  );

  // Theater revenue breakdown for chart
  const theaterRevenue = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const theater = (b.theater || 'Unknown').replace('GetTickets ', '');
      map[theater] = (map[theater] || 0) + (b.totalAmount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bookings]);
  const maxRevenue = Math.max(...theaterRevenue.map(t => t.value), 1);

  // Rich activity feed — mixes bookings, events, user activity
  const recentActivity = useMemo(() => {
    const items = [];
    // Add recent bookings
    bookings.slice(0, 4).forEach(b => {
      items.push({
        icon: 'dot-green',
        text: `<strong>${b.userEmail?.split('@')[0] || 'Guest'}</strong> booked <strong>${b.seats?.length || 0} seat(s)</strong> for ${b.movieTitle || 'a movie'}`,
        time: b.bookedAt ? timeAgo(b.bookedAt) : 'Just now'
      });
    });
    // Add event/user activities
    items.push(
      { icon: 'dot-orange', text: `<strong>Arijit Singh Concert</strong> is <strong>82% sold</strong> — trending now`, time: '3 hours ago' },
      { icon: 'dot-purple', text: `New user <strong>Meera Iyer</strong> registered from <strong>Chennai</strong>`, time: '5 hours ago' },
      { icon: 'dot-blue', text: `<strong>Nebula: First Contact</strong> marked as <strong>Trending</strong>`, time: '1 day ago' },
      { icon: 'dot-green', text: `Revenue milestone: crossed <strong>Rs.10,000</strong> this week`, time: '2 days ago' },
    );
    return items.slice(0, 8);
  }, [bookings]);

  // Chart bar colors
  const barColors = ['var(--primary)', 'var(--accent)', '#8b5cf6', 'var(--gold)', '#3b82f6', '#10b981'];

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="admin-layout">
      {/* ─── SIDEBAR ─── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>🛠️ Admin Panel</h3>
          <p>GetTickets Management</p>
        </div>
        <nav className="admin-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
              {tab.id === 'movies' && <span className="nav-badge">{movies.length}</span>}
              {tab.id === 'events' && <span className="nav-badge">{events.length}</span>}
              {tab.id === 'bookings' && bookings.length > 0 && <span className="nav-badge">{bookings.length}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="admin-main">

        {/* ═══════════════ DASHBOARD TAB ═══════════════ */}
        {activeTab === 'dashboard' && (
          <div className="admin-tab-content" key="dashboard">
            <div className="admin-page-header">
              <div>
                <h1>Dashboard Overview</h1>
                <p>Welcome back, Admin. Here's what's happening.</p>
              </div>
            </div>

            {/* Stats */}
            <div className="admin-stats-grid">
              {[
                { icon: '🎬', label: 'Total Movies', value: movies.length, change: '+2 this week', up: true },
                { icon: '🎭', label: 'Total Events', value: events.length, change: '+1 this week', up: true },
                { icon: '🎟️', label: 'Bookings', value: bookings.length, change: bookings.length > 0 ? 'Active' : 'No bookings yet', up: bookings.length > 0 },
                { icon: '💰', label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: totalRevenue > 0 ? '+12% growth' : 'Awaiting data', up: totalRevenue > 0 },
                { icon: '👤', label: 'Registered Users', value: users.length, change: users.length > 0 ? 'Growing' : 'Invite users', up: users.length > 0 },
              ].map((stat, idx) => (
                <div className="admin-stat-card" key={idx}>
                  <span className="stat-icon">{stat.icon}</span>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>
                    {stat.up ? '↑' : '—'} {stat.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + Activity */}
            <div className="admin-grid-3">
              <div className="admin-chart-wrap">
                <h4>📈 Revenue by Theater</h4>
                <div className="admin-bar-chart">
                  {theaterRevenue.map((t, i) => (
                    <div className="admin-bar-col" key={i}>
                      <div className="admin-bar-value">₹{(t.value / 1000).toFixed(1)}k</div>
                      <div
                        className="admin-bar"
                        style={{
                          height: `${(t.value / maxRevenue) * 100}%`,
                          background: barColors[i % barColors.length],
                        }}
                      />
                      <div className="admin-bar-label">{t.name.replace('GetTickets ', '')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-activity-feed">
                <h4>⚡ Recent Activity</h4>
                {recentActivity.map((item, i) => (
                  <div className="activity-item" key={i}>
                    <div className={`activity-dot ${item.icon}`} />
                    <div>
                      <div className="activity-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                      <div className="activity-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ MOVIES TAB ═══════════════ */}
        {activeTab === 'movies' && (
          <div className="admin-tab-content" key="movies">
            <div className="admin-page-header">
              <div>
                <h1>Movie Management</h1>
                <p>Add, edit, or remove movies from the catalog.</p>
              </div>
              <button className="btn-primary-cv" onClick={openAddMovie} id="add-movie-btn" style={{ padding: '11px 24px' }}>
                + Add Movie
              </button>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h4>🎬 Movie Catalog</h4>
                  <span className="table-count">{filteredMovies.length} of {movies.length}</span>
                </div>
                <div className="admin-search-bar">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={movieSearch}
                    onChange={e => setMovieSearch(e.target.value)}
                    id="movie-search"
                  />
                </div>
              </div>

              {filteredMovies.length === 0 ? (
                <div className="admin-empty-state">
                  <span className="empty-icon">🎬</span>
                  <p>No movies found. {movieSearch ? 'Try a different search.' : 'Add your first movie!'}</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Movie</th>
                        <th>Genre</th>
                        <th>Language</th>
                        <th>Rating</th>
                        <th>Trending</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovies.map(movie => (
                        <tr key={movie.id}>
                          <td>
                            <div className="cell-with-img">
                              <img src={movie.poster} alt="" className="cell-img" />
                              <div>
                                <div className="cell-title">{movie.title}</div>
                                <div className="cell-sub">{movie.duration} · {movie.certificate || 'UA'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).map((g, i) => (
                              <span key={i} className="admin-badge badge-blue" style={{ marginRight: 4, marginBottom: 2 }}>{g}</span>
                            ))}
                          </td>
                          <td>{movie.language}</td>
                          <td><span style={{ color: 'var(--gold)', fontWeight: 700 }}>⭐ {movie.rating}</span></td>
                          <td>
                            <button
                              className={`trending-toggle ${movie.trending ? 'active' : ''}`}
                              onClick={() => toggleTrending(movie.id)}
                              title={movie.trending ? 'Remove from trending' : 'Mark as trending'}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button className="admin-action-btn btn-edit" onClick={() => openEditMovie(movie)} title="Edit">✏️</button>
                              <button className="admin-action-btn btn-delete" onClick={() => handleDeleteMovie(movie.id, movie.title)} title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ EVENTS TAB ═══════════════ */}
        {activeTab === 'events' && (
          <div className="admin-tab-content" key="events">
            <div className="admin-page-header">
              <div>
                <h1>Event Management</h1>
                <p>Manage live events, workshops, and experiences.</p>
              </div>
              <button className="btn-primary-cv" onClick={openAddEvent} id="add-event-btn" style={{ padding: '11px 24px' }}>
                + Add Event
              </button>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h4>🎭 Event Listings</h4>
                  <span className="table-count">{filteredEvents.length} of {events.length}</span>
                </div>
                <div className="admin-search-bar">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={eventSearch}
                    onChange={e => setEventSearch(e.target.value)}
                    id="event-search"
                  />
                </div>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="admin-empty-state">
                  <span className="empty-icon">🎭</span>
                  <p>No events found. {eventSearch ? 'Try a different search.' : 'Add your first event!'}</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Category</th>
                        <th>Date & Time</th>
                        <th>Venue</th>
                        <th>Price</th>
                        <th>Tag</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map(ev => (
                        <tr key={ev.id}>
                          <td>
                            <div className="cell-with-img">
                              <img src={ev.image} alt="" className="cell-img-event" />
                              <div>
                                <div className="cell-title">{ev.title}</div>
                                <div className="cell-sub">{ev.city}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="admin-badge badge-purple">{ev.category}</span></td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>{ev.date}</div>
                            <div className="cell-sub">{ev.time}</div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{ev.venue}</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Number(ev.price).toLocaleString()}</td>
                          <td><span className="admin-badge badge-orange">{ev.tag}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button className="admin-action-btn btn-edit" onClick={() => openEditEvent(ev)} title="Edit">✏️</button>
                              <button className="admin-action-btn btn-delete" onClick={() => handleDeleteEvent(ev.id, ev.title)} title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ BOOKINGS TAB ═══════════════ */}
        {activeTab === 'bookings' && (
          <div className="admin-tab-content" key="bookings">
            <div className="admin-page-header">
              <div>
                <h1>Booking Records</h1>
                <p>View all customer bookings and revenue data.</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
              <div className="admin-stat-card">
                <span className="stat-icon">🎟️</span>
                <div className="stat-label">Total Bookings</div>
                <div className="stat-value">{bookings.length}</div>
              </div>
              <div className="admin-stat-card">
                <span className="stat-icon">💰</span>
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
              </div>
              <div className="admin-stat-card">
                <span className="stat-icon">💺</span>
                <div className="stat-label">Seats Sold</div>
                <div className="stat-value">{bookings.reduce((s, b) => s + (b.seats?.length || 0), 0)}</div>
              </div>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h4>📋 All Bookings</h4>
                <div className="admin-search-bar">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by movie or email..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    id="booking-search"
                  />
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="admin-empty-state">
                  <span className="empty-icon">🎟️</span>
                  <p>{bookingSearch ? 'No bookings match your search.' : 'No bookings yet. Bookings will appear here when customers book tickets.'}</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Movie</th>
                        <th>Customer</th>
                        <th>Seats</th>
                        <th>Show</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(b => (
                        <tr key={b.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>#{b.id?.slice(0, 8)}</td>
                          <td><span className="cell-title">{b.movieTitle || '—'}</span></td>
                          <td style={{ fontSize: '0.85rem' }}>{b.userEmail || 'Guest'}</td>
                          <td>
                            <span className="admin-badge badge-blue">{b.seats?.length || 0} seat(s)</span>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {b.showTime || '—'}
                            <div className="cell-sub">{b.theater || ''}</div>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(b.totalAmount || 0).toLocaleString()}</td>
                          <td><span className="admin-badge badge-green">Confirmed</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ USERS TAB ═══════════════ */}
        {activeTab === 'users' && (
          <div className="admin-tab-content" key="users">
            <div className="admin-page-header">
              <div>
                <h1>Registered Users</h1>
                <p>View all user accounts registered on the platform.</p>
              </div>
            </div>

            <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
              <div className="admin-stat-card">
                <span className="stat-icon">👤</span>
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{users.length}</div>
              </div>
              <div className="admin-stat-card">
                <span className="stat-icon">🏙️</span>
                <div className="stat-label">Cities</div>
                <div className="stat-value">{new Set(users.map(u => u.city).filter(Boolean)).size || 0}</div>
              </div>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h4>👥 User Directory</h4>
                <span className="table-count">{users.length} users</span>
              </div>

              {users.length === 0 ? (
                <div className="admin-empty-state">
                  <span className="empty-icon">👤</span>
                  <p>No registered users yet. Users will appear here after signing up.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>City</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id || i}>
                          <td>
                            <div className="cell-with-img">
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000', fontSize: '0.85rem', flexShrink: 0 }}>
                                {(u.name || '?')[0].toUpperCase()}
                              </div>
                              <span className="cell-title">{u.name || '—'}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{u.email || '—'}</td>
                          <td style={{ fontSize: '0.85rem' }}>{u.phone || '—'}</td>
                          <td><span className="admin-badge badge-gold">{u.city || '—'}</span></td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════ MOVIE MODAL ═══════════════ */}
      {movieModal && (
        <div className="admin-modal-overlay" onClick={() => setMovieModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>{movieModal === 'add' ? '🎬 Add New Movie' : '✏️ Edit Movie'}</h3>
              <button className="admin-modal-close" onClick={() => setMovieModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveMovie}>
              <div className="admin-form-grid">
                <div className="admin-form-group full-width">
                  <label>Movie Title *</label>
                  <input type="text" required value={movieForm.title} onChange={e => setMovieForm({ ...movieForm, title: e.target.value })} placeholder="e.g. Inception" />
                </div>
                <div className="admin-form-group">
                  <label>Genre (comma separated) *</label>
                  <input type="text" required value={movieForm.genre} onChange={e => setMovieForm({ ...movieForm, genre: e.target.value })} placeholder="Action, Sci-Fi" />
                </div>
                <div className="admin-form-group">
                  <label>Language *</label>
                  <select value={movieForm.language} onChange={e => setMovieForm({ ...movieForm, language: e.target.value })}>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>Telugu</option>
                    <option>Malayalam</option>
                    <option>Kannada</option>
                    <option>Bengali</option>
                    <option>Marathi</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Rating (0-10)</label>
                  <input type="number" step="0.1" min="0" max="10" value={movieForm.rating} onChange={e => setMovieForm({ ...movieForm, rating: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label>Duration</label>
                  <input type="text" value={movieForm.duration} onChange={e => setMovieForm({ ...movieForm, duration: e.target.value })} placeholder="2h 15m" />
                </div>
                <div className="admin-form-group">
                  <label>Certificate</label>
                  <select value={movieForm.certificate} onChange={e => setMovieForm({ ...movieForm, certificate: e.target.value })}>
                    <option>U</option>
                    <option>UA</option>
                    <option>A</option>
                    <option>S</option>
                  </select>
                </div>
                <div className="admin-form-group full-width">
                  <label>Poster URL</label>
                  <input type="url" value={movieForm.poster} onChange={e => setMovieForm({ ...movieForm, poster: e.target.value })} placeholder="https://..." />
                </div>
                <div className="admin-form-group full-width">
                  <label>Description</label>
                  <textarea value={movieForm.description} onChange={e => setMovieForm({ ...movieForm, description: e.target.value })} placeholder="Brief synopsis of the movie..." />
                </div>
                <div className="admin-form-group full-width" style={{ marginTop: 8 }}>
                  <button type="submit" className="btn-primary-cv" style={{ width: '100%', justifyContent: 'center', padding: '13px 0' }}>
                    {movieModal === 'add' ? '🎬 Publish Movie' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ EVENT MODAL ═══════════════ */}
      {eventModal && (
        <div className="admin-modal-overlay" onClick={() => setEventModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>{eventModal === 'add' ? '🎭 Add New Event' : '✏️ Edit Event'}</h3>
              <button className="admin-modal-close" onClick={() => setEventModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEvent}>
              <div className="admin-form-grid">
                <div className="admin-form-group full-width">
                  <label>Event Title *</label>
                  <input type="text" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="e.g. Comedy Night Live" />
                </div>
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })}>
                    {Object.keys(eventCategoryIcons).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Tag</label>
                  <select value={eventForm.tag} onChange={e => setEventForm({ ...eventForm, tag: e.target.value })}>
                    {['NEW', 'SUPER HOT', 'HOT DEAL', 'SELLING FAST', 'POPULAR', 'LIMITED SEATS', 'MEGA EVENT', 'AWARD WINNING', 'KIDS SPECIAL', 'ADVENTURE'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Date *</label>
                  <input type="date" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label>Time</label>
                  <input type="text" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} placeholder="07:00 PM" />
                </div>
                <div className="admin-form-group">
                  <label>Venue *</label>
                  <input type="text" required value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} placeholder="MMRDA Grounds" />
                </div>
                <div className="admin-form-group">
                  <label>City *</label>
                  <input type="text" required value={eventForm.city} onChange={e => setEventForm({ ...eventForm, city: e.target.value })} placeholder="Mumbai" />
                </div>
                <div className="admin-form-group">
                  <label>Price (₹) *</label>
                  <input type="number" required min="0" value={eventForm.price} onChange={e => setEventForm({ ...eventForm, price: e.target.value })} placeholder="999" />
                </div>
                <div className="admin-form-group full-width">
                  <label>Image URL</label>
                  <input type="url" value={eventForm.image} onChange={e => setEventForm({ ...eventForm, image: e.target.value })} placeholder="https://..." />
                </div>
                <div className="admin-form-group full-width">
                  <label>Description</label>
                  <textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Tell people about this event..." />
                </div>
                <div className="admin-form-group full-width" style={{ marginTop: 8 }}>
                  <button type="submit" className="btn-primary-cv" style={{ width: '100%', justifyContent: 'center', padding: '13px 0' }}>
                    {eventModal === 'add' ? '🎭 Publish Event' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
