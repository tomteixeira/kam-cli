# KAM CLI & MCP Server

**KAM CLI** is a command-line interface for the Kameleoon Automation API. It also ships with an **MCP server** (Model Context Protocol) that lets AI assistants like Cursor and Claude Desktop interact with Kameleoon directly.

## Features

### CLI
*   **Multi-Client Management**: Store and switch between multiple Kameleoon client credentials.
*   **Interactive Shell**: Connect to a client and enter a persistent command loop with history.
*   **Full CRUD Operations**: Manage accounts, sites, goals, custom data, experiments, and segments.
*   **Bulk Operations**: Duplicate goals, segments, and tracking scripts across sites.
*   **Secure**: Credentials stored locally in a `.env` file (never committed to git).

### MCP Server
*   **34 AI tools** covering all Kameleoon API operations.
*   **Dynamic client switching**: List and switch clients from the chat, no config file edits needed.
*   **Automatic backup**: Tracking scripts are backed up before every modification.
*   **Backup restore**: List, inspect, and restore previous tracking script versions.
*   Compatible with **Cursor**, **Claude Desktop**, and any MCP-compatible client.

## Installation

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
    ```bash
    npm link
    ```

## Getting Started (CLI)

### 1. Add a Client

```bash
npm start -- add-client
# or if linked globally
kam-cli add-client
```

Follow the interactive prompts to enter your Kameleoon Client ID and Secret.

### 2. Switch Client

```bash
npm start -- switch
```

### 3. Connect & Enter Shell

```bash
npm start -- connect
```

You will see a prompt like: `KAM MY_CLIENT >`

## CLI Commands Reference

### Pre-connection Commands

| Command | Alias | Description |
|---|---|---|
| `add-client` | | Add new client credentials |
| `switch` | `use-client` | Switch between configured clients |
| `list-clients` | `ls` | List all configured clients |
| `remove-client` | `rm` | Remove a client configuration |
| `connect` | | Authenticate and enter interactive shell |

### Connected Shell Commands

#### General
*   `help` - Show available commands
*   `exit` - Disconnect and return to main menu
*   `whoami` - Display current account information

#### Accounts
*   `accounts:ls` - List all accounts
*   `accounts:create` - Create a new user account

#### Sites
*   `sites:getall` - List all sites
*   `sites:get <id>` - Get site details
*   `sites:create` - Create a new site
*   `sites:delete <id>` - Delete a site
*   `sites:get-script <siteCode>` - Get the global tracking script for a site
*   `sites:duplicate-script <sourceSiteCode> <targetSiteCodes>` - Duplicate tracking script to specific sites
*   `sites:duplicate-script-all <sourceSiteCode>` - Duplicate tracking script to all sites

#### Goals
*   `goals:getall` - List all goals
*   `goals:get <id>` - Get goal details
*   `goals:create` - Create a new goal
*   `goals:delete <id>` - Delete a goal
*   `goals:duplicate-all <goalId>` - Duplicate a goal to all sites

#### Custom Data
*   `cd:getall` - List all custom data fields
*   `cd:get <id>` - Get custom data details
*   `cd:create` - Create a new custom data definition
*   `cd:delete <id>` - Delete a custom data field

#### Experiments
*   `xp:getall` - List all experiments with status
*   `xp:get <id>` - Get experiment details
*   `xp:create` - Create a new experiment
*   `xp:delete <id>` - Delete an experiment
*   `xp:update-status <id>` - Change experiment status (Active, Paused, Stopped, etc.)

#### Segments
*   `segments:duplicate <segmentId> <siteCodes>` - Duplicate a segment to specified sites

## MCP Server

The MCP server exposes all Kameleoon operations as AI tools, usable from Cursor, Claude Desktop, or any MCP-compatible client.

### Setup for Cursor

The configuration is already included at `.cursor/mcp.json`. Just reload Cursor (`Cmd+Shift+P` > Reload Window).

### Setup for Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kameleoon": {
      "command": "node",
      "args": ["/absolute/path/to/projet_cli_kam/dist/mcp/server.js"],
      "cwd": "/absolute/path/to/projet_cli_kam"
    }
  }
}
```

Then restart Claude Desktop.

### MCP Tools Reference (34 tools)

#### Client Management
| Tool | Description |
|---|---|
| `kameleoon_list_clients` | List all configured clients and show the active one |
| `kameleoon_switch_client` | Switch to a different client |
| `kameleoon_current_client` | Show the currently active client |

#### Sites
| Tool | Description |
|---|---|
| `kameleoon_list_sites` | List all sites |
| `kameleoon_get_site` | Get site by ID |
| `kameleoon_get_site_by_code` | Get site by code |
| `kameleoon_create_site` | Create a new site |
| `kameleoon_delete_site` | Delete a site |
| `kameleoon_update_site` | Update site properties (auto-backup if tracking script changes) |
| `kameleoon_update_tracking_script` | Update tracking script (auto-backup before update) |

#### Goals
| Tool | Description |
|---|---|
| `kameleoon_list_goals` | List all goals |
| `kameleoon_get_goal` | Get goal by ID |
| `kameleoon_create_goal` | Create a new goal |
| `kameleoon_delete_goal` | Delete a goal |
| `kameleoon_duplicate_goal_to_all_sites` | Duplicate a goal to every other site |

#### Experiments
| Tool | Description |
|---|---|
| `kameleoon_list_experiments` | List all experiments |
| `kameleoon_get_experiment` | Get experiment by ID |
| `kameleoon_create_experiment` | Create a new experiment |
| `kameleoon_delete_experiment` | Delete an experiment |
| `kameleoon_update_experiment_status` | Change experiment status (activate, pause, stop, deactivate) |
| `kameleoon_restart_experiment` | Restart a stopped experiment |

#### Custom Data
| Tool | Description |
|---|---|
| `kameleoon_list_custom_data` | List all custom data definitions |
| `kameleoon_get_custom_data` | Get custom data by ID |
| `kameleoon_create_custom_data` | Create a new custom data definition |
| `kameleoon_delete_custom_data` | Delete a custom data definition |

#### Segments
| Tool | Description |
|---|---|
| `kameleoon_get_segment` | Get segment by ID |
| `kameleoon_duplicate_segment` | Duplicate a segment to target sites |

#### Accounts
| Tool | Description |
|---|---|
| `kameleoon_list_accounts` | List all user accounts |
| `kameleoon_get_account` | Get account by ID |
| `kameleoon_create_account` | Create a new account |
| `kameleoon_delete_account` | Delete an account |

#### Tracking Script Backups
| Tool | Description |
|---|---|
| `kameleoon_list_tracking_script_backups` | List all saved backups (filterable by site) |
| `kameleoon_get_tracking_script_backup` | View full content of a backup |
| `kameleoon_restore_tracking_script` | Restore a tracking script from a backup (saves a safety backup first) |

### Backup System

Every time a tracking script is modified through the MCP (via `kameleoon_update_tracking_script` or `kameleoon_update_site`), the current script is automatically saved to `.kameleoon-backups/tracking-scripts/` before the change is applied.

Restoring a backup also creates a safety backup of the current state, so no version is ever lost.

## Scripts

| Script | Description |
|---|---|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the CLI |
| `npm run dev` | Run the CLI in dev mode (ts-node) |
| `npm run mcp` | Run the MCP server (after build) |
| `npm run mcp:dev` | Run the MCP server in dev mode (ts-node) |

## Security

*   Credentials are stored in `.env` (gitignored).
*   Tracking script backups are stored in `.kameleoon-backups/` (gitignored).
*   No credentials are required in the MCP config files -- the server reads from `.env`.

## License

[MIT](LICENSE)
