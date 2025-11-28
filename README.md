# KAM CLI

**KAM CLI** is a powerful command-line interface designed to interact with the Kameleoon Automation API. It allows you to manage clients, accounts, sites, goals, custom data, and experiments directly from your terminal with a clean and interactive interface.

## 🚀 Features

*   **Multi-Client Management**: Securely store and switch between multiple Kameleoon client credentials.
*   **Interactive Shell**: Connect to a client and enter a persistent command loop with history support.
*   **Full CRUD Operations**: Manage your Kameleoon entities:
    *   **Accounts**: List, create, and view details.
    *   **Sites**: List, create, delete, and view details.
    *   **Goals**: Manage goals with support for multiple conversion types.
    *   **Custom Data**: Configure custom data collection methods (GTM, JS, etc.).
    *   **Experiments**: Create, update status, delete, and restore experiments.
*   **Secure**: Credentials are stored locally in a `.env` file.

## 🛠️ Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd kam-cli
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the project:**
    ```bash
    npm run build
    ```

4.  **Link globally (optional):**
    To use the `kam-cli` command anywhere:
    ```bash
    npm link
    ```

## 🏁 Getting Started

### 1. Add a Client
Before connecting, you need to add your Kameleoon API credentials (Client ID and Secret).

```bash
npm start -- add-client
# or if linked
kam-cli add-client
```
Follow the interactive prompts to enter your credentials.

### 2. Switch Context
Select the client you want to work with:

```bash
npm start -- switch
```

### 3. Connect & Enter Shell
Authenticate and enter the interactive command loop:

```bash
npm start -- connect
```
You will see a prompt like:
`KAM MY_CLIENT >`

## 📚 Commands Reference

Once inside the connected shell, you can use the following commands.

### General
*   `help`: Show available commands.
*   `exit`: Disconnect and exit.
*   `whoami`: Display current account information.

### Accounts
*   `accounts:ls`: List all accounts.
*   `accounts:create`: Wizard to create a new user account.

### Sites
*   `sites:getall`: List all configured sites.
*   `sites:get <id>`: Get details of a specific site.
*   `sites:create`: Create a new site.
*   `sites:delete <id>`: Delete a site.

### Goals
*   `goals:getall`: List all goals.
*   `goals:get <id>`: Get details of a goal.
*   `goals:create`: Create a new goal.
*   `goals:delete <id>`: Delete a goal.

### Custom Data
*   `cd:getall`: List all custom data fields.
*   `cd:get <id>`: Get details of a specific custom data.
*   `cd:create`: Create a new custom data definition.
*   `cd:delete <id>`: Delete a custom data field.

### Experiments
*   `xp:getall`: List all experiments with their status.
*   `xp:get <id>`: Get details of an experiment.
*   `xp:create`: Create a new experiment.
*   `xp:delete <id>`: Delete an experiment.
*   `xp:update-status <id>`: Change experiment status (Active, Paused, Stopped, etc.).

## 🔒 Security

Credentials are stored in a `.env` file in the project root. Ensure this file is never committed to version control if you fork this project.

## 📝 License

[MIT](LICENSE)

