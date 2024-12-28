import WindowBox from "@/components/WindowBox";
import StockPriceBox from "@/components/StockPriceBox";

export default function Home() {
  return (
    <div>
      <WindowBox>
        <StockPriceBox />
      </WindowBox>
      {/* Attribution Notice */}
      <p style={{ color: 'white', fontSize: '12px', position: 'fixed', bottom: '10px' }}>
        Charting powered by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView</a>.
      </p>
    </div>

  );
}
