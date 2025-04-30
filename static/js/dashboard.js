document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing dashboard...");
    
    // Check if chartData is available
    if (!window.chartData) {
        console.error("Chart data not available. Using fallback data.");
        // Create fallback data if needed
        window.chartData = createFallbackData();
    }
    
    // Initialize charts
    try {
        initializeCharts();
        console.log("Charts initialized successfully");
    } catch (error) {
        console.error("Error initializing charts:", error);
        displayChartError();
    }
    
    // Set up view selector
    const viewSelector = document.getElementById('analytics-view');
    if (viewSelector) {
        viewSelector.addEventListener('change', function() {
            showSelectedView(this.value);
        });
        
        // Add summary option if it doesn't exist
        if (!Array.from(viewSelector.options).some(option => option.value === 'summary')) {
            const summaryOption = document.createElement('option');
            summaryOption.value = 'summary';
            summaryOption.textContent = 'Summary';
            viewSelector.appendChild(summaryOption);
        }
    }
    
    // Set up tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const tabContainer = this.closest('.tabs');
            
            // Deactivate all tabs in this container
            tabContainer.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            tabContainer.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Activate the selected tab
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Create summary view if it doesn't exist
    createSummaryView();
    
    // Show the default view (engagement)
    showSelectedView('engagement');
});

function createSummaryView() {
    // Check if summary view already exists
    if (document.getElementById('summary-view')) {
        return;
    }
    
    // Create summary view container
    const summaryView = document.createElement('div');
    summaryView.id = 'summary-view';
    summaryView.className = 'analytics-view hidden';
    
    // Create summary content
    summaryView.innerHTML = `
        <div class="section-title">
            <h2>Instagram Analytics Summary</h2>
            <p>Comprehensive overview of your Instagram performance</p>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>Content Performance</h3>
                <div class="summary-content" id="content-summary"></div>
            </div>
            
            <div class="summary-card">
                <h3>Audience Engagement</h3>
                <div class="summary-content" id="engagement-summary"></div>
            </div>
            
            <div class="summary-card">
                <h3>Timing Insights</h3>
                <div class="summary-content" id="timing-summary"></div>
            </div>
            
            <div class="summary-card">
                <h3>Growth Trends</h3>
                <div class="summary-content" id="growth-summary"></div>
            </div>
        </div>
        
        <div class="section-title">
            <h2>Key Recommendations</h2>
        </div>
        
        <div class="recommendations-container" id="recommendations-container"></div>
    `;
    
    // Append to main container
    const mainContainer = document.querySelector('.main-container') || document.body;
    mainContainer.appendChild(summaryView);
    
    // Generate summary content
    generateSummaryContent();
}

function generateSummaryContent() {
    // Content Performance Summary
    const contentSummary = document.getElementById('content-summary');
    if (contentSummary) {
        // Find best performing post type
        const bestPostType = chartData.postTypeData.reduce((prev, current) => 
            (prev.Impressions || 0) > (current.Impressions || 0) ? prev : current, 
            { postType: 'Unknown', Impressions: 0 }
        ).postType;
        
        // Find best performing topic
        const bestTopic = chartData.topicData.reduce((prev, current) => 
            (prev.Likes || 0) > (current.Likes || 0) ? prev : current, 
            { topic: 'Unknown', Likes: 0 }
        ).topic;
        
        contentSummary.innerHTML = `
            <div class="summary-stat">
                <div class="stat-label">Best Performing Content Type</div>
                <div class="stat-value">${bestPostType}</div>
                <div class="stat-description">Generates the highest impressions and engagement</div>
            </div>
            
            <div class="summary-stat">
                <div class="stat-label">Most Engaging Topic</div>
                <div class="stat-value">${bestTopic}</div>
                <div class="stat-description">Receives the most likes and comments</div>
            </div>
            
            <div class="summary-insight">
                <div class="insight-icon">💡</div>
                <div class="insight-text">
                    <strong>${bestPostType}</strong> content about <strong>${bestTopic}</strong> 
                    performs best. Consider creating more content that combines these elements.
                </div>
            </div>
        `;
    }
    
    // Audience Engagement Summary
    const engagementSummary = document.getElementById('engagement-summary');
    if (engagementSummary) {
        // Calculate average engagement rate
        const totalLikes = chartData.postTypeData.reduce((sum, item) => sum + (item.Likes || 0), 0);
        const totalComments = chartData.postTypeData.reduce((sum, item) => sum + (item.Comments || 0), 0);
        const totalImpressions = chartData.postTypeData.reduce((sum, item) => sum + (item.Impressions || 0), 0);
        
        const engagementRate = totalImpressions > 0 
            ? ((totalLikes + totalComments) / totalImpressions * 100).toFixed(2) 
            : '0.00';
        
        // Find post type with highest engagement rate
        const postTypeEngagementRates = chartData.postTypeData.map(item => {
            const rate = item.Impressions > 0 
                ? ((item.Likes + item.Comments) / item.Impressions * 100) 
                : 0;
            return { postType: item.postType, rate };
        });
        
        const highestEngagementPostType = postTypeEngagementRates.reduce((prev, current) => 
            prev.rate > current.rate ? prev : current, 
            { postType: 'Unknown', rate: 0 }
        ).postType;
        
        engagementSummary.innerHTML = `
            <div class="summary-stat">
                <div class="stat-label">Average Engagement Rate</div>
                <div class="stat-value">${engagementRate}%</div>
                <div class="stat-description">Likes + Comments / Impressions</div>
            </div>
            
            <div class="summary-stat">
                <div class="stat-label">Highest Engagement Content</div>
                <div class="stat-value">${highestEngagementPostType}</div>
                <div class="stat-description">Content type with best engagement ratio</div>
            </div>
            
            <div class="summary-insight">
                <div class="insight-icon">💡</div>
                <div class="insight-text">
                    Your <strong>${highestEngagementPostType}</strong> content drives the most engagement 
                    relative to impressions. Focus on quality over quantity.
                </div>
            </div>
        `;
    }
    
    // Timing Insights Summary
    const timingSummary = document.getElementById('timing-summary');
    if (timingSummary) {
        // Find best day of week
        const bestDay = chartData.dayOfWeekData.reduce((prev, current) => 
            (prev.Impressions || 0) > (current.Impressions || 0) ? prev : current, 
            { day: 'Unknown', Impressions: 0 }
        ).day;
        
        // Find best hour of day
        const bestHour = chartData.hourOfDayData.reduce((prev, current) => 
            (prev.Impressions || 0) > (current.Impressions || 0) ? prev : current, 
            { hour: 0, Impressions: 0 }
        ).hour;
        
        timingSummary.innerHTML = `
            <div class="summary-stat">
                <div class="stat-label">Best Day to Post</div>
                <div class="stat-value">${bestDay}</div>
                <div class="stat-description">Day with highest impressions</div>
            </div>
            
            <div class="summary-stat">
                <div class="stat-label">Best Time to Post</div>
                <div class="stat-value">${bestHour}:00</div>
                <div class="stat-description">Hour with highest engagement</div>
            </div>
            
            <div class="summary-insight">
                <div class="insight-icon">💡</div>
                <div class="insight-text">
                    Schedule your most important content for <strong>${bestDay}s</strong> 
                    around <strong>${bestHour}:00</strong> to maximize reach and engagement.
                </div>
            </div>
        `;
    }
    
    // Growth Trends Summary
    const growthSummary = document.getElementById('growth-summary');
    if (growthSummary) {
        // Calculate monthly growth trend
        const firstHalfMonthly = chartData.monthlyData.slice(0, 6);
        const secondHalfMonthly = chartData.monthlyData.slice(6);
        
        const firstHalfAvgImpressions = firstHalfMonthly.reduce((sum, month) => sum + (month.Impressions || 0), 0) / firstHalfMonthly.length;
        const secondHalfAvgImpressions = secondHalfMonthly.reduce((sum, month) => sum + (month.Impressions || 0), 0) / secondHalfMonthly.length;
        
        const growthPercentage = firstHalfAvgImpressions > 0 
            ? (((secondHalfAvgImpressions - firstHalfAvgImpressions) / firstHalfAvgImpressions) * 100).toFixed(1) 
            : '0.0';
        
        // Find month with highest follows
        const bestGrowthMonth = chartData.monthlyData.reduce((prev, current) => 
            (prev.Follows || 0) > (current.Follows || 0) ? prev : current, 
            { month: 'Unknown', Follows: 0 }
        ).month;
        
        growthSummary.innerHTML = `
            <div class="summary-stat">
                <div class="stat-label">Growth Trend</div>
                <div class="stat-value">${growthPercentage}%</div>
                <div class="stat-description">Change in impressions (H2 vs H1)</div>
            </div>
            
            <div class="summary-stat">
                <div class="stat-label">Best Growth Month</div>
                <div class="stat-value">${bestGrowthMonth}</div>
                <div class="stat-description">Month with highest follower growth</div>
            </div>
            
            <div class="summary-insight">
                <div class="insight-icon">💡</div>
                <div class="insight-text">
                    Your account is showing <strong>${parseFloat(growthPercentage) >= 0 ? 'positive' : 'negative'} growth</strong>. 
                    ${parseFloat(growthPercentage) >= 0 
                        ? 'Continue your current strategy and analyze what worked well in ' + bestGrowthMonth + '.' 
                        : 'Review your content strategy and consider what worked well in ' + bestGrowthMonth + '.'}
                </div>
            </div>
        `;
    }
    
    // Generate recommendations
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (recommendationsContainer) {
        // Find best performing elements
        const bestPostType = chartData.postTypeData.reduce((prev, current) => 
            (prev.Impressions || 0) > (current.Impressions || 0) ? prev : current, 
            { postType: 'Unknown', Impressions: 0 }
        ).postType;
        
        const bestTopic = chartData.topicData.reduce((prev, current) => 
            (prev.Likes || 0) > (current.Likes || 0) ? prev : current, 
            { topic: 'Unknown', Likes: 0 }
        ).topic;
        
        const bestDay = chartData.dayOfWeekData.reduce((prev, current) => 
            (prev.Impressions || 0) > (current.Impressions || 0) ? prev : current, 
            { day: 'Unknown', Impressions: 0 }
        ).day;
        
        const bestHour = chartData.hourOfDayData.reduce((prev, current) => 
            (prev.Impressions || 0) > (current.Impressions || 0) ? prev : current, 
            { hour: 0, Impressions: 0 }
        ).hour;
        
        // Generate recommendations
        recommendationsContainer.innerHTML = `
            <div class="recommendation-card">
                <div class="recommendation-icon">📊</div>
                <div class="recommendation-content">
                    <h4>Content Strategy</h4>
                    <p>Focus on creating more <strong>${bestPostType}</strong> content about <strong>${bestTopic}</strong>. 
                    This combination has proven to resonate most with your audience.</p>
                </div>
            </div>
            
            <div class="recommendation-card">
                <div class="recommendation-icon">⏰</div>
                <div class="recommendation-content">
                    <h4>Posting Schedule</h4>
                    <p>Schedule your most important content for <strong>${bestDay}s</strong> around <strong>${bestHour}:00</strong>. 
                    This timing has shown the highest engagement rates.</p>
                </div>
            </div>
            
            <div class="recommendation-card">
                <div class="recommendation-icon">🔄</div>
                <div class="recommendation-content">
                    <h4>Content Repurposing</h4>
                    <p>Repurpose your top-performing content into different formats. 
                    Convert successful posts into carousels, reels, or educational content.</p>
                </div>
            </div>
            
            <div class="recommendation-card">
                <div class="recommendation-icon">🎯</div>
                <div class="recommendation-content">
                    <h4>Audience Engagement</h4>
                    <p>Increase engagement by asking questions, creating polls, and responding to comments. 
                    Posts with higher engagement receive more reach from the algorithm.</p>
                </div>
            </div>
        `;
    }
}

function createFallbackData() {
    // Create fallback data for testing
    return {
        postTypeData: [
            { postType: 'Reel', Impressions: 12500, Likes: 850, Comments: 65 },
            { postType: 'Carousel', Impressions: 9800, Likes: 720, Comments: 52 },
            { postType: 'Photo', Impressions: 7200, Likes: 480, Comments: 38 },
            { postType: 'Educational', Impressions: 11200, Likes: 780, Comments: 85 },
            { postType: 'Code/Project', Impressions: 10500, Likes: 750, Comments: 70 }
        ],
        dayOfWeekData: [
            { day: 'Monday', Impressions: 8500, Reach: 5950 },
            { day: 'Tuesday', Impressions: 9200, Reach: 6440 },
            { day: 'Wednesday', Impressions: 10500, Reach: 7350 },
            { day: 'Thursday', Impressions: 11200, Reach: 7840 },
            { day: 'Friday', Impressions: 9800, Reach: 6860 },
            { day: 'Saturday', Impressions: 7500, Reach: 5250 },
            { day: 'Sunday', Impressions: 8200, Reach: 5740 }
        ],
        hourOfDayData: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            Impressions: Math.floor(Math.random() * 10000) + 1000,
            Reach: Math.floor(Math.random() * 7000) + 700
        })),
        topicData: [
            { topic: 'Projects', Likes: 720, Comments: 85, Saves: 110 },
            { topic: 'Learning and Education', Likes: 850, Comments: 95, Saves: 125 },
            { topic: 'Problem-Solving', Likes: 680, Comments: 75, Saves: 95 },
            { topic: 'Actionable Content', Likes: 780, Comments: 90, Saves: 115 },
            { topic: 'Career Growth', Likes: 650, Comments: 70, Saves: 85 }
        ],
        followsData: [
            { name: 'Reel', value: 450 },
            { name: 'Carousel', value: 380 },
            { name: 'Photo', value: 220 },
            { name: 'Educational', value: 420 },
            { name: 'Code/Project', value: 400 }
        ],
        viralData: Array.from({ length: 7 }, (_, i) => ({
            day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
            Projects: Math.floor(Math.random() * 5) + 1,
            Learning: Math.floor(Math.random() * 5) + 1,
            ProblemSolving: Math.floor(Math.random() * 5) + 1,
            Actionable: Math.floor(Math.random() * 5) + 1,
            Career: Math.floor(Math.random() * 5) + 1
        })),
        monthlyData: Array.from({ length: 12 }, (_, i) => ({
            month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i],
            Impressions: Math.floor(Math.random() * 5000) + 8000,
            Reach: Math.floor(Math.random() * 3500) + 5600,
            Likes: Math.floor(Math.random() * 300) + 500,
            Shares: Math.floor(Math.random() * 50) + 50,
            Follows: Math.floor(Math.random() * 20) + 30
        })),
        weeklyData: Array.from({ length: 4 }, (_, i) => ({
            week: i + 1,
            Impressions: Math.floor(Math.random() * 3000) + 8000,
            Reach: Math.floor(Math.random() * 2100) + 5600,
            Likes: Math.floor(Math.random() * 200) + 500,
            Shares: Math.floor(Math.random() * 30) + 50
        })),
        keyInsights: {
            best_post_type: 'Reel',
            best_day: 'Thursday',
            best_hour: '19:00',
            best_topic: 'Learning and Education',
            viral_threshold: 15000,
            best_growth_post_type: 'Educational',
            best_growth_hour: '19:00'
        }
    };
}

function displayChartError() {
    // Display error message in chart containers
    const chartContainers = document.querySelectorAll('.chart-container, .chart-container-small');
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div class="chart-error">
                <p>Error loading chart. Please try refreshing the page.</p>
            </div>
        `;
    });
}

function showSelectedView(viewName) {
    console.log("Showing view:", viewName);
    
    // Hide all views
    const views = document.querySelectorAll('.analytics-view');
    views.forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show the selected view
    const selectedView = document.getElementById(`${viewName}-view`);
    if (selectedView) {
        selectedView.classList.remove('hidden');
    } else {
        console.error(`View not found: ${viewName}-view`);
    }
}

// Declare chartData if it's not already defined
window.chartData = window.chartData || {};

function initializeCharts() {
    const colors = {
        primary: '#00c8ff',
        secondary: '#ff00c8',
        tertiary: '#c8ff00',
        quaternary: '#ff8042',
        quinary: '#8884d8'
    };
    
    // Common chart options
    Chart.defaults.color = '#e0e0ff';
    Chart.defaults.borderColor = '#2a2a5a';
    
    // ==================== POST TYPE CHARTS ====================
    
    // Post Type Bar Chart
    const postTypeBarCtx = document.getElementById('postTypeBarChart');
    if (postTypeBarCtx) {
        console.log("Initializing Post Type Bar Chart");
        new Chart(postTypeBarCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.postTypeData.map(item => item.postType),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.postTypeData.map(item => item.Impressions),
                        backgroundColor: colors.primary,
                    },
                    {
                        label: 'Likes',
                        data: chartData.postTypeData.map(item => item.Likes),
                        backgroundColor: colors.secondary,
                    },
                    {
                        label: 'Comments',
                        data: chartData.postTypeData.map(item => item.Comments),
                        backgroundColor: colors.tertiary,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Post Type Line Chart
    const postTypeLineCtx = document.getElementById('postTypeLineChart');
    if (postTypeLineCtx) {
        console.log("Initializing Post Type Line Chart");
        new Chart(postTypeLineCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.postTypeData.map(item => item.postType),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.postTypeData.map(item => item.Impressions),
                        borderColor: colors.primary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Likes',
                        data: chartData.postTypeData.map(item => item.Likes),
                        borderColor: colors.secondary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Comments',
                        data: chartData.postTypeData.map(item => item.Comments),
                        borderColor: colors.tertiary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Post Type Impressions Pie Chart
    const postTypeImpressionsPieCtx = document.getElementById('postTypeImpressionsPieChart');
    if (postTypeImpressionsPieCtx) {
        console.log("Initializing Post Type Impressions Pie Chart");
        new Chart(postTypeImpressionsPieCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: chartData.postTypeData.map(item => item.postType),
                datasets: [
                    {
                        data: chartData.postTypeData.map(item => item.Impressions),
                        backgroundColor: [
                            colors.primary,
                            colors.secondary,
                            colors.tertiary,
                            colors.quaternary,
                            colors.quinary
                        ],
                        borderColor: '#1a1a3a',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
    
    // Post Type Likes Pie Chart
    const postTypeLikesPieCtx = document.getElementById('postTypeLikesPieChart');
    if (postTypeLikesPieCtx) {
        console.log("Initializing Post Type Likes Pie Chart");
        new Chart(postTypeLikesPieCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: chartData.postTypeData.map(item => item.postType),
                datasets: [
                    {
                        data: chartData.postTypeData.map(item => item.Likes),
                        backgroundColor: [
                            colors.primary,
                            colors.secondary,
                            colors.tertiary,
                            colors.quaternary,
                            colors.quinary
                        ],
                        borderColor: '#1a1a3a',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
    
    // ==================== DAY OF WEEK CHARTS ====================
    
    // Day of Week Bar Chart
    const dayOfWeekBarCtx = document.getElementById('dayOfWeekBarChart');
    if (dayOfWeekBarCtx) {
        console.log("Initializing Day of Week Bar Chart");
        new Chart(dayOfWeekBarCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.dayOfWeekData.map(item => item.day),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.dayOfWeekData.map(item => item.Impressions),
                        backgroundColor: colors.primary,
                    },
                    {
                        label: 'Reach',
                        data: chartData.dayOfWeekData.map(item => item.Reach),
                        backgroundColor: colors.secondary,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Day of Week Line Chart
    const dayOfWeekLineCtx = document.getElementById('dayOfWeekLineChart');
    if (dayOfWeekLineCtx) {
        console.log("Initializing Day of Week Line Chart");
        new Chart(dayOfWeekLineCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.dayOfWeekData.map(item => item.day),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.dayOfWeekData.map(item => item.Impressions),
                        borderColor: colors.primary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Reach',
                        data: chartData.dayOfWeekData.map(item => item.Reach),
                        borderColor: colors.secondary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Day of Week Heatmap
    const dayHeatmapContainer = document.getElementById('dayHeatmap');
    if (dayHeatmapContainer) {
        console.log("Initializing Day of Week Heatmap");
        let heatmapHtml = '';
        
        chartData.dayOfWeekData.forEach(day => {
            const maxImpressions = Math.max(...chartData.dayOfWeekData.map(d => d.Impressions || 0));
            const intensity = maxImpressions > 0 ? Math.max(0.1, Math.min(0.9, (day.Impressions || 0) / maxImpressions)) : 0.1;
            
            heatmapHtml += `
                <div class="heatmap-day" style="background-color: rgba(0, 200, 255, ${intensity})">
                    <div class="day-name">${day.day.substring(0, 3)}</div>
                    <div class="day-value">${(day.Impressions || 0).toLocaleString()}</div>
                </div>
            `;
        });
        
        dayHeatmapContainer.innerHTML = heatmapHtml;
    }
    
    // ==================== HOUR OF DAY CHARTS ====================
    
    // Hour of Day Line Chart
    const hourOfDayLineCtx = document.getElementById('hourOfDayLineChart');
    if (hourOfDayLineCtx) {
        console.log("Initializing Hour of Day Line Chart");
        new Chart(hourOfDayLineCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.hourOfDayData.map(item => `${item.hour}:00`),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.hourOfDayData.map(item => item.Impressions),
                        borderColor: colors.primary,
                        backgroundColor: 'rgba(0, 200, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Reach',
                        data: chartData.hourOfDayData.map(item => item.Reach),
                        borderColor: colors.secondary,
                        backgroundColor: 'rgba(255, 0, 200, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Hour of Day Bar Chart
    const hourOfDayBarCtx = document.getElementById('hourOfDayBarChart');
    if (hourOfDayBarCtx) {
        console.log("Initializing Hour of Day Bar Chart");
        new Chart(hourOfDayBarCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.hourOfDayData.map(item => `${item.hour}:00`),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.hourOfDayData.map(item => item.Impressions),
                        backgroundColor: colors.primary,
                    },
                    {
                        label: 'Reach',
                        data: chartData.hourOfDayData.map(item => item.Reach),
                        backgroundColor: colors.secondary,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Peak Hours
    const peakHoursContainer = document.getElementById('peakHoursContainer');
    if (peakHoursContainer) {
        console.log("Initializing Peak Hours");
        // Sort hours by impressions and get top 6
        const topHours = [...chartData.hourOfDayData]
            .sort((a, b) => (b.Impressions || 0) - (a.Impressions || 0))
            .slice(0, 6);
        
        let peakHoursHtml = '';
        
        topHours.forEach(hour => {
            peakHoursHtml += `
                <div class="peak-hour">
                    <div class="hour">${hour.hour}:00</div>
                    <div class="impressions">${(hour.Impressions || 0).toLocaleString()} impressions</div>
                </div>
            `;
        });
        
        peakHoursContainer.innerHTML = peakHoursHtml;
    }
    
    // ==================== TOPIC CHARTS ====================
    
    // Topic Bar Chart
    const topicBarCtx = document.getElementById('topicBarChart');
    if (topicBarCtx) {
        console.log("Initializing Topic Bar Chart");
        new Chart(topicBarCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.topicData.map(item => item.topic),
                datasets: [
                    {
                        label: 'Likes',
                        data: chartData.topicData.map(item => item.Likes),
                        backgroundColor: colors.primary,
                    },
                    {
                        label: 'Comments',
                        data: chartData.topicData.map(item => item.Comments),
                        backgroundColor: colors.secondary,
                    },
                    {
                        label: 'Saves',
                        data: chartData.topicData.map(item => item.Saves),
                        backgroundColor: colors.tertiary,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Topic Cards
    const topicCardsContainer = document.getElementById('topicCardsContainer');
    if (topicCardsContainer) {
        console.log("Initializing Topic Cards");
        let topicCardsHtml = '';
        
        chartData.topicData.forEach(topic => {
            topicCardsHtml += `
                <div class="topic-card">
                    <h4>${topic.topic}</h4>
                    <div class="value">${topic.Likes || 0}</div>
                    <div class="label">Likes</div>
                    <div class="metrics">
                        <div class="metric">
                            <div class="metric-value">${topic.Comments || 0}</div>
                            <div class="metric-label">Comments</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${topic.Saves || 0}</div>
                            <div class="metric-label">Saves</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        topicCardsContainer.innerHTML = topicCardsHtml;
    }
    
    // Topic Horizontal Chart
    const topicHorizontalCtx = document.getElementById('topicHorizontalChart');
    if (topicHorizontalCtx) {
        console.log("Initializing Topic Horizontal Chart");
        new Chart(topicHorizontalCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.topicData.map(item => item.topic),
                datasets: [
                    {
                        label: 'Likes',
                        data: chartData.topicData.map(item => item.Likes),
                        backgroundColor: colors.primary,
                    },
                    {
                        label: 'Comments',
                        data: chartData.topicData.map(item => item.Comments),
                        backgroundColor: colors.secondary,
                    },
                    {
                        label: 'Saves',
                        data: chartData.topicData.map(item => item.Saves),
                        backgroundColor: colors.tertiary,
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // ==================== FOLLOWS CHARTS ====================
    
    // Follows Pie Chart
    const followsPieCtx = document.getElementById('followsPieChart');
    if (followsPieCtx) {
        console.log("Initializing Follows Pie Chart");
        new Chart(followsPieCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: chartData.followsData.map(item => item.name),
                datasets: [
                    {
                        data: chartData.followsData.map(item => item.value),
                        backgroundColor: [
                            colors.primary,
                            colors.secondary,
                            colors.tertiary,
                            colors.quaternary,
                            colors.quinary
                        ],
                        borderColor: '#1a1a3a',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
    
    // Follows Bar Chart
    const followsBarCtx = document.getElementById('followsBarChart');
    if (followsBarCtx) {
        console.log("Initializing Follows Bar Chart");
        new Chart(followsBarCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.followsData.map(item => item.name),
                datasets: [
                    {
                        label: 'Follows',
                        data: chartData.followsData.map(item => item.value),
                        backgroundColor: colors.primary,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Follows Donut Chart
    const followsDonutCtx = document.getElementById('followsDonutChart');
    if (followsDonutCtx) {
        console.log("Initializing Follows Donut Chart");
        new Chart(followsDonutCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: chartData.followsData.map(item => item.name),
                datasets: [
                    {
                        data: chartData.followsData.map(item => item.value),
                        backgroundColor: [
                            colors.primary,
                            colors.secondary,
                            colors.tertiary,
                            colors.quaternary,
                            colors.quinary
                        ],
                        borderColor: '#1a1a3a',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
    
    // ==================== VIRAL POSTS CHARTS ====================
    
    // Viral Stacked Chart
    const viralStackedCtx = document.getElementById('viralStackedChart');
    if (viralStackedCtx) {
        console.log("Initializing Viral Stacked Chart");
        new Chart(viralStackedCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.viralData.map(item => item.day),
                datasets: [
                    {
                        label: 'Projects',
                        data: chartData.viralData.map(item => item.Projects),
                        backgroundColor: colors.primary,
                    },
                    {
                        label: 'Learning',
                        data: chartData.viralData.map(item => item.Learning),
                        backgroundColor: colors.secondary,
                    },
                    {
                        label: 'Problem Solving',
                        data: chartData.viralData.map(item => item.ProblemSolving),
                        backgroundColor: colors.tertiary,
                    },
                    {
                        label: 'Actionable',
                        data: chartData.viralData.map(item => item.Actionable),
                        backgroundColor: colors.quaternary,
                    },
                    {
                        label: 'Career',
                        data: chartData.viralData.map(item => item.Career),
                        backgroundColor: colors.quinary,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Viral Heatmap
    const viralHeatmapContainer = document.getElementById('viralHeatmap');
    if (viralHeatmapContainer) {
        console.log("Initializing Viral Heatmap");
        let heatmapHtml = '';
        
        chartData.viralData.forEach(day => {
            const totalViral = (day.Projects || 0) + (day.Learning || 0) + (day.ProblemSolving || 0) + (day.Actionable || 0) + (day.Career || 0);
            const maxViral = Math.max(...chartData.viralData.map(d => 
                (d.Projects || 0) + (d.Learning || 0) + (d.ProblemSolving || 0) + (d.Actionable || 0) + (d.Career || 0)
            ));
            const intensity = maxViral > 0 ? Math.max(0.1, Math.min(0.9, totalViral / maxViral)) : 0.1;
            
            heatmapHtml += `
                <div class="heatmap-day" style="background-color: rgba(255, 128, 66, ${intensity})">
                    <div class="day-name">${day.day.substring(0, 3)}</div>
                    <div class="day-value">${totalViral} viral</div>
                </div>
            `;
        });
        
        viralHeatmapContainer.innerHTML = heatmapHtml;
    }
    
    // Viral Summary
    const viralByDayContainer = document.getElementById('viralByDayContainer');
    const viralByTopicContainer = document.getElementById('viralByTopicContainer');
    
    if (viralByDayContainer) {
        console.log("Initializing Viral By Day");
        let viralByDayHtml = '';
        
        chartData.viralData.forEach(day => {
            const totalViral = (day.Projects || 0) + (day.Learning || 0) + (day.ProblemSolving || 0) + (day.Actionable || 0) + (day.Career || 0);
            const maxViral = Math.max(...chartData.viralData.map(d => 
                (d.Projects || 0) + (d.Learning || 0) + (d.ProblemSolving || 0) + (d.Actionable || 0) + (d.Career || 0)
            ));
            const width = Math.max(5, (totalViral / maxViral) * 100);
            
            viralByDayHtml += `
                <div class="viral-bar">
                    <div class="viral-bar-label">${day.day}</div>
                    <div class="viral-bar-track">
                        <div class="viral-bar-fill" style="width: ${width}%; background-color: ${colors.quaternary}"></div>
                    </div>
                    <div class="viral-bar-value">${totalViral}</div>
                </div>
            `;
        });
        
        viralByDayContainer.innerHTML = viralByDayHtml;
    }
    
    if (viralByTopicContainer) {
        console.log("Initializing Viral By Topic");
        // Calculate totals by topic
        const topics = [
            { name: 'Projects', color: colors.primary },
            { name: 'Learning', color: colors.secondary },
            { name: 'Problem Solving', color: colors.tertiary },
            { name: 'Actionable', color: colors.quaternary },
            { name: 'Career', color: colors.quinary }
        ];
        
        const topicTotals = topics.map(topic => {
            const key = topic.name === 'Problem Solving' ? 'ProblemSolving' : topic.name;
            const total = chartData.viralData.reduce((sum, day) => sum + (day[key] || 0), 0);
            return { ...topic, total };
        });
        
        const maxTopicTotal = Math.max(...topicTotals.map(t => t.total));
        
        let viralByTopicHtml = '';
        
        topicTotals.forEach(topic => {
            const width = Math.max(5, (topic.total / maxTopicTotal) * 100);
            
            viralByTopicHtml += `
                <div class="viral-bar">
                    <div class="viral-bar-label">${topic.name}</div>
                    <div class="viral-bar-track">
                        <div class="viral-bar-fill" style="width: ${width}%; background-color: ${topic.color}"></div>
                    </div>
                    <div class="viral-bar-value">${topic.total}</div>
                </div>
            `;
        });
        
        viralByTopicContainer.innerHTML = viralByTopicHtml;
    }
    
    // Update viral analysis text
    const viralAnalysis = document.getElementById('viral-analysis');
    if (viralAnalysis) {
        console.log("Initializing Viral Analysis");
        // Find day with most viral posts
        const dayTotals = chartData.viralData.map(day => {
            const total = (day.Projects || 0) + (day.Learning || 0) + (day.ProblemSolving || 0) + (day.Actionable || 0) + (day.Career || 0);
            return { day: day.day, total };
        });
        
        const bestViralDay = dayTotals.reduce((prev, current) => 
            prev.total > current.total ? prev : current, { day: 'Monday', total: 0 }
        ).day;
        
        // Find most common topic for viral posts
        const topicTotals = [
            { name: 'Projects', total: chartData.viralData.reduce((sum, day) => sum + (day.Projects || 0), 0) },
            { name: 'Learning', total: chartData.viralData.reduce((sum, day) => sum + (day.Learning || 0), 0) },
            { name: 'Problem Solving', total: chartData.viralData.reduce((sum, day) => sum + (day.ProblemSolving || 0), 0) },
            { name: 'Actionable', total: chartData.viralData.reduce((sum, day) => sum + (day.Actionable || 0), 0) },
            { name: 'Career', total: chartData.viralData.reduce((sum, day) => sum + (day.Career || 0), 0) }
        ];
        
        const bestViralTopic = topicTotals.reduce((prev, current) => 
            prev.total > current.total ? prev : current, { name: 'Projects', total: 0 }
        ).name;
        
        viralAnalysis.innerHTML = `
            <span class="accent">${bestViralDay}</span> has the highest number of viral posts.
            The most common topic for viral content is <span class="accent">${bestViralTopic}</span>.
            Focus on creating ${bestViralTopic} content on ${bestViralDay} to maximize viral potential.
        `;
    }
    
    // ==================== MONTHLY TRENDS CHARTS ====================
    
    // Monthly Line Chart
    const monthlyLineCtx = document.getElementById('monthlyLineChart');
    if (monthlyLineCtx) {
        console.log("Initializing Monthly Line Chart");
        new Chart(monthlyLineCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.monthlyData.map(item => item.month),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.monthlyData.map(item => item.Impressions),
                        borderColor: colors.primary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Reach',
                        data: chartData.monthlyData.map(item => item.Reach),
                        borderColor: colors.secondary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Likes',
                        data: chartData.monthlyData.map(item => item.Likes),
                        borderColor: colors.tertiary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Follows',
                        data: chartData.monthlyData.map(item => item.Follows),
                        borderColor: colors.quaternary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Monthly Bar Chart
    const monthlyBarCtx = document.getElementById('monthlyBarChart');
    if (monthlyBarCtx) {
        console.log("Initializing Monthly Bar Chart");
        new Chart(monthlyBarCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.monthlyData.map(item => item.month),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.monthlyData.map(item => item.Impressions),
                        backgroundColor: colors.primary,
                    },
                    {
                        label: 'Likes',
                        data: chartData.monthlyData.map(item => item.Likes),
                        backgroundColor: colors.tertiary,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Monthly Area Chart
    const monthlyAreaCtx = document.getElementById('monthlyAreaChart');
    if (monthlyAreaCtx) {
        console.log("Initializing Monthly Area Chart");
        new Chart(monthlyAreaCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.monthlyData.map(item => item.month),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.monthlyData.map(item => item.Impressions),
                        borderColor: colors.primary,
                        backgroundColor: 'rgba(0, 200, 255, 0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Reach',
                        data: chartData.monthlyData.map(item => item.Reach),
                        borderColor: colors.secondary,
                        backgroundColor: 'rgba(255, 0, 200, 0.2)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Update monthly analysis text
    const monthlyAnalysis = document.getElementById('monthly-analysis');
    if (monthlyAnalysis) {
        console.log("Initializing Monthly Analysis");
        // Find month with highest impressions
        const bestMonth = chartData.monthlyData.reduce((prev, current) => 
            (prev.Impressions || 0) > (current.Impressions || 0) ? prev : current, 
            { month: 'January', Impressions: 0 }
        ).month;
        
        // Determine trend (increasing, decreasing, or stable)
        const firstHalf = chartData.monthlyData.slice(0, 6);
        const secondHalf = chartData.monthlyData.slice(6);
        
        const firstHalfAvg = firstHalf.reduce((sum, month) => sum + (month.Impressions || 0), 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, month) => sum + (month.Impressions || 0), 0) / secondHalf.length;
        
        let trend = 'stable';
        if (secondHalfAvg > firstHalfAvg * 1.1) {
            trend = 'increasing';
        } else if (secondHalfAvg < firstHalfAvg * 0.9) {
            trend = 'decreasing';
        }
        
        monthlyAnalysis.innerHTML = `
            <span class="accent">${bestMonth}</span> shows the highest engagement levels.
            The overall trend shows <span class="accent">${trend}</span> engagement throughout the year.
            Plan your content strategy to capitalize on seasonal peaks.
        `;
    }
    
    // ==================== WEEKLY TRENDS CHARTS ====================
    
    // Weekly Line Chart
    const weeklyLineCtx = document.getElementById('weeklyLineChart');
    if (weeklyLineCtx) {
        console.log("Initializing Weekly Line Chart");
        new Chart(weeklyLineCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.weeklyData.map(item => `Week ${item.week}`),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.weeklyData.map(item => item.Impressions),
                        borderColor: colors.primary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Reach',
                        data: chartData.weeklyData.map(item => item.Reach),
                        borderColor: colors.secondary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Likes',
                        data: chartData.weeklyData.map(item => item.Likes),
                        borderColor: colors.tertiary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Shares',
                        data: chartData.weeklyData.map(item => item.Shares),
                        borderColor: colors.quaternary,
                        backgroundColor: 'transparent',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Weekly Bar Chart
    const weeklyBarCtx = document.getElementById('weeklyBarChart');
    if (weeklyBarCtx) {
        console.log("Initializing Weekly Bar Chart");
        new Chart(weeklyBarCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.weeklyData.map(item => `Week ${item.week}`),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.weeklyData.map(item => item.Impressions),
                        backgroundColor: colors.primary,
                    },
                    {
                        label: 'Likes',
                        data: chartData.weeklyData.map(item => item.Likes),
                        backgroundColor: colors.tertiary,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Weekly Comparison Charts
    const weeklyComparisonChart1Ctx = document.getElementById('weeklyComparisonChart1');
    if (weeklyComparisonChart1Ctx) {
        console.log("Initializing Weekly Comparison Chart 1");
        new Chart(weeklyComparisonChart1Ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.weeklyData.map(item => `Week ${item.week}`),
                datasets: [
                    {
                        label: 'Impressions',
                        data: chartData.weeklyData.map(item => item.Impressions),
                        borderColor: colors.primary,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Likes',
                        data: chartData.weeklyData.map(item => item.Likes),
                        borderColor: colors.tertiary,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    const weeklyComparisonChart2Ctx = document.getElementById('weeklyComparisonChart2');
    if (weeklyComparisonChart2Ctx) {
        console.log("Initializing Weekly Comparison Chart 2");
        new Chart(weeklyComparisonChart2Ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.weeklyData.map(item => `Week ${item.week}`),
                datasets: [
                    {
                        label: 'Reach',
                        data: chartData.weeklyData.map(item => item.Reach),
                        borderColor: colors.secondary,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Shares',
                        data: chartData.weeklyData.map(item => item.Shares),
                        borderColor: colors.quaternary,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Update weekly analysis text
    const weeklyAnalysis = document.getElementById('weekly-analysis');
    if (weeklyAnalysis) {
        console.log("Initializing Weekly Analysis");
        // Find week with highest impressions
        const bestWeek = chartData.weeklyData.reduce((prev, current) => 
            (prev.Impressions || 0) > (current.Impressions || 0) ? prev : current, 
            { week: 1, Impressions: 0 }
        ).week;
        
        // Determine trend (increasing, decreasing, or stable)
        const firstHalf = chartData.weeklyData.slice(0, Math.ceil(chartData.weeklyData.length / 2));
        const secondHalf = chartData.weeklyData.slice(Math.ceil(chartData.weeklyData.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, week) => sum + (week.Impressions || 0), 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, week) => sum + (week.Impressions || 0), 0) / secondHalf.length;
        
        let trend = 'stable';
        if (secondHalfAvg > firstHalfAvg * 1.1) {
            trend = 'increasing';
        } else if (secondHalfAvg < firstHalfAvg * 0.9) {
            trend = 'decreasing';
        }
        
        weeklyAnalysis.innerHTML = `
            Week <span class="accent">${bestWeek}</span> shows the highest engagement levels.
            The overall trend shows <span class="accent">${trend}</span> engagement over the analyzed period.
            Identify what content performed well during peak weeks and replicate that success.
        `;
    }
    
    console.log("All charts initialized");
}

// Add CSS for chart error display and summary view
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .chart-error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background-color: rgba(255, 51, 102, 0.1);
            border-radius: 0.5rem;
            padding: 1rem;
            text-align: center;
        }
        .chart-error p {
            color: #ff3366;
            font-weight: bold;
        }
        
        /* Additional styles for missing components */
        .peak-hour {
            background-color: rgba(0, 200, 255, 0.1);
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 0.5rem;
            transition: all 0.3s ease;
        }
        .peak-hour:hover {
            background-color: rgba(0, 200, 255, 0.2);
            transform: translateY(-2px);
        }
        .hour {
            font-weight: bold;
            font-size: 1.1rem;
            color: #00c8ff;
        }
        .impressions {
            color: #e0e0ff;
            margin-top: 0.25rem;
        }
        
        .topic-card {
            background-color: rgba(0, 0, 40, 0.3);
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 0.5rem;
            transition: all 0.3s ease;
        }
        .topic-card:hover {
            background-color: rgba(0, 0, 40, 0.5);
            transform: translateY(-2px);
        }
        .topic-card h4 {
            margin-top: 0;
            color: #e0e0ff;
        }
        .value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #00c8ff;
        }
        .label {
            color: #a0a0cc;
            margin-bottom: 0.5rem;
        }
        .metrics {
            display: flex;
            gap: 1rem;
        }
        .metric {
            flex: 1;
        }
        .metric-value {
            font-weight: bold;
            color: #ff00c8;
        }
        .metric-label {
            color: #a0a0cc;
            font-size: 0.9rem;
        }
        
        .viral-bar {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        .viral-bar-label {
            width: 100px;
            text-align: right;
            padding-right: 1rem;
            color: #e0e0ff;
        }
        .viral-bar-track {
            flex: 1;
            height: 12px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            overflow: hidden;
        }
        .viral-bar-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 0.5s ease;
        }
        .viral-bar-value {
            width: 50px;
            text-align: right;
            padding-left: 1rem;
            color: #e0e0ff;
        }
        
        .heatmap-day {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 0.25rem;
            min-width: 80px;
            transition: all 0.3s ease;
        }
        .heatmap-day:hover {
            transform: translateY(-2px);
        }
        .day-name {
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .day-value {
            font-size: 0.9rem;
        }
        
        #dayHeatmap, #viralHeatmap {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
        }
        
        /* Summary View Styles */
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .summary-card {
            background-color: rgba(0, 0, 40, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        .summary-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        
        .summary-card h3 {
            color: #00c8ff;
            margin-top: 0;
            margin-bottom: 1rem;
            font-size: 1.25rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 0.75rem;
        }
        
        .summary-stat {
            margin-bottom: 1.25rem;
        }
        
        .stat-label {
            color: #a0a0cc;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }
        
        .stat-value {
            color: #e0e0ff;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
        }
        
        .stat-description {
            color: #a0a0cc;
            font-size: 0.85rem;
            font-style: italic;
        }
        
        .summary-insight {
            display: flex;
            align-items: flex-start;
            background-color: rgba(0, 200, 255, 0.1);
            border-radius: 0.5rem;
            padding: 1rem;
            margin-top: 1.5rem;
        }
        
        .insight-icon {
            font-size: 1.5rem;
            margin-right: 0.75rem;
            line-height: 1;
        }
        
        .insight-text {
            color: #e0e0ff;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .accent {
            color: #00c8ff;
            font-weight: bold;
        }
        
        .recommendations-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .recommendation-card {
            background-color: rgba(0, 0, 40, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            display: flex;
            align-items: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        .recommendation-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            background-color: rgba(0, 0, 40, 0.5);
        }
        
        .recommendation-icon {
            font-size: 2rem;
            margin-right: 1rem;
            line-height: 1;
        }
        
        .recommendation-content {
            flex: 1;
        }
        
        .recommendation-content h4 {
            color: #00c8ff;
            margin-top: 0;
            margin-bottom: 0.5rem;
        }
        
        .recommendation-content p {
            color: #e0e0ff;
            font-size: 0.9rem;
            line-height: 1.5;
            margin: 0;
        }
        
        .section-title {
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .section-title h2 {
            color: #00c8ff;
            margin-bottom: 0.5rem;
        }
        
        .section-title p {
            color: #a0a0cc;
            font-size: 1rem;
            margin: 0;
        }
    </style>
`);
