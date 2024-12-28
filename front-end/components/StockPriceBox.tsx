'use client';
import { useState, useRef, useEffect } from 'react';
import { createChart, CrosshairMode, CandlestickData } from 'lightweight-charts';

const StockPriceBox = () => {
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<typeof createChart>['addCandlestickSeries'] | null>(null);

  const fetchPrice = async () => {
    setError(null);
    setPrice(null);
    setChartData([]);

    if (symbol.trim() === '') {
      setError('Please enter a stock symbol.');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stock/${symbol}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch price');
      }
      const data = await response.json();
      console.log(symbol, data);

      if (data.price !== undefined && data.price !== null) {
        setPrice(data.price);
      }

      if (data.chartData) {
        setChartData(data.chartData);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  useEffect(() => {
    if (chartContainerRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          textColor: 'white',
          background: { type: 'solid', color: '#141414' },
          attributionLogo: false, // Disable the TradingView logo
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        grid: {
          vertLines: {
            color: '#1f222e'
          },
          horzLines: {
            color: '1f222e'
          }
        }
      });

      candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        color: "blue"
      });

      // Handle window resize
      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartRef.current?.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (candlestickSeriesRef.current && chartData.length > 0) {
      const formattedData = chartData.map((d) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      candlestickSeriesRef.current.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [chartData]);

  return (
    <div style={{ textAlign: 'left' }}>
      <div>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol"
          style={{
            width: '30%',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={fetchPrice}
          style={{
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Get Price
        </button>
      </div>
      <div>
        {price !== null && <p>Current Price: <strong>${price.toFixed(2)}</strong></p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <div ref={chartContainerRef} ></div>
      {/* Attribution Notice */}
      <p style={{ fontSize: '12px', marginTop: '10px' }}>
        Charting powered by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView</a>.
      </p>
    </div>
  );
};

export default StockPriceBox;
