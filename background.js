'use strict';

const TST_ID = 'treestyletab@piro.sakura.ne.jp';

async function registerToTST() {
	try {
		//const base = `moz-extension://${location.host}`;
		await browser.runtime.sendMessage(TST_ID, {
			type: 'register-self',
			name: browser.i18n.getMessage('extensionName'),
			//icons: browser.runtime.getManifest().icons,
		});
	}
	catch(_error) {
		// TST is not available
	}
}
registerToTST();

browser.runtime.onMessageExternal.addListener((message, sender) => {
	switch (sender.id) {
		case TST_ID:
			switch (message.type) {
				case 'ready':
					registerToTST();
					break;
			}
			break;
	}
});

// mine

// Links tabs to their downstream tab, or "favorite children" for downstream commands.
// Holds up to 44 objects, so up to 44 downstream tabs can be held.
const favs = [];

// Gets the tree structure array from TST
async function getStructure() {
	// Get tree structure of entire tabs
	return await browser.runtime.sendMessage(TST_ID, {
		type:   'get-tree-structure',
		tab: '*'
	});
}

// Gets the active tab object from browser.tabs
async function getActiveTab() {
	const [activeTab, ] = await browser.tabs.query({
		active: true,
		currentWindow: true
	});
	return activeTab;
}

// Simply focuses whatever argument passed, which can be a tab ID or 'parent' 'root' etc
async function focus(x) {
	await browser.runtime.sendMessage(TST_ID, {
		type:     'focus',
		tab:      x, // required, tabs.Tab.id or alias
		silently: false // optional, boolean (default=false)
	});
}

// Listen for commands from other extensions like Vimium C.
browser.runtime.onMessageExternal.addListener((message, sender) => {
	executeCommand(message.data);
});

// Listen for commands from shortcuts.
browser.commands.onCommand.addListener(executeCommand);

function executeCommand(command) {
	if (command === 'focus-parent-set-downstream') {
		focusParentSetDownstream();
	}
	else if (command === 'focus-parent') {
		focus('parent');
	}
	else if (command === 'focus-downstream') {
		focusDownstream();
	}
	else if (command === 'focus-first-child') {
		focusFirstChild();
	}
	else if (command.startsWith("focus-sibling-number-")) {
		focusSiblingNumber(command.charAt(command.length-1));
	}
	else if (command === 'create-child-tab') {
		createChildTab();
	}
	else if (command === 'create-sibling-tab') {
		createSiblingTab();
	}
	else if (command === 'focus-next-sibling') {
		focus('nextSibling');
	}
	else if (command === 'focus-previous-sibling') {
		focus('previousSibling');
	}
	else if (command === 'close-tree') {
		closeTree();
	}
	else if (command === 'close-children') {
		closeChildren();
	}
	else if (command === 'focus-root') {
		focus('root');
	}
	else if (command === 'focus-root-set-downstream') {
		focusRootSetDownstream();
	}
}

async function focusParentSetDownstream() {
	const oldTab = await getActiveTab();

	const success = await focus('parent');

	const newTab = await getActiveTab();

	const structure = await getStructure();
	const oldId = structure[oldTab.index].id;
	const newId = structure[newTab.index].id;

	if (oldId == newId) return;

	for (const i in favs) {
		if (favs[i].me == newId) {
			favs[i].fav = oldId;
			return;
		}
	}
	favs.push({ me: newId, fav: oldId });
	if (favs.length > 44) favs.shift(); // keep this thing performant
	return success;
}

async function focusDownstream() {
	const myTab = await getActiveTab();

	const structure = await getStructure();
	const myId = structure[myTab.index].id;
	const myParent = structure[myTab.index].parent;

	for (let i in favs) {
		if (favs[i].me == myId) {
			// Focus to favs[i].fav
			let success = await browser.runtime.sendMessage(TST_ID, {
				type: 'focus',
				tab: favs[i].fav
			});
			if (success) return;
		}
	}

	// Just focus to the first child
	// Check that we have a first child
	if (myTab.index >= structure.length-1) {
		return;
	}
	if (structure[myTab.index+1].parent <= myParent) {
		return;
	}
	// Ok, yes we do have a first child
	await browser.runtime.sendMessage(TST_ID, {
		type: 'focus',
		tab: 'next', // required, tabs.Tab.id or alias
	});
}

async function focusFirstChild() {
	const myTab = await getActiveTab();
	const myIndex = myTab.index;

	const structure = await getStructure();

	if (myIndex == structure.length - 1) {
		return;
	}
	if (structure[myIndex + 1].parent <= structure[myIndex].parent) {
		return;
	}
	await focus('next');
}

async function focusSiblingNumber(input) {
	const activeTab = await getActiveTab();
	const myIndex = activeTab.index;

	const structure = await getStructure();
	const myParent = structure[myIndex].parent;

	// Calibrate i to be the starting index of the tree we're in
	let i = 0;
	if (myParent >= 0) {
		for (let j = 0; j < myIndex; j++) {
			if (structure[j].parent == -1) {
				i = j;
			}
		}
	}

	let counter = 0;
	let targetIndex = myIndex;
	while (counter < input) {
		if (structure[i].parent == myParent) {
			counter++;
			targetIndex = i;
		}
		i++;
		if (i >= structure.length) {
			break;
		}
		if (i > myIndex && structure[i].parent < myParent) {
			// We have found an aunt, not a sister or niece. Use whatever targetIndex was last found.
			break;
		}
	}

	await focus(structure[targetIndex].id);
}

async function createChildTab() {
	const activeTab = await getActiveTab();
	await browser.tabs.create({
		openerTabId: activeTab.id // optional, tabs.Tab.id
	});
}

async function createSiblingTab() {
	// create a child tab, then promote it to a sibling
	await createChildTab();
	await browser.runtime.sendMessage(TST_ID, {
		type:           'outdent', // or 'promote'
		tab:            'current', // required, tabs.Tab.id or alias
		followChildren: false // optional, boolean (default=false)
	});
}

async function closeTree() {
	await closeChildren();
	const activeTab = await getActiveTab();
	await browser.tabs.remove(activeTab.id);
}

async function closeChildren() {
	const activeTab = await getActiveTab();
	const structure = await getStructure();
	const myParent = structure[activeTab.index].parent;
	const allTabs = await browser.tabs.query({ currentWindow: true });

	for (let i = activeTab.index + 1; i < structure.length; i++)
	{
		if (structure[i].parent <= myParent) {
			break;
		}
		browser.tabs.remove(allTabs[i].id);
	}
}

async function focusRootSetDownstream() {
	const activeTab = await getActiveTab();
	let myIndex = activeTab.index;

	const structure = await getStructure();
	if (structure[myIndex].parent == -1) {
		return;
	}

	// Calibrate i to be the starting index of the tree we're in
	let treeIndex = 0;
	for (let j = 0; j < myIndex; j++) {
		if (structure[j].parent == -1) {
			treeIndex = j;
		}
	}

	while (myIndex > treeIndex) {
		const parentIndex = treeIndex + structure[myIndex].parent;
		const oldId = structure[myIndex].id;
		const newId = structure[parentIndex].id;

		for (const i in favs) {
			if (favs[i].me == newId) {
				favs[i].fav = oldId;
				continue;
			}
		}

		favs.push({ me: newId, fav: oldId });
		if (favs.length > 44) {
			favs.shift(); // keep this thing performant
		}
		myIndex = parentIndex
	}
	await focus('root');
}
