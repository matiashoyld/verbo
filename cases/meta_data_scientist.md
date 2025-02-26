# Case Study: Video Calling Feature

## 1. Context

You are working as a Data Scientist at Meta. You're analyzing one of the platform's core features - the **one-on-one video calling** system that connects billions of users worldwide through Facebook Messenger. The feature has been a cornerstone of Meta's communication tools for years, enabling friends and family to have face-to-face conversations regardless of physical distance. To help inform strategic decisions about the feature's evolution, you have access to two comprehensive datasets:

### Table: `video_calls`

| Column           | Description                         |
|-----------------|-------------------------------------|
| caller          | User ID initiating the call         |
| recipient       | User ID receiving the call          |
| ds              | Date of the call                    |
| call_id         | Unique call identifier              |
| duration_seconds| Length of the call in seconds       |

Here is some example data:

| caller | recipient | ds         | call_id | duration_seconds |
|--------|-----------|------------|---------|------------------|
| 458921 | 672104    | 2023-01-01 | v8k2p9  | 183             |
| 458921 | 891345    | 2023-01-01 | m4n7v2  | 472             |
| 672104 | 234567    | 2023-01-02 | x9h5j4  | 256             |
| 891345 | 345678    | 2023-01-02 | q2w3e4  | 67              |
| 345678 | 891345    | 2023-01-03 | t7y8u9  | 124             |
| 234567 | 458921    | 2023-01-03 | p3l5k8  | 538             |

### Table: `daily_active_users`

| Column           | Description                               |
|-----------------|-------------------------------------------|
| user_id         | Unique identifier for the user            |
| ds              | Date the user was active/logged in        |
| country         | User's country                            |
| daily_active_flag| Indicates if user was active that day (1) |

Below you can see an example data:

| user_id | ds         | country | daily_active_flag |
|---------|-----------|---------|--------------------|
| 458921  | 2023-01-01| France  | 1                 |
| 672104  | 2023-01-01| France  | 1                 |
| 891345  | 2023-01-01| Spain   | 1                 |
| 234567  | 2023-01-02| France  | 1                 |
| 345678  | 2023-01-02| France  | 1                 |
| 458921  | 2023-01-03| France  | 1                 |

The company is considering launching a **group video chat** feature. You’ll be using these tables for analysis on user behavior, potential demand, and how to measure success.

## 2. Questions

### 1. SQL Query for Multiple Call Recipients

- **Context:** Using the `video_calls` table.
- **Question:** Write a SQL query to calculate how many users started a call with more than three different people in the last 7 days. Explain how you would optimize this query if it needed to run against a massive dataset.
- **Skills being assessed:** SQL Fundamentals (SELECT Queries, JOINs, Indexes & Optimization)

### 2. Cross-Table Analysis for User Engagement

- **Context:** Using both the `video_calls` and `daily_active_users` tables.
- **Question:** Write a SQL query to determine what percentage of daily active users from France participated in a video call yesterday (either as caller or recipient). Then suggest how this metric could be tracked over time as a KPI for regional engagement.
- **Skills being assessed:** SQL Fundamentals (JOINs), Metrics & KPIs, Business Metrics

### 3. Behavioral Pattern Identification

- **Context:** Meta is considering launching a group video chat feature.
- **Question:** Using the provided datasets, outline your approach to identify users who would be most interested in a group video chat feature. Include what behavioral patterns you would look for and how you would segment users into cohorts based on their potential interest.
- **Skills being assessed:** Cohort Analysis, Problem Framing, Decision-Making

### 4. Experimental Design for Feature Launch

- **Context:** The product team wants to run an A/B test before fully launching the group video chat feature.
- **Question:** Design an experiment to test the effectiveness of the group video chat feature.
- **Skills being assessed:** Experimental Design, Hypothesis Testing, Metrics & KPIs

### 5. Trade-off Analysis and Business Impact

- **Context:** Initial data shows that after introducing group video calls, one-on-one calls decrease by 15%, while overall time spent in video calls increases by 20%.
- **Question:** Conduct a trade-off analysis of this scenario. How would you determine if this is a positive or negative outcome for the platform? What additional metrics would you consider to evaluate the full business impact?
- **Skills being assessed:** Business Metrics, Decision-Making, Problem Framing

### 6. Feature Capacity Planning

- **Context:** The engineering team needs guidance on how many participants to support in the group video chat feature.
- **Question:** Using the existing data, propose a data-informed approach to determine the optimal maximum number of participants to support in group video calls. Include how you would balance user needs with technical constraints.
- **Skills being assessed:** Decision-Making, Problem Framing

### 7. Cross-functional Collaboration Scenario

- **Context:** The group video chat feature development is being managed using Agile/Scrum methodology.
- **Question:** As the data scientist on this project, describe how you would collaborate with the Agile team throughout the sprint cycle and ensure data-driven decision making.
- **Skills being assessed:** Team Collaboration, Stakeholder Communication

### 8. Goal Setting and Metric Development

- **Context:** The VP of Product has asked you to develop success metrics for the next year of the video calling features.
- **Question:** How would you measure the success of the group video chat feature?
- **Skills being assessed:** Metrics & KPIs (Goal Setting), Business Metrics, Problem Framing
