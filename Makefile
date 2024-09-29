# Variables
NODE_BIN :=./nodejs
NPM := $(NODE_BIN)/npm
NPX := $(NODE_BIN)/npx
VENV := venv
PYTHON := python  # Use `python` on Windows

# Determine pip path based on OS
ifeq ($(OS),Windows_NT)
    PIP := $(VENV)/Scripts/pip
    PYTHON_BIN := $(VENV)/Scripts/python
else
    PIP := $(VENV)/bin/pip
    PYTHON_BIN := $(VENV)/bin/python
endif

# Create virtual environment (check if `venv/Scripts/activate` exists)
$(VENV)/Scripts/activate $(VENV)/bin/activate:
	@echo "Creating virtual environment..."
	$(PYTHON) -m venv $(VENV)

# Install server dependencies inside the virtual environment
install-server: $(VENV)/Scripts/activate
	@echo "Installing server dependencies inside venv..."
	$(PIP) install -r requirements.txt

# Install client dependencies
install-client:
	@echo "Installing client dependencies..."
	cd client/kmeans && $(NPM) install

# Install all dependencies (server + client)
install: install-server install-client

# Run the server using the virtual environment
run-server:
	@echo "Starting server..."
	$(PYTHON_BIN) server/app.py

# Run the client
run-client:
	@echo "Starting client..."
	cd client/kmeans && $(NPM) start

# Run both server and client concurrently
run:
	@echo "Starting server and client..."
	$(MAKE) -j2 run-server run-client

# Clear port 3000
clear:
	$(NPX) kill-port 3000
