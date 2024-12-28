from django.http import JsonResponse
import yfinance as yf
import time

def get_stock_data(request, symbol):
    print(f"Fetching data for symbol: {symbol}")
    try:
        ticker = yf.Ticker(symbol)
        history = ticker.history(period="1y")
        price = ticker.info.get('currentPrice', None)

        chart_data = []
        for date, row in history.iterrows():
            timestamp = int(time.mktime(date.timetuple()))
            chart_point = {
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'close': round(row['Close'], 2),
                'time': timestamp,
            }
            chart_data.append(chart_point)

        # Sort data by time ascending
        chart_data = sorted(chart_data, key=lambda x: x['time'])

        return JsonResponse({
            'symbol': symbol.upper(),
            'price': price,
            'chartData': chart_data,
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
