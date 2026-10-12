import { useState } from 'react';
import type { FieldNote } from '../../engine/useMovementStore';

interface FieldNotesDrawerProps {
  notes: FieldNote[];
}

export const FieldNotesDrawer = ({ notes }: FieldNotesDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      className="field-notes-drawer hairline-border"
      aria-labelledby="field-notes-heading"
    >
      {/* Header bar / Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.65rem 1rem',
          background: 'var(--color-enamel-sunken)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          borderRadius: isOpen ? '4px 4px 0 0' : '4px',
        }}
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--color-blued-steel)',
            }}
          />
          <span id="field-notes-heading" className="mono-spec" style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-shadow-blue)' }}>
            WORKSHOP BENCH NOTES ({notes.length})
          </span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-plate-grey)' }}>
          {isOpen ? '▲ CLOSE' : '▼ OPEN'}
        </span>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '0.85rem 1rem',
            background: '#FFFFFF',
            fontSize: '0.82rem',
            lineHeight: '1.45',
          }}
        >
          <p style={{ color: 'var(--color-plate-grey)', fontSize: '0.75rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>
            Logged automatically as you manipulate the mechanical movement:
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {notes.map((note) => (
              <li
                key={note.id}
                style={{
                  borderLeft: '2px solid var(--color-blued-steel)',
                  paddingLeft: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-plate-grey)' }}>
                  <span>STATION 0{note.station}</span>
                  <span>{note.timestamp}</span>
                </div>
                <div style={{ color: 'var(--color-shadow-blue)', marginTop: '0.15rem' }}>
                  {note.note}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};
