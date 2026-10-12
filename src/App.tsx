import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useMovementStore } from './engine/useMovementStore';
import { HeaderBar } from './components/Navigation/HeaderBar';
import { MovementViewer } from './components/MovementEngine/MovementViewer';
import { Station01Winding } from './components/Stations/Station01Winding';
import { Station02GearTrain } from './components/Stations/Station02GearTrain';
import { Station03Escapement } from './components/Stations/Station03Escapement';
import { Station04Archetypes } from './components/Stations/Station04Archetypes';
import { FieldNotesDrawer } from './components/Navigation/FieldNotesDrawer';
import { ArticleView } from './components/ArticleMode/ArticleView';

export function App() {
  const store = useMovementStore();
  const { articleMode, liveAnnouncement, setActiveStation } = store;
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis scroll normalization
  useEffect(() => {
    if (articleMode) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [articleMode]);

  // Observer to update active station based on scroll position
  useEffect(() => {
    if (articleMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === 'station-01') setActiveStation(1);
            else if (id === 'station-02') setActiveStation(2);
            else if (id === 'station-03') setActiveStation(3);
            else if (id === 'station-04') setActiveStation(4);
          }
        });
      },
      {
        rootMargin: '-30% 0px -40% 0px',
        threshold: 0.1,
      }
    );

    const s1 = document.getElementById('station-01');
    const s2 = document.getElementById('station-02');
    const s3 = document.getElementById('station-03');
    const s4 = document.getElementById('station-04');

    if (s1) observer.observe(s1);
    if (s2) observer.observe(s2);
    if (s3) observer.observe(s3);
    if (s4) observer.observe(s4);

    return () => observer.disconnect();
  }, [articleMode, setActiveStation]);

  return (
    <div className="app-container">
      {/* Accessible Live Region for Screen Readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveAnnouncement}
      </div>

      {/* Global Header Bar */}
      <HeaderBar store={store} />

      {articleMode ? (
        /* Full Article Mode */
        <ArticleView store={store} />
      ) : (
        /* Interactive Movement Split Stage */
        <div className="calibre-split-stage">
          {/* Pinned Left Movement Engine */}
          <section
            className="pinned-engine-col"
            aria-label="Interactive Mechanical Calibre Movement"
          >
            <MovementViewer store={store} />
          </section>

          {/* Right Scrollable Content Stations */}
          <main className="content-stations-col">
            <Station01Winding store={store} />
            <Station02GearTrain store={store} />
            <Station03Escapement store={store} />
            <Station04Archetypes store={store} />
          </main>
        </div>
      )}

      {/* Collapsible Bench Field Notes Drawer */}
      <FieldNotesDrawer notes={store.fieldNotes} />
    </div>
  );
}

export default App;
