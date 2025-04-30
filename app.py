from flask import Flask, render_template, jsonify, request
import json
import datetime
import os
import traceback
from data_processor import read_data_from_csv

app = Flask(__name__)

@app.route('/')
def index():
    try:
        # Read data from CSV
        data = read_data_from_csv()
        current_date = datetime.datetime.now().strftime("%B %d, %Y")
        
        # Debug: Print data structure
        print("Data structure loaded successfully")
        
        # Ensure data is JSON serializable and handle potential None values
        for key in data:
            if isinstance(data[key], list):
                for item in data[key]:
                    for k, v in list(item.items()):
                        if v is None:
                            item[k] = 0
                        elif not isinstance(v, (str, int, float, bool)):
                            item[k] = str(v)
        
        # Convert data to JSON for use in JavaScript charts
        post_type_data_json = json.dumps(data["post_type_data"])
        day_of_week_data_json = json.dumps(data["day_of_week_data"])
        hour_of_day_data_json = json.dumps(data["hour_of_day_data"])
        topic_data_json = json.dumps(data["topic_data"])
        follows_data_json = json.dumps(data["follows_data"])
        viral_data_json = json.dumps(data["viral_data"])
        monthly_data_json = json.dumps(data["monthly_data"])
        weekly_data_json = json.dumps(data["weekly_data"])
        strategy_data_json = json.dumps(data["strategy_data"])
        key_insights_json = json.dumps(data["key_insights"])
        
        return render_template(
            'index.html',
            current_date=current_date,
            post_type_data=data["post_type_data"],
            day_of_week_data=data["day_of_week_data"],
            hour_of_day_data=data["hour_of_day_data"],
            topic_data=data["topic_data"],
            follows_data=data["follows_data"],
            viral_data=data["viral_data"],
            monthly_data=data["monthly_data"],
            weekly_data=data["weekly_data"],
            strategy_data=data["strategy_data"],
            key_insights=data["key_insights"],
            post_type_data_json=post_type_data_json,
            day_of_week_data_json=day_of_week_data_json,
            hour_of_day_data_json=hour_of_day_data_json,
            topic_data_json=topic_data_json,
            follows_data_json=follows_data_json,
            viral_data_json=viral_data_json,
            monthly_data_json=monthly_data_json,
            weekly_data_json=weekly_data_json,
            strategy_data_json=strategy_data_json,
            key_insights_json=key_insights_json
        )
    
    except Exception as e:
        # Log the full error with traceback for debugging
        print(f"Error in index route: {str(e)}")
        print(traceback.format_exc())
        
        # Handle other unexpected errors
        return render_template(
            'error.html',
            error_title="Unexpected Error",
            error_message="An unexpected error occurred while processing the data.",
            error_details=str(e)
        ), 500

@app.route('/api/data')
def get_data():
    """ endpoint to get all data as JSON"""
    try:
        data = read_data_from_csv()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/debug')
def debug_info():
    """Debug endpoint to check environment and configuration"""
    debug_data = {
        "python_version": os.sys.version,
        "flask_version": Flask.__version__,
        "static_folder": app.static_folder,
        "static_url_path": app.static_url_path,
        "template_folder": app.template_folder,
        "environment": app.config.get("ENV", "production"),
        "debug_mode": app.debug
    }
    return jsonify(debug_data)

if __name__ == '__main__':
    # Make sure templates directory exists
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # Make sure static directory exists
    if not os.path.exists('static/js'):
        os.makedirs('static/js')
    
    app.run(debug=True)