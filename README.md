# MS-RakeTaskRegistrar

A Visual Studio Code extension that provides CodeLens integration for Ruby rake tasks, allowing developers to easily register rake tasks in migrations directly from their `.rake` files.

## Features

- **CodeLens Integration**: Automatically detects rake tasks in `.rake` files and displays "Register Rake Task in Migration" links above each task definition
- **Multiple Task Format Support**: Recognizes various rake task declaration formats:
  - `task :task_name do`
  - `task "task_name" do`
  - `task task_name: :environment do`
- **One-Click Registration**: Click the CodeLens link to automatically execute the migration registration script
- **Integrated Terminal**: Opens a dedicated terminal to run the registration process with full output visibility
- **Self-Contained**: Bundles all necessary scripts - no additional setup required in your workspace

### Example Usage

When you open a `.rake` file, you'll see CodeLens links above each task:

```ruby
# In your_project/lib/tasks/example.rake

task :data_migration do  # ← "Register Rake Task in Migration" appears here
  # Your rake task code
end

task "cleanup_old_records" do  # ← "Register Rake Task in Migration" appears here
  # Your rake task code
end
```

Simply click the CodeLens link to register the task in your migration system.

## Requirements

- **Ruby**: Must be installed and available in your system PATH
- **VS Code**: Version 1.101.0 or higher
- **Workspace**: Must have an open workspace folder containing your Ruby project

## How It Works

1. **Detection**: The extension scans `.rake` files using intelligent regex patterns to identify task definitions
2. **CodeLens Display**: Shows interactive "Register Rake Task in Migration" links above each detected task
3. **Script Execution**: When clicked, executes the bundled `manage_rake_task_migration.rb` script with the task details
4. **Terminal Output**: Opens a dedicated terminal to show the registration process and any output

## Extension Settings

This extension does not add any VS Code settings. It works out-of-the-box with sensible defaults.

## Commands

The extension contributes the following commands:

- `rakeTaskMigration.registerTask`: Register a rake task in migration (triggered by CodeLens)
- `MS-RakeTaskRegistrar.helloWorld`: Hello World command (for testing)

## Known Issues

- The extension requires Ruby to be installed and accessible via the `ruby` command
- Only processes files with `.rake` extension
- Requires an open workspace folder to function properly

## Installation

1. Install the extension from the VS Code marketplace
2. Open a workspace containing Ruby `.rake` files
3. CodeLens links will automatically appear above rake task definitions

## Release Notes

### 0.0.1

Initial release of MS-RakeTaskRegistrar

Features:
- CodeLens integration for rake task detection
- Support for multiple rake task declaration formats
- Bundled migration registration script
- Integrated terminal execution
- Self-contained extension with no external dependencies

---

## Development

This extension is built with:
- **Language**: JavaScript (Node.js)
- **VS Code API**: Extensibility API for CodeLens providers and commands
- **Bundled Script**: Ruby script for handling rake task migration registration

### File Structure
```
MS-RakeTaskRegistrar/
├── extension.js              # Main extension logic
├── scripts/
│   └── manage_rake_task_migration.rb  # Bundled migration script
├── package.json              # Extension manifest
└── README.md                 # This file
```

## Contributing

Feel free to submit issues and enhancement requests!

**Enjoy using MS-RakeTaskRegistrar!**