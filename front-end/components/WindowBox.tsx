'use client';
import { ReactNode } from 'react';
import { Rnd } from 'react-rnd';

interface WindowBoxProps {
    children?: ReactNode; // Allow embedding components or content
    onClose?: () => void; // Optional: Function to handle window close
}

const WindowBox = ({ children, onClose }: WindowBoxProps) => {
    return (
        <Rnd
            default={{
                x: 100,
                y: 100,
                width: 650,
                height: 500,
            }}
            minWidth={300}
            minHeight={200}
            bounds="window" // Restricts dragging within the browser window
            dragHandleClassName="window-header" // Draggable only by the header
            style={{
                border: '1px solid #26a69a',
                fontFamily: 'Roboto',
                backgroundColor: '#111111',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', // Prevents content overflow during resize
                zIndex: 1000,
            }}
        >
            {/* Window Header */}
            <div
                className="window-header bg-primary" // Class to make the header draggable
                style={{
                    padding: '5px',
                    cursor: 'move', // Indicates draggable area
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        marginLeft: 'auto',
                        color: '#ffffff',
                        fontSize: '18px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    &times;
                </button>
            </div>

            {/* Window Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {children}
            </div>
        </Rnd>
    );
};

export default WindowBox;
