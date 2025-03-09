'use client';
import { useState, useRef, useEffect } from 'react';
import { createChart, CrosshairMode, CandlestickData, IChartApi, ISeriesApi } from 'lightweight-charts';

const StockPriceBox = () => {
  const [symbol, setSymbol] = useState('AAPL'); // Default symbol is AAPL
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

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
      // Initialize the chart
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          textColor: 'white',
          background: { color: '#141414' },
          attributionLogo: false, // Disable the TradingView logo
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        grid: {
          vertLines: {
            color: '#1f222e',
          },
          horzLines: {
            color: '#1f222e',
          },
        },
      });

      // Add Candlestick Series
      candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Fetch the default stock (AAPL) data when the component mounts
      fetchPrice();

      // ResizeObserver to handle container size changes
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          chartRef.current?.applyOptions({ width, height });
          chartRef.current?.timeScale().fitContent();
        }
      });

      resizeObserver.observe(chartContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        chartRef.current?.remove();
      };
    }
  }, []); // Empty dependency array ensures it runs only once

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
    <div style={{padding: '10px',width: '100%', height: '100%', }}>
      {/* Input Field */}
      <div style={{display: 'flex',alignItems: 'center',fontSize: '12px',marginLeft: '10px',
            marginTop: '10px',position: 'absolute',top: '0',}}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="TICKER"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchPrice();
            }
          }}
          style={{
            background: "#141414",
            color: "white",
            width: '40px',
          }}
        />
        {/* Price and Error Messages */}
      <div>
        {price !== null && <p style={{marginLeft: '5px'}}>${price.toFixed(2)}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      </div>

      

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        style={{ width: '100%', height: '100%'  }}
      ></div>
    </div >
  );
};

export default StockPriceBox;
