import MiniPlayer from './components/MiniPlayer'
import Navbar from './components/Navbar'
import PlayerProvider from './context/PlayerProvider'
import Curhat from './sections/Curhat'
import Footer from './sections/Footer'
import HealingRoom from './sections/HealingRoom'
import Hero from './sections/Hero'
import MoodCheckIn from './sections/MoodCheckIn'
import MusicRoom from './sections/MusicRoom'
import Quotes from './sections/Quotes'
import Surat from './sections/Surat'

function App() {
  return (
    <PlayerProvider>
      <Navbar />
      <main>
        <Hero />
        <Curhat />
        <Surat />
        <MusicRoom />
        <MoodCheckIn />
        <Quotes />
        <HealingRoom />
      </main>
      <Footer />
      <MiniPlayer />
    </PlayerProvider>
  )
}

export default App
