# Neynar Microservice App 🚀

## Overview

This microservice application integrates with the Neynar API to publish, search, and delete $DEGEN tip casts from previous seasons. It is built using Next.js and leverages the Neynar SDK for interacting with the Neynar platform.

## Features ✨

- Publish casts to Farcaster
- Search for specific casts based on patterns
- Delete casts based on criteria - e.g. 10 $DEGEN, posted before 30th April 2024

## Tech Stack 🛠️

- **Backend:** Node.js, Next.js
- **Frontend:** React, Next.js
- **Authentication:** Neynar SDK

## Prerequisites 📋

- Node.js 14+
- Neynar account and API key

## Installation ⚙️

1. **Clone the repository**
    ```sh
    git clone https://github.com/0xHelix/tip-cast-delete.git
    cd tip-cast-delete
    ```

2. **Install dependencies**
    ```sh
    npm install
    ```

3. **Set up environment variables**
    Create a `.env.local` file in the root directory and add the following:
    ```env
    NEYNAR_API_KEY=your_neynar_api_key
    NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_app_id
    ```

4. **Run the application**
    ```sh
    npm run dev
    ```

## API Endpoints 📝

### Publish Cast

- **URL:** `/api/cast`
- **Method:** `POST`
- **Request Body:**
    ```json
    {
      "signerUuid": "string",
      "text": "string"
    }
    ```
- **Response:**
    ```json
    {
      "message": "Cast with hash {hash} published successfully"
    }
    ```

### Search Casts

- **URL:** `/api/cast`
- **Method:** `POST`
- **Request Body:**
    ```json
    {
      "action": "search",
      "fid": "number",
      "pattern": "string",
      "deleteBefore": "string (ISO Date)"
    }
    ```
- **Response:**
    ```json
    {
      "totalMatches": "number",
      "deletableMatches": "number",
      "matches": [
        {
          "hash": "string",
          "timestamp": "string (ISO Date)"
        }
      ]
    }
    ```

### Delete Casts

- **URL:** `/api/cast`
- **Method:** `DELETE`
- **Request Body:**
    ```json
    {
      "signerUuid": "string",
      "castHashes": ["string"]
    }
    ```
- **Response:**
    ```json
    {
      "message": "Casts deleted successfully"
    }
    ```

## Frontend 🌐

The frontend of the application is a simple React component that uses the Neynar authentication context to allow users to publish, search, and delete casts. As you may be able to tell, I am no front end designer! 

### Usage

1. **Login with Neynar**
2. **Publish Cast:** Enter text and click "Cast"
3. **Search Casts:** Click "Search"
4. **Delete Casts:** Click "Delete"

## Acknowledgements 🙏

- Neynar for providing the API and SDK.
- Next.js for the framework.
