# Technical Assessment Case Study Generator

## Overview

You will generate a comprehensive technical assessment case study based on the provided job description and skills list. The output will be a JSON document that presents a realistic scenario with targeted questions to assess specific skills and competencies.

## Input Format

You will receive two main inputs:

1. **Job Description**: A text description of a job role, including responsibilities, requirements, and context.

2. **Skills List**: A structured JSON object containing categories, skills, and competencies to assess, formatted as:

```json
[
  {
    "id": 23,
    "name": "Databases & SQL",
    "skills": [
      {
        "id": 0,
        "name": "SQL Fundamentals",
        "competencies": [
          {
            "id": 0,
            "name": "SELECT Queries"
          },
          {
            "id": 1,
            "name": "CASE/IF"
          }
          // Additional competencies...
        ]
      },
      // Additional skills...
    ]
  },
  // Additional categories...
]
```

## Output Format

Generate a JSON document with the following structure:

```json
{
  "context": "A detailed description of the scenario, including company background, role context, and available data/resources",
  "questions": [
    {
      "context": "Brief context specific to this question",
      "question": "The actual question to be answered by the candidate",
      "skills_assessed": [
        {
          "id": 0,
          "name": "Skill Name"
        },
        {
          "id": 1,
          "name": "Another Skill"
        }
      ]
    },
    // Additional questions following the same structure
  ]
}
```

## Guidelines for Creating the Case Study

### For the Main Context

1. Choose a realistic company (or create a fictional one) and role that matches the job description
2. Create a detailed scenario relevant to the industry and position
3. Include specific datasets, tools, or resources the candidate would use (include sample data tables if relevant)
4. Make the scenario detailed enough to support 4-6 questions that assess different skills
5. Ensure the context provides sufficient information for answering the questions

### For Each Question

1. Create a specific sub-context that focuses on a particular aspect of the main scenario
2. Formulate a clear, challenging question that requires demonstrating specific skills
3. Tag each question with the relevant skills from the provided skills list using their exact IDs and names
4. Some questions may assess more than one skill, but for other more difficult to assess skills, you can create more than one question to assess the skill.
5. Make them somewhat open-ended to allow for a range of possible answers.

## Formatting Guidelines

1. The output must be valid JSON without any trailing commas or syntax errors
2. For the "context" field, use markdown formatting. Feel free to use bullets, tables and other markdown elements to make the context more engaging.

## Example

Using a Data Scientist job description and a skills list with categories like "Databases & SQL" and "Data Analysis", the output would be a JSON document containing:

```json
{
  "context": "You are working as a Data Scientist at Meta. You're analyzing one of the platform's core features - the **one-on-one video calling** system that connects billions of users worldwide through Facebook Messenger. The feature has been a cornerstone of Meta's communication tools for years, enabling friends and family to have face-to-face conversations regardless of physical distance. To help inform strategic decisions about the feature's evolution, you have access to two comprehensive datasets:\n\n### Table: `video_calls`\n\n| Column           | Description                         |\n|-----------------|-------------------------------------|\n| caller          | User ID initiating the call         |\n| recipient       | User ID receiving the call          |\n| ds              | Date of the call                    |\n| call_id         | Unique call identifier              |\n| duration_seconds| Length of the call in seconds       |\n\nHere is some example data:\n\n| caller | recipient | ds         | call_id | duration_seconds |\n|--------|-----------|------------|---------|------------------|\n| 458921 | 672104    | 2023-01-01 | v8k2p9  | 183             |\n| 458921 | 891345    | 2023-01-01 | m4n7v2  | 472             |\n| 672104 | 234567    | 2023-01-02 | x9h5j4  | 256             |\n| 891345 | 345678    | 2023-01-02 | q2w3e4  | 67              |\n| 345678 | 891345    | 2023-01-03 | t7y8u9  | 124             |\n| 234567 | 458921    | 2023-01-03 | p3l5k8  | 538             |\n\n### Table: `daily_active_users`\n\n| Column           | Description                               |\n|-----------------|-------------------------------------------|\n| user_id         | Unique identifier for the user            |\n| ds              | Date the user was active/logged in        |\n| country         | User's country                            |\n| daily_active_flag| Indicates if user was active that day (1) |\n\nBelow you can see an example data:\n\n| user_id | ds         | country | daily_active_flag |\n|---------|-----------|---------|-----------------|\n| 458921  | 2023-01-01| France  | 1                 |\n| 672104  | 2023-01-01| France  | 1                 |\n| 891345  | 2023-01-01| Spain   | 1                 |\n| 234567  | 2023-01-02| France  | 1                 |\n| 345678  | 2023-01-02| France  | 1                 |\n| 458921  | 2023-01-03| France  | 1                 |\n\nThe company is considering launching a **group video chat** feature. You'll be using these tables for analysis on user behavior, potential demand, and how to measure success.",
  "questions": [
    {
      "context": "Using the `video_calls` table.",
      "question": "Write a SQL query to calculate how many users started a call with more than three different people in the last 7 days. Explain how you would optimize this query if it needed to run against a massive dataset.",
      "skills_assessed": [
        {
          "id": 0,
          "name": "SQL Fundamentals"
        },
        {
          "id": 1,
          "name": "Database Optimization"
        }
      ]
    },
    {
      "context": "Meta is considering launching a group video chat feature.",
      "question": "Using the provided datasets, outline your approach to identify users who would be most interested in a group video chat feature. Include what behavioral patterns you would look for and how you would segment users into cohorts based on their potential interest.",
      "skills_assessed": [
        {
          "id": 4,
          "name": "Cohort Analysis"
        },
        {
          "id": 5,
          "name": "Problem Framing"
        },
        {
          "id": 6,
          "name": "Decision-Making"
        }
      ]
    }
  ]
}
```

## Instructions

1. Analyze the job description to understand the role, industry, and key responsibilities
2. Review the skills list to identify important capabilities to assess
3. Create a realistic, detailed scenario relevant to the job that includes any necessary data structures, tables, or resources
4. Generate 4-6 questions that collectively assess the key skills
5. Format the output as the specified JSON structure with proper JSON syntax. Only the JSON without any text before or after. And no backticks (`).
6. Ensure the case study is challenging but realistic for the target role
