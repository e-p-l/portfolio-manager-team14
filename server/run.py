from app import create_app

app = create_app()

if __name__ == "__main__":
    # Runs the Flask development server
    app.run(host="0.0.0.0", port=1313, debug=True)
