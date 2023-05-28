'use strict';

const TST_ID = 'treestyletab@piro.sakura.ne.jp';

// Gets the subtree structure and information for a specific tab from TST
// The tab is selected by the selector, which is either a tab ID or a TST alias like 'active'.
async function getStructure(selector) {
  return await browser.runtime.sendMessage(TST_ID, {
    type: 'get-tree',
    tab: selector
  });
}

// Focuses a tab through TST
// The tab is selected by the selector, which is either a tab ID or a TST alias like 'active'.
async function focus(selector) {
  await browser.runtime.sendMessage(TST_ID, {
    type: 'focus',
    tab: selector,
    interval: -1
  });
}

// Listen for commands from shortcuts. Pass execution to a more specific handler depending on the
// shortcut that was inputted.
browser.commands.onCommand.addListener(executeCommand);

function executeCommand(command) {
  if (command === 'focus-parent-set-downstream') {
    focusParentSetDownstream();
  }
  else if (command === 'focus-root-set-downstream') {
    focusRootSetDownstream();
  }
  else if (command === 'focus-downstream') {
    focusDownstream();
  }
  else if (command === 'indent-tree') {
    indentTree();
  }
  else if (command === 'outdent-tree-safe') {
    outdentTreeSafe();
  }
  else if (command.startsWith('focus-sibling-number-')) {
    const [number,] = command.match('\\d+'); // Extract the number from command with a regex
    focusSiblingNumber(number);
  }
}

// A global variable mapping tabs to tabs. A parent tab is mapped to one of its children, which is
// its "downstream child" or "downstream". This child is more easily accessed by the user.
const stream = new Map();

// The rest of this file is functions that handle each keyboard shortcut.

// Get the parent of the active tab, and set its downstream to the active tab. Then focus the
// parent tab.
async function focusParentSetDownstream() {
  const tree = await getStructure('active');
  const activeId = tree.id;
  const parentId = tree.ancestorTabIds[0];

  focus(parentId);

  stream.set(parentId, activeId); // Set the parent tab's downstream
}

// Focus the root of the tree. For each ancestor, update its downstream to the descendant who
// leads to the previously active tab.
async function focusRootSetDownstream() {
  const tree = await getStructure('active');

  // Set downstream values of all ancestors
  let currentId = tree.id
  for (const parentId of tree.ancestorTabIds) {
    stream.set(parentId, currentId);
    currentId = parentId;
  }

  focus(currentId); // currentId now points to the root of the tree
}

// Focus the tab that was set as the active tab's downstream, so long as that downstream tab still
// exists and is a child of the active tab. Otherwise, focus the first child.
// Do nothing if there are no children.
async function focusDownstream() {
  const tree = await getStructure('active');
  // Ensure that the active tab has children
  if (!tree.children.length) {
    return;
  }

  const activeId = tree.id;
  const downstreamId = stream.get(activeId);

  for (const { id } of tree.children) {
    if (id == downstreamId) {
      await focus(downstreamId);
      return;
    }
  }

  focus(tree.children[0].id); // This will focus the first child
}

async function indentTree() {
  browser.runtime.sendMessage(TST_ID, {
    type: 'indent',
    tab: 'active',
    followChildren: true
  });
}

async function outdentTreeSafe() {
  let tree = await getStructure('active');
  if (!tree.ancestorTabIds.length) {
    return;
  }

  const activeId = tree.id;
  const parentId = tree.ancestorTabIds[0];

  // Perform the outdentation
  await browser.runtime.sendMessage(TST_ID, {
    type: 'outdent',
    tab: activeId,
    followChildren: true
  });

  // Collapse the tab that was a parent, is now a sibling
  browser.runtime.sendMessage(TST_ID, {
    type: 'collapse-tree',
    tab: parentId
  });
}

// Focuses a sibling of the active tab, or indeed the active tab itself, based on its number. The
// number of the first sibling is 1, and the number of the second sibling is 2, etc.
// If the number passed in is too high, the last sibling will be focused.
async function focusSiblingNumber(number) {
  const tree = await getStructure('parent');

  // Get an array of the active tab's siblings
  let siblings;
  if (tree) {
    siblings = tree.children;
  }
  else { // If the active tab is at the root level, it has no parent and tree is null.
    // Get the array of siblings another way. First, find the ID of the active WINDOW
    const [{ windowId },] = await browser.tabs.query({ active: true, currentWindow: true });

    // This is how to get an array of all root-level tabs in a window using the API
    siblings = await browser.runtime.sendMessage(TST_ID, {
      type: 'get-tree',
      window: windowId,
    });
  }

  if (number > siblings.length) {
    number = siblings.length;
  }

  const siblingId = siblings[number - 1].id;
  focus(siblingId);
}
