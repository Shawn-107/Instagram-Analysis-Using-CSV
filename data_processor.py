import pandas as pd
import datetime
import json
import traceback
from collections import Counter

def read_data_from_csv():
    """
    Read and process Instagram data from CSV file.
    Returns a dictionary with processed data for visualization.
    """
    try:
        # Path to the local CSV file
        csv_file_path = "Instagram Data.csv"
        
        # Read the CSV file directly using pandas
        df = pd.read_csv(csv_file_path)
        
        # Print column names for debugging
        print("Available columns:", df.columns.tolist())
        
        # Initialize empty data structures with default values
        post_type_data = []
        day_of_week_data = []
        hour_of_day_data = []
        topic_data = []
        follows_data = []
        viral_data = []
        monthly_data = []
        weekly_data = []
        strategy_data = []
        
        # Create synthetic post types based on Caption content if not already present
        if 'Post type' not in df.columns:
            df['Post type'] = 'Regular Post'  # Default type
            
            # Try to infer post type from Description if available
            if 'Description' in df.columns:
                # Check for keywords in Description to determine post type
                df.loc[df['Description'].str.contains('video|watch|reel', case=False, na=False), 'Post type'] = 'Reel'
                df.loc[df['Description'].str.contains('carousel|swipe|multiple', case=False, na=False), 'Post type'] = 'Carousel'
                df.loc[df['Description'].str.contains('photo|picture|image', case=False, na=False), 'Post type'] = 'Photo'
                # Check for educational content
                df.loc[df['Description'].str.contains('learn|tutorial|course|class', case=False, na=False), 'Post type'] = 'Educational'
                # Check for code/project content
                df.loc[df['Description'].str.contains('code|project|github|programming', case=False, na=False), 'Post type'] = 'Code/Project'
        
        # Process post type data
        post_types = df['Post type'].unique()
        for post_type in post_types:
            post_df = df[df['Post type'] == post_type].copy()
            
            # Calculate average metrics for this post type
            avg_impressions = post_df['Impressions'].astype(float).mean()
            
            # Calculate or estimate other metrics
            avg_likes = post_df['Likes'].astype(float).mean() if 'Likes' in post_df.columns else 0
            avg_shares = post_df['Shares'].astype(float).mean() if 'Shares' in post_df.columns else 0
            avg_follows = post_df['Follows'].astype(float).mean() if 'Follows' in post_df.columns else 0
            avg_comments = post_df['Comments'].astype(float).mean() if 'Comments' in post_df.columns else 0
            avg_saves = post_df['Saves'].astype(float).mean() if 'Saves' in post_df.columns else 0
            
            post_data = {
                "postType": post_type,
                "Impressions": int(avg_impressions),
                "Reach": int(avg_impressions * 0.7),  # Estimate reach as 70% of impressions
                "Likes": int(avg_likes),
                "Shares": int(avg_shares),
                "Follows": int(avg_follows),
                "Comments": int(avg_comments),
                "Saves": int(avg_saves)
            }
            
            post_type_data.append(post_data)
        
        # Use 'Publish time' for date-related operations instead of 'Date'
        if 'Publish time' in df.columns:
            # Convert 'Publish time' to datetime
            df['PublishDate'] = pd.to_datetime(df['Publish time'], errors='coerce')
            
            # Handle cases where conversion failed
            if df['PublishDate'].isna().all():
                # Generate synthetic dates
                end_date = datetime.datetime.now()
                start_date = end_date - datetime.timedelta(days=90)
                date_range = pd.date_range(start=start_date, end=end_date, periods=len(df))
                df['PublishDate'] = date_range
        else:
            # Generate synthetic dates if 'Publish time' is not available
            end_date = datetime.datetime.now()
            start_date = end_date - datetime.timedelta(days=90)
            date_range = pd.date_range(start=start_date, end=end_date, periods=len(df))
            df['PublishDate'] = date_range
            
        # Extract day of week from 'PublishDate'
        df['DayOfWeek'] = df['PublishDate'].dt.day_name()
        
        # Process day of week data
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in days:
            day_df = df[df['DayOfWeek'] == day].copy()
            if not day_df.empty:
                avg_impressions = day_df['Impressions'].astype(float).mean()
                
                day_of_week_data.append({
                    "day": day,
                    "Impressions": int(avg_impressions),
                    "Reach": int(avg_impressions * 0.7)  # Estimate reach as 70% of impressions
                })
            else:
                # Add placeholder data for days with no posts
                day_of_week_data.append({
                    "day": day,
                    "Impressions": 0,
                    "Reach": 0
                })
        
        # Process hour of day data
        df['HourOfDay'] = df['PublishDate'].dt.hour
        for hour in range(24):
            hour_df = df[df['HourOfDay'] == hour].copy()
            if not hour_df.empty:
                avg_impressions = hour_df['Impressions'].astype(float).mean()
                
                hour_of_day_data.append({
                    "hour": hour,
                    "Impressions": int(avg_impressions),
                    "Reach": int(avg_impressions * 0.7)  # Estimate reach as 70% of impressions
                })
            else:
                # Add placeholder data for hours with no posts
                hour_of_day_data.append({
                    "hour": hour,
                    "Impressions": 0,
                    "Reach": 0
                })
        
        # Use Description for topic analysis
        if 'Description' not in df.columns and 'Caption' in df.columns:
            df['Description'] = df['Caption']
        elif 'Description' not in df.columns:
            df['Description'] = ''  # Empty Description if no Caption
        
        # Extract topics from Description using keywords
        topics = ['Projects', 'Learning and Education', 'Problem-Solving', 'Actionable Content', 'Career Growth']
        keywords = {
            'Projects': ['project', 'portfolio', 'build', 'create', 'github', 'code'],
            'Learning and Education': ['learn', 'education', 'study', 'course', 'tutorial', 'class'],
            'Problem-Solving': ['problem', 'solution', 'solve', 'challenge', 'algorithm', 'debug'],
            'Actionable Content': ['how to', 'tips', 'guide', 'steps', 'implement', 'tutorial'],
            'Career Growth': ['career', 'job', 'interview', 'resume', 'skill', 'hiring']
        }
        
        # Create topic columns
        for topic in topics:
            df[topic] = df['Description'].str.lower().apply(
                lambda x: any(keyword in str(x).lower() for keyword in keywords[topic]) if pd.notna(x) else False
            )
        
        # Process topic data
        for topic in topics:
            topic_df = df[df[topic]].copy()
            if not topic_df.empty:
                avg_likes = topic_df['Likes'].astype(float).mean() if 'Likes' in topic_df.columns else 0
                avg_comments = topic_df['Comments'].astype(float).mean() if 'Comments' in topic_df.columns else 0
                avg_saves = topic_df['Saves'].astype(float).mean() if 'Saves' in topic_df.columns else 0
                
                topic_data.append({
                    "topic": topic,
                    "Likes": int(avg_likes),
                    "Comments": int(avg_comments),
                    "Saves": int(avg_saves)
                })
            else:
                # Add placeholder data for topics with no posts
                topic_data.append({
                    "topic": topic,
                    "Likes": 0,
                    "Comments": 0,
                    "Saves": 0
                })
        
        # Process follows data
        for post_type in post_types:
            post_df = df[df['Post type'] == post_type].copy()
            if not post_df.empty and 'Follows' in post_df.columns:
                total_follows = post_df['Follows'].astype(float).sum()
                
                follows_data.append({
                    "name": post_type,
                    "value": int(total_follows)
                })
            else:
                # Add placeholder data for post types with no follows data
                follows_data.append({
                    "name": post_type,
                    "value": 0
                })
        
        # Process viral data (posts with impressions > average * 1.5)
        avg_impressions = df['Impressions'].astype(float).mean()
        viral_threshold = avg_impressions * 1.5
        viral_posts = df[df['Impressions'].astype(float) > viral_threshold].copy()
        
        # Count viral posts by day and topic
        for day in days:
            day_viral = viral_posts[viral_posts['DayOfWeek'] == day].copy()
            
            viral_data_entry = {"day": day}
            for topic in topics:
                count = int(day_viral[day_viral[topic]].shape[0]) if not day_viral.empty else 0
                viral_data_entry[topic] = count
                # Replace topic name to match expected format in the template
                if topic == 'Learning and Education':
                    viral_data_entry['Learning'] = viral_data_entry.pop(topic)
                elif topic == 'Problem-Solving':
                    viral_data_entry['ProblemSolving'] = viral_data_entry.pop(topic)
                elif topic == 'Actionable Content':
                    viral_data_entry['Actionable'] = viral_data_entry.pop(topic)
                elif topic == 'Career Growth':
                    viral_data_entry['Career'] = viral_data_entry.pop(topic)
            
            viral_data.append(viral_data_entry)
        
        # Process monthly data
        df['Month'] = df['PublishDate'].dt.month_name()
        months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December']
        
        for month in months:
            month_df = df[df['Month'] == month].copy()
            if not month_df.empty:
                avg_impressions = month_df['Impressions'].astype(float).mean()
                avg_likes = month_df['Likes'].astype(float).mean() if 'Likes' in month_df.columns else 0
                avg_shares = month_df['Shares'].astype(float).mean() if 'Shares' in month_df.columns else 0
                avg_follows = month_df['Follows'].astype(float).mean() if 'Follows' in month_df.columns else 0
                
                monthly_data.append({
                    "month": month,
                    "Impressions": int(avg_impressions),
                    "Reach": int(avg_impressions * 0.7),  # Estimate reach as 70% of impressions
                    "Likes": int(avg_likes),
                    "Shares": int(avg_shares),
                    "Follows": int(avg_follows)
                })
            else:
                # Add placeholder data for months with no posts
                monthly_data.append({
                    "month": month,
                    "Impressions": 0,
                    "Reach": 0,
                    "Likes": 0,
                    "Shares": 0,
                    "Follows": 0
                })
        
        # Process weekly data
        df['Week'] = df['PublishDate'].dt.isocalendar().week
        weeks = sorted(df['Week'].unique())
        
        # Ensure we have at least some weeks
        if not weeks:
            weeks = list(range(1, 5))  # Default to 4 weeks if no data
        
        for week in weeks:
            week_df = df[df['Week'] == week].copy()
            if not week_df.empty:
                avg_impressions = week_df['Impressions'].astype(float).mean()
                avg_likes = week_df['Likes'].astype(float).mean() if 'Likes' in week_df.columns else 0
                avg_shares = week_df['Shares'].astype(float).mean() if 'Shares' in week_df.columns else 0
                
                weekly_data.append({
                    "week": int(week),
                    "Impressions": int(avg_impressions),
                    "Reach": int(avg_impressions * 0.7),  # Estimate reach as 70% of impressions
                    "Likes": int(avg_likes),
                    "Shares": int(avg_shares)
                })
            else:
                # Add placeholder data for weeks with no posts
                weekly_data.append({
                    "week": int(week),
                    "Impressions": 0,
                    "Reach": 0,
                    "Likes": 0,
                    "Shares": 0
                })
        
        # Generate strategy data
        for day in days:
            day_df = df[df['DayOfWeek'] == day].copy()
            if not day_df.empty:
                # Find best post type for follower growth
                if 'Follows' in day_df.columns:
                    best_follower_type = day_df.groupby('Post type')['Follows'].mean().idxmax()
                else:
                    best_follower_type = "Regular Post"  # Default if no Follows data
                
                # Find best post type for interactions (likes + comments + shares)
                day_df.loc[:, 'Interactions'] = 0
                if 'Likes' in day_df.columns:
                    day_df.loc[:, 'Interactions'] += day_df['Likes'].astype(float)
                if 'Comments' in day_df.columns:
                    day_df.loc[:, 'Interactions'] += day_df['Comments'].astype(float)
                if 'Shares' in day_df.columns:
                    day_df.loc[:, 'Interactions'] += day_df['Shares'].astype(float)
                
                best_interaction_type = day_df.groupby('Post type')['Interactions'].mean().idxmax()
                
                # Find best hour for posting
                best_hour = day_df.groupby('HourOfDay')['Impressions'].mean().idxmax()
                
                strategy_data.append({
                    "day": day,
                    "followerGrowth": best_follower_type,
                    "interactions": best_interaction_type,
                    "bestHour": f"{best_hour}:00"
                })
            else:
                # Add placeholder data for days with no posts
                strategy_data.append({
                    "day": day,
                    "followerGrowth": "Regular Post",
                    "interactions": "Regular Post",
                    "bestHour": "12:00"  # Default noon
                })
        
        # Calculate key insights
        best_post_type = max(post_type_data, key=lambda x: x['Impressions'])['postType'] if post_type_data else "Regular Post"
        best_day = max(day_of_week_data, key=lambda x: x['Impressions'])['day'] if day_of_week_data else "Monday"
        best_hour = max(hour_of_day_data, key=lambda x: x['Impressions'])['hour'] if hour_of_day_data else 12
        best_topic = max(topic_data, key=lambda x: x['Likes'])['topic'] if topic_data else "Actionable Content"
        viral_threshold = int(avg_impressions * 1.5)
        
        # Find best strategy for growth
        best_growth_strategy = next((item for item in strategy_data if item['day'] == best_day), None)
        best_growth_post_type = best_growth_strategy['followerGrowth'] if best_growth_strategy else "Regular Post"
        best_growth_hour = best_growth_strategy['bestHour'] if best_growth_strategy else "12:00"
        
        # Add key insights to the return data
        key_insights = {
            "best_post_type": best_post_type,
            "best_day": best_day,
            "best_hour": f"{best_hour}:00",
            "best_topic": best_topic,
            "viral_threshold": viral_threshold,
            "best_growth_post_type": best_growth_post_type,
            "best_growth_hour": best_growth_hour
        }
        
        # Debug: Print data structure
        print("Data processing completed successfully")
        
        return {
            "post_type_data": post_type_data,
            "day_of_week_data": day_of_week_data,
            "hour_of_day_data": hour_of_day_data,
            "topic_data": topic_data,
            "follows_data": follows_data,
            "viral_data": viral_data,
            "monthly_data": monthly_data,
            "weekly_data": weekly_data,
            "strategy_data": strategy_data,
            "key_insights": key_insights
        }
    
    except FileNotFoundError as e:
        # Handle file not found errors
        print(f"Error: CSV file not found at path: {csv_file_path}")
        print(traceback.format_exc())
        raise ValueError(f"Error: CSV file not found at path: {csv_file_path}")
    except Exception as e:
        # Re-raise the exception to be caught by the route handler
        print(f"Error processing CSV data: {str(e)}")
        print(traceback.format_exc())
        raise ValueError(f"Error processing CSV data: {str(e)}")

