// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type { CancellationToken, Range, TextDocument } from 'vscode';
import { CodeLens } from 'vscode';
import { GO_MODE } from './goMode';
import { spawn } from 'child_process';

const fuzzFuncRegx = /^type (.*) string/u;

const  getFunctions = (
	doc: TextDocument,
	token: CancellationToken
):Range[] =>{
	const rangeList :Range[] = [];
	for (let i=0;i<doc.lineCount;i++){
		if(fuzzFuncRegx.test(doc.lineAt(i).text)){
			rangeList.push(doc.lineAt(i).range);
		}
	}
	return rangeList;
};

class GoCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: TextDocument, token: CancellationToken):
        CodeLens[] | Thenable<CodeLens[]> {
			const enums =  getFunctions(document, token);
			if (!enums) {
				return [];
			}
			const codelens: CodeLens[] = [];
			for (const f of enums) {
				codelens.push(
					new CodeLens(f, {
						title: 'run enum',
						command: 'juno.runEnum',
						arguments: []
					})
				);
	
			}
			return codelens;
    }

}

function cmd(){
	const p = spawn("/usr/local/go/bin/go",["env"]);
	p.stdout.setEncoding('utf8');
	let stdout = '';
	let stderr = '';
	p.stdout.on('data', (data) => (stdout += data));
	p.stderr.on('data', (data) => (stderr += data));
}


export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('juno.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from juno!');
	});

	let cmdDisposable = vscode.commands.registerCommand('juno.runEnum', () => {
		cmd();
	});

	context.subscriptions.push(vscode.languages.registerCodeLensProvider(GO_MODE, new GoCodeLensProvider()));
	context.subscriptions.push(disposable);
	context.subscriptions.push(cmdDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
