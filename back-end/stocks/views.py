from django.http import JsonResponse
import yfinance as yf
import requests
import json
import plotly.graph_objects as go


def get_stock_data(request, symbol):
    print(f"Fetching data for symbol: {symbol}")
    try:
        ticker = yf.Ticker(symbol)
        history = ticker.history(period = "1y")
        price = ticker.info['currentPrice']

        history['Date'] = history.index
        #history['Date'] = history.to_datetime(history['Date'])

        fig = go.Figure(data=[
        go.Candlestick(
            x=history['Date'],
            open=history['Open'],
            high=history['High'],
            low=history['Low'],
            close=history['Close'],
            name='Stock Prices',
            )
        ])

    # Customize the layout
        fig.update_layout(
            title="YTD Chart",
            xaxis_title="Date",
            yaxis_title="Price (USD)",
            template="plotly_white",  # Cool dark theme
            xaxis_rangeslider_visible=False,  # Hide the range slider for a cleaner look
        )

        graph_json = fig.to_json()


        return JsonResponse({
            'symbol': symbol,
            'price': price,
            'graph': graph_json,
        })

    except Exception as e:
        # Handle errors gracefully and return an error message
        return JsonResponse({'error': str(e)}, status=500)