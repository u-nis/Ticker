'use client';
import { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist';

const StockPriceBox = () => {
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Initial position
  const [showWindow, setShowWindow] = useState(true);

  // References to store initial positions during drag
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, windowX: 0, windowY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.mouseX;
        const deltaY = e.clientY - dragStart.mouseY;
        setPosition({
          x: dragStart.windowX + deltaX,
          y: dragStart.windowY + deltaY,
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    // Attach the listeners to the document
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup the listeners on unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      windowX: position.x,
      windowY: position.y,
    });
  };

  const fetchPrice = async () => {
    setError(null); // Reset errors
    setPrice(null); // Reset price display

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stock/${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
      const data = await response.json();
      console.log(symbol);
      console.log(data);

      // Render the graph if available
      if (data.graph) {
        const graphData = JSON.parse(data.graph);
        // Remove the plot area and paper background
        graphData.layout.plot_bgcolor = 'transparent';
        graphData.layout.paper_bgcolor = 'transparent';

        Plotly.newPlot('chart-container', graphData.data, graphData.layout, { displayModeBar: false });
      }

      setPrice(data.price); // Assuming API returns `{ price: value }`
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  // If the window is closed, provide a button to reopen it
  if (!showWindow) {
    return (
      <button
        onClick={() => setShowWindow(true)}
        style={{
          padding: '10px 15px',
          cursor: 'pointer',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          position: 'fixed',
          top: '20px',
          left: '20px',
        }}
      >
        Open Stock Price Checker
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        width: '600px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}
    >
      {/* Window Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          padding: '10px',
          backgroundColor: '#0070f3',
          color: '#fff',
          cursor: 'move',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
      >
        <span>Stock Price Checker</span>
        <button
          onClick={() => setShowWindow(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>
      </div>

      {/* Window Content */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol"
          style={{
            padding: '10px',
            width: '70%',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={fetchPrice}
          style={{
            padding: '10px 15px',
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Get Price
        </button>
        <div style={{ marginTop: '20px' }}>
          {price !== null && <p>Current Price: <strong>${price.toFixed(2)}</strong></p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div
            id="chart-container"
            style={{
              width: '100%',
              height: '400px',
              marginTop: '20px',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StockPriceBox;
