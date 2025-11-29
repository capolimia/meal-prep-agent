# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""FastAPI server with CORS support for Cloud Run deployment."""

import os
from fastapi.middleware.cors import CORSMiddleware
from google.adk.servers.fastapi_server import create_fastapi_server
from app.agent import app as adk_app

# Create FastAPI server from ADK app
fastapi_app = create_fastapi_server(adk_app)

# Add CORS middleware - must be added after server creation
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://capstone-478122.web.app",
        "https://capstone-478122.firebaseapp.com",
        "http://localhost:4200",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(fastapi_app, host="0.0.0.0", port=port)
