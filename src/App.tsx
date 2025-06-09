import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Races } from './pages/Races';
import { Drivers } from './pages/Drivers';
import { Teams } from './pages/Teams';
import { RaceResults } from './pages/RaceResults';
import { Qualifying } from './pages/Qualifying';
import { SprintRaces } from './pages/SprintRaces';
import { PitStopAnalytics } from './pages/PitStopAnalytics';
import { LapTimesAnalysis } from './pages/LapTimesAnalysis';
import { RaceStatistics } from './pages/RaceStatistics';
import { Calendar } from './pages/Calendar';

function App() {
  // Apply dark mode on mount
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const darkMode = saved ? JSON.parse(saved) : true; // Default to true (dark mode)
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/races" element={<Races />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/results" element={<RaceResults />} />
            <Route path="/qualifying" element={<Qualifying />} />
            <Route path="/sprint" element={<SprintRaces />} />
            <Route path="/pitstops" element={<PitStopAnalytics />} />
            <Route path="/laptimes" element={<LapTimesAnalysis />} />
            <Route path="/statistics" element={<RaceStatistics />} />
            <Route path="/calendar" element={<Calendar />} />
            {/* Future pages */}
            <Route path="/circuits" element={<div className="p-8 text-center">Circuits page - Coming soon</div>} />
            <Route path="*" element={<div className="p-8 text-center text-gray-600 dark:text-gray-400">404 - Page not found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
