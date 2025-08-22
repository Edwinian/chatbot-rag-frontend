# Chatbot RAG FastAPI Application 
This is a Retrieval-Augmented Generation (RAG) chatbot application built with FastAPI, LangChain, and ChromaDB. It features a user-friendly chat window for real-time interaction with a conversational AI, powered by HuggingFace models, and supports queries enriched with document context and optional web search integration. The application also includes a dedicated page for uploading documents (PDF, DOCX, TXT, images) to be embedded into ChromaDB for retrieval, with automatic PII redaction for enhanced privacy. SQLite is used for storing chat logs and document metadata, ensuring persistence and traceability.


# Create .env File
- Create a .env file in the project root with following keys (values provided separately):
REACT_APP_API_BASE_URL=

# Setup
- npm install
- npm run start
- The application will be available at http://localhost:3000 or the next available port



