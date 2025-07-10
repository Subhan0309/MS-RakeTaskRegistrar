// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "MS-RakeTaskRegistrar" is now active!');

	// Register CodeLens provider for Ruby rake files
	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider(
			{ language: 'ruby', scheme: 'file', pattern: '**/*.rake' },
			new RakeTaskCodeLensProvider()
		)
	);

	// Register the command to handle rake task registration
	context.subscriptions.push(
		vscode.commands.registerCommand('rakeTaskMigration.registerTask', (rakeFile, taskName) => {
			// Debug logging
			console.log('Command called with:', { rakeFile, taskName });
			console.log('RakeFile type:', typeof rakeFile);
			console.log('TaskName type:', typeof taskName);
			
			// Validate input parameters
			if (!rakeFile) {
				vscode.window.showErrorMessage('Rake file path is undefined. Please try again.');
				return;
			}
			
			if (!taskName) {
				vscode.window.showErrorMessage('Task name is undefined. Please try again.');
				return;
			}

			// Check if workspace folders exist
			if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
				vscode.window.showErrorMessage('No workspace folder is open. Please open a workspace folder first.');
				return;
			}

			const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
			const scriptPath = path.join(workspaceFolder, 'scripts', 'manage_rake_task_migration.rb');
			
			// Convert URI to file path if needed
			let rakeFilePath;
			if (typeof rakeFile === 'string') {
				rakeFilePath = rakeFile;
			} else if (rakeFile.fsPath) {
				rakeFilePath = rakeFile.fsPath;
			} else {
				vscode.window.showErrorMessage('Invalid rake file path format.');
				return;
			}
			
			const relativeRakeFilePath = path.relative(workspaceFolder, rakeFilePath);
			
			// Check if the script file exists
			const fs = require('fs');
			if (!fs.existsSync(scriptPath)) {
				vscode.window.showErrorMessage(`Script not found at: ${scriptPath}`);
				return;
			}

			// Check if the rake file exists
			if (!fs.existsSync(rakeFilePath)) {
				vscode.window.showErrorMessage(`Rake file not found at: ${rakeFilePath}`);
				return;
			}

			const command = `ruby "${scriptPath}" "${relativeRakeFilePath}" "${taskName}"`;
			const terminal = vscode.window.createTerminal('Rake Task Migration');
			terminal.show();
			terminal.sendText(command);
			
			vscode.window.showInformationMessage(`Registering rake task: ${taskName} from ${relativeRakeFilePath}`);
		})
	);

	// Keep the original hello world command for backward compatibility
	const disposable = vscode.commands.registerCommand('MS-RakeTaskRegistrar.helloWorld', function () {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from RakeTaskRegistrar!');
	});

	context.subscriptions.push(disposable);
}

/**
 * CodeLens provider class for rake tasks
 */
class RakeTaskCodeLensProvider {
	provideCodeLenses(document, token) {
		const codeLenses = [];
		
		// Only process .rake files
		if (!document.fileName.endsWith('.rake')) {
			return codeLenses;
		}
		
		// Updated regex to handle different rake task formats:
		// task :task_name do
		// task "task_name" do  
		// task task_name: :environment do
		const regex = /^\s*task\s+(?::([a-zA-Z0-9_]+)|"([a-zA-Z0-9_]+)"|([a-zA-Z0-9_]+))\s*(?::|=>|do|\s)/gm;
		const text = document.getText();
		let match;
		
		console.log(`Processing rake file: ${document.fileName}`);
		
		while ((match = regex.exec(text)) !== null) {
			const line = document.positionAt(match.index).line;
			// Get the task name from whichever capture group matched
			const taskName = match[1] || match[2] || match[3];
			
			if (taskName) {
				console.log(`Found rake task: ${taskName} at line ${line}`);
				
				codeLenses.push(
					new vscode.CodeLens(
						new vscode.Range(line, 0, line, 0),
						{
							title: 'Register Rake Task in Migration',
							command: 'rakeTaskMigration.registerTask',
							arguments: [document.uri.fsPath, taskName]
						}
					)
				);
			}
		}
		
		console.log(`Generated ${codeLenses.length} code lenses`);
		return codeLenses;
	}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}